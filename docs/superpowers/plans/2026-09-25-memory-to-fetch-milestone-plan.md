# Memory to Fetch — Later M1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a complete bilingual Lesson 10 in which a parent-guided novice learns RTN, predicts the fetch transfers, manipulates a truthful simulator and completes an independent changed-value task.

**Architecture:** A narrow raw-word fetch/decode implementation sits behind a versioned scenario builder and semantic teaching adapter. React interactions and Remotion videos share pure diagrams and canonical content; assessment records committed predictions and local evidence independently of playback.

**Tech Stack:** TypeScript, React, Vite, Remotion/Player, Vitest with V8 coverage, fast-check for deterministic property tests, React Testing Library, Playwright, localStorage, macOS `say` and FFmpeg for initial local narration production.

---

## Sequencing update — 25 September 2026

This plan is retained, but is no longer the first implementation step. The user approved [Foundations Before RTN](../specs/2026-09-25-foundations-before-rtn-design.md): teach eight small bites separately, beginning only with memory, addresses and contents. M0 replaces this plan's compressed prerequisite warm-up. Do not run the toolchain/processor/media tasks below to deliver Bite 1. Revisit the preparation tasks and pacing after the foundational activities have been understood; the later engine and hybrid-lesson requirements remain valid.

## Chunk 1: Boundaries, contracts and an executable fetch

### Context and scope

Workspace: `/Users/song.yue/git/computer-science-a-level`. Read the approved [programme specification](../specs/2026-09-24-processor-fundamentals-learning-programme-design.md) and [architecture contract](../specs/2026-09-24-pl24-v1-processor-architecture.md), especially programme §§7.1, 8.3, 9, 15 and architecture §§2, 4–7, 10, 12. The [delivery roadmap](2026-09-25-programme-delivery-roadmap.md) assigns every remaining lesson.

M1 eventually delivers the complete L10/V10 package. M0 provides the exact prerequisites needed here: memory address versus contents; processor and temporary register storage; copying and before/after state; address/data/control paths and CU coordination; instruction-cycle versus clock-cycle distinction; fetch-register roles; a small decimal increment; RTN expressions and an initial complete fetch explanation. M1 preparation recaps these ideas. M0 does not teach the full input/process/output/storage pathway or binary representation, and it does not award mastery of the full L1/L2 or other later lesson packages. Binary calculation proficiency is not required for this decimal fetch example.

The learner path is prepare → RTN primer → five-part RTN gate → guided fetch → altered independent fetch → English exam response with bilingual guidance → later retrieval. Preparation is revisitable, not a skip into an unexplained diagram. A suggested session is 15–25 minutes, split into two sessions if needed; this is a starting assumption to validate, not a learner time limit.

The engine implements fetch and decode only in M1. Its supported capabilities explicitly exclude execute, instruction-run, interrupts, assembly source editing and bit operations. It recognises the full legal encoding table to establish one decoder, but never pretends to execute an unsupported opcode. After decode the activity ends at “Instruction fetched; ready to execute.” M2 introduces execution. No main-program END or synthetic instruction retirement occurs merely to end this lesson.

### Concrete fixture and expected evidence

Author scenario definitions with semantic instructions, not packed bits:

| Scenario | Entry | Memory at entry | Initially MAR / MDR / CIR | After fetch |
|---|---:|---|---|---|
| Worked | 100 | LDM #5 | 0 / 0 / 0 | PC=101, MAR=100, MDR and CIR decode as LDM #5 |
| Guided variant | 140 | LDM #9 | 0 / 0 / 0 | PC=141, MAR=140, MDR and CIR decode as LDM #9 |
| Independent | 220 | LDM #7 | 0 / 0 / 0 | PC=221, MAR=220, MDR and CIR decode as LDM #7 |
| Delayed retrieval | 310 | LDM #12 | 0 / 0 / 0 | PC=311, MAR=310, MDR and CIR decode as LDM #12 |

