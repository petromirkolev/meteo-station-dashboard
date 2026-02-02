import { test, expect } from './src/test-options';

test.describe('Meteo Station Dashboard Smoke Tests', () => {
  test('App loads and main UI is visible', async ({ dashboard }) => {
    await dashboard.goto();

    await expect(dashboard.appTitle).toHaveText('Meteo Station');
    await expect(dashboard.tempValue).toBeVisible();
    await expect(dashboard.humidityValue).toBeVisible();
    await expect(dashboard.pressureValue).toBeVisible();
    await expect(dashboard.gasValue).toBeVisible();
  });

  test('WebSocket connects and handshake occurs', async ({
    page,
    dashboard,
  }) => {
    await page.addInitScript(() => {
      (window as any).__wsJson = [];

      const Orig = window.WebSocket;
      class WS extends Orig {
        constructor(url: string | URL, protocols?: string | string[]) {
          super(url as any, protocols as any);

          this.addEventListener('message', (ev) => {
            const text = String((ev as MessageEvent).data);
            try {
              (window as any).__wsJson.push(JSON.parse(text));
            } catch {}
          });
        }
      }

      window.WebSocket = WS;
    });

    await dashboard.goto();
    await expect
      .poll(
        async () => {
          return page.evaluate(() => (window as any).__wsJson.length);
        },
        { timeout: 3000 },
      )
      .toBeGreaterThan(0);

    const hasHello = await page.evaluate(() => {
      return ((window as any).__wsJson as any[]).some(
        (m) => m?.type === 'hello',
      );
    });

    expect(hasHello).toBe(true);
  });

  test('First frame updates at least one raw metric', async ({ dashboard }) => {
    await dashboard.goto();

    await expect(dashboard.tempValue).toHaveText('27.1');
  });
});
