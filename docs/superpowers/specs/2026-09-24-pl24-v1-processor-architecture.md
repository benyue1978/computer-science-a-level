# PL24-v1 — Teaching Processor Architecture

**Date:** 24 September 2026\
**Status:** Approved design; implementation not started\
**Programme:** [Processor Fundamentals Learning Programme](2026-09-24-processor-fundamentals-learning-programme-design.md)

## 1. Purpose, provenance and decision

PL24-v1 is a project-designed software processor for teaching Cambridge 9618 processor fundamentals. It implements the syllabus example instruction meanings while explicitly supplying the architecture details the syllabus does not prescribe. It is neither an official Cambridge architecture nor a commercial processor emulation.

The chosen approach is a fixed 24-bit machine executing raw words. A variable-width instruction interpreter would make small examples convenient but would weaken the connection between assembly, encoded memory, CIR and decoding. Adopting a general-purpose architecture such as RISC-V would introduce a different assembly language. The fixed teaching machine retains the Cambridge mnemonics and supports the complete visible fetch/decode/execute path.

Our prior PL24 proposal was an encoding demonstration beside a structured interpreter. This revision makes encoding authoritative. It also fixes register widths, packs status bits, removes the artificial requirement to branch immediately after a comparison, and separates small-width exercises from the processor.

| Provenance | Content |
|---|---|
| Cambridge syllabus | Example mnemonics and basic meanings, register/component roles, addressing concepts, two-pass assembly, shifts, interrupt concepts |
| Processor Lab convention | Numeric opcodes, fields, widths, memory addressing, flags, overflow, decoder validation, micro-step timing, relative syntax and interrupt controller |
| Independent teaching model | Small-width bit exercises and A Level performance/pipeline/parallel/VM models |

The current [2027–2029 syllabus](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf), sections 4.1–4.3, remains the content authority. No exam check requires our numeric opcode assignments, fixed widths or controller-frame layout.

## 2. Fixed machine state

| State | Representation |
|---|---|
| PC, MAR | Unsigned 16-bit registers |
| ACC, IX, MDR, CIR | Raw unsigned 24-bit registers |
| SR | Unsigned 8-bit status register; reserved bit always zero |
| RAM | 65,536 words of 24 bits, addresses 0–65,535 |
| Address/data buses | 16/24 bits, with an active/idle indicator |
| Control signals | Memory read or memory write, otherwise idle |
| Phase | Before-fetch, fetch, decode, execute, retire |
| Run state | Ready, running, paused, waiting-input, halted or error |
| Controller | Pending queue, current priority, frame stack and active ISR descriptors |
| Internal latches | Instruction-start address, decoded fields, effective address, operand and sequencer position |
| I/O | ASCII input queue and output sequence |
| Counters | Educational tick count and retired instruction count |

All RAM exists and starts at zero. Sparse storage is an implementation optimisation with exactly the same zero-default behaviour. Memory is word-addressed, so PC advances by one word, not three bytes. A word has no instruction/data type. A store can change a future instruction; a subsequent fetch decodes the changed bits. Assembly labels, source lines and declared data regions are debugger annotations only.

Reset installs the declared image and initial registers; unspecified registers are zero. Initial PC defaults to the image entry, phase is before-fetch, buses idle, latches empty, counters zero, priority zero and controller stack empty. Initial SR must satisfy section 3; I is derived from pending requests. The loader performs the programme spec's authoring checks before creating state.

A signed display interprets a 24-bit pattern as two’s complement. Displaying hex, binary, unsigned or signed values never changes the stored pattern or execution rules.

## 3. Status and arithmetic

| SR bit | Name | Meaning |
|---:|---|---|
| 0 | Z | Latest flag-setting result is zero |
| 1 | N | Bit 23 of that result |
| 2 | C | Addition carry, subtraction no-borrow, or last shifted-out bit |
| 3 | V | Signed arithmetic overflow |
| 4 | I | Pending interrupt queue is nonempty, including deferred requests |
| 5 | E | Latest equality comparison result |
| 6 | Q | An equality comparison has been performed in this context |
| 7 | Reserved | Always zero |

Let M=2^24. ADD and INC compute the unsigned sum and store it modulo M; C is one iff the unwrapped sum is at least M. SUB and DEC store the difference modulo M; C is one iff the unsigned minuend is at least the subtrahend. INC/DEC use one as the second operand. V is one iff the corresponding operation on signed interpretations lies outside −2^23 through 2^23−1. Z/N follow the stored result.

