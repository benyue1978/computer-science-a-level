# Processor Fundamentals Programme Delivery Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the complete 34-lesson bilingual, parent-guided programme in independently verifiable teaching milestones.

**Architecture:** A deterministic processor sits behind a stable teaching adapter. Browser activities and Remotion videos share presentation components and canonical lesson content; independent bit and A Level models use the same teaching shell without changing processor semantics.

**Tech Stack:** TypeScript, React, Vite, Remotion, Vitest, Playwright, browser local storage and local media rendering. No server or account system is needed for the initial product. The eventual browser-app hosting target is Vercel, after the user verifies it works.

---

## Chunk 1: Scope, dependencies and delivery map

### Authority and current state

Approved specifications:

- [Learning programme](../specs/2026-09-24-processor-fundamentals-learning-programme-design.md), especially sections 7, 8.3, 9, 15 and 18–20.
- [PL24-v1 architecture](../specs/2026-09-24-pl24-v1-processor-architecture.md), including the architecture replacement boundary.

Workspace root: `/Users/song.yue/git/computer-science-a-level`. As inspected on 25 September 2026, it contains the source notes and specifications but no application/package manifest and is not a Git repository. This plan creates neither implementation code nor a repository. At implementation start, inspect again; preserve anything added since planning. Initialise Git locally if still absent, then commit scoped changes. A remote, publishing or deployment is not required.

This document is a whole-programme delivery roadmap, not a claim that every later milestone already has an execution-ready task plan. The approved scope is fully assigned below. Before each later milestone, write its own detailed plan against the unchanged programme coverage and the working interfaces established by earlier milestones. The first such plan is [Memory to Fetch](2026-09-25-memory-to-fetch-milestone-plan.md).

Milestone numbers are construction order, not teaching order. The learner's curriculum remains Lessons 1–34. Unbuilt lessons are not presented as available. We avoid promising calendar dates before measuring content-authoring, rendering and parent/learner review effort in M1.

### File ownership and dependency direction

All paths below are relative to the workspace root; these are planned files/directories, not existing implementation.

| Area | Planned location | Owns |
|---|---|---|
| Lesson content | `content/lessons/`, `content/curriculum.ts` | EN/ZH explanations, questions, parent cards, sources and curriculum IDs |
| Built-in scenario definitions | `content/scenarios/` | Architecture-free instruction/value descriptions and lesson assumptions |
| Architecture implementation | `src/processor/pl24/` | Raw words, decoder, registers, execution and architectural validation |
| Atomic history | `src/processor/history/` | Transition replay, checkpoint restoration and recovery |
| Scenario binding and teaching adapter | `src/adapter/` | Encoding built-in programs, version-pinned bindings and truthful teaching frames |
| Teaching contracts | `src/teaching/` | Lesson/frame types and validation, with no engine imports |
| Shared diagrams | `src/visuals/` | Register, memory, bus and transfer presentation; no engine imports |
| Learner application | `src/app/`, `src/lesson/` | Navigation, predictions, parent guidance and controls |
| Assessment and progress | `src/assessment/`, `src/progress/` | Evidence, marking points, attempts and retrieval schedule |
| Independent models | `src/labs/` | Bit exercises, performance, ports, pipeline, parallelism and VMs |
| Remotion scenes | `src/video/` | Deterministic frame-based animation and language-specific timing |
| Authoring/render tools | `scripts/`, `public/media/`, `artifacts/` | Audio, captions, compiled teaching traces and exported video |
| Evidence | `tests/`, `docs/verification/` | Machine checks, browser flows, media QA and actual user-trial records |

Dependencies flow from the application composition root to the adapter and presentation; visual components and lesson content cannot import the processor. Remotion reads precomputed teaching frames, not live engine internals. One npm package with clear directories is sufficient initially; no monorepo framework or generic plugin system is needed.

### Complete lesson allocation

Each final lesson has one canonical package, one Vxx video composition rendered in two narration editions, an activity, parent card, independent exam-transfer check and retrieval prompts. Reusing composition code does not merge the 34 required assets.

