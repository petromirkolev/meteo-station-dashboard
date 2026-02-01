import { test, expect } from '@playwright/test';

test.describe('Meteo Station Dashboard Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should load the main dashboard page', async ({ page }) => {
    await expect(page.locator('[data-testid="app-title"]')).toHaveText(
      'Meteo Station',
    );
  });
});
