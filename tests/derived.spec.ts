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
      // await dashboard.waitForFrames(1, 10000);

      const tempValue = Number(dashboard.tempValue.textContent());
      const humidityValue = Number(dashboard.humidityValue.textContent());

      const gamma =
        (a * tempValue) / (b + tempValue) + Math.log(humidityValue / 100);
      const dp = (b * gamma) / (a - gamma);

      console.log(dp);
      // console.log(dp);
      // console.log(dp);
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
