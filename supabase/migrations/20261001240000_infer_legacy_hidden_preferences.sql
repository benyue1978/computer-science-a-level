-- Infer pre-marker hidden choices from the word catalogue default during a merge.
create or replace function public.merge_vocabulary_lemma_candidate(p_candidate_id uuid, p_canonical text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_target text := lower(p_canonical);
  v_alias text;
  v_candidate public.vocabulary_lemma_candidates%rowtype;
  v_frequency bigint;
  v_forms text[];
  v_examples jsonb;
  v_state record;
  v_alias_progress jsonb;
  v_target_progress jsonb;
  v_progress jsonb;
  v_due text;
  v_last_sent text;
begin
  if not (select public.is_vocabulary_admin()) then
    raise exception 'Vocabulary administrator access required' using errcode = 'P0001';
  end if;
  select * into v_candidate from public.vocabulary_lemma_candidates
    where id = p_candidate_id for update;
  if not found then raise exception 'Lemma candidate not found' using errcode = 'P0001'; end if;
  v_alias := v_candidate.surface_form;
  if v_alias !~ '^[a-z][a-z''-]{0,59}$' or v_target !~ '^[a-z][a-z''-]{0,59}$' then
    raise exception 'Alias and canonical word must be valid lower-case vocabulary keys' using errcode = 'P0001';
  end if;
  if v_candidate.status = 'kept' then raise exception 'A kept candidate cannot be merged' using errcode = 'P0001'; end if;
  if v_alias = v_target then raise exception 'A word cannot be merged into itself' using errcode = 'P0001'; end if;
  if exists (select 1 from public.vocabulary_word_aliases where alias = v_target) then
    raise exception 'Canonical target must be a terminal vocabulary word' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.vocabulary_word_aliases where alias = v_alias and canonical <> v_target) then
    raise exception 'Alias is already approved for another canonical word' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.vocabulary_word_aliases where canonical = v_alias and alias = v_target) then
    raise exception 'Merge would create an alias cycle' using errcode = 'P0001';
  end if;

  -- A lemma can be absent from the book's surface-word catalogue. Create its
  -- canonical row from scratch so administrators can still approve it.
  insert into public.vocabulary_words(word, frequency, forms, examples)
    values (v_target, 0, array[v_target], '[]'::jsonb)
    on conflict (word) do nothing;

  -- Resolve old aliases when this canonical word is folded into a new terminal.
  update public.vocabulary_word_aliases set canonical = v_target where canonical = v_alias;

  select frequency, forms, examples into v_frequency, v_forms, v_examples
    from public.vocabulary_words where word = v_alias for update;
  if not found then
    insert into public.vocabulary_words(word, frequency, forms) values (v_alias, 0, array[v_alias]);
    v_frequency := 0; v_forms := array[v_alias]; v_examples := '[]'::jsonb;
  end if;
  update public.vocabulary_words target
    set frequency = target.frequency + v_frequency,
        forms = (select array_agg(form order by lower(form), form) from (
          select distinct unnest(target.forms || v_forms || array[v_alias]) as form
        ) forms_union),
        examples = (select coalesce(jsonb_agg(item order by first_position), '[]'::jsonb) from (
          select value as item, min(ord) as first_position
          from jsonb_array_elements(target.examples || coalesce(v_examples, '[]'::jsonb)) with ordinality e(value, ord)
          group by value
          order by min(ord)
          limit 3
        ) combined),
        updated_at = now()
    where target.word = v_target;

  insert into public.vocabulary_source_words(source_id, word, frequency)
  select source_id, v_target, frequency from public.vocabulary_source_words where word = v_alias
  on conflict (source_id, word) do update
    set frequency = public.vocabulary_source_words.frequency + excluded.frequency;
  delete from public.vocabulary_source_words where word = v_alias;
  insert into public.vocabulary_word_aliases(alias, canonical) values (v_alias, v_target)
  on conflict (alias) do update set canonical = excluded.canonical;

  if exists (select 1 from public.shared_explanations where word = v_target) then
    delete from public.shared_explanations where word = v_alias;
  else
    update public.shared_explanations set word = v_target where word = v_alias;
  end if;

  -- user_explanations was removed from this schema; account notes live in payload.notes.
  for v_state in select user_id, payload from public.user_vocabulary_state for update loop
    v_alias_progress := v_state.payload -> 'progress' -> v_alias;
    v_target_progress := v_state.payload -> 'progress' -> v_target;
    v_progress := null;
  if v_alias_progress is not null or v_target_progress is not null then
      v_alias_progress := coalesce(v_alias_progress, '{}'::jsonb);
      v_target_progress := coalesce(v_target_progress, '{}'::jsonb);
      v_due := case
        when v_alias_progress ->> 'due' is null then v_target_progress ->> 'due'
        when v_target_progress ->> 'due' is null then v_alias_progress ->> 'due'
        else least(v_alias_progress ->> 'due', v_target_progress ->> 'due') end;
      v_last_sent := case
        when v_alias_progress ->> 'lastSent' is null then v_target_progress ->> 'lastSent'
        when v_target_progress ->> 'lastSent' is null then v_alias_progress ->> 'lastSent'
        else greatest(v_alias_progress ->> 'lastSent', v_target_progress ->> 'lastSent') end;
      v_progress := v_target_progress || v_alias_progress || jsonb_build_object(
        'known', coalesce((v_alias_progress ->> 'known')::boolean, false) or coalesce((v_target_progress ->> 'known')::boolean, false),
        'hidden', case
          when v_target_progress ? 'hiddenOverride' then v_target_progress -> 'hidden'
          when v_alias_progress ? 'hiddenOverride' then v_alias_progress -> 'hidden'
          when v_target_progress ? 'hidden' and v_target_progress -> 'hidden' is distinct from to_jsonb(coalesce((select initially_hidden from public.vocabulary_words where word = v_target), false)) then v_target_progress -> 'hidden'
          when v_alias_progress ? 'hidden' and v_alias_progress -> 'hidden' is distinct from to_jsonb(coalesce((select initially_hidden from public.vocabulary_words where word = v_alias), false)) then v_alias_progress -> 'hidden'
          when v_target_progress ? 'hidden' then v_target_progress -> 'hidden'
          else v_alias_progress -> 'hidden' end,
        'stage', greatest(coalesce((v_alias_progress ->> 'stage')::integer, 0), coalesce((v_target_progress ->> 'stage')::integer, 0))
      );
      if v_target_progress ? 'hiddenOverride' then
        v_progress := jsonb_set(v_progress, '{hiddenOverride}', v_target_progress -> 'hiddenOverride');
      elsif v_alias_progress ? 'hiddenOverride' then
        v_progress := jsonb_set(v_progress, '{hiddenOverride}', v_alias_progress -> 'hiddenOverride');
      else
        v_progress := v_progress - 'hiddenOverride';
      end if;
      if v_due is null then v_progress := v_progress - 'due'; else v_progress := jsonb_set(v_progress, '{due}', to_jsonb(v_due)); end if;
      if v_last_sent is null then v_progress := v_progress - 'lastSent'; else v_progress := jsonb_set(v_progress, '{lastSent}', to_jsonb(v_last_sent)); end if;
    end if;

    update public.user_vocabulary_state s set payload =
      jsonb_set(
        jsonb_set(
          jsonb_set(
            case when s.payload -> 'notes' ? v_alias and not (s.payload -> 'notes' ? v_target)
              then jsonb_set(s.payload, '{notes}', (s.payload -> 'notes') - v_alias || jsonb_build_object(v_target, s.payload -> 'notes' -> v_alias))
              else jsonb_set(s.payload, '{notes}', coalesce(s.payload -> 'notes', '{}'::jsonb) - v_alias) end,
            '{progress}',
            case when v_progress is null then coalesce(s.payload -> 'progress', '{}'::jsonb) - v_alias
              else (coalesce(s.payload -> 'progress', '{}'::jsonb) - v_alias) || jsonb_build_object(v_target, v_progress) end
          ),
          '{draft}',
          coalesce((select jsonb_agg(word order by first_position) from (
            select case when value = v_alias then v_target else value end as word, min(ord) as first_position
            from jsonb_array_elements_text(coalesce(s.payload -> 'draft', '[]'::jsonb)) with ordinality d(value, ord)
            group by case when value = v_alias then v_target else value end
          ) ordered), '[]'::jsonb)
        ), '{history}', coalesce(s.payload -> 'history', '[]'::jsonb)
      ), updated_at = now()
      where s.user_id = v_state.user_id;
  end loop;

  update public.vocabulary_words set frequency = 0, initially_hidden = true,
    updated_at = now() where word = v_alias;

  update public.vocabulary_lemma_candidates set status = 'merged', reviewed_at = now(), reviewed_by = (select auth.uid())
    where id = p_candidate_id;
end;
$$;
