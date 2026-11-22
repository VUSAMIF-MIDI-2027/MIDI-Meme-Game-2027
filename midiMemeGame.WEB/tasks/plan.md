# Plan: Meme Creation Flow (spec/SPEC-meme-creation-flow.md)

## Approach

Bottom-up slices: data layer → copy → modal shell → step screens → dashboard wiring. Each slice compiles and lints on its own; the modal is only reachable once wired into the dashboard at the end.

## Implementation order

1. **`memeService.ts`** — `Photo`/`SubmittedMeme` types, `getPhotos(token, signal)` (`GET /api/photos`; validates each item has an integer `id`), `submitMeme(photoId, caption, token)` written to the issue #53 contract (`POST /api/memes`). Mock branch — on by default in dev, off in prod unless explicitly enabled (`NODE_ENV === "development" ? NEXT_PUBLIC_MOCK_MEME_SUBMIT !== "false" : NEXT_PUBLIC_MOCK_MEME_SUBMIT === "true"`): simulated delay, resolves a `Meme`-shaped object `{ id, photoId, caption, statusId: 1, createdAtUtc }`. No UI dependency — foundation for steps 2 and 4.

2. **`memeCreationText.ts`** — every lt/en string for all 5 screens + indicator + errors. Unblocks all step components; keeps copy reviewable in one file.

3. **Modal shell + StepIndicator + IntroStep** — `MemeCreationModal.tsx` owns open state, backdrop, Esc/close (with confirmation once past step 1), focus management, scroll lock, the step state machine (`step`, `photoId`, `photoUrl`, `caption`), and the photo `id → objectUrl` cache (fetched lazily on first entering step 2, revoked on modal close). StepIndicator renders the 4 rectangles (current/completed/inert, click completed to go back). IntroStep is static copy + next button — proves the shell works end-to-end.

4. **PhotoStep** — renders from the modal's cached photo map (no fetch or revocation of its own), loading skeleton, error + retry, empty state, responsive grid; select → advance to step 3. Depends on 1–3.

5. **CaptionStep** — selected photo + live caption via `MemeCard` (stacked; first widen its `image` prop to `string | StaticImageData`), textarea, word + char counters on the trimmed value, validation (non-empty, ≤30 words, ≤250 chars), "Peržiūrėti memą" → step 4. Depends on 3 (state machine); independent of 4's fetching.

6. **PreviewStep + ConfirmationStep** — final meme preview via `MemeCard`, "Redaguoti" → step 3, "Pateikti memą" → `submitMeme` with disabled/busy state, inline error preserving input (null `getToken()` treated as a sign-in error); on success, confirmation screen with "Kurti dar vieną" (reset → step 2) and "Mano memai" (close + scroll to `#your-memes`). Depends on 1–3, 5.

7. **Dashboard wiring** — lift `useEventSchedule()` into `DashboardPage`, give `CompetitionStatus` an optional `schedule` prop so the page does one fetch; enable the button only when schedule ready and `phase === "submissions"` (hide the notice while enabled); on click open modal; pass `onViewMemes` that closes + scrolls. Depends on all above.

## Parallel vs sequential

- 1 and 2 are independent of each other; both must land before steps.
- 4 and 5 could be built in parallel once 3 exists; 6 needs 5's state contract.

## Risks / mitigations

- **Object URL leaks / premature revocation** — one `photoId → objectUrl` map owned by the modal; revoked only on modal close, never on step unmount.
- **Null `getToken()`** — photo fetch and submit paths treat a null token as a sign-in error state, not a network call.
- **Focus trap without a library** — keep it simple: focus the panel on open, trap Tab within it, restore focus to trigger on close.
- **Real backend shape drift** — all submit logic isolated in `memeService`; type is one place to update.
- **Schedule fetch failing in dev** — button stays disabled (spec'd); verify gating by toggling admin schedule or temporarily testing with a ready schedule.

## Verification checkpoints

- After each slice: `npm run lint` + `npm run build`.
- After task 7: full manual pass on desktop + mobile viewport per spec checklist (all steps, counters/validation edges, mock success + failure, phase gating).
