# Processor Fundamentals Learning Programme — Design Specification

**Date:** 24 September 2026\
**Target qualification:** Cambridge International AS & A Level Computer Science 9618\
**Target exam year:** AS in 2027, with a later A Level extension\
**Primary learner:** A student with no prior Computer Science knowledge\
**Teaching context:** Parent-guided, with English and Mandarin given equal authored support

## 1. Purpose

This project will teach the complete processor-related content needed for Cambridge 9618 through a coordinated hybrid programme:

1. Short bilingual videos produced with Remotion.
2. One browser-based **Processor Lab** containing a canonical teaching processor and several focused simulators or conceptual labs.
3. Parent-guided lesson cards with prediction questions, hint ladders, expected reasoning and misconception guidance.
4. Exam-transfer tasks that require the learner to recall, trace, calculate, apply and explain without relying on the animation.

The programme covers all of AS section 4, supplies the prerequisites needed by a complete beginner, and adds a separate later extension for A Level section 15.1.

The design uses one coherent processor model wherever topics genuinely share machine state. Topics such as ports, performance, pipelining, parallel architectures and virtual machines use specialised models inside the same application rather than being forced into the small instruction engine.

## 2. Outcomes and success criteria

The learner should be able to:

- name processor components and explain their roles using Cambridge terminology;
- reconstruct the fetch sequence using register-transfer notation (RTN);
- predict and explain changes to registers, memory, buses, I/O and control flow;
- trace individual instructions and complete assembly programs;
- distinguish literal values, addresses and the contents of addresses;
- apply immediate, direct, indirect, indexed and relative addressing;
- explain and apply the two-pass assembler process;
- perform logical, arithmetic and cyclic shifts;
- use AND, OR and XOR masks to test and set device bits;
- explain interrupt detection and handling in the fetch–execute cycle;
- answer relevant Cambridge command words in English;
- later extend the AS mental model to RISC/CISC, pipelining, Flynn architectures, massively parallel computers and virtual machines.

A lesson is recorded as learned only when the learner can:

1. Commit to a prediction before the outcome is revealed.
2. Complete an altered simulator scenario without hints.
3. Produce an exam-style answer that covers the required marking points.
4. Retrieve the idea again in a later lesson.

Watching a video alone is not evidence of learning.

## 3. Scope

### 3.1 Included

- Four prerequisite lessons needed by a zero-knowledge learner.
- Cambridge 9618 AS sections 4.1, 4.2 and 4.3.
- A later extension for A Level section 15.1.
- Thirty-four lesson packages and thirty-four short video assets.
- A canonical processor engine, focused views, conceptual labs, parent guidance and exam-transfer checks.
- English, Mandarin and dual-language display modes.
- Local progress evidence and replayable simulator traces.

### 3.2 Excluded

- The rest of the 9618 syllabus outside processor-related prerequisites and section 15.1.
- Cycle-accurate emulation of a commercial processor.
- Presenting a model-specific opcode encoding as a Cambridge fact.
- A copied or redistributed past-paper question bank.
- Fully automatic grading of unrestricted written explanations.
- User accounts, cloud synchronisation, classroom administration and social features.
- Simultaneous English and Mandarin narration.

## 4. Research basis

### 4.1 Cambridge assessment structure

For 2027, AS candidates take Paper 1 and Paper 2. Paper 1 is a 75-mark, 1 hour 30 minute written paper covering syllabus sections 1–8. It contributes 50% of AS and 25% of the full A Level. Calculators are not permitted.

Processor Fundamentals is section 4 of Paper 1:

- 4.1 Central Processing Unit Architecture
- 4.2 Assembly Language
- 4.3 Bit manipulation

A Level section 15.1 later covers processors, parallel processing and virtual machines. Cambridge states that the 2027–2029 update contains no significant teaching changes, so recent papers remain useful evidence of question style while the 2027 syllabus remains the authority for coverage.

### 4.2 Observed assessment demands

Published papers show that learners must do more than recall definitions:

- The October/November 2023 Paper 13 asks candidates to identify Von Neumann components, distinguish register types, complete fetch RTN and reconstruct interrupt handling.
- The October/November 2022 Paper 12 asks candidates to trace a branching assembly program, execute bit operations and write fetch RTN.
- The June 2024 Paper 11 asks candidates to calculate final accumulator values for several addressing modes and bitwise operations.
- The June 2024 examiner report identifies a recurring error: treating an operand as a literal when it denotes the contents of a memory location.
- Recent questions continue to combine misconception correction, component explanation, RTN, interrupt handling, addressing calculations and shifts.

The product must therefore make state transitions inspectable and require the learner to predict them.

The 2027–2029 syllabus names register-transfer notation only in section 4.1, where candidates must “describe and use” it to describe the Fetch–Execute cycle. RTN is therefore a local prerequisite for learning the cycle rather than a separate syllabus topic. The programme must nevertheless teach the notation explicitly before asking the learner to recall the four fetch transfers.

### 4.3 Learning-design evidence

The lesson design applies four research-supported ideas:

- **Pre-training:** introduce names and basic roles before presenting a complex process.
- **Segmenting:** present animation in short learner-paced sections.
- **Worked-example fading:** move from a complete demonstration to a partially completed task and then independent work.
- **Retrieval and explanation:** require prediction, self-explanation, parent discussion and delayed recall.

The default lesson pattern is:

> worked example → parent-guided prediction → altered independent scenario → exam transfer → delayed retrieval

## 5. Source hierarchy and accuracy policy

Every substantive content item must have one of four provenance labels:

| Label | Meaning | Product treatment |
|---|---|---|
| Syllabus requirement | Explicitly required by the 2027–2029 syllabus | Taught and assessed as core |
| Exam model | Evidenced by an official paper, mark scheme or examiner report | Uses Cambridge terminology and expected sequence |
| Simulator convention | A precise choice required to make an underspecified model executable | Disclosed where it affects interpretation |
| Enrichment | Useful detail beyond the assessed requirement | Visually separated from core recall |

When sources disagree, the product must not silently choose one account and present it as universal.

### 5.1 Known tensions

- Section 4.1 lists ACC among special-purpose registers, while section 4.2 describes the Accumulator as the one general-purpose register available in questions. Lessons will explain this context dependence and train the learner to follow the wording of the question.
- The supplied notes do not resolve the PC reference point for relative addressing. The simulator convention will be stated explicitly.
- The prose and RTN descriptions place PC increment at different apparent points. The animation will use the four-row Cambridge RTN sequence while explaining that independent micro-operations may be scheduled without changing its meaning.
- The notes simplify performance by implying proportional benefits from clock speed and core count. Lessons will use “all else equal,” workload and bottleneck reasoning.
- The notes do not define interrupt stack layout, the precise saved-register set or a return instruction. The simulator uses the companion architecture’s fixed controller-frame layout and an explicit monitor return control, both labelled as teaching conventions.
- The notes describe arithmetic right shift but do not fully define arithmetic left or cyclic shifts. The programme will use standard fixed-width definitions and distinguish the assessed rule from enrichment detail.

## 6. Existing Markdown source assessment

The files under `outputs/processor-fundamentals/` provide a useful transcription of the supplied summary notes:

- `01-architecture-and-registers.md`
- `02-components-and-buses.md`
- `03-performance-and-peripheral-ports.md`
- `04-fetch-execute-and-register-transfer-notation.md`
- `05-interrupts.md`
- `06-assembler-and-instruction-groups.md`
- `07-addressing-modes-and-shifts.md`
- `08-continuation-msb-lsb-and-bit-masking.md`
- `README.md`

