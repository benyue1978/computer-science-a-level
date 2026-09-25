import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CopyingValues from "./CopyingValues";

const next = async (user: ReturnType<typeof userEvent.setup>, count = 1) => {
  for (let index = 0; index < count; index += 1) {
    await user.click(screen.getByRole("button", { name: "Next section" }));
  }
};

test("introduces source and destination, revealing explanations only together", async () => {
  const user = userEvent.setup();
  render(<CopyingValues language="en" />);

  expect(screen.getByRole("heading", { name: "Copying values" })).toBeVisible();
  expect(screen.getByRole("group", { name: "Computer" })).toBeVisible();
  expect(screen.getByRole("group", { name: "Processor" })).toBeVisible();

  await user.click(
    within(screen.getByRole("group", { name: "Which is the source?" })).getByRole(
      "button",
      { name: "Register A" },
    ),
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await user.click(
    within(
      screen.getByRole("group", { name: "Which is the destination?" }),
    ).getByRole("button", { name: "Register B" }),
  );
  expect(screen.getAllByRole("status")).toHaveLength(2);
});

test("Mandarin source and destination keep language-independent visual roles", () => {
  render(<CopyingValues language="zh" />);
  expect(screen.getByRole("group", { name: "寄存器 A" })).toHaveClass(
    "source-location",
  );
  expect(screen.getByRole("group", { name: "寄存器 B" })).toHaveClass(
    "destination-location",
  );
});

test("optional register recall offers recovery without gating the lesson", async () => {
  const user = userEvent.setup();
  render(<CopyingValues language="en" />);

  await user.click(
    within(screen.getByRole("group", { name: "Optional register recall" })).getByRole(
      "button",
      { name: "42" },
    ),
  );
  expect(screen.getByRole("link", { name: "Revisit processors" })).toHaveAttribute(
    "href",
    "/learn/processor-registers",
  );
  await next(user);
  expect(
    screen.getByRole("heading", { name: "Copy from A to B." }),
  ).toBeVisible();
});

test("register copy waits for both predictions and preserves the source", async () => {
  const user = userEvent.setup();
  render(<CopyingValues language="en" />);
  await next(user);

  const result = screen.getByTestId("register-copy-result");
  expect(result).toHaveAttribute("hidden");
  const show = screen.getByRole("button", { name: "Show copy" });
  expect(show).toBeDisabled();

  const sourceChoice = within(
    screen.getByRole("group", {
      name: "What will Register A contain after the copy?",
    }),
  ).getByRole("button", { name: "7" });
  await user.click(sourceChoice);
  expect(show).toBeDisabled();
  await user.click(
    within(
      screen.getByRole("group", {
        name: "What will Register B contain after the copy?",
      }),
    ).getByRole("button", { name: "7" }),
  );
  expect(show).toBeEnabled();

  show.focus();
  await user.click(show);
  expect(document.activeElement).toBe(show);
  expect(show).toHaveAttribute("aria-expanded", "true");
  expect(result).not.toHaveAttribute("hidden");
  const after = within(result).getByRole("group", { name: "After" });
  expect(within(after).getByRole("group", { name: "Register A" })).toHaveTextContent("7");
  expect(within(after).getByRole("group", { name: "Register B" })).toHaveTextContent("7");
  expect(sourceChoice).toHaveAttribute("aria-disabled", "true");
  await user.click(sourceChoice);
  expect(sourceChoice).toHaveAttribute("aria-pressed", "true");

  await user.click(show);
  expect(show).toHaveAttribute("aria-expanded", "true");
  expect(document.activeElement).toBe(show);
});

test("a spoken register prediction also enables the copy", async () => {
  const user = userEvent.setup();
  render(<CopyingValues language="en" />);
  await next(user);
  await user.click(
    screen.getByRole("button", { name: "I have made my prediction" }),
  );
  expect(screen.getByRole("button", { name: "Show copy" })).toBeEnabled();
});

test("wrong predictions receive the same causal explanation without scoring", async () => {
  const user = userEvent.setup();
  render(<CopyingValues language="en" />);
  await next(user);

  const wrongSource = within(
    screen.getByRole("group", {
      name: "What will Register A contain after the copy?",
    }),
  ).getByRole("button", { name: "42" });
  const wrongDestination = within(
    screen.getByRole("group", {
      name: "What will Register B contain after the copy?",
    }),
  ).getByRole("button", { name: "42" });
  await user.click(wrongSource);
  await user.click(wrongDestination);
  await user.click(screen.getByRole("button", { name: "Show copy" }));

  expect(screen.getByRole("status")).toHaveTextContent(
    "Register A stays 7 because it is the source. Register B changes from 42 to 7 because it is the destination.",
  );
  expect(screen.queryByText(/score|points|seconds|timer/i)).not.toBeInTheDocument();
  expect(wrongSource).toHaveAttribute("aria-disabled", "true");
  expect(wrongDestination).toHaveAttribute("aria-disabled", "true");
});

test("memory copy keeps address 11 and its contents while replacing Register A", async () => {
  const user = userEvent.setup();
  render(<CopyingValues language="en" />);
  await next(user, 2);

  const memory = screen.getByRole("group", { name: "Main memory" });
  expect(within(memory).getByRole("group", { name: "Address 10" })).toHaveTextContent("7");
  expect(within(memory).getByRole("group", { name: "Address 11" })).toHaveTextContent("42");
  expect(within(memory).getByRole("group", { name: "Address 12" })).toHaveTextContent("9");

  await user.click(
    within(
      screen.getByRole("group", { name: "Optional address and contents check" }),
    ).getByRole("button", { name: "11" }),
  );
  const mistakenAddress = within(
    screen.getByRole("group", { name: "Optional address and contents check" }),
  ).getByRole("button", { name: "11" });
  const correctContents = within(
    screen.getByRole("group", { name: "Optional address and contents check" }),
  ).getByRole("button", { name: "42" });
  expect(screen.getByRole("link", { name: "Revisit memory" })).toHaveAttribute(
    "href",
    "/learn/memory",
  );
  expect(screen.getByText(/11 is the address label; 42 is its contents/)).toBeVisible();
  expect(
    within(
      screen.getByRole("group", { name: "Optional address and contents check" }),
    ).getByRole("status"),
  ).toHaveTextContent("11 is the address label");
  expect(mistakenAddress).toHaveAttribute("aria-disabled", "true");
  await user.click(correctContents);
  expect(mistakenAddress).toHaveAttribute("aria-pressed", "true");
  expect(correctContents).toHaveAttribute("aria-pressed", "false");

  const show = screen.getByRole("button", { name: "Show copy" });
  expect(show).toBeDisabled();
  const memoryPrediction = within(
    screen.getByRole("group", {
      name: "What will address 11 contain after the copy?",
    }),
  ).getByRole("button", { name: "42" });
  await user.click(memoryPrediction);
  expect(show).toBeDisabled();
  await user.click(
    within(
      screen.getByRole("group", {
        name: "What will Register A contain after the copy?",
      }),
    ).getByRole("button", { name: "42" }),
  );
  expect(show).toBeEnabled();
  await user.click(show);

  const result = screen.getByTestId("memory-copy-result");
  const after = within(result).getByRole("group", { name: "After" });
  expect(within(after).getByRole("group", { name: "Address 10" })).toHaveTextContent("7");
  expect(within(after).getByRole("group", { name: "Address 11" })).toHaveTextContent("42");
  expect(within(after).getByRole("group", { name: "Address 12" })).toHaveTextContent("9");
  expect(within(after).getByRole("group", { name: "Register A" })).toHaveTextContent("42");
  expect(memoryPrediction).toHaveAttribute("aria-disabled", "true");
  expect(
    within(
      screen.getByRole("group", { name: "Optional address and contents check" }),
    ).getByRole("button", { name: "11" }),
  ).toHaveAttribute("aria-disabled", "true");
  expect(screen.getByText(/result, not the physical route/)).toHaveTextContent(
    "next exploration introduces buses",
  );
});

test("fresh examples use a separate reveal after all eight predictions", async () => {
  const user = userEvent.setup();
  render(<CopyingValues language="en" />);
  await next(user, 3);

  const predictions: [string, string][] = [
    ["Example 1: which location is the source?", "Register B"],
    ["Example 1: which location is the destination?", "Register A"],
    ["Example 1: what is the source’s final value?", "3"],
    ["Example 1: what is the destination’s final value?", "3"],
    ["Example 2: which location is the source?", "Address 21"],
    ["Example 2: which location is the destination?", "Register B"],
    ["Example 2: what is the source’s final value?", "4"],
    ["Example 2: what is the destination’s final value?", "4"],
  ];
  for (const [question, choice] of predictions) {
    await user.click(
      within(screen.getByRole("group", { name: question })).getByRole(
        "button",
        { name: choice },
      ),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  }

  const show = screen.getByRole("button", { name: "Show both copies" });
  const result = screen.getByTestId("fresh-copy-results");
  expect(show).toBeEnabled();
  expect(result).toHaveAttribute("hidden");
  show.focus();
  await user.click(show);
  expect(document.activeElement).toBe(show);
  expect(show).toHaveAttribute("aria-expanded", "true");
  expect(result).not.toHaveAttribute("hidden");
  expect(screen.getAllByRole("status")).toHaveLength(2);
  const first = screen.getByRole("group", { name: "Example 1 After" });
  expect(within(first).getByRole("group", { name: "Register B" })).toHaveTextContent("3");
  expect(within(first).getByRole("group", { name: "Register A" })).toHaveTextContent("3");
  const second = screen.getByRole("group", { name: "Example 2 After" });
  const secondExample = screen
    .getByRole("heading", { name: "Example 2" })
    .closest("section");
  expect(secondExample).not.toBeNull();
  expect(
    within(secondExample as HTMLElement).getByRole("heading", {
      level: 4,
      name: "Main memory",
    }),
  ).toBeVisible();
  expect(within(second).getByRole("group", { name: "Address 21" })).toHaveTextContent("4");
  expect(within(second).getByRole("group", { name: "Register B" })).toHaveTextContent("4");
  expect(
    within(screen.getByRole("group", { name: predictions[0][0] })).getByRole(
      "button",
      { name: predictions[0][1] },
    ),
  ).toHaveAttribute("aria-disabled", "true");
  await user.click(show);
  expect(document.activeElement).toBe(show);
  expect(show).toHaveAttribute("aria-expanded", "true");
});

test("language changes preserve an attempt while section re-entry and reset clear it", async () => {
  const user = userEvent.setup();
  const view = render(<CopyingValues language="en" />);
  await next(user);
  const spoken = screen.getByRole("button", { name: "I have made my prediction" });
  await user.click(spoken);
  await user.click(screen.getByRole("button", { name: "Show copy" }));

  view.rerender(<CopyingValues language="zh" />);
  expect(screen.getByRole("button", { name: "显示复制结果" })).toHaveAttribute(
    "aria-expanded",
    "true",
  );
  await user.click(screen.getByRole("button", { name: "上一小节" }));
  await user.click(screen.getByRole("button", { name: "2. 寄存器之间复制" }));
  expect(screen.getByRole("button", { name: "显示复制结果" })).toBeDisabled();

  await user.click(screen.getByRole("button", { name: "重新开始" }));
  expect(
    screen.getByRole("button", { name: "1. 来源与目标" }),
  ).toHaveAttribute("aria-current", "step");
  expect(screen.getByRole("heading", { name: "复制数值" })).toBeVisible();
});
