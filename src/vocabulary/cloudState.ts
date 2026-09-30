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
    { known: boolean; hidden: boolean; stage: number; due?: string; lastSent?: string }
  >;
  draft: string[];
  history: State["history"];
};

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
      value.stage !== 0 ||
      value.due ||
      value.lastSent
    ) {
      progress[word] = {
        known: value.known,
        hidden: value.hidden,
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
      value.stage = progress.stage;
      value.due = progress.due;
      value.lastSent = progress.lastSent;
    }
  }
  return state;
}
