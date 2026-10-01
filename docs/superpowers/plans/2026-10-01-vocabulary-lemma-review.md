# Vocabulary Lemma Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let offline book imports create reviewable word-form candidates, let vocabulary admins approve merges in the website, and safely apply approved canonical mappings to every user's catalogue and learning state.

**Architecture:** Keep PDF extraction and spaCy inference offline. Import versioned review batches and candidate forms into Supabase, protected by admin-only RLS. An admin-only RPC applies an approved alias-to-canonical mapping transactionally; the app reads approved mappings and normalizes its static catalogue, account snapshot, and browser data at load time.

**Tech Stack:** Python 3.11, pinned spaCy English model, TypeScript/React, Supabase Postgres migrations/RLS/RPC, Vitest, existing Supabase CLI import approach.

---

## File map

- `scripts/extract_vocabulary.py`: retain existing PDF page/filter/token semantics and expose reusable raw occurrence/context extraction for candidate generation.
- `scripts/generate_vocabulary_candidates.py`: offline candidate generation; emits source/model metadata, per-form counts/POS, proposed lemma, and examples as JSON.
- `scripts/import-vocabulary-candidates.mjs`: idempotently imports a candidate JSON batch into Supabase without granting browser write access.
- `supabase/migrations/20261001090000_vocabulary_lemma_review.sql`: review batches, review candidates, approved aliases, RLS, and transactional review/merge functions.
- `src/vocabulary/lemmaMappings.ts`: pure client normalization for source entries, custom sources, and account state using approved aliases.
- `src/vocabulary/lemmaMappings.test.ts`: counts, forms, explanations, progress, draft, history, and malformed/cyclic mapping tests.
- `src/vocabulary/cloud.ts`: admin review APIs, approved-mapping read, and transactional RPC calls.
- `src/vocabulary/cloud.test.ts`: Supabase adapter behavior and error propagation.
- `src/vocabulary/LemmaReview.tsx`: separate admin review page with batch/filter/search, candidate examples, Merge, and Keep separate.
- `src/vocabulary/lemma-review.css`: responsive review-page layout and local action feedback.
- `src/vocabulary/LemmaReview.test.tsx`: permission, loading, decision, and error UI coverage.
- `src/main.tsx`: lazy route for `/vocabulary/merge`.
- `scripts/README-vocabulary-import.md`: repeatable offline setup, generation, import, review, and future-book checklist.

## Task 1: Extract candidate inputs without changing current extraction results

**Files:** `scripts/extract_vocabulary.py`, `scripts/test_extract_vocabulary.py`

- [x] Add a Python test that feeds a small text fixture containing `start`, `starting`, `started`, `programming`, `data`, and a punctuation/code line through the extraction helper. Assert the accepted surface counts and selected sentence contexts.
- [x] Run `python3 -m unittest scripts.test_extract_vocabulary -v`; confirm the new tests fail because extraction helpers do not exist.
- [x] Extract token acceptance and context collection into importable functions while preserving the current CLI's JSON schema and output for the checked-in Cambridge source.
- [x] Add an optional occurrence output containing accepted surface token, page-local text context, and the existing filters' counts; keep this output out of the default production catalogue JSON.
- [x] Run `python3 -m unittest scripts.test_extract_vocabulary -v` and rerun the existing extractor to `/tmp/coursebook-baseline.json`; assert it still reports 6,039 entries and 115,848 occurrences.
- [x] Commit the extraction refactor and tests.

## Task 2: Generate deterministic, pinned, offline lemma candidates

**Files:** `scripts/generate_vocabulary_candidates.py`, `scripts/requirements-vocabulary-lemma.txt`, `scripts/test_generate_vocabulary_candidates.py`