Only these relevant memory rows plus adjacent zero-valued locations need to be visible. The scenario carries fixed-address and next-PC-stride=1 assumptions. The builder encodes the instruction through PL24; neither content nor React stores its raw value. Before an instruction is fetched, CIR displays an unpopulated/zero initial state without attempting to decode zero as a current instruction. After copy to CIR, the adapter derives its instruction label through the decoder; the explicit decode phase still controls progression.

Author independent marking points rather than deriving the answer from the same reducer being tested. A learner must distinguish MAR=220 from PC=221 after increment and must explain why changing PC did not change MAR.

### Planned file structure

Paths are relative to the workspace root. Existing `outputs/` and `work/` remain source/reference material and are not app build inputs.

| Files | Responsibility |
|---|---|
| `package.json`, `package-lock.json`, `.nvmrc`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `index.html` | Toolchain and scripts |
| `src/teaching/frame.ts`, `lesson.ts`, `scenario.ts` | Architecture-independent data contracts |
| `src/processor/pl24/state.ts`, `encoding.ts`, `decode.ts`, `fetch.ts` | Raw machine and legal fetch/decode |
| `src/processor/history/transitions.ts`, `replay.ts`, `recovery.ts` | Atomic commit, replay and checkpoints |
| `src/adapter/pl24.ts`, `build-scenario.ts`, `project-fetch.ts`, `session.ts` | Internal binding, projection and semantic teaching steps |
| `content/curriculum.ts`, `content/scenarios/fetch.ts` | L10 entry and named scenario variants |
| `content/lessons/l10/en.ts`, `zh.ts`, `index.ts`, `assessment.ts` | Bilingual canonical lesson package |
| `src/visuals/tokens.ts`, `MemoryGrid.tsx`, `RegisterCard.tsx`, `FetchDiagram.tsx` | Shared pure diagram components |
| `src/app/main.tsx`, `App.tsx`, `styles.css` | Local app and layout |
| `src/lesson/Preparation.tsx`, `LessonPlayer.tsx`, `FetchActivity.tsx`, `Prediction.tsx`, `ParentCard.tsx` | Guided lesson flow |
| `src/assessment/rtn.ts`, `attempts.ts`, `src/progress/store.ts`, `mastery.ts` | Scoring, evidence, persistence and retrieval |
| `src/video/Root.tsx`, `FetchLesson.tsx`, `timing.ts` | Remotion composition and language timing |
| `scripts/check-boundaries.ts`, `build-trace.ts`, `narrate.ts`, `package-media.ts`, `render-video.ts`, `validate-content.ts` | Reproducible authoring/render checks |
| `public/media/l10/`, `artifacts/l10/` | Generated narration/caption assets and exported videos |
| `tests/unit/`, `tests/component/`, `tests/e2e/`, `docs/verification/` | Automated and observed acceptance evidence |

Do not implement unlisted future labs or a generic plugin framework in this milestone. Split a growing file along the responsibilities above rather than collecting engine, content, scoring and UI into one component.

### Task 1: Establish the local toolchain

**Files:** root configuration files above; create `README.md`, `docs/verification/m1-toolchain.md`.

- [ ] Reinspect the workspace and Git status. If Git is already initialised for the public planning repository, use it; otherwise initialise a local repository. Do not overwrite existing files or repeat initialisation blindly.
- [ ] Read the available frontend-design skill before designing the interface, and remotion-best-practices before authoring Remotion code. Record the chosen dependency versions after checking their actual Node/peer requirements. Pin one compatible Remotion release across all Remotion packages; commit the lockfile.
- [ ] Create the React/TypeScript Vite app in this root without replacing `docs/`, `outputs/` or `work/`. Add only the dependencies needed by the listed tasks. Set strict TypeScript checking.
- [ ] Define scripts: `dev` → Vite on 127.0.0.1:5173 with strict port; `build` → typecheck then Vite build; `test` → Vitest run; `test:coverage` → Vitest run --coverage; `preview` → Vite preview on 127.0.0.1:4173 with strict port; `test:e2e` → Playwright test; `check:boundaries` → tsx boundary script; `validate:content` → tsx content validator; `build:trace`, `narrate`, `package:media`, `render:video` → corresponding tsx tools. Reserve media scripts until their tasks implement them; do not use passing no-op placeholders.
- [ ] Ignore node_modules, dist, intermediate render caches/uncompressed audio under artifacts (approved browser audio under public/media is tracked), browser test output, `.superpowers/`, `work/`, `outputs/` and OS files. Keep original authored content and review records tracked. Do not add licensed source PDFs or transient transcripts to Git.
- [ ] Run `npm run build`; expect a loadable empty application and successful typechecking. Record the exact environment and local startup command. Commit only this task's files after verification.

