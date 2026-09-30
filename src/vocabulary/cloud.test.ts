import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isVocabularyAdmin,
  publishSharedExplanation,
} from "./cloud";

describe("shared explanation access", () => {
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
});
