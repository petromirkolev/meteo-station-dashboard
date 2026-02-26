import { test, expect } from './src/test-options';

test.describe('Accessibility + UX', () => {
  test('Record button is a real button and keyboard-usable', async ({
    dashboard,
    page,
  }) => {
    await dashboard.goto();

    const btn = dashboard.recordButton;

    await expect(btn).toHaveJSProperty('tagName', 'BUTTON');

    await page.keyboard.press('Tab');
    await expect(btn).toBeFocused();

    await expect(btn).toHaveAttribute('aria-pressed', 'false');
    await page.keyboard.press('Space');
    await expect(btn).toHaveAttribute('aria-pressed', 'true');

    await page.keyboard.press('Enter');
    await expect(btn).toHaveAttribute('aria-pressed', 'false');
  });
});
