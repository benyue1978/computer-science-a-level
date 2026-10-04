# Computer Science A Level — Processor Lab

A browser app and planning documents for a parent-guided learning programme aligned with Cambridge International AS & A Level Computer Science 9618, targeting the 2027 AS examination.

The programme combines short English/Mandarin Remotion videos, a browser-based processor simulator, guided activities and exam-transfer checks. It is an independent teaching project, not an official Cambridge product.

## Plans and specifications

- [Start here: Foundations Before RTN](docs/superpowers/specs/2026-09-25-foundations-before-rtn-design.md) — small teaching bites; the first activity explains memory, addresses and contents.
- [Whole-programme delivery roadmap](docs/superpowers/plans/2026-09-25-programme-delivery-roadmap.md) — all 34 lessons and their delivery milestones.
- [Later milestone: Memory to Fetch](docs/superpowers/plans/2026-09-25-memory-to-fetch-milestone-plan.md) — implementation tasks for a complete guided RTN/fetch lesson.
- [Learning programme specification](docs/superpowers/specs/2026-09-24-processor-fundamentals-learning-programme-design.md) — curriculum, interaction, bilingual media and assessment design.
- [PL24-v1 architecture specification](docs/superpowers/specs/2026-09-24-pl24-v1-processor-architecture.md) — internal teaching-processor design and correctness requirements.

## Status

Three bilingual browser activities introduce memory, the processor and registers, then the meaning of copying a value. The third lesson uses before/after diagrams to show register-to-register and memory-to-register copies: the source remains unchanged while the destination is replaced. It deliberately does not teach buses, RTN or instruction execution yet. Learner prompts are separate from represented computer events; facilitator notes remain in the trial document. The home page is at `/`; activities are at `/learn/memory`, `/learn/processor-registers` and `/learn/copying-values`. The complete simulator and hybrid RTN lesson remain later goals. The parent/child learning trial is still pending; automated checks cannot establish whether the teaching is understood. Processor-engine coverage requirements in the wider plans apply to future work.

The proposed processor is a project-specific implementation of Cambridge's example instruction meanings. Its encoding, widths and controller layout remain engineering details behind a stable teaching interface. Architecture changes must revalidate affected examples.

The eventual hosting target is Vercel, after the working app has been verified by the project owner. The browser build will run simulation locally; media will be rendered before deployment.

Referenced local study notes and source PDFs are not included in this repository. Links to the official syllabus and relevant public sources are listed in the specifications.

## Run locally

Use Node.js 22.12 or newer and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server. Progress stays in memory only: resetting or refreshing starts the activity again. Switching language within the activity preserves the current stage and selection.

## Verify the app

```sh
npm test
npm run build
npm run test:e2e
```

Automated verification: run `npm test`, `npm run build`, and `npm run test:e2e` for the unit/interface and desktop/mobile browser checks.

For the first browser-test run, install Chromium with `npx playwright install chromium`. Browser tests exercise the production preview. To try that build yourself:

```sh
npm run preview
```

## Publish later

The site is deployed to Vercel from `main`. The vocabulary page uses Supabase Auth and Postgres for account sync; only the public Supabase URL and publishable key are exposed to the browser. OAuth client secrets remain in Supabase Auth configuration.

## Daily vocabulary

Open `/vocabulary` (also linked on the home page). Choose five words per day by default, adjustable to ten including reviews. Add or edit Chinese/English explanations from any word card in All words or Known list; the same saved note appears when you pick that word for today’s list. Signed-in vocabulary admins can generate a missing explanation from All words or Today. Generated text is saved as their private note; publishing it for everyone remains a separate action. Copy the list, send it yourself, then mark it sent. Sent words return after 3 days; Remembered advances to 7, 14, then 30 days, while Needs practice brings the word back tomorrow. Overdue reviews take priority over frequent new words. Words marked already known appear in the Known list and can be moved back to active words. Initially hidden common words remain separate under All words → Hidden.

Guests keep their notes, selection and history in IndexedDB in the current browser. Signing in with Google syncs private explanations and learning state to the signed-in account; the first sign-in copies the current guest data into that account. Each account is isolated from other accounts. Shared explanations are public and appear when no personal explanation is saved. Export a JSON backup in Books & backup before clearing browser data; restoring a backup replaces the current collection after showing a preview. Localhost, Vercel preview URLs and the production domain keep separate guest data.

The shipped collection is `public/vocabulary/coursebook.json`. It contains general vocabulary as well as technical vocabulary, with conservative grouping of selected inflections. Common function words are initially hidden but remain searchable. Extraction excludes publisher material, obvious code lines and footer noise. Frequency counts are approximate; uncommon abbreviations and extraction artifacts may remain. Sentence examples are extracted where readable, and are not invented. Initial data is loaded only when no saved collection exists; subsequent deployment updates do not overwrite personal progress.

To prepare another source, install Poppler (`pdftotext`) and run:

```sh
python3 scripts/extract_vocabulary.py 'Another book.pdf' public/vocabulary/another-book.json --id another-book --name 'Another book'
```

Optional `--first-page` and `--last-page` use PDF page numbers to omit publisher pages/indexes. For the supplied Cambridge edition, use `--first-page 14 --last-page 398`. Import the generated JSON through Books & backup. Reimporting the same source ID updates its counts without double-counting; different source IDs contribute separate frequencies. Notes and progress are preserved. Keep a stable source ID for each book.

Source JSON format:

```json
{
  "id": "maths-book",
  "name": "Maths book",
  "words": [
    {
      "word": "available",
      "frequency": 12,
      "examples": ["The information is available in several different formats."]
    }
  ]
}
```

Words must be lowercase English entries (apostrophes and hyphens allowed). Frequencies are positive integers; examples contain up to three short strings. An optional `forms` string array lists related spellings. The PDF is not included in deployment, but vocabulary and source examples in `public/` are publicly accessible. Supabase schema changes are versioned under `supabase/migrations/`; setup notes are in `docs/supabase-setup.md`.

Verification: `npm test`, `npm run build`, and `npx playwright test tests/vocabulary.spec.ts`.
