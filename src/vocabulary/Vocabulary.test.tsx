import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { emptyState, mergeSource } from "./model";

const mocks = vi.hoisted(() => ({
  loadState: vi.fn(),
  saveState: vi.fn(),
  addSharedDefaults: vi.fn(),
  getSharedExplanations: vi.fn(),
  getVocabularyAliases: vi.fn(),
  getSharedVocabularySources: vi.fn(),
  loadAccountSnapshot: vi.fn(),
  restoreAccountState: vi.fn(),
  saveAccountSnapshot: vi.fn(),
  isVocabularyAdmin: vi.fn(),
  generateVocabularyExplanation: vi.fn(),
  publishSharedExplanation: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("./storage", () => ({
  loadState: mocks.loadState,
  saveState: mocks.saveState,
}));

vi.mock("./cloud", () => ({
  addSharedDefaults: mocks.addSharedDefaults,
  getSharedExplanations: mocks.getSharedExplanations,
  getVocabularyAliases: mocks.getVocabularyAliases,
  getSharedVocabularySources: mocks.getSharedVocabularySources,
  loadAccountSnapshot: mocks.loadAccountSnapshot,
  restoreAccountState: mocks.restoreAccountState,
  saveAccountSnapshot: mocks.saveAccountSnapshot,
  isVocabularyAdmin: mocks.isVocabularyAdmin,
  generateVocabularyExplanation: mocks.generateVocabularyExplanation,
  publishSharedExplanation: mocks.publishSharedExplanation,
}));

vi.mock("./supabaseClient", () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: mocks.getSession,
    },
  },
}));

import Vocabulary from "./Vocabulary";

const accountState = () =>
  mergeSource(emptyState(), {
    id: "coursebook",
    name: "Coursebook",
    words: [{ word: "apple", frequency: 4, examples: ["An apple is red."] }],
  });

describe("administrator explanation controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadState.mockResolvedValue(accountState());
    mocks.saveState.mockResolvedValue(undefined);
    mocks.addSharedDefaults.mockImplementation((state) => state);
    mocks.getSharedExplanations.mockResolvedValue({});
    mocks.getVocabularyAliases.mockResolvedValue({});
    mocks.getSharedVocabularySources.mockResolvedValue([]);
    mocks.loadAccountSnapshot.mockResolvedValue(undefined);
    mocks.saveAccountSnapshot.mockResolvedValue(undefined);
    mocks.isVocabularyAdmin.mockResolvedValue(false);
    mocks.generateVocabularyExplanation.mockResolvedValue("Meaning: a fruit.\n中文：一种水果。");
    mocks.publishSharedExplanation.mockResolvedValue(undefined);
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: "account-1", email: "person@example.com" } } },
      error: null,
    });
  });

  it("does not offer publishing to a non-admin in Today", async () => {
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    expect(screen.getByRole("textbox", { name: "Explanation for apple" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Publish for everyone" })).toBeNull();
  });

  it("does not offer generation to a non-admin in Today", async () => {
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    expect(screen.queryByRole("button", { name: "Generate explanation for apple" })).toBeNull();
  });

  it("shows generation for a blank explanation in All words", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "All words" }));
    expect(await screen.findByRole("button", { name: "Generate explanation for apple" }))
      .toBeVisible();
  });

  it("generates a private explanation from Today using the source sentence", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    await user.click(await screen.findByRole("button", { name: "Generate explanation for apple" }));
    expect(mocks.generateVocabularyExplanation)
      .toHaveBeenCalledWith("apple", "An apple is red.");
    expect(await screen.findByRole("textbox", { name: "Explanation for apple" }))
      .toHaveValue("Meaning: a fruit.\n中文：一种水果。");
  });

  it("keeps a blank note and shows a retryable alert when generation fails", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    mocks.generateVocabularyExplanation.mockRejectedValue(new Error("Function returned 502"));
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    await user.click(await screen.findByRole("button", { name: "Generate explanation for apple" }));
    expect(await screen.findByRole("alert"))
      .toHaveTextContent("Could not generate this explanation. Try again.");
    expect(screen.getByRole("textbox", { name: "Explanation for apple" })).toHaveValue("");
  });

  it("hides generation when an explanation already exists", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    await user.type(screen.getByRole("textbox", { name: "Explanation for apple" }), "A fruit");
    expect(screen.queryByRole("button", { name: "Generate explanation for apple" })).toBeNull();
  });

  it("lets an administrator publish from Today and shows the shared result", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    const editor = screen.getByRole("textbox", { name: "Explanation for apple" });
    await user.type(editor, "A fruit");
    await user.click(screen.getByRole("button", { name: "Publish for everyone" }));

    await waitFor(() => expect(mocks.publishSharedExplanation)
      .toHaveBeenCalledWith("apple", "A fruit", "account-1"));
    expect(editor).toHaveValue("A fruit");
    const feedback = await screen.findByText("Published for everyone.");
    expect(feedback).toHaveClass("v-action-feedback");
    expect(screen.queryByText("Published for everyone.", { selector: ".v-notice" })).toBeNull();
  });

  it("keeps the explanation draft when a shared publish fails", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    mocks.publishSharedExplanation.mockRejectedValue(new Error("Admin access required"));
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    const editor = screen.getByRole("textbox", { name: "Explanation for apple" });
    await user.type(editor, "A fruit");
    await user.click(screen.getByRole("button", { name: "Publish for everyone" }));

    const feedback = await screen.findByRole("alert");
    expect(feedback).toHaveClass("v-action-feedback");
    expect(feedback).toHaveTextContent(
      "Could not publish this explanation. Admin access required",
    );
    expect(editor).toHaveValue("A fruit");
  });

  it("shows the publishing action in the All words editor for an administrator", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "All words" }));
    await user.click(await screen.findByRole("button", { name: "Add explanation" }));
    expect(screen.getByRole("textbox", { name: "Explanation for apple" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Publish for everyone" })).toBeVisible();
  });

  it("adds a newly shared book to a returning browser cache", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mocks.getSharedVocabularySources.mockResolvedValue([{
      id: "maths", name: "Maths", words: [{ word: "volume", frequency: 7, examples: ["The volume is high."] }],
    }]);
    const user = userEvent.setup();
    render(<Vocabulary />);
    await user.click(await screen.findByRole("button", { name: "All words" }));
    await user.type(screen.getByRole("textbox", { name: "Search words" }), "volume");
    expect(await screen.findByText("volume")).toBeVisible();
  });
});
