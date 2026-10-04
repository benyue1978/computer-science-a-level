import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isVocabularyAdmin,
  generateVocabularyExplanation,
  publishSharedExplanation,
  buildSharedVocabularySources,
} from "./cloud";

describe("shared explanation access", () => {
  it("invokes the explanation function with the word and source sentence", async () => {
    const invoke = vi.fn().mockResolvedValue({
      data: { explanation: "  apple：苹果，一种常见的圆形水果。\n果肉可以直接食用，也常被做成果汁或果酱。  " },
      error: null,
    });
    const client = { functions: { invoke } } as unknown as SupabaseClient;

    await expect(generateVocabularyExplanation("apple", "An apple is red.", client))
      .resolves.toBe("apple：苹果，一种常见的圆形水果。\n果肉可以直接食用，也常被做成果汁或果酱。");
    expect(invoke).toHaveBeenCalledWith("generate-vocabulary-explanation", {
      body: { word: "apple", example: "An apple is red." },
    });
  });

  it("rejects an empty function response", async () => {
    const client = {
      functions: { invoke: vi.fn().mockResolvedValue({ data: { explanation: " " }, error: null }) },
    } as unknown as SupabaseClient;
    await expect(generateVocabularyExplanation("apple", undefined, client))
      .rejects.toThrow("The generated explanation was invalid.");
  });

  it("propagates a Supabase function error", async () => {
    const failure = new Error("Function returned 403");
    const client = {
      functions: { invoke: vi.fn().mockResolvedValue({ data: null, error: failure }) },
    } as unknown as SupabaseClient;
    await expect(generateVocabularyExplanation("apple", undefined, client)).rejects.toBe(failure);
  });

  it("rejects a malformed function response", async () => {
    const client = {
      functions: { invoke: vi.fn().mockResolvedValue({ data: { explanation: 3 }, error: null }) },
    } as unknown as SupabaseClient;
    await expect(generateVocabularyExplanation("apple", undefined, client))
      .rejects.toThrow("The generated explanation was invalid.");
  });

  it("rebuilds book sources from public catalogue words and per-source counts", () => {
    const sources = buildSharedVocabularySources(
      [{ id: "maths", name: "Maths" }, { id: "empty", name: "Empty" }],
      [{ word: "volume", forms: ["volume", "volumes"], examples: ["The volume is high."] }],
      [{ source_id: "maths", word: "volume", frequency: 12 }],
    );
    expect(sources).toEqual([{
      id: "maths", name: "Maths", words: [{
        word: "volume", frequency: 12, forms: ["volume", "volumes"], examples: ["The volume is high."],
      }],
    }]);
  });
  it("reads the current account's admin status", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const client = { rpc } as unknown as SupabaseClient;

    await expect(isVocabularyAdmin(client)).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("is_vocabulary_admin");
  });

  it("publishes a trimmed explanation as a shared word record", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const from = vi.fn().mockReturnValue({ upsert });
    const client = { from } as unknown as SupabaseClient;

    await publishSharedExplanation("available", "  Shared definition  ", "admin-id", client);

    expect(from).toHaveBeenCalledWith("shared_explanations");
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({
      word: "available",
      body: "Shared definition",
      updated_by: "admin-id",
    }));
  });

  it("rejects blank text without making a shared write", async () => {
    const upsert = vi.fn();
    const client = {
      from: vi.fn().mockReturnValue({ upsert }),
    } as unknown as SupabaseClient;

    await expect(
      publishSharedExplanation("available", "   ", "admin-id", client),
    ).rejects.toThrow("An explanation is required.");
    expect(upsert).not.toHaveBeenCalled();
  });

  it("propagates a rejected shared write", async () => {
    const failure = new Error("Admin access required");
    const upsert = vi.fn().mockResolvedValue({ error: failure });
    const client = {
      from: vi.fn().mockReturnValue({ upsert }),
    } as unknown as SupabaseClient;

    await expect(
      publishSharedExplanation("available", "Shared definition", "admin-id", client),
    ).rejects.toBe(failure);
  });
});
