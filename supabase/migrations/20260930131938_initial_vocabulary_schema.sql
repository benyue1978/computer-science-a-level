-- Shared word catalogue and explanations; all learning state belongs to an auth user.
create table public.vocabulary_sources (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9_-]{0,79}$'),
  name text not null check (length(name) between 1 and 200)
);

create table public.vocabulary_words (
  word text primary key check (word = lower(word) and word ~ '^[a-z][a-z''-]{0,59}$'),
  frequency bigint not null default 0 check (frequency >= 0),
  forms text[] not null default '{}',
  examples jsonb not null default '[]'::jsonb check (jsonb_typeof(examples) = 'array'),
  initially_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vocabulary_source_words (
  source_id text not null references public.vocabulary_sources(id) on delete cascade,
  word text not null references public.vocabulary_words(word) on delete cascade,
  frequency bigint not null check (frequency > 0),
  primary key (source_id, word)
);

create table public.shared_explanations (
  word text primary key references public.vocabulary_words(word) on delete cascade,
  body text not null check (length(body) between 1 and 10000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.shared_explanation_history (
  id bigint generated always as identity primary key,
  word text not null,
  body text not null,
  operation text not null check (operation in ('update', 'delete')),
  previous_updated_by uuid references auth.users(id) on delete set null,
  changed_by uuid references auth.users(id) on delete set null,
  saved_at timestamptz not null default now()
);
create index shared_explanation_history_word_saved
  on public.shared_explanation_history(word, saved_at desc);

create function public.audit_shared_explanation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.shared_explanation_history
    (word, body, operation, previous_updated_by, changed_by)
  values
    (old.word, old.body, lower(tg_op), old.updated_by, (select auth.uid()));
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;
create trigger shared_explanation_history_trigger
  before update or delete on public.shared_explanations
  for each row execute function public.audit_shared_explanation();

-- Rows in this table can only be granted by a database owner or service role.
create table public.vocabulary_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  granted_at timestamptz not null default now()
);

create function public.is_vocabulary_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.vocabulary_admins a where a.user_id = (select auth.uid())
  );
$$;

create table public.user_explanations (
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null references public.vocabulary_words(word) on delete cascade,
  body text not null check (length(body) between 1 and 10000),
  updated_at timestamptz not null default now(),
  primary key (user_id, word)
);

create table public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  daily_limit smallint not null default 5 check (daily_limit between 5 and 10),
  updated_at timestamptz not null default now()
);

create table public.user_word_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null references public.vocabulary_words(word) on delete cascade,
  known boolean not null default false,
  -- NULL follows the source's initial setting; true/false is a per-user override.
  hidden_override boolean,
  review_stage smallint not null default 0 check (review_stage between 0 and 3),
  due_on date,
  last_sent_on date,
  updated_at timestamptz not null default now(),
  primary key (user_id, word),
  check ((due_on is null) = (last_sent_on is null))
);

create table public.user_daily_drafts (
  user_id uuid not null references auth.users(id) on delete cascade,
  word text not null references public.vocabulary_words(word) on delete cascade,
  position smallint not null check (position between 0 and 9),
  primary key (user_id, word),
  unique (user_id, position)
);

create table public.sent_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sent_on date not null,
  created_at timestamptz not null default now()
);
create index sent_lists_owner_day on public.sent_lists(user_id, sent_on);

create table public.sent_list_entries (
  list_id uuid not null references public.sent_lists(id) on delete cascade,
  position smallint not null check (position between 0 and 9),
  word text not null references public.vocabulary_words(word),
  note_snapshot text not null default '' check (length(note_snapshot) <= 10000),
  example_snapshot text not null default '' check (length(example_snapshot) <= 2000),
  primary key (list_id, position),
  unique (list_id, word)
);

-- Public content is readable without signing in. Only the bootstrap admin can edit
-- shared explanations; no client-facing policy can grant itself admin access.
alter table public.vocabulary_sources enable row level security;
alter table public.vocabulary_words enable row level security;
alter table public.vocabulary_source_words enable row level security;
alter table public.shared_explanations enable row level security;
alter table public.shared_explanation_history enable row level security;
alter table public.vocabulary_admins enable row level security;
alter table public.user_explanations enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_word_progress enable row level security;
alter table public.user_daily_drafts enable row level security;
alter table public.sent_lists enable row level security;
alter table public.sent_list_entries enable row level security;

grant select on public.vocabulary_sources, public.vocabulary_words,
  public.vocabulary_source_words, public.shared_explanations to anon, authenticated;
grant insert, update, delete on public.shared_explanations to authenticated;
grant select on public.vocabulary_admins to authenticated;
grant select on public.shared_explanation_history to authenticated;
grant select, insert, update, delete on public.user_explanations,
  public.user_preferences, public.user_word_progress, public.user_daily_drafts to authenticated;
