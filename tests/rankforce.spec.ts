import { expect, Page, test } from '@playwright/test';

async function startSession(page: Page, name: string) {
  await page.goto('/');
  await page.getByLabel('Your name').fill(name);
  await page.getByRole('button', { name: 'Start a session' }).click();
  await page.waitForURL(/\/configure$/);
}

function documentIdFromUrl(url: string) {
  const match = url.match(/\/session\/([^/]+)/);
  if (!match) throw new Error(`No document id in url: ${url}`);
  return match[1];
}

test.describe('Rank Force', () => {
  test('remembers navigator name across tabs', async ({ page, context }) => {
    await page.goto('/');
    await page.getByLabel('Your name').fill('testuser');
    await page.getByRole('button', { name: 'Start a session' }).click();
    await page.waitForURL(/\/configure$/);

    const newPage = await context.newPage();
    await newPage.goto('/');
    await expect(newPage.getByLabel('Your name')).toHaveValue('testuser');
  });

  test('syncs items across tabs in the same browser', async ({ context }) => {
    const page1 = await context.newPage();
    await startSession(page1, 'user 1');
    const documentId = documentIdFromUrl(page1.url());

    const page2 = await context.newPage();
    await page2.goto(`/session/${documentId}/configure`);
    await page2.waitForURL(/\/configure$/);

    await page1.getByLabel('Item label').fill('item1');
    await page1.getByRole('button', { name: 'Add', exact: true }).click();

    await expect(page1.getByText('item1')).toBeVisible();
    await expect(page2.getByText('item1')).toBeVisible({ timeout: 10000 });
  });
});