They cover the broad syllabus headings but are not an executable specification. The programme must supplement or correct the following gaps:

- the relationship between assembly language and machine code;
- application of both assembler passes to a concrete program;
- complete instruction semantics and program tracing;
- full treatment of arithmetic and cyclic shifts;
- exam-style distinction between literal, address and memory contents;
- explicit RTN literacy: destination and source, copy semantics, brackets, double dereferencing, arithmetic expressions and sequential state changes;
- precise, disclosed conventions for PC-relative addressing and interrupts;
- qualified performance explanations;
- a clear separation between Cambridge requirements and useful enrichment.

## 7. Curriculum

Each row below is one guided learning bite. Concept videos normally last 3–6 minutes. Practice and challenge briefings normally last 1–3 minutes.

| # | Level | Lesson and outcome | Video asset | Processor Lab activity | Exam transfer |
|---:|---|---|---|---|---|
| 1 | Bridge | A computer changes state: distinguish input, processing, output and storage | V01 State Journey | Arrange a tiny input-to-output path | Describe the path in order |
| 2 | Bridge | Bits are representations: read binary place values and relate binary, denary and hex | V02 Number Lenses | Toggle bits and compare representations | Calculate a changed value |
| 3 | Bridge | Address versus contents: distinguish a location from the stored value | V03 Memory Street | Follow one-hop and two-hop lookups | Complete an address/data table |
| 4 | Bridge | Instructions change state: identify opcode, operand and before/after state | V04 State Changer | Predict which fields one instruction can alter | Identify opcode and operand |
| 5 | AS 4.1 | Explain the Von Neumann model and stored-program concept | V05 One Memory, Two Meanings | Place instructions and data in unified memory | Explain stored program |
| 6 | AS 4.1 | Explain ALU, CU, IAS and system clock roles | V06 Inside the CPU | Match actions to components | Describe component roles |
| 7 | AS 4.1 | Coordinate PC, MAR, MDR and CIR | V07 Fetch Register Relay | Move one instruction through the registers | Correct register misconceptions |
| 8 | AS 4.1 | Explain ACC, IX and Status Register, including classification context | V08 Working Registers | Inspect arithmetic, indexing and flags | Identify registers and roles |
| 9 | AS 4.1 | Explain address, data and control buses and clock timing | V09 Roads and Signals | Route values and control signals | Complete bus table |
| 10 | AS 4.1 | Read RTN, explain its state changes and reconstruct the four fetch operations | V10 Reading RTN and the Four Fetch Transfers | Decode each notation form, then micro-step the fetch | Translate RTN, calculate state and write the fetch RTN |
| 11 | AS 4.1 | Connect decode, execute and repeated cycles | V11 Decode, Execute, Repeat | Run one complete instruction cycle | Describe the cycle |
| 12 | AS 4.1 | Reason about processor type/cores, bus width, clock and cache | V12 Finding the Bottleneck | Compare controlled workload scenarios | Explain one performance effect |
| 13 | AS 4.1 | Compare USB, HDMI and VGA | V13 Ports Carry Signals | Route peripheral scenarios | Compare connection methods |
| 14 | AS 4.1 | Explain interrupt cause, detection, priority, ISR and resume | V14 An Urgent Event | Trigger and service interrupts | Order and explain handling |
| 15 | AS 4.2 | Explain assembly/machine-code relationship, syntax and instruction groups | V15 Speaking to the Processor | Classify instructions and inspect encoding boundary | Identify groups and relationship |
| 16 | AS 4.2 | Apply immediate/direct addressing and data movement | V16 Value or Address? | Execute LDM, LDD, LDR, MOV and STO | Calculate final state |
| 17 | AS 4.2 | Apply indirect, indexed and relative addressing | V17 Three Address Journeys | Follow pointer, base-plus-index and PC-offset paths | Name mode and effective address |
| 18 | AS 4.2 | Execute arithmetic and I/O instructions | V18 Calculate and Communicate | Execute ADD, SUB, INC, DEC, IN and OUT | Trace ACC, IX and output |
| 19 | AS 4.2 | Apply compare and control-flow instructions | V19 Choosing the Next Instruction | Execute CMP, CMI, JMP, JPE, JPN and END | Predict next PC |
| 20 | AS 4.2 | Predict a single instruction from varied initial states | V20 One Instruction Clinic | Randomised instruction cases | Complete before/after state |
| 21 | AS 4.2 | Trace straight-line, branching and looping programs | V21 Trace Without Guessing | Fill a trace table from event history | Complete an unseen trace |
| 22 | AS 4.2 | Apply assembler pass 1 | V22 Build the Symbol Table | Assign addresses, validate opcodes and record labels | Complete a symbol table |
| 23 | AS 4.2 | Apply assembler pass 2 | V23 Resolve and Load | Resolve labels and explain translation to machine code | Complete substitutions |
| 24 | AS 4.3 | Explain MSB, LSB and signed context | V24 Ends of a Bit Pattern | Inspect place and sign interpretations | Identify significant bits |
| 25 | AS 4.3 | Perform logical left and right shifts | V25 Shift and Lose | Animate entering and discarded bits | Show resulting pattern |
| 26 | AS 4.3 | Perform arithmetic and cyclic shifts | V26 Preserve or Wrap | Compare fixed-width shift types | Show and explain a shift |
| 27 | AS 4.3 | Apply AND, OR and XOR bit by bit | V27 Three Bitwise Tools | Execute literal and memory operands | Calculate final ACC |
| 28 | AS 4.3 | Use masks to test and set device flags; distinguish enrichment operations | V28 Device Flags | Read and change simulated device bits | Construct a mask |
| 29 | AS integration | Combine input, fetch, masking, branch, memory, output and interrupt concepts | V29 Machine Mission | Complete a guided then unseen integrated program | Mixed processor question |
| 30 | A Level 15.1 | Compare RISC and CISC and relate them to interrupt handling | V30 Two Instruction Philosophies | Compare controlled processor profiles | Compare and explain |
| 31 | A Level 15.1 | Explain pipelining and register use | V31 Assembly Line | Animate overlap, stalls and interrupt disruption | Explain throughput and complication |
| 32 | A Level 15.1 | Classify SISD, SIMD, MISD and MIMD | V32 Instructions × Data | Change stream counts and classify | Identify architecture |
| 33 | A Level 15.1 | Explain massively parallel computer characteristics | V33 Many Processors | Explore task division and communication cost | Explain suitability |
| 34 | A Level 15.1 | Explain virtual-machine roles, benefits and limitations | V34 A Computer Within a Computer | Compare host/guest scenarios | Evaluate a VM scenario |

### 7.1 RTN prerequisite placement

RTN will be taught as the opening segment of Lesson 10, immediately before it is applied to the fetch sequence. It will not be placed in the Bridge unit because its symbols refer to registers and memory transfers that the learner has not yet encountered there. Its prerequisite chain is explicit:

- Lesson 2 supplies binary values and the idea of incrementing a stored numeric value.
- Lesson 3 supplies the distinction between a memory address and the value stored at that address, including one-hop and two-hop lookup.
- Lesson 4 supplies the idea that an operation changes a before-state into an after-state.
- Lesson 5 supplies the stored-program model in which instructions and data occupy the IAS.
- Lesson 6 supplies the roles of the CU, IAS and clock in coordinating the transfer sequence.
- Lesson 7 supplies the roles and contents of PC, MAR, MDR and CIR.
- Lesson 9 supplies the physical transfer paths and control signals that RTN abbreviates.

