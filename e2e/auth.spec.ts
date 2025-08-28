import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test.describe('Sign In Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/signin');
      await page.waitForLoadState('networkidle');
    });

    test('should display sign in form with required elements', async ({ page }) => {
      // ページタイトルの確認（h2要素を使用）
      await expect(page.locator('h2')).toContainText(/サインイン/);
      
      // フォーム要素の確認
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // サインアップリンクの確認
      await expect(page.locator('text=こちらから登録')).toBeVisible();
    });

    test('should navigate to sign up page from link', async ({ page }) => {
      // サインアップリンクをクリック
      await page.click('text=こちらから登録');
      
      // サインアップページに遷移することを確認
      await expect(page).toHaveURL(/.*\/auth\/signup/);
    });

    test('should handle form validation', async ({ page }) => {
      // 空のフォームでサブミット
      await page.click('button[type="submit"]');
      
      // バリデーションエラーが表示されることを確認
      // 実際の実装に応じて調整が必要
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // モバイルでもフォーム要素が表示されることを確認
      await expect(page.locator('h2')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe('Sign Up Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/auth/signup');
      await page.waitForLoadState('networkidle');
    });

    test('should display sign up form with required elements', async ({ page }) => {
      // ページタイトルの確認（h2要素を使用）
      await expect(page.locator('h2')).toContainText(/アカウント登録/);
      
      // フォーム要素の確認（パスワード確認フィールド含む）
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // サインインリンクの確認
      await expect(page.locator('text=すでにアカウントをお持ちの方')).toBeVisible();
    });

    test('should navigate to sign in page from link', async ({ page }) => {
      // サインインリンクをクリック
      await page.click('text=こちらからサインイン');
      
      // サインインページに遷移することを確認
      await expect(page).toHaveURL(/.*\/auth\/signin/);
    });

    test('should handle password confirmation field if exists', async ({ page }) => {
      // パスワード確認フィールドの確認
      const passwordConfirmField = page.locator('input[name="confirmPassword"]');
      await expect(passwordConfirmField).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // モバイルでもフォーム要素が表示されることを確認
      await expect(page.locator('h2')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });
});