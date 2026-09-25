# Memory Activity Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development to implement this plan. Steps use checkbox syntax for tracking.

**Goal:** Build the first bilingual, parent-guided memory activity and its home page, ready for a later Vercel deployment.

**Architecture:** One React/Vite browser app with routes `/` and `/learn/memory`. Authored bilingual content is separate from the activity component and pure memory transitions. No processor engine, backend, persistence, video production or deployment is included.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library and Playwright.

## Chunk 1: First teaching slice

### Task 1: App and activity

**Files:** Create `package.json`, `package-lock.json`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vercel.json`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/memory.ts`, `src/content.ts`, `src/memory.test.ts`, `src/App.test.tsx`, `src/test-setup.ts`.

- [x] Scaffold the build/test configuration; install dependencies with a lockfile.
- [x] Write meaningful failing tests for immutable reads, targeted writes and exact reset; run `npm test` and record expected failures before implementing transitions.
- [x] Implement authored examples (10/11/12 holding 7/42/9; 20/21/22 holding 8/3/8) and pure transitions. Keep state private to the activity; reset restores stage, selection, reveal and values while retaining language.
- [x] Write failing interface tests for home navigation, prediction before reveal, read/write unchanged values, language preserving progress, reset and fresh-example checks. Do not require correct answers to continue; use supportive feedback and revisitable stages.
- [x] Implement a responsive notebook-like interface with a minimal index and six guided stages following the approved foundations spec exactly. Stage 1 progressively reveals one cell, address and contents. Stage 2 asks for address 11 before confirming. Stage 3 accepts a prediction (or explicit spoken prediction) before revealing a readout. Stage 4 checks where 7 is stored. Stage 5 predicts then replaces only the value at 11 with 6. Stage 6 asks all three fresh-example questions, revealing explanatory feedback only after submission.
- [x] Supply equal English/Mandarin content, selectable text, keyboard controls, visible focus, reduced motion, live feedback and a parent guide (prepare, ask, two hints, check, review). Preserve stage and selected cell on language switch. No scores, mastery, timers or personal data.
- [x] Show current state, action, changed/unchanged and causal explanation for read/write; identify the readout as part of the activity, not a register. Keep address labels visually outside contents.
- [x] Configure Vercel static build (`npm run build`, output `dist`) and SPA fallback; unknown routes should have an understandable home link. No deployment.
- [x] Run `npm test` and `npm run build`; fix failures.

### Task 2: Browser verification and handoff

**Files:** Create `playwright.config.ts`, `tests/memory.spec.ts`; modify `README.md` and delivery roadmap.

- [x] Exercise the production preview through home, all six stages, prediction feedback, language switch, write/reset and the changed example. Check direct lesson navigation/reload, keyboard operation, mobile overflow and reduced motion. Capture desktop/mobile screenshots for visual review.
- [x] Update README with development, test, build and preview commands and clearly distinguish automated validation from the pending parent/child trial.
- [x] Replace the roadmap's obsolete root-only route assumption with home and `/learn/memory`.
- [x] Obtain spec and code-quality reviews, resolve actionable findings and rerun affected checks.
- [x] Leave the local preview available for the owner to try. Record actual checks; Vercel publishing and the learning trial remain pending.

## Verification record

Implemented on `feat/memory-foundations`. The tiny app keeps its page composition in `src/App.tsx`, with authored content and pure memory operations separate; a separate component hierarchy is deferred until another activity needs it.

- `npm test`: 11 passing unit/interface tests, including prediction gating, revisiting after a write, bilingual state preservation and accessible step labels.
- `npm run build`: TypeScript check and Vite production build passed.
- `npm run test:e2e`: 6 passing Chromium checks across desktop and emulated phone, covering navigation/reload, keyboard selection, reduced motion, viewport fit and all six stages.
- Desktop and mobile screenshots inspected; home preview has no browser console errors.
- Spec and quality review findings resolved: fresh-example explanations now wait for all predictions; mobile step buttons retain descriptive accessible names.
- Preview available locally for the owner. Actual parent/child learning trial and Vercel publishing remain pending; see the accompanying trial guide.