### Task 2: Freeze the teaching contracts and import boundary

**Files:** `src/teaching/{frame,lesson,scenario}.ts`, `scripts/check-boundaries.ts`; tests `tests/unit/teaching-contract.test.ts`, `boundaries.test.ts`.

The initial frame contract must have this shape, with additional lesson content in the lesson package rather than raw machine fields:

```ts
export type RegisterId = 'PC' | 'MAR' | 'MDR' | 'CIR';
export type TeachingValue =
  | { kind: 'number'; value: number }
  | { kind: 'address'; value: number }
  | { kind: 'instruction'; mnemonic: string; operandText: string }
  | { kind: 'empty' };
export type FetchAction =
  | 'initial' | 'copy-address' | 'advance-pc'
  | 'read-memory' | 'copy-instruction' | 'decode' | 'restored';
export interface TeachingFrame {
  id: string;
  transitionIds: readonly number[];
  action: FetchAction;
  registers: Readonly<Record<RegisterId, TeachingValue>>;
  memory: readonly { address: number; value: TeachingValue }[];
  changed: readonly RegisterId[];
  activePath: 'none' | 'pc-mar' | 'mar-memory' | 'cu-memory'
    | 'memory-mdr' | 'mdr-cir';
  transferCues: readonly {
    transitionId: number;
    from: 'PC' | 'MAR' | 'CU' | 'memory' | 'MDR';
    to: 'MAR' | 'memory' | 'MDR' | 'CIR';
    via: 'internal' | 'address-bus' | 'control-bus' | 'data-bus';
    value: TeachingValue | { kind: 'signal'; name: 'read' };
  }[];
  phase: 'ready' | 'fetch' | 'decode' | 'complete';
}
```

- [ ] Write contract tests accepting a frame with PC=100 and an instruction label, and rejecting raw-word/opcode-bit/physical-width/profile fields in serialised teaching output. Keep numeric range tests architecture-independent.
- [ ] Define lesson content for bilingual terms, preparation, primer, pause cues, scenario references, parent hints, scoring rubrics and retrieval prompts. Define semantic scenario operands as discriminated values (literal/address/register), with fixed-address and stride assumptions.
- [ ] Implement validation that rejects missing language entries or unknown register/action identifiers. Do not introduce Zod solely for static TypeScript types; use runtime checks at authored-input boundaries.
- [ ] Add an import check using TypeScript's parser/module resolution: files under `src/visuals`, `src/video`, `src/lesson`, `content/lessons` and `src/assessment` cannot directly or transitively depend on `src/processor` or the PL24 codec. Application composition and `src/adapter` are the approved bridge. Runtime lesson controls receive an injected session interface rather than import the engine.
- [ ] Run `npm run test -- tests/unit/teaching-contract.test.ts tests/unit/boundaries.test.ts`; verify intentional leakage fixtures fail the validator while clean fixtures pass. Then run `npm run check:boundaries` and commit.

### Task 3: Implement raw state, encoding and decode

**Files:** `src/processor/pl24/{state,encoding,decode}.ts`; test `tests/unit/pl24-codec.test.ts`.

- [ ] Write failing cases from architecture §4: LDM #5=0x010005; LDD 200=0x0A00C8; END=0x900000; zero word invalid; mode 7 invalid; MOV with ACC invalid; no-operand encoding with nonzero operand invalid.
- [ ] Implement the complete 24-mnemonic legal-mode table from the architecture specification. Keep encode/decode pure and reject out-of-range values before bitwise conversion. Extract opcode=`floor(word/2**19)`, mode=`floor(word/2**16)%8`, operand=`word%2**16` only after validating an integer in the word range.
- [ ] Define fixed-width numeric registers and zero-default RAM. Initialise SR, queues and latches consistently even though M1 exposes neither arithmetic nor interrupts. Do not use metadata to distinguish executable RAM.
- [ ] Add round-trip tests for every legal form, including relative offset bounds and register operands, plus every reserved opcode and illegal opcode/mode pairing. This proves encoding, not execution support.
- [ ] Run `npm run test -- tests/unit/pl24-codec.test.ts`; expect all hand-calculated cases and legality checks to pass. Commit.

