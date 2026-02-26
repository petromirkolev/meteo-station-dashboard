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
    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello();
  });

  test('First frame updates at least one raw metric', async ({ dashboard }) => {
    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello();
    await expect(dashboard.tempValue).toHaveText('27.1');
  });
});
