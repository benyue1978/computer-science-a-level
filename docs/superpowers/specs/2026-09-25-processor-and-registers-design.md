# Bite 2 — Processor and registers

**Status:** Proposal for discussion; not approved for implementation.
**Date:** 25 September 2026
**Place in programme:** Foundations Bite 2, contributing prerequisites to L5–7. This is not completion of those full syllabus lessons.

## Purpose

Build a clear picture of the relationship between the processor, main memory and registers. The learner can identify each and explain that a register holds a value inside the processor. Do not begin executing instructions or teaching data transfers yet.

The preceding memory activity is implemented and its revised presentation has been approved by the owner. An actual child learning trial has not been recorded; that remains separate from approval of the website.

## Prerequisites and new vocabulary

Assume only the preceding idea: an address identifies a memory location, and its contents are the value stored there. Begin with a short optional recall question about address 11 containing 42; a mistaken answer offers a link to the memory activity, not a locked progression gate.

Introduce processor / 处理器, register / 寄存器, and the more specific label main memory / 主存储器 for the memory shown in the first activity. Define instruction in plain language as a direction for the processor to carry out. CPU may appear once as another name for the processor, not an additional component or memorisation task.

Do not assume binary, arithmetic, assembly, buses, fetch, RTN, ALU, CU, clock or named-register roles. Small familiar values require only number recognition.

## Approach and alternatives

**Recommended: a progressively revealed component diagram.** Keep the familiar main-memory cells visible, add the processor alongside, then reveal registers inside the processor boundary. New visual detail introduces one idea at a time. This teaches ownership and role without inventing a machine execution.

An animated calculation could make the processor's work concrete, but would also require explaining where operands came from and where the result goes. Defer that until copying and processing have been introduced.

A full processor diagram with PC, MAR, MDR and CIR would resemble an exam diagram but overload this bite. Their names and individual purposes belong in Bite 6.

## Four short sections

### 1. Main memory and the processor

Retain the familiar cells (10 → 7, 11 → 42, 12 → 9). Identify this as main memory. Add a separate box labelled Processor / 处理器, with both inside a light Computer / 计算机 boundary. Do not draw a bus or unexplained transfer arrow. State that this diagram shows only the parts being introduced, not every part of a computer.

**Explanation:** “Data is information, such as a number. Main memory stores data and instructions. The processor carries out instructions to process information. An instruction is a direction for the processor to follow.” / “数据就是信息，例如一个数字。主存储器保存数据和指令。处理器执行指令，处理信息。指令就是让处理器完成某件事的要求。”

The visible numeric cells are examples of stored data; do not label 7 or 42 as executable instructions or suggest memory stores only numbers.

**Try it:** identify the processor, then identify main memory. Choosing an answer highlights the answer only. No memory read or machine event occurs.

### 2. Inside the processor

The learner selects “Look inside the processor” / “看看处理器内部”. Reveal two small storage boxes inside the processor boundary while leaving main memory outside that boundary. Label each as a register. The reveal changes the diagram's detail; it does not start a computer operation.

**Explanation:** “A register is a small, fast storage location inside the processor. It temporarily holds information the processor uses.” / “寄存器是处理器内部一个容量小、速度快的存储位置，用来暂时保存处理器使用的信息。”

Show only registers at this disclosure level; make clear the processor contains other parts that later lessons introduce. Do not suggest registers alone perform calculations, or that they are the processor's only components.

**Try it:** “Are registers inside the processor or in the separate main-memory area?” / “寄存器在处理器内部，还是在旁边的主存储器区域？”

### 3. A register has contents too

Show one generic register labelled Register A / 寄存器 A with the value 7 inside. Its label and value are separately visible, reusing the location/content distinction. A second register may hold 42. These are preset contents, not a claim that a read or copy has occurred.

**Explanation:** “This register currently contains 7. Its label identifies the register; 7 is its contents.” / “这个寄存器现在存着 7。标签用来标识寄存器，7 是它的内容。”

A and B are illustrative labels, not additions to the PL24 instruction set. Do not teach that registers inherently have alphabetic labels while main memory inherently has numeric labels; the enclosing component and role establish the distinction. No bit widths, address capacity or actual machine register set appears.

**Try it:** select the contents of Register A, then identify which shown storage location is inside the processor. Do not change any values or draw transfer arrows; copying is Bite 3.

### 4. Recognise the relationship in a fresh diagram

Change the layout (processor on the opposite side) and preset values (for example 9 and 3). Preserve explicit component boundaries and labels. Ask the learner to identify a register, explain where it is, and distinguish the role of the processor from main memory.

Keep all answers learner-controlled and provide supportive explanations after responses. Related answers must not disclose an unanswered question's solution: collect the related responses before revealing the explanation. No score, timing or mastery claim.

Final takeaway: both main memory and registers store information; registers are inside the processor. The processor executes instructions. Avoid the false shortcut “memory stores, the processor never stores”.

## Presentation contract

Follow programme §1.2: separate explanation, learner task and represented computation.

- Concept text describes components and their roles.
- “Try it” / “试一试” introduces a question or learner instruction.
- “Look inside” changes the view only. Selection and highlighting are answer feedback.
- “Next section” / “下一小节” moves through the lesson, never advances processor execution.
- This bite has no represented computation, so it needs no state/action/change/reason panels and no simulator controls.
- No parent references on the learner page. Any facilitator notes remain in documents.
- Equal English/Mandarin content; switching language preserves section, disclosure and answers. Keyboard selection, visible focus, reduced motion and mobile layout remain supported.

## Proposed app boundary

Add `/learn/processor-registers` and a second real lesson entry on the home page. Reuse the visual style, language controls and learner-task conventions. Keep lesson data separate from presentation. If implementation proceeds, extract the shared site shell/navigation from the current app only as needed to host two independent activities; do not build a general lesson framework.

Use authored component data, not the PL24 engine. A local view/answer state is sufficient. Reset restores initial disclosure and answers while retaining language. No Remotion dependency, backend, progress database or deployment is required for this bite.

## Acceptance and later bridge

- A learner identifies processor, main memory and registers even when the diagram layout changes.
- The learner says a register is a storage location inside the processor, not a main-memory address or a component alongside the processor.
- The learner distinguishes the register label from its contents.
- No reveal, answer selection or navigation is described as computer execution.
- The diagram does not imply registers compute, the processor cannot store information, or every processor has exactly two registers.
- Language changes preserve the current learning interaction; reset and keyboard interaction work.

Bite 3 then asks: “What changes when a value is copied?” It introduces a represented transfer with an explicit source and destination. That is the first place to show a value arriving at a register, while the source remains unchanged. No copying animation is required to complete Bite 2.

## Basis

This proposal follows the approved Foundations Before RTN sequence and programme §1.2, including the owner's feedback on separating learner interaction from computer behaviour. Local source notes `outputs/processor-fundamentals/01-architecture-and-registers.md` and `02-components-and-buses.md` supply the register and component background; their detailed register tables are deliberately deferred and their known limitations remain covered by the programme specification. This proposal does not add syllabus claims beyond the existing research.