AND/OR/XOR set Z/N and clear C/V. LSL/LSR with a positive count set Z/N/C and clear V. A zero-count shift changes neither ACC nor SR. Loads, MOV, STO, IN, OUT and branches preserve Z/N/C/V. PC increment never changes arithmetic flags.

CMP/CMI compare complete 24-bit patterns, set E to equality and Q to one, and preserve the other non-derived bits. E/Q persist until another comparison, reset, an explicit SR debugger edit or an interrupt context operation. Editing ACC, IX, other registers or RAM preserves SR, including E/Q. JPE/JPN require Q=1, otherwise they diagnose the missing comparison; they do not consume it. E=1 with Q=0 is not a valid initial/debugger state. Ordinary instructions cannot write I or the reserved bit.

Flags are historical results, so reset Z=0 is valid even when ACC=0. Teaching views introduce relevant named flags only when needed; the packed SR and full flag policy remain developer details.

## 4. Instruction word and valid encodings

Every instruction occupies one 24-bit word:

```text
23                19 18       16 15                          0
+-------------------+-----------+-----------------------------+
| opcode: 5 bits    | mode: 3   | operand/address: 16 bits    |
+-------------------+-----------+-----------------------------+
```

`word = opcode × 2^19 + mode × 2^16 + operand`.

Mode codes: none=0, immediate=1, direct=2, indirect=3, indexed=4, relative=5, register=6. Mode 7 is invalid. A mode must be valid for the particular opcode; modes are not interchangeable merely because the field can represent them.

| Code | Mnemonic | Legal modes | Operand rule |
|---:|---|---|---|
| 0 | LDM | immediate | Unsigned 16-bit literal |
| 1 | LDD | direct | 16-bit address |
| 2 | LDI | indirect | 16-bit pointer-location address |
| 3 | LDX | indexed | 16-bit base address |
| 4 | LDR | immediate | Unsigned 16-bit literal |
| 5 | MOV | register | Exactly 1, meaning IX |
| 6 | STO | direct | 16-bit address |
| 7 | ADD | immediate, direct | Literal or address |
| 8 | SUB | immediate, direct | Literal or address |
| 9 | INC | register | 0=ACC, 1=IX |
| 10 | DEC | register | 0=ACC, 1=IX |
| 11 | JMP | direct, relative | Address or signed offset |
| 12 | CMP | immediate, direct | Literal or address |
| 13 | CMI | indirect | Pointer-location address |
| 14 | JPE | direct | 16-bit address |
| 15 | JPN | direct | 16-bit address |
| 16 | IN | none | Must be zero |
| 17 | OUT | none | Must be zero |
| 18 | END | none | Must be zero |
| 19 | AND | immediate, direct | Literal or address |
| 20 | XOR | immediate, direct | Literal or address |
| 21 | OR | immediate, direct | Literal or address |
| 22 | LSL | immediate | Unsigned count |
| 23 | LSR | immediate | Unsigned count |

Codes 24–31 are invalid/reserved. Decode rejects a reserved opcode/mode, an illegal pairing, an invalid register operand or a nonzero operand on a no-operand instruction. It does not silently ignore unused operand bits. A zero memory word is invalid as an instruction because LDM requires immediate mode.

Some mode bits repeat information already implied by the mnemonic. This intentional redundancy keeps one internal format for the whole instruction set; the decoder verifies consistency.

Immediate operands are zero-extended to 24 bits. Negative immediates are not accepted. To load a negative or larger 24-bit value, declare a data word and use LDD. Relative offsets use 16-bit two’s complement. Data declarations accept unsigned 0–16,777,215 or signed −8,388,608–8,388,607 and emit the corresponding 24-bit pattern.

Canonical examples:

| Assembly | Hex word | Split fields |
|---|---|---|
| LDM #5 | 010005 | 00000 / 001 / 0000000000000101 |
| LDD 200 | 0A00C8 | opcode 1 / direct 2 / 200 |
| ADD #3 | 390003 | opcode 7 / immediate 1 / 3 |
| STO 200 | 3200C8 | opcode 6 / direct 2 / 200 |
| END | 900000 | opcode 18 / none 0 / 0 |
| JMP -1 | 5DFFFF | opcode 11 / relative 5 / −1 |

This numeric encoding table and all physical widths are developer/specification details, not teaching-screen content; programme section 8.3 governs disclosure. The assembler and decoder must round-trip every legal form. The architecture version is pinned in scenario and image metadata. Version metadata is not an instruction field. Later architecture changes require a new version and explicit migration; PL24-v1 binaries retain their meaning.

## 5. Addressing and memory transactions

