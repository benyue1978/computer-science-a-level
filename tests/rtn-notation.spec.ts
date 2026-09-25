import { expect, test } from "@playwright/test";

test("home opens RTN lesson directly and switches all learner copy to Chinese", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Explore RTN notation" }).click();
  await expect(page).toHaveURL(/\/learn\/rtn-notation$/);
  await expect(page).toHaveTitle(/Reading processor notation/);
  await page.reload();
  await expect(page.getByLabel("RTN expression")).toContainText("MAR ← [PC]");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("读懂寄存器传送表示法");
  expect(errors).toEqual([]);
});

test("prediction is separate from executing each ordered RTN line", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/rtn-notation");
  await page.getByRole("button", { name: /04 Read two lines in order/ }).click();
  const event = page.getByRole("button", { name: "Show computer event" });
  await expect(event).toBeDisabled();
  const firstPrediction = page.getByRole("button", { name: "MAR=20; PC=20" });
  await firstPrediction.focus();
  await page.keyboard.press("Enter");
  await expect(event).toBeEnabled();
  await expect(page.locator(".rtn-state-columns")).toContainText("Not filled yet");
  await event.click();
  await expect(page.locator(".after-state")).toContainText("MAR20");
  await expect(page.locator(".after-state")).toContainText("PC20");
  await page.getByRole("button", { name: "21", exact: true }).click();
  await event.click();
  await expect(page.locator(".after-state")).toContainText("MAR20");
  await expect(page.locator(".after-state")).toContainText("PC21");
  await page.getByRole("button", { name: "32", exact: true }).click();
  await expect(page.getByText(/copies the current PC contents, 32, into MAR/)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("single and double brackets, increment and language persistence use independent examples", async ({ page }) => {
  await page.goto("/learn/rtn-notation");
  await page.getByRole("button", { name: /02 Look up a memory location/ }).click();
  await expect(page.getByLabel("RTN expression")).toContainText("MDR ← [[MAR]]");
  await page.getByRole("button", { name: "42", exact: true }).click();
  await page.getByRole("button", { name: "Show computer event" }).click();
  await expect(page.locator(".after-state")).toContainText("MDR42");
  await page.getByRole("button", { name: /03 Calculate a new register value/ }).click();
  await page.getByRole("button", { name: "21", exact: true }).click();
  await page.getByRole("button", { name: "Show computer event" }).click();
  await expect(page.locator(".after-state")).toContainText("PC21");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("读懂寄存器传送表示法");
  await expect(page.getByLabel("RTN 表达式")).toContainText("PC ← [PC] + 1");
  await page.getByRole("button", { name: "重新开始" }).click();
  await expect(page.getByLabel("RTN 表达式")).toContainText("MAR ← [PC]");
  await expect(page.getByRole("button", { name: "显示计算机事件" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
