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

Current automated verification: 29 unit/interface tests and 18 desktop/mobile browser checks pass.

For the first browser-test run, install Chromium with `npx playwright install chromium`. Browser tests exercise the production preview. To try that build yourself:

```sh
npm run preview
```

## Publish later

After the owner has tried and approved the working app, import this repository into Vercel as a Vite project. Use the repository root, build command `npm run build`, and output directory `dist`. The included `vercel.json` supports opening and refreshing lesson links directly. Vercel publishes the built app; planning documents and local source notes are not automatically website pages.

No Vercel project or automatic deployment has been set up as part of this implementation. No backend, account, environment secret or database is required.
