import { expect, test } from "@playwright/test";

test("home exposes three lessons and the copying route survives reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator('a[href="/learn/memory"]').first()).toBeVisible();
  await expect(page.locator('a[href="/learn/processor-registers"]').first()).toBeVisible();
  await page.locator('a[href="/learn/copying-values"]').first().click();
  await expect(page).toHaveURL(/\/learn\/copying-values$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Copying values");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Copying values");
  await expect(page).toHaveTitle(/Copying values/);
  expect(errors).toEqual([]);
});

test("keyboard copy controls preserve both register and memory sources", async ({ page }) => {
  await page.goto("/learn/copying-values");
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Copy from A to B." })).toBeFocused();

  await page.getByRole("group", { name: "What will Register A contain after the copy?" }).getByRole("button", { name: "7" }).click();
  const lockedChoice = page.getByRole("group", { name: "What will Register B contain after the copy?" }).getByRole("button", { name: "7" });
  await lockedChoice.click();
  const showRegister = page.getByRole("button", { name: "Show copy" });
  await showRegister.focus();
  await page.keyboard.press("Enter");
  await expect(showRegister).toBeFocused();
  await expect(showRegister).toHaveAttribute("aria-expanded", "true");
  await expect(lockedChoice).toHaveAttribute("aria-disabled", "true");
  const registerAfter = page.getByRole("group", { name: "After" });
  await expect(registerAfter.getByRole("group", { name: "Register A" })).toContainText("7");
  await expect(registerAfter.getByRole("group", { name: "Register B" })).toContainText("7");
  await page.keyboard.press("Enter");
  await expect(showRegister).toBeFocused();

  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await page.getByRole("group", { name: "What will address 11 contain after the copy?" }).getByRole("button", { name: "42" }).click();
  await page.getByRole("group", { name: "What will Register A contain after the copy?" }).getByRole("button", { name: "42" }).click();
  const showMemory = page.getByRole("button", { name: "Show copy" });
  await showMemory.click();
  const memoryAfter = page.getByRole("group", { name: "After" });
  await expect(memoryAfter.getByRole("group", { name: "Address 10" })).toContainText("7");
  await expect(memoryAfter.getByRole("group", { name: "Address 11" })).toContainText("42");
  await expect(memoryAfter.getByRole("group", { name: "Address 12" })).toContainText("9");
  await expect(memoryAfter.getByRole("group", { name: "Register A" })).toContainText("42");
});

test("all fresh predictions precede feedback and language and reset preserve their contracts", async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/copying-values");
  await page.getByRole("button", { name: "4. Apply the rule" }).click();
  const predictions: [string, string][] = [
    ["Example 1: which location is the source?", "Register B"],
    ["Example 1: which location is the destination?", "Register A"],
    ["Example 1: what is the source’s final value?", "3"],
    ["Example 1: what is the destination’s final value?", "3"],
    ["Example 2: which location is the source?", "Address 21"],
    ["Example 2: which location is the destination?", "Register B"],
    ["Example 2: what is the source’s final value?", "4"],
    ["Example 2: what is the destination’s final value?", "4"],
  ];
  for (const [index, [question, answer]] of predictions.entries()) {
    await page.getByRole("group", { name: question }).getByRole("button", { name: answer, exact: true }).click();
    if (index < 7) await expect(page.getByRole("status")).toHaveCount(0);
  }
  await expect(page.getByRole("status")).toHaveCount(2);
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("button", { name: "4. 应用同一规则" })).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("status")).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("copying-fresh-zh.png"), fullPage: true });
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await expect(page.getByRole("button", { name: "1. 来源与目标" })).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("heading", { name: "复制数值" })).toBeVisible();
});
