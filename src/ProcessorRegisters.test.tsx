import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() =>
  window.history.replaceState({}, "", "/learn/processor-registers"),
);
const next = async (user: ReturnType<typeof userEvent.setup>, count = 1) => {
  for (let i = 0; i < count; i++)
    await user.click(screen.getByRole("button", { name: "Next section" }));
};
test("offers both real lessons on home", () => {
  window.history.replaceState({}, "", "/");
  render(<App />);
  expect(
    screen.getByRole("link", { name: /Explore processors/ }),
  ).toHaveAttribute("href", "/learn/processor-registers");
});
test("recall is optional and incorrect recall offers memory without gating", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    within(screen.getByRole("group", { name: /Optional recall/ })).getByRole(
      "button",
      { name: "11" },
    ),
  );
  expect(screen.getByRole("link", { name: "Revisit memory" })).toHaveAttribute(
    "href",
    "/learn/memory",
  );
  await next(user);
  expect(
    screen.getByRole("button", { name: "Look inside the processor" }),
  ).toBeVisible();
});
test("diagram encloses registers only after explicit disclosure and language preserves it", async () => {
  const user = userEvent.setup();
  render(<App />);
  await next(user);
  expect(
    screen.queryByRole("group", { name: "Register A" }),
  ).not.toBeInTheDocument();
  const disclosure = screen.getByRole("button", {
    name: "Look inside the processor",
  });
  expect(disclosure).toHaveAttribute("aria-expanded", "false");
  await user.click(disclosure);
  expect(disclosure).toHaveAttribute("aria-expanded", "true");
  const cpu = screen.getByRole("group", { name: "Processor" });
  expect(within(cpu).getByRole("group", { name: "Register A" })).toBeVisible();
  expect(
    within(cpu).queryByRole("group", { name: "Main memory" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("button", { name: "Inside the processor" }),
  );
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("button", { name: "处理器内部" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.getByRole("group", { name: "寄存器 A" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "重新开始" }));
  expect(
    screen.getByRole("button", { name: "1. 两个组成部分" }),
  ).toHaveAttribute("aria-current", "step");
  await user.click(screen.getByRole("button", { name: "下一小节" }));
  expect(
    screen.queryByRole("group", { name: "寄存器 A" }),
  ).not.toBeInTheDocument();
});
test("component feedback waits for both identifications", async () => {
  const user = userEvent.setup();
  render(<App />);
  const mainMemory = screen.getByRole("group", {
    name: /^Main memory$/,
  });
  expect(mainMemory).toHaveTextContent("Address 12");
  expect(mainMemory).toHaveTextContent("9");
  await user.click(
    within(
      screen.getByRole("group", {
        name: "Which component carries out instructions?",
      }),
    ).getByRole("button", { name: "Processor" }),
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await user.click(
    within(
      screen.getByRole("group", { name: "Which component is main memory?" }),
    ).getByRole("button", { name: "Main memory" }),
  );
  expect(screen.getAllByRole("status")).toHaveLength(2);
});
test("register contents stay preset and fresh feedback waits for all answers", async () => {
  const user = userEvent.setup();
  render(<App />);
  await next(user, 2);
  expect(screen.getByRole("group", { name: "Register A" })).toHaveTextContent(
    "7",
  );
  await user.click(
    within(
      screen.getByRole("group", {
        name: "What are the contents of Register A?",
      }),
    ).getByRole("button", { name: "7" }),
  );
  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  await user.click(
    within(
      screen.getByRole("group", {
        name: "Which storage location is inside the processor?",
      }),
    ).getByRole("button", { name: "Register A" }),
  );
  expect(screen.getAllByRole("status")).toHaveLength(2);
  await next(user);
  expect(screen.getByRole("group", { name: "Register A" })).toHaveTextContent(
    "9",
  );
  expect(screen.getByRole("group", { name: "Register B" })).toHaveTextContent(
    "3",
  );
  const questions = [
    "Which shown location is a register?",
    "Where is that register?",
    "What does the processor do?",
    "What does main memory do?",
  ];
  const answers = [
    "Register B",
    "Inside the processor",
    "Carries out instructions",
    "Stores data and instructions",
  ];
  for (let i = 0; i < questions.length; i++) {
    await user.click(
      within(screen.getByRole("group", { name: questions[i] })).getByRole(
        "button",
        { name: answers[i] },
      ),
    );
    if (i < questions.length - 1)
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
  }
  expect(screen.getAllByRole("status")).toHaveLength(4);
});
