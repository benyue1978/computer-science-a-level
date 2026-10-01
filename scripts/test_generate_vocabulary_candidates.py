import unittest

import spacy

from scripts.generate_vocabulary_candidates import analyze_occurrences


class GenerateVocabularyCandidatesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.nlp = spacy.load('en_core_web_sm')

    def test_regular_inflections_are_candidate_proposals(self):
        rows = [
            {'surface': form, 'token': form, 'key': form, 'context': f"We {form} the process.", 'start': 3, 'end': 3 + len(form)}
            for form in ('start', 'starting', 'starts', 'started')
        ]
        result = analyze_occurrences(rows, self.nlp, {'id': 'fixture', 'name': 'Fixture'})
        targets = {r['surface']: r['lemma'] for r in result['candidates']}
        self.assertEqual(targets, {'starting': 'start', 'starts': 'start', 'started': 'start'})

    def test_derivational_false_friend_is_not_proposed_as_merge(self):
        rows = [{'surface': 'programming', 'token': 'programming', 'key': 'programming', 'context': 'Programming is an important topic.', 'start': 0, 'end': 11}]
        result = analyze_occurrences(rows, self.nlp, {'id': 'fixture', 'name': 'Fixture'})
        self.assertFalse(any(r['surface'] == 'programming' and r['lemma'] == 'program' for r in result['candidates']))

    def test_identity_occurrences_are_not_competing_targets_and_data_stays_identity(self):
        rows = []
        for text in ('She left the room.', 'The left side is shaded.', 'They left it unchanged.'):
            start = text.lower().index('left')
            rows.append({'surface': 'left', 'token': 'left', 'key': 'leave', 'context': text.lower(), 'start': start, 'end': start + 4})
        rows.append({'surface': 'data', 'token': 'data', 'key': 'data', 'context': 'The data are stored.', 'start': 4, 'end': 8})
        result = analyze_occurrences(rows, self.nlp, {'id': 'fixture', 'name': 'Fixture'})
        left = [r for r in result['candidates'] if r['surface'] == 'left']
        self.assertGreaterEqual(len(left), 1)
        self.assertTrue(left)
        self.assertFalse(any(r.get('ambiguous') for r in left))
        self.assertFalse(any(r['surface'] == 'data' and r['lemma'] != 'data' for r in result['candidates']))

    def test_multiple_proposed_targets_for_the_same_surface_are_ambiguous(self):
        rows = []
        for text in (
            'reviews four uses of the hexadecimal system:',
            'Uses of BCD',
            'Denary uses ten separate digits, 0-9, to represent all values.',
        ):
            lowered = text.lower()
            start = lowered.index('uses')
            rows.append({'surface': 'uses', 'token': 'uses', 'key': 'uses', 'context': lowered, 'start': start, 'end': start + 4})
        result = analyze_occurrences(rows, self.nlp, {'id': 'fixture', 'name': 'Fixture'})
        uses = [row for row in result['candidates'] if row['surface'] == 'uses']
        self.assertEqual({row['lemma'] for row in uses}, {'us', 'use'})
        self.assertTrue(all(row['ambiguous'] and row['review'] for row in uses))

    def test_sorting_and_exact_occurrence_conservation(self):
        forms = [('starts', 'He starts now.'), ('started', 'He started then.'), ('starting', 'He is starting now.'), ('start', 'Please start now.')]
        rows = []
        for surface, context in forms:
            start = context.lower().index(surface)
            rows.extend([{'surface': surface, 'token': surface, 'key': surface, 'context': context.lower(), 'start': start, 'end': start + len(surface)}] * 2)
        result = analyze_occurrences(rows, self.nlp, {'id': 'fixture', 'name': 'Fixture'})
        self.assertEqual(result['total_occurrences'], len(rows))
        self.assertEqual(result['mapped_occurrences'], len(rows))
        self.assertEqual(sum(r['frequency'] for r in result['mappings']), len(rows))
        self.assertEqual(sum(r['frequency'] for r in result['candidates']), result['changed_occurrences'])
        frequencies = [r['frequency'] for r in result['candidates']]
        self.assertEqual(frequencies, sorted(frequencies, reverse=True))
        self.assertTrue(all(len(r['examples']) <= 2 for r in result['candidates']))

    def test_source_metadata_is_serialized_and_separates_batch_keys(self):
        rows = [{'surface': 'start', 'token': 'start', 'key': 'start', 'context': 'Start now.', 'start': 0, 'end': 5}]
        cambridge = analyze_occurrences(rows, self.nlp, {'id': 'cambridge', 'name': 'Cambridge CS'})
        other = analyze_occurrences(rows, self.nlp, {'id': 'other', 'name': 'Other book'})
        self.assertEqual(cambridge['source'], {'id': 'cambridge', 'name': 'Cambridge CS'})
        self.assertNotEqual(cambridge['batch_key'], other['batch_key'])

    def test_hyphenated_compounds_remain_identity_instead_of_fragment_merges(self):
        rows = []
        for surface, context in (
            ('high-level', 'This is a high-level language.'),
            ('blu-ray', 'The blu-ray drive is available.'),
            ('start-up', 'The start-up process is short.'),
        ):
            start = context.lower().index(surface)
            rows.append({'surface': surface, 'token': surface, 'key': surface, 'context': context.lower(), 'start': start, 'end': start + len(surface)})
        result = analyze_occurrences(rows, self.nlp, {'id': 'fixture', 'name': 'Fixture'})
        self.assertFalse(any(row['surface'] in {'high-level', 'blu-ray', 'start-up'} for row in result['candidates']))
        self.assertTrue(all(next(row for row in result['mappings'] if row['surface'] == surface)['lemma'] == surface
                            for surface in ('high-level', 'blu-ray', 'start-up')))

    def test_abbreviation_punctuation_is_not_suggested_as_a_word(self):
        text = 'The value is i.e. 16 million.'
        rows = [{'surface': 'i', 'token': 'i', 'key': 'i', 'context': text.lower(), 'start': text.lower().index('i.e.'), 'end': text.lower().index('i.e.') + 1}]
        result = analyze_occurrences(rows, self.nlp, {'id': 'fixture', 'name': 'Fixture'})
        self.assertEqual(result['mappings'][0]['lemma'], 'i')
        self.assertEqual(result['candidates'], [])


if __name__ == '__main__':
    unittest.main()