- [x] Add fixture tests for regular inflections (`start/starting/starts/started`), a derivational false friend (`program/programming`), an irregular/ambiguous form (`left`), deterministic sorting, and exact occurrence conservation.
- [x] Run `python3 -m unittest scripts.test_generate_vocabulary_candidates -v`; confirm candidate-generation tests fail before implementation.
- [x] Add a standalone script that consumes the extracted occurrences, applies `en_core_web_sm` with a fixed compatible spaCy version, and emits one candidate per surface-to-lemma pair with count, per-form POS evidence, examples, and ambiguity metadata. The script must not decide or apply merges.
- [x] Add pinned offline-tool requirements that install only into the user's Python environment and never into the Vite/npm application bundle.
- [x] Run the fixture tests, then generate `/tmp/cambridge-lemma-candidates.json` from the PDF. Assert candidate frequencies sum to the extracted occurrence count; print model versions and summary counts.
- [x] Inspect candidate groups for `start`, `program/programming`, `data`, `base/based`, `left/leave`, and `use`; revise candidate flags rather than auto-merging uncertain mappings.
- [x] Commit generator, pinned requirements, tests, and usage comments.

## Task 3: Add protected review tables and atomic merge RPCs

**Files:** `supabase/migrations/20261001090000_vocabulary_lemma_review.sql`, `supabase/tests/vocabulary_lemma_review.sql`

- [ ] Write SQL tests for batch/candidate uniqueness, default pending state, signed-out and ordinary-user denial, admin review access, and public read limited to approved aliases.
- [ ] Run the local Supabase database test command documented by the repository; confirm the new tests fail before the migration adds these objects.
- [ ] Add `vocabulary_lemma_batches`, `vocabulary_lemma_candidates`, and `vocabulary_word_aliases`. Candidate rows store source ID, surface form, proposed target, frequency, POS evidence, examples, ambiguity flag, model/version, and `pending|merged|kept` status.
- [ ] Add RLS that lets only admins read/update review rows; expose only the approved alias mapping to anon/authenticated catalogue clients. Revoke direct client writes to aliases.
- [ ] Add an admin-only review-decision RPC and an admin-only merge RPC. The merge RPC validates a terminal target, rejects cycles/self-merges, records the alias, combines catalogue/source counts and forms, and runs all state migration in the same transaction.
- [ ] In the merge RPC, move alias explanations only when the target has none; otherwise delete the alias explanation. Re-key cloud snapshot notes/progress/drafts using the spec's precedence rules; leave sent history JSON untouched.
- [ ] Test multiple sources, repeated imports, previously approved aliases, conflicting/non-conflicting explanations, state collisions, transaction rollback, and immutable history; run SQL tests and review the migration diff.
- [ ] Commit the migration and SQL tests.

## Task 4: Import candidate batches idempotently

**Files:** `scripts/import-vocabulary-candidates.mjs`, `scripts/import-vocabulary-candidates.test.mjs`

- [ ] Test input validation for source ID, model metadata, candidate fields, frequency, examples, and duplicate alias-target rows using temporary JSON fixtures.
- [ ] Run `node --test scripts/import-vocabulary-candidates.test.mjs`; confirm tests fail before the importer exists.
- [ ] Implement a CLI matching the current Supabase CLI `db query --linked --file` pattern. Insert/upsert the batch by a stable batch key and candidates by batch/surface/target; do not change approved mappings or live word rows during import.
- [ ] Add `--dry-run` output with batch ID, candidate count, and frequency total. Use mode `0600` temporary SQL files and delete them after every call, following the existing importer.
- [ ] Run CLI tests and a dry-run against `/tmp/cambridge-lemma-candidates.json`; verify no Supabase mutation occurs in dry-run mode.
- [ ] Commit the importer and tests.

## Task 5: Normalize catalogues and user state through approved aliases

**Files:** `src/vocabulary/lemmaMappings.ts`, `src/vocabulary/lemmaMappings.test.ts`, `src/vocabulary/cloud.ts`, `src/vocabulary/cloud.test.ts`, `src/vocabulary/Vocabulary.tsx`

