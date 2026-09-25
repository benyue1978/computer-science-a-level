# Repeated Instruction Cycle — Bite 5 Design

**Date:** 25 September 2026  
**Programme:** Cambridge International AS & A Level Computer Science 9618, 2027–2029  
**Audience:** A learner beginning with no assumed computer-science knowledge, learning with a guide

## Purpose

Build a first mental model for how a processor repeatedly handles instructions. The learner should explain an instruction as a direction for the processor, name and order fetch, decode and execute, and show how finishing one instruction leads the processor to fetch the next. Then introduce the system clock as a timing source and distinguish one small clock-coordinated step from the complete process of handling an instruction.

This is Bite 5 of the introductory foundations sequence. It connects the bus roles from Bite 4 to the named fetch registers in Bite 6. It is a concept lesson, not a register trace, complete Cambridge fetch sequence or PL24 simulation.

## Syllabus grounding

Cambridge syllabus §4.1 for 2027–2029 requires candidates to describe the stages of the Fetch–Execute (F–E) cycle, describe and use register transfer notation to describe the F–E cycle, and understand the roles of the Control Unit and system clock. This bite supplies only the conceptual cycle and the clock distinction; RTN is explicitly taught in Bites 7–8 and the full cycle is later revisited and assessed in L10. The syllabus is authoritative; local notes are teaching aids.

Reference: [Cambridge International AS & A Level Computer Science 9618 syllabus, 2027–2029](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf), §4.1.

## Learning outcomes

By the end, the learner can:

1. Explain that an instruction is a direction the processor can carry out.
2. State the ordered stages: fetch an instruction, decode it, execute it.
3. Explain that the processor returns to fetch to handle the next instruction; these stages repeat while the program continues.
4. Explain that the system clock provides regular timing signals. In this lesson's simplified step-by-step model, one clock cycle coordinates one very small processor action, such as putting an address onto the address bus.
5. Explain that an instruction cycle is the complete process of handling one instruction through fetch, decode and execute. When zooming in with this lesson's step-by-step model, the learner can observe several small actions, each coordinated with a clock cycle. Do not claim that every real instruction or processor design must take several clock cycles, map each named fetch–decode–execute stage to one clock cycle, or give precise cycle counts, durations or frequencies.

## Prerequisites and teaching boundaries

Reuse the earlier ideas that memory can hold instructions as well as data, that the processor carries out instructions, that registers are locations inside the processor, and that buses connect components. Recap only what is needed; do not gate access on passing previous bites.

- Introduce the F–E cycle as a repeating process of the processor, not a sequence of learner actions.
- Define *fetch* in plain language as obtaining the next instruction from memory; *decode* as working out what that instruction means; *execute* as carrying it out.
- Explain that the cycle starts again with the next instruction. Do not add branches, interrupts, instruction-specific micro-operations or stop behaviour here.
- Introduce clock timing only after the learner has seen the complete cycle. Explain that clock signals coordinate small steps; for this lesson's simplified model, one clock cycle corresponds to one very small step. Use the single familiar example of placing an address on a bus, without replaying the bus transaction.
- Contrast this with an instruction cycle: the complete handling of one instruction through fetch, decode and execute. In this lesson's step-by-step representation, one instruction is expanded into several small actions. State this as the teaching model, not a universal property of all processor designs; keep cycle counts, durations and frequencies qualitative.
- Do not introduce PC, MAR, MDR, CIR, ACC, register transfer notation, instruction encoding, assembly mnemonics, binary, bus-width/word-size/addressing details, or a step-by-step memory bus transaction. These belong to subsequent bites.
- Avoid mapping one clock cycle to each of the three named stages. Fetch/decode/execute are the larger stages; clock cycles coordinate smaller actions within that process.

## Teaching example and visual sequence

Use a small illustrative list of two natural-language directions, such as `Display “Hello”` followed by `Display “Goodbye”`. Label these as plain-language example instructions, not assembly, machine code or a prescribed syllabus instruction set. The example exists to make “next instruction” and repetition visible; it does not model registers, buses or the details of display hardware.

The visual cycle has three named stages arranged in order: **Fetch → Decode → Execute**, with a clear return arrow from Execute to Fetch for the next instruction. On each pass, the active instruction card is identified and the active stage is highlighted. The second pass uses the second card so the learner sees that completion leads to another fetch. Use text, labels and direction marks as well as colour.

Separate the clock into a final short visual. Show one clock cycle as a simple regular beat, paired with one familiar small action: the processor places an address onto the address bus, as seen in Bite 4. Then explain that the instruction cycle is the complete handling of one instruction—fetch, decode and execute—and that this lesson's step-by-step view expands it into several small actions. Do not align one clock cycle with each F–E stage or imply that every processor design uses a fixed/universal number of cycles per instruction.

## Interaction model

- Present one learner question before the walkthrough: “After the processor carries out this instruction, what happens next?” Offer a small choice including “fetch the next instruction.” The learner's answer is a prediction only.
- A distinct control labelled “Show next computer step” / “显示计算机下一步” reveals one represented processor event at a time. The event text always names the computer/processor as the actor.
- The learner choice never performs or advances a computer step. Feedback after prediction remains separate from event narration.
- The interaction runs through the first instruction's three stages, loops to the second instruction, and repeats the three stages there. A restart restores the opening state. Language switching preserves the current instruction and stage.
- A brief clock explanation follows the cycle demonstration. It is explanatory and does not add clock-tick stepping to this bite.
- Do not use fixed “current state / action / changed / why” panels. Apply the programme's four-question principle internally to any represented change.

## Bilingual and accessibility requirements

English and Simplified Chinese receive equal authored explanations, prompts, predictions, stage names, event text, feedback, controls and accessible labels. Keep direct learner-facing wording; do not refer to the parent in the interface.

All steps are keyboard operable with visible focus. Use semantic buttons and headings, announce newly shown computer events to assistive technology, keep important diagram text selectable, and never rely on colour alone. Respect reduced-motion preferences without hiding a stage change. Reflow without horizontal scrolling on narrow screens.

## Acceptance criteria

- A new learner can explain instruction, fetch, decode and execute from the page itself.
- The three stages appear in the correct order and visibly form a repeatable loop.
- The second instruction is fetched only after the first instruction has been executed; prediction and computer events remain distinct.
- Clock cycles are explained after the F–E model as coordinating small actions; an address-on-bus example grounds the idea. The page distinguishes this from the larger instruction cycle, which handles one instruction and is expanded into several small actions in this step-by-step teaching model. It makes no universal hardware timing claim.
- The page does not leak named fetch registers, RTN, bit widths, implementation encoding, interrupts or bus-level microsteps.
- English and Chinese remain equivalent and preserve current interaction state when switched.
- Keyboard, reduced-motion and mobile requirements pass; automated tests cover cycle order/repetition, prediction separation, clock distinction and reset/language preservation, followed by browser walkthroughs on desktop and mobile.

## Relationship to the next bites

Bite 6 introduces PC, MAR, MDR and CIR individually and explains why they have distinct roles, using the conceptual cycle from this bite as the motivation. Bite 7 introduces the RTN symbols; Bite 8 combines them into the complete fetch sequence. The full L10 package later recaps and assesses this material. This bite alone does not confer completion of those later syllabus lessons.
