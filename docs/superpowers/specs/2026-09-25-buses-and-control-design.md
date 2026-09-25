# Buses and Control — Bite 4 Design

**Date:** 25 September 2026  
**Programme:** Cambridge International AS & A Level Computer Science 9618, 2027–2029  
**Audience:** A learner starting with no assumed computer-science knowledge, learning with a guide

## Purpose

Teach how a location, a request and information travel between the processor, memory and I/O ports. The learner should distinguish address, data and control buses, explain the direction and purpose of each in a simple transfer, and tell a read from a write. This is Bite 4 in the foundations sequence and prepares for the later repeated instruction cycle and fetch-register lessons; it is not a complete processor-cycle lesson.

## Syllabus grounding

Cambridge 9618 §4.1 requires candidates to understand transfers between processor, memory and input/output devices via address, data and control buses, and the roles of the control unit (CU) and system clock. This bite explicitly teaches the three bus roles and a simple CU-coordinated read/write. Clock timing and bus width belong in later performance/cycle lessons. The official syllabus is the authority; local notes are teaching aids, not source authority.

Reference: [Cambridge International AS & A Level Computer Science 9618 syllabus, 2027–2029](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf).

## Learning outcomes

By the end, the learner can:

1. Identify the address bus as carrying the location being accessed, the data bus as carrying the value being transferred, and the control bus as carrying the kind of request/status that coordinates the transfer.
2. Explain a simple read: CPU supplies an address, the CU issues READ, memory supplies the contents on the data bus to the CPU.
3. Explain a simple write: CPU supplies an address and the value to store, the CU issues WRITE, memory replaces the contents at that location.
4. Explain that “system bus” collectively names the three bus groups, not an additional fourth bus.
5. Explain that a port is an interface through which an I/O device connects; a port is not the external device itself.

## Teaching boundaries and precision

- Address identifies where; it does not carry the contents.
- Data carries the instruction or value; it does not identify the destination by itself.
- Control carries requests and coordination/status signals; it is not payload data. Name READ and WRITE as concrete examples. The control bus is described as bidirectional in aggregate: individual signals have their own directions.
- The address bus is shown CPU→memory/I/O for this taught access model. The data bus can carry information in either direction, depending on read versus write.
- The CU coordinates the request by issuing the appropriate control signal. Do not imply the CU itself transports the address or payload.
- A read changes the receiving display/register in the example, but does not alter the selected memory cell. A write changes the contents at the destination while its address and other cells remain unchanged.
- Ports appear as accessible connection endpoints in the diagram. Keep peripheral examples abstract; no USB/HDMI/VGA catalogue.
- Do not introduce clock ticks, a full fetch–execute cycle, interrupts, RTN, PC/MAR/MDR/CIR, physical widths, byte/word addressing, voltage levels, or PL24 implementation details.
- Never imply that the three logical bus roles must be three physically separate single wires.

## Visual and interaction design

Redraw the supplied textbook topology accessibly: CPU on the left, memory centrally, I/O ports on the right, and three labelled paths that visibly group as the system bus. Keep role labels and arrows/text direction cues visible without colour. The supplied image informs the teaching semantics; it is not to be copied as an implementation specification.

Provide one reusable Bus Explorer with Read and Write modes. Use distinct modest examples so state changes are easy to compare.

**Read example:** `Memory[11] = 42`; receiving CPU register/readout begins at `7`. The learner predicts what arrives. Show these computer events in order:

1. CPU places address `11` on the address bus.
2. CU issues `READ` on the control bus.
3. Memory places `42` on the data bus toward the CPU.
4. The receiving value changes from `7` to `42`; memory address `11` and its contents `42` stay the same.

**Write example:** `Memory[12] = 9`; CPU holds value `6`. The learner predicts what changes. Show:

1. CPU places address `12` on the address bus.
2. CU issues `WRITE` on the control bus.
3. CPU places `6` on the data bus toward memory.
4. Memory contents at address `12` change from `9` to `6`; the address and all other cells stay the same.

Each step button is explicitly labelled as revealing the next computer event (e.g. “Show next transfer”); it is not the learner causing the transfer. Learner questions live in a clearly named “Try it” area and only capture a prediction. Avoid fixed “state/action/change/reason” panels. Include a concise comparison/check that asks which bus answers “where?”, “what value?” and “what request?”. Allow reset and language switching without losing the selected mode/stage unless the established site behaviour makes it preferable to reset explicitly.

## Learner copy and bilingual parity

English and Simplified Chinese have equal authored explanations, prompts, answer feedback, diagram labels, controls and accessible names. Keep wording short, direct and suitable for a learner with no computing background. Introduce processor/CPU, memory, bus, address and contents in plain language or point back to earlier bites; expand CU on first use as “control unit / 控制单元”. Do not address the parent in learner-facing UI.

## Acceptance criteria

- The diagram names CPU, memory, I/O ports and address/data/control paths and makes the system-bus grouping apparent.
- The read walkthrough ends with the receiver updated to 42 while memory remains `11 → 42`.
- The write walkthrough ends with memory `12 → 6` while address 12 and other locations remain unchanged.
- Every computer action is distinguishable from a learner prediction and from navigation.
- The CU’s role is concrete, and control direction is not oversimplified into one direction for every signal.
- A fresh learner can correctly match where/value/request to address/data/control respectively.
- Keyboard use, visible focus, semantic accessible names, reduced-motion behaviour, mobile layout and selectable text are preserved.
- Language changes retain a coherent current example and no key instruction is English-only.
- No excluded implementation details leak into the learner experience.
- Focused automated tests cover step order, read/write state effects, resets and bilingual rendering, followed by a browser walkthrough.

## Future reuse

The bus visualization and event vocabulary may later be reused by the processor simulator or adapted into a Remotion video. Bite 4 remains understandable without either. Keep authored content and transfer examples separate from presentation so later processor-backed events can replace the illustrative example without redesigning the teaching concepts.
