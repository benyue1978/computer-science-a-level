# Repeated Instruction Cycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual, accessible Bite 5 web lesson that teaches the repeating fetch–decode–execute cycle and distinguishes it from clock timing pulses.

**Architecture:** Follow the existing stand-alone lesson pattern with a focused bilingual content file and a React page component mounted at a direct URL from `App.tsx`. Keep the illustrative two-card walkthrough local to the lesson; its displayed computer events are not part of the PL24 engine. One state machine moves through six high-level events, while the clock illustration remains explanatory rather than a tick simulator.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library and Playwright.

---

## File map

- Create `src/instructionCycleContent.ts`: English and Simplified Chinese copy, sample directions, event labels, prediction choices, feedback, clock explanation and accessibility names.
- Create `src/InstructionCycle.tsx`: three-stage cycle diagram, learner prediction, six-event two-instruction walkthrough, visible loop, separate clock illustration and reset.
- Create `src/InstructionCycle.test.tsx`: focused order, repeat, prediction, clock, reset, language and semantic tests.
- Modify `src/App.tsx`: detect `/learn/instruction-cycle`, set localized title, render the new lesson, and add the fifth home-page invitation.
- Modify `src/styles.css`: responsive cycle loop, phase highlight, direction cards, clock pulse diagram and reduced-motion-compatible styling.
- Create `tests/instruction-cycle.spec.ts`: desktop/mobile browser flows for route, repeated cycle, clock distinction and language retention.

## Task 1: Define bilingual lesson content and the learner/computer contract

**Files:** Create `src/instructionCycleContent.ts`; create `src/InstructionCycle.test.tsx`.

- [ ] **Step 1: Write failing content/render tests.** Assert the page names Fetch, Decode and Execute in order, explains instruction and clock tick in learner-ready language, includes two plain-language example directions, and labels a distinct learner “Try it” prediction and a “Computer event” sequence.
- [ ] **Step 2: Run `npm test -- src/InstructionCycle.test.tsx` and confirm expected failure because the new page is not yet available.**
- [ ] **Step 3: Create `src/instructionCycleContent.ts`.** Export `instructionCycleContent` keyed by the existing `Language` type (`en | zh`). Use explicit copy for title/intro, phase names and definitions, example instructions (`Display “Hello”`, `Display “Goodbye”`), one next-instruction question and choices, six ordered event strings, feedback, next-event/reset labels, clock definition/distinction, and the three-stage accessibility names. Both languages must express the same concepts.
- [ ] **Step 4: Add the smallest component shell that renders the content and semantic phases; rerun the focused tests and confirm they pass.** Do not add event transitions before the next task's failing interaction tests.

## Task 2: Implement the repeatable six-event walkthrough

**Files:** Modify `src/InstructionCycle.tsx`; modify `src/InstructionCycle.test.tsx`.

- [ ] **Step 1: Add failing interaction tests.** Verify the next-event control is disabled before prediction; selecting a prediction alone leaves the computer-event text unchanged; successive activations reveal fetch, decode and execute for the first instruction, then fetch, decode and execute for the second; the second fetch follows the first execute; and the completed control is disabled.
- [ ] **Step 2: Run `npm test -- src/InstructionCycle.test.tsx` and confirm failures are for missing event state/order.**
- [ ] **Step 3: Implement local typed state.** Store `eventIndex` as an integer from 0 to 6 and `prediction` as `null | 0 | 1`. Derive the active instruction as `Math.floor((eventIndex - 1) / 3)` when `eventIndex > 0`, and the active phase as `(eventIndex - 1) % 3`; clamp the next event to 6. Reset sets `eventIndex` to 0 and clears prediction.
- [ ] **Step 4: Render the current computer event separately from prediction feedback.** Map event indexes 0–2 to the first instruction and 3–5 to the second. Mark exactly one phase as `aria-current="step"` during an event. Show the return arrow from Execute to Fetch throughout; use the active instruction card to communicate which pass is underway.
- [ ] **Step 5: Run `npm test -- src/InstructionCycle.test.tsx` and confirm the complete order/repeat/prediction tests pass.**

## Task 3: Show the instruction cycle and clock at distinct scales

