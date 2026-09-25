import { expect, test } from "@playwright/test";

test("home invitation, direct lesson route and both languages work", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Explore the complete F-D-E cycle" }).click();
  await expect(page).toHaveURL(/\/learn\/fetch-cycle$/);
  await expect(page).toHaveTitle(/Putting fetch, decode and execute together/);
  await page.reload();
  await expect(page.getByLabel("RTN fetch sequence")).toContainText("CIR ← [MDR]");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("把取指、译码和执行连起来");
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("a prediction precedes each computer event and the full trace reaches ACC=12", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/fetch-cycle");
  const next = page.getByRole("button", { name: "Show next computer step" });
  await expect(next).toBeDisabled();
  const first = page.getByRole("button", { name: "MAR becomes 20; PC stays 20" });
  await first.focus();
  await page.keyboard.press("Enter");
  await expect(next).toBeEnabled();
  await expect(page.getByRole("group", { name: "MAR", exact: true })).toContainText("Not filled yet");
  await next.click();
  await expect(page.getByRole("group", { name: "MAR", exact: true })).toContainText("20");

  const predictions = [
    "PC becomes 21; MAR keeps 20",
    "Address bus carries 20, control bus carries READ, data bus returns the instruction to MDR",
    "CIR receives the instruction from MDR",
    "It works out that the instruction means add 5 to ACC; register values have not changed yet",
    "The ALU calculates 7 + 5; ACC becomes 12",
  ];
  for (const prediction of predictions) {
    await expect(next).toBeDisabled();
    await page.getByRole("button", { name: prediction }).click();
    await expect(next).toBeEnabled();
    await next.click();
  }
  await expect(page.getByRole("group", { name: "PC", exact: true })).toContainText("21");
  await expect(page.getByRole("group", { name: "MAR", exact: true })).toContainText("20");
  await expect(page.getByRole("group", { name: "MDR", exact: true })).toContainText("Add five to the value in ACC");
  await expect(page.getByRole("group", { name: "CIR", exact: true })).toContainText("Add five to the value in ACC");
  await expect(page.getByRole("group", { name: "ACC", exact: true })).toContainText("12");
  await expect(page.getByRole("heading", { name: "The instruction cycle is complete" })).toBeVisible();
  await expect(page.getByText(/A clock cycle and an instruction cycle/).first()).toBeVisible();

  const exam = page.getByRole("textbox", { name: "Your exam-style answer" });
  await exam.fill("Fetch, decode, execute; the PC address is copied and read from memory.");
  await page.getByRole("button", { name: "Show answer guidance" }).click();
  await expect(page.getByText("Mark points to look for")).toBeVisible();
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "你的考试式答案" })).toHaveValue("Fetch, decode, execute; the PC address is copied and read from memory.");
  await expect(page.getByText("可以检查的评分要点")).toBeVisible();
  await page.getByRole("button", { name: "重新开始" }).click();
  await expect(page.getByRole("button", { name: "显示计算机下一步" })).toBeDisabled();
  await expect(page.getByText("可以检查的评分要点")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