Lesson 10 has two short chapters. The first teaches RTN as a small language for describing state changes. The second applies that language to the four Cambridge fetch transfers. Before the fetch sequence becomes a recall task, the learner must complete without hints a five-part RTN-reading gate covering transfer direction and copy semantics, `[R]`, `[[R]]`, `[R] + 1`, and an ordered two-line state trace. Every part must be correct; an incorrect answer returns the learner to the relevant worked example before a changed gate attempt. This keeps the foundation close to its assessed use while ensuring it is taught rather than assumed.

## 8. Product architecture

### 8.1 Units and boundaries

| Unit | Responsibility | Inputs | Outputs | Must not own |
|---|---|---|---|---|
| Curriculum manifest | Orders lessons and maps each outcome to syllabus coverage | Lesson metadata | Navigation, coverage matrix | Simulation rules |
| Lesson package | Canonical content for one bite | Source-backed bilingual content and scenario references | Video, parent guide and assessment specifications | Rendering or execution |
| Processor engine | Applies deterministic machine transitions | Machine state and commands | New state and typed events | UI, translations or scoring |
| Scenario loader | Creates a reproducible initial state and allowed controls | Scenario manifest | Validated engine state and view configuration | Instruction semantics |
| Instruction codec | Encodes assembly fields and validates/decodes raw PL24 words | Legal instruction fields or 24-bit word | Encoded word, decoded fields or diagnostic | Machine state, source annotations or rendering |
| Bit exercise model | Applies width-specific operations for exam examples | W-bit exercise state and operation | New exercise state and trace | Canonical processor registers or fetch cycle |
| Assembler | Parses source and exposes two passes | Source and model encoding table | Diagnostics, symbol table and object program | UI animation |
| Event timeline | Stores ordered machine events and checkpoints | Engine events | Replay, undo and trace-table data | Mutation rules |
| Architecture adapter | Build/validate scenarios and project execution into teaching frames | Architecture profile, lesson contract, state and transitions | Loaded scenario and truthful semantic frames | Instruction execution rules |
| Visual views | Render teaching frames for a teaching purpose | Semantic frames and lesson disclosure level | Architecture, register, memory, bus and trace displays | Core state mutation or binary decoding |
| Concept labs | Model performance, ports and A Level topics that do not share core state | Lab-specific configuration | Comparative visual events | Canonical instruction execution |
| Media renderer | Renders videos from scene and language manifests | Lesson content, narration and timing | English/Mandarin videos and captions | Curriculum decisions |
| Assessment layer | Presents and checks constrained responses | Question, learner response and marking points | Feedback and evidence | Free-form grading claims |
| Parent guide | Presents facilitation prompts | Lesson package and learner evidence | Ask/hint/check cards | Hidden machine rules |
| Local progress store | Saves evidence and preferences on the device | Completion evidence and settings | Resume state and review schedule | Accounts or cloud sync |

### 8.2 Data flow

1. The curriculum selects a lesson package.
2. The learner watches the chosen language edition or relevant chapter.
3. The parent receives a prediction prompt.
4. The scenario loader creates a deterministic machine or concept-lab state.
5. Learner actions become commands to the engine.
6. The engine produces typed events and a new state; the adapter projects complete transitions into teaching frames.
7. Views and media render those frames without altering them.
8. The assessment layer presents an altered transfer task.
9. Completion evidence schedules later retrieval.

### 8.3 Teaching interface and replaceable architecture

Architecture conventions belong in the engineering specifications and developer diagnostics, not in learner-facing lessons. This policy applies to Lesson, Parent, Exam and learner Sandbox modes, and to videos, captions and parent cards. The processor architecture stays precisely defined internally.

The default teaching interface displays register names and values, memory addresses and contents, decoded instructions, transfers and the next instruction. It does not display the name PL24-v1, physical register/bus widths, addressable capacity, opcode numbers, packed status-bit positions, controller-frame layout or byte-versus-word addressing. Numeric values normally use unpadded decimal; CIR is displayed as the instruction decoded from its actual bits. MDR may show the decoded instruction during fetch and the numeric value during a data read, without assigning a hidden type to RAM.

Hide implementation choices, not the concepts being taught. Lessons still teach opcode/operand, binary machine code, register roles, memory addresses, RTN and the two assembler passes. Encoding explanations use a conceptual opcode/operand diagram and describe symbol resolution and translation; they do not teach our 5/3/16 allocation or numeric opcode table. Any concrete binary encoding exercise supplies its own explicitly stated illustrative code table, separate from executable processor memory. Bit questions state their exercise width, such as 8 bits. Lessons about bus width use hypothetical stated widths. These are exercise facts, not disclosures of the implementation. Never display a truncated machine value as if it were the whole register.

The implementation boundary is:

1. **Lesson content:** outcomes, assembly/symbolic programs, scenario data, prediction/answer contracts and semantic animation cues. No packed instructions, raw field offsets, architecture names or byte strides in authored lesson text.
2. **Scenario builder and architecture adapter:** resolve labels, assemble/load through a selected architecture profile, validate lesson assumptions and project machine transitions into teaching frames.
3. **Processor engine:** owns binary words, decoder, widths, physical addresses and all actual execution rules.
4. **Teaching frames:** stable register identifiers, typed values (number, address or decoded instruction), memory rows, named actions (copy address, advance PC, read memory, decode, execute, save/restore context), before/after values and assessment evidence. Frames reference their underlying transition IDs. UI, Remotion and assessment consume these frames; they do not decode bits or calculate addresses independently.

An adapter may group multiple engine micro-steps into one teaching step, preserving order and truthful before/after values. It cannot fabricate values, renumber an address on screen without updating every related reference, or change arithmetic results. Detailed raw event logs and architecture configuration are developer tools only. Learner Sandbox remains an assembly-and-values playground; raw word editing is a developer diagnostic capability.

Each scenario has an internal binding with architecture version and explicit assumptions: required instruction forms, value range, required PC progression, any fixed addresses, and any word-width-dependent outcomes. Literal exam-style address tables and Cambridge's `PC ← [PC] + 1` remain valid lesson content. They are contracts the selected profile must satisfy, not universal properties inferred by the UI. Ordinary labels can be relocated by the builder, with expected addresses derived from its resolved map; fixed question addresses cannot be silently relocated.

Changing the engine or encoding should require changes to the architecture profile/adapter and generated scenario bindings, not the renderer or conceptual narration. A width/addressing change may still affect semantics: every affected scenario must be revalidated, and an incompatible scenario stays pinned to its previous supported profile or fails validation until deliberately revised. For example, a byte-addressed backend advancing PC by three cannot be substituted for a lesson displaying the four-line Cambridge +1 sequence. No guarantee of automatic compatibility across arbitrary architecture changes is made. Old raw binaries and replay logs remain bound to their original profile; source-based scenarios may be rebuilt only after their answer and teaching-frame checks pass.

Acceptance requires that normal teaching screens and rendered lessons contain no PL24 field layout or architectural width labels; existing teaching-frame fixtures still render without raw engine imports; encoding changes that preserve semantics preserve lesson answers; and an incompatible PC stride or width-sensitive example is rejected rather than silently shown incorrectly.

## 9. Lesson-package contract

Every lesson package contains:

