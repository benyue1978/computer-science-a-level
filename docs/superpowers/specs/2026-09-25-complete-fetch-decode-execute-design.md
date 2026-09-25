# Complete Fetch–Decode–Execute — Bite 8 Design

**Date:** 25 September 2026
**Programme:** Cambridge International AS & A Level Computer Science 9618 (2027–2029)
**Audience:** Beginner, guided study
**Status:** Implemented and verified on 25 September 2026.

## Purpose and syllabus fit

Bring together the previous bites on processor/memory, registers, buses, the repeated instruction cycle and RTN. The learner should be able to describe fetch, decode and execute in order, explain the four Cambridge fetch RTN transfers, trace their effect on PC/MAR/MDR/CIR, distinguish the buses used for the memory read, and explain what the Control Unit and ALU contribute during decode and execute. Finish with original exam-style practice that requires a complete explanation, rather than claiming that animation alone establishes mastery.

Cambridge International 9618 (2027–2029) syllabus §4.1 requires candidates to describe the Fetch–Execute cycle and describe and use RTN to describe it. Its register list includes PC, MAR, MDR, CIR and ACC; it also requires understanding CU, ALU, system clock, IAS, and address/data/control buses. The official June 2022 Paper 11 mark scheme awards fetch-path marks for the PC's next-instruction address, MAR's accessed address, MDR's transferred value and CIR's instruction role. Local programme design places interrupts in their later dedicated lesson; this bite covers the core F-D-E cycle and leaves interrupt handling for that lesson.

References:

- [Cambridge International 9618 syllabus, 2027–2029](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf), §4.1.
- [Cambridge International 9618/11 May/June 2022 official mark scheme](https://www.cambridgeinternational.org/Images/673620-june-2022-mark-scheme-paper-11.pdf), Q6(a)(i).
- [Cambridge International 9618/13 May/June 2025 mark scheme, Q2(a)(ii)](https://qualifiedquest.com/papers/a-level/computer-science-9618/2025/9618_s25_ms_13.pdf), four ordered fetch RTN transfers.

## Teaching model and scope

Build on the exact Cambridge sequence already taught in Bites 6–7:

```text
MAR ← [PC]
PC ← [PC] + 1
MDR ← [[MAR]]
CIR ← [MDR]
```

The walkthrough uses one readable teaching instruction, “Add five to the value in ACC,” stored at memory address 20, and starts with PC=20 and ACC=7. Define ACC briefly as a register that holds a value used in a calculation. Explicitly say this natural-language sentence explains the teaching instruction; it is not assembly, machine code, a syllabus-prescribed encoding or a PL24 execution. The first two RTN lines leave MAR=20 and PC=21. The memory read then uses MAR=20: address 20 travels on the address bus, CU sends READ on the control bus, and the instruction value returns on the data bus into MDR. The fourth line copies it into CIR. During decode, CU interprets the instruction as an addition of 5 to ACC. During execute, ALU calculates 7+5 and ACC becomes 12. Then the instruction cycle is complete and the processor is ready to fetch the instruction at the address now in PC.

Show one small computer event at a time, grouped beneath Fetch, Decode and Execute. Each prediction is visibly the learner's task; each revealed event names the computer/processor as actor. Display the current and resulting state so the learner can identify what changed and what stayed the same. Use `Show next computer step` for one event; do not conflate that small teaching step with the complete instruction cycle. Keep the final disabled step control mounted so keyboard focus is not lost when the trace ends. Explain the clock after the trace: a clock cycle is a regular timing beat associated with small coordinated actions in this teaching model; an instruction cycle is the complete fetch, decode and execute of one instruction. Do not assert a universal number of clock cycles per instruction.

## Learner experience

Create one bilingual page at `/learn/fetch-cycle`, linked as the eighth exploration from home. It has four parts:

1. **Cycle map:** show Fetch → Decode → Execute → Fetch next instruction, state each stage in beginner-friendly language, and identify processor actions as computer events.
2. **Stepped walkthrough:** show the processor registers, current instruction memory cell and address/data/control buses. Use fresh prediction prompts before each of the six events: copy PC to MAR; advance PC; perform the memory read using address/control/data paths into MDR; copy MDR to CIR; have CU decode the instruction; have ALU execute it and update ACC. Predictions are not state mutations, wrong predictions do not block progression, and the first computer-event area is empty before an event occurs. Language switching preserves step and prediction; reset returns to the initial state.
3. **Clock and cycle connection:** after the walkthrough, distinguish a clock cycle from an instruction cycle using the previously learned small-action example. A completed F-D-E pass advances the processor to the next PC value and fetches the next instruction; the page need not execute a second instruction.
4. **Exam transfer:** original, non-past-paper practice checks stage order, the four RTN lines, the role of each register and bus, CU decode versus ALU execution, and a concise complete answer. Mark points appear only after the learner attempts the task. Include a model answer and explicit mark-point checklist for self-explanation with a guide; do not claim automatic marking of free text.

## Boundaries and wording

- Use the Cambridge fetch RTN spellings and ordering exactly.
- Teach ACC and ALU only to the extent needed for this one explained execute example; do not introduce the rest of the instruction set or status flags.
- Keep the address 20 and `+1` as this already-established teaching trace. Keep byte/word units, instruction width, address width, opcode bits, encoding, assembly syntax, PL24 and simulator internals out of learner-facing text.
- Do not add interrupts/ISR, branching, pipeline, parallel processors or multi-instruction execution; interrupts are taught separately.
- Do not claim the simplified example is a cycle-accurate hardware trace. Do not map one F-D-E stage to one clock pulse.
- Do not conflate user prediction with processor action. No parent-facing instructions on the learner page.

## Accessibility and acceptance

English and Simplified Chinese receive equally complete authored explanations, stage labels, prompt/feedback, events and exam support. All controls are semantic keyboard-operable buttons with visible focus; active stage/event is announced and indicated by labels as well as color. Respect reduced motion. Desktop and narrow phone layouts have no horizontal overflow.

Acceptance means a beginner can, using the page alone and after attempting its questions:

- put fetch, decode and execute in order and explain that the cycle repeats for the next instruction;
- reproduce and explain the four fetch RTN lines in order;
- calculate the demonstrated register changes and why PC can advance while MAR retains the fetched address;
- assign address, READ and returned instruction data to the correct buses;
- distinguish CU's decode from the ALU's execute action;
- distinguish the clock's small beat from a complete instruction cycle;
- answer a fresh structured F-D-E exam-style prompt using the expected component/register roles.

Verify the route, state transitions, answer reveal, language/reset behaviour, mobile layout and direct reload with unit, production build and desktop/mobile browser tests.

## Verification record

- `npm test`: 10 files, 56 tests passed.
- `npm run build`: TypeScript and Vite production build passed.
- `npm run test:e2e`: 46 desktop and mobile browser tests passed.
- `git diff --check`: passed.
