#!/usr/bin/env python3
"""Create an offline lemma proposal report from extract_vocabulary.py output.

Install spaCy into an isolated Python environment (never the Vite/npm app):
  python3 -m venv /tmp/lemma-audit-venv
  /tmp/lemma-audit-venv/bin/pip install -r scripts/requirements-vocabulary-lemma.txt
  /tmp/lemma-audit-venv/bin/python -m pip install 'https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.8.0/en_core_web_sm-3.8.0-py3-none-any.whl'
  /tmp/lemma-audit-venv/bin/python scripts/generate_vocabulary_candidates.py INPUT.json OUTPUT.json \\
    --source-id cambridge-computer-science-2 \\
    --source-name 'Computer Science · Cambridge, 2nd edition'
This script reports proposals only. It never applies merges or changes the catalogue.
"""
import argparse
import collections
import hashlib
import json
import re
from pathlib import Path

MODEL_NAME = 'en_core_web_sm'
SPACY_VERSION = '3.8.16'
MODEL_VERSION = '3.8.0'
VOCABULARY_IDENTITY_EXCEPTIONS = {'data'}


def analyze_occurrences(occurrences, nlp, source):
    """Map every occurrence once; return changed surface-to-lemma proposals."""
    import spacy
    source = {'id': str(source['id']), 'name': str(source['name'])}
    parsed = []
    unique_contexts = list(dict.fromkeys(row['context'] for row in occurrences))
    docs_by_context = dict(zip(unique_contexts, nlp.pipe(unique_contexts, batch_size=512)))
    for row in occurrences:
        context = row['context']
        start, end = row['start'], row['end']
        span = docs_by_context[context].char_span(start, end, alignment_mode='expand')
        if span is None or not span:
            raise ValueError(f"Occurrence offsets do not align: {row!r}")
        token = min(span, key=lambda t: (abs(t.idx - start), t.i))
        surface = row['token'].lower()
        lemma = surface if surface in VOCABULARY_IDENTITY_EXCEPTIONS or '-' in surface else token.lemma_.lower().strip("\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0b\x0c\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f ")
        if not lemma or lemma == '-pron-' or not re.fullmatch(r"[a-z][a-z'-]{0,59}", lemma):
            lemma = surface
        parsed.append({'surface': surface, 'lemma': lemma, 'pos': token.pos_, 'context': context})

    targets_by_surface = collections.defaultdict(set)
    grouped = collections.defaultdict(list)
    for mapped in parsed:
        # Only compare proposed merges. A token that sometimes keeps its own
        # spelling is not a competing target for the same surface form.
        if mapped['surface'] != mapped['lemma']:
            targets_by_surface[mapped['surface']].add(mapped['lemma'])
        grouped[(mapped['surface'], mapped['lemma'])].append(mapped)

    candidates, mappings = [], []
    for (surface, lemma), rows in grouped.items():
        pos_counts = collections.Counter(row['pos'] or 'UNKNOWN' for row in rows)
        ambiguous = len(targets_by_surface[surface]) > 1
        mapping = {
            'surface': surface,
            'lemma': lemma,
            'frequency': len(rows),
            'pos_evidence': dict(sorted(pos_counts.items())),
            'examples': list(dict.fromkeys(row['context'] for row in rows))[:2],
            'ambiguous': ambiguous,
            'review': ambiguous,
            'flag': 'ambiguous_mapping' if ambiguous else None,
        }
        mappings.append(mapping)
        if surface != lemma:
            candidates.append(mapping)
    candidates.sort(key=lambda row: (-row['frequency'], row['surface'], row['lemma']))
    mappings.sort(key=lambda row: (-row['frequency'], row['surface'], row['lemma']))
    changed_occurrences = sum(row['frequency'] for row in candidates)
    mapped_occurrences = sum(row['frequency'] for row in mappings)
    if mapped_occurrences != len(occurrences):
        raise AssertionError('Lemma mappings must account for every input occurrence exactly once')
    if changed_occurrences != sum(row['frequency'] for row in candidates):
        raise AssertionError('Changed candidate frequencies do not conserve changed occurrences')
    packages = {'spacy': spacy.__version__, 'model': MODEL_NAME,
                'model_version': nlp.meta.get('version', '')}
    batch = {'source': source, 'packages': packages, 'occurrences': occurrences}
    canonical = json.dumps(batch, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')
    return {
        'format_version': 1,
        'batch_key': hashlib.sha256(canonical).hexdigest(),
        'source': source,
        'packages': packages,
        'total_occurrences': len(occurrences),
        'mapped_occurrences': len(parsed),
        'changed_occurrences': changed_occurrences,
        'identity_occurrences': len(parsed) - changed_occurrences,
        'candidates': candidates,
        'mappings': mappings,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', help='Occurrence JSON produced by extract_vocabulary.py --occurrences')
    parser.add_argument('output', help='Candidate report JSON path')
    parser.add_argument('--source-id', required=True, help='Stable catalogue/source identifier')
    parser.add_argument('--source-name', required=True, help='Human-readable catalogue/source name')
    args = parser.parse_args()
    import spacy
    nlp = spacy.load(MODEL_NAME, disable=['parser', 'ner'])
    if spacy.__version__ != SPACY_VERSION or nlp.meta.get('version') != MODEL_VERSION:
        raise RuntimeError(f'Expected spaCy {SPACY_VERSION} and {MODEL_NAME} {MODEL_VERSION}; '
                           f'found spaCy {spacy.__version__} and model {nlp.meta.get("version")}')
    source = json.loads(Path(args.input).read_text(encoding='utf-8'))
    result = analyze_occurrences(source['occurrences'], nlp, {'id': args.source_id, 'name': args.source_name})
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"spaCy {spacy.__version__}; {MODEL_NAME} {nlp.meta.get('version')}; "
          f"{result['total_occurrences']} occurrences; {len(result['candidates'])} proposals; "
          f"{result['changed_occurrences']} changed mappings")


if __name__ == '__main__':
    main()