### Task 4: Atomic fetch, decode and recovery

**Files:** `src/processor/pl24/fetch.ts`, `src/processor/history/{transitions,replay,recovery}.ts`; tests `tests/unit/fetch.test.ts`, `history.test.ts`.

- [ ] Write the independent expected trace for PC=100 and raw RAM[100]=0x010005: MAR=100; PC=101; address bus active; read asserted; MDR=0x010005 with buses cleared; CIR=0x010005; legal LDM decode. ACC remains unchanged and no instruction retires.
- [ ] Implement exactly the seven fetch/decode micro-steps in architecture §6. Each emits one indivisible MACHINE_TRANSITION; detail events are informational. Define and validate the event envelope: increasing sequence number, instruction-instance ID, educational tick, micro-step, reason, provenance and complete mutation payload. Successful steps increment the tick; an invalid decode enters error with a diagnostic without incrementing a successful-step tick or retiring an instruction. Decode completion is the lesson's terminal boundary, not instruction execution or processor halt.
- [ ] Implement immutable transition IDs, replay and checkpoints for all latches/buses/registers/RAM. Diagnostics preserve completed fetch state and do not execute the invalid instruction. Reject requests beyond supported fetch/decode capability.
- [ ] Implement undo, reset-instruction and reset-scenario with appended STATE_RESTORED transitions. Restoration must include phase, educational ticks and sequencer position. Never partially restore one atomic step.
- [ ] Add PC=65,535 wrap, zero-word decode error, annotation-independent decode, replay equivalence, undo from each micro-step and reset-then-repeat cases. Add deterministic property cases over valid entry addresses and literal operands, keeping source expectations independent from the fetch reducer. Verify the current instruction ID remains traceable after a recovery event. Test developer UNDO_EVENT after undo/reset: it reverses the latest restoration as specified, skipping non-state diagnostics. Keep this separate from learner undoTeachingStep, which navigates completed teaching boundaries.
- [ ] Run `npm run test -- tests/unit/fetch.test.ts tests/unit/history.test.ts`; expect exact before/after states and monotonically increasing event IDs. Commit.

### Task 5: Build scenarios and truthful teaching steps

**Files:** `content/scenarios/fetch.ts`, `src/adapter/{pl24,build-scenario,project-fetch,session}.ts`, `scripts/build-trace.ts`; tests `tests/unit/fetch-adapter.test.ts`.

- [ ] Define the four scenario rows above using semantic LDM instructions; keep the architecture version in an internal binding file, not the content package. Encode/load through Task 3.
- [ ] Validate required stride=1, legal entry words and fixture value ranges. A test profile advertising stride=3 must be rejected before producing a Lesson 10 frame. No second CPU needs to be implemented.
- [ ] Project actual transitions into five stable teaching actions: copy address; advance PC; memory read (group bus micro-steps 3–5); copy instruction; decode. Preserve every underlying transition ID and actual numeric value. Use activePath rather than physical bus width in the diagram. The grouped memory-read frame carries three ordered transferCues from real transitions: MAR/address bus to memory, CU/read signal on control bus, then memory/data bus to MDR. Include each actual address/value/signal and transition ID; do not regenerate intermediate values in React. These cues are played in order and available as a text sequence for reduced motion. They do not introduce additional learner undo checkpoints.
- [ ] Expose an injected session API: `getFrame`, `nextTeachingStep`, `undoTeachingStep`, `resetInstruction`, `resetScenario`, `getEvidence`. Supported learner controls advance semantic steps only; raw micro-step controls remain developer-only for M1.
- [ ] Keep teaching-step checkpoints at group boundaries. UndoTeachingStep performs a single restoration to the prior complete teaching boundary through the history API; it does not leave the learner midway through the grouped memory read. After restore, rebuild the projected frame from restored state and branch the teaching history correctly; old raw events remain immutable.
- [ ] Generate replayable frames for video from the same real fetch pipeline. Test that altered raw memory changes the displayed instruction even when old annotations remain, and that no frame contains raw field-layout metadata.
- [ ] Run `npm run test -- tests/unit/fetch-adapter.test.ts` and `npm run build:trace`; expect all four scenario traces, named correctly, with no teaching leakage. Assert the three memory-read cues occur in address/read/data order and still carry MAR=100 after PC has become 101. Commit.

