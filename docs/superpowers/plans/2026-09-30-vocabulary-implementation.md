# Vocabulary Implementation Plan

**Goal:** Deliver the approved daily vocabulary picker on main.
**Architecture:** Existing React/Vite route, pure scheduling/import model, IndexedDB guest snapshot, Supabase account snapshots protected by row-level security, offline PDF extraction producing shipped JSON.
**Tech Stack:** React, TypeScript, Python standard library + pdftotext, Vitest, Playwright.

- [x] Add model tests for due priority, sent-only scheduling, recall intervals, hidden restoration, duplicate-safe imports, validated backup round-trip.
- [x] Implement src/vocabulary/model.ts and storage.ts. Validate imported data before writes; persist snapshots serially and surface errors.
- [x] Extract coursebook with scripts/extract_vocabulary.py into public/vocabulary/coursebook.json; remove publisher/footer artifacts and prefer readable prose examples. Keep a reversible basic-word hidden set.
- [x] Build src/vocabulary/Vocabulary.tsx with Today, All words, Known list, History and Data views; use scoped notebook-style CSS. Add route via main.tsx and home link via App.tsx.
- [x] Verify with npm test and npm run build. Add Playwright coverage for five-to-ten selection, notes surviving reload, send/review behavior, hide/restore, export/import and mobile overflow. Inspect actual rendered desktop/mobile screenshots.
- [x] Document usage, import format, extraction and local-storage limitations in README. Review diff and retain main branch.

Independent code review identified untrusted source fields and aggregate import limits; both are covered by regression tests and validated before committing imported data to browser storage.

Follow-up: added a dedicated Known list while keeping initially hidden common words distinct; older browser records migrate with an empty known status.

Follow-up: each All words and Known list card can open an explanation editor; updates persist on the shared word record and are reused in Today.

Follow-up: Supabase project/schema and public seed are provisioned. Google OAuth redirects, user-scoped cloud state and local-to-account migration are configured; Vercel has the public Supabase variables. Production Google-origin configuration and an end-user sign-in still need verification.
