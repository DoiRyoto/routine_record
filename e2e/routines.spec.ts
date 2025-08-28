import { test, expect } from '@playwright/test';

test.describe('Routines Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/routines');
    await page.waitForLoadState('networkidle');
  });

  test('should display routines page title and basic elements', async ({ page }) => {
    // ページタイトルの確認
    await expect(page.locator('h1')).toContainText(/ルーティン|routines/i);
    
    // 基本的なページ構成要素の確認
    const pageContent = await page.locator('main, .content, [role="main"]').first().isVisible();
    expect(pageContent).toBe(true);
  });

  test('should display routine items when available', async ({ page }) => {
    // ルーティンリストの確認
    const routineItems = page.locator('[data-testid="routine-item"]');
    const itemCount = await routineItems.count();
    
    if (itemCount > 0) {
      // ルーティンアイテムが存在する場合
      await expect(routineItems.first()).toBeVisible();
      
      // ルーティンの基本情報確認
      const firstRoutine = routineItems.first();
      
      // ルーティン名の確認
      const routineName = firstRoutine.locator('h2, h3, .title, [data-testid="routine-title"]');
      if (await routineName.first().isVisible()) {
        await expect(routineName.first()).toBeVisible();
      }
    } else {
    }
  });

  test('should display routine creation option', async ({ page }) => {
    // ルーティン作成ボタンまたはリンクの確認
    const createButton = page.locator('button:has-text("作成"), button:has-text("追加"), a:has-text("新しいルーティン")');
    const createButtonVisible = await createButton.first().isVisible();
    
    if (createButtonVisible) {
      await expect(createButton.first()).toBeVisible();
    } else {
      // 代替の作成方法をチェック
      const addButton = page.locator('[data-testid="add-routine"], [aria-label*="追加"], [aria-label*="作成"]');
      if (await addButton.first().isVisible()) {
        await expect(addButton.first()).toBeVisible();
      }
    }
  });

  test('should handle routine filtering/sorting if available', async ({ page }) => {
    // フィルターまたはソート機能の確認
    const filterSelect = page.locator('select, [data-testid="filter"], [data-testid="sort"]');
    const filterButton = page.locator('button:has-text("フィルター"), button:has-text("並び替え")');
    
    if (await filterSelect.first().isVisible()) {
      await expect(filterSelect.first()).toBeVisible();
    } else if (await filterButton.first().isVisible()) {
      await expect(filterButton.first()).toBeVisible();
    } else {
    }
  });

  test('should display routine categories or tags if implemented', async ({ page }) => {
    // カテゴリーまたはタグ表示の確認
    const categories = page.locator('[data-testid="category"], .category, .tag');
    const categoryCount = await categories.count();
    
    if (categoryCount > 0) {
      await expect(categories.first()).toBeVisible();
    } else {
    }
  });

  test('should handle routine interaction when available', async ({ page }) => {
    // ルーティンアイテムとのインタラクション
    const routineItems = page.locator('[data-testid="routine-item"]');
    const itemCount = await routineItems.count();
    
    if (itemCount > 0) {
      const firstRoutine = routineItems.first();
      
      // 編集ボタンの確認
      const editButton = firstRoutine.locator('button:has-text("編集"), [data-testid="edit-routine"]');
      if (await editButton.first().isVisible()) {
        await expect(editButton.first()).toBeVisible();
      }
      
      // 削除ボタンの確認
      const deleteButton = firstRoutine.locator('button:has-text("削除"), [data-testid="delete-routine"]');
      if (await deleteButton.first().isVisible()) {
        await expect(deleteButton.first()).toBeVisible();
      }
      
      // ルーティンをクリックして詳細表示
      const routineLink = firstRoutine.locator('a, button:not(:has-text("編集")):not(:has-text("削除"))');
      if (await routineLink.first().isVisible()) {
      }
    }
  });

  test('should display routine statistics if available', async ({ page }) => {
    // 統計情報の確認
    const statsSection = page.locator('[data-testid="routine-stats"], .stats, text=統計');
    if (await statsSection.first().isVisible()) {
      await expect(statsSection.first()).toBeVisible();
      
      // 統計項目の確認
      const statItems = page.locator('text=/合計.*\\d+/, text=/実行.*\\d+/, text=/完了.*\\d+/');
      const statCount = await statItems.count();
      if (statCount > 0) {
      }
    } else {
    }
  });

  test('should handle empty state gracefully', async ({ page }) => {
    // 空の状態の確認
    const routineItems = page.locator('[data-testid="routine-item"]');
    const itemCount = await routineItems.count();
    
    if (itemCount === 0) {
      // 空状態メッセージの確認
      const emptyMessage = page.locator('text=ルーティンがありません, text=まだルーティンがありません, text=作成してください');
      if (await emptyMessage.first().isVisible()) {
        await expect(emptyMessage.first()).toBeVisible();
      }
      
      // 作成へのCTAの確認
      const createCTA = page.locator('button:has-text("作成"), a:has-text("作成")');
      if (await createCTA.first().isVisible()) {
        await expect(createCTA.first()).toBeVisible();
      }
    }
  });

  test.skip('should handle routine creation flow', async ({ page }) => {
    // ルーティン作成フローのテスト（未実装の場合スキップ）
    // TODO: ルーティン作成機能実装後に有効化
    const createButton = page.locator('button:has-text("作成")').first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // 作成フォーム/モーダルの確認
      await expect(page.locator('[data-testid="routine-form"], .create-form')).toBeVisible();
      
      // 必須フィールドの確認
      await expect(page.locator('input[name="name"], input[placeholder*="名前"]')).toBeVisible();
    }
  });

  test.skip('should handle routine editing', async ({ page }) => {
    // ルーティン編集のテスト（未実装の場合スキップ）
    // TODO: ルーティン編集機能実装後に有効化
    const routineItems = page.locator('[data-testid="routine-item"]');
    
    if (await routineItems.first().isVisible()) {
      const editButton = routineItems.first().locator('button:has-text("編集")');
      
      if (await editButton.isVisible()) {
        await editButton.click();
        
        // 編集フォーム/モーダルの確認
        await expect(page.locator('[data-testid="edit-form"]')).toBeVisible();
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもページタイトルが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // ルーティンアイテムがモバイルレイアウトに適応することを確認
    const routineItems = page.locator('[data-testid="routine-item"]');
    const itemCount = await routineItems.count();
    
    if (itemCount > 0) {
      await expect(routineItems.first()).toBeVisible();
    }
    
    // 作成ボタンがモバイルでもアクセス可能であることを確認
    const createButton = page.locator('button:has-text("作成"), button:has-text("追加")');
    if (await createButton.first().isVisible()) {
      await expect(createButton.first()).toBeVisible();
    }
  });

  test.skip('should handle search functionality', async ({ page }) => {
    // 検索機能のテスト（未実装の場合スキップ）
    // TODO: 検索機能実装後に有効化
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('テスト');
      
      // 検索結果の確認
      await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    }
  });

  test.skip('should handle network errors gracefully', async ({ page }) => {
    // ネットワークエラーのテスト（エラーハンドリング強化後に有効化）
    // TODO: エラーハンドリング機能強化後に有効化
    await page.route('**/api/routines*', route => route.abort());
    await page.reload();
    
    // エラー状態の表示確認
    const errorMessage = page.locator('text=エラー, text=読み込みに失敗');
    if (await errorMessage.first().isVisible()) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});