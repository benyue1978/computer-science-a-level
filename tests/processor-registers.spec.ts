import { test, expect } from "@playwright/test";

test("home exposes both lessons and processor lesson supports direct reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator('a[href="/learn/memory"]').first()).toBeVisible();
  await page.locator('a[href="/learn/processor-registers"]').first().click();
  await expect(page).toHaveURL(/\/learn\/processor-registers$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Processor",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Processor",
  );
  await expect(page).toHaveTitle(/Processor/);
  expect(errors).toEqual([]);
});

test("both languages fit the phone and desktop with reduced motion", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/learn/processor-registers");
  for (const language of ["English", "中文"]) {
    await page.getByRole("button", { name: language, exact: true }).click();
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath(
        `intro-${language === "English" ? "en" : "zh"}.png`,
      ),
      fullPage: true,
    });
  }
});

test("guided processor lesson preserves language state and resets disclosure", async ({
  page,
}, testInfo) => {
  await page.goto("/learn/processor-registers");

  const recall = page.getByRole("group", { name: /Optional recall/ });
  await recall.getByRole("button", { name: "11", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Revisit memory" }),
  ).toBeVisible();

  const processorQuestion = page.getByRole("group", {
    name: "Which component carries out instructions?",
  });
  await processorQuestion
    .getByRole("button", { name: "Processor", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveCount(0);
  await page
    .getByRole("group", { name: "Which component is main memory?" })
    .getByRole("button", { name: "Main memory", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveCount(2);

  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Look inside the processor." }),
  ).toBeFocused();
  await expect(page.getByRole("group", { name: "Register A" })).toHaveCount(0);
  const disclosure = page.getByRole("button", {
    name: "Look inside the processor",
    exact: true,
  });
  await disclosure.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toBeFocused();
  await expect(disclosure).toHaveAttribute("aria-expanded", "true");
  const processor = page.getByRole("group", { name: "Processor", exact: true });
  await expect(
    processor.getByRole("group", { name: "Register A", exact: true }),
  ).toBeVisible();
  await expect(
    processor.getByRole("group", { name: "Main memory", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("group", {
      name: "Are registers inside the processor or in the separate main-memory area?",
    })
    .getByRole("button", { name: "Inside the processor", exact: true })
    .click();

  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByRole("group", { name: "寄存器 A" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "处理器内部", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "English", exact: true }).click();

  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(
    page.getByRole("group", { name: "Register A", exact: true }),
  ).toContainText("7");
  await page
    .getByRole("group", { name: "What are the contents of Register A?" })
    .getByRole("button", { name: "7", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveCount(0);
  await page
    .getByRole("group", {
      name: "Which storage location is inside the processor?",
    })
    .getByRole("button", { name: "Register A", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveCount(2);

  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(
    page.getByRole("group", { name: "Register A", exact: true }),
  ).toContainText("9");
  const questions = [
    ["Which shown location is a register?", "Register B"],
    ["Where is that register?", "Inside the processor"],
    ["What does the processor do?", "Carries out instructions"],
    ["What does main memory do?", "Stores data and instructions"],
  ];
  for (const [question, answer] of questions) {
    await page
      .getByRole("group", { name: question, exact: true })
      .getByRole("button", { name: answer, exact: true })
      .click();
  }
  await expect(page.getByRole("status")).toHaveCount(4);
  await expect(page.getByText(/Both can store information/)).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("fresh-diagram.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "1. 两个组成部分", exact: true }),
  ).toHaveAttribute("aria-current", "step");
  await page.getByRole("button", { name: "下一小节", exact: true }).click();
  await expect(page.getByRole("group", { name: "寄存器 A" })).toHaveCount(0);
});
