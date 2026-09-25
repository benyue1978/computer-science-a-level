# Bite 7 RTN Notation Implementation Plan

**Goal:** Add a bilingual interactive lesson that teaches the Cambridge RTN assignment arrow, contents brackets, memory lookup, PC increment, and ordered lines.

**Architecture:** Add a lesson-local React component and authored EN/ZH content. Keep four examples and their state transitions inside that component; do not couple the workbench to PL24 or any shared processor model. Integrate a direct pathname route and seventh home invitation following the existing lesson pattern.

## Tasks

- [x] **Tests first:** Create `src/RTNNotation.test.tsx` for route/roles and example state transitions; run red. Add bilingual copy in `src/rtnNotationContent.ts` and a minimal `src/RTNNotation.tsx` shell; run focused tests.
- [x] **Implement examples:** Add failing tests and then the prediction/one-line transitions for `MAR ← [PC]`, `MDR ← [[MAR]]`, and `PC ← [PC] + 1`. Check all unchanged state and distinguish the two bracket levels.
- [x] **Implement sequence:** Add two event states for `MAR ← [PC]` then `PC ← [PC] + 1`, with a fresh learner prediction before each event. Add changed-value application check and reset.
- [x] **Integrate:** Add `/learn/rtn-notation`, localized title, seventh home invitation, state-preserving language switch and app route tests.
- [x] **Style and browser verification:** Add responsive workbench design and `tests/rtn-notation.spec.ts` for desktop/mobile interaction, keyboard prediction, all notation examples, language preservation, reset, direct reload and no overflow.
- [x] **Review and finish:** Run unit tests, production build and complete Playwright suite; run independent code review; fix material findings; mark the spec complete, commit and push to `origin/main`.

## Completion

Independent review caught and fixed one learner/computer role-label mix-up: before the first computer event, the computer-event area is now empty rather than showing a learner instruction. A regression test covers this. Verification: 51 unit tests, production build, and 42 desktop/mobile browser tests pass.

## Guardrails

- Use only Cambridge forms `MAR ← [PC]`, `MDR ← [[MAR]]`, `PC ← [PC] + 1` in learner-facing code examples.
- Do not introduce the complete fetch list, decode/execute, interrupt behavior, PL24 execution, instruction widths, or storage-unit specifics.
- Keep learner predictions distinct from computer events in UI labels, behavior, and tests.
- Author Chinese independently and preserve every state field when the language changes.
