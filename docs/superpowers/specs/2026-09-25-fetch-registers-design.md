# Fetch Registers — Bite 6 Design

**Date:** 25 September 2026  
**Programme:** Cambridge International AS & A Level Computer Science 9618, 2027–2029  
**Audience:** A learner beginning with no assumed computer-science knowledge, learning with a guide

## Purpose

Introduce the four registers most visible in the fetch path: Program Counter (PC), Memory Address Register (MAR), Memory Data Register (MDR) and Current Instruction Register (CIR). The learner should know their full names, understand that each is a small storage location inside the processor with a different job, and follow how an instruction and its address relate to the address, data and control buses.

This is Bite 6 of the introductory foundations sequence. It builds on memory locations and contents (Bite 1), the processor/register boundary (Bite 2), copying semantics (Bite 3), buses and control (Bite 4), and the conceptual instruction cycle (Bite 5). It deliberately stops short of PC increment, RTN, and the complete fetch sequence taught in Bites 7–8. It is a conceptual guided model, not a PL24 processor execution.

## Syllabus and local-source grounding

Cambridge International 9618 syllabus §4.1 for 2027–2029 lists the Program Counter, Memory Data Register, Memory Address Register, Accumulator, Index Register, Current Instruction Register and Status Register among the special-purpose registers. It also requires understanding their roles and data transfer over address, data and control buses. This bite focuses on PC, MAR, MDR and CIR because the next programme bites introduce the other registers separately.

The Cambridge International May/June 2022 Paper 11 mark scheme, Q6(a)(i), awards marks for the roles of PC, MAR, MDR and CIR in the fetch path: PC holds the next instruction address; MAR holds the address to fetch from; MDR holds data at the address in MAR; and the instruction is transferred to CIR for decoding and execution. This is a useful exam-oriented check, not a substitute for the current syllabus.

Local notes `outputs/processor-fundamentals/01-architecture-and-registers.md` and `02-components-and-buses.md` provide the authored register and bus role descriptions. Bite 4 has already introduced that the address bus carries locations, the data bus carries transferred values, and the control bus carries requests such as READ. Where local notes compress role descriptions, this bite uses the syllabus and Cambridge mark-scheme wording as the controlling reference.

References:

