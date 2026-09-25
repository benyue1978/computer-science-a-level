# Fetch Registers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add a bilingual Bite 6 web lesson that explains PC, MAR, MDR and CIR and demonstrates how one readable instruction is fetched through processor registers and system buses.

**Architecture:** Follow the stand-alone lesson pattern used by Bites 4 and 5. Keep the four-register event model local to `FetchRegisters`; expose the same authored state in the diagram, narration and tests. Use a readable natural-language instruction as an explicitly labelled stand-in, not as PL24 machine code. Preserve state on language switches and do not add any shared processor-engine behavior.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library and Playwright.

---

## File map

- Create `src/fetchRegistersContent.ts`: English and Simplified Chinese names, register roles, diagram labels, example instruction, four computer events, learner prompts, feedback, reset and accessible names.
- Create `src/FetchRegisters.tsx`: processor/memory/bus diagram, four named registers, prediction task, event progression, bus highlighting and reset.
- Create `src/FetchRegisters.test.tsx`: roles and full names, initial state, four event transitions, unchanged values, predictions, language preservation, reset and scope boundaries.
- Modify `src/App.tsx`: detect `/learn/fetch-registers`, set the localized title, render the lesson and add the sixth home-page invitation.
- Modify `src/App.test.tsx`: verify sixth-card navigation target and direct-route heading/title.
- Modify `src/styles.css`: responsive CPU/register/bus topology, event emphasis, narrow-screen stacking and focus-visible styling.
- Create `tests/fetch-registers.spec.ts`: desktop/mobile browser walkthrough for direct route, keyboard prediction, all four events, language preservation, reset and overflow.
- Update `docs/superpowers/specs/2026-09-25-fetch-registers-design.md`: mark implementation complete after verification.

## Task 1: Define the bilingual content and test the register roles

**Files:** Create `src/FetchRegisters.test.tsx`; create `src/fetchRegistersContent.ts`.

- [x] **Step 1: Write failing tests for register meaning.** On `/learn/fetch-registers`, require the four full English names and abbreviations; verify the role definitions distinguish PC from MAR and MDR from CIR; verify all four registers are represented inside the processor and memory is outside. Assert that the readable `Display “Hello”` example is explicitly a stand-in and the lesson does not show PC increment, RTN, binary or assembly syntax.
- [x] **Step 2: Run `npm test -- src/FetchRegisters.test.tsx` and confirm the new-route/page tests fail because the lesson is not present.** The failure must be an expected missing-page assertion, not a TypeScript or test setup error.
- [x] **Step 3: Create `src/fetchRegistersContent.ts`.** Export English and Chinese copy keyed by the existing `Language` type. Store four matching role labels, `PC=20`, initial `MAR/MDR/CIR` not-yet-filled labels, memory location `20` with the readable stand-in `Display “Hello”`, bus names and directions, an explicitly learner-facing prediction, four ordered event messages, completion/reset labels, and accessible names. Keep actor/learner labels distinct and do not include PC increment, RTN, widths, assembly or binary.
- [x] **Step 4: Create the smallest `FetchRegisters` shell that renders the headings, role names and static component boundaries.** Keep event state out until Task 2. Run `npm test -- src/FetchRegisters.test.tsx` and confirm the content tests pass.

## Task 2: Implement the PC-to-CIR relay with a single event per computer step

**Files:** Modify `src/FetchRegisters.tsx`; modify `src/FetchRegisters.test.tsx`.

- [x] **Step 1: Add failing state-transition tests.** The next-step button is disabled until a prediction is selected. Selecting a prediction does not change PC, MAR, MDR, CIR, memory or bus state. Four separate computer events must produce: (1) MAR receives 20 from PC while PC stays 20; (2) address bus carries 20 and control bus carries READ; (3) memory contents travel over the data bus into MDR while memory and MAR stay unchanged; (4) MDR's instruction is copied to CIR while MDR remains unchanged. No event decodes or executes the instruction.
- [x] **Step 2: Run `npm test -- src/FetchRegisters.test.tsx` and confirm failures identify the missing sequence/state, not malformed tests.**
- [x] **Step 3: Implement local state with an `eventIndex` from 0 through 4 and `prediction: number | null`.** Derive register/bus values from `eventIndex` so each event has one deterministic, inspectable machine state: before event 1, PC is 20, the other named registers are not yet filled, buses are idle and memory[20] contains the stand-in; after event 1 MAR is 20; after event 2 address bus=20 and control bus=READ; after event 3 MDR contains the instruction and data bus shows the transfer; after event 4 CIR contains the instruction and all earlier values remain. Clamp progression at 4 and reset to event 0 and no prediction.
- [x] **Step 4: Render each event under the separate “Computer event” label and update `aria-current="step"` on the active register and bus.** The student prediction controls only unlock progression; their selected answer never mutates machine state. Show “All steps shown” on completion.
- [x] **Step 5: Run `npm test -- src/FetchRegisters.test.tsx` and confirm event order, bus values, unchanged state and completion pass.**

