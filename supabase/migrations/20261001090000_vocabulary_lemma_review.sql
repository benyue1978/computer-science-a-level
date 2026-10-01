create table public.vocabulary_lemma_batches (
  batch_key text primary key check (batch_key ~ '^[a-f0-9]{64}$'),
  source_id text not null references public.vocabulary_sources(id) on delete restrict,
  source_name text not null check (length(source_name) between 1 and 200),
  spacy_version text not null check (length(spacy_version) between 1 and 100),
  model_name text not null check (length(model_name) between 1 and 200),
  model_version text not null check (length(model_version) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.vocabulary_lemma_candidates (
  id uuid primary key default gen_random_uuid(),
  batch_key text not null references public.vocabulary_lemma_batches(batch_key) on delete cascade,
  surface_form text not null check (surface_form = lower(surface_form) and surface_form ~ '^[a-z][a-z''-]{0,59}$'),
  proposed_target text not null check (proposed_target = lower(proposed_target) and proposed_target ~ '^[a-z][a-z''-]{0,59}$'),
  frequency bigint not null check (frequency > 0),
  pos_evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(pos_evidence) = 'object'),
  examples jsonb not null default '[]'::jsonb check (jsonb_typeof(examples) = 'array'),
  ambiguous boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'merged', 'kept')),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (batch_key, surface_form, proposed_target)
);
create index vocabulary_lemma_candidates_review_order
  on public.vocabulary_lemma_candidates(batch_key, status, frequency desc);

create table public.vocabulary_word_aliases (
  alias text primary key references public.vocabulary_words(word) on delete restrict,
  canonical text not null references public.vocabulary_words(word) on delete restrict,
  created_at timestamptz not null default now(),
  check (alias = lower(alias) and alias ~ '^[a-z][a-z''-]{0,59}$'),
  check (canonical = lower(canonical) and canonical ~ '^[a-z][a-z''-]{0,59}$'),
  check (alias <> canonical)
);

alter table public.vocabulary_lemma_batches enable row level security;
alter table public.vocabulary_lemma_candidates enable row level security;
alter table public.vocabulary_word_aliases enable row level security;

grant select on public.vocabulary_lemma_batches, public.vocabulary_lemma_candidates to authenticated;
grant select on public.vocabulary_word_aliases to anon, authenticated;
revoke insert, update, delete, truncate, references, trigger on public.vocabulary_word_aliases from public, anon, authenticated;
create policy "Vocabulary admins read lemma batches" on public.vocabulary_lemma_batches
  for select to authenticated using ((select public.is_vocabulary_admin()));
create policy "Vocabulary admins read lemma candidates" on public.vocabulary_lemma_candidates
  for select to authenticated using ((select public.is_vocabulary_admin()));
create policy "Public reads approved vocabulary aliases" on public.vocabulary_word_aliases
  for select to anon, authenticated using (true);

create function public.review_vocabulary_lemma_candidate(p_candidate_id uuid, p_decision text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.is_vocabulary_admin()) then
    raise exception 'Vocabulary administrator access required' using errcode = 'P0001';
  end if;
  if p_decision not in ('kept', 'pending') then
    raise exception 'Decision must be kept or pending' using errcode = 'P0001';
  end if;
  if not exists (
    select 1 from public.vocabulary_lemma_candidates
    where id = p_candidate_id and status <> 'merged'
  ) then
    if exists (select 1 from public.vocabulary_lemma_candidates where id = p_candidate_id) then
      raise exception 'A merged candidate cannot be changed' using errcode = 'P0001';
    end if;
    raise exception 'Lemma candidate not found' using errcode = 'P0001';
  end if;
  update public.vocabulary_lemma_candidates
    set status = p_decision, reviewed_at = case when p_decision = 'pending' then null else now() end,
        reviewed_by = case when p_decision = 'pending' then null else (select auth.uid()) end
    where id = p_candidate_id;
  if not found then raise exception 'Lemma candidate not found' using errcode = 'P0001'; end if;
end;
$$;
revoke all on function public.review_vocabulary_lemma_candidate(uuid, text) from public, anon;
grant execute on function public.review_vocabulary_lemma_candidate(uuid, text) to authenticated;

create function public.merge_vocabulary_lemma_candidate(p_candidate_id uuid, p_canonical text)
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
  update public.vocabulary_words set frequency = 0, initially_hidden = true,
    updated_at = now() where word = v_alias;
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

  update public.vocabulary_lemma_candidates set status = 'merged', reviewed_at = now(), reviewed_by = (select auth.uid())
    where id = p_candidate_id;
end;
$$;
revoke all on function public.merge_vocabulary_lemma_candidate(uuid, text) from public, anon;
grant execute on function public.merge_vocabulary_lemma_candidate(uuid, text) to authenticated;