grant select on public.sent_lists, public.sent_list_entries to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_vocabulary_admin() to anon, authenticated;

create policy "Public can read vocabulary sources" on public.vocabulary_sources
  for select to anon, authenticated using (true);
create policy "Public can read vocabulary words" on public.vocabulary_words
  for select to anon, authenticated using (true);
create policy "Public can read vocabulary source counts" on public.vocabulary_source_words
  for select to anon, authenticated using (true);
create policy "Public can read shared explanations" on public.shared_explanations
  for select to anon, authenticated using (true);
create policy "Admins read shared explanation history" on public.shared_explanation_history
  for select to authenticated using ((select public.is_vocabulary_admin()));
create policy "Only vocabulary admins edit shared explanations" on public.shared_explanations
  for all to authenticated
  using ((select public.is_vocabulary_admin()))
  with check ((select public.is_vocabulary_admin()));
create policy "Users can read their own admin status" on public.vocabulary_admins
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Users manage their own explanations" on public.user_explanations
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users manage their own preferences" on public.user_preferences
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users manage their own word progress" on public.user_word_progress
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users manage their own daily drafts" on public.user_daily_drafts
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Users read their own sent lists" on public.sent_lists
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Users read entries in their sent lists" on public.sent_list_entries
  for select to authenticated using (
    exists (select 1 from public.sent_lists l where l.id = list_id and l.user_id = (select auth.uid()))
  );

-- Saves a sent list, its note/example snapshot, and next review dates atomically.
create function public.save_daily_list(p_sent_on date, p_entries jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_limit smallint;
  v_list_id uuid;
  v_count integer;
begin
  if v_user_id is null then raise exception 'Sign in before saving a sent list'; end if;
  if p_sent_on is distinct from (now() at time zone 'Asia/Kuala_Lumpur')::date then
    raise exception 'The sent date must be today';
  end if;
  if jsonb_typeof(p_entries) is distinct from 'array' then raise exception 'Entries must be a list'; end if;
  v_count := jsonb_array_length(p_entries);
  if v_count < 1 or v_count > 10 then raise exception 'A list must contain 1 to 10 words'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_entries) e
    where jsonb_typeof(e) <> 'object'
      or jsonb_typeof(e -> 'word') is distinct from 'string'
      or jsonb_typeof(coalesce(e -> 'note', '""'::jsonb)) <> 'string'
      or jsonb_typeof(coalesce(e -> 'example', '""'::jsonb)) <> 'string'
      or length(coalesce(e ->> 'note', '')) > 10000
      or length(coalesce(e ->> 'example', '')) > 2000
  ) then raise exception 'A list entry is invalid'; end if;
  if (select count(distinct e ->> 'word') from jsonb_array_elements(p_entries) e) <> v_count then
    raise exception 'A word can only appear once in a list';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_entries) e
    left join public.vocabulary_words w on w.word = e ->> 'word'
    where w.word is null
  ) then raise exception 'A word is not in the vocabulary'; end if;

  insert into public.user_preferences(user_id) values (v_user_id)
    on conflict (user_id) do nothing;
  select daily_limit into v_limit from public.user_preferences where user_id = v_user_id;
  if (select count(*) from public.sent_lists l
      join public.sent_list_entries e on e.list_id = l.id
      where l.user_id = v_user_id and l.sent_on = p_sent_on) + v_count > v_limit then
    raise exception 'This list exceeds your daily word limit';
  end if;

  insert into public.sent_lists(user_id, sent_on) values (v_user_id, p_sent_on)
    returning id into v_list_id;
  insert into public.sent_list_entries(list_id, position, word, note_snapshot, example_snapshot)
  select v_list_id, (entry.ordinality - 1)::smallint,
    entry.value ->> 'word', coalesce(entry.value ->> 'note', ''),
    coalesce(entry.value ->> 'example', '')
  from jsonb_array_elements(p_entries) with ordinality as entry(value, ordinality);

  insert into public.user_word_progress(user_id, word, review_stage, due_on, last_sent_on)
  select v_user_id, entry.value ->> 'word', coalesce(progress.review_stage, 0),
    p_sent_on + case coalesce(progress.review_stage, 0)
      when 0 then 3 when 1 then 7 when 2 then 14 else 30 end,
    p_sent_on
  from jsonb_array_elements(p_entries) entry(value)
  left join public.user_word_progress progress
    on progress.user_id = v_user_id and progress.word = entry.value ->> 'word'
  on conflict (user_id, word) do update
    set due_on = excluded.due_on, last_sent_on = excluded.last_sent_on, updated_at = now();

  delete from public.user_daily_drafts d
    where d.user_id = v_user_id and d.word in (select e.value ->> 'word' from jsonb_array_elements(p_entries) e);
  return v_list_id;
end;
$$;
revoke all on function public.save_daily_list(date, jsonb) from public, anon;
grant execute on function public.save_daily_list(date, jsonb) to authenticated;
