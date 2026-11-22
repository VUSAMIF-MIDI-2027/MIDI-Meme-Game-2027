# Spec: Meme Creation Flow — V1

Implements items 2–5 of [issue #77](https://github.com/VUSAMIF-MIDI-2027/midi2027/issues/77) ("Implement participant pages and meme submission flow"): photo selection, caption, preview+submit, and submission confirmation — delivered as a 3-step modal launched from the dashboard.

## Objective

A signed-in participant clicks "Kurti memą" on `/dashboard` and gets a modal that walks them through:

1. **Photo** — pick one image from the admin-provided pool (`GET /api/photos` + `GET /api/photos/{id}/file`).
2. **Caption** — write a caption with a live meme preview and word/character counters.
3. **Preview** — see the finished meme, edit or submit.

On success the modal shows a confirmation screen ("Memas pateiktas!") explaining the meme awaits organizer review, with "Kurti dar vieną" and "Mano memai" actions.

The user is an event participant on desktop or mobile. Success = a participant can complete the whole flow without leaving `/dashboard`, their input survives step navigation and failed submits, and every step matches the site's existing visual language.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 + CSS modules — all already in the repo.
- `@clerk/react` for the auth token (`useAuth().getToken`).
- No new dependencies. The modal is a native `<dialog>` element following the existing pattern in `FirstVisitRules` and the admin settings dialogs (`showModal()`/`close()`, `onCancel`, `backdrop:` styling, `bg-[#0d1013]` panel).

## Commands

```
Dev:   npm run dev
Build: npm run build
Lint:  npm run lint
```

## Decisions (confirmed with user)

- **3 steps** — photo → caption → preview+submit; the intro step was removed after review (the dashboard/rules pages already explain the competition).
- **Mock submit locally** — `submitMeme` is written to the issue #53 contract (`POST /api/memes`, body `{ photoId, caption }`), but since that endpoint doesn't exist yet, a mock implementation resolves after a simulated delay so the full flow is demoable. Mock defaults to **on in development** (`NODE_ENV === "development" && NEXT_PUBLIC_MOCK_MEME_SUBMIT !== "false"`) and **off in production** (only when explicitly `"true"`), so a production build can never silently fake submissions. The mocked response mirrors the backend `Meme` model — `{ id: number; photoId: number; caption: string; statusId: number; createdAtUtc: string }` (`statusId: 1` = Pending) — so the real call can be swapped in without type changes once the endpoint lands.
- **Mock photo pool** — when the photo fetch fails, returns an empty pool, or the token is missing, and `NEXT_PUBLIC_MOCK_PHOTOS` is on (dev default, prod requires explicit `"true"`), the modal falls back to the four tutorial photos in `public/images/tutorial/` as a stand-in admin pool. Real photos always win when the API is reachable and non-empty.
- **No submission limit** — the modal does not enforce a max number of memes (backend spec says unlimited; dashboard copy is out of scope).
- **Phase gating** — "Kurti memą" is enabled only while `useEventPhase` reports `submissions`. In every other state (loading, missing, error, upcoming, voting, ended) the button stays disabled. `DashboardPage` lifts `useEventSchedule()` and passes the schedule to both the gating logic and `CompetitionStatus` (new optional prop), so the page performs a single schedule fetch.

## Project Structure

```
src/components/MemeCreation/
  MemeCreationModal.tsx      → native <dialog> shell, step state machine, session photo cache
  StepIndicator.tsx          → 3 numbered items (01–03, border-t-2 style from FirstVisitRules)
  steps/PhotoStep.tsx        → photo grid (fetch, loading/error/empty, select → advance)
  steps/CaptionStep.tsx      → live preview + textarea + counters + validation
  steps/PreviewStep.tsx      → final meme preview + edit/submit + submit error
  steps/ConfirmationStep.tsx → success screen + two CTAs
  memeCreationText.ts        → all lt/en strings for the flow
src/services/memeService.ts  → getPhotos(), submitMeme(), mock submit behind env flag
src/app/dashboard/page.tsx   → lift schedule fetch, enable "Kurti memą" by phase, mount modal
src/components/Shared/CompetitionStatus.tsx → accept optional `schedule` prop (avoids a second fetch)
src/components/Shared/MemeCard.tsx → widen `image` prop to `string | StaticImageData` for blob URLs
```

Existing code to reuse: `getPhotoBlob` (`src/services/userService.ts`), `useEventSchedule`/`useEventPhase`, `MemeCard` for the photo + white caption-strip preview, instruction copy style from `src/app/pageText.tsx`. (`MemePreview` is tutorial-specific — its `step` prop drives a rotated "submitted" layout — so it is not reused.)

## Code Style

Follow the repo's established patterns:

```tsx
"use client";

import { useLanguage } from "@/context/LanguageContext";
import { memeCreationText } from "./memeCreationText";

export default function StepIndicator({ step }: { step: 1 | 2 | 3 | 4 }) {
  const { lang } = useLanguage();
  const t = memeCreationText[lang];
  // ...
}
```

- All user-facing strings in `memeCreationText.ts` as `Record<Lang, T>` — Lithuanian first, English second.
- Tailwind utilities inline; `midi-blue`, `midi-gray`, `text-muted` theme tokens; `min-h-11`+ touch targets; `focus-visible` outlines like `MemeCard`.
- Service functions take `(token, signal?)`, `fetch(apiBaseUrl + "/api/...")`, `Authorization: Bearer`, `cache: "no-store"`, throw typed errors on `!response.ok`.
- Component props as a `type XProps` above the component; default exports for components.

## Functional Requirements

### Entry point

- The disabled "Kurti memą" button on `/dashboard` becomes the modal trigger. Enabled only when the event schedule loads successfully **and** `phase === "submissions"`. Disabled otherwise, keeping the existing `creationNotice` text; the notice is hidden while the button is enabled.
- If `useAuth().getToken()` resolves `null` (expired session), the photo-fetch and submit paths show an error prompting sign-in instead of sending an unauthorized request.

### Modal shell

- Native `<dialog>` + `showModal()` — matches `FirstVisitRules`/admin dialogs: focus trap, focus restore, Esc (`onCancel`), `::backdrop`, and scroll lock come from the platform; no hand-rolled overlay.
- Same panel chrome as existing dialogs: `fixed inset-0 m-auto max-h-[85svh] w-[calc(100%-2rem)] … rounded-xl border-white/15 bg-[#0d1013] … backdrop:bg-black/80`, small header label + `size-10` X button (`FirstVisitRules` style).
- Closes on: close button, `Esc` (`onCancel`), backdrop click (outside-rect check). If the user has moved past step 1, closing first asks for confirmation (`window.confirm`). Closing resets all flow state (reopen starts at step 1).
- Step indicator: 3 numbered items (01–03 with names) in the `border-t-2` style from `FirstVisitRules`; current/past steps accent `border-midi-blue text-[#70cfff]`, future steps `border-white/15 text-white/35`. Completed steps are clickable to navigate back; the current step is never ahead of the furthest step reached with valid input.
- Shared button/alert tokens from admin dialogs: primary `rounded-lg bg-midi-blue px-6 py-3 font-bold`, secondary `border border-white/15 … hover:bg-white/5`, alerts `text-rose-400`, inner surfaces `bg-[#0b0f12]`.

### Step 1 — Photo

- On first entry: `GET /api/photos` for enabled photo ids, then `getPhotoBlob` per id → `URL.createObjectURL`. The modal owns the resulting `photoId → objectUrl` map for the session — re-entering the step reuses the cache without refetching; all URLs are revoked only when the modal closes.
- States: skeleton while loading; inline error + retry button on failure; empty state when the pool is empty.
- Grid: 3 columns desktop, 2 columns mobile. Selecting a photo immediately advances to step 3 (per issue #77). Re-entering the step keeps the previous selection highlighted.

### Step 2 — Caption

- Shows the selected photo with the caption rendered live on the white strip (`MemeCard` in stacked layout), updating as the user types.
- Textarea input; counters display both words and characters. A "word" is a whitespace-separated token after trimming (`caption.trim().split(/\s+/).filter(Boolean)`); the character count uses the trimmed value.
- Validation: caption must be non-empty after trim, ≤ 250 characters, ≤ 30 words. "Peržiūrėti memą" is disabled until valid; invalid state is communicated in the counters/message area.
- Caption and selected photo survive navigation to any step and back.

### Step 3 — Preview & submit

- Shows the complete meme via `MemeCard` at ~75% of the step width, with the moon asset from `/` as a decorative background (low opacity, edge-faded, `aria-hidden`, `pointer-events-none`).
- "Redaguoti" returns to step 2 preserving state; "Pateikti memą" sits beside it below the preview.
- "Pateikti memą" calls `memeService.submitMeme`; the button is disabled (and marked busy) while the request is in flight.
- On failure: inline error message, user's photo + caption preserved, retry possible.
- On success: advance to the confirmation screen.

### Confirmation

- "Memas pateiktas!" heading + copy explaining the meme awaits organizer review.
- "Kurti dar vieną" clears state and restarts at step 2 (photo select — instructions needn't repeat).
- "Mano memai" closes the modal and scrolls to `#your-memes` on the dashboard.

## Testing Strategy

The repo has no test framework (`package.json` has no test script/deps) — none is added.

- `npm run lint` and `npm run build` must pass clean.
- Manual verification checklist per step (dev server + mock submit):
  - Open modal → all 3 steps reachable; indicator tracks progress; back-navigation preserves input.
  - Caption counters + validation edge cases (empty, 30/31 words, 250/251 chars).
  - Submit success → confirmation → both CTAs behave correctly.
  - Mock a failed submit → error shown, input retained.
  - Mobile viewport: modal usable end-to-end.
  - Button disabled outside `submissions` phase.

## Boundaries

- **Always:** lt + en strings for every user-facing text; reuse existing hooks/services/components; loading/empty/error states everywhere data loads.
- **Ask first:** adding a dependency; changing `apiBaseUrl` or auth handling; deviating from the issue #53 request contract; touching backend code.
- **Never:** commit secrets; expose moderation status to participants; include the prototype's manual UI-state switchers; bypass Clerk auth.

## Success Criteria

- "Kurti memą" opens the modal only during the `submissions` phase; otherwise it stays disabled with the notice. The page performs a single schedule fetch shared by the gating and `CompetitionStatus`.
- All 3 steps + confirmation work end-to-end on desktop and mobile against the mock submit.
- Caption validation enforced: non-empty, ≤30 words, ≤250 chars.
- Failed submit shows an error and preserves photo + caption.
- Confirmation "Kurti dar vieną" restarts cleanly; "Mano memai" lands on the user's memes section.
- `npm run lint` and `npm run build` pass.
- Zero new dependencies; all text bilingual.

## Out of Scope (Deferred)

- Issue #77 items 1 (rest of participant home page — mostly done), 6 (edit/delete my memes), 7 (profile page) — separate tasks.
- Real `POST /api/memes` integration — blocked on backend issue #53; the service is written to its contract and flipped on via env flag.
- `GET /api/me/memes` wiring into `YourMemes` (currently mock data) — separate item 6 work.
- Enforcing a submission limit — none, per decision.

## Open Questions

- None blocking. The submit response shape is mocked as the `Meme` model fields (see Decisions); when backend #53 ships, align the type with the real DTO and set `NEXT_PUBLIC_MOCK_MEME_SUBMIT=false`.
