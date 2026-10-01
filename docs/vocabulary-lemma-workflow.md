# Vocabulary word-form review workflow

The coursebook vocabulary file remains the source catalogue. Lemma suggestions are generated offline from its extracted occurrences and stored as a separate, review-only batch in Supabase. Importing candidates never edits catalogue words or approves a merge.

## Review the current coursebook batch

1. Sign in to the vocabulary page with the administrator Google account.
2. Open **Review word forms** in the account header, or visit `/vocabulary/merge`.
3. Choose **Merge all safe suggestions** to merge the batch in one action. The app processes proposals in small chunks. Only a surface form with multiple different proposed targets (for example, `uses` → `use` and `us`) stays separate.
4. The remaining review-required proposals can be checked individually from the same page, or left pending.

Approved mappings are applied to the page's catalogue and each account's saved notes, review progress, and daily draft. Sent-list history stays unchanged. If the target already has a shared explanation, the alias explanation is deleted; otherwise the alias explanation moves to the target. Targets missing from the original book are created when the merge is approved.

## Generate and import a batch

The extraction and language model run locally; the web page never runs the model. The report marks a candidate for review only when the same surface form has multiple distinct proposed targets. The importer preserves that flag for the bulk action. Keep the Python model in its isolated environment rather than adding it to the site bundle.

```sh
python3 -m venv /tmp/lemma-audit-venv
/tmp/lemma-audit-venv/bin/pip install -r scripts/requirements-vocabulary-lemma.txt
/tmp/lemma-audit-venv/bin/python -m pip install 'https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl'

python3 scripts/extract_vocabulary.py "Coursebook.pdf" /tmp/coursebook.json --occurrences /tmp/coursebook-occurrences.json
/tmp/lemma-audit-venv/bin/python scripts/generate_vocabulary_candidates.py \
  /tmp/coursebook-occurrences.json /tmp/coursebook-candidates.json \
  --source-id "stable-source-id" --source-name "Coursebook name"
node scripts/import-vocabulary-candidates.mjs /tmp/coursebook-candidates.json --dry-run
node scripts/import-vocabulary-candidates.mjs /tmp/coursebook-candidates.json
```

For a new book, add its source to the notebook, export a backup containing that book, and import the backup into Supabase. The catalogue importer updates per-book counts idempotently and merges forms/examples for words shared across books:

```sh
node scripts/import-vocabulary-to-supabase.mjs vocabulary-backup.json --dry-run
node scripts/import-vocabulary-to-supabase.mjs vocabulary-backup.json
```

Use a stable source ID. The app reads shared books from Supabase, so the new source becomes available to guest and signed-in users without rebuilding the static Cambridge file. Then generate and import its candidate report. The batch key includes the input occurrences and pinned model/package versions, so rerunning an identical report is safe; decisions from an existing batch are not overwritten.

`supabase/migrations/` holds all database changes. The current schema adds admin-only review tables, public read-only approved aliases, and administrator-only database functions for decisions and atomic merges. Do not insert aliases directly from the browser.
