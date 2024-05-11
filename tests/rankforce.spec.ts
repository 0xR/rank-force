import { expect, test } from '@playwright/test';

test.describe('Item ranking', () => {
  test('should fill in username and remember it', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel('Username').fill('testuser');
    await page.getByText('Save').click();
    await page.reload();

    expect(await page.getByLabel('Username')).toHaveValue('testuser');
  });

  test('should fill in and store items', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('textbox', { name: 'Item to rank:' }).fill('item1');

    await Promise.all([
      page.getByText('Add item').click(),
      page.waitForRequest((request) => request.method() === 'POST'),
      page.getByText('item1').waitFor({
        state: 'visible',
      }),
    ]);

    // wait 2 secs
    // await page.waitForTimeout(2000);

    // wait for network request to complete

    console.log('page.url()', page.url());
    await page.goto(page.url());

    await page.getByText('item1').waitFor({
      state: 'visible',
    });
  });
});
