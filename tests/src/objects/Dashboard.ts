import { Page, Locator, test, expect } from '@playwright/test';

export class Dashboard {
  readonly page: Page;
  readonly appTitle: Locator;
  readonly tempValue: Locator;
  readonly feelsLike: Locator;
  readonly heatIndex: Locator;
  readonly humidityValue: Locator;
  readonly dewPoint: Locator;
  readonly comfortLabel: Locator;
  readonly pressureValue: Locator;
  readonly pressureTrend: Locator;
  readonly pressureDelta: Locator;
  readonly gasValue: Locator;
  readonly tempTrend: Locator;
  readonly humidityTrend: Locator;
  readonly badgePressureTrend: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appTitle = this.page.locator('[data-testid="app-title"]');
    this.tempValue = this.page.locator('[data-testid="temp-value"]');
    this.feelsLike = this.page.locator('[data-testid="feels-like-value"]');
    this.heatIndex = this.page.locator('[data-testid="heat-index-value"]');
    this.humidityValue = this.page.locator('[data-testid="humidity-value"]');
    this.dewPoint = this.page.locator('[data-testid="dew-point-value"]');
    this.comfortLabel = this.page.locator('[data-testid="comfort-label"]');
    this.pressureValue = this.page.locator('[data-testid="pressure-value"]');
    this.pressureTrend = this.page.locator(
      '[data-testid="pressure-trend-value"]',
    );
    this.pressureDelta = this.page.locator(
      '[data-testid="pressure-delta-value"]',
    );
    this.gasValue = this.page.locator('[data-testid="adc-value"]');
    this.tempTrend = this.page.locator('[data-testid="badge-temp-state"]');
    this.humidityTrend = this.page.locator('[data-testid="badge-comfort"]');
    this.badgePressureTrend = this.page.locator(
      '[data-testid="badge-pressure-trend"]',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }
}