- Direct: use the unsigned 16-bit operand as the address.
- Indirect: read the full word at the operand address, validate that it is at most 65,535, then read at that address. Nonzero upper eight bits produce an address diagnostic; they are not truncated.
- Indexed: calculate operand plus the full unsigned IX, then require 0–65,535.
- Relative JMP: add the sign-extended offset to the already incremented PC, then require 0–65,535. `relativeSyntax` controls whether a lesson's assembler accepts the extension, not whether the hardware decoder recognises it.
- PC fetch increment: `(PC + 1) mod 65,536`, including a fetch at address 65,535. This wrap is deliberate and distinct from calculated-address validation.

An execution-stage memory read consists of: copy the validated address to MAR; activate the address bus from MAR; assert read; transfer RAM[MAR] on the data bus into MDR. The final transfer clears the control and bus active indicators after recording them in the event. The caller then consumes MDR in its next micro-step. For indirect addressing this read template runs twice, with the intermediate pointer validated between reads.

A store consists of: copy address to MAR; copy ACC to MDR; activate address/data buses; assert write; commit MDR to RAM[MAR] and clear active signals. A changed word invalidates its source annotation and any decoded cache. An instruction already in CIR executes its fetched value even if its memory location later changes.

Runtime memory access does not consult source maps, instruction/data roles or whether the word was explicitly initialised. Optional authoring warnings about reading zero-initialised words or overwriting code do not change machine semantics.

## 6. Fetch, decode, execute and retirement

The instruction-start address is captured before fetch. Each numbered fetch step advances one educational tick:

1. MAR ← PC.
2. PC ← (PC+1) modulo 65,536.
3. Activate the address bus with MAR.
4. Assert memory read.
5. Transfer RAM[MAR] through the data bus into MDR; clear active buses/control after logging the transfer.
6. CIR ← MDR.
7. Decode CIR's actual bits, validate the encoding and latch the decoded fields.

Steps 1–6 implement the four Cambridge fetch RTN operations with additional visible bus detail. Decode is separate. Its latched fields are derived state and must never come from assembly metadata.

Execute uses the memory templates in section 5 where needed, followed by one atomic result step:

| Instructions | Execution after decoding |
|---|---|
| LDM/LDR | Zero-extend operand into ACC/IX |
| LDD/LDI/LDX | Resolve/read as specified, then copy MDR to ACC |
| MOV | Copy ACC into IX |
| STO | Apply the write template; no further result step |
| ADD/SUB/AND/OR/XOR | Resolve immediate or read direct operand, then update ACC and flags together |
| INC/DEC | Update selected register and flags together |
| CMP/CMI | Resolve operand, then update E/Q together |
| JMP | Validate target, then copy into PC |
| JPE/JPN | Check Q; test E and either write target to PC or leave PC unchanged |
| LSL/LSR | Compute the fixed-width result and flags, then commit together |
| IN | Consume one available ASCII character into ACC, or wait without retiring |
| OUT | Validate ACC is 0–127, then append that character once |
| END | Halt at retirement in the base program; diagnose END in an active ISR |

An effective-address calculation/validation is one explicit micro-step before the dependent memory transaction or PC update. Indirect pointer validation is likewise its own micro-step. Immediate operand selection is part of the result step. Conditional-branch Q validation and result are one step. Direct load/store address fields need no extra range calculation because they are already 16 bits.

A nonzero logical shift is mathematically equivalent to repeating a one-bit shift. For n=24, the last outgoing bit becomes C; for n>24 result and C are zero. Visual subframes may show each moving bit without adding hardware ticks. This avoids claiming a real-world shift latency.

Retirement is one step after successful execute: increment retired-instruction count, clear execution latches, set before-fetch, and arbitrate interrupts unless END halted execution. Controller acceptance is recorded atomically within that boundary. END counts as a retired instruction. A pending interrupt never wakes END. Waiting for input and invalid instructions do not retire.

Every successful sequencer micro-step consumes one educational tick, even when its result is unchanged. Queueing input/interrupts, pause, breakpoints, diagnostics, reset and debugger edits do not consume processor ticks. Monitor return consumes one controller tick. These counts describe our model, not Cambridge-prescribed timing or commercial performance. Rendering frames and narration timing never affect them.

## 7. Debugging, faults and deterministic stepping

An invalid decode leaves the completed fetch visible (including incremented PC and CIR) and enters error without execute/retire effects. An execution fault preserves earlier completed micro-steps and rejects the failing step's writes. The developer error reports the captured instruction-start address, raw CIR, phase and reason. The teaching adapter presents the location and a plain-language reason without raw fields. There is no partial multi-register write within one result step.

