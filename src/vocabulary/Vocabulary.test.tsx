import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { emptyState, mergeSource } from "./model";

const mocks = vi.hoisted(() => ({
  loadState: vi.fn(),
  saveState: vi.fn(),
  addSharedDefaults: vi.fn(),
  getSharedExplanations: vi.fn(),
  loadAccountSnapshot: vi.fn(),
  restoreAccountState: vi.fn(),
  saveAccountSnapshot: vi.fn(),
  isVocabularyAdmin: vi.fn(),
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
  loadAccountSnapshot: mocks.loadAccountSnapshot,
  restoreAccountState: mocks.restoreAccountState,
  saveAccountSnapshot: mocks.saveAccountSnapshot,
  isVocabularyAdmin: mocks.isVocabularyAdmin,
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
    mocks.loadAccountSnapshot.mockResolvedValue(undefined);
    mocks.saveAccountSnapshot.mockResolvedValue(undefined);
    mocks.isVocabularyAdmin.mockResolvedValue(false);
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
    expect(await screen.findByText(/Published for everyone/)).toBeVisible();
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
});
