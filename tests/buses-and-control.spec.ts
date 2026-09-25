import { expect, test } from "@playwright/test";

test("home opens the buses lesson with a stable direct route", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Explore buses and control" }).click();
  await expect(page).toHaveURL(/\/learn\/buses-and-control$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Buses and control");
  await page.reload();
  await expect(page).toHaveTitle(/Buses and control/);
  expect(errors).toEqual([]);
});

test("read and write walkthroughs distinguish learner predictions from computer transfers", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/buses-and-control");
  const readPrediction = page.getByRole("button", { name: "42 arrives; memory stays the same" });
  await readPrediction.focus();
  await page.keyboard.press("Enter");
  const step = page.getByRole("button", { name: "Show next transfer" });
  await expect(step).toBeEnabled();
  await step.click();
  await expect(page.getByRole("status")).toContainText("address bus");
  await step.click();
  await expect(page.getByRole("status")).toContainText("READ");
  await step.click();
  await expect(page.getByRole("status")).toContainText("data bus");
  await step.click();
  await expect(page.getByText("Receiver = 42")).toBeVisible();
  await expect(page.getByText("Memory[11] = 42")).toBeVisible();

  await page.getByRole("button", { name: "Write", exact: true }).click();
  await page.getByRole("button", { name: "Memory contents at address 12 change" }).click();
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Show next transfer" }).click();
  }
  await expect(page.getByText("Memory[12] = 6")).toBeVisible();
  await expect(page.locator(".event-output")).toContainText("other locations stay the same");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("Chinese switch keeps the current transfer stage", async ({ page }) => {
  await page.goto("/learn/buses-and-control");
  await page.getByRole("button", { name: "42 arrives; memory stays the same" }).click();
  await page.getByRole("button", { name: "Show next transfer" }).click();
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("总线与控制");
  await expect(page.locator(".event-output")).toContainText("地址总线");
  await expect(page.getByText("内存[11] = 42")).toBeVisible();
});
