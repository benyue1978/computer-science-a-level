import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from scripts.extract_vocabulary import collect_occurrences, accept_tokens


class ExtractVocabularyTests(unittest.TestCase):
    def test_accepts_tokens_with_punctuation_boundaries_and_keeps_page_context(self):
        pages = [
            "Start: starting; started! Programming, data. Isn’t it?\n"
            "Code x = { programming: data } ENDIF; camelCase start; item2start _start start3.",
            "A different page says START beside programming and data.",
        ]
        _, counts = accept_tokens(pages[0])
        self.assertEqual(counts['start'], 1)
        self.assertEqual(counts['starting'], 1)
        self.assertEqual(counts['started'], 1)
        self.assertEqual(counts['programming'], 1)
        self.assertEqual(counts['data'], 1)
        self.assertEqual(counts["isn't"], 1)
        occurrences = collect_occurrences(pages)
        selected = [o for o in occurrences if o['token'] in {'start', 'starting', 'started', 'programming', 'data'}]
        self.assertEqual([o['surface'] for o in selected], ['Start', 'starting', 'started', 'Programming', 'data', 'START', 'programming', 'data'])
        isn_t = next(o for o in occurrences if o['token'] == "isn't")
        self.assertEqual(isn_t['surface'], 'Isn’t')
        self.assertEqual(isn_t['key'], "isn't")
        self.assertEqual(selected[0]['token'], 'start')
        self.assertTrue(all(o['context'].startswith('Start:') for o in selected[:5]))
        self.assertTrue(all(o['context'].startswith('A different page') for o in selected[5:]))
        self.assertEqual(selected[0]['context'][selected[0]['start']:selected[0]['end']], 'Start')
        self.assertEqual(selected[1]['context'][selected[1]['start']:selected[1]['end']], 'starting')
        self.assertTrue(all(o['end'] - o['start'] == len(o['surface']) for o in selected))
        self.assertFalse(any(o['token'] == 'endif' for o in occurrences))
        self.assertFalse(any(o['token'] == 'x' for o in occurrences))
        self.assertFalse(any(o['surface'] in {'start' } for o in occurrences))

    def test_checked_in_cambridge_pdf_reproduces_catalogue_byte_for_byte(self):
        root = Path(__file__).resolve().parents[1]
        pdf = root / 'Cambridge IGCSE and O Level Computer Science Second Edition.pdf'
        if not pdf.exists():
            self.skipTest('user-provided Cambridge PDF is not present')
        catalogue = root / 'public/vocabulary/coursebook.json'
        expected = catalogue.read_bytes()
        with tempfile.TemporaryDirectory() as temp_dir:
            output = Path(temp_dir) / 'coursebook.json'
            occurrence_output = Path(temp_dir) / 'occurrences.json'
            subprocess.run([
                'python3', str(root / 'scripts/extract_vocabulary.py'), str(pdf), str(output),
                '--id', 'cambridge-computer-science-2',
                '--name', 'Computer Science · Cambridge, 2nd edition',
                '--first-page', '14', '--last-page', '398',
                '--occurrences', str(occurrence_output),
            ], check=True, capture_output=True, text=True)
            actual = output.read_bytes()
            occurrence_data = json.loads(occurrence_output.read_text())
        self.assertEqual(actual, expected)
        payload = json.loads(actual)
        self.assertEqual(len(payload['words']), 6039)
        self.assertEqual(sum(row['frequency'] for row in payload['words']), 115848)
        self.assertEqual(sum(occurrence_data['counts'].values()), 115848)
        self.assertEqual(len(occurrence_data['occurrences']), 115848)
        self.assertTrue({'surface', 'token', 'key', 'context', 'start', 'end'} <= set(occurrence_data['occurrences'][0]))
        self.assertNotIn('page', occurrence_data['occurrences'][0])


if __name__ == '__main__':
    unittest.main()