## Chunk 2: A complete guided lesson

### Task 6: Author preparation, RTN and parent guidance in both languages

**Files:** `content/curriculum.ts`, `content/lessons/l10/{en,zh,index,assessment}.ts`, `scripts/validate-content.ts`; test `tests/unit/l10-content.test.ts`.

- [ ] Author a preparation card for each prerequisite named in Scope. Use an address/value contrast and a copy operation before any RTN. Introduce only the components needed by the next step and define their names in English and Mandarin.
- [ ] Author RTN primer segments for destination/source, copying without clearing, `[R]`, `[[R]]`, arithmetic and sequential state. Explicitly distinguish descriptive notation from a fetched assembly instruction. Do not explain physical word size/addressing units.
- [ ] Use these English anchors and author natural Mandarin equivalents: “The address is copied; the PC keeps its value.” / “地址被复制，PC 中的值不会因此被清除。”; “Read the address in MAR, then read the contents at that address.” / “先读取 MAR 中的地址，再读取该地址处存储的内容。” Review all other wording for matching meaning rather than word-for-word translation.
- [ ] Write the parent card's Prepare/Watch/Ask/Coach/Check/Review entries. Each prediction has two hints, expected reasoning and a misconception. For MAR versus PC, first hint: “Which register changed?”; second: “MAR already received a copy before PC increased.”
- [ ] Include explicit RTN→plain-language and plain-language→RTN exercises, plus before/after state predictions for both a single line and a sequence. Author four fetch RTN lines exactly as in programme §11.2; use the worked/guided/independent/retrieval fixtures consistently. Describe LDM #n as an instruction being collected; do not teach or claim its execution in this milestone.
- [ ] Attach source references to the official syllabus and local notes. Correct the notes' PC-to-MAR external-address-bus simplification using the approved specification. No copied past-paper question text in learner assets.
- [ ] Build content validation for bilingual completeness, required fields, stable IDs, valid scenario references and missing parent hints. Run `npm run validate:content`; expect L10 complete and no claims that prerequisite previews complete L1–9. Commit.

### Task 7: Predictions, RTN readiness and assessment

**Files:** `src/assessment/{rtn,attempts}.ts`; tests `tests/unit/rtn-assessment.test.ts`, `attempts.test.ts`.

- [ ] Write failing scoring cases for the five readiness parts: transfer direction/copy retention; `[PC]`; `[[MAR]]`; PC increment; a two-line copy-then-increment trace. Every part must be correct without hints before fetch recall is unlocked.
- [ ] Implement bounded answers using destination/expression choices, short numeric answers and a reorder control with keyboard alternatives. Normalise insignificant whitespace in text RTN but do not silently accept single brackets for double brackets or reversed arrows. Keep free prose graded by displayed marking points, not automatic language judgement.
- [ ] Preserve committed predictions until reveal. A changed answer creates a new attempt; showing a hint marks that attempt assisted. A failed gate returns to the relevant example and offers an altered-value retry.
- [ ] Score the independent fetch task against authored expectations: PC/MAR distinction, correct MDR/CIR instruction, and ordered RTN. Each one/two-mark item requires all marking points; longer responses use the programme's 80% threshold.
- [ ] Add a delayed retrieval version using different values. Retain English exam response prompts with Mandarin explanatory support.
- [ ] Run `npm run test -- tests/unit/rtn-assessment.test.ts tests/unit/attempts.test.ts`; expect no unlock on hinted answers, incomplete readiness or reordered wrong RTN. Commit.

