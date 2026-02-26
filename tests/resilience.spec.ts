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

  test('Non-numeric / NaN values are handled properly', async ({
    dashboard,
  }) => {
    test.setTimeout(60_000);

    await dashboard.goto();

    await expect
      .poll(async () => (await dashboard.tempValue.textContent())?.trim(), {
        timeout: 25_000,
      })
      .toBe('--.-');

    await expect
      .poll(async () => (await dashboard.gasValue.textContent())?.trim(), {
        timeout: 25_000,
      })
      .toBe('----');
  });

  test('Malformed JSON line is ignored and replay continues', async ({
    dashboard,
  }) => {
    test.setTimeout(60_000);

    await dashboard.goto();

    await expect(dashboard.tempValue).toHaveText('27.4', { timeout: 30_000 });
  });
});
