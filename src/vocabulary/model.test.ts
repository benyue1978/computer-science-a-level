import { describe, it, expect } from "vitest";
import {
  emptyState,
  applyWordAliases,
  syncSharedVocabularySources,
  mergeSource,
  suggestions,
  sendDraft,
  sentToday,
  feedback,
  parseBackup,
  parseSource,
  type Source,
} from "./model";
const source: Source = {
  id: "book",
  name: "Book",
  words: [
    {
      word: "available",
      frequency: 40,
      examples: ["This is available today."],
    },
    { word: "considerable", frequency: 10, examples: [] },
    { word: "the", frequency: 400, examples: [] },
  ],
};
const setup = () => mergeSource(emptyState(), source);
describe("vocabulary learning", () => {
  it("keeps basic words searchable but excludes them from suggestions", () => {
    const s = setup();
    expect(s.words.the.hidden).toBe(true);
    expect(suggestions(s, "2026-09-30").map((w) => w.word)).toEqual([
      "available",
      "considerable",
    ]);
  });
  it("schedules only sent words, prioritizes due words and prevents same-day resend", () => {
    let s = setup();
    s.draft = ["considerable"];
    expect(s.words.considerable.due).toBeUndefined();
    s = sendDraft(s, "2026-09-30");
    expect(s.words.considerable.due).toBe("2026-10-03");
    expect(suggestions(s, "2026-10-03")[0].word).toBe("considerable");
    s.draft = ["considerable"];
    expect(() => sendDraft(s, "2026-09-30")).toThrow();
  });
  it("advances remembered intervals and brings difficult words back tomorrow", () => {
    let s = setup();
    s.draft = ["available"];
    s = sendDraft(s, "2026-09-30");
    s = feedback(s, "available", "remembered", "2026-10-03");
    expect(s.words.available.due).toBe("2026-10-10");
    s = feedback(s, "available", "practice", "2026-10-10");
    expect(s.words.available.due).toBe("2026-10-11");
  });
  it("merges sources once and preserves notes/progress", () => {
    const s = setup();
    s.words.available.note = "可以获得的";
    const twice = mergeSource(s, source);
    expect(twice.words.available.frequency).toBe(40);
    const next = mergeSource(twice, { ...source, id: "maths", name: "Maths" });
    expect(next.words.available.frequency).toBe(80);
    expect(next.words.available.note).toBe("可以获得的");
    expect(parseBackup(JSON.stringify(next))).toEqual(next);
  });

  it("applies approved aliases to counts, forms, notes, progress, and drafts", () => {
    let state = mergeSource(emptyState(), {
      id: "book", name: "Book", words: [
        { word: "start", frequency: 4, examples: ["Start now."], forms: ["start"] },
        { word: "started", frequency: 2, examples: ["It started."], forms: ["started"] },
      ],
    });
    state.words.start.note = "Target note";
    state.words.started.note = "Alias note";
    state.words.started.known = true;
    state.words.started.hidden = true;
    state.words.started.stage = 2;
    state.words.started.due = "2026-10-10";
    state.words.started.lastSent = "2026-09-30";
    state.words.start.stage = 3;
    state.words.start.due = "2026-10-05";
    state.words.start.lastSent = "2026-09-25";
    state.draft = ["started", "start"];
    const merged = applyWordAliases(state, { started: "start" });
    expect(merged.words.started).toBeUndefined();
    expect(merged.words.start.frequency).toBe(6);
    expect(merged.words.start.forms).toEqual(["start", "started"]);
    expect(merged.words.start.note).toBe("Target note");
    expect(merged.words.start.known).toBe(true);
    expect(merged.words.start.hidden).toBe(true);
    expect(merged.words.start.stage).toBe(3);
    expect(merged.words.start.due).toBe("2026-10-05");
    expect(merged.words.start.lastSent).toBe("2026-09-30");
    expect(merged.draft).toEqual(["start"]);
  });

  it("creates an in-memory canonical word when a lemma is absent from the source catalogue", () => {
    const state = mergeSource(emptyState(), {
      id: "book", name: "Book", words: [
        { word: "arrived", frequency: 3, examples: ["They arrived."], forms: ["arrived"] },
      ],
    });
    const merged = applyWordAliases(state, { arrived: "arrive" });
    expect(merged.words.arrived).toBeUndefined();
    expect(merged.words.arrive.frequency).toBe(3);
    expect(merged.words.arrive.forms).toEqual(["arrive", "arrived"]);
    expect(merged.words.arrive.sources.book).toBe(3);
  });

  it("syncs a new shared book into a returning browser cache without double-counting approved forms", () => {
    const cached = mergeSource(emptyState(), {
      id: "coursebook", name: "Coursebook", words: [
        { word: "start", frequency: 2, examples: [], forms: ["start"] },
        { word: "started", frequency: 3, examples: [], forms: ["started"] },
      ],
    });
    cached.words.started.note = "My note";
    const synced = syncSharedVocabularySources(cached, [
      { id: "coursebook", name: "Coursebook", words: [{ word: "start", frequency: 5, examples: [], forms: ["start", "started"] }] },
      { id: "maths", name: "Maths", words: [{ word: "volume", frequency: 7, examples: ["The volume is high."] }] },
    ], { started: "start" });
    expect(synced.words.start.frequency).toBe(5);
    expect(synced.words.start.sources.coursebook).toBe(5);
    expect(synced.words.volume.sources.maths).toBe(7);
    expect(synced.words.start.note).toBe("My note");
  });

  it("rejects cyclic approved mappings without modifying the input state", () => {
    const state = setup();
    expect(() => applyWordAliases(state, { available: "considerable", considerable: "available" })).toThrow(/circular/);
    expect(state.words.available.frequency).toBe(40);
    expect(state.words.considerable.frequency).toBe(10);
  });

  it("prefers an explicit canonical hidden preference over an alias preference", () => {
    const state = mergeSource(emptyState(), {
      id: "book", name: "Book", words: [
        { word: "the", frequency: 4, examples: [] },
        { word: "these", frequency: 2, examples: [] },
      ],
    });
    state.words.the.hidden = false;
    state.words.these.hidden = false;
    const merged = applyWordAliases(state, { these: "the" });
    expect(merged.words.the.hidden).toBe(false);
  });

  it("preserves a canonical hidden choice that happens to equal its normal default", () => {
    const state = mergeSource(emptyState(), {
      id: "book", name: "Book", words: [
        { word: "start", frequency: 4, examples: [] },
        { word: "started", frequency: 2, examples: [] },
      ],
    });
    state.words.start.hiddenOverride = false;
    state.words.started.hidden = true;
    state.words.started.hiddenOverride = true;
    expect(applyWordAliases(state, { started: "start" }).words.start.hidden).toBe(false);
  });
  it("counts earlier sent lists toward the daily total", () => {
    let s = mergeSource(setup(), {
      id: "extra",
      name: "Extra",
      words: ["alpha", "beta", "gamma", "delta"].map((word) => ({
        word,
        frequency: 1,
        examples: [],
      })),
    });
    s.draft = ["available", "considerable", "alpha", "beta", "gamma"];
    s = sendDraft(s, "2026-09-30");
    s.draft = ["delta"];
    expect(() => sendDraft(s, "2026-09-30")).toThrow();
    s.limit = 6;
    expect(sendDraft(s, "2026-09-30").words.delta.lastSent).toBe("2026-09-30");
  });
  it("records a draft on the day it was selected, even if marked sent later", () => {
    const s = mergeSource(setup(), {
      id: "extra", name: "Extra", words: [{ word: "alpha", frequency: 1, examples: [] }],
    });
    s.draft = ["available"];
    s.draftDate = "2026-09-30";
    const sent = sendDraft(s, "2026-10-01");
    expect(sent.history[0].date).toBe("2026-09-30");
    expect(sent.words.available.lastSent).toBe("2026-09-30");
    expect(sent.words.available.due).toBe("2026-10-03");
    expect(sentToday(sent, "2026-10-01")).toBe(0);
  });
  it("accepts ordinary words that coincide with object property names", () => {
    const source = parseSource(
      JSON.stringify({
        id: "new-book",
        name: "New",
        words: [
          { word: "constructor", frequency: 2, examples: [] },
          { word: "prototype", frequency: 1, examples: [] },
        ],
      }),
    );
    const s = mergeSource(emptyState(), source);
    const constructorKey: string = "constructor";
    expect(s.words[constructorKey].note).toBe("");
    expect(parseBackup(JSON.stringify(s))).toEqual(s);
  });
  it("ignores extra source fields that could corrupt saved review state", () => {
    const source = parseSource(
      JSON.stringify({
        id: "extra",
        name: "Extra",
        words: [
          {
            word: "hello",
            frequency: 2,
            examples: [],
            due: "oops",
            lastSent: "broken",
          },
        ],
      }),
    );
    const s = mergeSource(setup(), source);
    expect(s.words.hello.due).toBeUndefined();
    expect(parseBackup(JSON.stringify(s))).toEqual(s);
  });
  it("rejects an import whose merged frequency cannot be safely persisted", () => {
    const s = mergeSource(emptyState(), {
      id: "first",
      name: "First",
      words: [
        { word: "example", frequency: Number.MAX_SAFE_INTEGER, examples: [] },
      ],
    });
    expect(() =>
      mergeSource(s, {
        id: "second",
        name: "Second",
        words: [{ word: "example", frequency: 1, examples: [] }],
      }),
    ).toThrow();
    expect(s.words.example.frequency).toBe(Number.MAX_SAFE_INTEGER);
  });
  it("rejects malformed data and dangerous keys", () => {
    expect(() => parseBackup('{"version":1}')).toThrow();
    expect(() =>
      parseSource(
        JSON.stringify({
          ...source,
          words: [{ word: "__proto__", frequency: -2 }],
        }),
      ),
    ).toThrow();
  });
});
