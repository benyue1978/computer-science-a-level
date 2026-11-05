import { test, expect } from '@playwright/test';

test('past papers open from home, load each paper and preserve printable selection', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.locator('a[href="/pastpaper/"]').click();
  await expect(page.locator('#site-title')).toBeVisible();
  await page.reload();
  for (const paper of ['P1', 'P2', 'P3', 'P4']) {
    await page.getByRole('button', { name: paper, exact: true }).click();
    await page.locator('#topic-filter').selectOption({ index: 1 });
    await expect(page.locator('.question-row-card').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: '术语英中对照', exact: true })).toBeVisible();
    await expect(page.locator('.glossary-card').first()).toBeVisible();
  }
  const term = page.locator('.glossary-card').first();
  const english = await term.locator('.glossary-term-en').innerText();
  const chinese = await term.locator('.glossary-term-zh').innerText();
  const meaning = await term.locator('.glossary-meaning').innerText();
  const notesPopup = page.waitForEvent('popup');
  await page.locator('#print-notes').click();
  const notesPage = await notesPopup;
  await expect(notesPage).toHaveURL(/\/pastpaper\/print.html$/);
  const glossary = notesPage.locator('.glossary-print-section');
  await expect(glossary).toContainText(english);
  await expect(glossary).toContainText(chinese);
  await expect(glossary).toContainText(meaning);
  await notesPage.close();
  const card = page.locator('.question-row-card').first();
  await card.locator('summary').first().click();
  const img = card.locator('img').first();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await card.getByRole('checkbox').check();
  const popup = page.waitForEvent('popup');
  await page.locator('#print-selected').click();
  const printPage = await popup;
  await expect(printPage).toHaveURL(/\/pastpaper\/print.html$/);
  await expect(printPage.locator('#print-content')).not.toBeEmpty();
  await expect(printPage.locator('#print-content')).toContainText('Question');
  expect(errors).toEqual([]);
});
