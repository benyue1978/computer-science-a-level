export type Source = {
  id: string;
  name: string;
  words: {
    word: string;
    frequency: number;
    examples: string[];
    forms?: string[];
  }[];
};
export type Word = Source["words"][number] & {
  sources: Record<string, number>;
  note: string;
  hidden: boolean;
  known: boolean;
  stage: number;
  due?: string;
  lastSent?: string;
};
export type SentList = {
  date: string;
  entries: { word: string; example: string; note: string }[];
};
export type State = {
  version: 1;
  sources: Record<string, string>;
  words: Record<string, Word>;
  draft: string[];
  limit: number;
  history: SentList[];
};
const basic = new Set(
  "a an the and or but if then else that this these those it its is are was were be been being am i me my we us our you your he him his she her they them their to of in on at by for from with as into onto out up down not no yes do does did done have has had can could will would shall should may might must so than there here what which who whom when where why how each any all some such both other another very also just only more most much many own same one two".split(
    " ",
  ),
);
const intervals = [3, 7, 14, 30];
export const emptyState = (): State => ({
  version: 1,
  sources: {},
  words: {},
  draft: [],
  limit: 5,
  history: [],
});
export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
export function plusDays(day: string, days: number) {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function mergeSource(state: State, source: Source): State {
  const next = structuredClone(state);
  next.sources[source.id] = source.name;
  for (const entry of source.words) {
    const key = entry.word.toLowerCase();
    const old = Object.hasOwn(next.words, key) ? next.words[key] : undefined;
    const sources = { ...old?.sources, [source.id]: entry.frequency };
    next.words[key] = {
      ...(old ?? { note: "", hidden: basic.has(key), known: false, stage: 0 }),
      word: key,
      sources,
      frequency: Object.values(sources).reduce((a, b) => a + b, 0),
      examples: [
        ...new Set([...(old?.examples ?? []), ...entry.examples]),
      ].slice(0, 3),
      forms: [...new Set([...(old?.forms ?? []), ...(entry.forms ?? [key])])],
    };
  }
  return parseBackup(JSON.stringify(next));
}
export function suggestions(s: State, day: string): Word[] {
  return Object.values(s.words)
    .filter((w) => !w.hidden && w.lastSent !== day && (!w.due || w.due <= day))
    .sort(
      (a, b) =>
        Number(!!b.due) - Number(!!a.due) ||
        (a.due && b.due ? a.due.localeCompare(b.due) : 0) ||
        b.frequency - a.frequency ||
        a.word.localeCompare(b.word),
    );
}
export const sentToday = (s: State, day: string) =>
  s.history
    .filter((h) => h.date === day)
    .reduce((count, h) => count + h.entries.length, 0);
export function sendDraft(s: State, day: string): State {
  if (
    !s.draft.length ||
    s.draft.length + sentToday(s, day) > s.limit ||
    s.draft.some((k) => !s.words[k] || s.words[k].lastSent === day)
  )
    throw new Error(
      "Keep within your daily total and choose words that have not been sent today.",
    );
  const next = structuredClone(s);
  next.history.unshift({
    date: day,
    entries: next.draft.map((k) => ({
      word: k,
      example: next.words[k].examples[0] ?? "",
      note: next.words[k].note,
    })),
  });
  for (const k of next.draft) {
    const w = next.words[k];
    w.lastSent = day;
    w.due = plusDays(day, intervals[w.stage]);
  }
  next.draft = [];
  return next;
}
export function feedback(
  s: State,
  key: string,
  result: "remembered" | "practice",
  day: string,
): State {
  const next = structuredClone(s);
  const w = next.words[key];
  if (!w?.lastSent) return s;
  w.stage = result === "practice" ? 0 : Math.min(w.stage + 1, 3);
  w.due = plusDays(day, result === "practice" ? 1 : intervals[w.stage]);
  next.draft = next.draft.filter((k) => k !== key);
  return next;
}
export function listText(list: SentList): string {
  return (
    `Words for today · ${list.date}\n\n` +
    list.entries
      .map(
        (e, i) =>
          `${i + 1}. ${e.word}${e.note.trim() ? "\n" + e.note.trim() : ""}`,
      )
      .join("\n\n")
  );
}
function assert(condition: unknown): asserts condition {
  if (!condition)
    throw new Error(
      "This file is not a valid vocabulary file. Your current data has not changed.",
    );
}
const record = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 10000): v is string =>
  typeof v === "string" && v.length <= max;
