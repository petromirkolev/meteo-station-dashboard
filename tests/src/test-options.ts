import { test as base, expect, type Page } from '@playwright/test';
import { Dashboard } from './objects/Dashboard';

type MyFixtures = {
  dashboard: Dashboard;
};

export const test = base.extend<MyFixtures>({
  dashboard: async ({ page }, use) => {
    await use(new Dashboard(page));
  },
});

export { expect };
