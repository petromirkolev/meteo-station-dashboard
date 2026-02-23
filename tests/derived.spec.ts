import { test, expect } from './src/test-options';

test.describe('Derived metrics test suite', () => {
  test.describe('Heat index @hi', () => {
    test('Heat index is calculated properly', async ({ dashboard }) => {
      await dashboard.gotoWithWsSpy();
      await dashboard.waitForFrames(1, 10000);

      const temp = Number((await dashboard.tempValue.textContent())?.trim());
      const heat = Number((await dashboard.heatIndex.textContent())?.trim());

      expect(Number.isFinite(temp)).toBe(true);
      expect(Number.isFinite(heat)).toBe(true);
      expect(heat).toBeGreaterThan(temp);
    });
  });
  test.describe('Dew point @dew', () => {
    test('Dew point is calculated properly', async ({ dashboard }) => {
      const a = 17.62;
      const b = 243.12;

      await dashboard.gotoWithWsSpy();
      await dashboard.waitForFrames(1, 10000);

      const temp = Number((await dashboard.tempValue.textContent())?.trim());
      const humidity = Number(
        (await dashboard.humidityValue.textContent())?.trim(),
      );

      const gamma = (a * temp) / (b + temp) + Math.log(humidity / 100);
      const dp = (b * gamma) / (a - gamma);

      expect(dp.toFixed(1)).toEqual(await dashboard.dewPoint.textContent());
    });
  });
  test.describe('Comfort index @comfort', () => {
    test('Comfort label mapping is correct @comfort', async ({ dashboard }) => {
      await dashboard.gotoWithWsSpy();
      await dashboard.waitForHello();

      const cases = [
        { i: 0, label: 'Dry' },
        { i: 3, label: 'OK' },
        { i: 6, label: 'Humid' },
      ];

      const boundaryCases = [
        { i: 1, label: 'Dry' },
        { i: 2, label: 'OK' },
        { i: 4, label: 'OK' },
        { i: 5, label: 'Humid' },
      ];

      for (const c of cases) {
        await dashboard.waitForFrameIndex(c.i, 10000);
        await expect(dashboard.comfortLabel).toHaveText(c.label);
      }

      for (const c of boundaryCases) {
        await dashboard.waitForFrameIndex(c.i, 10000);
        await expect(dashboard.comfortLabel).toHaveText(c.label);
      }
    });
  });
  test.describe('Trends @trends', () => {
    test('Trends correspond to temp value', async ({ dashboard }) => {
      await dashboard.gotoWithWsSpy();
      await dashboard.waitForHello();

      await dashboard.waitForFrameIndex(4, 30000);
      await expect(dashboard.tempValue).toHaveText('27.0');
      await expect(dashboard.tempTrend).toHaveText('stable');

      await dashboard.waitForFrameIndex(5, 30000);
      await expect(dashboard.tempValue).toHaveText('29.0');
      await expect(dashboard.tempTrend).toHaveText('warming');

      await dashboard.waitForFrameIndex(6, 30000);
      await expect(dashboard.tempValue).toHaveText('29.0');
      await expect(dashboard.tempTrend).toHaveText('stable');

      await dashboard.waitForFrameIndex(10, 30000);
      await expect(dashboard.tempValue).toHaveText('27.0');
      await expect(dashboard.tempTrend).toHaveText('cooling');

      await dashboard.waitForFrameIndex(11, 30000);
      await expect(dashboard.tempValue).toHaveText('27.0');
      await expect(dashboard.tempTrend).toHaveText('stable');
    });
    test('Trends correspond to humidity value', async ({ dashboard }) => {
      test.setTimeout(120_000);
      await dashboard.gotoWithWsSpy();
      await dashboard.waitForHello();

      await dashboard.waitForFrameIndex(4, 30000);
      await expect(dashboard.humidityValue).toHaveText('45.0');
      await expect(dashboard.humidityTrend).toHaveText('stable');

      await dashboard.waitForFrameIndex(15, 30000);
      await expect(dashboard.humidityValue).toHaveText('25.0');
      await expect(dashboard.humidityTrend).toHaveText('drying');

      await dashboard.waitForFrameIndex(16, 30000);
      await expect(dashboard.humidityValue).toHaveText('25.0');
      await expect(dashboard.humidityTrend).toHaveText('stable');

      await dashboard.waitForFrameIndex(20, 30000);
      await expect(dashboard.humidityValue).toHaveText('75.0');
      await expect(dashboard.humidityTrend).toHaveText('damping');

      await dashboard.waitForFrameIndex(21, 30000);
      await expect(dashboard.humidityValue).toHaveText('75.0');
      await expect(dashboard.humidityTrend).toHaveText('stable');

      await dashboard.waitForFrameIndex(25, 30000);
      await expect(dashboard.humidityValue).toHaveText('45.0');
      await expect(dashboard.humidityTrend).toHaveText('drying');

      await dashboard.waitForFrameIndex(26, 30000);
      await expect(dashboard.humidityValue).toHaveText('45.0');
      await expect(dashboard.humidityTrend).toHaveText('stable');
    });
    test('Trends correspond to pressure value', async ({ dashboard }) => {});
  });
});
