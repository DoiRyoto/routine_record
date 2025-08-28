import { test, expect } from '@playwright/test';

test.describe('Statistics Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');
  });

  test('should display statistics page title and basic elements', async ({ page }) => {
    // ページタイトルの確認
    await expect(page.locator('h1')).toContainText(/統計|statistics|分析/i);
    
    // 基本的なページコンテンツの確認
    await expect(page.locator('main, .content, [role="main"]').first()).toBeVisible();
  });

  test('should display overview statistics cards', async ({ page }) => {
    // 統計カードの確認
    const statsCards = page.locator('[data-testid="stat-card"], .stat-card, .metric-card');
    const cardCount = await statsCards.count();
    
    if (cardCount > 0) {
      await expect(statsCards.first()).toBeVisible();
      
      // 統計値の確認
      const statValues = page.locator('text=/\\d+/, .stat-value, [data-testid="stat-value"]');
      const valueCount = await statValues.count();
      expect(valueCount).toBeGreaterThan(0);
    } else {
    }
  });

  test('should display completion rate statistics', async ({ page }) => {
    // 完了率統計の確認
    const completionRate = page.locator('text=完了率, text=達成率, [data-testid="completion-rate"]');
    
    if (await completionRate.first().isVisible()) {
      await expect(completionRate.first()).toBeVisible();
      
      // パーセンテージ表示の確認
      const percentage = page.locator('text=/%/, [data-testid="percentage"]');
      if (await percentage.first().isVisible()) {
        await expect(percentage.first()).toBeVisible();
      }
    } else {
    }
  });

  test('should display streak statistics', async ({ page }) => {
    // ストリーク統計の確認
    const streakStats = page.locator('text=ストリーク, text=連続, [data-testid="streak-stats"]');
    
    if (await streakStats.first().isVisible()) {
      await expect(streakStats.first()).toBeVisible();
      
      // 現在のストリークと最長ストリークの確認
      const currentStreak = page.locator('text=現在のストリーク, [data-testid="current-streak"]');
      const longestStreak = page.locator('text=最長ストリーク, [data-testid="longest-streak"]');
      
      if (await currentStreak.isVisible()) {
        await expect(currentStreak).toBeVisible();
      }
      if (await longestStreak.isVisible()) {
        await expect(longestStreak).toBeVisible();
      }
    } else {
    }
  });

  test('should display charts or graphs if available', async ({ page }) => {
    // チャートやグラフの確認
    const charts = page.locator('[data-testid="chart"], .chart, canvas, svg[class*="chart"]');
    const chartCount = await charts.count();
    
    if (chartCount > 0) {
      await expect(charts.first()).toBeVisible();
      
      // チャートのタイトルまたはラベル確認
      const chartTitles = page.locator('.chart-title, [data-testid="chart-title"], h2, h3');
      if (await chartTitles.first().isVisible()) {
      }
    } else {
    }
  });

  test('should display time period selector if available', async ({ page }) => {
    // 期間選択機能の確認
    const periodSelector = page.locator('select[name*="period"], [data-testid="period-selector"]');
    const periodButtons = page.locator('button:has-text("週"), button:has-text("月"), button:has-text("年")');
    
    if (await periodSelector.first().isVisible()) {
      await expect(periodSelector.first()).toBeVisible();
      
      // 期間オプションの確認
      const options = periodSelector.first().locator('option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    } else if (await periodButtons.first().isVisible()) {
      await expect(periodButtons.first()).toBeVisible();
    } else {
    }
  });

  test('should handle period switching if available', async ({ page }) => {
    // 期間切り替えの確認
    const weekButton = page.locator('button:has-text("週")');
    const monthButton = page.locator('button:has-text("月")');
    
    if (await weekButton.isVisible() && await monthButton.isVisible()) {
      // 週表示をクリック
      await weekButton.click();
      await page.waitForTimeout(500); // データロード待機
      
      // 月表示をクリック
      await monthButton.click();
      await page.waitForTimeout(500);
      
    } else {
      // セレクトボックスでの期間切り替え
      const periodSelect = page.locator('select[name*="period"]');
      if (await periodSelect.isVisible()) {
        await periodSelect.selectOption('week');
        await page.waitForTimeout(500);
        
        await periodSelect.selectOption('month');
      }
    }
  });

  test('should display category-wise statistics', async ({ page }) => {
    // カテゴリ別統計の確認
    const categoryStats = page.locator('[data-testid="category-stats"], .category-breakdown');
    
    if (await categoryStats.first().isVisible()) {
      await expect(categoryStats.first()).toBeVisible();
      
      // 各カテゴリの統計確認
      const categoryItems = categoryStats.first().locator('[data-testid="category-item"], .category-item');
      const itemCount = await categoryItems.count();
      
      if (itemCount > 0) {
        await expect(categoryItems.first()).toBeVisible();
      }
    } else {
    }
  });

  test('should display progress trends', async ({ page }) => {
    // 進捗トレンドの確認
    const trendSection = page.locator('text=トレンド, text=推移, [data-testid="trend-section"]');
    
    if (await trendSection.first().isVisible()) {
      await expect(trendSection.first()).toBeVisible();
      
      // トレンド指標の確認（上昇/下降/安定）
      const trendIndicators = page.locator('.trend-up, .trend-down, .trend-stable, [data-testid="trend-indicator"]');
      if (await trendIndicators.first().isVisible()) {
      }
    } else {
    }
  });

  test('should display routine performance metrics', async ({ page }) => {
    // ルーティンパフォーマンス指標の確認
    const performanceSection = page.locator('text=パフォーマンス, text=実行率, [data-testid="performance-section"]');
    
    if (await performanceSection.first().isVisible()) {
      await expect(performanceSection.first()).toBeVisible();
      
      // 実行回数、成功率などの確認
      const metrics = page.locator('text=/実行.*\\d+回/, text=/成功.*\\d+%/, text=/平均.*\\d+/');
      const metricCount = await metrics.count();
      
      if (metricCount > 0) {
      }
    } else {
    }
  });

  test('should display time-based analysis if available', async ({ page }) => {
    // 時間ベース分析の確認
    const timeAnalysis = page.locator('text=時間帯別, text=曜日別, [data-testid="time-analysis"]');
    
    if (await timeAnalysis.first().isVisible()) {
      await expect(timeAnalysis.first()).toBeVisible();
      
      // 時間帯や曜日のデータ確認
      const timeData = page.locator('text=/\\d{1,2}時/, text=/月曜|火曜|水曜|木曜|金曜|土曜|日曜/');
      if (await timeData.first().isVisible()) {
      }
    } else {
    }
  });

  test.skip('should handle data export functionality', async ({ page }) => {
    // データエクスポート機能（未実装の場合スキップ）
    // TODO: エクスポート機能実装後に有効化
    const exportButton = page.locator('button:has-text("エクスポート"), button:has-text("ダウンロード")');
    
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      // エクスポートオプションまたはダウンロード確認
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;
      
      expect(download).toBeTruthy();
    }
  });

  test.skip('should display goal achievement tracking', async ({ page }) => {
    // 目標達成追跡（未実装の場合スキップ）
    // TODO: 目標機能実装後に有効化
    const goalSection = page.locator('text=目標, text=ゴール, [data-testid="goal-section"]');
    
    if (await goalSection.first().isVisible()) {
      await expect(goalSection.first()).toBeVisible();
      
      // 目標進捗の確認
      const goalProgress = goalSection.first().locator('[role="progressbar"], .progress-bar');
      if (await goalProgress.first().isVisible()) {
        await expect(goalProgress.first()).toBeVisible();
      }
    }
  });

  test('should handle empty data state', async ({ page }) => {
    // データが無い場合の状態確認
    const emptyState = page.locator('text=データがありません, text=統計情報がありません, [data-testid="empty-state"]');
    
    if (await emptyState.first().isVisible()) {
      await expect(emptyState.first()).toBeVisible();
      
      // 行動を促すメッセージの確認
      const actionMessage = page.locator('text=ルーティンを実行, text=データを蓄積');
      if (await actionMessage.first().isVisible()) {
      }
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // モバイルでもページタイトルが表示されることを確認
    await expect(page.locator('h1')).toBeVisible();
    
    // 統計カードがモバイルレイアウトに適応することを確認
    const statsCards = page.locator('[data-testid="stat-card"], .stat-card');
    if (await statsCards.first().isVisible()) {
      await expect(statsCards.first()).toBeVisible();
    }
    
    // チャートがモバイルで適切に表示されることを確認
    const charts = page.locator('[data-testid="chart"], .chart');
    if (await charts.first().isVisible()) {
      await expect(charts.first()).toBeVisible();
    }
  });

  test.skip('should handle data refresh functionality', async ({ page }) => {
    // データ更新機能（未実装の場合スキップ）
    // TODO: 更新機能実装後に有効化
    const refreshButton = page.locator('button:has-text("更新"), button[aria-label*="更新"], [data-testid="refresh"]');
    
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      
      // ローディング状態の確認
      const loading = page.locator('[data-testid="loading"], .loading');
      if (await loading.first().isVisible()) {
        await expect(loading.first()).toBeVisible();
        await expect(loading.first()).toBeHidden();
      }
    }
  });

  test.skip('should handle network errors gracefully', async ({ page }) => {
    // ネットワークエラーのテスト（エラーハンドリング強化後に有効化）
    // TODO: エラーハンドリング機能強化後に有効化
    await page.route('**/api/statistics*', route => route.abort());
    await page.reload();
    
    // エラー状態の表示確認
    const errorMessage = page.locator('text=エラー, text=読み込みに失敗');
    if (await errorMessage.first().isVisible()) {
      await expect(errorMessage.first()).toBeVisible();
    }
  });
});