import path from 'path';

import { chromium, FullConfig } from '@playwright/test';

const STORAGE_STATE_PATH = path.join(__dirname, '.auth/user.json');

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/auth/signin`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await submitButton.click();

    await page.waitForURL(`${baseURL}/`, { timeout: 30000 });

    await context.storageState({ path: STORAGE_STATE_PATH });
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
