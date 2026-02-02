import { test, expect } from './src/test-options';

test.describe('Replay test suite', () => {
  test('Replay frames produce expected UI values', async ({ dashboard }) => {
    await dashboard.gotoWithWsSpy();

    const count = 6;

    await dashboard.waitForFrames(count, 20000);
    const frames = await dashboard.getFrames();

    expect(frames.length).toBeGreaterThanOrEqual(count);

    for (let i = 0; i < count; i++) {
      const frame = frames[i];

      expect(frame, `missing frame at index ${i}`).toBeTruthy();

      const expectedTemp = Number(frame.tC).toFixed(1);
      const expectedHum = Number(frame.rh).toFixed(1);
      const expectedPress = Number(frame.pHpa).toFixed(1);
      const expectedGas = String(frame.gasRaw);

      await expect(dashboard.tempValue).toHaveText(expectedTemp);
      await expect(dashboard.humidityValue).toHaveText(expectedHum);
      await expect(dashboard.pressureValue).toHaveText(expectedPress);
      await expect(dashboard.gasValue).toHaveText(expectedGas);
    }

    // Also check that frames replay
    const f0 = await dashboard.getFrame(0);
    const f5 = await dashboard.getFrame(5);

    expect(f5.tC).toBe(f0.tC);
    expect(f5.rh).toBe(f0.rh);
    expect(f5.pHpa).toBe(f0.pHpa);
    expect(f5.gasRaw).toBe(f0.gasRaw);
  });
});
