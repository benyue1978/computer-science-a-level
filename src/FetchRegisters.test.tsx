import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => window.history.replaceState({}, "", "/learn/fetch-registers"));

test("introduces the four fetch registers with distinct jobs and a readable stand-in", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "Four registers, four jobs" })).toBeVisible();
  expect(screen.getByText("Program Counter (PC)")).toBeVisible();
  expect(screen.getByText("Memory Address Register (MAR)")).toBeVisible();
  expect(screen.getByText("Memory Data Register (MDR)")).toBeVisible();
  expect(screen.getByText("Current Instruction Register (CIR)")).toBeVisible();
  expect(screen.getByText(/address of the next instruction to be fetched/i)).toBeVisible();
  expect(screen.getByText(/memory location currently being accessed/i)).toBeVisible();
  expect(screen.getByText(/data or an instruction transferred between memory and the processor/i)).toBeVisible();
  expect(screen.getByText(/current instruction while it is decoded and executed/i)).toBeVisible();
  expect(screen.getByRole("region", { name: "Processor" })).toContainElement(screen.getByLabelText("Program Counter (PC)"));
  expect(screen.getByRole("region", { name: "Main memory" })).toHaveTextContent("Display “Hello”");
  expect(screen.getByText(/readable stand-in, not machine code/i)).toBeVisible();
  expect(screen.getByText(/stops when the instruction reaches CIR/)).toBeVisible();
  expect(screen.queryByText(/PC\s*\+\s*1|RTN|[01]{8,}|LOAD\s/i)).not.toBeInTheDocument();
});

test("prediction is separate from the computer, then reveals four ordered fetch-register events", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByLabelText("Program Counter (PC)")).toHaveTextContent("20");
  expect(screen.getByLabelText("Memory Address Register (MAR)")).toHaveTextContent("Not filled yet");
  expect(screen.getByRole("button", { name: "Show next computer step" })).toBeDisabled();
  await user.click(screen.getByRole("button", { name: /MAR/ }));
  expect(screen.getByLabelText("Program Counter (PC)")).toHaveTextContent("20");
  expect(screen.getByLabelText("Memory Address Register (MAR)")).toHaveTextContent("Not filled yet");
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  expect(screen.getByLabelText("Memory Address Register (MAR)")).toHaveTextContent("20");
  expect(screen.getByText(/The computer copies 20 from PC into MAR/)).toBeVisible();
  expect(screen.getByText(/PC → MAR/)).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  expect(screen.getByLabelText("Program Counter (PC)")).toHaveTextContent("20");
  expect(screen.getByLabelText("Address bus")).toHaveTextContent("20");
  expect(screen.getByLabelText("Control bus")).toHaveTextContent("READ");
  expect(screen.getByLabelText("Data bus")).toHaveTextContent("Idle");
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  expect(screen.getByLabelText("Memory Data Register (MDR)")).toHaveTextContent("Display “Hello”");
  expect(screen.getByLabelText("Data bus")).toHaveTextContent("Display “Hello”");
  expect(screen.getByLabelText("Memory Address Register (MAR)")).toHaveTextContent("20");
  expect(screen.getByLabelText("Current Instruction Register (CIR)")).toHaveTextContent("Not filled yet");
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  expect(screen.getByLabelText("Current Instruction Register (CIR)")).toHaveTextContent("Display “Hello”");
  expect(screen.getByLabelText("Memory Data Register (MDR)")).toHaveTextContent("Display “Hello”");
  expect(screen.getByText(/MDR → CIR/)).toBeVisible();
  expect(screen.getByRole("button", { name: "All steps shown" })).toBeDisabled();
  expect(screen.getByRole("heading", { name: "Check what travelled" })).toBeVisible();
  await user.click(screen.getAllByRole("button", { name: /^Address bus$/ })[0]);
  expect(screen.getByText(/The address bus carries the memory location/)).toBeVisible();
});

test("language changes preserve relay and prediction while reset clears both", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: /MAR/ }));
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByLabelText("存储器地址寄存器 MAR")).toHaveTextContent("20");
  expect(screen.getByLabelText("地址总线")).toHaveTextContent("20");
  await user.click(screen.getByRole("button", { name: "重新开始" }));
  expect(screen.getByLabelText("存储器地址寄存器 MAR")).toHaveTextContent("尚未填写");
  expect(screen.getByLabelText("地址总线")).toHaveTextContent("空闲");
});

test("Chinese names are complete and a review answer survives the language switch", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByText("程序计数器 PC")).toBeVisible();
  expect(screen.getByText("存储器地址寄存器 MAR")).toBeVisible();
  expect(screen.getByText("存储器数据寄存器 MDR")).toBeVisible();
  expect(screen.getByText("当前指令寄存器 CIR")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "PC" }));
  await user.click(screen.getByRole("button", { name: "显示计算机下一步" }));
  await user.click(screen.getByRole("button", { name: "显示计算机下一步" }));
  await user.click(screen.getByRole("button", { name: "显示计算机下一步" }));
  await user.click(screen.getByRole("button", { name: "显示计算机下一步" }));
  await user.click(screen.getAllByRole("button", { name: /^地址总线$/ })[0]);
  await user.click(screen.getByRole("button", { name: "English" }));
  expect(screen.getAllByRole("button", { name: /^Address bus$/ })[0]).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByText(/The address bus carries the memory location/)).toBeVisible();
});

test("topology names processor, memory, each bus and the internal-transfer distinction", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole("region", { name: "Processor" })).toBeVisible();
  expect(screen.getByRole("region", { name: "Main memory" })).toBeVisible();
  expect(screen.getByLabelText("Address bus")).toBeVisible();
  expect(screen.getByLabelText("Data bus")).toBeVisible();
  expect(screen.getByLabelText("Control bus")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "PC" }));
  await user.click(screen.getByRole("button", { name: "Show next computer step" }));
  expect(screen.getAllByText(/inside the processor; it does not travel along a system bus/i)[0]).toBeVisible();
});
