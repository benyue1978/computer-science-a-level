# Complete Fetch–Decode–Execute Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the eighth bilingual interactive bite that guides a beginner through full fetch RTN, decode, execute and original exam-style transfer questions.

**Architecture:** Follow the established lesson-local React/content-module pattern. Keep a six-event teaching trace and its predicted states authored in bilingual lesson data; component state tracks only current step, prediction and check answers. Do not use or expose the PL24 engine.

**Tech Stack:** React 19, TypeScript, Vitest/Testing Library, Playwright, Vite.

---

## File responsibilities

- Create `src/fetchCycleContent.ts` for English/Chinese explanations, staged event definitions, snapshots, prompts, answer keys and exam model points.
- Create `src/FetchCycle.tsx` for the cycle map, step/prediction interaction, state/bus display, clock explanation and exam transfer.
- Create `src/FetchCycle.test.tsx` for unit-level route, state, actor separation, stage/bus correctness, answer reveal and bilingual contracts.
- Create `tests/fetch-cycle.spec.ts` for full desktop/mobile use, direct reload, keyboard, no overflow, language preservation and reset.
- Modify `src/App.tsx` to route `/learn/fetch-cycle`, localize the document title and add the eighth home invitation.
- Modify `src/styles.css` for a readable stage path, state/bus trace, exam tasks and responsive layout.
- Create `docs/superpowers/specs/2026-09-25-complete-fetch-decode-execute-design.md` and update this plan's completion record.

## Tasks

### 1. Tests first and route

- [x] Write route/home/title and empty-computer-event tests. Run the focused test and confirm expected failure before implementation.
- [x] Add the bilingual content skeleton, lesson component route and home invitation. Make the tests pass.

### 2. Fetch trace

- [x] Test that each prediction leaves processor state unchanged, and the next-step control is unavailable until any prediction is selected.
- [x] Test exact fetch order and state: PC 20 → MAR 20; PC 20 → PC 21; MAR 20 + READ + memory response over data bus → MDR receives the plain-language teaching instruction; MDR → CIR.
- [x] Implement six computer events with explicit snapshots. The bus-read event changes MDR only and identifies address/control/data roles. Check EN and ZH event strings are complete.

### 3. Decode, execute, clock

- [x] Test CU decode leaves register values unchanged, then ALU execution changes ACC from 7 to 12 while CIR and fetch address state stay intact.
- [x] Test stage order, next-instruction connection, and the clock-beat/instruction-cycle distinction; guard against claims that each F-D-E stage equals one clock cycle.
- [x] Implement the decode/execute examples, cycle map, clock explanation and localized state/event narration.

### 4. Exam transfer

- [x] Test unanswered marking points/model answer stay hidden; after an attempt, reveal the expected order, component/register/bus points and model answer.
- [x] Add original structured checks for F-D-E order, fetch RTN/bus interpretation, and a concise full-cycle answer. Do not copy a past-paper item or auto-grade unrestricted text.

### 5. Integration and verification

- [x] Add route, title and eighth home invitation following the existing lessons.
- [x] Add desktop/mobile styles; E2E checks direct route/reload, step progression, fresh questions, language preserving step and answers, reset, keyboard use and no horizontal overflow.
- [x] Run `npm test` (10 files, 56 tests), `npm run build`, `npm run test:e2e` (46 passed), then `git diff --check`.
- [x] Update spec and plan with completion and verification evidence, review final diff, commit and push `main` as requested.

## Self-review

The syllabus outcomes, the four Cambridge fetch lines, all three buses, the CU/ALU example, clock distinction, next-instruction connection, exam transfer, bilingual interaction and mobile/accessibility checks each map to a task above. The teaching example is explicitly not machine code; no interrupt or PL24 work is in scope.

## Completion record

Implemented in `src/FetchCycle.tsx` and `src/fetchCycleContent.ts`; integrated at `/learn/fetch-cycle`. Verification: 56 unit tests, production build, 46 desktop/mobile E2E tests, and whitespace check all pass. Committed and pushed to `main` after verification.
