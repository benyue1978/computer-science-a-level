import { expect, test } from "@playwright/test";

test("home opens the instruction-cycle lesson directly and explains the clock separately", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Explore the instruction cycle" }).click();
  await expect(page).toHaveURL(/\/learn\/instruction-cycle$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The instruction cycle");
  await page.reload();
  await expect(page).toHaveTitle(/The instruction cycle/);
  await expect(page.getByRole("img", { name: "A visual showing regular clock timing pulses" })).toBeVisible();
  await expect(page.getByText(/A clock tick is one timing signal, not a whole instruction cycle/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("prediction stays distinct as the processor repeats fetch, decode and execute", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/instruction-cycle");
  const next = page.getByRole("button", { name: "Show next computer step" });
  await expect(next).toBeDisabled();
  const prediction = page.getByRole("button", { name: "Fetch the next instruction" });
  await prediction.focus();
  await page.keyboard.press("Enter");
  await expect(next).toBeEnabled();
  await expect(page.locator(".cycle-event")).toContainText("follow the full sequence from the beginning");
  const events = ["fetches “Display Hello”", "decodes “Display Hello”", "executes “Display Hello”", "fetches “Display Goodbye”", "decodes “Display Goodbye”", "executes “Display Goodbye”"];
  for (const event of events) {
    await next.click();
    await expect(page.locator(".cycle-event")).toContainText(event);
  }
  await expect(page.getByRole("button", { name: "Both instructions are complete" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Chinese switch keeps the current stage and reset returns to the opening state", async ({ page }) => {
  await page.goto("/learn/instruction-cycle");
  await page.getByRole("button", { name: "Fetch the next instruction" }).click();
  await page.getByRole("button", { name: "Show next computer step" }).click();
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("指令周期");
  await expect(page.locator(".cycle-event")).toContainText("处理器正在取出“显示 Hello”这条指令。");
  await expect(page.getByRole("listitem", { name: "取指 Fetch" })).toHaveAttribute("aria-current", "step");
  await page.getByRole("button", { name: "重新开始" }).click();
  await expect(page.getByRole("button", { name: "显示计算机下一步" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
