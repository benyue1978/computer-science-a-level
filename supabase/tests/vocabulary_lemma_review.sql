begin;
select plan(64);

-- The private review model has stable, batch-local identities and decisions.
select has_table('public', 'vocabulary_lemma_batches', 'review batches exist');
select has_table('public', 'vocabulary_lemma_candidates', 'review candidates exist');
select has_table('public', 'vocabulary_word_aliases', 'approved aliases exist');
select has_function('public', 'review_vocabulary_lemma_candidate', array['uuid', 'text']);
select has_function('public', 'merge_vocabulary_lemma_candidate', array['uuid', 'text']);

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'lemma-admin@test.invalid', '', now(), now(), now()),
  ('00000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'lemma-user@test.invalid', '', now(), now(), now());
insert into public.vocabulary_admins(user_id) values ('00000000-0000-0000-0000-000000000101');
insert into public.vocabulary_sources(id, name) values ('lemma-book-a', 'Lemma book A'), ('lemma-book-b', 'Lemma book B');
insert into public.vocabulary_words(word, frequency, forms) values
  ('walk', 2, array['walk']), ('walked', 3, array['walked']), ('walking', 4, array['walking']),
  ('run', 5, array['run']), ('ran', 6, array['ran']), ('old-form', 1, array['old-form']),
  ('overflow-alias', 1, array['overflow-alias']), ('overflow-target', 9223372036854775807, array['overflow-target']),
  ('unseenform', 2, array['unseenform']);
update public.vocabulary_words set examples = '["Walk target 1.","Walk target 2.","Walk target 3."]'::jsonb where word='walk';
update public.vocabulary_words set examples = '["Walk alias.","Walk target 1.","Walk alias 2."]'::jsonb where word='walked';
insert into public.vocabulary_source_words(source_id, word, frequency) values
  ('lemma-book-a', 'walked', 2), ('lemma-book-b', 'walked', 1), ('lemma-book-a', 'walk', 2), ('lemma-book-b', 'walk', 1);
insert into public.vocabulary_source_words(source_id, word, frequency) values ('lemma-book-a', 'unseenform', 2);
insert into public.shared_explanations(word, body) values ('walked', 'Alias note');
insert into public.shared_explanations(word, body) values ('walk', 'Canonical note');
insert into public.shared_explanations(word, body) values ('walking', 'Movable note');
insert into public.user_vocabulary_state(user_id, payload) values
  ('00000000-0000-0000-0000-000000000101', '{"limit":5,"notes":{"walked":"old note","walk":"target note"},"progress":{"walked":{"known":true,"hidden":true,"hiddenOverride":true,"stage":1,"due":"2026-10-10","lastSent":"2026-09-20"},"walk":{"known":false,"hidden":false,"hiddenOverride":false,"stage":3,"due":"2026-10-05","lastSent":"2026-09-25"}},"draft":["walked","walk","run","walked"],"history":[{"word":"walked","note":"snapshot"}],"customSources":[{"id":"personal","words":["walked"]}],"future":{"preserved":true}}'),
  ('00000000-0000-0000-0000-000000000102', '{"limit":5,"notes":{},"progress":{"walked":{"known":true,"hidden":true,"stage":2,"due":"2026-10-03","lastSent":"2026-09-30"}},"draft":["walked"],"history":[{"word":"walked","note":"immutable"}]}');
insert into public.vocabulary_lemma_batches(batch_key, source_id, source_name, spacy_version, model_name, model_version)
values ('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'lemma-book-a', 'Lemma book A', '3.8.16', 'en_core_web_sm', '3.8.0'),
       ('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'lemma-book-b', 'Lemma book B', '3.8.16', 'en_core_web_sm', '3.8.0');
insert into public.vocabulary_word_aliases(alias, canonical) values ('old-form', 'overflow-alias');
insert into public.vocabulary_lemma_candidates(id, batch_key, surface_form, proposed_target, frequency, pos_evidence, examples, ambiguous)
values ('00000000-0000-0000-0000-000000000301', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'walked', 'walk', 2, '{"VERB":2}', '["They walked home."]', false),
       ('00000000-0000-0000-0000-000000000302', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'walked', 'walk', 1, '{"VERB":1}', '["We walked together."]', false),
       ('00000000-0000-0000-0000-000000000304', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'walking', 'walk', 4, '{"VERB":4}', '["Walking helps."]', false),
       ('00000000-0000-0000-0000-000000000305', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'ran', 'run', 6, '{"VERB":6}', '["She ran fast."]', false),
       ('00000000-0000-0000-0000-000000000303', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'overflow-alias', 'run', 1, '{}', '[]', false),
       ('00000000-0000-0000-0000-000000000306', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'walked', 'walked', 1, '{"NOUN":1}', '["A walked path."]', true),
       ('00000000-0000-0000-0000-000000000307', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'walk', 'run', 5, '{"VERB":5}', '["Walk to school."]', false),
       ('00000000-0000-0000-0000-000000000308', 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'unseenform', 'unseenlemma', 2, '{"VERB":2}', '["An unseen form."]', false);

select is((select status from public.vocabulary_lemma_candidates where id='00000000-0000-0000-0000-000000000301'), 'pending', 'candidate decisions default to pending');
select throws_ok($$insert into public.vocabulary_lemma_candidates(batch_key, surface_form, proposed_target, frequency) values ('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'walked', 'walk', 99)$$, '23505', null, 'candidate uniqueness is enforced within a batch');
select throws_ok($$insert into public.vocabulary_lemma_batches(batch_key, source_id, source_name, spacy_version, model_name, model_version) values ('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'lemma-book-a', 'Lemma book A', '3.8.16', 'en_core_web_sm', '3.8.0')$$, '23505', null, 'batch uniqueness prevents duplicate imports');

set local role anon;
select throws_ok($$select count(*) from public.vocabulary_lemma_candidates$$, '42501', null, 'signed-out users cannot read review candidates');
select is((select count(*)::int from public.vocabulary_word_aliases where alias='walked'), 0, 'public users see no aliases before approval');
select throws_ok($$select public.review_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'kept')$$, '42501', null, 'signed-out users cannot decide candidates');
select throws_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'walk')$$, '42501', null, 'signed-out users cannot merge candidates');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000102';
select is((select count(*)::int from public.vocabulary_lemma_candidates), 0, 'ordinary users cannot read review candidates');
select throws_ok($$select public.review_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'kept')$$, 'P0001', 'Vocabulary administrator access required', 'ordinary users cannot decide candidates');
select throws_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'walk')$$, 'P0001', 'Vocabulary administrator access required', 'ordinary users cannot merge candidates');
reset role;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000101';
select is((select count(*)::int from public.vocabulary_lemma_candidates), 8, 'admins can read review candidates');
select lives_ok($$select public.review_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000305', 'kept')$$, 'admin can decide a candidate');
select is((select status from public.vocabulary_lemma_candidates where batch_key='bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' and surface_form='ran'), 'kept', 'admin decision RPC stores keep separately');
select lives_ok($$select public.review_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000306', 'kept')$$, 'admin can decide an alternative proposal for the same surface');
select is((select status from public.vocabulary_lemma_candidates where id='00000000-0000-0000-0000-000000000306'), 'kept', 'alternative proposal receives its own review decision');
select lives_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'walk')$$, 'admin can merge a candidate');
select is((select status from public.vocabulary_lemma_candidates where id='00000000-0000-0000-0000-000000000301'), 'merged', 'merge marks candidate merged');
select is((select frequency from public.vocabulary_words where word='walk'), 5::bigint, 'merge combines catalogue counts');
select is((select examples from public.vocabulary_words where word='walk'), '["Walk target 1.","Walk target 2.","Walk target 3."]'::jsonb, 'merge retains stable distinct examples within the client limit');
select is((select frequency from public.vocabulary_source_words where source_id='lemma-book-a' and word='walk'), 4::bigint, 'merge combines each source frequency');
select is((select frequency from public.vocabulary_source_words where source_id='lemma-book-b' and word='walk'), 2::bigint, 'merge combines frequencies from multiple sources');
select is((select frequency from public.vocabulary_words where word='walked'), 0::bigint, 'alias row remains for history with zero active frequency');
select is((select body from public.shared_explanations where word='walk'), 'Canonical note', 'canonical explanation wins when both words have one');
select is((select payload->'history' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), '[{"word":"walked","note":"snapshot"}]'::jsonb, 'merge preserves sent history JSON');
select is((select payload->'future' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), '{"preserved":true}'::jsonb, 'merge preserves unknown snapshot keys');
select is((select payload->'draft' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), '["walk","run"]'::jsonb, 'draft aliases are re-keyed and deduplicated in order');
select is((select payload->'notes'->>'walk' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), 'target note', 'canonical note wins on collision');
select is((select payload->'progress'->'walk'->>'known' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), 'true', 'merged known state is logical OR');
select is((select payload->'progress'->'walk'->>'stage' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), '3', 'merged progress keeps the highest stage');
select is((select payload->'progress'->'walk'->>'due' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), '2026-10-05', 'merged progress keeps the earliest due date');
select is((select payload->'progress'->'walk'->>'lastSent' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), '2026-09-25', 'merged progress keeps latest last sent date');
select is((select payload->'progress'->'walk'->>'hidden' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), 'false', 'explicit canonical hidden preference wins');
select is((select payload->'progress'->'walk'->>'hiddenOverride' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000101'), 'false', 'explicit canonical hidden override marker survives merge');
select is((select count(*)::int from public.vocabulary_word_aliases where alias='walked' and canonical='walk'), 1, 'approved mapping is public and points to canonical');
select hasnt_table_privilege('anon', 'public.vocabulary_word_aliases', 'INSERT', 'signed-out clients cannot write aliases');
select hasnt_table_privilege('authenticated', 'public.vocabulary_word_aliases', 'UPDATE', 'authenticated clients cannot update aliases');
set local role anon;
select is((select count(*)::int from public.vocabulary_word_aliases where alias='walked' and canonical='walk'), 1, 'signed-out catalogue clients can read approved aliases');
select throws_ok($$select count(*) from public.vocabulary_lemma_candidates$$, '42501', null, 'signed-out clients still cannot see candidates after approval');
reset role;
select lives_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'walk')$$, 'repeated merge succeeds idempotently');
select is((select count(*)::int from public.vocabulary_word_aliases where alias='walked' and canonical='walk'), 1, 'repeated merge is idempotent');
select throws_ok($$select public.review_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'kept')$$, 'P0001', 'A merged candidate cannot be changed', 'merged candidates cannot be changed back to pending or kept');
select throws_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'walked')$$, 'P0001', null, 'self merge is rejected');
select throws_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000301', 'not.a.word')$$, 'P0001', null, 'invalid terminal target is rejected');
select throws_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000303', 'overflow-target')$$, '22003', null, 'late merge failure rolls the transaction back');
select is((select canonical from public.vocabulary_word_aliases where alias='old-form'), 'overflow-alias', 'rollback also restores aliases retargeted earlier in the merge');
select is((select status from public.vocabulary_lemma_candidates where batch_key='aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' and surface_form='overflow-alias'), 'pending', 'rollback leaves candidate pending');
select lives_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000303', 'newterminal')$$, 'canonical with existing aliases can merge into a missing target');
select is((select canonical from public.vocabulary_word_aliases where alias='old-form'), 'newterminal', 'prior aliases point to the newly created terminal target');
select is((select frequency from public.vocabulary_words where word='newterminal'), 1::bigint, 'new terminal includes the merged canonical frequency');
select lives_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000304', 'run')$$, 'admin can merge an alias into a new terminal canonical');
select is((select canonical from public.vocabulary_word_aliases where alias='walking'), 'run', 'existing alias can be retargeted when its canonical is merged');
select is((select body from public.shared_explanations where word='run'), 'Movable note', 'alias explanation moves when canonical has none');
select lives_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000307', 'run')$$, 'admin can merge a canonical that already has approved aliases');
select is((select canonical from public.vocabulary_word_aliases where alias='walked'), 'run', 'previously approved aliases are retargeted to the new terminal canonical');
select is((select payload->'history' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000102'), '[{"word":"walked","note":"immutable"}]'::jsonb, 'other users history remains untouched');
select is((select payload->'progress'->'run'->>'hidden' from public.user_vocabulary_state where user_id='00000000-0000-0000-0000-000000000102'), 'true', 'legacy alias hidden choice is inferred when canonical only has its default');
select lives_ok($$select public.merge_vocabulary_lemma_candidate('00000000-0000-0000-0000-000000000308', 'unseenlemma')$$, 'admin can create a missing lemma target');
select is((select frequency from public.vocabulary_words where word='unseenlemma'), 2::bigint, 'new target receives the alias count');
select is((select frequency from public.vocabulary_source_words where source_id='lemma-book-a' and word='unseenlemma'), 2::bigint, 'new target receives the source count');
reset role;

select * from finish();
rollback;