- stable lesson ID, phase and prerequisites;
- syllabus objectives and provenance labels;
- English and Mandarin title, explanation, terminology and parent prompts;
- paired technical terms and approved abbreviations;
- misconception list and corrective explanation;
- video scene sequence and language-specific narration timing;
- pause points and prediction prompts;
- scenario ID, initial state, allowed controls and expected event invariants;
- worked example, partially completed task and independent variant;
- exam command word, marking points and model response;
- delayed-retrieval prompts;
- accessibility description for meaningful visuals.

Content changes must be made in the canonical package so the video, simulator, guide and exam check stay aligned.

## 10. Video system

### 10.1 Production model

Remotion renders videos from reusable scene families:

- system-map reveal;
- value travelling between components;
- before/after state comparison;
- process timeline;
- side-by-side comparison;
- per-bit transformation;
- worked trace;
- challenge briefing.

All videos use the same component geometry, colours, icons and motion grammar as Processor Lab. Colour is reinforced by labels, shapes and motion direction.

### 10.2 Bilingual output

Each video has two equally maintained editions:

- English narration with selectable English and Mandarin subtitles;
- Mandarin narration with selectable Mandarin and English subtitles.

Technical labels remain paired, for example:

> Program Counter (PC)\
> 程序计数器

Language editions share the same conceptual scene graph but may use different timing manifests. They are not forced into identical audio duration.

Videos provide captions, transcripts, pause/rewind and playback speed. Decorative audio must never carry meaning.

## 11. Canonical processor model

### 11.1 Fixed architecture and state

`PL24-v1` is our project-specific teaching architecture, not a Cambridge standard. Cambridge supplies the instruction meanings and component roles; Processor Lab supplies the binary format, widths, flags, timing and interrupt-controller conventions. Its normative machine contract is [PL24-v1 processor architecture](2026-09-24-pl24-v1-processor-architecture.md). That companion document owns encoding legality, execution micro-steps, numeric edge cases and controller state. This programme document owns curriculum and lesson behaviour; a change to either must keep both consistent.

The canonical processor has one fixed configuration:

| Component | Width and purpose |
|---|---|
| PC, MAR | 16-bit word addresses, 0–65,535 |
| ACC, IX | 24-bit data registers |
| MDR, CIR | 24-bit raw words; CIR is decoded from its bits |
| Status Register | 8 bits: Z at bit 0, N at 1, C at 2, V at 3, I at 4, E at 5, Q at 6; bit 7 reserved zero |
| Unified memory | 65,536 addressable 24-bit words, initially zero |
| Address bus, data bus | 16 bits and 24 bits respectively |

ACC, IX and memory contain unsigned patterns from 0 to 16,777,215; a signed lens interprets those same bits as two’s complement from −8,388,608 to 8,388,607. Arithmetic wraps at 24 bits. PC increment wraps at 16 bits; calculated indexed, indirect and relative addresses outside the address range produce diagnostics rather than being silently truncated.

`Z` means zero, `N` is result bit 23, `C` is carry/no-borrow or the last shifted-out bit, and `V` is signed overflow. `I` reflects whether any interrupt is pending. `E` holds the latest equality comparison and `Q` says a comparison has occurred. `CMP`/`CMI` set E and Q while preserving ACC and Z/N/C/V. Other ordinary instructions, including jumps, preserve E/Q; a conditional jump with Q=0 is diagnosed. The comparison persists across intervening instructions; this policy is a disclosed simulator convention.

ADD/SUB/INC/DEC update Z/N/C/V. AND/OR/XOR update Z/N and clear C/V. Nonzero logical shifts update Z/N/C and clear V; zero shifts preserve all flags. Loads, stores, moves, I/O and branches preserve arithmetic flags. Interrupt-controller actions derive I from the pending queue. Bit positions and update policies are simulator conventions.

The remaining state consists of bus activity, internal execution latches, phase, educational clock count, instruction count, input/output queues, pending requests, interrupt-controller frames and run state. Every execution latch is checkpointed. Source labels and assembly annotations are separate debugger metadata; they cannot determine how an instruction executes.

Smaller word widths belong to the independent Bit Lab exercise model (section 13.2), not to alternate configurations of this processor. All processor scenarios use PL24-v1, including lessons that hide the binary encoding.

### 11.2 Fetch sequence

#### RTN grammar and teaching boundary

Before showing the complete fetch sequence, Lesson 10 must establish these rules:

- Read a transfer as `destination ← source expression`: evaluate the right-hand side, then copy that value into the destination on the left.
- The arrow means copying a value and replacing the destination's previous value. It does not mean mathematical equality, and it does not remove or clear the source.
- `[R]` means the current contents of register `R`; the brackets distinguish the register's stored value from its name.
- `[[R]]` means the contents of the memory location whose address is currently stored in register `R`. The visualisation must expose both lookup steps.
- An expression such as `[PC] + 1` uses the register's current value, performs the arithmetic, and stores the result in the destination.
- Multiple RTN lines are applied in the displayed order. Each completed line creates the state used by the next line.
- RTN describes internal transfers and state changes. It is not assembly language, machine code or an instruction fetched and executed by the processor.

The notation primer first asks the learner to translate single lines into plain language and visible before/after states. It then reverses the task from prose to notation and finally asks the learner to predict the result of a short sequence. Generic examples may be used for teaching the grammar, but they must be labelled as pedagogical examples. The four lines below are the assessed Cambridge application. Execution-stage RTN and interrupt RTN are outside the programme's core recall requirements.

The displayed Cambridge RTN sequence is:

```text
MAR ← [PC]
PC ← [PC] + 1
MDR ← [[MAR]]
CIR ← [MDR]
```

The detailed animation distinguishes:

1. PC-to-MAR as an internal register transfer.
2. PC incrementing to the next sequential address after MAR has retained the fetched address.
3. MAR placing the retained address on the address bus.
4. CU issuing a memory-read signal on the control bus.
5. Memory returning the word on the data bus into MDR.
6. MDR-to-CIR as an internal register transfer.

This adds technical clarity without changing the four assessed RTN operations.

The lesson must explicitly connect the notation back to its prerequisites: the brackets and double brackets reuse Lesson 3's address/content model; the register names reuse Lesson 7; and the transfers correspond to the bus and control activity introduced in Lesson 9. The PC increment ordering follows the displayed Cambridge sequence and retains the source-ordering note in section 5.1.

### 11.3 Step controls

- **Micro-step:** one transfer, control action or execution effect.
- **Instruction-step:** complete fetch and execute, perform the end-of-cycle interrupt check and, if an interrupt is accepted, stop after loading its ISR address into PC and before fetching the first ISR instruction.
- **Run:** continue until pause, breakpoint, input wait, END, error or safety limit.
- **Undo:** restore the previous event checkpoint.
- **Reset instruction:** restore the state immediately before the current instruction.
- **Reset scenario:** restore the declared initial state; when the progress layer observes this restoration, it clears evidence for the current attempt while retaining earlier completed attempts.

### 11.4 Instruction semantics

The instruction surface follows the 2027 syllabus example set:

