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

  test('WebSocket connects and handshake occurs', async ({ dashboard }) => {
    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello();
  });

  test('First frame updates at least one raw metric', async ({ dashboard }) => {
    test.setTimeout(30_000);

    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello(10_000);
    await dashboard.waitForFrameIndex(0, 20_000);

    await expect(dashboard.tempValue).not.toHaveText('--.-', {
      timeout: 10_000,
    });
    await expect(dashboard.tempValue).toHaveText('27.1', { timeout: 10_000 });
  });
});
