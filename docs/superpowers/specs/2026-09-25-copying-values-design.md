# Bite 3 — Copying values

**Status:** Approved for implementation by the owner on 25 September 2026.
**Place in programme:** Foundations Bite 3, supplying copy semantics for L4, L7 and L10. It is not a complete register-transfer-notation or bus lesson.

## Purpose

Teach one rule that later register transfers depend on: copying reads the value at a source and replaces the value at a destination with the same value. The source remains unchanged. Apply the rule first between two illustrative registers, then from main memory to a register.

The lesson separates three layers:

- explanation defines source, destination and copying;
- “Try it” asks the learner to predict a result;
- “Show copy” performs one represented copy in the diagram.

“Next section” only navigates the course. Selecting an answer only records a prediction. Neither is described as computer execution.

## Prerequisites and vocabulary

Assume the learner understands address versus contents, recognises main memory and the processor, and knows that a register is a storage location inside the processor. Provide an optional recall of Register A containing 7 and Register B containing 42, with a link to Bite 2 after an incorrect response. Do not gate progression.

Section 3 also includes a short optional check that address 11 is the location label and 42 is its contents. Choosing 11 when asked for the contents offers an in-context explanation and a link to `/learn/memory`. It does not gate the copy example.

Introduce:

- **source / 来源:** the storage location whose current value is read;
- **destination / 目标:** the storage location whose old value is replaced;
- **copy / 复制:** put the source value into the destination without clearing the source.

Do not introduce RTN brackets, assignment arrows as formal notation, buses, electrical signals, bit widths or the named Cambridge fetch registers. Register A and Register B remain illustrative labels, not PL24 architecture.

## Presentation model

Every represented copy uses three visually separate phases:

1. **Before:** show source and destination values before the event.
2. **Copy:** identify the source and destination in words. A simple directional cue may connect them, labelled “copy value”; it must not be presented as a physical wire or bus.
3. **After:** update only the destination, retain the source, and explain both the changed and unchanged values.

Do not animate a value travelling through space. The next bite explains buses and how information, addresses and control requests travel. Reduced motion shows the same before/after result without transition.

The learner may revisit sections. Entering a section restores its authored starting values and clears its prediction and revealed outcome. Switching language preserves section, predictions and revealed result. Reset returns to Section 1 while retaining language. Once a related explanation or copy result is revealed, its answer controls are locked until the learner re-enters the section or resets. Locked choices remain focusable with `aria-disabled="true"` and ignore activation, so feedback cannot be rewritten into a retrospective “correct prediction”.

## Four sections

### 1. Source, destination and copy

Show Register A containing 7 and Register B containing 42 inside a processor boundary. This is the initial state; no copy has happened.

Explain: “The source is where the value comes from. The destination is where the copy goes. Copying keeps the source and replaces the destination’s old contents.” / “来源是数值来自的位置；目标是副本到达的位置。复制不会清空来源，但会替换目标原来的内容。”

Use a static labelled cue “Copy from Register A to Register B” / “从寄存器 A 复制到寄存器 B”. This is plain language, not RTN syntax and not a hardware path.

**Try it:** identify the source and destination. Reveal both explanations only after both predictions.

### 2. Register A to Register B

Initial values: A = 7, B = 42. Ask the learner to predict both values after the copy. Accept an explicit “I have made my prediction” acknowledgement as an alternative to selecting answers.

The “Show copy” control performs exactly one conceptual copy:

- before: A = 7, B = 42;
- after: A = 7, B = 7;
- unchanged: Register A remains 7 because it is the source;
- changed: Register B changes from 42 to 7 because it is the destination;
- rule: the source value is read and the destination’s old contents are replaced.

Keep a visible before snapshot after reveal so the learner can compare it with the current diagram. A second activation is idempotent: “Show copy” remains mounted, enabled and focused, exposes `aria-expanded="true"`, and leaves the already-revealed result unchanged.

### 3. Main memory to a register

Show the familiar main-memory cells 10 → 7, 11 → 42 and 12 → 9 beside a processor containing Register A = 7. State plainly: “Copy the contents at address 11 into Register A.” / “把地址 11 的内容复制到寄存器 A。” Address 11 identifies the source memory location; the copied value is its contents, 42.

First use the optional address/content check described above. Then ask the learner to predict the value at address 11 and the value in Register A after the copy. “Show copy” produces:

- before: address 11 contains 42; Register A contains 7;
- after: address 11 still contains 42; Register A contains 42;
- unchanged: the address label, source contents and other memory cells;
- changed: Register A’s old contents are replaced;
- rule: copying from memory reads its contents; it does not empty that memory location.

Add a note: “This diagram shows the result, not the physical route. The next exploration introduces buses.” / “这幅图展示复制结果，不表示实际传送路径。下一次探索会介绍总线。” Do not draw a cross-component path.

### 4. Apply the same rule twice

Present two fresh examples with results hidden:

1. Register B = 3 copied to Register A = 9.
2. Contents 4 at address 21 copied to Register B = 8.

For each, ask for source, destination, final source value and final destination value. Collect all related predictions for both examples before revealing explanations, so one explanation cannot disclose an unanswered result.

Correct outcomes:

- Example 1: B remains 3; A becomes 3.
- Example 2: address 21 remains 4; B becomes 4.

Final explanation: the locations differ, but the copy rule is identical. A source is preserved and a destination is replaced. This prepares the learner to understand register transfers without teaching notation yet.

## Visual and interaction contract

- Reuse the established editorial style and explicit Computer / Processor / Main memory boundaries.
- Mark source and destination with text labels and shape/border differences; do not rely on colour alone.
- The copy cue names both endpoints. It is not labelled “bus”, “signal”, “data path”, “cycle” or “instruction”.
- Before/after values remain selectable text and have accessible group names.
- “Show copy” remains mounted and idempotent, exposes `aria-expanded` and `aria-controls`, and retains keyboard focus after activation. The controlled result wrapper exists in both states and is hidden before reveal.
- Feedback is announced after reveal. Wrong predictions receive the same full causal explanation without scores or timing.
- English and Mandarin receive equal authored content. There are no parent references or fixed state/action panels.
- Mobile layout stacks before/after diagrams without changing semantic order. Reduced motion preserves all values and explanations.

## App and state boundary

Add `/learn/copying-values` and a third lesson entry on the home page. Implement a focused `CopyingValues` component with authored bilingual content and a small pure copy model.

The pure model accepts storage locations and a source/destination pair, returning a new collection in which only the destination value changes. It must reject missing source or destination identifiers rather than silently creating one. UI state is limited to section, answers, revealed result and language owned by the app shell. No processor engine, event log, bus model, persistence or Remotion dependency is required.

## Acceptance

- The learner identifies source and destination in register-to-register and memory-to-register examples.
- After a copy, the source remains unchanged and the destination equals the source’s value from before the event.
- Unrelated registers and memory cells remain unchanged.
- Main-memory address labels never change, and a memory source is not emptied.
- Learner controls and represented computer events are worded distinctly.
- No animation implies a physical route before buses are taught.
- Related feedback does not reveal an unanswered prediction.
- Language switching, reset, keyboard use, reduced motion, direct routing and mobile layout work as in the first two lessons.

## Bridge to Bite 4

Bite 4 asks how a location, request and returned information travel. It can reuse the memory-to-register example and add address, data and control roles. Bite 3 deliberately establishes only the semantic result of copying, so Bite 4 can explain the transport mechanism without also teaching copy semantics for the first time.
