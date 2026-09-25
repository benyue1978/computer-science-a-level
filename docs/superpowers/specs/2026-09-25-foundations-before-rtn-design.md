# Foundations Before RTN — Small-Step Teaching Design

**Date:** 25 September 2026

**Purpose:** Establish understanding one idea at a time before building the complete RTN/fetch lesson or processor simulator.

**Scope decision:** This introductory sequence now precedes M1. The full 34-lesson programme and PL24 architecture remain the destination. The first deliverable is only Bite 1, not the entire introductory sequence.

## 1. Teaching principle

Start with a concrete concept and diagram. Where an example includes a computation, invite a prediction before showing its result. Keep learner tasks separate from what the example represents. A prerequisite deserves its own explanation and practice, rather than a quick mention in a warm-up. No assembly, binary arithmetic, processor terminology or RTN is assumed at entry.

Each bite contains one short explanation, a visual example, one guided action and one changed example the learner explains to the parent. A failed check returns to a simpler example; the parent may stop and resume without losing the thread. Avoid timers, scores and forced progression in this introductory experience.

Use the programme's [four-question teaching principle](2026-09-24-processor-fundamentals-learning-programme-design.md#11-shared-teaching-principle-state-action-change-and-reason) as an internal authoring check for represented computation, not fixed learner-facing headings: **current state → action → what changes and stays unchanged → why**. Invite the learner to predict before revealing the result. These small activities teach how to understand the state changes later exposed by the simulator's Next step and Next instruction controls; they are the beginning of that same learning experience.

For Bite 1, focus the learner page on address versus contents. Remove the fixed Current state / Action / Changed and unchanged / Reason panels. Keep explanatory read/write feedback where relevant. The following table is an authoring reference, not the page layout:

| Current state | Action | Changed and unchanged | Reason |
|---|---|---|---|
| Address 11 contains 42 | Read address 11 | The readout shows 42; all stored values and address labels remain unchanged | Reading retrieves a value without replacing or removing it |
| Address 11 contains 42 | Replace its contents with 6 | That cell now contains 6; its address is still 11 and other cells are unchanged | Writing replaces the value at the selected location, not the location's address |

The readout is part of the activity interface, not an unintroduced processor register. Distinguish a change in the displayed selection/readout from a change in stored memory. Ask the learner to explain the rule rather than simply repeat what moved on screen.

## 2. Introductory sequence

| Bite | Main question | Prerequisite supplied | Later curriculum connection |
|---|---|---|---|
| 1. Memory, addresses and contents | Where is something stored, and how do we find it? | A location label is different from the stored value | L3 |
| 2. Processor and registers | What works on information, and where does it hold values while working? | Processor versus memory; a register is a small storage location inside the processor | L5–7 |
| 3. Copying values | What changes when we copy a value? | Before/after state; source remains; destination is replaced | L4, L7, L10 |
| 4. Buses and control | How do a location, a request and returned information travel? | Address/data/control roles, read versus write; name the CU when it coordinates a request | L6, L9 |
| 5. Repeated instruction cycle | How does the processor repeatedly get, understand and carry out an instruction? | An instruction is a direction; fetch/decode/execute cycle versus clock timing | L6, L11 |
| 6. Fetch registers | Why are PC, MAR, MDR and CIR separate? | Introduce one role at a time using the earlier copy/read actions | L7 |
| 7. RTN expressions | How can we write those familiar actions briefly? | Arrow, contents brackets, memory lookup, increment and sequence | L10 |
| 8. Complete fetch | Can we predict and explain the whole sequence? | Combine notation and diagram without introducing new symbols | L10 |

Bites 7–8 provide the first RTN/fetch teaching; their content becomes part of the later L10 package, where it is recapped, connected to the executable simulator and independently assessed.

These are learning subdivisions, not eight additional full curriculum lessons or a requirement to produce eight polished videos immediately. Reuse their content in the final lesson packages; keep L01–L34 and V01–V34 as the final package identifiers. Their introductory checks are useful evidence but do not automatically award mastery of a complete later lesson.

For Bite 5, first distinguish a single action from a repeated process using a familiar example. Then introduce instructions and the repeating instruction cycle. Only afterwards introduce clock ticks as timing signals: one instruction cycle is not synonymous with one clock tick. No physical timing counts or processor implementation widths belong in this introduction.

Bites 2–8 will each receive a small detailed content/activity design after learning from Bite 1. This document fixes their order and purpose, not unreviewed scripts or software requirements for all eight.

## 3. First deliverable: memory, addresses and contents

### Outcome and assumed knowledge

The learner can point to a memory location, read the value at a given address, and explain that changing the stored value does not change the location's address.

The only assumed knowledge is recognising small written numbers and choosing an item on a screen. Check that informally first. No arithmetic is required. If necessary, start with three locations labelled A/B/C before replacing the labels with numbers; do not suggest that alphabet labels are a different physical memory system.

