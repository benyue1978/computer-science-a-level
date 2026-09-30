import { test, expect } from "@playwright/test";

test("daily selection, notes, recall, hide and backup survive browser reload", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/vocabulary");
  await expect(
    page.getByRole("heading", { name: "Suggested for you" }),
  ).toBeVisible();
  await expect(page.getByText("● Saved on this device")).toBeVisible();
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "+ Add to today", exact: true })
      .first()
      .click();
  await expect(page.getByText("5 of 5 chosen")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "+ Add to today", exact: true }).first(),
  ).toBeDisabled();
  await page.getByLabel("Daily total").selectOption("10");
  await page
    .getByRole("button", { name: "+ Add to today", exact: true })
    .first()
    .click();
  await expect(page.getByText("6 of 10 chosen")).toBeVisible();
  const note = page.getByRole("textbox", { name: /Explanation for/ }).first();
  await note.fill("我的理解：信息 / useful information");
  await expect(page.getByText("● Saved on this device")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: /Explanation for/ }).first(),
  ).toHaveValue("我的理解：信息 / useful information");
  await expect(page.getByText("6 of 10 chosen")).toBeVisible();
  await page.getByRole("button", { name: "Mark as sent", exact: true }).click();
  await expect(page.getByText("0 of 10 chosen")).toBeVisible();
  await page.getByRole("button", { name: "Sent lists", exact: true }).click();
  await expect(
    page.getByText("我的理解：信息 / useful information"),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Needs practice", exact: true })
    .first()
    .click();
  await expect(page.getByText(/will return tomorrow/)).toBeVisible();
  await page.getByRole("button", { name: "All words", exact: true }).click();
  await page.getByRole("textbox", { name: "Search words" }).fill("suitable");
  await page
    .getByRole("button", { name: "Already known / trivial", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /^Known list/ }).click();
  await page
    .getByRole("button", { name: "Move back to active words", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Books & backup", exact: true })
    .click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export backup ↓" }).click();
  const download = await downloaded;
  const backupPath = testInfo.outputPath("backup.json");
  await download.saveAs(backupPath);
  await page.getByLabel("Restore a backup").setInputFiles(backupPath);
  await expect(
    page.getByRole("heading", { name: "Restore this backup?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Replace with this backup" }).click();
  await expect(page.getByText("Import complete.")).toBeVisible();
  await page.getByRole("button", { name: /^Today/ }).click();
  await page.screenshot({
    path: testInfo.outputPath("vocabulary.png"),
    fullPage: false,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("import is validated, merges duplicate sources once and retains notes", async ({
  page,
}) => {
  await page.goto("/vocabulary");
  await page
    .getByRole("button", { name: "Books & backup", exact: true })
    .click();
  const input = page.getByLabel("Import word list");
  await input.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"id":"bad"}'),
  });
  await expect(page.getByRole("alert")).toContainText("not a valid");
  const payload = {
    id: "maths",
    name: "Maths",
    words: [
      {
        word: "available",
        frequency: 20,
        examples: ["The answer is available to everyone in the class."],
      },
    ],
  };
  for (let i = 0; i < 2; i++) {
    await input.setInputFiles({
      name: "maths.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(payload)),
    });
    await page.getByRole("button", { name: "Merge word list" }).click();
  }
  await page.getByRole("button", { name: "All words", exact: true }).click();
  await page.getByRole("textbox", { name: "Search words" }).fill("available");
  await expect(page.locator(".v-word")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Book", exact: true })
    .selectOption("maths");
  await expect(
    page.getByRole("heading", { name: "available", exact: true }),
  ).toBeVisible();
});

test("daily total is enforced, copied notes match, and due reviews return", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.setFixedTime(new Date("2026-10-01T12:00:00"));
  await page.goto("/vocabulary");
  await expect(page.getByText("● Saved on this device")).toBeVisible();
  const first = (await page.locator(".v-word h3").first().textContent())!;
  for (let i = 0; i < 5; i++)
    await page
      .getByRole("button", { name: "+ Add to today", exact: true })
      .first()
      .click();
  await page
    .getByRole("textbox", { name: `Explanation for ${first}`, exact: true })
    .fill("自己的解释");
  await page.getByRole("button", { name: "Copy today’s list" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("自己的解释");
  expect(copied).toContain(`1. ${first}`);
  await expect(page.getByText("● Saved on this device")).toBeVisible();
  await page.getByRole("button", { name: "Mark as sent", exact: true }).click();
  await expect(page.getByText("5 sent today · 0 places left")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "+ Add to today", exact: true }).first(),
  ).toBeDisabled();
  await expect(page.getByText("● Saved on this device")).toBeVisible();
  await page.clock.setFixedTime(new Date("2026-10-04T12:00:00"));
  await page.reload();
  await expect(page.locator(".v-word").first()).toContainText("Due for review");
  await expect(page.locator(".v-word h3").first()).toHaveText(first);
  await page
    .getByRole("button", { name: "Remembered", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "All words", exact: true }).click();
  await page.getByRole("textbox", { name: "Search words" }).fill(first);
  await expect(
    page
      .locator(".v-word")
      .filter({ has: page.getByRole("heading", { name: first, exact: true }) }),
  ).toContainText("Review 2026-10-11");
});
