import { expect, test } from "@playwright/test";

test("home and direct route open the bilingual register lesson", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Explore the fetch registers" }).click();
  await expect(page).toHaveURL(/\/learn\/fetch-registers$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Four registers, four jobs");
  await page.reload();
  await expect(page).toHaveTitle(/Four registers, four jobs/);
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("四个寄存器，各有分工");
  await expect(page.getByLabel("程序计数器 PC")).toContainText("20");
  expect(errors).toEqual([]);
});

test("keyboard prediction unlocks the four distinct computer events", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/fetch-registers");
  const next = page.getByRole("button", { name: "Show next computer step" });
  await expect(next).toBeDisabled();
  const prediction = page.getByRole("button", { name: "PC", exact: true });
  await prediction.focus();
  await page.keyboard.press("Enter");
  await expect(next).toBeEnabled();
  const events = [
    "copies 20 from PC into MAR",
    "supplies address 20 to the address bus",
    "sends its instruction contents over the data bus into MDR",
    "copies the instruction from MDR into CIR",
  ];
  for (const event of events) {
    await next.click();
    await expect(page.locator(".fetch-computer-event").getByRole("status")).toContainText(event);
  }
  await expect(page.getByLabel("Program Counter (PC)")).toContainText("20");
  await expect(page.getByLabel("Memory Address Register (MAR)")).toContainText("20");
  await expect(page.getByLabel("Memory Data Register (MDR)")).toContainText("Display “Hello”");
  await expect(page.getByLabel("Current Instruction Register (CIR)")).toContainText("Display “Hello”");
  await expect(page.getByRole("heading", { name: "Check what travelled" })).toBeVisible();
  await page.getByRole("button", { name: "Address bus", exact: true }).first().click();
  await expect(page.getByText("The address bus carries the memory location.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("language changes preserve bus answers; reset returns to the initial computer state", async ({ page }) => {
  await page.goto("/learn/fetch-registers");
  await page.getByRole("button", { name: "PC", exact: true }).click();
  const next = page.getByRole("button", { name: "Show next computer step" });
  for (let index = 0; index < 4; index += 1) await next.click();
  await page.getByRole("button", { name: "Data bus", exact: true }).last().click();
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("button", { name: "数据总线", exact: true }).last()).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("数据总线传送指令内容。", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "重新开始" }).click();
  await expect(page.getByLabel("程序计数器 PC")).toContainText("20");
  await expect(page.getByLabel("存储器地址寄存器 MAR")).toContainText("尚未填写");
  await expect(page.getByRole("button", { name: "显示计算机下一步" })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
