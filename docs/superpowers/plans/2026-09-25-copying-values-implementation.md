# Copying Values Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual third foundations lesson that teaches copy semantics through register-to-register and main-memory-to-register examples.

**Architecture:** `App` owns language and routing. `CopyingValues` owns section, predictions and reveal state. `copyModel.ts` performs immutable copies independently of the UI. English and Mandarin text lives in `copyingContent.ts`; this milestone adds no processor engine, bus model, RTN notation or animation of travelling data.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library and Playwright.

## File map

- Create `src/copyModel.ts`: pure immutable copy operation.
- Create `src/copyModel.test.ts`: semantic and error tests for the model.
- Create `src/copyingContent.ts`: equal authored English/Mandarin lesson content.
- Create `src/CopyingValues.tsx`: four-section lesson and its local attempt state.
- Create `src/CopyingValues.test.tsx`: component behavior and accessibility tests.
- Modify `src/App.tsx`: route, title and third home card.
- Modify `src/App.test.tsx` and `src/ProcessorRegisters.test.tsx`: three-lesson expectations.
- Modify `src/styles.css`: copy diagrams, responsive stacking and reduced motion.
- Create `tests/copying-values.spec.ts`: production-browser acceptance tests.
- Modify `README.md`: third route and verified totals.

---

## Chunk 1: Semantic model

### Task 1: Implement immutable copying

**Files:** Create `src/copyModel.test.ts`; create `src/copyModel.ts`.

- [ ] Write `src/copyModel.test.ts` first:

```ts
import { describe, expect, test } from "vitest";
import { copyValue } from "./copyModel";

describe("copyValue", () => {
  test("copies A into B without changing A or the input", () => {
    const input = [{ id: "A", value: 7 }, { id: "B", value: 42 }];
    expect(copyValue(input, "A", "B")).toEqual([
      { id: "A", value: 7 }, { id: "B", value: 7 },
    ]);
    expect(input).toEqual([{ id: "A", value: 7 }, { id: "B", value: 42 }]);
  });
  test("changes only the destination in a memory copy", () => {
    const input = [
      { id: "m10", value: 7 }, { id: "m11", value: 42 },
      { id: "m12", value: 9 }, { id: "A", value: 7 },
    ];
    expect(copyValue(input, "m11", "A")).toEqual([
      { id: "m10", value: 7 }, { id: "m11", value: 42 },
      { id: "m12", value: 9 }, { id: "A", value: 42 },
    ]);
  });
  test("rejects unknown endpoints", () => {
    const input = [{ id: "A", value: 7 }];
    expect(() => copyValue(input, "missing", "A")).toThrow("Unknown source: missing");
    expect(() => copyValue(input, "A", "missing")).toThrow("Unknown destination: missing");
  });
});
```

- [ ] Run `npm test -- src/copyModel.test.ts`. Expected: FAIL because `./copyModel` does not exist.
- [ ] Create `src/copyModel.ts`:

```ts
export type StorageLocation = { id: string; value: number };

export function copyValue(
  items: readonly StorageLocation[],
  sourceId: string,
  destinationId: string,
): StorageLocation[] {
  const source = items.find((item) => item.id === sourceId);
  if (!source) throw new Error(`Unknown source: ${sourceId}`);
  if (!items.some((item) => item.id === destinationId)) {
    throw new Error(`Unknown destination: ${destinationId}`);
  }
  return items.map((item) => ({
    ...item,
    value: item.id === destinationId ? source.value : item.value,
  }));
}
```

- [ ] Run `npm test -- src/copyModel.test.ts`. Expected: 3 tests PASS.
- [ ] Commit with `git add src/copyModel.ts src/copyModel.test.ts && git commit -m "feat: add immutable copy model"`.

---

## Chunk 2: Lesson shell and first two sections

### Task 2: Add route, home card and definitions

**Files:** Create `src/copyingContent.ts`, `src/CopyingValues.tsx`, `src/CopyingValues.test.tsx`; modify `src/App.tsx`, `src/App.test.tsx`, `src/ProcessorRegisters.test.tsx`, `src/styles.css`.

