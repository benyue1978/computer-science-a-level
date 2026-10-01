alter table public.vocabulary_lemma_candidates
  add column review_required boolean not null default false;

-- Earlier imports stored ambiguity but not the generator's broader review flag.
-- Recover the two existing review signals conservatively for this batch.
update public.vocabulary_lemma_candidates
set review_required = ambiguous
  or (right(surface_form, 3) = 'ing' and coalesce((pos_evidence ->> 'NOUN')::integer, 0) > 0);
