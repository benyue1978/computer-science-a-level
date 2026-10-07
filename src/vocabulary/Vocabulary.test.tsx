import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { emptyState, mergeSource, today } from "./model";

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
  authStateChange: vi.fn(),
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
      onAuthStateChange: vi.fn((callback) => {
        mocks.authStateChange.mockImplementation(callback);
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
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
    mocks.generateVocabularyExplanation.mockResolvedValue("apple：苹果，一种常见的圆形水果。\n果肉可以直接食用，也常被做成果汁或果酱。");
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

  it("shows the copy button busy state while the clipboard write is pending", async () => {
    let finishCopy: (() => void) | undefined;
    const user = userEvent.setup();
    const writeText = vi.fn(() => new Promise<void>((resolve) => { finishCopy = resolve; }));
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    fireEvent.click(screen.getByRole("button", { name: "Copy today’s list" }));
    expect(writeText).toHaveBeenCalledOnce();
    expect(finishCopy).toBeDefined();
    const copying = screen.getByRole("button", { name: "Copying…" });
    expect(copying).toBeDisabled();
    expect(copying.querySelector(".v-copy-spinner")).not.toBeNull();

    await act(async () => { finishCopy?.(); });
    expect(await screen.findByText("List copied. Paste it into your notebook or message.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Copy today’s list" })).toBeEnabled();
  });

  it("keeps due reviews selectable after the new-word quota is full", async () => {
    const state = mergeSource(accountState(), {
      id: "extra", name: "Extra", words: ["alpha", "beta", "gamma", "delta", "epsilon"].map((word) => ({
        word, frequency: 1, examples: [],
      })),
    });
    state.words.apple.lastSent = "2026-10-01";
    state.words.apple.due = today();
    mocks.loadState.mockResolvedValue(state);
    const user = userEvent.setup();
    render(<Vocabulary />);
    await screen.findByRole("heading", { name: "alpha" });

    for (const word of ["alpha", "beta", "gamma", "delta", "epsilon"]) {
      const card = await screen.findByRole("heading", { name: word }).then((heading) => heading.closest("article"));
      expect(card).not.toBeNull();
      await user.click(within(card as HTMLElement).getByRole("button", { name: "+ Add to today" }));
    }
    expect(screen.getByText("5 of 5 new words chosen")).toBeVisible();

    const reviewCard = screen.getByRole("heading", { name: "apple" }).closest("article");
    expect(reviewCard).not.toBeNull();
    const reviewAddButton = within(reviewCard as HTMLElement).getByRole("button", { name: "+ Add to today" });
    expect(reviewAddButton).toBeEnabled();
    await user.click(reviewAddButton);
    expect(screen.getByText("5 of 5 new words chosen")).toBeVisible();
    expect(screen.getByText(/1 review selected/)).toBeVisible();
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
      .toHaveValue("apple：苹果，一种常见的圆形水果。\n果肉可以直接食用，也常被做成果汁或果酱。");
  });

  it("does not apply a pending explanation after the signed-in account changes", async () => {
    mocks.isVocabularyAdmin.mockResolvedValue(true);
    let resolveGeneration: (note: string) => void = () => {};
    mocks.generateVocabularyExplanation.mockImplementation(() => new Promise((resolve) => {
      resolveGeneration = resolve;
    }));
    const user = userEvent.setup();
    render(<Vocabulary />);

    await user.click(await screen.findByRole("button", { name: "+ Add to today" }));
    await user.click(await screen.findByRole("button", { name: "Generate explanation for apple" }));
    expect(screen.getByRole("button", { name: "Generating explanation for apple" })).toBeDisabled();

    act(() => {
      mocks.authStateChange("SIGNED_IN", {
        user: { id: "account-2", email: "second@example.com" },
      });
    });
    expect(await screen.findByText("second@example.com")).toBeVisible();
    await screen.findByRole("button", { name: "+ Add to today" });
    await act(async () => {
      resolveGeneration("apple：苹果，一种常见的圆形水果。\n果肉可以直接食用，也常被做成果汁或果酱。");
    });

    await user.click(screen.getByRole("button", { name: "+ Add to today" }));
    expect(await screen.findByRole("textbox", { name: "Explanation for apple" })).toHaveValue("");
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