- [ ] Write a failing component test which renders `<CopyingValues language="en" />`, finds the title “Copying values”, Computer and Processor groups, chooses Register A as source and Register B as destination, and verifies explanations appear only after both answers. Also test an incorrect optional register recall exposes `/learn/processor-registers` without disabling Next section.
- [ ] Run `npm test -- src/CopyingValues.test.tsx`. Expected: FAIL because component is missing.
- [ ] Implement a typed content object with `en` and `zh` entries for title, subtitle, four step names, controls, definitions, prompts, feedback and explanations. Both languages must express the same concepts.
- [ ] Implement `CopyingValues({ language }: { language: "en" | "zh" })` with `section`, `answers`, `revealed` and `spokenPrediction` state. `move(next)` must set the section and clear all attempt state; `reset()` calls `move(0)`. Use `<main id="main">`, course navigation, a focusable section heading, and semantic `role="group"` boundaries named Computer and Processor.
- [ ] Implement choices through one helper. Before feedback they are normal pressed-state buttons. After related feedback, keep them focusable with `aria-disabled="true"` and ignore clicks; do not use native `disabled` for these locked answers.
- [ ] Add `/learn/copying-values`, its document title and a third home card in `App.tsx`. The card names the lesson and links to the route. Update old home tests to expect three lessons.
- [ ] Run `npm test -- src/CopyingValues.test.tsx src/App.test.tsx src/ProcessorRegisters.test.tsx`. Expected: PASS.
- [ ] Commit with `git add src && git commit -m "feat: add copying lesson foundation"`.

### Task 3: Add register-to-register copy

**Files:** Modify `src/CopyingValues.tsx`, `src/copyingContent.ts`, `src/CopyingValues.test.tsx`, `src/styles.css`.

- [ ] Add failing tests for Section 2: A=7 and B=42 before; Show copy unavailable until both value predictions or “I have made my prediction”; result wrapper is always mounted and hidden; activation retains focus, sets `aria-expanded="true"`, and produces A=7/B=7; a second activation is idempotent; prediction buttons are locked after reveal.
- [ ] Run `npm test -- src/CopyingValues.test.tsx`. Expected: FAIL on missing Section 2 controls.
- [ ] Implement a selectable-text `CopyDiagram` with named Before and After groups. Mark source and destination with visible text badges and different solid/dashed borders. A static label says “Copy value: Register A to Register B”; do not render a travelling value, a formal RTN arrow, a bus/path/signal label, parent reference, or fixed Current state/Action panel.
- [ ] Keep `<div id="register-copy-result" hidden={!revealed}>` mounted. “Show copy” uses `aria-controls`, `aria-expanded`, stays mounted/enabled and calls `setRevealed(true)`, so focus and result remain stable on repeated activation. Derive the result with `copyValue` and announce the full causal explanation with `role="status"`.
- [ ] Run `npm test -- src/CopyingValues.test.tsx`. Expected: PASS.
- [ ] Commit with `git add src && git commit -m "feat: teach register copy semantics"`.

---

## Chunk 3: Memory copy and transfer checks

### Task 4: Add memory-to-register copy

**Files:** Modify `src/CopyingValues.tsx`, `src/copyingContent.ts`, `src/CopyingValues.test.tsx`, `src/styles.css`.

- [ ] Add a failing Section 3 test for Main memory 10→7, 11→42, 12→9 beside Processor/Register A=7. Verify the optional contents-at-11 recall does not gate progress and choosing `11` exposes `/learn/memory`.
- [ ] Add assertions that Show copy is unavailable until the learner predicts both address 11's final value and Register A's final value. After reveal assert address 11 remains 42, A becomes 42, both predictions are locked, all other cells remain unchanged, and the note says the diagram shows the result rather than a physical route and that the next exploration introduces buses.
- [ ] Run `npm test -- src/CopyingValues.test.tsx`. Expected: FAIL on missing memory section.
- [ ] Implement the Section 3 boundary diagram and the two required predictions. Keep `#memory-copy-result` always mounted/hidden before reveal, derive after values through `copyValue`, and use the same focus-stable idempotent reveal contract as Section 2. Draw no cross-component line or path.
- [ ] Run `npm test -- src/CopyingValues.test.tsx`. Expected: PASS.

### Task 5: Add two fresh applications and state behavior

**Files:** Modify `src/CopyingValues.tsx`, `src/copyingContent.ts`, `src/CopyingValues.test.tsx`.

