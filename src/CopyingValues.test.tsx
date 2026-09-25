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