| Instruction | Processor Lab effect |
|---|---|
| `LDM #n` | ACC becomes literal `n` |
| `LDD address` | ACC becomes `memory[address]` |
| `LDI address` | ACC becomes `memory[memory[address]]` |
| `LDX address` | ACC becomes `memory[address + IX]` |
| `LDR #n` | IX becomes literal `n` |
| `MOV IX` | IX becomes ACC |
| `STO address` | `memory[address]` becomes ACC |
| `ADD address` / `ADD #n/Bn/&n` | Add memory value or literal to ACC; wrap to 24 bits and update `Z`, `N`, `C`, `V` |
| `SUB address` / `SUB #n/Bn/&n` | Subtract memory value or literal from ACC; wrap to 24 bits and update `Z`, `N`, `C`, `V` |
| `INC ACC/IX` | Add one to the named register; wrap to 24 bits and update `Z`, `N`, `C`, `V` from that result |
| `DEC ACC/IX` | Subtract one from the named register; wrap to 24 bits and update `Z`, `N`, `C`, `V` from that result |
| `JMP address` | PC becomes the target address |
| `CMP address` / `CMP #n` | Set E to the equality result and Q to one; preserve ACC and Z/N/C/V |
| `CMI address` | Perform the same equality comparison with `memory[memory[address]]` |
| `JPE address` | Jump when Q=1 and E=1; preserve E/Q |
| `JPN address` | Jump when Q=1 and E=0; preserve E/Q |
| `IN` | Consume one 7-bit ASCII input character and place its value in ACC |
| `OUT` | Append the 7-bit ASCII character represented by ACC to output |
| `END` | Enter the halted state and return conceptual control to the OS |
| `AND`, `OR`, `XOR` | Apply the bitwise operation to ACC using a literal or memory operand; update `Z` and `N`, clear `C` and `V` |
| `LSL #n`, `LSR #n` | Shift the 24-bit ACC logically by `n`; for n>0 set C to the last discarded bit, update Z/N and clear V; n=0 preserves all flags |

Processor arithmetic applies the fixed 24-bit width internally. Developer diagnostics expose discarded bits and packed flags; learner views show numeric outcomes and relevant named flags only. Core lessons choose values that avoid processor overflow. Bit-loss and overflow teaching uses explicitly sized exercise scenarios, independent of the physical processor width.

`IN` rejects non-ASCII input and waits when the queue is empty. `OUT` emits a diagnostic and preserves state when ACC is outside 0–127.

Arithmetic and cyclic shifts are available in Bit Lab even though the syllabus example instruction table only names `LSL` and `LSR`. Bit Lab labels the distinction between a required shift concept and an available assembly opcode.

Bit Lab declares its own exercise width `W` from 4 to 32 bits and uses these normative fixed-width rules:

- Logical left discards bits from the left and introduces zeros on the right.
- Logical right discards bits from the right and introduces zeros on the left.
- Arithmetic right discards bits from the right and copies the original sign bit into vacated positions.
- Arithmetic left uses the same bit movement as logical left; signed overflow is reported when the mathematical signed result is not representable.
- Cyclic left and right are rotations without a carry bit: every displaced bit re-enters at the opposite end.
- A multi-place shift repeats the one-place rule. Logical shifts by `n >= W` produce zero; arithmetic right by `n >= W` produces all sign bits; rotations use `n mod W`.
- `C` is the final bit discarded by a logical or arithmetic shift. Rotations do not use or change `C` in Bit Lab.
- A zero-place shift leaves the pattern and all displayed flags unchanged.
- For every positive-count shift/rotation, Z means the W-bit result is zero and N is its bit W−1. V is zero for logical shifts, arithmetic right and rotations; arithmetic left sets V iff the original signed value multiplied by 2^n is outside the W-bit signed range. AND/OR/XOR exercise operations set Z/N and clear C/V. The exercise model displays only Z/N/C/V, with initial flags zero. It has no processor E/Q/I fields.

### 11.5 Addressing conventions

- Immediate operands are values and use the Cambridge prefixes `#`, `B` and `&` where appropriate.
- Direct operands select one memory location.
- Indirect operands select a location that contains the effective address.
- Indexed effective address is base address plus IX.
- Relative effective address is next-instruction PC plus a signed offset in Processor Lab. The UI labels this reference point as the simulator convention.
- Symbolic addresses resolve through the assembler symbol table.

The syllabus example instruction set does not assign a relative form to an opcode. Processor Lab therefore defines an opt-in teaching extension, enabled only by scenarios that declare `relativeSyntax: true`:

```text
JMP +20
JMP -10
```

The signed denary offset has no `#` prefix. The target is the PC value after the current instruction has been fetched and incremented. Core exam checks assess the effective-address concept; they never imply that this extension syntax is prescribed by Cambridge.

### 11.6 Model-specific object encoding

The syllabus example table does not prescribe numeric opcode bit patterns. Processor Lab defines `PL24-v1` for every canonical processor scenario. The following layout is an internal engineering contract. Lessons 15 and 23 explain translation conceptually through section 8.3; they do not expose this layout:

```text
bits 23..19  opcode (5 bits)
bits 18..16  addressing mode (3 bits)
bits 15..0   operand/address (16 bits; zero when absent)
```

The encoding registry owns the stable opcode and addressing-mode code tables. It allocates one of the 32 opcode codes to each syllabus mnemonic and reserves the unused codes. Addressing codes distinguish none, immediate, direct, indirect, indexed, relative and register. Prefixes such as `#`, `B` and `&` affect source representation but encode the same numeric immediate mode. Register operands encode ACC as zero and IX as one.

`PL24-v1` assigns opcode codes in this fixed order:

| Code | Opcode | Code | Opcode | Code | Opcode |
|---:|---|---:|---|---:|---|
| 0 | LDM | 8 | SUB | 16 | IN |
| 1 | LDD | 9 | INC | 17 | OUT |
| 2 | LDI | 10 | DEC | 18 | END |
| 3 | LDX | 11 | JMP | 19 | AND |
| 4 | LDR | 12 | CMP | 20 | XOR |
| 5 | MOV | 13 | CMI | 21 | OR |
| 6 | STO | 14 | JPE | 22 | LSL |
| 7 | ADD | 15 | JPN | 23 | LSR |

Codes 24–31 are reserved. Addressing-mode codes are `0` none, `1` immediate, `2` direct, `3` indirect, `4` indexed, `5` relative, `6` register and `7` reserved. Data declarations are raw 24-bit words. Memory carries no executable instruction/data tag: the same bits can be read as data or decoded as an instruction when fetched.

All canonical scenarios use 24-bit words and 16-bit word addresses. Data declarations emit raw 24-bit patterns; signed declarations use two’s complement.

Field ranges are fixed:

- addresses and non-negative immediate values: 0–65,535, encoded unsigned in the operand field;
- relative offsets: −32,768–32,767, encoded as 16-bit two’s complement;
- register code: zero for ACC or one for IX;
- shift count: 0–65,535, with execution behaviour determined by the shift rules at width 24;
- data declarations in `PL24-v1`: unsigned 0–16,777,215 or signed −8,388,608–8,388,607.

Immediate values are zero-extended from the 16-bit operand field into the 24-bit data word. The source grammar does not accept negative immediate operands; negative values are permitted only in data declarations and relative offsets.

Structured processor scenarios must also supply encoded words or assembly that is encoded before loading. There is no execution path that bypasses the binary decoder. The legality table and rejection rules are in the companion architecture contract.

The encoding must:

- remain outside teaching UI and authored lesson content; identify its version in developer diagnostics and stored engine artifacts;
- provide the adapter with the current decoded mnemonic and operand for truthful display;
- never be required in an exam check;
- remain immutable once published; scenarios pin their architecture version, and later versions require explicit migration rather than silently reinterpreting old words.

### 11.7 Assembly source grammar and two-pass behaviour

Assembly source is line-oriented and case-insensitive for opcodes and labels.

