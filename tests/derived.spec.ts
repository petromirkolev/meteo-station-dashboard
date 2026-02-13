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
    test('Comfort label is calculated properly', async ({ dashboard }) => {});
  });
  test.describe('Trends @trends', () => {
    test('Trends correspond to temp/hum/pressure values', async ({
      dashboard,
    }) => {});
  });
});