### Task 8: Shared diagrams and learner controls

**Files:** `src/visuals/{tokens,MemoryGrid,RegisterCard,FetchDiagram}.tsx` (use `.ts` for tokens), `src/app/{main,App}.tsx`, `styles.css`, `src/lesson/{Preparation,FetchActivity,Prediction,ParentCard}.tsx`; component tests `tests/component/fetch-activity.test.tsx`.

- [ ] Establish shared geometry, readable bilingual labels, register colours reinforced with names/shapes, and transfer paths. Begin with a small memory grid and add registers only as preparation introduces them. Dense future controls remain absent.
- [ ] Render exclusively from TeachingFrame props. Values use unpadded decimal or decoded instruction text; no PL24 branding, bit-field layout, physical widths or hidden capacity labels.
- [ ] Implement one prominent next-step control, prediction submission before reveal, undo, restart instruction and restart activity. Disable unsupported execute/run controls instead of showing inert buttons.
- [ ] Connect the gate and parent hints without exposing the correct outcome before prediction. Switching language preserves state and attempt identity. Undo/restart updates machine state but does not erase completed attempt history or let a revealed task count as an unseen independent attempt.
- [ ] Provide keyboard operation, visible focus, text changes announced politely, reduced motion, and readable shared-tablet layout. Use transform/opacity for decorative travel; state changes are controlled by the session, not animation callbacks.
- [ ] Run `npm run test -- tests/component/fetch-activity.test.tsx`; check a keyboard-only prediction/reveal/undo/reset flow and language switching. Inspect at laptop and tablet widths. Commit.

### Task 9: Progress, retrieval and resumable lesson flow

**Files:** `src/progress/{store,mastery}.ts`; tests `tests/unit/progress.test.ts`; modify `src/app/App.tsx`.

- [ ] Record a versioned local progress envelope keyed by stable lesson/scenario IDs: narration choice, watch position, attempts/hints, independent result, checked marking points and retrieval timestamps.
- [ ] Implement Introduced/Practised/Secure/Needs-review exactly as programme §15.5. Use an injected clock in tests: Secure requires independent no-hint success plus an eligible retrieval at least 24 hours later. Watching alone cannot award it.
- [ ] Schedule next-session, about seven-day and about twenty-one-day retrieval. Apply the 80% or hint review rule. Avoid background notifications or an account system.
- [ ] On RESET_SCENARIO, clear only current-attempt evidence and retain completed records. Reload resumes the last lesson position but starts a fresh fetch attempt from the scenario initial state; do not claim a partially replayed trace is an unseen assessment.
- [ ] Handle corrupt/unknown-version progress by preserving the usable lesson and explaining that progress could not be restored. Do not crash or reinterpret an incompatible saved engine state.
- [ ] Run `npm run test -- tests/unit/progress.test.ts`; check time boundaries, hinted retrieval, resets and corrupt records. Commit.

## Chunk 3: Bilingual media, integration and handoff

### Task 10: Storyboard V10 using the same teaching frames

**Files:** `src/video/{Root,FetchLesson}.tsx`, `timing.ts`, `content/lessons/l10/index.ts`; test `tests/unit/video-timing.test.ts`.

- [ ] Read Remotion guidance on compositions, timing, audio and captions. Use deterministic frame-based animation; do not run the CPU or advance React wall-clock timers while rendering.
- [ ] Build two chapters: notation primer, then four fetch transfers. Target 3–6 minutes per narration edition, allowing different language timings. Preparation is an interactive warm-up outside this video.
- [ ] Use the shared diagram components and Task 5's compiled frames. Scene timing may differ from machine ticks. The same event outcome must be visible in both media and interaction. Animate all three ordered memory-read cues, including the address bus and CU read control, before showing the final MDR value; do not collapse them into an unexplained memory-to-register arrow.
- [ ] Mark pause cues after copy semantics, double lookup and PC increment, with matching parent-card prompts. The interactive player pauses there; the exported video shows a clear pause-and-predict cue without pretending it can wait for an answer.
- [ ] Register separate EN/ZH composition props with shared semantic scene IDs. Test that all required scene IDs and pause cues exist in both editions and frame intervals do not overlap accidentally.
- [ ] Run `npm run test -- tests/unit/video-timing.test.ts` and render sample stills through Task 12's render tool once available. Commit source changes.

