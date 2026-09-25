import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

beforeEach(() => window.history.replaceState({}, "", "/learn/buses-and-control"));

test("shows the bus system and explains the three roles in both languages", async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByRole("heading", { name: "Buses and control" })).toBeVisible();
  expect(screen.getAllByText("Address bus").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Data bus").length).toBeGreaterThan(0);
  expect(screen.getAllByText("Control bus").length).toBeGreaterThan(0);
  expect(screen.getByText("System bus")).toBeVisible();
  expect(screen.getByText("I/O ports")).toBeVisible();
  expect(screen.getAllByText(/where/i).length).toBeGreaterThan(0);
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("heading", { name: "总线与控制" })).toBeVisible();
  expect(screen.getAllByText("地址总线").length).toBeGreaterThan(0);
  expect(screen.getAllByText("数据总线").length).toBeGreaterThan(0);
  expect(screen.getAllByText("控制总线").length).toBeGreaterThan(0);
});

test("read events arrive in order and update the receiver without changing memory", async () => {
  const user = userEvent.setup();
  render(<App />);

  expect(screen.getByText("Memory[11] = 42")).toBeVisible();
  expect(screen.getByText("Receiver = 7")).toBeVisible();
  const nextEvent = screen.getByRole("button", { name: "Show next transfer" });
  expect(nextEvent).toBeDisabled();
  await user.click(screen.getByRole("button", { name: "42 arrives; memory stays the same" }));
  await user.click(nextEvent);
  expect(screen.getByRole("status")).toHaveTextContent("address bus");
  expect(screen.getByLabelText("Address bus lane")).toHaveAttribute("aria-current", "step");
  await user.click(nextEvent);
  expect(screen.getByRole("status")).toHaveTextContent("READ");
  await user.click(nextEvent);
  expect(screen.getByRole("status")).toHaveTextContent("data bus");
  await user.click(nextEvent);
  expect(screen.getByText("Receiver = 42")).toBeVisible();
  expect(screen.getByText("Memory[11] = 42")).toBeVisible();
});

test("bus matching answers stay hidden until the learner chooses to reveal them", async () => {
  const user = userEvent.setup();
  render(<App />);
  const check = screen.getByRole("region", { name: "Match each question to a bus." });
  expect(within(check).queryByText("Address bus", { exact: true })).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Show matches" }));
  expect(within(check).getByText("Address bus", { exact: true })).toBeVisible();
  expect(screen.getByRole("button", { name: "Hide matches" })).toBeVisible();
});

test("predictions do not run the computer and write changes only the selected contents", async () => {
  const user = userEvent.setup();
  render(<App />);

  await user.click(screen.getByRole("button", { name: "Write" }));
  expect(screen.getByText("Memory[12] = 9")).toBeVisible();
  expect(screen.getByText("CPU value = 6")).toBeVisible();
  await user.click(screen.getByRole("button", { name: /Memory contents at address 12 change/i }));
  expect(screen.getByRole("button", { name: "Show next transfer" })).toHaveTextContent("Show next transfer");
  expect(screen.getByText("Memory[12] = 9")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Show next transfer" }));
  await user.click(screen.getByRole("button", { name: "Show next transfer" }));
  await user.click(screen.getByRole("button", { name: "Show next transfer" }));
  await user.click(screen.getByRole("button", { name: "Show next transfer" }));
  expect(screen.getByText("Memory[12] = 6")).toBeVisible();
  expect(screen.getByRole("status")).toHaveTextContent("other locations stay the same");
});

test("home links to the fourth lesson and language changes preserve the event position", async () => {
  const user = userEvent.setup();
  window.history.replaceState({}, "", "/");
  const home = render(<App />);
  expect(screen.getByRole("link", { name: /Explore buses and control/ })).toHaveAttribute(
    "href",
    "/learn/buses-and-control",
  );
  home.unmount();

  window.history.replaceState({}, "", "/learn/buses-and-control");
  render(<App />);
  await user.click(screen.getByRole("button", { name: "42 arrives; memory stays the same" }));
  await user.click(screen.getByRole("button", { name: "Show next transfer" }));
  await user.click(screen.getByRole("button", { name: "中文" }));
  expect(screen.getByRole("status")).toHaveTextContent("地址总线");
  expect(screen.getByRole("heading", { name: "总线与控制" })).toBeVisible();
  expect(within(screen.getByRole("main")).getByText(/内存\[11\]/)).toBeVisible();
});
