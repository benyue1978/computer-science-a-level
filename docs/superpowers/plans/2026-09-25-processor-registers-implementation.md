# Processor and Registers Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Keep the approved Bite 2 scope; do not introduce execution or data transfers.

**Goal:** Add the bilingual second foundations lesson and expose both lessons from the home page.

**Architecture:** Keep the proven memory activity in the existing app while adding `/learn/processor-registers` as a separate, focused component with its own local state and authored content. Reuse the existing site shell and controls without introducing a general lesson engine or new dependencies.

**Tech Stack:** Existing React, TypeScript, Vite, Vitest/Testing Library and Playwright.

## Chunk 1: Second lesson

### Task 1: Shared shell and lesson

Files: modify `src/App.tsx`, `src/styles.css`; create `src/ProcessorRegisters.tsx`, `src/processorContent.ts`, `src/ProcessorRegisters.test.tsx`; update existing interface tests only where labels/navigation change.

- [x] Record baseline with `npm test` and `npm run build`.
- [x] Add failing behavior tests for second route, optional recall, progressive register disclosure, answering without changing preset values, related-response feedback gating, language preservation and reset.
- [x] Preserve the shared shell and existing memory behavior without a premature component-framework refactor.
- [x] Add a second available home entry and lesson-specific document title. Both pages use the same language control; keep lesson language/answers stable when toggled.
- [x] Implement the four sections in the approved spec: separate processor/main-memory diagram, explicit look-inside reveal, generic register contents, fresh reversed diagram with new preset values. Label computer/processor boundaries and main memory; introduce only supported vocabulary. No buses, transfers, machine steps or arithmetic.
- [x] Include optional address/content recall with a memory-lesson link on error; never gate section navigation. Identify processor then main memory through distinct learner tasks. In later sections identify register contents and ownership.
- [x] Group related questions and reveal feedback only after all related predictions. Keep explanation distinct from Try it controls. Reset clears disclosure/answers and retains language. Section changes clear that section's attempt; language does not.
- [x] Preserve native keyboard control, accessible localized names, focus after navigation, mobile stacking, reduced motion, no parent UI or fixed state/action panels.
- [x] Run `npm test` and `npm run build` and resolve failures.

### Task 2: Verification and documentation

Files: create `tests/processor-registers.spec.ts`; modify `README.md` and the approved design's status.

- [x] Run production-browser checks for home navigation, direct link/reload, four sections, keyboard selection, fresh diagram, reset/language and mobile overflow. Inspect English/Mandarin desktop/mobile screenshots.
- [x] Re-run existing memory browser tests to verify its behavior remains intact.
- [x] Obtain spec and quality reviews, resolve findings, rerun affected checks.
- [x] Update run/status documentation with actual results and keep the real learning trial distinct from automated verification.
- [x] Commit on the feature branch and leave a local preview available. Do not deploy or merge to main as part of this implementation request.

## Verification record

- `npm test`: 16 passing unit/interface tests across both lessons.
- `npm run build`: TypeScript and Vite production build passed.
- `npm run test:e2e`: 12 passing desktop/mobile Chromium checks across both lessons.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.
- English/Mandarin desktop and mobile screenshots inspected; direct route has no console errors.
- Spec review gaps resolved: restored the complete 10/11/12 memory example and clarified that the component diagram is intentionally partial.
- Quality review gap resolved: the register-disclosure control stays focused and exposes `aria-expanded`/`aria-controls` after keyboard activation.
- The real learner trial remains pending; this automated evidence does not claim learning effectiveness.
