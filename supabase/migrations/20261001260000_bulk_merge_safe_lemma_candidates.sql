drop function if exists public.merge_all_safe_vocabulary_lemma_candidates(text, integer, uuid[]);

create function public.merge_all_safe_vocabulary_lemma_candidates(
  p_batch_key text,
  p_limit integer default 200,
  p_exclude_ids uuid[] default array[]::uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_candidate record;
  v_merged integer := 0;
  v_failed integer := 0;
  v_review_required integer := 0;
  v_failed_ids uuid[] := array[]::uuid[];
  v_remaining integer := 0;
begin
  if not (select public.is_vocabulary_admin()) then
    raise exception 'Vocabulary administrator access required' using errcode = 'P0001';
  end if;

  select count(*)::integer into v_review_required
  from public.vocabulary_lemma_candidates
  where batch_key = p_batch_key and status = 'pending' and review_required;

  for v_candidate in
    select id, proposed_target
    from public.vocabulary_lemma_candidates
    where batch_key = p_batch_key and status = 'pending' and not review_required
      and not (id = any(coalesce(p_exclude_ids, array[]::uuid[])))
    order by frequency desc, surface_form, proposed_target
    limit greatest(1, least(coalesce(p_limit, 200), 500))
    for update
  loop
    begin
      perform public.merge_vocabulary_lemma_candidate(v_candidate.id, v_candidate.proposed_target);
      v_merged := v_merged + 1;
    exception when others then
      -- Keep a failed proposal pending, but continue with other safe candidates.
      v_failed := v_failed + 1;
      v_failed_ids := array_append(v_failed_ids, v_candidate.id);
    end;
  end loop;

  select count(*)::integer into v_remaining
  from public.vocabulary_lemma_candidates
  where batch_key = p_batch_key and status = 'pending' and not review_required
    and not (id = any(coalesce(p_exclude_ids, array[]::uuid[]) || v_failed_ids));

  return jsonb_build_object('merged', v_merged, 'review_required', v_review_required, 'failed', v_failed,
    'failed_ids', to_jsonb(v_failed_ids), 'remaining', v_remaining);
end;
$$;

revoke all on function public.merge_all_safe_vocabulary_lemma_candidates(text, integer, uuid[]) from public, anon;
grant execute on function public.merge_all_safe_vocabulary_lemma_candidates(text, integer, uuid[]) to authenticated;
