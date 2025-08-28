import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // MSWを起動
    await page.goto(`${baseURL}/`);
    
    // MSWが準備完了するまで待機
    await page.waitForTimeout(2000);
    
    await context.close();
    await browser.close();
    
  } catch (error) {
    console.warn('MSW setup failed, continuing without mocks:', error);
  }
}

export default globalSetup;