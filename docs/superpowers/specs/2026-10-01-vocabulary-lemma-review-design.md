# Vocabulary lemma review design

## Goal

Consolidate inflected forms in the shared vocabulary catalogue without silently merging words that only look related. For each book, an offline process proposes lemma groups using the book text and context. An administrator reviews the proposals in the website. Confirmed mappings become reusable for later imports.

The first batch is the existing Cambridge IGCSE and O Level Computer Science Second Edition book. The coursebook remains a source for general English vocabulary; this feature does not attempt to curate only computer-science terminology.

## User flow

1. Run the existing PDF extraction filters locally, retaining surface forms, occurrence counts, and usable sentence context.
2. Run a pinned English lemmatizer offline to create a candidate import file. Do not let the model modify the live catalogue directly.
3. Import a review batch and its candidate word forms into Supabase. Each batch records its source and lemmatizer/version metadata. Candidate decisions start as pending.
4. An administrator opens a protected review page, sees candidates ordered by frequency, inspects the suggested target, forms, counts, and examples, then chooses **Merge** or **Keep separate**. Unreviewed candidates remain unchanged.
5. Applying a merge records a canonical-word mapping and migrates the catalogue and user state atomically. The browser applies approved mappings when it loads the static source catalogue, so the result is reflected without rebuilding the website.
6. For every later book, repeat the offline extraction and candidate import. Previously approved unambiguous mappings are reusable; new and ambiguous candidates still require administrator review.

## Candidate and decision data

Use versioned Supabase migrations for the review schema. Store an import batch with a source identifier, model name/version, and creation time. Store each proposed surface-form-to-target mapping with its source frequency, part-of-speech evidence when available, context examples, and a review state (`pending`, `merged`, or `kept`). Enforce uniqueness within a batch so rerunning an import is safe and does not duplicate candidates.

Only vocabulary administrators may read or change review batches and candidates. Enforce this with row-level security and database-side authorization, not only by hiding a link in the client. Approved canonical mappings may be read by the public client because they are needed to display the shared catalogue to signed-out users.

The review page is a separate vocabulary-admin route. It provides batch selection, frequency ordering, search/filtering, examples, the proposed target, and adjacent Merge / Keep separate actions with local feedback. It does not run the language model.

## Applying a merge

An administrator action calls one database-side operation so the alias mapping, shared catalogue records, source frequencies, and user state cannot be left half-updated. Reject self-merges, cycles, duplicate aliases, and targets that resolve back to the alias. Flatten or resolve existing mappings to one canonical target.

When alias `A` is merged into canonical word `T`:

- Combine source frequencies and occurrence counts under `T`; retain `A` as a searchable form of `T`.
- Keep the target's shared or personal explanation if both words have one. If only the alias has an explanation, move it to the target. Delete the alias explanation when the target already has one, as requested.
- Migrate each account's state: `known` is true if either word was known; keep the higher review stage; use the latest `lastSent` and the earlier non-null `due` date; keep the target's explicit hidden preference when present, otherwise use the alias preference. Replace the alias with the target in daily drafts and remove duplicates.
- Preserve sent-list history exactly as it was sent, including the old spelling and note snapshot.
- Do not erase the alias mapping; the mapping is the durable record used by catalogue loading and future imports.

The app must normalize both the public static coursebook source and account-local/cloud state through approved mappings before validating or presenting them. This covers signed-in, signed-out, and browser-only data. A target's counts/forms/examples are combined deterministically, with bounded examples as in the existing catalogue behavior.

## Offline extraction and future imports

Keep the current extraction's page selection, text filters, token rules, and frequency semantics. Add a separate offline candidate-generation/import stage rather than making the browser download or execute an NLP model. Pin the model and tool versions and include those versions in each batch. The output is an ordinary review JSON file that can be regenerated from the PDF; no PDF or model is uploaded to the website.

The candidate generator is conservative about automatic conclusions: it produces proposals only. POS/context disagreement, ambiguous forms, and likely derivations remain visible for human review. Keep extraction/review tooling out of the deployed frontend bundle.

## Access control and failure behavior

Candidate storage and decisions are admin-only in database policies. The public client can read only approved mappings. Merge operations run transactionally and report a useful error without changing state if validation or migration fails. Importing the same candidate file twice is idempotent. The existing catalogue remains available if the review tables contain no batches or no approved merges.

## Validation

- Unit-test candidate import parsing, duplicate protection, and form/frequency conservation.
- Test RLS: signed-out and ordinary accounts cannot read pending candidates or apply merges; administrators can review and decide.
- Test database merge behavior for both conflicting and non-conflicting explanations, multiple sources, existing aliases, draft/progress collisions, and immutable sent history.
- Test client normalization for static catalogue, cloud snapshots, custom sources, and browser-local state, including cycles and unknown aliases.
- Run the full test suite and production build.
- On the initial Cambridge batch, compare total retained occurrence counts before and after grouping and manually inspect high-frequency and known-risk groups such as `start`, `program/programming`, `data`, `base/based`, and `left/leave` before approving them.

## Out of scope

- Running lemmatization from a website button or serverless function.
- Automatically accepting all model proposals.
- Adding new authentication providers or changing who is an administrator.
- Changing the daily vocabulary, explanation, Known, or Sent-list workflows apart from safely migrating state when a merge is applied.