- [ ] Add pure-function tests proving alias entries collapse into targets, frequencies and forms are conserved, examples remain bounded/deduplicated, and unknown/cyclic maps fail safely without losing the original state.
- [ ] Add tests for personal notes, known/hidden/review fields, due/last-sent precedence, de-duplicated drafts, browser-local state, custom sources, and untouched sent history snapshots.
- [ ] Run `npm test -- src/vocabulary/lemmaMappings.test.ts`; confirm it fails before the normalizer exists.
- [ ] Implement canonical-map resolution and deterministic source normalization; preserve alias spellings in target forms for search.
- [ ] Implement state normalization: `known` OR, maximum stage, latest `lastSent`, earliest non-null due, target explicit hidden preference preferred, alias note moves only if target note is absent, conflicting alias note is removed, draft aliases become target and duplicates collapse, history is unchanged.
- [ ] Fetch approved mappings from the public-readable table in `cloud.ts`; when no Supabase client exists or the request fails, retain the current source and retry on next load instead of blocking the vocabulary page.
- [ ] Apply mapping normalization to the static coursebook, account/cloud snapshot before validation, custom sources, guest/local browser data, and newly loaded sources. Persist successfully normalized local/cloud state using existing save flows.
- [ ] Run focused vocabulary tests, then `npm test`; review occurrence conservation and failure fallbacks.
- [ ] Commit the normalizer, cloud adapter, component integration, and tests.

## Task 6: Build the admin-only candidate review page

**Files:** `src/vocabulary/LemmaReview.tsx`, `src/vocabulary/lemma-review.css`, `src/vocabulary/LemmaReview.test.tsx`, `src/vocabulary/cloud.ts`, `src/main.tsx`

- [ ] Add component tests for signed-out, non-admin, and admin users; pending/merged/kept filters; frequency ordering; search; local Merge/Keep feedback; and RPC failures.
- [ ] Run `npm test -- src/vocabulary/LemmaReview.test.tsx`; confirm the tests fail before adding the route and page.
- [ ] Add cloud functions to list batches/candidates and submit the reviewed decision; rely on database authorization for access control.
- [ ] Add a lazy `/vocabulary/merge` route and a restrained review UI showing source, target, frequency, forms, POS/ambiguity, and examples, with adjacent actions and per-row feedback.
- [ ] Ensure admin status is checked before fetching pending rows; non-admin pages show a simple unavailable message and receive no candidate data from the database.
- [ ] Run page tests and `npm run build`; verify keyboard operation, responsive layout, and route access through the local browser.
- [ ] Commit the review page, route, adapter, and tests.

## Task 7: Run the initial Cambridge batch and document future imports

**Files:** `scripts/README-vocabulary-import.md`, `docs/superpowers/plans/2026-10-01-vocabulary-lemma-review.md`

- [ ] Document the exact local Python setup, pinned model install, candidate generation command, dry-run/import command, admin review route, and steps to process another book.
- [ ] Run the generator for the Cambridge PDF and verify extracted/candidate occurrence totals match exactly.
- [ ] Apply the versioned migration to the linked Supabase project only after local SQL tests pass; then import the initial candidate batch idempotently. Do not approve candidates automatically.
- [ ] Sign in as the admin and review the most frequent candidates first, inspecting at least `start`, `program/programming`, `data`, `base/based`, and `left/leave`. Record only explicit Merge/Keep decisions; leave uncertain proposals pending.
- [ ] Verify a confirmed mapping is reflected for a signed-out user and an account user, alias search works, a second source can reuse the mapping, explanations obey conflict rules, and sent history remains unchanged.
- [ ] Run `npm test`, `npm run build`, and the SQL test suite; check `git diff --check` and `git status`.
- [ ] Commit the import documentation and completed plan checkboxes.

## Self-review

- Spec coverage: offline generation/model versioning (Tasks 1–2), review schema/RLS/RPC/atomic state (Task 3), idempotent import (Task 4), runtime normalization and migration (Task 5), admin UI (Task 6), first book and repeatable future workflow (Task 7).
- Validation risks addressed: source occurrence conservation, false-friend sampling, service-side authorization, malformed/cyclic maps, personal state and explanation conflicts, and immutable sent history.
- Implementation remains in the current `main` checkout, matching the user's request to work on main. The supplied PDF remains untracked and must not be staged.
