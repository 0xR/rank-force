import { expect, test } from '@playwright/test';

// Targets the running `sst dev` site so MQTT + snapshot fetch are wired.
// Default vite port is 5173. Override with SST_DEV_URL if needed.
const SST_DEV_URL = process.env.SST_DEV_URL ?? 'http://localhost:5173';

test.describe('cross-browser realtime collab', () => {
  test('peer B sees an item peer A added in a separate browser', async ({
    browser,
  }) => {
    const ctxA = await browser.newContext({ baseURL: SST_DEV_URL });
    const ctxB = await browser.newContext({ baseURL: SST_DEV_URL });
    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();

    try {
      // Peer A starts a session.
      await pageA.goto('/');
      await pageA.getByLabel('Your name').fill('peer A');
      await pageA.getByRole('button', { name: 'Start a session' }).click();
      await pageA.waitForURL(/\/configure$/);
      const documentId = pageA.url().match(/\/session\/([^/]+)/)![1];

      // Peer A adds an item — this triggers an MQTT publish, the persister
      // Lambda writes a snapshot to DDB.
      await pageA.getByLabel('Item label').fill('shared-item');
      await pageA.getByRole('button', { name: 'Add', exact: true }).click();
      await expect(pageA.getByText('shared-item')).toBeVisible();

      // Peer B opens the same session URL in a fresh browser context (no
      // shared IndexedDB / BroadcastChannel — the only sync path is MQTT +
      // snapshot fetch).
      await pageB.goto(`/session/${documentId}`);
      await pageB.waitForURL(/\/user$/, { timeout: 15_000 });
      await pageB.getByLabel('Your name').fill('peer B');
      await pageB.getByRole('button', { name: /continue/i }).click();
      await pageB.waitForURL(/\/configure$/, { timeout: 15_000 });

      // Peer B should see the item peer A created.
      await expect(pageB.getByText('shared-item')).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await ctxA.close();
      await ctxB.close();
    }
  });
});