const keyOK = (v: unknown): v is string =>
  typeof v === "string" && /^[a-z][a-z'-]{0,59}$/.test(v);
const sourceOK = (v: string) =>
  /^[a-z0-9][a-z0-9_-]{0,79}$/.test(v) &&
  !["constructor", "prototype", "__proto__"].includes(v);
const dateOK = (v: unknown) =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  !isNaN(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
function validEntry(w: unknown) {
  assert(
    record(w) &&
      keyOK(w.word) &&
      Number.isSafeInteger(w.frequency) &&
      w.frequency > 0,
  );
  assert(
    Array.isArray(w.examples) &&
      w.examples.length <= 3 &&
      w.examples.every((e: unknown) => text(e, 2000)),
  );
  assert(
    w.forms === undefined ||
      (Array.isArray(w.forms) && w.forms.length <= 100 && w.forms.every(keyOK)),
  );
}
export function parseSource(raw: string): Source {
  const s = JSON.parse(raw);
  assert(
    record(s) &&
      typeof s.id === "string" &&
      sourceOK(s.id) &&
      text(s.name, 200) &&
      s.name.trim(),
  );
  assert(
    Array.isArray(s.words) && s.words.length > 0 && s.words.length <= 100000,
  );
  const seen = new Set();
  for (const w of s.words) {
    validEntry(w);
    assert(!seen.has(w.word));
    seen.add(w.word);
  }
  return s as Source;
}
export function parseBackup(raw: string): State {
  const s = JSON.parse(raw);
  assert(record(s) && s.version === 1 && record(s.sources) && record(s.words));
  assert(
    Object.keys(s.sources).length <= 1000 &&
      Object.entries(s.sources).every(([k, v]) => sourceOK(k) && text(v, 200)),
  );
  assert(Object.keys(s.words).length <= 100000);
  for (const [k, w] of Object.entries(s.words)) {
    // Migrate browser data and backups saved before Known list was added.
    if (record(w) && w.known === undefined) w.known = false;
    validEntry(w);
    assert(
      record(w) &&
        keyOK(k) &&
        w.word === k &&
        text(w.note) &&
        typeof w.hidden === "boolean" &&
        typeof w.known === "boolean",
    );
    assert(
      Number.isInteger(w.stage) &&
        w.stage >= 0 &&
        w.stage <= 3 &&
        (w.due === undefined || dateOK(w.due)) &&
        (w.lastSent === undefined || dateOK(w.lastSent)),
    );
    assert((w.due === undefined) === (w.lastSent === undefined));
    assert(
      record(w.sources) &&
        Object.keys(w.sources).length > 0 &&
        Object.entries(w.sources).every(
          ([id, n]) =>
            Object.hasOwn(s.sources, id) &&
            Number.isSafeInteger(n) &&
            Number(n) > 0,
        ),
    );
    assert(
      Object.values(w.sources).reduce((a: number, n) => a + Number(n), 0) ===
        w.frequency,
    );
  }
  assert(
    Number.isInteger(s.limit) &&
      s.limit >= 5 &&
      s.limit <= 10 &&
      Array.isArray(s.draft) &&
      s.draft.length <= s.limit &&
      new Set(s.draft).size === s.draft.length &&
      s.draft.every((k: unknown) => keyOK(k) && Object.hasOwn(s.words, k)),
  );
  assert(Array.isArray(s.history) && s.history.length <= 100000);
  for (const h of s.history)
    assert(
      record(h) &&
        dateOK(h.date) &&
        Array.isArray(h.entries) &&
        h.entries.length > 0 &&
        h.entries.length <= 10 &&
        h.entries.every(
          (e: unknown) =>
            record(e) &&
            keyOK(e.word) &&
            Object.hasOwn(s.words, e.word) &&
            text(e.example, 2000) &&
            text(e.note),
        ),
    );
  return s as State;
}