**Files:** Modify `src/InstructionCycle.tsx`; modify `src/styles.css`; modify `src/InstructionCycle.test.tsx`.

- [ ] **Step 1: Add failing tests** that require a visible Fetch→Decode→Execute direction/loop, text explaining a clock tick is a timing pulse rather than a whole instruction cycle, and no one-tick-per-stage claim. Require a semantic named clock illustration and selectable text.
- [ ] **Step 2: Run the focused Vitest file and confirm these tests fail.**
- [ ] **Step 3: Implement the three-phase cycle diagram.** Use labelled nodes and a return-arrow label; do not put registers, bus microsteps or RTN in this diagram. Highlight the phase associated with the current computer event using border/text/icon cues in addition to colour.
- [ ] **Step 4: Add a separate static clock-pulse strip below the completed cycle explanation.** Text must say the clock provides regular timing signals and the instruction cycle is a larger process; do not align pulses one-for-one with phases or assign durations, frequencies or counts.
- [ ] **Step 5: Add responsive and reduced-motion styling.** Stack the three phases and loop indication on narrow screens without horizontal scrolling. Keep state changes instant under reduced motion.
- [ ] **Step 6: Rerun the focused Vitest file and confirm visual semantics, clock distinction and narrow-screen class hooks pass.**

## Task 4: Integrate the fifth lesson and preserve state across language changes

**Files:** Modify `src/App.tsx`; modify `src/App.test.tsx`; modify `src/InstructionCycle.test.tsx`.

- [ ] **Step 1: Add failing route/card/title/language tests.** Verify home links to `/learn/instruction-cycle`; direct route renders the fifth lesson and localized document title; changing language after event 1 preserves the event index, highlighted phase and prediction.
- [ ] **Step 2: Run `npm test -- src/App.test.tsx src/InstructionCycle.test.tsx` and confirm route, title, card or preservation assertions fail.**
- [ ] **Step 3: Add pathname detection, localized page title and `InstructionCycle` rendering using the existing no-router pattern.** Add a fifth home card with English and Chinese copy in `instructionCycleContent` and a direct anchor to `/learn/instruction-cycle`.
- [ ] **Step 4: Keep current local lesson state when only `language` changes; ensure reset returns to event 0 and clears prediction without changing language.**
- [ ] **Step 5: Run `npm test -- src/App.test.tsx src/InstructionCycle.test.tsx` and confirm route/card/language/reset tests pass.**

## Task 5: Browser walkthrough and complete validation

**Files:** Create `tests/instruction-cycle.spec.ts`; update implementation only when a test demonstrates a defect.

- [ ] **Step 1: Add Playwright coverage** for home-to-lesson navigation, direct reload, keyboard-selectable prediction, six computer events in order with two different instruction cards, clock distinction, reset, and Chinese language preservation at an intermediate phase.
- [ ] **Step 2: Run `npm run test:e2e -- tests/instruction-cycle.spec.ts` and fix verified browser issues.**
- [ ] **Step 3: Run `npm test`, `npm run build` and `npm run test:e2e`.** Expected: all unit/build/desktop/mobile checks pass.
- [ ] **Step 4: Compare implementation against `docs/superpowers/specs/2026-09-25-repeated-instruction-cycle-design.md`.** Verify all outcomes, exclusions, accessibility/bilingual requirements and the clock/cycle distinction.
- [ ] **Step 5: Commit the implementation** with message `feat: add repeated instruction cycle lesson` after checks pass.

## Self-check against the approved specification

- Syllabus framing, outcomes, and exclusions are established in Tasks 1 and 3.
- Repeated fetch–decode–execute order, two example directions, return to fetch, prediction separation, and reset are covered by Task 2 tests and implementation.
- The qualitatively explained clock and the no-one-to-one-mapping rule are covered in Task 3.
- Bilingual route/home navigation and state retention are covered by Task 4.
- Keyboard, semantic state, reduced-motion, mobile layout and full-browser verification are covered by Tasks 3–5.

Implementation is authorized inline in the current checkout. After review and verification, fast-forward `main` is already the working branch; push the resulting commits to `origin/main`.