### Task 11: Produce narration and four caption tracks

**Files:** `scripts/narrate.ts`, `public/media/l10/`, authored narration segments in `content/lessons/l10/en.ts` and `zh.ts`; test `tests/unit/media-manifest.test.ts`.

- [ ] Verify actual installed voices with `say -v '?'`; audition short English and Mandarin segments locally. Start with available ordinary voices (e.g. Eddy English US and Eddy Chinese mainland), record the chosen exact names and rates in a reproducible manifest. No external TTS account or paid service is assumed.
- [ ] Implement `npm run narrate -- --lesson l10` to produce per-segment intermediate audio files under `artifacts/l10/narration/` with `say`, convert with FFmpeg to browser-compatible compressed audio and measure actual durations. Invoke processes with argument arrays; never interpolate narration into a shell command.
- [ ] Create one EN narration edition and one Mandarin edition. For each edition, create both EN and ZH WebVTT tracks aligned to that edition's segment durations: EN-audio/EN-text, EN-audio/ZH-text, ZH-audio/EN-text, ZH-audio/ZH-text. Translated captions must be timed separately rather than reusing timestamps from the other audio edition.
- [ ] Produce complete transcripts and cue manifests. Expand acronym pronunciation in narration as needed while retaining PC/MAR/MDR/CIR in visual labels. Listen to the entire output for both languages and correct pauses/pronunciations in source scripts.
- [ ] Validate files exist, all cues fall inside the audio duration and no caption is silently empty. If a voice cannot produce usable output, retain transcripts and finish independent tasks, but mark media acceptance blocked; do not call a silent video a completed narrated edition.
- [ ] Run `npm run test -- tests/unit/media-manifest.test.ts` and `npm run narrate -- --lesson l10`. Record pronunciation/media QA; commit authored scripts/manifests, not large generated caches.

### Task 12: Render and integrate the hybrid experience

**Files:** `scripts/package-media.ts`, `scripts/render-video.ts`, `src/lesson/LessonPlayer.tsx`; generated `artifacts/l10/`; modify `src/video/timing.ts`, `src/app/App.tsx`; test `tests/component/lesson-player.test.tsx`.

- [ ] Implement `npm run package:media -- --lesson l10` before rendering: copy approved compressed audio, four VTT tracks, two transcripts and their duration/checksum manifest from artifacts into `public/media/l10/`. Validate every referenced file and fail on missing/mismatched assets. Track these modest browser runtime assets in Git; do not ignore them. Keep uncompressed intermediates and exported MP4s under ignored artifacts.
- [ ] Implement `npm run render:video -- --lesson l10 --language en` and the corresponding `zh` command. Use local Remotion rendering, H.264 MP4, 1920×1080 at 30 fps; calculate duration from actual narration and authored pauses. Add `--stills` for chapter starts, RTN symbols and every fetch-transfer result.
- [ ] Export V10-en.mp4 and V10-zh.mp4 plus their four appropriately named VTT sidecars and two transcripts. The browser player must expose language/subtitle selection; exported sidecars preserve both subtitle languages without relying on burned-in text.
- [ ] Integrate Remotion Player with caption overlay, keyboard controls, playback speed, pause/replay and progress reporting. Use edition-specific caption timing and preserve conceptual scene position when changing narration editions.
- [ ] At each required pause, offer the corresponding prediction/activity; do not auto-advance past an unanswered question. Ensure animation completion is independent of machine computation and assessment scoring.
- [ ] Test missing media: show available alternative narration and transcript without crashing or falsely marking a segment viewed. Run `npm run test -- tests/component/lesson-player.test.tsx`.
- [ ] Inspect every key still, both full videos and browser playback. Check RTN arrow/bracket legibility, Mandarin font coverage, audio sync, no clipping and no hidden architecture details in captions or narration. Commit scripts/components and a render manifest identifying outputs and hashes.

