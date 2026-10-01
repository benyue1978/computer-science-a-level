#!/usr/bin/env python3
"""Extract a vocabulary import file using Poppler's pdftotext (no hosted service).
Usage: python3 scripts/extract_vocabulary.py BOOK.pdf OUTPUT.json --id book-id --name 'Book name'
The supplied Cambridge edition has publisher/front matter through PDF page 13,
and its index starts on PDF page 399. Other books use all pages by default.
"""
import argparse
import collections
import json
import re
import statistics
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

# Explicit, conservative families avoid accidental merges (e.g. data/date, bus/bu).
families = {
    'computers': 'computer', 'words': 'word', 'files': 'file', 'devices': 'device',
    'programs': 'program', 'instructions': 'instruction', 'systems': 'system',
    'stored': 'store', 'stores': 'store', 'storing': 'store', 'used': 'use', 'uses': 'use', 'using': 'use',
    'required': 'require', 'requires': 'require', 'requiring': 'require',
    'processes': 'process', 'processed': 'process', 'processing': 'process',
    'numbers': 'number', 'values': 'value', 'bits': 'bit', 'bytes': 'byte',
    'characters': 'character', 'questions': 'question', 'answers': 'answer',
    'allows': 'allow', 'allowed': 'allow', 'allowing': 'allow',
}
token = re.compile(r"[A-Za-z]+(?:['’-][A-Za-z]+)*")


def accept_tokens(page_text):
    """Return accepted surface token occurrences and the existing family counts."""
    occurrences = []
    counts = collections.Counter()
    for line in page_text.splitlines():
        surface_line = line.strip().replace('\x08', '')
        line = surface_line.replace('’', "'")
        if not line:
            continue
        if re.search(r'\.indd|©|www\.|https?://|Cambridge.*Paper|\d{1,2}:\d{2}\s*[AP]M', line):
            continue
        if re.fullmatch(r'[\d\s.]+', line):
            continue
        # Exclude obvious source-code syntax and identifiers, keep English prose and table labels.
        if re.search(r'[{}]|Console\.|System\.out|\b(?:ENDIF|ENDWHILE|ENDPROCEDURE|DECLARE|DIM|NEXT|END FOR)\b', line):
            continue
        surface_line = re.sub(r'^[»▲▼✓•]+\s*', '', surface_line)
        line = re.sub(r'^[»▲▼✓•]+\s*', '', line)
        for match in token.finditer(line):
            surface = surface_line[match.start():match.end()]
            original = match.group().lower().strip("'-")
            if len(original) > 35 or (len(original) == 1 and original not in {'a', 'i'}):
                continue
            # Skip camelCase fragments and tokens attached to digits/underscores.
            if re.search(r'[a-z][A-Z]', match.group()): continue
            if (match.start() and line[match.start()-1] in '_0123456789') or (match.end() < len(line) and line[match.end()] in '_0123456789'): continue
            if original in {'indd', 'isbn', 'co', 'sci', 'cam', 'igcse', 'hodder', 'endif', 'endwhile'}: continue
            key = families.get(original, original)
            counts[key] += 1
            occurrences.append({'surface': surface, 'token': original, 'key': key, 'context': line,
                                'start': match.start(), 'end': match.end()})
    return occurrences, counts


def collect_occurrences(pages):
    """Collect accepted surface tokens with their page-local source line context."""
    result = []
    for page_text in pages:
        occurrences, _ = accept_tokens(page_text)
        result.extend(occurrences)
    return result


