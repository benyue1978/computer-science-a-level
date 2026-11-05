# Business in Context Implementation Plan

> **For agentic workers:** Use the approved Business in Context design at `docs/superpowers/specs/2026-11-05-business-in-context-design.md`. Each data unit is an independent task; the React page consumes the shared `BusinessTerm` interface.

**Goal:** Add `/business` with the full AS vocabulary from the supplied PDF, Chinese explanations, original contextual examples, syllabus navigation, search, and direct printing by subsection or Unit.

**Architecture:** Keep the page and typed local glossary data under `src/business/`. Store each of the five source units separately, aggregate them in one data module, and render the same page at a direct route and from the home catalogue. The browser owns only transient search, disclosure, and print-scope state.

**Tech Stack:** React 19, TypeScript, CSS, Vitest, Testing Library, Vite.

---

## File map

- Create `src/business/businessTypes.ts` for the shared glossary entry and topic metadata types.
- Create `src/business/data/unit1.ts` through `src/business/data/unit5.ts`, one typed list per source unit.
- Create `src/business/businessData.ts` to combine the unit files and expose unit/topic metadata.
- Create `src/business/businessData.test.ts` to validate full source coverage and required bilingual content.
- Create `src/business/Business.tsx` and `src/business/business.css` for navigation, search, disclosures, and direct print controls.
- Create `src/business/Business.test.tsx` for search, disclosure, syllabus order, and direct print behavior.
- Modify `src/main.tsx` to mount the page at `/business`.
- Modify `src/Home.tsx` and `src/home.css` to link the page from the learning catalogue.
- Keep the supplied PDF outside Git; update README only if the final in-product instructions need durable documentation.

## Task 1: Define the data contract and coverage check

**Files:** create `businessTypes.ts`, `businessData.ts`, `businessData.test.ts`; create empty typed unit exports only as needed to keep imports coherent.

- [x] Add a test that expects 300 entries, all five unit IDs, unique entry IDs, non-empty term/Chinese equivalent/English definition/Chinese explanation/example/example translation, and valid syllabus topic IDs.
- [x] Run the focused test and confirm it fails because the glossary data is missing.
- [x] Define `BusinessTerm` with `id`, `unit`, `topicId`, `term`, `termZh`, `definitionEn`, `explanationZh`, `exampleEn`, `exampleZh`, and optional `usageNoteZh` fields.
- [x] Define a fixed syllabus section registry for AS 1.1–5.5 and detailed headings such as 1.1.1 so every term can be checked against a known section.
- [x] Export a deterministic combined entry array from `businessData.ts`.

## Task 2: Add the five source-unit datasets

**Files:** create `src/business/data/unit1.ts` through `unit5.ts`.

- [x] Extract the original terms and English definitions from the corresponding PDF unit; preserve one entry for every source bullet.
- [x] Map every term to the closest Cambridge AS topic/subtopic number and retain original Unit ordering within that group.
- [x] Add a concise, academically accurate Chinese term and explanation.
- [x] Write an original, plausible medium-level business sentence for each term and a natural Chinese translation.
- [x] Keep examples clearly contextual and distinct; do not reuse one generic sentence across unrelated terms.
- [x] Run `businessData.test.ts`; fix missing, duplicated, blank, or unmapped entries until it passes.

## Task 3: Build the browsable `/business` page

**Files:** create `Business.tsx`, `business.css`, `Business.test.tsx`.

- [x] Add failing tests for searching by English and Chinese text, collapsing a syllabus subsection, unique topic IDs across cross-references, and syllabus-number order.
- [x] Run the focused UI tests and confirm they fail before implementation.
- [x] Render a bilingual page header, return-home link, five unit anchors, global search, and syllabus-numbered collapsible topic groups.
- [x] Render every entry with the English term, Chinese term, English source definition, Chinese explanation, contextual English example, and Chinese translation.
- [x] Add direct print actions per subsection and Unit; use semantic buttons, headings, and `aria-expanded` states.
- [x] Keep state local to the current page; do not persist learning progress.
- [x] Run the focused UI tests and ensure search, disclosure, order, and direct print behavior passes.

## Task 4: Add direct print output

**Files:** modify `Business.tsx` and `business.css`; extend `Business.test.tsx`.

- [x] Add failing tests for direct subsection printing and full-Unit printing; verify active search does not filter printed content.
- [x] Add print controls to subsection and Unit headings.
- [x] On print, hide navigation and controls while retaining the chosen Unit/subsection context and all bilingual terms in its scope.
- [x] Use print styles for white background, dark text, compact margins, and `break-inside: avoid` on each term card.
- [x] Verify that native browser printing still prints the full glossary, while buttons scope output to the chosen subsection or Unit.

## Task 5: Integrate and review

**Files:** modify `src/main.tsx`, `src/Home.tsx`, `src/home.css`.

- [x] Add a lazy-loaded direct `/business` route before the general App route.
- [x] Add an editorial catalogue card linking to `/business` in both English and Chinese site-interface language states.
- [x] Run focused Business tests, the production TypeScript/Vite build, and the existing relevant home-page test.
- [x] Review the complete diff against the approved specification; confirm no user-owned unrelated files are staged.
- [x] Request an independent code review; fix reported issues and request a re-review.
- [ ] Commit only Business specification, plan, source, data, tests, and home/route integration; merge to local `main` and push `main`.