### Task 13: End-to-end acceptance and build verification

**Files:** `tests/e2e/l10.spec.ts`, `docs/verification/m1-acceptance.md`; update `README.md`.

- [ ] Write browser acceptance for fresh load → prerequisite warm-up → failed RTN gate → targeted review → successful no-hint gate → guided prediction → undo → changed independent task → English marking-point check → reload.
- [ ] Add language-switch, reduced-motion, keyboard navigation, 1280×800 and 768×1024 viewport cases. Assert hidden architecture identifiers/width labels/raw opcode fields do not appear on lesson, parent or assessment surfaces. Explicit “8-bit” teaching examples elsewhere are not globally forbidden by the test.
- [ ] Verify the worked trace agrees with separately authored expectations and video frames at each teaching boundary. The independent task must use different values and no revealed/hinted attempt may count as the independent success.
- [ ] Configure coverage to include all implemented processor/codec/history/adapter production files: minimum 95% lines/statements/functions and 90% branches. Document exclusions for types/generated content; report uncovered branches. Maintain a requirement-to-test matrix with execution and interrupts explicitly deferred beyond M1. Deliberately skip PC increment and corrupt an undo restoration locally, demonstrate test failure, then restore correct code.
- [ ] Run `npm run test`, `npm run test:coverage`, `npm run check:boundaries`, `npm run validate:content`, `npm run build`, and `npm run test:e2e` (configure Playwright webServer to start the local app). Expect all checks to pass; record commands and actual results once run, not planned outcomes as evidence.
- [ ] Run both rendering commands and inspect the outputs. Record file paths/hashes, spoken-language checks and all remaining limitations. Do not broaden tests repeatedly after a passing unchanged run without a specific unresolved concern.
- [ ] Verify the production build with `npm run preview`, including media and reload. Store generated teaching-frame JSON under `src/video/generated/l10/` as small tracked derived assets; verify regeneration matches. Run `npm run package:media -- --lesson l10` and track the approved compressed browser audio/captions/transcripts/manifest. The browser uses Remotion Player and these audio assets, so exported MP4s can remain optional local downloads. Verify a clean temporary checkout containing only tracked files passes `npm ci`, `npm run build` and production-playback media checks without macOS narration tools. Vercel will build from those same packaged runtime assets after user verification. Rendering/narration tools remain authoring-only. Do not deploy before the user verifies the app.
- [ ] Document local run instructions, lesson/media locations, architecture isolation, milestone scope and what remains unimplemented. Commit the acceptance report and necessary fixes.

### Task 14: Parent/learner trial and execution handoff

**Files:** `docs/verification/m1-parent-trial.md`; update roadmap status.

- [ ] Prepare the actual trial card: start without developer explanation, answer the prerequisite prompts, predict one transfer, make/recover from one prepared mistake, finish the independent check and explain PC versus MAR after increment.
- [ ] Deliver the working local app and two videos to the user. Request the parent-guided trial when the artifacts are ready; no new automated task, message to another person or recording is implied.
- [ ] Record what the parent and son actually report/observe. If no session has happened, state “software verified; learner trial pending.” Never simulate human acceptance with an agent or invent evidence.
- [ ] Fix observed navigation/conceptual blockers, rerun only affected checks and complete delayed-retrieval evidence when the real elapsed-time condition is met. M1 delivery and the learner's mastery are separate statuses.
- [ ] Mark the milestone accepted only after its software/media requirements and real novice-use criteria are met. Then create the detailed M2 plan using findings; do not silently shrink or remove the roadmap's later lessons.

### Execution notes

Use the existing approved architecture; no design change to PL24 is requested by this plan. When splitting work among implementation agents, assign bounded files/tasks and keep engine semantics, content facts and teaching projection reviewed together. Use task-scoped commits; do not stage unrelated workspace files. The public repository's first planning commit precedes these implementation commits.

M1 is deferred until M0 foundations have been taught and this plan’s preparation/pacing has been revisited. Running tests, rendering media and observing the learner are future work: none is claimed complete by writing this document.
