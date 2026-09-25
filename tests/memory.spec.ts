import { test, expect } from "@playwright/test";

test("home opens the lesson and its direct link survives reload", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator('a[href="/learn/memory"]').first().click();
  await expect(page).toHaveURL(/\/learn\/memory$/);
  await expect(page.locator("main")).toBeVisible();
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Page not found");
  expect(errors).toEqual([]);
});

test("home and lesson fit the viewport with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/", "/learn/memory"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});

test("guided memory sequence, language preservation, reset and new example", async ({
  page,
}, testInfo) => {
  await page.goto("/learn/memory");
  await page
    .getByRole("button", { name: "Reveal address", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Reveal contents", exact: true })
    .click();
  await expect(page.getByText("7", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Which place is 11?", exact: true }),
  ).toBeFocused();
  const target = page.getByRole("button", {
    name: "Address 11, contents 42",
    exact: true,
  });
  await target.focus();
  await page.keyboard.press("Enter");
  await expect(target).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "地址 11，内容 42", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Show reading", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "11", exact: true }).click();
  await page.getByRole("button", { name: "Show reading", exact: true }).click();
  await expect(page.getByLabel("Value read", { exact: true })).toContainText(
    "42",
  );
  await expect(target).toBeVisible();
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await page
    .getByRole("button", { name: "Address 10, contents 7", exact: true })
    .click();
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Show writing", exact: true }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "I have made my prediction", exact: true })
    .click();
  await page.getByRole("button", { name: "Show writing", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Address 11, contents 6", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Address 10, contents 7", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Address 12, contents 9", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("write-result.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: "Next section", exact: true }).click();
  await page
    .getByRole("group")
    .nth(0)
    .getByRole("button", { name: "3", exact: true })
    .click();
  await page
    .getByRole("group")
    .nth(1)
    .getByRole("button", { name: "21", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Yes — 20 and 22", exact: true })
    .click();
  await expect(page.getByRole("status")).toHaveCount(3);
  await page.screenshot({
    path: testInfo.outputPath("new-example.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "一个位置，两个概念。", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "下一小节", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "地址 11，内容 42", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});