- [ ] Add failing tests for B=3→A=9 and memory address21=4→B=8. Require eight predictions in total: source, destination, final source and final destination for each example. Assert neither explanation appears after seven; both appear after eight; final values are B=3/A=3 and address21=4/B=4; answers lock.
- [ ] Add failing state tests: changing language preserves section, answers and reveal; leaving and re-entering a section clears its attempt; Reset returns to Section 1 and retains Chinese.
- [ ] Run `npm test -- src/CopyingValues.test.tsx`. Expected: FAIL on missing Section 4/state behavior.
- [ ] Implement Section 4 with all eight keys in one `allAnswered` gate and results calculated by `copyValue`. Keep semantic order before both after groups.
- [ ] Run `npm test -- src/CopyingValues.test.tsx`. Expected: PASS.
- [ ] Run `npm test && npm run build`. Expected: all unit/UI tests PASS and build exits 0.
- [ ] Commit with `git add src && git commit -m "feat: add memory and fresh copy examples"`.

---

## Chunk 4: Visual contract and production browser evidence

### Task 6: Complete responsive and accessible presentation

**Files:** Modify `src/styles.css`, `src/CopyingValues.test.tsx`.

- [ ] Add/retain automated assertions for accessible Computer, Processor, Main memory, Before and After group names; announced result feedback; focusable locked predictions; selectable value text; and absence of the prohibited labels/panels described above.
- [ ] Implement `.copy-comparison` as a two-column grid in semantic order, stacking to one column at the existing mobile breakpoint. Use `.source-location` and `.destination-location` badges plus solid/dashed borders so meaning does not rely on colour. Values must be ordinary text, not canvas/SVG text.
- [ ] Add `@media (prefers-reduced-motion: reduce)` rules that remove transitions/animations from copy elements. The lesson must convey identical values and explanations without motion.
- [ ] Run `npm test -- src/CopyingValues.test.tsx && npm run build`. Expected: PASS and exit 0.

### Task 7: Add Playwright acceptance checks

**Files:** Create `tests/copying-values.spec.ts`; modify `README.md`.

- [ ] Add three Playwright tests, which run in both configured desktop/mobile projects: direct route/reload/title and three home links; keyboard/focus/idempotence plus both copy invariants and locked answers; eight-prediction gate, language preservation, reset, reduced-motion and horizontal-overflow checks.
- [ ] Run `npx playwright test tests/copying-values.spec.ts`. Expected: 6 PASS.
- [ ] Inspect English and Mandarin at all four sections at desktop/mobile widths, including before/after states; verify no console errors and no horizontal overflow.
- [ ] Update README: three bilingual activities; add `/learn/copying-values`; record current test totals; retain the pending learner-trial caveat.
- [ ] Run `npm run test:e2e`. Expected: existing 12 plus new 6 = 18 PASS.
- [ ] Commit with `git add tests/copying-values.spec.ts README.md src/styles.css src/CopyingValues.test.tsx && git commit -m "test: verify copying lesson in browsers"`.

---

## Chunk 5: Review, verification and authorized integration

### Task 8: Review and integrate

- [ ] Obtain spec-compliance review against `docs/superpowers/specs/2026-09-25-copying-values-design.md`; fix every finding and re-review.
- [ ] Obtain code-quality review; fix every finding and re-review.
- [ ] Run `npm test`; record exact pass count.
- [ ] Run `npm run build`; expect exit 0.
- [ ] Run `npm run test:e2e`; expect 18 PASS.
- [ ] Run `npm audit --audit-level=moderate`; expect 0 vulnerabilities at or above moderate.
- [ ] Run `git diff --check`; expect no output and exit 0.
- [ ] Append a verification record to this file, then commit documentation with `git add docs && git commit -m "docs: record copying lesson verification"`.
- [ ] Integrate exactly:

```bash
git status --short --branch
git switch main
git merge --ff-only feat/copying-values
npm test
npm run build
git push origin main
git fetch origin main
test "$(git rev-parse main)" = "$(git rev-parse origin/main)"
git branch -d feat/copying-values
git status --short --branch
```

Expected: fast-forward merge, tests/build pass again on `main`, push succeeds, equality check exits 0, feature branch is deleted, and final status is clean on `main` tracking `origin/main`.

## Verification record

- Spec compliance: approved after separating Section 4 prediction from copy reveal and locking Section 3 corrective feedback.
- Code quality: approved after fixing language-independent source/destination styling, visible heading focus, live correction feedback and nested heading levels.
- Unit/interface suite: 29 tests passed across 5 files.
- Production build: TypeScript and Vite build completed successfully.
- Browser suite: 18 checks passed across desktop and mobile projects; Bite 3 accounts for 6 checks.
- Dependency audit: 0 vulnerabilities at moderate level or above.
- Whitespace validation: `git diff --check` passed.
- Visual review: English/Mandarin content, desktop/mobile stacking, source/destination labels and before/after diagrams inspected. A guided learner trial remains pending.
