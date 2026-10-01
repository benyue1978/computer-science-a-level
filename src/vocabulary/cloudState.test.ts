import { describe, expect, it } from "vitest";
import { emptyState, mergeSource, type Source } from "./model";
import {
  applyCloudSnapshot,
  applyAliasesToCloudSnapshot,
  createCloudSnapshot,
  usePublishedExplanation,
} from "./cloudState";

const source: Source = {
  id: "cambridge-computer-science-2",
  name: "Coursebook",
  words: [
    { word: "available", frequency: 8, examples: ["It is available."] },
    { word: "the", frequency: 80, examples: [] },
  ],
};

describe("cloud account state", () => {
  it("normalizes old account keys and custom-source words through approved aliases", () => {
    const merged = applyAliasesToCloudSnapshot({
      limit: 5,
      notes: { started: "older note", start: "target note" },
      customSources: [{ id: "maths", name: "Maths", words: [
        { word: "started", frequency: 2, examples: ["Started."], forms: ["started"] },
        { word: "start", frequency: 3, examples: ["Start."], forms: ["start"] },
      ] }],
      progress: {
        started: { known: true, hidden: true, stage: 1, due: "2026-10-10", lastSent: "2026-09-20" },
        start: { known: false, hidden: false, stage: 3, due: "2026-10-05", lastSent: "2026-09-25" },
      },
      draft: ["started", "start"],
      history: [{ date: "2026-09-30", entries: [{ word: "started", example: "", note: "snapshot" }] }],
    }, { started: "start" });
    expect(merged.notes).toEqual({ start: "target note" });
    expect(merged.customSources[0].words).toEqual([{
      word: "start", frequency: 5, examples: ["Started.", "Start."], forms: ["start", "started"],
    }]);
    expect(merged.progress.start).toEqual({
      known: true, hidden: true, hiddenOverride: true, stage: 3, due: "2026-10-05", lastSent: "2026-09-25",
    });
    expect(merged.draft).toEqual(["start"]);
    expect(merged.history[0].entries[0].word).toBe("started");
  });

  it("retains an explicit hidden override that matches the default value", () => {
    const state = mergeSource(emptyState(), source);
    state.words.available.hidden = false;
    state.words.available.hiddenOverride = false;
    const snapshot = createCloudSnapshot(state);
    expect(snapshot.progress.available.hiddenOverride).toBe(false);
    const restored = applyCloudSnapshot(state, snapshot, {});
    expect(restored.words.available.hiddenOverride).toBe(false);
  });

  it("prefers the canonical explicit hidden override even when it equals the default", () => {
    const merged = applyAliasesToCloudSnapshot({
      limit: 5, notes: {}, customSources: [], draft: [], history: [],
      progress: {
        start: { known: false, hidden: false, hiddenOverride: false, stage: 0 },
        started: { known: false, hidden: true, hiddenOverride: true, stage: 0 },
      },
    }, { started: "start" });
    expect(merged.progress.start.hidden).toBe(false);
    expect(merged.progress.start.hiddenOverride).toBe(false);
  });
  it("stores only personal differences and restores them over a fresh catalogue", () => {
    const state = mergeSource(
      mergeSource(emptyState(), source),
      {
        id: "maths",
        name: "Maths",
        words: [{ word: "volume", frequency: 3, examples: ["Volume is measured in litres."] }],
      },
    );
    state.words.available.note = "可以获得的";
    state.words.available.known = true;
    state.words.available.hidden = true;
    state.words.the.hidden = false;
    state.words.the.known = false;
    state.words.volume.note = "体积";
    state.words.available.stage = 1;
    state.words.available.lastSent = "2026-09-30";
    state.words.available.due = "2026-10-07";
    state.draft = ["the"];
    const snapshot = createCloudSnapshot(state);

    expect(snapshot.notes).toEqual({ available: "可以获得的", volume: "体积" });
    expect(snapshot.customSources).toHaveLength(1);
    expect(snapshot.customSources[0].id).toBe("maths");
    expect(snapshot.progress).toEqual({
      available: {
        known: true,
        hidden: true,
        stage: 1,
        due: "2026-10-07",
        lastSent: "2026-09-30",
      },
      the: { known: false, hidden: false, stage: 0 },
    });
    const restored = applyCloudSnapshot(
      mergeSource(emptyState(), source),
      snapshot,
      { available: "Shared definition", the: "Shared article" },
    );
    expect(restored.words.available.note).toBe("可以获得的");
    expect(restored.words.available.known).toBe(true);
    expect(restored.words.available.due).toBe("2026-10-07");
    expect(restored.words.the.note).toBe("Shared article");
    expect(restored.words.the.hidden).toBe(false);
    expect(restored.words.volume.note).toBe("体积");
    expect(restored.words.volume.sources.maths).toBe(3);
    expect(restored.draft).toEqual(["the"]);
  });

  it("uses shared explanations when an account has no personal override", () => {
    const state = mergeSource(emptyState(), source);
    const restored = applyCloudSnapshot(
      state,
      { limit: 5, notes: {}, customSources: [], progress: {}, draft: [], history: [] },
      { available: "Shared definition" },
    );
    expect(restored.words.available.note).toBe("Shared definition");
  });

  it("does not copy shared explanations into the account-specific overrides", () => {
    const state = mergeSource(emptyState(), source);
    state.words.available.note = "Shared definition";
    state.words.the.note = "My own explanation";
    expect(
      createCloudSnapshot(state, { available: "Shared definition" }).notes,
    ).toEqual({ the: "My own explanation" });
  });

  it("uses the published explanation and stops storing it as a personal override", () => {
    const state = mergeSource(emptyState(), source);
    state.words.available.note = "My draft";

    const published = usePublishedExplanation(state, "available", "Shared definition");

    expect(published.words.available.note).toBe("Shared definition");
    expect(createCloudSnapshot(published, { available: "Shared definition" }).notes)
      .not.toHaveProperty("available");
  });

  it("does not mistake inherited object properties for saved word progress", () => {
    const catalogue = mergeSource(emptyState(), {
      ...source,
      words: [{ word: "constructor", frequency: 1, examples: [] }],
    });
    const restored = applyCloudSnapshot(
      catalogue,
      { limit: 5, notes: {}, customSources: [], progress: {}, draft: [], history: [] },
      {},
    );
    expect(restored.words["constructor"].known).toBe(false);
    expect(restored.words["constructor"].stage).toBe(0);
  });
});
