import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => window.history.replaceState({}, "", "/learn/fetch-cycle"));

const answer = async (name: string) => {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name }));
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
};

test("the eighth lesson is linked from home and starts before any computer event", () => {
  window.history.replaceState({}, "", "/");
  const home = render(<App />);
  expect(screen.getByRole("link", { name: /Explore the complete F-D-E cycle/ })).toHaveAttribute("href", "/learn/fetch-cycle");
  home.unmount();
  window.history.replaceState({}, "", "/learn/fetch-cycle");
  render(<App />);
  expect(screen.getByRole("heading", { name: "Putting fetch, decode and execute together" })).toBeVisible();
  expect(screen.getByText("This sentence explains what the teaching instruction means; it is not assembly or machine code.")).toBeVisible();
  expect(screen.getByRole("group", { name: "Main memory" })).toHaveTextContent("Add five to the value in ACC");
  expect(screen.getByText("ACC stores a value used in a calculation.")).toBeVisible();
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
  expect(screen.getByRole("button", { name: "Show next computer step" })).toBeDisabled();
});

test("predictions do not change state and fetch follows all four Cambridge RTN lines", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByLabelText("RTN fetch sequence")).toHaveTextContent("MAR ← [PC]");
  expect(screen.getByLabelText("RTN fetch sequence")).toHaveTextContent("PC ← [PC] + 1");
  expect(screen.getByLabelText("RTN fetch sequence")).toHaveTextContent("MDR ← [[MAR]]");
  expect(screen.getByLabelText("RTN fetch sequence")).toHaveTextContent("CIR ← [MDR]");
  expect(within(screen.getByRole("group", { name: "MAR" })).getByText("Not filled yet")).toBeVisible();

  await user.click(screen.getByRole("button", { name: "MAR becomes 20; PC stays 20" }));
  expect(within(screen.getByRole("group", { name: "MAR" })).getByText("Not filled yet")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  expect(within(screen.getByRole("group", { name: "MAR" })).getByText("20")).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("copies the address 20 from PC into MAR");

  await answer("PC becomes 21; MAR keeps 20");
  expect(within(screen.getByRole("group", { name: "PC" })).getByText("21")).toBeVisible();
  expect(within(screen.getByRole("group", { name: "MAR" })).getByText("20")).toBeVisible();

  await answer("Address bus carries 20, control bus carries READ, data bus returns the instruction to MDR");
  expect(screen.getByRole("group", { name: "MDR" })).toHaveTextContent("Add five to the value in ACC");
  expect(screen.getByRole("group", { name: "Bus activity" })).toHaveTextContent("READ");

  await answer("CIR receives the instruction from MDR");
  expect(screen.getByRole("group", { name: "CIR" })).toHaveTextContent("Add five to the value in ACC");
});

test("decode identifies the action and execute changes ACC using the ALU", async () => {
  const user = userEvent.setup();
  render(<App />);
  const choices = [
    "MAR becomes 20; PC stays 20", "PC becomes 21; MAR keeps 20",
    "Address bus carries 20, control bus carries READ, data bus returns the instruction to MDR",
    "CIR receives the instruction from MDR",
    "It works out that the instruction means add 5 to ACC; register values have not changed yet",
  ];
  for (const choice of choices) await answer(choice);
  expect(screen.getByRole("status")).toHaveTextContent("CU examines the instruction in CIR and decodes it");
  expect(within(screen.getByRole("group", { name: "ACC" })).getByText("7")).toBeVisible();
  await answer("The ALU calculates 7 + 5; ACC becomes 12");
  expect(within(screen.getByRole("group", { name: "ACC" })).getByText("12")).toBeVisible();
  expect(screen.getByRole("button", { name: "The instruction cycle is complete" })).toBeDisabled();
  expect(screen.getByRole("heading", { name: "The instruction cycle is complete" })).toBeVisible();
  expect(screen.getByText(/next instruction address/)).toBeVisible();
});

test("language switching preserves an unanswered prediction and the current processor state", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "MAR becomes 20; PC stays 20" }));
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("heading", { name: "PC 中保存着 20。处理器开始取这条指令时会发生什么？" })).toBeVisible();
  expect(screen.getByRole("button", { name: "MAR 变成 20；PC 仍是 20" })).toHaveAttribute("aria-pressed", "true");
  expect(within(screen.getByRole("group", { name: /^MAR$/ })).getByText("尚未填写")).toBeVisible();
});

test("exam guidance stays hidden until the learner attempts an answer and both languages work", async () => {
  const user = userEvent.setup();
  render(<App />);
  const choices = [
    "MAR becomes 20; PC stays 20", "PC becomes 21; MAR keeps 20",
    "Address bus carries 20, control bus carries READ, data bus returns the instruction to MDR",
    "CIR receives the instruction from MDR",
    "It works out that the instruction means add 5 to ACC; register values have not changed yet",
    "The ALU calculates 7 + 5; ACC becomes 12",
  ];
  for (const choice of choices) await answer(choice);
  expect(screen.queryByText("Mark points to look for")).not.toBeInTheDocument();
  await user.type(screen.getByRole("textbox", { name: "Your exam-style answer" }), "Fetch, decode, then execute.");
  await user.click(screen.getByRole("button", { name: "Show answer guidance" }));
  expect(screen.getByText("Mark points to look for")).toBeVisible();
  expect(screen.getAllByText(/MAR ← \[PC\]/).length).toBeGreaterThan(1);
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("heading", { name: "把取指、译码和执行连起来" })).toBeVisible();
  expect(screen.getByLabelText("RTN 取指顺序")).toHaveTextContent("MAR ← [PC]");
  expect(screen.getByRole("textbox", { name: "你的考试式答案" })).toHaveValue("Fetch, decode, then execute.");
  expect(screen.getByText("这是对教学指令含义的自然语言说明，不是汇编语言或机器码。")).toBeVisible();
  expect(screen.getByText("ACC 保存计算要用的数值。" )).toBeVisible();
  expect(screen.getByText("可以检查的评分要点" )).toBeVisible();
  await user.click(screen.getByRole("button", { name: "重新开始" }));
  expect(screen.getByRole("button", { name: "显示计算机下一步" })).toBeDisabled();
  expect(screen.queryByText("可以检查的评分要点")).not.toBeInTheDocument();
});
