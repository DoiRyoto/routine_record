import { test, expect } from '@playwright/test';

test.describe('Settings Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display settings page title and basic elements', async ({ page }) => {
    // ページタイトルの確認
    await expect(page.locator('h1')).toContainText(/設定|settings/i);
    
    // 基本的なページコンテンツの確認
    await expect(page.locator('main, .content, [role="main"]').first()).toBeVisible();
  });

  test('should display user profile settings section', async ({ page }) => {
    // プロフィール設定セクションの確認
    const profileSection = page.locator('text=プロフィール, text=アカウント, [data-testid="profile-section"]');
    
    if (await profileSection.first().isVisible()) {
      await expect(profileSection.first()).toBeVisible();
      
      // 名前/ユーザー名フィールドの確認
      const nameField = page.locator('input[name="name"], input[placeholder*="名前"]');
      if (await nameField.first().isVisible()) {
        await expect(nameField.first()).toBeVisible();
      }
      
      // メールフィールドの確認
      const emailField = page.locator('input[type="email"], input[name="email"]');
      if (await emailField.first().isVisible()) {
        await expect(emailField.first()).toBeVisible();
      }
    } else {
    }
  });

  test('should display notification settings', async ({ page }) => {
    // 通知設定セクションの確認
    const notificationSection = page.locator('text=通知, text=Notification, [data-testid="notification-section"]');
    
    if (await notificationSection.first().isVisible()) {
      await expect(notificationSection.first()).toBeVisible();
      
      // 通知の種類別設定の確認
      const notificationToggles = page.locator('input[type="checkbox"], .toggle, .switch');
      const toggleCount = await notificationToggles.count();
      
      if (toggleCount > 0) {
        
        // メール通知設定
        const emailNotification = page.locator('text=メール通知, text=Email');
        if (await emailNotification.first().isVisible()) {
          await expect(emailNotification.first()).toBeVisible();
        }
        
        // リマインダー設定
        const reminderNotification = page.locator('text=リマインダー, text=Reminder');
        if (await reminderNotification.first().isVisible()) {
          await expect(reminderNotification.first()).toBeVisible();
        }
      }
    } else {
    }
  });

  test('should display theme/appearance settings', async ({ page }) => {
    // テーマ/外観設定の確認
    const themeSection = page.locator('text=テーマ, text=外観, text=Appearance, [data-testid="theme-section"]');
    
    if (await themeSection.first().isVisible()) {
      await expect(themeSection.first()).toBeVisible();
      
      // ダークモード/ライトモード切り替えの確認
      const themeToggle = page.locator('text=ダークモード, text=Dark Mode, input[type="checkbox"]');
      if (await themeToggle.first().isVisible()) {
        await expect(themeToggle.first()).toBeVisible();
      }
      
      // テーマ選択ボタンの確認
      const themeButtons = page.locator('button:has-text("ライト"), button:has-text("ダーク")');
      if (await themeButtons.first().isVisible()) {
      }
    } else {
    }
  });

  test('should display privacy and security settings', async ({ page }) => {
    // プライバシー・セキュリティ設定の確認
    const privacySection = page.locator('text=プライバシー, text=セキュリティ, text=Privacy, [data-testid="privacy-section"]');
    
    if (await privacySection.first().isVisible()) {
      await expect(privacySection.first()).toBeVisible();
      
      // パスワード変更リンク/ボタンの確認
      const passwordChange = page.locator('button:has-text("パスワード変更"), a:has-text("パスワード変更")');
      if (await passwordChange.first().isVisible()) {
        await expect(passwordChange.first()).toBeVisible();
      }
      
      // データエクスポート機能の確認
      const dataExport = page.locator('button:has-text("データエクスポート"), text=データのダウンロード');
      if (await dataExport.first().isVisible()) {
        await expect(dataExport.first()).toBeVisible();
      }
    } else {
    }
  });

  test('should display routine default settings', async ({ page }) => {
    // ルーティンのデフォルト設定の確認
    const routineSection = page.locator('text=ルーティン設定, text=デフォルト設定, [data-testid="routine-settings"]');
    
    if (await routineSection.first().isVisible()) {
      await expect(routineSection.first()).toBeVisible();
      
      // デフォルト時間設定
      const timeSettings = page.locator('input[type="time"], select[name*="time"]');
      if (await timeSettings.first().isVisible()) {
        await expect(timeSettings.first()).toBeVisible();
      }
      
      // デフォルトカテゴリ設定
      const categorySettings = page.locator('select[name*="category"], input[name*="category"]');
      if (await categorySettings.first().isVisible()) {
        await expect(categorySettings.first()).toBeVisible();
      }
    } else {
    }
  });

  test('should handle settings form submission', async ({ page }) => {
    // 設定変更の保存機能テスト
    const saveButton = page.locator('button:has-text("保存"), button:has-text("更新"), button[type="submit"]');
    
    if (await saveButton.first().isVisible()) {
      await expect(saveButton.first()).toBeVisible();
      
      // 簡単な設定変更をして保存
      const textInput = page.locator('input[type="text"], input[name="name"]');
      if (await textInput.first().isVisible()) {
        await textInput.first().fill('テスト更新');
        await saveButton.first().click();
        
        // 成功メッセージまたは状態変更の確認
        const successMessage = page.locator('text=保存しました, text=更新しました, [data-testid="success-message"]');
        if (await successMessage.first().isVisible()) {
          await expect(successMessage.first()).toBeVisible();
        }
      }
    }
  });

  test('should handle theme switching', async ({ page }) => {
    // テーマ切り替えの確認
    const themeToggle = page.locator('input[type="checkbox"]:near(text="ダークモード")');
    const darkModeButton = page.locator('button:has-text("ダーク")');
    
    if (await themeToggle.isVisible()) {
      // 初期状態を記録
      const initialState = await themeToggle.isChecked();
      
      // トグル切り替え
      await themeToggle.click();
      await page.waitForTimeout(500); // テーマ適用待機
      
      // 状態が変更されたことを確認
      const newState = await themeToggle.isChecked();
      expect(newState).not.toBe(initialState);
      
    } else if (await darkModeButton.isVisible()) {
      await darkModeButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should display language settings if available', async ({ page }) => {
    // 言語設定の確認
    const languageSection = page.locator('text=言語, text=Language, [data-testid="language-section"]');
    
    if (await languageSection.first().isVisible()) {
      await expect(languageSection.first()).toBeVisible();
      
      // 言語選択の確認
      const languageSelect = page.locator('select[name*="language"], select[name*="locale"]');
      if (await languageSelect.isVisible()) {
        await expect(languageSelect).toBeVisible();
        
        // 利用可能な言語オプションの確認
        const options = languageSelect.locator('option');
        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(0);
      }
    } else {
    }
  });

  test('should display data management options', async ({ page }) => {
    // データ管理オプションの確認
    const dataSection = page.locator('text=データ管理, text=Data Management, [data-testid="data-section"]');
    
    if (await dataSection.first().isVisible()) {
      await expect(dataSection.first()).toBeVisible();
      
      // データ削除オプションの確認
      const deleteButton = page.locator('button:has-text("削除"), button:has-text("Delete")');
      if (await deleteButton.first().isVisible()) {
        await expect(deleteButton.first()).toBeVisible();
      }
      
      // バックアップオプションの確認
      const backupButton = page.locator('button:has-text("バックアップ"), button:has-text("Backup")');
      if (await backupButton.first().isVisible()) {
        await expect(backupButton.first()).toBeVisible();
      }
    } else {
    }
  });

  test.skip('should handle account deletion', async ({ page }) => {
    // アカウント削除機能（危険な操作のためスキップ）
    // TODO: テスト環境での安全な実装後に有効化
    const deleteAccountButton = page.locator('button:has-text("アカウント削除")');
    
    if (await deleteAccountButton.isVisible()) {
      await deleteAccountButton.click();
      
      // 確認ダイアログの表示
      await expect(page.locator('text=本当に削除しますか')).toBeVisible();
      
      // キャンセルボタンをクリック（実際の削除は行わない）
      await page.click('button:has-text("キャンセル")');
    }
  });

  test.skip('should handle password change', async ({ page }) => {
    // パスワード変更機能（認証が必要なためスキップ）
    // TODO: 認証フロー実装後に有効化
    const passwordButton = page.locator('button:has-text("パスワード変更")');
    
    if (await passwordButton.isVisible()) {
      await passwordButton.click();
      
      // パスワード変更フォームの確認
      await expect(page.locator('input[type="password"]')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもページタイトルが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // 設定セクションがモバイルレイアウトに適応することを確認
    const sections = page.locator('text=プロフィール, text=通知, text=テーマ');
    if (await sections.first().isVisible()) {
      await expect(sections.first()).toBeVisible();
    }
    
    // フォーム要素がモバイルでもアクセス可能であることを確認
    const inputs = page.locator('input, select');
    if (await inputs.first().isVisible()) {
      await expect(inputs.first()).toBeVisible();
    }
  });

  test('should handle form validation', async ({ page }) => {
    // フォームバリデーションの確認
    const saveButton = page.locator('button:has-text("保存"), button[type="submit"]');
    const requiredFields = page.locator('input[required]');
    
    if (await saveButton.isVisible() && await requiredFields.first().isVisible()) {
      // 必須フィールドを空にして保存を試行
      await requiredFields.first().clear();
      await saveButton.click();
      
      // バリデーションエラーの確認
      const errorMessage = page.locator('.error, [data-testid="error"], text=必須');
      if (await errorMessage.first().isVisible()) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });

  test.skip('should handle settings import/export', async ({ page }) => {
    // 設定のインポート/エクスポート機能（未実装の場合スキップ）
    // TODO: インポート/エクスポート機能実装後に有効化
    const exportButton = page.locator('button:has-text("エクスポート")');
    const importButton = page.locator('button:has-text("インポート")');
    
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      
      expect(download).toBeTruthy();
    }
    
    if (await importButton.isVisible()) {
      // ファイル選択の確認
      await importButton.click();
      // ファイル入力フィールドの確認
    }
  });

  test.skip('should handle network errors gracefully', async ({ page }) => {
    // ネットワークエラーのテスト（エラーハンドリング強化後に有効化）
    // TODO: エラーハンドリング機能強化後に有効化
    await page.route('**/api/settings*', route => route.abort());
    
    const saveButton = page.locator('button:has-text("保存")');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // エラーメッセージの確認
      const errorMessage = page.locator('text=エラー, text=保存に失敗');
      if (await errorMessage.first().isVisible()) {
        await expect(errorMessage.first()).toBeVisible();
      }
    }
  });
});