- [Cambridge International AS & A Level Computer Science 9618 syllabus, 2027–2029](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf), §4.1.
- [Cambridge International 9618/11 May/June 2022 mark scheme](https://www.cambridgeinternational.org/Images/673620-june-2022-mark-scheme-paper-11.pdf), Q6(a)(i).

## Learning outcomes

By the end, the learner can:

1. Identify PC, MAR, MDR and CIR as named storage locations inside the processor.
2. Give the full name and basic purpose of each register.
3. Explain the key distinction between PC and MAR: PC identifies the address of the next instruction to fetch; MAR holds the memory address currently being accessed.
4. Explain the key distinction between MDR and CIR: MDR temporarily holds data or an instruction moving between memory and the processor; CIR holds the current instruction for decoding and execution.
5. Follow a simple fetch-register relay and identify where the address, READ request and instruction travel over the address, control and data buses.

## Concepts, vocabulary and boundaries

Start with a compact recap: a register is a small storage location inside the processor; a memory address identifies a location; the contents are what that location holds. The four named registers are special-purpose registers because they have specific roles. Do not compare the whole general-purpose/special-purpose classification in depth here; the later register bite covers that wider comparison.

Use these stable role statements:

| Register | Full name | Learner-ready role |
|---|---|---|
| PC | Program Counter | Holds the address of the next instruction to be fetched. |
| MAR | Memory Address Register | Holds the address of the memory location currently being accessed. |
| MDR | Memory Data Register | Temporarily holds data or an instruction transferred between memory and the processor. |
| CIR | Current Instruction Register | Holds the current instruction while it is decoded and executed. |

The lesson may say that PC's address is copied into MAR, and that the same address is then carried from MAR over the address bus. It may show a READ signal on the control bus and a memory value returning over the data bus into MDR, followed by the instruction being copied from MDR to CIR. Keep the displayed arrows and descriptions in plain language; do not render formal RTN symbols.

Do not teach PC increment, address units, byte/word width, register bit widths, instruction encoding, assembly syntax, RTN brackets/arrows, interrupts, or execution-stage actions. Do not imply MAR itself fetches data, that MDR stores the address, that CIR contains every value from memory, or that the buses are registers. Do not claim this conceptual display has executed PL24 machine code.

## Teaching example and visual sequence

Show a simple computer diagram with the four registers clearly inside a labelled processor boundary, main memory outside it, and labelled address, data and control buses between them. Keep all values and labels as selectable text and distinguish component boundaries from transport paths.

Use one readable teaching example: memory location 20 is shown as containing the instruction `Display “Hello”`. Label this phrase as a readable stand-in for an instruction, not literal machine code, an assembly mnemonic or an instruction from the PL24 set. PC initially contains 20 to indicate that this is the next instruction. Other register values may be shown as not-yet-filled rather than introducing unexplained zeros.

Guide the learner through the relay:

1. **Meet the four jobs.** Reveal each full name, abbreviation and one-sentence role. Ask the learner to compare PC with MAR and MDR with CIR; both pairs hold related kinds of information but serve different moments/jobs.
2. **Copy the address inside the processor.** The computer copies 20 from PC into MAR. PC remains 20 in this bite; do not increment it. Describe this as an internal processor transfer, not a bus journey.
3. **Send the location and request the read.** MAR supplies address 20 onto the address bus toward memory. The CU issues READ using the control bus. Explain that the address says where and READ says what memory request is being made. The two signals are coordinated parts of the read; do not imply the control bus carries the address or the data value.
4. **Return the instruction value.** Memory location 20 returns its instruction contents over the data bus into MDR. The address in MAR does not travel back on the data bus.
5. **Hold the current instruction.** The processor copies the instruction from MDR into CIR. CIR now holds the instruction that the CU can decode and the processor can execute. Do not show the decoding or execution actions.

The diagram should reveal one computer event at a time. Highlight both the register whose role is being used and the corresponding bus when applicable. Use labels, direction arrows and text in addition to colour. Keep bus sections distinct from internal register-to-register transfers.

## Interaction model

- Keep the learner's “Try it” task separate from the “Computer event” sequence. A learner prediction selects or commits to an answer; it never changes the computer state.
- The computer-step control reveals one event at a time. Every event names the computer or processor as the actor.
- Ask a small prediction before the first address transfer, such as which register currently holds the next instruction's address or where the address will be copied. Do not gate navigation on correctness.
- After the relay, ask the learner to identify which bus carried the location, which bus carried the returned instruction, and which control signal requested the read. Do not reveal answers for unanswered questions.
- Reset restores the initial display. Switching English/Chinese preserves the event, register values, highlights and learner answers.
- Apply the programme's four-question principle to represented changes: what the register currently contains, what the computer does, which value changes or stays, and why that register/bus is used. These are authoring checks, not fixed interface headings.

## Bilingual and accessibility requirements

English and Simplified Chinese receive equally complete, authored explanations, full register names, roles, diagram labels, predictions, event narration and feedback. Use standard English register abbreviations alongside Chinese names on first mention (for example, 程序计数器 PC). The learner page must not refer to the parent.

Use semantic headings, named register/bus regions, buttons for learner answers and step progression, visible keyboard focus, and live announcements for each new computer event. Use `aria-current="step"` or equivalent semantics for the active computer component. Do not rely on colour alone. Reflow on narrow screens without horizontal overflow; respect reduced-motion preferences without hiding state changes.

## Acceptance criteria

- A first-time learner can distinguish a register from main memory and identify all four named registers inside the processor.
- Full names, abbreviations and roles are explicit in both languages.
- The page makes PC-versus-MAR and MDR-versus-CIR distinctions easy to state.
- The relay demonstrates PC-to-MAR as internal, MAR-to-address-bus as address transport, READ on control bus, memory-to-MDR over data bus, then MDR-to-CIR as internal.
- The address, read request and instruction value are never presented as travelling on the wrong bus.
- The natural-language instruction is clearly a readable teaching stand-in, not a machine-code or PL24 claim.
- No PC increment, RTN, bit width, assembly or execution detail leaks into the lesson.
- Learner predictions and computer events are separate; language switching and reset preserve/clear the specified state.
- Keyboard, reduced-motion and mobile behaviour pass unit and browser tests.

## Relationship to the next bites

Bite 7 introduces RTN symbols for copying, memory lookup and increment. Bite 8 combines those symbols with the full fetch sequence, including the next-address update. A later register bite introduces ACC, IX and Status Register and covers the broader general-purpose versus special-purpose distinction. This bite does not claim completion of the syllabus register, RTN or fetch-cycle requirements.
