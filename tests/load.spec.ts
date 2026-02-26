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

  test('UI remains stable under fast replay', async ({ dashboard, page }) => {
    test.setTimeout(90_000);

    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });

    await dashboard.goto();

    await expect(dashboard.tempValue).not.toHaveText('--.-', {
      timeout: 20_000,
    });

    await page.waitForTimeout(3000);

    await dashboard.recordButton.click();
    await expect(dashboard.recordButton).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    expect(errors, `Console errors: ${errors.join('\n')}`).toEqual([]);
  });
});
