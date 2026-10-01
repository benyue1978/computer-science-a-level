import {
  isInitiallyHidden,
  mergeSource,
  type Source,
  type State,
} from "./model";

export type CloudSnapshot = {
  limit: number;
  notes: Record<string, string>;
  customSources: Source[];
  progress: Record<
    string,
    { known: boolean; hidden: boolean; hiddenOverride?: boolean; stage: number; due?: string; lastSent?: string }
  >;
  draft: string[];
  history: State["history"];
};

export function applyAliasesToCloudSnapshot(
  snapshot: CloudSnapshot,
  aliases: Record<string, string>,
): CloudSnapshot {
  const canonical = (word: string) => {
    const seen = new Set<string>();
    let result = word;
    while (aliases[result]) {
      if (seen.has(result)) throw new Error("The vocabulary contains a circular word merge.");
      seen.add(result);
      result = aliases[result];
    }
    return result;
  };
  const notes: CloudSnapshot["notes"] = {};
  for (const [word, note] of Object.entries(snapshot.notes)) {
    const target = canonical(word);
    if (word === target || !Object.hasOwn(notes, target)) notes[target] = note;
  }
  const progress: CloudSnapshot["progress"] = {};
  const progressEntries = Object.entries(snapshot.progress).sort(([left], [right]) =>
    Number(canonical(left) !== left) - Number(canonical(right) !== right),
  );
  for (const [word, value] of progressEntries) {
    const target = canonical(word);
    const explicitHidden = value.hiddenOverride ??
      (value.hidden !== isInitiallyHidden(word) ? value.hidden : undefined);
    const old = progress[target];
    if (!old) {
      progress[target] = { ...value, ...(explicitHidden !== undefined ? { hiddenOverride: explicitHidden } : {}) };
      continue;
    }
    const hiddenOverride = old.hiddenOverride ?? explicitHidden;
    progress[target] = {
      known: old.known || value.known,
      hidden: hiddenOverride ?? old.hidden,
      ...(hiddenOverride !== undefined ? { hiddenOverride } : {}),
      stage: Math.max(old.stage, value.stage),
      due: old.due && value.due ? (old.due < value.due ? old.due : value.due) : old.due ?? value.due,
      lastSent: old.lastSent && value.lastSent ? (old.lastSent > value.lastSent ? old.lastSent : value.lastSent) : old.lastSent ?? value.lastSent,
    };
  }
  const customSources = (snapshot.customSources ?? []).map((source) => {
    const grouped = new Map<string, Source["words"]>();
    for (const row of source.words) {
      const word = canonical(row.word);
      const existing = grouped.get(word);
      if (!existing) grouped.set(word, [{ ...row, word }]);
      else existing.push({ ...row, word });
    }
    return {
      ...source,
      words: [...grouped].map(([word, rows]) => ({
        word,
        frequency: rows.reduce((sum, row) => sum + row.frequency, 0),
        examples: [...new Set(rows.flatMap((row) => row.examples))].slice(0, 3),
        forms: [...new Set([word, ...rows.flatMap((row) => row.forms ?? [row.word])])],
      })),
    };
  });
  return {
    ...snapshot,
    notes,
    progress,
    draft: [...new Set(snapshot.draft.map(canonical))],
    customSources,
  };
}

export function usePublishedExplanation(
  state: State,
  word: string,
  body: string,
): State {
  if (!Object.hasOwn(state.words, word)) return state;
  return {
    ...state,
    words: {
      ...state.words,
      [word]: { ...state.words[word], note: body },
    },
  };
}

export function createCloudSnapshot(
  state: State,
  sharedNotes: Record<string, string> = {},
): CloudSnapshot {
  const notes: Record<string, string> = {};
  const progress: CloudSnapshot["progress"] = {};
  const customSources: Source[] = [];
  for (const [id, name] of Object.entries(state.sources)) {
    if (id === "cambridge-computer-science-2") continue;
    customSources.push({
      id,
      name,
      words: Object.values(state.words)
        .filter((word) => Object.hasOwn(word.sources, id))
        .map((word) => ({
          word: word.word,
          frequency: word.sources[id],
          examples: [...word.examples],
          forms: [...(word.forms ?? [word.word])],
        })),
    });
  }
  for (const [word, value] of Object.entries(state.words)) {
    if (value.note.trim() && value.note !== sharedNotes[word])
      notes[word] = value.note;
    if (
      value.known ||
      value.hidden !== isInitiallyHidden(word) ||
      value.hiddenOverride !== undefined ||
      value.stage !== 0 ||
      value.due ||
      value.lastSent
    ) {
      progress[word] = {
        known: value.known,
        hidden: value.hidden,
        ...(value.hiddenOverride !== undefined ? { hiddenOverride: value.hiddenOverride } : {}),
        stage: value.stage,
        ...(value.due ? { due: value.due } : {}),
        ...(value.lastSent ? { lastSent: value.lastSent } : {}),
      };
    }
  }
  return {
    limit: state.limit,
    notes,
    customSources,
    progress,
    draft: [...state.draft],
    history: structuredClone(state.history),
  };
}

export function applyCloudSnapshot(
  catalogue: State,
  snapshot: CloudSnapshot,
  sharedNotes: Record<string, string>,
): State {
  let state = structuredClone(catalogue);
  for (const source of snapshot.customSources ?? [])
    state = mergeSource(state, source);
  state.limit = snapshot.limit >= 5 && snapshot.limit <= 10 ? snapshot.limit : 5;
  state.draft = snapshot.draft.filter((word) => Object.hasOwn(state.words, word));
  state.history = structuredClone(snapshot.history);
  for (const [word, value] of Object.entries(state.words)) {
    if (Object.hasOwn(sharedNotes, word)) value.note = sharedNotes[word];
    if (Object.hasOwn(snapshot.notes, word)) value.note = snapshot.notes[word];
    const progress = Object.hasOwn(snapshot.progress, word)
      ? snapshot.progress[word]
      : undefined;
    if (progress) {
      value.known = progress.known;
      value.hidden = progress.hidden;
      const hiddenOverride = progress.hiddenOverride ??
        (progress.hidden !== isInitiallyHidden(word) ? progress.hidden : undefined);
      if (hiddenOverride === undefined) delete value.hiddenOverride;
      else value.hiddenOverride = hiddenOverride;
      value.stage = progress.stage;
      value.due = progress.due;
      value.lastSent = progress.lastSent;
    }
  }
  return state;
}
