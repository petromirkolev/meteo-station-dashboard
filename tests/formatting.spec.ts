import { test, expect } from './src/test-options';

test.describe('Formatting test suite', () => {
  test('Placeholders render when no frames arrive', async ({ dashboard }) => {
    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello();

    await expect(dashboard.tempValue).toHaveText('--.-');
    await expect(dashboard.feelsLike).toHaveText('--.-');
    await expect(dashboard.heatIndex).toHaveText('--.-');
    await expect(dashboard.tempTrend).toHaveText('unknown');

    await expect(dashboard.humidityValue).toHaveText('--.-');
    await expect(dashboard.dewPoint).toHaveText('--.-');
    await expect(dashboard.comfortLabel).toHaveText('--');
    await expect(dashboard.humidityTrend).toHaveText('unknown');

    await expect(dashboard.pressureValue).toHaveText('----');
    await expect(dashboard.pressureTrend).toHaveText('--');
    await expect(dashboard.pressureDelta).toHaveText('--.-');
    await expect(dashboard.badgePressureTrend).toHaveText('unknown');

    await expect(dashboard.gasValue).toHaveText('----');
  });
});