## Task 3: Integrate the sixth lesson and preserve state across language changes

**Files:** Modify `src/App.tsx`; modify `src/App.test.tsx`; modify `src/FetchRegisters.test.tsx`.

- [x] **Step 1: Add failing route, home-card, title and language tests.** Require `/learn/fetch-registers`, a sixth home invitation, localized heading/title, and preservation of event index, register contents and learner prediction after switching languages.
- [x] **Step 2: Run `npm test -- src/App.test.tsx src/FetchRegisters.test.tsx` and confirm the route/card/title assertions fail before app integration.**
- [x] **Step 3: Add pathname detection, localized document title and `FetchRegisters` rendering following the existing no-router lesson pattern.** Add a sixth home card linking to `/learn/fetch-registers`, with equally clear English and Chinese descriptions.
- [x] **Step 4: Ensure the component remains mounted while `language` changes.** Test that switching language changes all learner-facing names and the event narration while preserving the current register and bus state; reset clears progress and prediction but retains language.
- [x] **Step 5: Run `npm test -- src/App.test.tsx src/FetchRegisters.test.tsx` and confirm route, title, state-preservation and reset tests pass.**

## Task 4: Make the register relay legible on desktop and mobile

**Files:** Modify `src/FetchRegisters.tsx`; modify `src/styles.css`; modify `src/FetchRegisters.test.tsx`.

- [x] **Step 1: Add failing semantic and layout-hook assertions** for a named processor region containing all four registers, a separate named memory region, separately labelled address/data/control bus lanes, selected-component semantics, and the plain-language internal-transfer/bus-transfer distinction.
- [x] **Step 2: Run `npm test -- src/FetchRegisters.test.tsx` and confirm the expected semantic/layout hooks are absent.**
- [x] **Step 3: Render one clear computer topology.** Put PC, MAR, MDR and CIR inside the processor outline; put memory[20] outside; label the address bus, data bus and control bus; draw direction arrows for the current event and use explicit text labels so meaning never depends on colour. Show `READ` as a control signal and the readable example as a label for an instruction.
- [x] **Step 4: Add responsive styling.** At narrow widths stack the processor, bus lanes and memory vertically, keep internal-register transfers visually inside the processor, wrap long Chinese/English descriptions and avoid horizontal overflow. Preserve visible keyboard focus and instant state changes under reduced motion.
- [x] **Step 5: Run focused tests and confirm mobile-specific structure hooks and accessible names pass.**

## Task 5: Verify a real browser walkthrough and complete the full suite

**Files:** Create `tests/fetch-registers.spec.ts`; modify lesson code only when a failing browser test demonstrates a defect.

- [x] **Step 1: Add Playwright coverage** for sixth-card navigation, direct reload and localized title; keyboard prediction; the four computer events in order; PC remaining 20; the address/READ/data-bus sequence; final CIR contents; language preservation midway through the relay; reset; desktop/mobile no-overflow; and no page errors.
- [x] **Step 2: Run `npm run test:e2e -- tests/fetch-registers.spec.ts` and fix only reproduced browser issues.**
- [x] **Step 3: Run `npm test`, `npm run build` and `npm run test:e2e`.** All unit tests, TypeScript/build checks, and desktop/mobile browser tests must pass.
- [x] **Step 4: Compare the finished page with `docs/superpowers/specs/2026-09-25-fetch-registers-design.md`.** Verify register names/roles, PC/MAR and MDR/CIR contrasts, bus directions, actor separation, English/Chinese parity, and every exclusion.
- [x] **Step 5: Mark the approved design's status complete and commit the implementation** with message `feat: add fetch registers lesson` after a code review and clean verification.

## Plan self-review

- Every register role and all three bus roles in the approved spec map to the content model, relay events, semantic topology and tests.
- Scope exclusions are enforced in both copy and assertions: no PC increment, formal RTN, assembly syntax, binary, widths, decode/execute event or PL24 claim.
- Event state is derived from one event index, so visible registers, bus lanes, narration and `aria-current` remain synchronized.
- Language switching changes copy only; reset clears local interaction state without changing language.
- The implementation remains a lesson-local educational model and does not modify the simulator or shared execution engine.

Implementation proceeds inline in the current `main` checkout as requested. After review and verification, push the committed result to `origin/main`.
