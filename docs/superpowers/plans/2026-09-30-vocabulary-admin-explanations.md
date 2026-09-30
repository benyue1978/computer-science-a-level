# Vocabulary Administrator Explanations Implementation Plan

> **For agentic workers:** Use inline execution and complete each task in order. Keep changes on `main` as requested.

**Goal:** Let every user save private explanations and let vocabulary admins publish a word's explanation for everyone from either existing editor.

**Architecture:** Reuse the current private-note snapshot and `shared_explanations` table. Read admin status through the existing `is_vocabulary_admin()` RPC; publish through the existing admin-only RLS policy. After publishing, update the local shared-note map and remove the publisher's private override by making its effective note equal the new shared body.

**Tech Stack:** React, TypeScript, Supabase JS, Vitest, Playwright.

---

### Task 1: Test shared publish state behavior

**Files:**
- Modify: `src/vocabulary/cloudState.test.ts`
- Modify: `src/vocabulary/cloudState.ts`

- [ ] Add a failing test showing that after publishing a text as shared, the current state displays it and `createCloudSnapshot(state, sharedNotes)` no longer serializes a duplicate personal override.
- [ ] Run `npm test -- --run src/vocabulary/cloudState.test.ts`; confirm this assertion fails before implementation.
- [ ] Add the smallest pure helper needed to update one word's effective explanation after publish; rerun the test and confirm it passes.

### Task 2: Add protected admin and publish API helpers

**Files:**
- Modify: `src/vocabulary/cloud.ts`
- Create: `src/vocabulary/cloud.test.ts`

- [ ] Add tests for a successful admin-status result and for a rejected publish result, using a mocked Supabase client at the module boundary.
- [ ] Run `npm test -- --run src/vocabulary/cloud.test.ts`; verify the missing helpers fail the tests.
- [ ] Implement `isVocabularyAdmin()` using `supabase.rpc("is_vocabulary_admin")` and `publishSharedExplanation(word, body, userId)` using an upsert to `shared_explanations`. Trim and reject empty bodies before sending. Propagate Supabase errors to the UI.
- [ ] Rerun the focused tests; both helpers must pass and rejected writes must remain errors.

### Task 3: Expose publishing in both existing explanation editors

**Files:**
- Modify: `src/vocabulary/Vocabulary.tsx`
- Modify: `src/vocabulary/vocabulary.css`
- Modify: `src/vocabulary/Vocabulary.test.tsx`

- [ ] Add tests that an ordinary user has no publish action, an admin sees a publish action in the All words editor and Today editor, and a successful publish updates the effective explanation while a failure leaves the draft intact and shows an error.
- [ ] Run the focused UI tests and verify they fail before the UI changes.
- [ ] Load admin status for the signed-in user, fail closed to non-admin controls if the lookup errors, and share one `publishExplanation(word, body)` handler between the two editor locations. Show a per-word pending state, disable publishing blank text, report success/failure, and after success update the shared-note map before updating the visible word state.
- [ ] Rerun focused UI tests. Confirm private-note editing remains available to guests and signed-in non-admins.

### Task 4: Verify and publish

**Files:**
- Review: `docs/superpowers/specs/2026-09-30-vocabulary-design.md`

- [ ] Run `npm test -- --run src/vocabulary`, `npm run build`, `npm run test:e2e -- tests/vocabulary.spec.ts`, and `git diff --check`.
- [ ] In the signed-in production page, confirm the admin publish action appears; publish a harmless test explanation only if a suitable word is available and verify it is readable after reload. Do not edit or delete existing shared explanations during verification.
- [ ] Commit and push the finished feature to `main`; inspect the Vercel production deployment until it is Ready.