Recovery uses undo or reset-instruction; reset-instruction restores the checkpoint before fetch. Editing raw memory or registers is allowed only paused at before-fetch, or after resetting a fault to that boundary. Edits invalidate internal decoding and stale source annotations. Run controls cannot continue a fault without explicit recovery. Entered values must fit their widths; SR edits obey section 3 and cannot set I or bit 7.

A breakpoint pauses before fetch at its address. Resume skips that same breakpoint once so it can make progress; a later revisit stops again. Scenario run limits count retired instructions in the current Run command, including ISR instructions, and pause at the next boundary. Instruction-step completes one instruction from the current partial position, including input wait if necessary, then stops after any accepted interrupt and before the next fetch. If already before-fetch it executes the next instruction. Waiting-input resumes the same IN result step once input is supplied, without fetching again or duplicating output.

One MACHINE_TRANSITION event commits a whole micro-step or controller action, including all register writes, flags, phase and counters. Informational detail events do not mutate state. Checkpoints and undo operate only on complete atomic transitions: they cannot expose a result without its flags, a partial interrupt entry or a partially restored frame. Every checkpoint includes registers, RAM, latches, phase, run state, buses, queue, controller frames/descriptors, I/O and counters. Recovery appends the programme specification's STATE_RESTORED event; it does not erase history. Hardware ticks may return to checkpoint values, while event sequence numbers remain strictly increasing.

## 8. Interrupt controller and monitor return

This controller is a teaching convention. It makes save/service/resume deterministic without inventing a Cambridge return opcode or implying that the curriculum specifies an operating-system ABI.

Each request has a unique ID, source, priority, enqueue sequence and ISR descriptor (`startAddress`, `completionAddress`). Both addresses fit 16 bits. A queued request is immutable. The queue is unbounded by the architecture but a scenario may limit external request injection through its controls. I is always one iff the queue is nonempty.

At retirement, choose the highest priority strictly greater than current priority; ties use earliest enqueue sequence. If none qualifies, continue. Entry is atomic: remove the selected request, push a frame, set active descriptor and priority, put startAddress in PC, clear E/Q and execution latches, set before-fetch and recompute I. ACC/IX and arithmetic flags are initially preserved. MAR/MDR/CIR retain their boundary values until the ISR fetch changes them.

The controller stack has at most 255 frames, matching strictly increasing priorities. Each frame holds eight 24-bit slots: PC, MAR, MDR, CIR, ACC, IX, SR and previous priority. Narrow registers are zero-extended. The previous ISR descriptor (or base marker) is saved alongside as controller metadata. Frames are outside RAM and cannot be modified by STO. Stack overflow, an invalid descriptor or return with no frame is diagnosed without partial entry/return changes.

Before fetching, if an ISR is active and PC equals its completionAddress, pause with return pending. This sentinel does not have to contain an instruction and is scoped to the active ISR. Its check precedes ordinary breakpoints. The monitor command COMPLETE_ISR is legal at any active-ISR before-fetch boundary, and only that command emits ISR_COMPLETE. Lesson Mode exposes it at the configured sentinel; Sandbox may expose it at other valid boundaries. After an instruction retires, higher-priority arbitration occurs before checking the active descriptor's sentinel.

Return atomically pops the frame, restores PC/MAR/MDR/CIR/ACC/IX and SR except I, reinstates prior priority/descriptor, clears latches and buses, sets before-fetch, then derives I from current requests. It preserves RAM, I/O and elapsed counters. It immediately arbitrates again, so another eligible request may run before the interrupted program resumes. If none qualifies, apply the resumed context's completion-sentinel check. The command finishes paused; Run/Step can then continue. An ISR cannot use END to return.

While IN is waiting, requests can queue but are serviced only after IN completes. While halted or in error, requests can queue but are not accepted. This deliberately simple policy is taught as our convention, not a universal processor rule.

## 9. Small-width exercises and A Level extension boundary

Bit Lab exercise mode has its own W-bit value, flag state and optional memory operands, with W from 4 to 32. It can trace bit-operation sequences from exam questions at their stated width. It does not fetch PL24 words, claim to be the canonical processor, or resize its registers. The programme spec owns its shift rules. Developer diagnostic copies to/from the processor are explicit: unsigned zero-extension when widening, low-bit truncation when narrowing, with preview and user action. Learner-facing copies must preserve the exact unsigned value and reject a value that does not fit; they never expose or perform silent truncation. Copying into the processor uses the same before-fetch debugger-edit boundary; it preserves SR.

