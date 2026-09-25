import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => window.history.replaceState({}, "", "/learn/rtn-notation"));

const expectLatestRegisterValue = (name: string, value: string) => {
  const registers = screen.getAllByRole("group", { name });
  expect(within(registers[registers.length - 1]).getByText(value)).toBeVisible();
};

test("the copy expression reads the right side and changes only the destination", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole("heading", { name: "Reading processor notation" })).toBeVisible();
  expect(screen.getByLabelText("RTN expression")).toHaveTextContent("MAR ← [PC]");
  expectLatestRegisterValue("PC", "20");
  expectLatestRegisterValue("MAR", "Not filled yet");
  const run = screen.getByRole("button", { name: "Show computer event" });
  expect(run).toBeDisabled();
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
  await user.click(screen.getByRole("button", { name: "20" }));
  expectLatestRegisterValue("MAR", "Not filled yet");
  await user.click(run);
  expectLatestRegisterValue("PC", "20");
  expectLatestRegisterValue("MAR", "20");
  expect(screen.getByText(/The computer copies the contents of PC into MAR/)).toBeVisible();
});

test("double brackets look up memory contents using the address held in MAR", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: /02 Look up a memory location/ }));
  expect(screen.getByLabelText("RTN expression")).toHaveTextContent("MDR ← [[MAR]]");
  expectLatestRegisterValue("MAR", "17");
  expect(within(screen.getByRole("group", { name: "Memory location 17" })).getByText("42")).toBeVisible();
  expectLatestRegisterValue("MDR", "Not filled yet");
  await user.click(screen.getByRole("button", { name: "42" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  expectLatestRegisterValue("MDR", "42");
  expectLatestRegisterValue("MAR", "17");
  expect(within(screen.getByRole("group", { name: "Memory location 17" })).getByText("42")).toBeVisible();
});

test("PC increment updates only PC and describes the next instruction address", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: /03 Calculate a new register value/ }));
  expect(screen.getByLabelText("RTN expression")).toHaveTextContent("PC ← [PC] + 1");
  await user.click(screen.getByRole("button", { name: "21" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  expectLatestRegisterValue("PC", "21");
  expect(screen.getAllByText(/next instruction address/)[0]).toBeVisible();
  expect(screen.queryByText(/byte|word|PL24|24-bit/i)).not.toBeInTheDocument();
});

test("ordered lines use the old PC for MAR before the next line increments PC", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "20" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  await user.click(screen.getByRole("button", { name: "Next RTN example" }));
  await user.click(screen.getByRole("button", { name: "42" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  await user.click(screen.getByRole("button", { name: "Next RTN example" }));
  await user.click(screen.getByRole("button", { name: "21" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  await user.click(screen.getByRole("button", { name: "Next RTN example" }));
  expect(screen.getByLabelText("RTN expression")).toHaveTextContent("MAR ← [PC]");
  expect(screen.getByLabelText("RTN expression")).toHaveTextContent("PC ← [PC] + 1");
  await user.click(screen.getByRole("button", { name: "MAR=20; PC=20" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  expectLatestRegisterValue("MAR", "20");
  expectLatestRegisterValue("PC", "20");
  await user.click(screen.getByRole("button", { name: "21" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  expectLatestRegisterValue("MAR", "20");
  expectLatestRegisterValue("PC", "21");
  expect(screen.getByRole("button", { name: "All RTN examples complete" })).toBeDisabled();
});

test("language changes preserve the current example and reset clears its prediction", async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole("button", { name: "20" }));
  await user.click(screen.getByRole("button", { name: "Show computer event" }));
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByLabelText("RTN 表达式")).toHaveTextContent("MAR ← [PC]");
  expectLatestRegisterValue("MAR", "20");
  expect(screen.getByRole("button", { name: "下一个 RTN 示例" })).toBeEnabled();
  await user.click(screen.getByRole("button", { name: "重新开始" }));
  expectLatestRegisterValue("MAR", "尚未填写");
  expect(screen.getByRole("button", { name: "显示计算机事件" })).toBeDisabled();
});

test("route is listed on the home page and localized page title follows language", async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, "", "/");
  const home = render(<App />);
  expect(screen.getByRole("link", { name: /Explore RTN notation/ })).toHaveAttribute("href", "/learn/rtn-notation");
  home.unmount();
  window.history.replaceState({}, "", "/learn/rtn-notation");
  render(<App />);
  expect(screen.getByRole("heading", { name: "Reading processor notation" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("heading", { name: "读懂寄存器传送表示法" })).toBeVisible();
  expect(document.title).toContain("读懂寄存器传送表示法");
});
