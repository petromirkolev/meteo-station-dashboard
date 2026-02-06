import { test, expect } from './src/test-options';

test.describe('Derived metrics test suite', () => {
  test.describe('Heat index', () => {
    test('Heat index is calculated properly', async ({ dashboard }) => {
      await dashboard.gotoWithWsSpy();
      await dashboard.waitForHello();

      console.log(await dashboard.tempValue.textContent());
      console.log(await dashboard.heatIndex.textContent());

      const temp = Number((await dashboard.tempValue.textContent())?.trim());
      const heat = Number((await dashboard.heatIndex.textContent())?.trim());

      console.log(temp);
      console.log(heat);

      expect(Number.isFinite(temp)).toBe(true);
      expect(Number.isFinite(heat)).toBe(true);

      expect(heat).toBeGreaterThan(temp);
    });
  });
  test.describe('Dew point', () => {
    test('Dew point is calculated properly', async ({ dashboard }) => {
      const a = 17.62;
      const b = 243.12;
      const tempValue = Number(dashboard.tempValue.textContent());
      const humidityValue = Number(dashboard.humidityValue.textContent());

      const gamma =
        (a * tempValue) / (b + tempValue) + Math.log(humidityValue / 100);
      const dp = (b * gamma) / (a - gamma);

      // console.log(dp);
    });
  });
  test.describe('Comfort index', () => {});
  test.describe('Trends ', () => {});
});
