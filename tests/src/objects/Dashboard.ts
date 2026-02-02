import { Page, Locator } from '@playwright/test';

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

  async gotoWithWsSpy() {
    await this.page.addInitScript(() => {
      (window as any).__wsMsgs = [];
      (window as any).__wsFrames = [];

      const Orig = window.WebSocket;
      class WS extends Orig {
        constructor(url: any, protocols?: any) {
          super(url, protocols);

          this.addEventListener('message', (ev: any) => {
            const text = String(ev.data);
            try {
              const msg = JSON.parse(text);

              (window as any).__wsMsgs.push(msg);

              if (msg?.type === 'frame' && msg?.frame) {
                (window as any).__wsFrames.push(msg.frame);
              }
            } catch {}
          });
        }
      }

      (window as any).WebSocket = WS;
    });

    await this.goto();
  }

  async waitForHello(timeout = 3000) {
    await this.page.waitForFunction(
      () => {
        const msgs = (window as any).__wsMsgs || [];
        return msgs.some((m: any) => m?.type === 'hello');
      },
      { timeout },
    );
  }

  async waitForFrames(count: number, timeout = 10000) {
    await this.page.waitForFunction(
      (n) => {
        const frames = (window as any).__wsFrames || [];
        return frames.length >= n;
      },
      count,
      { timeout },
    );
  }
  async getFrame(i: number) {
    return this.page.evaluate((idx) => (window as any).__wsFrames?.[idx], i);
  }

  async getFrames() {
    return this.page.evaluate(() => (window as any).__wsFrames || []);
  }

  async waitForFrameIndex(i: number, timeout = 10000) {
    await this.waitForFrames(i + 1, timeout);
  }
}