| Milestone | Final lessons / videos owned | Working learner outcome | Engineering additions | Dependencies |
|---|---|---|---|---|
| M1 — Memory to Fetch | 10 / V10 | Read RTN and independently reconstruct/predict fetch | Contracts, raw-word fetch/decode, adapter, diagram, bilingual media, predictions, evidence, recovery | Approved design |
| M2 — Foundations and complete cycle | 1–9 and 11 / V01–V09, V11 | Build the prerequisite concepts and connect fetch to decode/execute/repetition | Complete state journey, number/address activities, architecture explorer, register/bus views; minimal LDM/LDD/END execution | M1 |
| M3 — Instruction and program reasoning | 15–21 / V15–V21 | Trace data movement, addressing, arithmetic, I/O, comparisons, branches and loops | Remaining non-bitwise instruction execution, flags, instruction playground, structured program builder, program runner, breakpoints and input wait | M2 |
| M4 — Interrupts | 14 / V14 | Explain detection, priority, save/service/return and resume | Controller queue, context frames, monitor return, nested/deferred scenarios; primary UI starts with one simple ISR | M3 |
| M5 — Two-pass assembly | 22–23 / V22–V23 | Build a symbol table, resolve labels and load a program | Full source grammar, two-pass assembler and learner source editor; conceptual encoding explanation | M3; reuse M4 scenarios where useful |
| M6 — Bits and integrated mission | 24–29 / V24–V29 | Apply shifts/masks and solve an integrated machine task | AND/OR/XOR/LSL/LSR in processor; independent width-specific Bit Lab including arithmetic/cyclic shifts; integrated assessment | M3, M4, M5 |
| M7 — Performance and peripheral ports | 12–13 / V12–V13 | Explain bottlenecks and choose USB/HDMI/VGA appropriately | Independent Performance and Ports labs | M2; uses M1 lesson infrastructure |
| M8 — Processor approaches and pipeline | 30–31 / V30–V31 | Compare RISC/CISC and explain pipeline overlap/disruption | Processor Profiles and Pipeline labs with separate state models | M2, M4 |
| M9 — Parallel systems and VMs | 32–34 / V32–V34 | Classify stream architectures, explain large-scale parallelism and VMs | Parallel Architecture and Virtual Machine labs | M7, M8 |
| M10 — Whole-programme acceptance | All 34 audited, no additional lesson IDs | Complete navigable AS programme with separate later A Level extension | Cross-topic retrieval, full coverage audit, media/accessibility review and user-trial fixes | M1–M9 |

M1's prerequisite warm-up previews ideas from Lessons 1–7 and 9 but creates no extra lesson IDs or additional Vxx deliverable. It never awards mastery of those earlier lessons. M2 completes their full independent packages. V10 remains focused on RTN and fetch; its warm-up is an interactive pre-lesson preparation sequence.

### Milestone task templates and completion evidence

#### M1 — Execution-ready plan exists

- [ ] Execute the linked M1 plan and preserve its raw-word execution and teaching-interface boundaries.
- [ ] Deliver V10 EN/ZH editions, both subtitle languages, parent guidance and an independent changed-value fetch task.
- [ ] Record software/media verification separately from the actual parent/novice trial. A trial cannot be replaced with an agent pretending to be the learner.

#### M2 — Foundations

- [ ] Write the M2 implementation plan using the M1 content schema and frame renderer; give each of Lessons 1–9 and 11 its own bounded content/render/check task.
- [ ] Implement the minimal instruction completion loop and LDM/LDD/END effects with independently calculated register/memory traces.
- [ ] Build input/process/output/storage, binary/hex representation and address/content activities, then component/register/bus activities.
- [ ] Publish all ten complete lesson packages with bilingual narration, cards and changed-value checks.
- [ ] Verify a novice can traverse the prerequisite chain into Lesson 10; conduct the required Lesson 3 trial.

#### M3 — Instructions and programs

- [ ] Plan instruction families independently: movement/addressing; arithmetic/flags; comparisons/branches; I/O; program control and trace table.
- [ ] Implement every non-bitwise syllabus form and validate its effects against the architecture acceptance examples and exam-style source evidence.
- [ ] Expose editable structured instruction rows for programs; generated raw words remain behind the adapter. Full free-text assembly is deliberately delivered in M5.
- [ ] Deliver Lessons 15–21 with one-instruction, changed-state and whole-program challenges; relative syntax remains labelled as an illustrative form where it affects interpretation.
- [ ] Verify zero-knowledge separation of literal/address/content and conduct the required Lesson 17 trial.

#### M4 — Interrupts

- [ ] Plan queue arbitration, atomic entry/return, context stack and lesson narrative as separate testable tasks.
- [ ] Build one deterministic request/save/service/return example before adding higher-priority nesting and equal/lower-priority deferral.
- [ ] Verify pending I is derived from the queue, memory/output survive return, comparisons restore, and no ISR END silently returns.
- [ ] Deliver Lesson 14 and conduct its required trial; hide controller slot layout and priority-number encoding in teaching.

#### M5 — Assembly

- [ ] Plan the source parser, label table, pass-one diagnostics, pass-two encoding and Workshop separately.
- [ ] Retain the same raw decoder/loader and teaching adapter; add source maps without giving metadata authority over execution.
- [ ] Deliver V22/V23 and activities for symbol allocation, forward references, data and common source errors.
- [ ] Verify assembler → raw memory → fetch/decode/execute agreement; keep physical field layouts out of lesson screens.

#### M6 — Bit operations and integration

- [ ] Plan processor bitwise execution and independent width-specific exercise state as separate units.
- [ ] Build explicitly sized bit lessons, including zero/large shifts, arithmetic sign handling, rotations and test/set masks.
- [ ] Deliver Lessons 24–28, then Lesson 29's input/fetch/mask/branch/memory/output/interrupt mission.
- [ ] Verify no silent truncation or processor resize when switching/copying exercise values; conduct the required Lesson 28 trial.

#### M7–M9 — Independent concept labs

