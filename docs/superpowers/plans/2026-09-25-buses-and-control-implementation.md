# Buses and Control Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual, accessible Bite 4 lesson that teaches address/data/control bus roles through guided read and write transfer sequences.

**Architecture:** Follow the existing lesson pattern: keep bilingual copy in a focused content module, present the example and its stateful event sequence in a dedicated React lesson component, and route/link it through the current single-page app. The example is a small teaching model, not an execution of PL24; each displayed transfer advances explicitly and learner predictions remain separate from computer events.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Playwright.

---

## File map

- Create `src/busesControlContent.ts`: English and Simplified Chinese copy, event labels, prompts, values and accessibility labels.
- Create `src/BusesControl.tsx`: mode selection, prediction prompt, step-by-step computer-event display, buses diagram, result and reset.
- Create `src/BusesControl.test.tsx`: focused lesson interaction/accessibility/content tests.
- Modify `src/App.tsx`: route `/learn/buses-and-control`, page title, and fourth home-page lesson card.
- Modify `src/styles.css`: responsive, labelled three-lane bus diagram and transfer/event styling, matching existing visual language.
- Create `tests/buses-and-control.spec.ts`: browser-level route/read/write/language walkthrough.

## Task 1: Author bilingual content and prove lesson contract

**Files:** Create `src/busesControlContent.ts`; create `src/BusesControl.test.tsx`.

- [ ] **Step 1: Write the failing render and copy tests.** Test that the component exposes the CPU, memory, I/O ports and all three bus names; English and Chinese content both include distinct address/data/control roles, READ/WRITE examples and learner-task language. Also assert no parent-directed wording in learner UI.
- [ ] **Step 2: Run `npm test -- src/BusesControl.test.tsx` and confirm the expected missing-module/component failure.** The failure must be due to the new feature not existing.
- [ ] **Step 3: Create `src/busesControlContent.ts`.** Export `busesControlContent` keyed by existing `Language` (`en | zh`) and use explicit typed records for title, intro, modes, topology labels, learner prompts, answers, ordered event descriptions, result narration, reset and accessibility labels. Keep read sample fixed at `11 → 42`, prior receiver `7`; write sample fixed at `12: 9`, source value `6`.
- [ ] **Step 4: Add the smallest component shell needed for content assertions, rerun the focused test and confirm it passes.** Avoid adding the event behaviour before its interaction test exists.

## Task 2: Implement deterministic read and write event sequences

**Files:** Modify `src/BusesControl.tsx`; modify `src/BusesControl.test.tsx`.

- [ ] **Step 1: Add failing interaction tests.** For READ and WRITE separately, assert the event reveal control begins at stage zero; successive activations reveal only the next computer event; completed READ leaves memory `11 → 42` and updates receiver `7 → 42`; completed WRITE changes `Memory[12]` from `9` to `6` and preserves address 12. Assert learner prediction control does not advance the event sequence.
- [ ] **Step 2: Run the focused Vitest file and confirm these assertions fail because the sequences are not implemented.**
- [ ] **Step 3: Implement the minimal typed lesson state.** State is selected mode (`read | write`), current computer-event index, and prediction selection. Mode change/reset sets the event index to zero and clears prediction. Derive all before/after values from the authored scenario; do not create a generic processor engine or mutate a shared memory model.
- [ ] **Step 4: Make the next-event control reveal one computer event and update the final outcome only after the final event.** Label this as a computer event; prediction choices are labelled under “Try it” and do not advance the event.
- [ ] **Step 5: Run `npm test -- src/BusesControl.test.tsx` and confirm all focused behavior tests pass.**

## Task 3: Draw the bus topology with accessible direction and grouping

**Files:** Modify `src/BusesControl.tsx`; modify `src/styles.css`; modify `src/BusesControl.test.tsx`.

- [ ] **Step 1: Add failing semantic tests.** Require textual labels for CPU, memory, I/O ports, address bus, data bus, control bus, and system bus; require event direction descriptions as text and `role="status"` announcements for revealed transfers. Verify that meaning does not depend on colour by asserting direction words or labelled source/destination nodes.
- [ ] **Step 2: Run the focused file and confirm topology/accessibility tests fail.**
- [ ] **Step 3: Implement the diagram as semantic HTML/CSS.** Use three separate labelled lane elements grouped by a visible system-bus bracket/container. Show CPU, memory, I/O ports as labelled nodes. Use arrow glyphs plus direction text; expose a bidirectional explanation for data and aggregate control paths without claiming every control signal shares a direction. Keep the diagram text selectable.
- [ ] **Step 4: Add a restrained responsive layout.** At narrow widths, stack nodes/lanes while preserving the same direction labels. Under `prefers-reduced-motion`, remove movement/transition while leaving the revealed state explicit.
- [ ] **Step 5: Rerun `npm test -- src/BusesControl.test.tsx` and confirm accessibility/topology assertions pass.**

## Task 4: Integrate the lesson into navigation and preserve bilingual parity

**Files:** Modify `src/App.tsx`; modify `src/styles.css`; modify `src/BusesControl.test.tsx`.

- [ ] **Step 1: Add failing route tests.** Assert `/learn/buses-and-control` renders the lesson and document title; home includes the fourth exploration card; language switch updates lesson labels/prompts without losing mode or current event index.
- [ ] **Step 2: Run the focused tests and confirm missing-route/card/parity failures.**
- [ ] **Step 3: Add route detection and render the `BusesControl` component, set the localized page title, and add a fourth home card linking to `/learn/buses-and-control`.** Use existing navigation and language patterns rather than adding a routing library.
- [ ] **Step 4: Ensure the component root has the site’s main content landmark and the language toggle remains usable.** Preserve current mode and event index on language change.
- [ ] **Step 5: Run `npm test -- src/App.test.tsx src/BusesControl.test.tsx` and confirm route/card/language coverage passes.**

## Task 5: Browser walkthrough, full checks and integration

**Files:** Create `tests/buses-and-control.spec.ts`; update code only to fix verified defects.

- [ ] **Step 1: Add browser tests for home navigation, READ event sequence and outcome, WRITE outcome, and switching to Chinese mid-sequence.**
- [ ] **Step 2: Run `npm run test:e2e -- tests/buses-and-control.spec.ts`; fix any real interaction or browser accessibility issue.**
- [ ] **Step 3: Run the complete checks:** `npm test`, `npm run build`, and `npm run test:e2e`. Expected: all pass without console errors.
- [ ] **Step 4: Inspect the final diff against `docs/superpowers/specs/2026-09-25-buses-and-control-design.md`.** Confirm the diagram, content, read/write invariants, distinction between learner/computer actions, scope exclusions, and bilingual copy all match.
- [ ] **Step 5: Commit the completed implementation** with message `feat: add buses and control lesson` after checks pass.

## Spec coverage self-check

- Syllabus scope and boundaries: Tasks 1 and 3 content plus Task 4 localized presentation.
- Bus roles, system bus grouping, and ports: Task 3 semantic topology and Task 1 bilingual content.
- Guided READ/WRITE plus unchanged state: Task 2 behavior tests and sequence implementation.
- Learner prediction versus computer event: Tasks 1–2 copy contract and interaction tests.
- Accessibility, reduced motion, mobile layout, language retention: Tasks 3–4.
- Browser-level validation and complete checks: Task 5.

Implementation follows the already approved project workflow; after verification, integrate the feature branch into `main` and push the updated main branch.
