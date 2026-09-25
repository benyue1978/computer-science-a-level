# Bite 7 — Reading Register Transfer Notation

**Date:** 25 September 2026  
**Course:** Cambridge International AS & A Level Computer Science 9618 (2027–2029)  
**Audience:** Beginner, guided study  
**Status:** Complete (25 September 2026)

## Purpose

Teach RTN as a compact way to describe a computer action that the learner already understands. This bite introduces assignment direction, contents brackets, memory lookup, increment, and ordered lines. It prepares the learner to read the complete fetch sequence in Bite 8 without presenting that sequence prematurely.

## Exam grounding

The 2027–2029 syllabus §4.1 requires candidates to describe the stages of the Fetch-Execute cycle and describe and use register transfer notation to describe it. The 2025 9618/13 mark scheme uses `MAR ← [PC]`, `PC ← [PC] + 1`, `MDR ← [[MAR]]`, and `CIR ← [MDR]`, with correct sequence as a marking point. Cambridge's 2023 examiner report separately warns that candidates should take care over bracket placement.

References:

- [Cambridge International 9618 syllabus, 2027–2029](https://www.cambridgeinternational.org/Images/721397-2027-2029-syllabus.pdf), §4.1.
- [9618/13 May/June 2025 mark scheme, Q2(a)(ii)](https://qualifiedquest.com/papers/a-level/computer-science-9618/2025/9618_s25_ms_13.pdf) (published Cambridge mark scheme).
- [Cambridge International 9618 June 2023 examiner report](https://www.cambridgeinternational.org/Images/673617-june-2023-examiner-report.pdf), Paper 1 report on processor/RTN questions.

## Outcomes

By the end, the learner can:

1. Read the left side of an RTN assignment as the destination and the right side as the value/action to evaluate.
2. Explain `[PC]` as the contents of PC and `[[MAR]]` as the contents at the memory location whose address is held in MAR.
3. Read `MAR ← [PC]`, `MDR ← [[MAR]]`, and `PC ← [PC] + 1` in plain language and predict their state changes.
4. Explain that RTN lines are carried out in order, so the value used by a later line reflects the state after earlier lines.

## Notation and examples

- `Destination ← expression`: evaluate the right-hand side, then place that result in the destination on the left. The arrow points toward the destination. A source register is read; copying does not empty it.
- `[PC]`: the value currently stored in PC.
- `[[MAR]]`: use the value in MAR as a memory address, then take the contents stored at that address. For example, MAR contains `17` and memory location `17` contains `42`, so `[[MAR]]` evaluates to `42`.
- `PC ← [PC] + 1`: calculate one more than the current PC value and store the result back in PC. In this Cambridge teaching example, the resulting address is the next instruction address. Keep the address representation and implementation-specific storage units out of the learner interface.
- A sequence is read and carried out from top to bottom. With PC initially `20`, the sequence `MAR ← [PC]` then `PC ← [PC] + 1` leaves MAR=`20` and PC=`21`: the first line uses the original PC value.

Use Cambridge RTN spellings and symbols exactly. The examples are authored teaching models, not executions on PL24 and not raw simulator state. Do not expose PL24 word width, byte addressing, PC stride, opcodes, assembly, or binary. Do not imply that `←` describes electrical direction on a bus; RTN describes a state update.

## Learner experience

Create one bilingual, responsive page at `/learn/rtn-notation`, matching the established lesson shell and visual language. Show one RTN idea at a time in a single interactive workbench with four named examples: **copy a register value**, **look up memory**, **advance PC**, and **read two lines in order**. A learner prediction and the computer event remain separately labelled.

For each example, show the initial values and the RTN line(s), ask the learner to predict the result, and only then enable a button that reveals one computer event. Prediction never changes the represented state. For the two-line example, require a fresh prediction before each computer event; show updated state after line one before asking about line two. Explain what changed, what stayed the same, and why the expression gives that result. No timer, score, or forced mastery gate.

At completion, offer a changed-value check using new values and the same notation so the learner applies the rule instead of recalling one displayed result. Do not show unanswered feedback. Changing language preserves selected example, event position, prediction, and answers; reset clears interaction state.

English and Simplified Chinese must receive equally complete explanations, prompts, event narration, and feedback. Keep learner tasks visibly separate from computer actions. Use semantic labels for the expression, state, prediction, and event; support keyboard focus, screen readers, reduced motion, and narrow mobile widths without horizontal overflow.

## Boundaries

- Do not combine the full four-line fetch sequence; Bite 8 does that.
- Do not add decode/execute, instruction encoding, assembly, interrupts, or the PL24 engine.
- Do not teach address width, byte/word units, or the simulator's physical PC stride.
- Do not add parent-facing copy to the learner page.

## Acceptance criteria

- The route and home card are available in both languages with localized title and copy.
- The assignment arrow's destination/source direction is unambiguous and tested.
- Single and double brackets are distinguished with live values, not just a glossary.
- Memory lookup demonstrates address-in-MAR versus contents-at-that-address.
- Increment shows the new next-instruction address without leaking implementation units.
- The two-line example proves order by using old PC for MAR before changing PC.
- Predictions do not mutate the computer; each computer event has one observable state transition.
- Language switching and reset follow the contracts above.
- Full unit/build/browser verification passes on desktop and mobile.

## Verification

- `npm test` — 9 files, 51 tests passed.
- `npm run build` — TypeScript and production build passed.
- `npm run test:e2e` — 42 desktop and mobile browser tests passed.
- `git diff --check` — passed.