```text
line        := [label ":"] [instruction | data] [comment]
label       := letter_or_underscore {letter_digit_or_underscore}
comment     := ";" {any_character}
data        := signed_denary | binary_literal | hexadecimal_literal
address     := unsigned_denary | label
relative    := "+" unsigned_denary | "-" unsigned_denary
```

Blank lines and comment-only lines allocate no memory. An instruction or data declaration allocates one consecutive address beginning at the scenario’s declared load address. The syllabus form `<label>: <data>` is accepted without an added data directive. A label-only line binds the next allocating line; consecutive label-only lines may name the same address. A trailing label without a following allocation is a pass-one error. Labels are case-insensitive and must not equal an opcode, ACC or IX, or match a binary literal token (`B` followed entirely by one or more binary digits). This prevents names such as B101 from being interpreted differently in immediate-or-address positions. These lexical restrictions are simulator conventions.

Operand forms are fixed:

- no operand: `IN`, `OUT`, `END`;
- register `IX`: `MOV`;
- register `ACC` or `IX`: `INC`, `DEC`;
- denary immediate only: `LDM`, `LDR`, `LSL`, `LSR`;
- address/label only: `LDD`, `LDI`, `LDX`, `STO`, `CMI`, `JPE`, `JPN`;
- address/label or denary immediate: `CMP`;
- address/label or denary, binary or hexadecimal immediate: `ADD`, `SUB`, `AND`, `OR`, `XOR`;
- address/label, or relative when enabled: `JMP`.

Denary immediates use `#`, binary immediates use `B` and hexadecimal immediates use `&`. Immediate values are non-negative and must fit the encoding’s 16-bit operand field. Addresses are unprefixed unsigned denary values or labels. Relative offsets are signed denary values within the 16-bit range. Whitespace can separate tokens but cannot occur inside a literal or label.

Pass 1 removes comments, parses each allocating line, validates opcode and operand shape, assigns its address and adds its label. Duplicate labels, malformed labels, unknown opcodes, missing/unexpected operands and address overflow are pass-one errors.

Pass 2 resolves symbolic addresses and encodes instructions or data. Undefined labels, values outside their field-specific ranges, addresses outside 0–65,535 and disabled relative syntax are pass-two errors. Negative data and relative values within their signed ranges encode as two’s complement. Any error prevents object-program loading; diagnostics preserve the source and the last valid machine state.

Successful pass-two output contains a load image of `{address, bits}` records plus a separate source map containing source line, declared instruction/data role, labels and original decoded display. The loader writes only bits to memory. The processor fetches bits into MDR/CIR and decodes CIR; source metadata cannot select an opcode. Stores and debugger edits invalidate stale annotations. The Assembler Workshop and videos use the teaching projection: resolved labels, addresses and decoded instructions, with conceptual explanations of binary output. The raw image is available only to developer diagnostics.

### 11.8 Command, event, checkpoint and scenario contracts

The processor engine accepts these command families:

- stepping: `MICRO_STEP`, `STEP_INSTRUCTION`, `RUN(maxInstructions)`, `PAUSE`;
- interaction: `PROVIDE_INPUT(character)`, `QUEUE_INTERRUPT(source, priority, isrDescriptor)`, `COMPLETE_ISR`;
- inspection control: `SET_BREAKPOINT(address)`, `CLEAR_BREAKPOINT(address)`;
- recovery: `UNDO_EVENT`, `RESET_INSTRUCTION`, `RESET_SCENARIO`;
- sandbox editing while paused: validated register, memory and program edits.

Every accepted command emits one or more immutable typed events. Required event kinds are:

- atomic machine transition and phase/run-state change;
- register read/write;
- memory read request/read/write;
- bus transfer and control signal;
- ALU operation and comparison;
- I/O read/write;
- interrupt queued/deferred/accepted;
- context saved/restored and ISR completed;
- breakpoint, checkpoint, state restored and diagnostic.

Every event includes an increasing sequence number, clock count, instruction instance ID, micro-step number, kind, reason, source/destination when applicable, before/after value when applicable, bus/control signal when applicable and provenance label. State is changed only by reducing this event stream.

Each sequencer micro-step or atomic controller/debugger action emits one state-changing MACHINE_TRANSITION event containing its complete state patch, including counters, latches and phase. Register/bus/memory detail events associated with that transition are informational and do not mutate state again. A result and its flags, retirement with interrupt acceptance, and return with immediate arbitration must each be indivisible transitions. STATE_RESTORED is also a single atomic state-changing event. A checkpoint exists after each such complete transition, never between its constituent register changes. An instruction checkpoint exists immediately before its first fetch transition; a scenario checkpoint is the validated initial state.

Recovery does not delete or rewind the immutable log. `UNDO_EVENT`, `RESET_INSTRUCTION` and `RESET_SCENARIO` append a `STATE_RESTORED` event containing the complete normalised machine state from the target checkpoint, the target checkpoint ID and the recovery reason. The reducer replaces current machine state with that payload and continues with later events. Sequence numbers remain strictly increasing, so reducing the complete log reproduces the recovered state and all subsequent actions. `UNDO_EVENT` targets the checkpoint immediately before the latest state-changing event, including a previous restoration; this permits a reset or undo to itself be undone. Diagnostics and other non-state events are skipped when selecting the target.

A scenario manifest contains:

- stable ID, lesson ID, title and provenance;
- model kind (`processor` or `bit-exercise`), load address and required architecture version for processor scenarios; exercise width for bit-exercise scenarios;
- initial registers including SR, raw memory image, input and output; comparison state is SR.E/Q, not a separate latch;
- entry PC, ISR definitions and pending interrupt definitions;
- interrupt policy, run limit and breakpoints;
- allowed commands, visible views and progressive-disclosure stages;
- `relativeSyntax` setting;
- expected event invariants and independent-task success predicate.

Processor-scenario validation rejects duplicate image addresses, out-of-range values, reserved SR bits, invalid architecture versions, invalid priorities, missing views and contradictory controls. Entry and ISR start addresses must name explicitly loaded, legally encoded words (a lesson-authoring check, not runtime instruction/data protection). Relative encodings require relativeSyntax=true for authored lessons; the decoder always recognises them in PL24-v1. ISR completion addresses need only fit the address range and may be outside the loaded image. Initial input must be ASCII. The loader derives I from pending requests; Q=0 requires E=0. Initial phase is before fetch, controller depth is zero and current priority is zero. Full-state replay uses checkpoint restoration rather than this initial-scenario format. Bit-exercise validation and state are separate from the processor loader.

## 12. Interrupt model

Interrupts are sampled at instruction retirement, after the current instruction’s effects have completed. A request arriving during fetch or execution is queued without interrupting a partial instruction. Halted, failed and input-waiting execution does not accept interrupts; a completed IN reaches the normal retirement boundary. This simplified waiting policy is disclosed.

The controller selects the highest-priority request strictly above the current priority, using FIFO order for ties. Priorities are integers 1–255; the base program has priority zero. Equal/lower-priority requests remain pending. On acceptance, the controller atomically removes the request, saves a frame, installs the ISR’s priority and start address, and starts before the ISR’s fetch. I is then derived from the remaining queue. A request may be queued while execution is paused.

Frames are a precisely defined controller-owned stack, outside ordinary RAM, rather than a partly specified software stack. Each frame contains eight 24-bit slots in the order PC, MAR, MDR, CIR, ACC, IX, SR, previous priority; narrower values are zero-extended. Maximum depth is 255. Entry preserves ACC/IX/Z/N/C/V, clears E/Q for the ISR, and uses fresh internal execution latches. The companion architecture contract defines return and diagnostics.

