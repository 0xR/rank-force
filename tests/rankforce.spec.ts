import { expect, Page, test } from '@playwright/test';

async function fillUsername(page: Page, username: string) {
  await page.getByLabel('Username').fill(username);
  await page.getByText('Save').click();
}

test.describe('Item ranking', () => {
  test('should fill in username and remember it across tabs', async ({
    page,
    context,
  }) => {
    await page.goto('/');

    await fillUsername(page, 'testuser');

    const newPage = await context.newPage();
    await newPage.goto(page.url());

    expect(await newPage.getByLabel('Username')).toHaveValue('testuser');
  });

  test('should sync data between browsers', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    await page1.goto('/');
    await page2.goto(page1.url());

    await fillUsername(page1, 'user 1');
    await fillUsername(page2, 'user 2');

    await page1.getByText('Configure').click();
    await page2.getByText('Configure').click();

    await page1.getByRole('textbox', { name: 'Item to rank:' }).fill('item1');

    await Promise.all([
      page1.getByText('Add item').click(),
      page1.waitForRequest((request) => request.method() === 'POST'),
      page1.getByText('item1').waitFor({
        state: 'visible',
      }),
    ]);

    await page2.getByText('item1').waitFor({
      state: 'visible',
      timeout: 5000,
    });
  });
});
