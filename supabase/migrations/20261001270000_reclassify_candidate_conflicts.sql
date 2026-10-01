with target_counts as (
  select batch_key, surface_form, count(distinct proposed_target) as target_count
  from public.vocabulary_lemma_candidates
  group by batch_key, surface_form
)
update public.vocabulary_lemma_candidates c
set ambiguous = t.target_count > 1,
    review_required = t.target_count > 1
from target_counts t
where c.batch_key = t.batch_key and c.surface_form = t.surface_form;