`COMPLETE_ISR` is a monitor control, not a Cambridge opcode. It is valid only at a before-fetch boundary while an ISR is active. A prepared ISR has a configured completion address; reaching it at that boundary pauses before fetching and exposes “Return from interrupt”. Run and instruction-step never return silently. END in an ISR is diagnosed; it cannot halt the interrupted main program. Thus every executing instruction still comes from raw memory, while the teaching monitor provides the return operation the syllabus does not specify.

Returning pops one frame and restores its registers and previous priority, derives I from the current pending queue, clears internal execution latches and resumes before fetch at the saved PC. Memory, I/O and elapsed counters are not rolled back. Interrupt arbitration runs again before fetching the resumed instruction. These rules support higher-priority nested interrupts and preserve the interrupted program’s comparison result.

This is a disclosed teaching controller, not a complete operating-system interrupt ABI. Its frame layout, priorities, return control and waiting policy are simulator conventions. Cambridge assessment concerns the cause, detection, prioritisation, context preservation, ISR and resumption concepts.

## 13. Processor Lab modes and views

### 13.1 Modes

- **Lesson Mode:** loads the lesson scenario and reveals controls and panels progressively.
- **Sandbox Mode:** exposes assembly execution and editable named registers/memory values through the teaching interface; raw encoding and architecture configuration remain developer-only.
- **Exam Mode:** hides hints and animation explanations, then presents constrained marking feedback.
- **Parent Mode:** shows the next prompt, expected reasoning, hint ladder, misconception and extension.

### 13.2 Core views

- Architecture Explorer
- Fetch–Execute Micro-stepper
- Instruction Playground
- Program Runner and trace-table view
- Assembler Workshop
- Interrupt Lab
- Bit Lab

The first six core views consume teaching frames projected from the same PL24-v1 state and event stream. Bit Lab has two explicitly labelled modes: “Processor value”, which inspects that same machine, and “Bit exercise”, which owns an independent 4–32-bit pattern, flags and optional literal/memory operands. Exercise mode shows its explicitly stated exercise width; processor mode shows the numeric value without a physical-width label. Eight-bit exam examples and sequences of bit operations use the exercise mode and its own trace; switching modes does not resize or mutate the processor. Arithmetic/cyclic exercise operations do not introduce new processor opcodes. Values can be copied explicitly between modes only when representable without changing their unsigned value; otherwise the learner is directed to reset/use the exercise independently. Developer tools may inspect truncation/extension as specified in the architecture contract. No implicit state synchronisation occurs.

### 13.3 Concept labs

- **Performance Lab:** compares controlled workloads and bottlenecks; it does not claim proportional improvement.
- **Ports Lab:** compares connection purpose, signal form and media carried; it is an explanatory model rather than an electrical simulation.
- **Processor Profiles Lab:** owns the RISC/CISC feature and interrupt-comparison model used by Lesson 30.
- **Pipeline Lab:** animates overlapping stages, throughput, stalls and interrupt disruption.
- **Parallel Architecture Lab:** varies instruction and data streams to illustrate SISD, SIMD, MISD and MIMD, then scales to massively parallel systems.
- **Virtual Machine Lab:** shows host, hypervisor, guest and shared resources with role, benefit and limitation scenarios.

Concept labs share navigation, bilingual content, evidence recording and visual design with the core views, but each owns a small independent model. The later A Level pipeline model may consume decoded PL24 examples, but owns stage occupancy and hazards independently; it does not claim to make the sequential processor pipelined. RISC/CISC, parallel architectures and virtual machines add teaching models without changing PL24-v1 binaries or register widths:

| Lab | State | Learner controls | Evidence emitted | Deterministic acceptance example |
|---|---|---|---|---|
| Performance | workload profile, clock, core count, bus width, cache-hit state and relative elapsed units | change one factor or workload | prediction, bottleneck selection and observed relative time | explain why doubling cores does not halve a mostly serial workload |
| Ports | peripheral needs, media type, signal type and candidate ports | choose USB/HDMI/VGA and rationale | choice and matched characteristics | select HDMI for digital audio/video and reject VGA’s lack of audio |
| Processor Profiles | instruction complexity, instruction count, pipeline suitability and interrupt context | classify features and compare profiles | feature classification and interrupt explanation | assign small/simple instructions and pipelining emphasis to RISC and explain a context consequence |
| Pipeline | stage occupancy, instruction queue, cycle and interrupt point | advance clock, insert instruction and trigger interrupt | stage timeline, throughput calculation and flush explanation | distinguish latency from throughput and identify disrupted in-flight work |
| Parallel Architecture | instruction streams, data streams, worker count and workload partition | change streams/workers and classify | architecture classification and suitability reason | classify one instruction over many data items as SIMD |
| Virtual Machine | host resources, hypervisor, guests, allocations and isolated faults | add guest, allocate resources and trigger guest fault | role mapping, resource consequence and benefit/limitation response | explain isolation while identifying shared-host overhead |

## 14. Parent-guided lesson format

Each parent card is bilingual and contains:

1. **Prepare:** the outcome, three essential terms and prerequisite check.
2. **Watch:** suggested language edition and exact pause points.
3. **Ask:** a prediction question before the simulator reveals the result.
4. **Coach:** two escalating hints, expected reasoning and a misconception warning.
5. **Check:** an altered independent task and an English exam-style response.
6. **Review:** a short prompt for the next lesson and later spaced retrieval.

The guide uses plain language and does not require the parent to know Computer Science in advance.

## 15. Assessment and progress evidence

### 15.1 Assessment types

- component identification and misconception correction;
- state prediction;
- RTN-to-prose and prose-to-RTN translation;
- resulting-state calculation from one or more RTN lines;
- RTN error diagnosis and fetch-sequence reconstruction;
- effective-address calculation;
- single-instruction execution;
- complete program trace;
- symbol-table and two-pass assembly task;
- bit-pattern transformation;
- sequence ordering;
- short command-word response.

### 15.2 Command-word support

The programme uses Cambridge meanings for `calculate`, `complete`, `describe`, `explain`, `identify`, `outline`, `predict`, `state` and `write`. Feedback distinguishes naming a fact from explaining how or why it matters.

### 15.3 Feedback

- Predictions remain committed until reveal; changing an answer creates a new attempt.
- Feedback first identifies the earliest divergent state or missing marking point.
- A hint explains the relationship without supplying the final response.
- Model answers appear only after submission.
- Chinese explanations support understanding, while the final exam response remains English.
- Free-form responses use self-checkable marking points; the product does not claim definitive automated marking.

### 15.4 Progress storage

Progress is stored locally by lesson and records:

- viewed language edition and position;
- prediction attempts;
- hint use;
- independent scenario result;
- marking points self-checked;
- retrieval due dates and outcomes.

### 15.5 Mastery states and retrieval schedule

Progress uses observable states:

- **Introduced:** the learner reaches every required pause point and completes the guided scenario.
- **Practised:** the learner completes the altered simulator task with the correct final state, with hints allowed.
- **Secure:** the learner completes the altered task without hints, then earns all marking points on a one- or two-mark check or at least 80% of marking points on a longer check, and passes one delayed retrieval at least 24 hours later without hints.
- **Needs review:** any later retrieval is below 80% or requires a hint.