A Level Pipeline Lab owns stage occupancy, dependencies, stalls and branch/interrupt disruption as a separate model. It may decode PL24 examples through the same pure decoder, but cannot mutate the sequential engine's state. RISC/CISC, parallel architectures and VM labs similarly have independent models. Thus later teaching content does not require replacing the AS binary architecture. Building an executable pipelined CPU later would be a separate implementation behind the same instruction semantics, not a promised animation-only upgrade.

## 10. Acceptance evidence required before implementation is called correct

- Every legal opcode/mode/register form round-trips assembler → word → decoder; every illegal combination is rejected.
- Canonical encoding examples in section 4 match the assembler and a separately calculated expected value.
- Raw program at addresses 0–3: 010005, 390003, 3200C8, 900000 produces ACC=8, RAM[200]=8, PC=4 and halted state. It runs without a source map.
- Changing address 0's raw word to 010006 changes that program's result to 9 without changing any annotations.
- STO overwriting a future instruction changes its execution on the next fetch; existing CIR contents remain stable.
- Fetch reads the same 24-bit word through MDR into CIR; intermediate values/buses follow sections 5–6.
- Fetch at 65,535 wraps PC to zero; overflowing calculated addresses fail rather than wrap. Indirect pointers with high bits set fail before the second memory read.
- 0xFFFFFF + 1 gives 0 with Z=1, N=0, C=1, V=0. 0x7FFFFF + 1 gives 0x800000 with N=1, C=0, V=1. 0 − 1 gives 0xFFFFFF with C=0 and V=0.
- Positive, zero, equal-width and greater-than-width shifts produce the specified result/C and zero-count flag preservation.
- Comparison survives an intervening load and multiple branches; Q=0 conditional jumps fail. Nested interrupts restore E/Q independently.
- No input causes an IN wait without repeated fetch/retirement; later input completes it once. Non-ASCII input and out-of-range OUT are diagnosed.
- Illegal encoding, fault recovery, self-modifying memory, reset/undo, breakpoint resume and run-limit behaviour match the boundary rules. Undo/replay of arithmetic restores result and flags together; interrupt entry/return restores the entire controller/register transition with no partial frame or register checkpoint.
- Interrupt requests during a memory operation wait until retirement; priority/FIFO rules, nested frames, pending-I recomputation, sentinel pause and monitor return are covered.
- Return preserves ISR memory/output changes while restoring the interrupted registers; END in an ISR fails.
- Removing or corrupting source annotations never changes machine execution. All visual views derive state from the same event stream.
- Eight-bit exercises demonstrably retain their eight-bit semantics without changing PL24's 24-bit state.

## 11. Existing implementations considered

A focused search found Cambridge-specific implementations but no shared fixed architecture suitable for direct adoption:

- [nyanmachine](https://github.com/lapaii/nyanmachine): its [serialiser](https://github.com/lapaii/nyanmachine/blob/main/nyassembler/serialiser/serialise.go) emits an instruction identifier byte plus operand text and a zero terminator; its [register structure](https://github.com/lapaii/nyanmachine/blob/main/nyantime/registers/registers.go) uses Go integers for PC/ACC/IX and a Boolean comparison result.
- [A-Level Assembly Emulator](https://github.com/victor-Lopez25/A-Level-Assembly-Emulator/blob/main/src/ala.h): structured instruction records and project-specific instruction choices.
- [ZAK’s simulator](https://cswithzak.com/tools/assembler): useful published teaching interactions and stepping; the page does not publish a complete fixed binary architecture.

These are references, not dependencies or correctness authorities. The choice of our own architecture rests on teaching requirements, not a claim that no other design exists or that an unimplemented specification is already superior software.

## 12. Architecture replacement and teaching boundary

PL24-v1 remains the current internal machine. The programme specification section 8.3 defines the adapter and teaching-frame interface. Learner-facing views and media consume semantic frames, not raw words, physical widths or packed field offsets. The assembler and raw decoder remain authoritative behind that boundary. Hiding bits never changes the machine's result.

New architecture versions implement the same semantic projection where possible. Scenario builders reassemble symbolic programs and validate outcomes against scenario assumptions before migration. Changes to address units, PC stride, finite-width arithmetic, literal ranges or instruction semantics may invalidate a scenario even when its screen labels are unchanged. Such scenarios must remain on their original supported profile or be intentionally revised. In particular, the Cambridge +1 RTN lesson cannot be backed by an engine that actually advances its displayed PC by three.

Raw images/checkpoints are versioned machine artifacts; migration does not reinterpret them. Conceptual lesson scripts and presentation components stay independent of this encoding, while concrete address/value assertions and width-dependent exercises remain explicit and testable. A future architecture change therefore has a bounded engineering impact, not a promise that every example remains automatically compatible.