- [ ] Create one detailed implementation plan per lab using programme section 13.3's state/control/evidence/acceptance contracts.
- [ ] For M7, vary one performance factor at a time and preserve the “all else equal/workload-dependent” qualification; verify port signal/media distinctions.
- [ ] For M8, teach RISC/CISC profiles and pipeline occupancy/throughput/stalls independently of the sequential engine; never infer real timing from the educational tick counter.
- [ ] For M9, implement stream-count classification, scaling/communication trade-offs and host/guest isolation/resource scenarios.
- [ ] Deliver all seven allocated lesson packages and render their bilingual editions through the existing media pipeline.

#### M10 — Acceptance

- [ ] Audit that Lessons 1–34 and V01–V34 each have explanation, interaction, independent check, provenance and bilingual assets.
- [ ] Run the complete architectural acceptance suite, all concept-lab examples and full source-to-execution scenarios.
- [ ] Complete any outstanding real parent/novice trials for Lessons 3, 10, 14, 17 and 28; distinguish observed failures from proposed fixes.
- [ ] Review both narration editions and both subtitle tracks for every video; check all architecture details remain behind the teaching boundary.
- [ ] Verify local persistence/recovery, retrieval after elapsed time and graceful missing-media/corrupt-progress behaviour.
- [ ] Record remaining limitations and create a local release bundle with reproducible run/render instructions.

### Delivery policy

Every milestone ends with a working teaching slice and evidence, rather than an engine-only or video-only delivery. Later lesson plans may change implementation order after the M1 trial; lesson coverage and identifiers must not disappear. No scheduled background work, external messaging or paid narration service is implied. Public GitHub publication of these planning documents is separately authorised. Production app deployment to Vercel is conditional on the user verifying the working app; do not deploy merely because automated checks pass.

Maintain a milestone status table in this file during execution: planned → building → software verified → learner trial pending (where applicable) → accepted. At authoring time all milestones are planned. Do not mark M1 or the entire programme learned/accepted from an automated test alone.

### Processor correctness and coverage gates

The pure processor, codec, atomic history and teaching adapter are designed for strong automated coverage without a browser. Use Vitest coverage reporting with minimum 95% statements/lines/functions and 90% branches for implemented production files in these areas. Include all such files in the coverage denominator, not only imported files; exclude types and generated content with an explicit documented list. These are gates, not targets that justify deleting difficult paths or testing the implementation against itself.

Independently require every legal opcode/operand form, illegal encoding class, addressing mode, flag rule, numeric boundary and documented diagnostic to have a named acceptance case. Cover all implemented architectural requirements in a traceability matrix; deferred instruction families are explicitly marked deferred until their milestone. Final simulator acceptance permits no deferred architecture requirements. Full branch coverage is desirable for the small decoder and arithmetic functions; record any uncovered branches and why they remain.

Use deterministic property tests for encode/decode round trips, fixed-width result ranges, step versus uninterrupted execution, replay equivalence, reset repeatability and atomic undo. Add independent hand-calculated golden traces; do not generate expected answers using the codec/reducer under test. Include zero/max/overflow values, pointer bounds, instruction/data reinterpretation, comparison persistence, input wait, nested interrupts, and PC/address edge cases. Browser tests verify that learner controls project those results truthfully, rather than duplicate every arithmetic case in the UI.

Before claiming simulator reliability, demonstrate that deliberate local defects (for example PC increment skipped, an indirect read removed, or ACC restored without flags) make the relevant tests fail. Revert those mutations immediately. M1 uses applicable fetch/decode/history mutations only; later milestones extend the fault checks as capabilities are added.

### Vercel deployment after verification

- [ ] Keep the app a static Vite build with client-side simulation and local progress. Narration and Remotion exports are built ahead of deployment; no macOS tools, Node renderer or credentials run in a user's browser.
- [ ] Include required generated teaching frames and media in the deployable bundle or explicitly configured static asset location. A clean checkout must be able to reproduce the browser build using checked-in small derived teaching assets; approved compressed browser narration/captions/transcripts are packaged and tracked via `npm run package:media -- --lesson l10` (extended for later lessons), while large MP4 exports remain optional local artifacts. Do not depend on an author's private absolute path.
- [ ] Before the user trial, test the production build locally with `npm run build` and `npm run preview`, including media, reload and direct navigation. M1 uses the root route to avoid premature routing complexity.
- [ ] After the user confirms the app works and is ready to publish, use the vercel-deploy skill to deploy, check the hosted app and report its URL. Do not link GitHub to automatic Vercel production deployment before that verification gate.
- [ ] Verify HTTPS asset loading, fonts, captions, localStorage recovery and browser interaction on the deployed origin. Explain that local progress is per browser/origin, so localhost progress does not automatically appear on the hosted site.

### Technology references checked for planning

- [Vite guide](https://vite.dev/guide/): browser development/build tooling for the React application.
- [Remotion Player](https://www.remotion.dev/docs/player): embed the same React composition used for rendered media.
- [Remotion rendering](https://www.remotion.dev/docs/renderer/render-media): local video/audio output.

Pin mutually compatible dependency versions and a Node version during implementation; this roadmap does not hard-code unverified package versions. All Remotion packages must use the same release. Existing macOS Node/npm, FFmpeg and English/Mandarin `say` voices were discoverable during planning; voice quality and actual audio output still require a short rendering/listening check.