Retrieval is scheduled for the next lesson, approximately 7 days later and approximately 21 days later. If calendar time is unavailable, the next eligible guided session is used. Every retrieval prompt changes values or surface context and is not identical to the worked example.

## 16. Error and recovery behaviour

| Condition | Required behaviour |
|---|---|
| Unknown opcode or invalid syntax | Highlight the source location, explain the expected form bilingually and preserve state |
| Invalid register or operand | Reject before execution and show the allowed form |
| Invalid calculated address | Pause before the failing micro-step and visualise the rejected address |
| Invalid encoded instruction | Pause before execution and explain that the current memory contents cannot be executed; raw CIR fields remain in developer diagnostics |
| Missing input | Enter a visible waiting-for-input state |
| Word overflow or shifted-out bits | In explicit-width exercises, animate discarded bits and update exercise flags; in processor Sandbox, show the actual numeric result and a range-limit message without exposing the physical layout |
| Excessive or infinite run | Pause at the scenario instruction limit; retain stepping and inspection |
| Interrupt below current priority | Leave it visibly queued |
| Missing media track | Offer the other narration edition, subtitles and transcript |
| Corrupt progress record | Preserve lesson content, reset only the invalid record and explain the recovery |

Every scenario supports event undo and full reset.

## 17. Accessibility and visual design

- All interactions must be keyboard operable.
- Focus order must follow the current teaching sequence.
- Colour must never be the only carrier of register, bus or state meaning.
- Animation must support pause, replay, reduced motion and speed control.
- Videos require captions and transcripts in both languages.
- The current value and the changed value must be available as text, not only motion.
- The architecture disclosure boundary in section 8.3 applies equally to videos, UI, feedback, captions and parent guidance.
- Layout must remain usable on a typical laptop and a shared tablet.
- Dense expert panels remain hidden until the lesson introduces them.

## 18. Verification strategy

### 18.1 Machine correctness

The companion architecture’s acceptance cases are required alongside these programme checks. Binary execution must be verified without source metadata, and then through the assembler and visible register/bus trace.

- One deterministic test per opcode and operand form.
- Tests for all five addressing modes.
- Tests for fixed-width arithmetic, shifts and flags.
- Tests for `PL24-v1`, source grammar, both assembler passes and every defined diagnostic.
- Tests that every command emits only schema-valid events and that reducing an event stream reproduces the same state.
- Scenario-manifest validation tests for every rejection rule.
- Tests that compare instructions do not alter ACC.
- Tests for SR bit packing, comparison persistence, Q=0 jump rejection and interrupt save/restore of E/Q.
- Tests for branch taken/not-taken paths.
- Tests for ASCII validation, input wait, output-range diagnostics, END and run limits.
- Tests for interrupt acceptance, queueing, context restore and resume.
- Replay, undo and reset invariants.

### 18.2 Exam golden traces

Development-only fixtures will reproduce state transitions and answers from published Cambridge examples, including addressing, bitwise and RTN questions. The learner-facing product will use newly authored analogous questions rather than copying protected papers.

RTN content fixtures must separately verify that a learner can interpret `←`, `[R]`, `[[R]]`, `[R] + 1` and ordered state changes before the four-line fetch sequence is tested as a whole.

### 18.3 Content coverage

A coverage matrix must demonstrate that every bullet in AS sections 4.1–4.3 and A Level 15.1 maps to:

- at least one explanation;
- at least one active interaction;
- at least one independent check;
- an explicit provenance label.

### 18.4 Language and usability

- English technical review against Cambridge terminology.
- Mandarin technical review for conceptual equivalence.
- Cross-language check that neither edition adds or loses assessed content.
- Visual review of every rendered video.
- Accessibility review of video and application controls.
- Observed parent-led sessions covering Lessons 3, 10, 14, 17 and 28 with at least one parent/novice pair. For each lesson, the pair must start without developer help, commit a prediction, complete the guided interaction, recover from one prepared mistake using the product, and attempt the independent check. Any developer navigation intervention or unexplained abandonment is recorded as a failed usability criterion for that lesson.

## 19. Acceptance criteria

The design is successfully implemented when:

- all 34 lesson packages exist and pass the coverage audit;
- all 34 video assets render in both narration editions with both subtitle tracks;
- Lesson 10 teaches and independently checks RTN grammar before requiring recall of the fetch sequence;
- the core engine implements and tests the complete syllabus example instruction surface;
- the six processor views and Bit Lab’s processor mode share one deterministic state/event stream; independent bit exercises cannot silently alter it;
- the raw-word decoder, fixed register widths, legal encoding table and controller boundary rules pass the companion architecture’s acceptance cases;
- all six concept labs meet their contract and deterministic acceptance example without misrepresenting the core machine;
- the AS integration lesson combines fetch, execution, memory, I/O, masking, branching and an interrupt;
- parent cards and exam checks exist in both languages for every lesson;
- known source tensions are visible and consistently handled;
- the representative five-lesson parent/novice usability trial meets every criterion in section 18.4 without developer intervention;
- mastery-state and retrieval-schedule transitions pass deterministic progress tests;
- no learner-facing material presents a simulator convention or enrichment detail as a Cambridge requirement.

## 20. Implementation-planning boundary

This specification defines the complete programme and the interfaces between its units. The implementation plan should order work as vertical, reviewable slices. Each slice should include the relevant content package, video, scenario, interaction, parent card and exam check rather than building all videos separately from all simulator work.

The first slice should be chosen during implementation planning using these criteria:

- validates the shared lesson-package contract;
- exercises the deterministic event model;
- is understandable to a zero-knowledge learner;
- produces a complete parent-guided learning loop;
- reveals architecture risks early;
- does not require most later opcodes or concept labs.

## 21. Sources

### Cambridge

- [Cambridge International AS & A Level Computer Science 9618 syllabus for 2027–2029](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf)
- [2027–2029 syllabus update, version 2](https://www.cambridgeinternational.org/Images/747147-2027-2029-syllabus-update.pdf)
- [Cambridge public past papers and examiner reports page](https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-international-as-and-a-level-computer-science-9618/past-papers/)
- [June 2024 Paper 11](https://www.cambridgeinternational.org/Images/673628-june-2024-question-paper-11.pdf)
- [June 2024 Paper 11 mark scheme](https://www.cambridgeinternational.org/Images/673620-june-2024-mark-scheme-paper-11.pdf)
- [June 2024 Principal Examiner Report](https://www.cambridgeinternational.org/Images/673617-june-2024-examiner-report.pdf)
- [October/November 2023 Paper 13](https://dynamicpapers.com/wp-content/uploads/2015/09/9618_w23_qp_13.pdf)
- [October/November 2022 Paper 12](https://bestexamhelp.com/exam/cambridge-international-a-level/computer-science-9618/2022/9618_w22_qp_12.pdf)

### Learning design

- [Mayer and Fiorella: segmenting, pre-training and modality principles](https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/principles-for-managing-essential-processing-in-multimedia-learning/A9E77D0172F905AC957689D1771E2888)
- [Mayer and Chandler: learner control in multimedia explanations](https://eric.ed.gov/?id=EJ638751)
- [Roediger and Karpicke: test-enhanced learning](https://pubmed.ncbi.nlm.nih.gov/16507066/)
- [Karpicke and Blunt: retrieval practice and conceptual learning](https://pubmed.ncbi.nlm.nih.gov/21252317/)
- [Chi and Wylie: ICAP framework](https://eric.ed.gov/?id=EJ1044018)
