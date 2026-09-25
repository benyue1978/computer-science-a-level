import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
const next = async (user: ReturnType<typeof userEvent.setup>, count = 1) => {
  for (let i = 0; i < count; i++)
    await user.click(screen.getByRole("button", { name: "Next section" }));
};
beforeEach(() => window.history.replaceState({}, "", "/learn/memory"));
test("introduces one cell progressively before showing the full example", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.queryByText("10", { exact: true })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reveal address" }));
  expect(screen.getByText("10", { exact: true })).toBeVisible();
  expect(screen.queryByText("7", { exact: true })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Reveal contents" }));
  expect(screen.getByText("7", { exact: true })).toBeVisible();
  await next(user);
  expect(
    screen.getByRole("button", { name: "Address 11, contents 42" }),
  ).toBeVisible();
});
test("requires a prediction before reading; reading leaves memory unchanged", async () => {
  const user = userEvent.setup();
  render(<App />);
  await next(user, 2);
  expect(screen.queryByLabelText("Value read")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Show reading" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "11" }));
  await user.click(screen.getByRole("button", { name: "Show reading" }));
  expect(screen.getByLabelText("Value read")).toHaveTextContent("42");
  expect(
    screen.getByRole("button", { name: "Address 11, contents 42" }),
  ).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent(
    "the other stored values are unchanged",
  );
  await next(user);
  expect(
    screen.getByRole("heading", { name: "Where is 7 stored?" }),
  ).toBeVisible();
});
test("supports spoken predictions, writes only contents, preserves state on language changes, and resets", async () => {
  const user = userEvent.setup();
  render(<App />);
  await next(user, 4);
  expect(screen.getByRole("button", { name: "Show writing" })).toBeDisabled();
  await user.click(
    screen.getByRole("button", { name: "I have made my prediction" }),
  );
  await user.click(screen.getByRole("button", { name: "Show writing" }));
  expect(
    screen.getByRole("button", { name: "Address 11, contents 6" }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("button", { name: "Address 10, contents 7" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(
    screen.getByRole("button", { name: "地址 11，内容 6" }),
  ).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "重新开始" }));
  expect(
    screen.getByRole("heading", { name: "一个位置，两个概念。" }),
  ).toBeVisible();
  await user.click(screen.getByRole("button", { name: "下一小节" }));
  expect(
    screen.getByRole("button", { name: "地址 11，内容 42" }),
  ).toHaveAttribute("aria-pressed", "false");
});
test("new example checks content, address, and duplicate values without gating navigation", async () => {
  const user = userEvent.setup();
  render(<App />);
  await next(user, 5);
  expect(
    screen.getByRole("button", { name: "Address 20, contents 8" }),
  ).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Address 22, contents 8" }),
  ).toBeVisible();
  await user.click(
    within(screen.getAllByRole("group")[0]).getByRole("button", { name: "3" }),
  );
  await user.click(
    within(screen.getAllByRole("group")[1]).getByRole("button", { name: "21" }),
  );
  await user.click(screen.getByRole("button", { name: "Yes — 20 and 22" }));
  expect(screen.getAllByRole("status")).toHaveLength(3);
  await user.click(screen.getByRole("button", { name: "Previous section" }));
  expect(
    screen.getByRole("button", { name: "Address 11, contents 42" }),
  ).toBeVisible();
});
test("has a single available lesson and recovers unknown paths", () => {
  window.history.replaceState({}, "", "/");
  const view = render(<App />);
  expect(screen.getByRole("link", { name: /Explore memory/ })).toHaveAttribute(
    "href",
    "/learn/memory",
  );
  view.unmount();
  window.history.replaceState({}, "", "/missing");
  render(<App />);
  expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute(
    "href",
    "/",
  );
});
test("revisiting the first example restores 42 and clears prior read and write attempts", async () => {
  const user = userEvent.setup();
  render(<App />);
  await next(user, 4);
  await user.click(
    screen.getByRole("button", { name: "I have made my prediction" }),
  );
  await user.click(screen.getByRole("button", { name: "Show writing" }));
  await user.click(screen.getByRole("button", { name: "Previous section" }));
  await user.click(screen.getByRole("button", { name: "Previous section" }));
  expect(
    screen.getByRole("button", { name: "Address 11, contents 42" }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Show reading" })).toBeDisabled();
  expect(screen.queryByLabelText("Value read")).not.toBeInTheDocument();
  await next(user, 2);
  expect(screen.getByRole("button", { name: "Show writing" })).toBeDisabled();
});

test("fresh-example explanations wait for every prediction", async () => {
  const user = userEvent.setup();
  render(<App />);
  await next(user, 5);
  await user.click(
    within(screen.getAllByRole("group")[0]).getByRole("button", { name: "3" }),
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await user.click(
    within(screen.getAllByRole("group")[1]).getByRole("button", { name: "21" }),
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Yes — 20 and 22" }));
  expect(screen.getAllByRole("status")).toHaveLength(3);
});

test("step navigation retains descriptive names in both languages", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(
    screen.getByRole("button", { name: "1. Meet a location" }),
  ).toHaveAttribute("aria-current", "step");
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("button", { name: "1. 认识位置" })).toHaveAttribute(
    "aria-current",
    "step",
  );
});
