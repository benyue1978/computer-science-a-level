import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  getSession: vi.fn(),
  isAdmin: vi.fn(),
  batches: vi.fn(),
  candidates: vi.fn(),
  merge: vi.fn(),
  mergeAll: vi.fn(),
  decide: vi.fn(),
}));
vi.mock("./supabaseClient", () => ({ supabase: { auth: {
  onAuthStateChange: mocks.onAuthStateChange,
  getSession: mocks.getSession,
} } }));
vi.mock("./cloud", () => ({
  isVocabularyAdmin: mocks.isAdmin,
  getLemmaBatches: mocks.batches,
  getLemmaCandidates: mocks.candidates,
  mergeLemmaCandidate: mocks.merge,
  mergeAllSafeLemmaCandidates: mocks.mergeAll,
  decideLemmaCandidate: mocks.decide,
}));
import VocabularyLemmaReview from "./VocabularyLemmaReview";

const batch = { batch_key: "batch", source_id: "book", source_name: "Coursebook", spacy_version: "3.8.16", model_name: "en_core_web_sm", model_version: "3.8.0", created_at: "2026-10-01T00:00:00Z" };
const candidate = { id: "one", batch_key: "batch", surface_form: "started", proposed_target: "start", frequency: 20, pos_evidence: { VERB: 20 }, examples: ["It started."], ambiguous: false, review_required: false, status: "pending" as const };

beforeEach(() => {
  mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "admin" } } } });
  mocks.isAdmin.mockResolvedValue(true);
  mocks.batches.mockResolvedValue([batch]);
  mocks.candidates.mockResolvedValue([candidate]);
  mocks.merge.mockResolvedValue(undefined);
  mocks.mergeAll.mockResolvedValue({ merged: 1, conflicting_forms: 1, failed: 0, failed_ids: [], remaining: 0 });
  mocks.decide.mockResolvedValue(undefined);
});
afterEach(() => cleanup());

describe("vocabulary lemma review", () => {
  it("does not fetch candidate rows for signed-out or ordinary users", async () => {
    mocks.getSession.mockResolvedValueOnce({ data: { session: null } });
    render(<VocabularyLemmaReview />);
    expect(await screen.findByRole("status")).toHaveTextContent("Sign in to review vocabulary word forms.");
    expect(mocks.batches).not.toHaveBeenCalled();
    cleanup();
    mocks.getSession.mockResolvedValueOnce({ data: { session: { user: { id: "user" } } } });
    mocks.isAdmin.mockResolvedValueOnce(false);
    render(<VocabularyLemmaReview />);
    expect(await screen.findByText("This page is available to vocabulary administrators.")).toBeInTheDocument();
    expect(mocks.batches).not.toHaveBeenCalled();
  });

  it("shows frequent suggestions first and keeps feedback next to the reviewed word", async () => {
    let current: Omit<typeof candidate, "status"> & { status: "pending" | "merged" | "kept" } = { ...candidate };
    mocks.candidates.mockImplementation(async () => [current]);
    mocks.decide.mockImplementation(async () => { current = { ...current, status: "kept" }; });
    render(<VocabularyLemmaReview />);
    const row = await screen.findByText("started");
    expect(row).toBeInTheDocument();
    expect(within(row.closest("article")!).getByText("20×")).toBeInTheDocument();
    await userEvent.click(within(row.closest("article")!).getByRole("button", { name: "Keep separate" }));
    expect(await within(row.closest("article")!).findByRole("status")).toHaveTextContent("Kept as a separate word.");
    expect(mocks.decide).toHaveBeenCalledWith("one", "kept");
    expect(within(row.closest("article")!).getByText("Kept separate")).toBeInTheDocument();
    expect(within(row.closest("article")!).queryByRole("button", { name: "Keep separate" })).toBeNull();
  });

  it("merges to the edited target and shows RPC failures beside the candidate", async () => {
    mocks.merge.mockRejectedValueOnce(new Error("Target word is missing."));
    render(<VocabularyLemmaReview />);
    const row = await screen.findByText("started");
    const card = row.closest("article")!;
    const target = within(card).getByLabelText("Merge into");
    await userEvent.clear(target);
    await userEvent.type(target, "begin");
    await userEvent.click(within(card).getByRole("button", { name: "Merge" }));
    await waitFor(() => expect(mocks.merge).toHaveBeenCalledWith("one", "begin"));
    expect(await within(card).findByRole("alert")).toHaveTextContent("Target word is missing.");
  });

  it("keeps the returned frequency ordering and filters candidates by word or target", async () => {
    mocks.candidates.mockResolvedValue([
      { ...candidate, id: "high", frequency: 20 },
      { ...candidate, id: "low", surface_form: "running", proposed_target: "run", frequency: 5 },
    ]);
    render(<VocabularyLemmaReview />);
    const words = await screen.findAllByRole("heading", { level: 2 });
    expect(words.map((word) => word.textContent)).toEqual(["started", "running"]);
    await userEvent.type(screen.getByRole("textbox", { name: "Search" }), "run");
    expect(screen.getByRole("heading", { name: "running" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "started" })).toBeNull();
  });

  it("offers one bulk action for safe suggestions and leaves review-required forms untouched", async () => {
    mocks.candidates.mockResolvedValue([
      { ...candidate, id: "safe", frequency: 20 },
      { ...candidate, id: "ambiguous", surface_form: "uses", proposed_target: "use", frequency: 10, ambiguous: true, review_required: true },
    ]);
    render(<VocabularyLemmaReview />);
    const bulk = await screen.findByRole("button", { name: /Merge all safe suggestions/i });
    expect(screen.getByText(/1 word form has competing targets and will stay separate/i)).toBeInTheDocument();
    await userEvent.click(bulk);
    await waitFor(() => expect(mocks.mergeAll).toHaveBeenCalledWith("batch", []));
    expect(await screen.findByRole("status")).toHaveTextContent("Merged 1 suggestion. 1 word form has competing targets and stayed separate.");
  });
});
