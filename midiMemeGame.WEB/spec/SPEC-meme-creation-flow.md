# Spec: Meme Creation Flow — V1

Implements items 2–5 of [issue #77](https://github.com/VUSAMIF-MIDI-2027/midi2027/issues/77) ("Implement participant pages and meme submission flow"): photo selection, caption, preview+submit, and submission confirmation — delivered as a dedicated `/dashboard/create` page launched from the dashboard.

## Objective

A signed-in participant clicks "Kurti memą" on `/dashboard` and gets a page that walks them through:

1. **Photo** — pick one image from the admin-provided pool (`GET /api/photos` + `GET /api/photos/{id}/file`).
2. **Caption** — write a caption with a live meme preview and word/character counters.
3. **Preview** — see the finished meme, edit or submit.

On success the page shows a confirmation screen ("Memas pateiktas!") explaining the meme awaits organizer review, with "Kurti dar vieną" and "Mano memai" actions.

The user is an event participant on desktop or mobile. Success = a participant can complete the whole flow without leaving `/dashboard`, their input survives step navigation and failed submits, and every step matches the site's existing visual language.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript, Tailwind 4 + CSS modules — all already in the repo.
- `@clerk/react` for the auth token (`useAuth().getToken`).
- No new dependencies. The flow lives on a dedicated `/dashboard/create` page (migrated from the original `<dialog>` modal); the step components and state machine were reused unchanged.

## Commands

```
Dev:   npm run dev
Build: npm run build
Lint:  npm run lint
```

## Decisions (confirmed with user)

- **3 steps** — photo → caption → preview+submit; the intro step was removed after review (the dashboard/rules pages already explain the competition).
- **Real submit endpoint** — `submitMeme` calls the shipped backend endpoint (`POST /api/memes`, body `{ sourcePhotoId, caption }` → `201` `{ id, sourcePhotoId, caption, statusId, score, createdAtUtc, updatedAtUtc }`). The backend returns HTTP 500 for every business failure, so `MemeServiceError` carries the parsed `error.code` (2402/2403 submissions not open/closed, 2700 limit reached, 2701 photo disabled, 4004 access denied) and the preview step maps those to specific messages.
- **No mocks** — the flow always calls the real API. An empty pool renders the empty state; a failed fetch renders the error + retry state. (The earlier picsum/tutorial-photo fallback and the mock submit were removed once the backend endpoints landed.)
- **3-meme submission limit** — the backend counts each user's non-deleted, non-invalidated memes and rejects the fourth insert (2700). The UI mirrors it: the dashboard button disables with a limit notice, `/dashboard/create` blocks the flow when the count is exhausted, and "Kurti dar vieną" hides once the limit is reached in-session. Deleting a meme frees its slot.
- **Phase gating** — "Kurti memą" is enabled only while `useEventPhase` reports `submissions`. In every other state (loading, missing, error, upcoming, voting, ended) the button stays disabled. `DashboardPage` lifts `useEventSchedule()` and passes the schedule to both the gating logic and `CompetitionStatus` (new optional prop), so the page performs a single schedule fetch.

## Project Structure

```
src/components/MemeCreation/
  MemeCreationFlow.tsx        → step state machine + session photo cache (extracted from the old dialog shell)
src/app/dashboard/create/page.tsx → auth guard, back link, page chrome, submission-limit gate
  StepIndicator.tsx          → 3 numbered items (01–03, border-t-2 style from FirstVisitRules)
  steps/PhotoStep.tsx        → photo grid (fetch, loading/error/empty, select → advance)
  steps/CaptionStep.tsx      → live preview + textarea + counters + validation
  steps/PreviewStep.tsx      → final meme preview + edit/submit + submit error
  steps/ConfirmationStep.tsx → success screen + two CTAs
  memeCreationText.ts        → all lt/en strings for the flow
src/services/memeService.ts  → getPhotos(), submitMeme(), getMyMemes() against the real API
src/app/dashboard/page.tsx   → lift schedule fetch, enable "Kurti memą" by phase + remaining limit, navigate to /dashboard/create; edit/delete own memes
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

- The "Kurti memą" button on `/dashboard` navigates to `/dashboard/create`. Enabled only when the event schedule loads successfully, `phase === "submissions"`, and the participant has used fewer than 3 submissions. Disabled otherwise — the notice shows `creationNotice` for phase-gating and `limitReached` when the submission count is exhausted; the notice is hidden while the button is enabled.
- If `useAuth().getToken()` resolves `null` (expired session), the photo-fetch and submit paths show an error prompting sign-in instead of sending an unauthorized request.

### Page shell

- Dedicated `/dashboard/create` route behind the same Clerk guard as `/dashboard` (redirects to `/login` when signed out). Outside the submissions phase, or once the limit is reached, the page shows a blocked notice instead of the flow.
- Page chrome: back link to `/dashboard` + `max-w-2xl` container. The step components are shared with the old modal unchanged.
- Step indicator: 3 numbered items (01–03 with names) in the `border-t-2` style from `FirstVisitRules`; current/past steps accent `border-midi-blue text-[#70cfff]`, future steps `border-white/15 text-white/35`. Completed steps are clickable to navigate back; the current step is never ahead of the furthest step reached with valid input.
- Shared button/alert tokens from admin dialogs: primary `rounded-lg bg-midi-blue px-6 py-3 font-bold`, secondary `border border-white/15 … hover:bg-white/5`, alerts `text-rose-400`, inner surfaces `bg-[#0b0f12]`.

### Step 1 — Photo

- On first entry: `GET /api/photos` for enabled photo ids, then `getPhotoBlob` per id → `URL.createObjectURL` (a photo whose blob fails is skipped so the rest of the pool still renders; if every blob fails, the error + retry state shows). The flow owns the resulting `photoId → objectUrl` map for the session — re-entering the step reuses the cache without refetching; all URLs are revoked when the page unmounts.
- States: skeleton while loading; inline error + retry button on failure; empty state when the pool is empty.
- Grid: 3 columns desktop, 1 column mobile. Selecting a photo immediately advances to step 2 (per issue #77). Re-entering the step keeps the previous selection highlighted.

### Step 2 — Caption

- Shows the selected photo with the caption rendered live on the white strip (`MemeCard` in stacked layout), updating as the user types.
- Textarea input; counters display both words and characters. A "word" is a whitespace-separated token after trimming (`caption.trim().split(/\s+/).filter(Boolean)`); the character count uses the trimmed value.
- Validation: caption must be non-empty after trim, ≤ 250 characters, ≤ 30 words. "Peržiūrėti memą" is disabled until valid; invalid state is communicated in the counters/message area.
- Caption and selected photo survive navigation to any step and back.

### Step 3 — Preview & submit

- Shows the complete meme via `MemeCard` in a centered `max-w-xl` column.
- "Pateikti memą" is the primary action; below it "Redaguoti" returns to step 2 and "Rinktis kitą nuotrauką" returns to step 1, both preserving state.
- "Pateikti memą" calls `memeService.submitMeme`; the button is disabled (and marked busy) while the request is in flight.
- On failure: inline error message, user's photo + caption preserved, retry possible.
- On success: advance to the confirmation screen.

### Confirmation

- "Memas pateiktas!" heading + copy explaining the meme awaits organizer review.
- "Kurti dar vieną" clears state and restarts at step 1 (photo select — instructions needn't repeat); it is hidden once the submission limit is reached in-session.
- "Mano memai" navigates to `/dashboard#your-memes`.

## Testing Strategy

The repo has no test framework (`package.json` has no test script/deps) — none is added.

- `npm run lint` and `npm run build` must pass clean.
- Manual verification checklist per step (dev server + real backend):
  - Open `/dashboard/create` → all 3 steps reachable; indicator tracks progress; back-navigation preserves input.
  - Caption counters + validation edge cases (empty, 30/31 words, 250/251 chars).
  - Submit success → confirmation → both CTAs behave correctly.
  - Force a failed submit (e.g. submissions closed) → error shown, input retained.
  - Mobile viewport: the page is usable end-to-end.
  - Button disabled outside `submissions` phase.

## Boundaries

- **Always:** lt + en strings for every user-facing text; reuse existing hooks/services/components; loading/empty/error states everywhere data loads.
- **Ask first:** adding a dependency; changing `apiBaseUrl` or auth handling; deviating from the issue #53 request contract; touching backend code.
- **Never:** commit secrets; expose moderation status to participants; include the prototype's manual UI-state switchers; bypass Clerk auth.

## Success Criteria

- "Kurti memą" navigates to `/dashboard/create` only during the `submissions` phase while submissions remain; otherwise it stays disabled with the matching notice. The page performs a single schedule fetch shared by the gating and `CompetitionStatus`.
- All 3 steps + confirmation work end-to-end on desktop and mobile against the real API.
- Caption validation enforced: non-empty, ≤30 words, ≤250 chars.
- Failed submit shows an error and preserves photo + caption.
- Confirmation "Kurti dar vieną" restarts cleanly; "Mano memai" lands on the user's memes section.
- `npm run lint` and `npm run build` pass.
- Zero new dependencies; all text bilingual.

## Out of Scope (Deferred)

- Issue #77 items 1 (rest of participant home page — mostly done) and 7 (profile page) — separate tasks.
- `GET /api/memes/mine` feeds the dashboard `YourMemes` section (real memes + photo blobs fetched on mount — returning from `/dashboard/create` remounts the page and refetches; the `yourMemesMock` fixture was deleted). Item 6 landed: captions edit via `PATCH /api/memes/{id}` (resets the meme to pending review) and delete via `DELETE` (frees the submission slot), both gated to the submissions phase; memes whose source photo was disabled show an "invalidated" badge and don't count toward the limit.

## Open Questions

- None.
