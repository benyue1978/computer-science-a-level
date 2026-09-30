import { describe, it, expect } from "vitest";
import {
  emptyState,
  mergeSource,
  suggestions,
  sendDraft,
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
