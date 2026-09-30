# Supabase setup

The schema is versioned in `supabase/migrations/`. Apply migrations to a linked project with `supabase db push`; preview first with `supabase db push --dry-run`.

The coursebook catalogue is public data already checked into `public/vocabulary/coursebook.json`. To seed a new linked project from the private browser backup, run `node scripts/import-vocabulary-to-supabase.mjs --dry-run` and then `node scripts/import-vocabulary-to-supabase.mjs`. The script imports vocabulary, source counts, and non-empty explanations as shared explanations. It does not import personal Known status, review progress, drafts, or sent lists.

Keep project passwords and local environment files out of Git. Copy `.env.example` to `.env.local` for local frontend configuration. The publishable key is safe for browser use because row-level security protects writes; never use a service-role or secret key in the browser.

The first project is `daily-vocabulary` in Singapore. Its catalogue has been seeded. Google OAuth credentials are configured for local sign-in. The Vercel project receives the public Supabase URL and publishable key for its production, preview, and development builds. Production redirects use `https://cs.withus.fun`; add that origin to the Google OAuth web client before testing production sign-in.

Signed-in private data is stored as one compact, row-level-protected account snapshot. Guest data remains in IndexedDB. On first sign-in, the current browser state is copied into the account snapshot; subsequent logins load that account's cloud copy. Account snapshots include notes that differ from the shared explanation, known/hidden status, review dates, daily selections, sent history, and extra imported word sources.
