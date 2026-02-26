import { test, expect } from './src/test-options';

test.describe('State + control suite', () => {
  test('Initial state message is reflected in UI', async ({ dashboard }) => {
    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello();

    await dashboard.waitForStateCount(1);
    const st = await dashboard.getLastState();

    expect(st.mode).toBeTruthy();
    expect(st.recording).toBe(false);

    await expect(dashboard.recordButton).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    await expect(dashboard.recordLabel).toHaveText('RECORD');
  });

  test('Record button toggles UI state immediately', async ({ dashboard }) => {
    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello();

    await expect(dashboard.recordButton).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    await dashboard.recordButton.click();

    await expect(dashboard.recordButton).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(dashboard.recordLabel).toHaveText('STOP');
  });

  test('Record button results in backend-confirmed state', async ({
    dashboard,
  }) => {
    await dashboard.gotoWithWsSpy();
    await dashboard.waitForHello();
    await dashboard.waitForStateCount(1);

    await dashboard.recordButton.click();
    await dashboard.waitForRecordingState(true, 10_000);

    await dashboard.recordButton.click();
    await dashboard.waitForRecordingState(false, 10_000);
  });
});
