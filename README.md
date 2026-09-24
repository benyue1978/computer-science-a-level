# Computer Science A Level — Processor Lab

Planning documents for a parent-guided learning programme aligned with Cambridge International AS & A Level Computer Science 9618, targeting the 2027 AS examination.

The programme combines short English/Mandarin Remotion videos, a browser-based processor simulator, guided activities and exam-transfer checks. It is an independent teaching project, not an official Cambridge product.

## Plans and specifications

- [Start here: Foundations Before RTN](docs/superpowers/specs/2026-09-25-foundations-before-rtn-design.md) — small teaching bites; the first activity explains memory, addresses and contents.
- [Whole-programme delivery roadmap](docs/superpowers/plans/2026-09-25-programme-delivery-roadmap.md) — all 34 lessons and their delivery milestones.
- [Later milestone: Memory to Fetch](docs/superpowers/plans/2026-09-25-memory-to-fetch-milestone-plan.md) — implementation tasks for a complete guided RTN/fetch lesson.
- [Learning programme specification](docs/superpowers/specs/2026-09-24-processor-fundamentals-learning-programme-design.md) — curriculum, interaction, bilingual media and assessment design.
- [PL24-v1 architecture specification](docs/superpowers/specs/2026-09-24-pl24-v1-processor-architecture.md) — internal teaching-processor design and correctness requirements.

## Status

Planning stage. The immediate next step is a tiny memory/address/content activity, followed by one foundational idea at a time. The complete simulator and hybrid RTN lesson remain later goals. No browser app or simulator has been implemented yet. Test and coverage requirements in the plans describe future acceptance criteria, not current test results.

The proposed processor is a project-specific implementation of Cambridge's example instruction meanings. Its encoding, widths and controller layout remain engineering details behind a stable teaching interface. Architecture changes must revalidate affected examples.

The eventual hosting target is Vercel, after the working app has been verified by the project owner. The browser build will run simulation locally; media will be rendered before deployment.

Referenced local study notes and source PDFs are not included in this repository. Links to the official syllabus and relevant public sources are listed in the specifications.