### Concrete visual

Show three simple storage cells. Each cell has a fixed address label outside it and a value inside it:

| Address label | Stored value |
|---:|---:|
| 10 | 7 |
| 11 | 42 |
| 12 | 9 |

Use small decimal values, with both label and content available as selectable/readable text. Do not show a CPU, registers, buses, bytes, words, capacities, binary, instruction encoding or RTN yet. Teach only that this picture is a simple model of memory locations.

A cabinet/drawer comparison can explain why the label stays fixed while the contents change, but immediately connect it back to the on-screen memory cells. Do not build a story or game system around the analogy.

### Guided sequence

1. **Introduce a location.** Reveal one cell, its address label and its content separately. Say: “The address tells us which place. The contents tell us what is stored there.” / “地址告诉我们是哪一个位置；内容告诉我们那里存着什么。”
2. **Choose by address.** Reveal all three cells. Ask: “Which cell has address 11?” / “哪一个存储位置的地址是 11？” Wait for a choice before highlighting the requested location.
3. **Read its contents.** Ask what is stored there. The expected response is 42, not 11. Reveal a readout only after a submitted choice or an explicit “I have made my prediction” acknowledgement.
4. **Keep address and value distinct.** Ask where 7 is stored. The answer is address 10. Use this reverse question to check understanding rather than memorisation of one selection.
5. **Change the contents.** Offer one simple controlled action: replace the value at address 11 with 6. Ask what will change before applying it. Animate only the inside value; the address stays 11. Explain that reading earlier did not empty the cell.
6. **Try a new example.** Reset to addresses 20, 21 and 22 with contents 8, 3 and 8. Ask for the contents at 21, the address of the cell containing 3, and whether two locations can contain the same value. A correct explanation identifies 3, 21 and both 20/22 containing 8.

The two scenarios are authored data, not snapshots of the PL24 processor. Do not pretend a processor or bus transaction has run. Later bites can connect these same concepts to real machine state through the teaching adapter.

### Separate facilitator guide (not displayed on the learner page)

- **Prepare:** Point to an address and a value; confirm the learner recognises the numbers.
- **Ask:** “Are we being asked where it is, or what is there?” / “我们要找的是位置，还是那个位置里的内容？”
- **First hint:** Point to the two different visual positions: label outside, contents inside.
- **Second hint:** Revisit a single cell and read its address/content together.
- **Check:** Use the changed example without hints, then ask why replacing a value did not change its address.
- **Review:** At the next session, show three new labels/values and repeat one where/what question.

English and Mandarin explanations receive equal authored support. A language switch preserves the selected cell and stage. Introduce only “memory”, “address” and “contents” as essential terms; keep technical acronyms out of this bite.

## 4. Small implementation boundary

Learner-facing copy addresses the learner directly, with no parent references or parent card. The explanation describes the concept; a “Try it” / “试一试” area states the learner task. Buttons that launch conceptual examples say “Show reading” / “演示读取” and “Show writing” / “演示写入”; navigation says “Next section” / “下一小节”. Choosing a cell answers a question; it is not described as a memory operation. The diagram represents memory only and does not claim a processor has executed.

Build a small self-paced browser activity: three cells, guided prompts, reveal, replace-value, reset and language controls. Its state is limited to scenario ID, stage, selected address, current cell values, submitted answer/reveal state and language. Keep authored content separate from the visual component and the small state transitions.

Do not make the full processor engine, assembler, generic teaching-frame framework, Remotion pipeline, narration production, progress database or exam grading a prerequisite for this first activity. The parent can read the short bilingual text while the diagram illustrates it. Polished video production follows once the teaching granularity has been tried. The wider hybrid-video plan remains unchanged.

Keyboard selection must have the same effect as pointer selection. Do not rely on colour alone for address versus contents. Reduced motion changes the transition style, not the displayed result. Reset restores the authored example exactly. Do not award mastery or persist personal learner data in this first prototype.

## 5. Acceptance and next decision

- A fresh visitor can understand the three terms from the learner-facing explanation and diagram, with optional spoken support and without a developer explaining the interface.
- Reading a cell changes neither its address nor its stored value.
- Replacing contents changes only the selected cell's value; other cells and all address labels remain unchanged.
- Reset and language switching behave as specified; all actions work with keyboard input.
- The changed example and parent explanation check distinguish label from value; feedback does not reveal an answer before the learner predicts.
- No processor implementation details leak into labels or explanations.

Use focused tests for the read/replace/reset transitions and one browser walkthrough, not the full processor coverage suite before a processor exists. Record the parent's and son's actual experience separately from automated checks. If the activity needs developer explanation or the changed example remains confusing, revise this bite before adding registers or buses.

After this first activity is understood, design Bite 2 at the same level of detail and continue one bite at a time. The existing M1 implementation plan is retained as later engineering work; it must not be the automatic next action after this document.