def extract(raw, xml):
    counts = collections.Counter()
    forms = collections.defaultdict(set)
    paragraphs = []
    occurrence_rows = []
    for page in raw.split('\f'):
        accepted, page_counts = accept_tokens(page)
        counts.update(page_counts)
        for occurrence in accepted:
            forms[occurrence['key']].add(occurrence['token'])
        occurrence_rows.extend(accepted)
        lines = []
        for line in page.splitlines():
            line = line.strip().replace('’', "'").replace('\x08', '')
            if not line:
                lines.append(''); continue
            if re.search(r'\.indd|©|www\.|https?://|Cambridge.*Paper|\d{1,2}:\d{2}\s*[AP]M', line):
                continue
            if re.fullmatch(r'[\d\s.]+', line):
                continue
            if re.search(r'[{}]|Console\.|System\.out|\b(?:ENDIF|ENDWHILE|ENDPROCEDURE|DECLARE|DIM|NEXT|END FOR)\b', line):
                continue
            lines.append(re.sub(r'^[»▲▼✓•]+\s*', '', line))
        paragraphs.extend(re.split(r'\n\s*\n', '\n'.join(lines)))
    # PDF layout blocks preserve paragraphs without mixing side notes into prose.
    xml = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', xml)
    root = ET.fromstring(xml)
    ns = {'h': 'http://www.w3.org/1999/xhtml'}
    paragraphs = []
    for block in root.findall('.//h:block', ns):
        block_lines = block.findall('h:line', ns)
        if not block_lines: continue
        heights = [float(line.attrib['yMax']) - float(line.attrib['yMin']) for line in block_lines]
        line_texts = [' '.join(w.text or '' for w in line.findall('h:word', ns)) for line in block_lines]
    # Some heading and paragraph pairs share one PDF block; use their type size.
        if len(block_lines) > 1 and heights[0] > statistics.median(heights) * 1.025 and re.match(r'[A-Z]', line_texts[1]) and len(line_texts[0].split()) < 14 and not line_texts[0].endswith(('.', '?', '!')):
            line_texts = line_texts[1:]
        paragraphs.append(' '.join(line_texts))
    examples = collections.defaultdict(list)
    for paragraph in paragraphs:
        paragraph = re.sub(r'([a-z])-\n([a-z])', r'\1\2', paragraph)
        paragraph = re.sub(r'\s+', ' ', paragraph).strip()
        for sentence in re.split(r'(?<=[.!?])\s+(?=[A-Z])', paragraph):
            sentence = sentence.strip().replace('’', "'")
        # A repeated opening phrase usually signals a heading joined to its paragraph.
            opening = ' '.join(sentence.split()[:4])
            repeat = sentence.find(opening, len(opening)) if len(opening) > 12 else -1
            if 0 < repeat < 140: sentence = sentence[repeat:]
            toks = token.findall(sentence)
            if re.search(r'Activity|For more|Section|Chapter|Link |Worked example|Find out more|…|_{2,}|\.{3,}|\.indd|©|www\.', sentence): continue
            if not (8 <= len(toks) <= 40) or not sentence.endswith(('.', '?', '!')): continue
            if len(re.findall(r'\b[A-Z]\b', sentence)) > 2: continue
            if not re.match(r'[A-Z]', sentence) or re.search(r'[=<>]|\bFigure\b|\bTable\b|\[\d+\]', sentence): continue
            if sum(c.isdigit() for c in sentence) > 4: continue
        # Prefer self-contained prose over layout fragments.
            if not re.search(r'\b(is|are|was|were|can|will|has|have|be|means|allows|uses)\b', sentence): continue
            for key in {families.get(w.lower(), w.lower()) for w in toks}:
                if key in counts and sentence not in examples[key]: examples[key].append(sentence)
    words = []
    for word, count in counts.most_common():
        candidates = sorted(examples[word], key=lambda s: (abs(len(s.split()) - 20), len(s)))
        words.append({'word': word, 'frequency': count, 'forms': sorted(forms[word]), 'examples': candidates[:2]})
    return {'words': words}, occurrence_rows, counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('pdf')
    parser.add_argument('output')
    parser.add_argument('--id', required=True)
    parser.add_argument('--name', required=True)
    parser.add_argument('--first-page', type=int, default=1)
    parser.add_argument('--last-page', type=int)
    parser.add_argument('--occurrences', help='Optional path for accepted token occurrences and filter counts')
    args = parser.parse_args()
    cmd = ['pdftotext', '-f', str(args.first_page)]
    if args.last_page: cmd += ['-l', str(args.last_page)]
    raw = subprocess.check_output(cmd + [args.pdf, '-'], text=True)
    bbox_cmd = ['pdftotext', '-bbox-layout', '-f', str(args.first_page)]
    if args.last_page: bbox_cmd += ['-l', str(args.last_page)]
    xml = subprocess.check_output(bbox_cmd + [args.pdf, '-'], text=True)
    xml = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', xml)
    extracted, occurrence_rows, counts = extract(raw, xml)
    result = {'id': args.id, 'name': args.name, 'words': extracted['words']}
    Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    if args.occurrences:
        payload = {'occurrences': occurrence_rows, 'counts': dict(counts)}
        Path(args.occurrences).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n')
    words = result['words']
    print(f'{len(words)} entries; {sum(bool(w["examples"]) for w in words)} with sentence examples; {sum(counts.values())} occurrences')
    print(json.dumps(words[:6], ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
