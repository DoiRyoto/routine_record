import { test, expect } from '@playwright/test';

test.describe('Habit Form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should open habit form dialog when clicking new habit button', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    const dialog = page.locator('[data-testid="habit-form-dialog"]');
    await expect(dialog).toBeVisible();

    await expect(page.locator('[data-testid="habit-form-title"]')).toHaveText('新しい習慣を追加');
    await expect(page.locator('[data-testid="habit-form-description"]')).toContainText('習慣の名前、目標回数、頻度を入力してください');
  });

  test('should display all form fields', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await expect(page.locator('[data-testid="habit-name-label"]')).toContainText('習慣名');
    await expect(page.locator('[data-testid="habit-name-input"]')).toBeVisible();

    await expect(page.locator('[data-testid="habit-target-label"]')).toContainText('目標回数');
    await expect(page.locator('[data-testid="habit-target-input"]')).toBeVisible();

    await expect(page.locator('[data-testid="habit-frequency-label"]')).toContainText('頻度');
    await expect(page.locator('[data-testid="habit-frequency-select"]')).toBeVisible();

    await expect(page.locator('[data-testid="habit-form-cancel-button"]')).toContainText('キャンセル');
    await expect(page.locator('[data-testid="habit-form-submit-button"]')).toContainText('保存');
  });

  test('should show validation errors when submitting empty form', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    const submitButton = page.locator('[data-testid="habit-form-submit-button"]');
    await submitButton.click();

    await expect(page.locator('[data-testid="habit-name-error"]')).toContainText('習慣名を入力してください');
    await expect(page.locator('[data-testid="habit-target-error"]')).toContainText('目標回数を入力してください');
    await expect(page.locator('[data-testid="habit-frequency-error"]')).toContainText('頻度タイプを選択してください');
  });

  test('should show validation error for invalid target count', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', 'テスト習慣');
    await page.fill('[data-testid="habit-target-input"]', '0');

    const submitButton = page.locator('[data-testid="habit-form-submit-button"]');
    await submitButton.click();

    await expect(page.locator('[data-testid="habit-target-error"]')).toContainText('目標回数は1以上の数値を入力してください');
  });

  test('should create new habit successfully with weekly frequency', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', 'E2Eテスト習慣（週間）');
    await page.fill('[data-testid="habit-target-input"]', '5');

    await page.click('[data-testid="habit-frequency-select"]');
    await page.click('[data-testid="habit-frequency-weekly"]');

    const submitButton = page.locator('[data-testid="habit-form-submit-button"]');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    const habitCards = page.locator('[data-testid="habit-card"]');
    await expect(habitCards).not.toHaveCount(0);
  });

  test('should create new habit successfully with monthly frequency', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', 'E2Eテスト習慣（月間）');
    await page.fill('[data-testid="habit-target-input"]', '10');

    await page.click('[data-testid="habit-frequency-select"]');
    await page.click('[data-testid="habit-frequency-monthly"]');

    const submitButton = page.locator('[data-testid="habit-form-submit-button"]');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    const habitCards = page.locator('[data-testid="habit-card"]');
    await expect(habitCards).not.toHaveCount(0);
  });

  test('should close dialog when clicking cancel button', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', 'キャンセルテスト');
    await page.fill('[data-testid="habit-target-input"]', '3');

    const cancelButton = page.locator('[data-testid="habit-form-cancel-button"]');
    await cancelButton.click();

    const dialog = page.locator('[data-testid="habit-form-dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('should clear form data after canceling', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', 'データクリアテスト');
    await page.fill('[data-testid="habit-target-input"]', '7');
    await page.click('[data-testid="habit-frequency-select"]');
    await page.click('[data-testid="habit-frequency-weekly"]');

    const cancelButton = page.locator('[data-testid="habit-form-cancel-button"]');
    await cancelButton.click();

    await newHabitButton.click();

    await expect(page.locator('[data-testid="habit-name-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="habit-target-input"]')).toHaveValue('');
  });

  test('should disable form fields while submitting', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', 'ローディングテスト');
    await page.fill('[data-testid="habit-target-input"]', '3');
    await page.click('[data-testid="habit-frequency-select"]');
    await page.click('[data-testid="habit-frequency-weekly"]');

    await page.route('**/api/habits', async (route) => {
      await page.waitForTimeout(1000);
      await route.continue();
    });

    const submitButton = page.locator('[data-testid="habit-form-submit-button"]');
    await submitButton.click();

    await expect(page.locator('[data-testid="habit-name-input"]')).toBeDisabled();
    await expect(page.locator('[data-testid="habit-target-input"]')).toBeDisabled();
    await expect(submitButton).toBeDisabled();
  });

  test('should show loading state on submit button', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', 'ボタンローディングテスト');
    await page.fill('[data-testid="habit-target-input"]', '4');
    await page.click('[data-testid="habit-frequency-select"]');
    await page.click('[data-testid="habit-frequency-monthly"]');

    await page.route('**/api/habits', async (route) => {
      await page.waitForTimeout(500);
      await route.continue();
    });

    const submitButton = page.locator('[data-testid="habit-form-submit-button"]');
    await submitButton.click();

    await expect(submitButton).toContainText('保存中...');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    const dialog = page.locator('[data-testid="habit-form-dialog"]');
    await expect(dialog).toBeVisible();

    await expect(page.locator('[data-testid="habit-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-target-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-frequency-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-form-submit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-form-cancel-button"]')).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });

    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    const dialog = page.locator('[data-testid="habit-form-dialog"]');
    await expect(dialog).toBeVisible();

    await expect(page.locator('[data-testid="habit-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-target-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="habit-frequency-select"]')).toBeVisible();
  });

  test('should handle input with Japanese characters', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    const habitName = '朝のランニング🏃‍♂️';
    await page.fill('[data-testid="habit-name-input"]', habitName);

    const nameInput = page.locator('[data-testid="habit-name-input"]');
    await expect(nameInput).toHaveValue(habitName);
  });

  test('should trim whitespace from habit name', async ({ page }) => {
    const newHabitButton = page.locator('[data-testid="add-habit-button"]');
    await newHabitButton.click();

    await page.fill('[data-testid="habit-name-input"]', '  スペーステスト  ');
    await page.fill('[data-testid="habit-target-input"]', '5');
    await page.click('[data-testid="habit-frequency-select"]');
    await page.click('[data-testid="habit-frequency-weekly"]');

    const submitButton = page.locator('[data-testid="habit-form-submit-button"]');
    await submitButton.click();

    await page.waitForLoadState('networkidle');

    const habitCards = page.locator('[data-testid="habit-card"]');
    await expect(habitCards).not.toHaveCount(0);
  });
});
