# Tasks: Meme Creation Flow

- [x] Task 1: Create `src/services/memeService.ts` — `getPhotos`, `submitMeme` (issue #53 contract), mock submit behind `NEXT_PUBLIC_MOCK_MEME_SUBMIT`
  - Acceptance: typed `Photo`/`SubmittedMeme`; `getPhotos` validates the `[{ id }]` response; mock resolves `{ id, photoId, caption, statusId: 1, createdAtUtc }` after delay — on by default in dev, off in prod unless `NEXT_PUBLIC_MOCK_MEME_SUBMIT === "true"`; real fetch path exists for flag off
  - Verify: `npm run lint` + `npm run build`
  - Files: `src/services/memeService.ts`

- [x] Task 2: Create `memeCreationText.ts` with all lt/en strings for indicator, 4 steps, confirmation, errors
  - Acceptance: every user-facing string in the flow lives in `Record<Lang, T>`; no inline copy needed by step components
  - Verify: `npm run build` (type-check)
  - Files: `src/components/MemeCreation/memeCreationText.ts`

- [x] Task 3: Modal shell — `MemeCreationModal.tsx` (open/close, Esc, backdrop, focus trap, scroll lock, step state machine) + `StepIndicator.tsx` + `steps/IntroStep.tsx`
  - Acceptance: modal opens/closes correctly (confirming when past step 1), focus trapped and restored, indicator shows 4 rectangles with current highlighted, intro advances to step 2; modal owns the photo `id → objectUrl` map and revokes it on close
  - Verify: `npm run lint` + `npm run build`
  - Files: `src/components/MemeCreation/MemeCreationModal.tsx`, `StepIndicator.tsx`, `steps/IntroStep.tsx`

- [x] Task 4: `steps/PhotoStep.tsx` — photo pool fetch, object URLs, loading/error/empty states, responsive grid, select → advance
  - Acceptance: grid renders photos from the modal's cache (no refetch on re-entry); selection advances to step 3 and persists on back-navigation; all three non-happy states covered; no object URLs revoked on step unmount
  - Verify: `npm run lint` + `npm run build`
  - Files: `src/components/MemeCreation/steps/PhotoStep.tsx`

- [x] Task 5: `steps/CaptionStep.tsx` — live preview via `MemeCard`, textarea, word+char counters, validation, "Peržiūrėti memą"
  - Acceptance: `MemeCard` `image` widened to `string | StaticImageData`; preview updates as user types; counters show words (whitespace tokens) + trimmed chars; next disabled until non-empty/≤30 words/≤250 chars; state preserved navigating away and back
  - Verify: `npm run lint` + `npm run build`
  - Files: `src/components/MemeCreation/steps/CaptionStep.tsx`, `src/components/Shared/MemeCard.tsx`

- [x] Task 6: `steps/PreviewStep.tsx` + `steps/ConfirmationStep.tsx` — submit with busy/error handling, success screen with both CTAs
  - Acceptance: "Redaguoti" → step 3 with state; submit disabled while busy; error shows inline and keeps input; success → confirmation; "Kurti dar vieną" resets to step 2; "Mano memai" closes + scrolls
  - Verify: `npm run lint` + `npm run build`
  - Files: `src/components/MemeCreation/steps/PreviewStep.tsx`, `steps/ConfirmationStep.tsx`

- [x] Task 7: Dashboard wiring — lift `useEventSchedule()` into `DashboardPage`, enable "Kurti memą" only in `submissions` phase, mount modal, "Mano memai" scroll target
  - Acceptance: single schedule fetch shared by gating + `CompetitionStatus` (new optional `schedule` prop); button disabled outside submissions with notice preserved (hidden when enabled); modal opens during submissions; full flow works end-to-end on desktop + mobile
  - Verify: `npm run lint` + `npm run build` + manual checklist per spec
  - Files: `src/app/dashboard/page.tsx`, `src/components/Shared/CompetitionStatus.tsx` (+ `pageText.tsx` if notice copy changes)
