# Business in Context

## Goal

Add a bilingual Cambridge Business learning page to the existing Computer Science learning site at `/business`. The page should help an AS student understand and use business vocabulary in realistic situations instead of memorising isolated flashcards.

## Audience and scope

- Audience: a Chinese-speaking learner studying Cambridge International AS & A Level Business 9609.
- Include every vocabulary item in the supplied `AS-definitions.pdf`, across its five AS units (300 entries extracted from the document).
- Keep the five source PDF Units as the primary groups, then organise entries within each Unit under their closest numbered AS syllabus sections and detailed subtopics (for example 1.1.1). Sort these subtopics by Cambridge syllabus number. A term stays in its source Unit even when the closest Cambridge reference belongs elsewhere; the numbered heading makes that cross-reference visible.
- Do not add A Level topics 6–10, spaced-repetition scheduling, quizzes, accounts, or progress tracking.

## Entry content

Each entry contains the source English term, a concise Chinese equivalent, the English definition from the supplied list, a clear Chinese explanation of the concept, one original medium-level sentence from a plausible business setting, and a natural Chinese translation of that sentence. Do not add a second paraphrase of the sentence; add a short usage note only when the example would otherwise be ambiguous.

Examples should sound like something a manager, employee, adviser, supplier, or business report could plausibly say. They should show how the term helps describe a decision, result, or problem. Keep examples concise enough to read and print comfortably. Correct obvious source errors in the Chinese explanation while preserving the source term and its intended concept.

## Interaction and navigation

- Follow the site's existing editorial paper-and-ink design.
- Provide a `/business` page linked from the home catalogue.
- Provide navigation by the five AS units and the Cambridge syllabus topic/subtopic numbering (1.1–5.5, including detailed headings such as 1.1.1).
- Keep subtopic term lists collapsible so a large unit is manageable.
- Provide one search across English terms, Chinese terms, and definitions.
- Put a direct “print this subsection” action on each syllabus subsection and a direct “print this chapter” action on each source Unit.
- Print the complete chosen subsection or Unit, independent of the current search query.
- On paper, omit navigation and controls, preserve legible hierarchy, and avoid splitting a term card across pages where possible.
- Make navigation, search, selection, and disclosure controls usable by keyboard and screen readers.

## Data and architecture

Use local static TypeScript data, grouped into one file per source unit and imported by the page. No service, database, authentication, external API, or runtime PDF parsing is needed. Keep the source PDF outside the repository.

## Sources

- User-supplied term source: `/Users/song.yue/Documents/FAMILY/Doudou/A-Level/Busi/AS-definitions.pdf`.
- Cambridge International AS & A Level Business 9609 syllabus, examination 2026–2028: <https://www.cambridgeinternational.org/Images/697371-2026-2028-syllabus.pdf>.
- The Cambridge syllabus is used for topic numbering and scope; the user-supplied PDF remains the source of the vocabulary list.

## Acceptance criteria

1. `/business` loads directly and is reachable from the home page.
2. The page includes all 300 source entries with non-empty Chinese explanations and original bilingual examples.
3. Search finds terms by English or Chinese text; the active unit/topic structure remains clear.
4. A learner can directly print a complete subsection or Unit without first selecting terms.
5. At phone width the content remains usable without horizontal scrolling.
6. The page uses the existing site's visual language and does not change vocabulary scheduling or other routes.
