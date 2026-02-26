import { test, expect } from './src/test-options';

test.describe('Resilience / defensive behavior suite', () => {
  test('Missing fields don’t crash the UI', async ({ dashboard }) => {
    test.setTimeout(60_000);

    await dashboard.goto();

    await expect(dashboard.tempValue).not.toHaveText('--.-', {
      timeout: 20_000,
    });

    await expect
      .poll(async () => (await dashboard.humidityValue.textContent())?.trim(), {
        timeout: 20_000,
      })
      .toBe('--.-');
  });
});
