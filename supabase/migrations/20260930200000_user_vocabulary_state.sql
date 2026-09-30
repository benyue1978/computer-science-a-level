-- Per-account state is stored as one compact snapshot. The public word catalogue
-- and shared explanations remain separate, so private progress is never public.
create table public.user_vocabulary_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"limit":5,"notes":{},"progress":{},"draft":[],"history":[]}'::jsonb
    check (jsonb_typeof(payload) = 'object'),
  updated_at timestamptz not null default now(),
  check (octet_length(payload::text) <= 10485760)
);

alter table public.user_vocabulary_state enable row level security;
grant select, insert, update, delete on public.user_vocabulary_state to authenticated;
create policy "Users manage their own vocabulary snapshot"
  on public.user_vocabulary_state for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
