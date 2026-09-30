-- The application now stores private data as one compact per-user snapshot.
-- These earlier normalized tables are unused and still empty, so remove them.
drop function public.save_daily_list(date, jsonb);
drop table public.sent_list_entries;
drop table public.sent_lists;
drop table public.user_daily_drafts;
drop table public.user_word_progress;
drop table public.user_explanations;
drop table public.user_preferences;
