import { describe, expect, it } from "vitest";
import { emptyState, mergeSource, type Source } from "./model";
import { applyCloudSnapshot, createCloudSnapshot } from "./cloudState";

const source: Source = {
  id: "cambridge-computer-science-2",
  name: "Coursebook",
  words: [
    { word: "available", frequency: 8, examples: ["It is available."] },
    { word: "the", frequency: 80, examples: [] },
  ],
};

describe("cloud account state", () => {
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
