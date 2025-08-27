import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // MSWを起動
    await page.goto(`${baseURL}/`);
    await page.evaluate(() => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        return navigator.serviceWorker.register('/mockServiceWorker.js');
      }
    });
    
    // MSWが準備完了するまで待機
    await page.waitForTimeout(1000);
    
  } catch (error) {
    console.warn('MSW setup failed, continuing without mocks:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup;