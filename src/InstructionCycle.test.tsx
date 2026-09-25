import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => window.history.replaceState({}, "", "/learn/instruction-cycle"));

test("introduces instructions and the three ordered stages without prior jargon", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "The instruction cycle" })).toBeVisible();
  const cycle = screen.getByRole("region", { name: "The repeating instruction cycle" });
  const stages = within(cycle).getAllByRole("listitem");
  expect(stages.map((stage) => stage.querySelector("strong")?.textContent)).toEqual(["Fetch", "Decode", "Execute"]);
  expect(screen.getByText(/instruction is a direction/i)).toBeVisible();
  expect(screen.getByText("Together, these three stages are called the instruction cycle.")).toBeVisible();
  expect(screen.getByText("Display “Hello”")).toBeVisible();
  expect(screen.getByText("Display “Goodbye”")).toBeVisible();
  expect(screen.getByText("One clock cycle", { exact: true })).toBeVisible();
  expect(screen.getByText(/coordinates one very small processor action/i)).toBeVisible();
  expect(screen.getByText(/puts an address onto the address bus/i)).toBeVisible();
  expect(screen.getByText(/In our step-by-step model, we can zoom in and see several small actions/)).toBeVisible();
  expect(screen.queryByText(/PC|MAR|MDR|CIR|RTN/)).not.toBeInTheDocument();
});

test("learner prediction is separate from the computer's repeated event sequence", async () => {
  const user = userEvent.setup();
  render(<App />);
  const computerEvent = screen.getByRole("status");
  const initialEvent = computerEvent.textContent;
  expect(initialEvent).toContain("full sequence from the beginning");
  const next = screen.getByRole("button", { name: "Show next computer step" });
  expect(next).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "Fetch the next instruction" }));
  expect(computerEvent).toHaveTextContent(initialEvent!);
  expect(next).toBeEnabled();
  const expected = [
    "The processor fetches “Display Hello”.",
    "The processor decodes “Display Hello”.",
    "The processor executes “Display Hello”.",
    "The processor fetches “Display Goodbye”.",
    "The processor decodes “Display Goodbye”.",
    "The processor executes “Display Goodbye”.",
  ];
  for (const event of expected) {
    await user.click(next);
    expect(computerEvent).toHaveTextContent(event);
  }
  expect(next).toBeDisabled();
});

test("clock explanation is distinct, and reset and language changes preserve the right state", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole("img", { name: "A visual showing one clock cycle as a regular timing beat" })).toBeVisible();
  expect(screen.getByText(/system clock sends regular timing signals/i)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Fetch the next instruction" }));
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("heading", { name: "指令周期" })).toBeVisible();
  expect(screen.getByText("一个时钟周期", { exact: true })).toBeVisible();
  expect(screen.getByText(/一个时钟周期协调处理器完成一个很小的动作/)).toBeVisible();
  expect(screen.getByText(/把一个地址放到地址总线上/)).toBeVisible();
  expect(screen.getByText(/在这里的逐步模型中，我们可以放大观察它的好几个小动作/)).toBeVisible();
  expect(document.querySelector(".cycle-event")).toHaveTextContent("处理器正在取出“显示 Hello”这条指令。");
  expect(screen.getByRole("listitem", { name: /取指/ })).toHaveAttribute("aria-current", "step");
  await user.click(screen.getByRole("button", { name: "重新开始" }));
  expect(screen.getByRole("button", { name: "显示计算机下一步" })).toBeDisabled();
});

test("home links to the fifth lesson and the direct route sets its localized title", async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, "", "/");
  const home = render(<App />);
  const link = screen.getByRole("link", { name: /Explore the instruction cycle/ });
  expect(link).toHaveAttribute("href", "/learn/instruction-cycle");
  expect(link).toBeVisible();
  home.unmount();
  window.history.replaceState({}, "", "/learn/instruction-cycle");
  render(<App />);
  expect(screen.getByRole("heading", { name: "The instruction cycle" })).toBeVisible();
  expect(document.title).toContain("The instruction cycle");
});
