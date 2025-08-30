/**
 * TASK-109: 統計・分析API実装 - ダッシュボード統計API テストファイル (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '../dashboard/route';

// Supabase モックセットアップ
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'user123', email: 'test@example.com' } },
        error: null
      }),
    },
  })),
}));

// Statistics Service モック
jest.mock('@/lib/db/queries/statistics', () => ({
  getDashboardStatistics: jest.fn(),
  getWeeklyProgress: jest.fn(),
  getMonthlyProgress: jest.fn(),
  getCategoryDistribution: jest.fn(),
  getPerformanceMetrics: jest.fn(),
}));

// Next.js cookies モック
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// テストユーティリティ関数
function createMockRequest(path: string, searchParams?: URLSearchParams): NextRequest {
  let url = `http://localhost:3000${path}`;
  if (searchParams) {
    url += `?${searchParams.toString()}`;
  }
  
  return new NextRequest(url, { method: 'GET' });
}

describe('GET /api/statistics/dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Statistics', () => {
    it('should return basic statistics for authenticated user', async () => {
      // Given: ユーザーが複数の実行記録を持つ
      const mockStatistics = {
        todayExecutions: 2,
        weekExecutions: 3,
        monthExecutions: 3,
        totalExecutions: 3,
        activeRoutines: 2,
        currentStreak: 2
      };

      const { getDashboardStatistics } = require('@/lib/db/queries/statistics');
      getDashboardStatistics.mockResolvedValue(mockStatistics);

      // When: ダッシュボード統計APIを呼び出す
      const request = createMockRequest('/api/statistics/dashboard');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 基本統計情報が返される
      expect(response.status).toBe(200);
      expect(responseData.summary).toEqual(mockStatistics);
    });

    it('should return zero statistics when no execution records exist', async () => {
      // Given: ユーザーが実行記録を持たない
      const mockEmptyStatistics = {
        todayExecutions: 0,
        weekExecutions: 0,
        monthExecutions: 0,
        totalExecutions: 0,
        activeRoutines: 0,
        currentStreak: 0
      };

      const { getDashboardStatistics } = require('@/lib/db/queries/statistics');
      getDashboardStatistics.mockResolvedValue(mockEmptyStatistics);

      // When: ダッシュボード統計APIを呼び出す
      const request = createMockRequest('/api/statistics/dashboard');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: ゼロ値の統計情報が返される
      expect(response.status).toBe(200);
      expect(responseData.summary).toEqual(mockEmptyStatistics);
    });
  });

  describe('Weekly Progress', () => {
    it('should return weekly progress data for the last 7 days', async () => {
      // Given: 過去7日間の進捗データ
      const mockWeeklyProgress = [
        { date: '2024-01-16', executions: 3, duration: 85 },
        { date: '2024-01-15', executions: 2, duration: 55 },
        { date: '2024-01-14', executions: 1, duration: 30 },
        { date: '2024-01-13', executions: 0, duration: 0 },
        { date: '2024-01-12', executions: 2, duration: 60 },
        { date: '2024-01-11', executions: 1, duration: 25 },
        { date: '2024-01-10', executions: 3, duration: 90 }
      ];

      const { getWeeklyProgress } = require('@/lib/db/queries/statistics');
      getWeeklyProgress.mockResolvedValue(mockWeeklyProgress);

      // When: 週次進捗データを要求
      const searchParams = new URLSearchParams({ period: 'week' });
      const request = createMockRequest('/api/statistics/dashboard', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 7日分の日別進捗データが返される
      expect(response.status).toBe(200);
      expect(responseData.progress.weeklyProgress).toHaveLength(7);
      expect(responseData.progress.weeklyProgress[0]).toEqual({
        date: '2024-01-16',
        executions: 3,
        duration: 85
      });
    });
  });

  describe('Monthly Progress', () => {
    it('should return monthly progress data grouped by weeks', async () => {
      // Given: 過去1ヶ月の週別進捗データ
      const mockMonthlyProgress = [
        { week: '2024-W03', executions: 15, duration: 420 },
        { week: '2024-W02', executions: 12, duration: 350 },
        { week: '2024-W01', executions: 8, duration: 240 },
        { week: '2023-W52', executions: 10, duration: 300 }
      ];

      const { getMonthlyProgress } = require('@/lib/db/queries/statistics');
      getMonthlyProgress.mockResolvedValue(mockMonthlyProgress);

      // When: 月次進捗データを要求
      const searchParams = new URLSearchParams({ period: 'month' });
      const request = createMockRequest('/api/statistics/dashboard', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 週別の進捗データが返される
      expect(response.status).toBe(200);
      expect(responseData.progress.monthlyProgress).toHaveLength(4);
      expect(responseData.progress.monthlyProgress[0]).toEqual({
        week: '2024-W03',
        executions: 15,
        duration: 420
      });
    });
  });

  describe('Category Distribution', () => {
    it('should calculate category distribution with correct percentages', async () => {
      // Given: カテゴリ別実行データ
      const mockCategoryDistribution = [
        {
          categoryId: 'health',
          categoryName: '健康',
          executions: 30,
          percentage: 50.0,
          averageDuration: 25.0
        },
        {
          categoryId: 'work',
          categoryName: '仕事',
          executions: 20,
          percentage: 33.3,
          averageDuration: 45.0
        },
        {
          categoryId: 'personal',
          categoryName: '個人',
          executions: 10,
          percentage: 16.7,
          averageDuration: 15.0
        }
      ];

      const { getCategoryDistribution } = require('@/lib/db/queries/statistics');
      getCategoryDistribution.mockResolvedValue(mockCategoryDistribution);

      // When: カテゴリ別分布を要求
      const request = createMockRequest('/api/statistics/dashboard');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: カテゴリ別統計と割合が正確に計算される
      expect(response.status).toBe(200);
      expect(responseData.categories).toEqual(mockCategoryDistribution);
    });
  });

  describe('Performance Metrics', () => {
    it('should calculate average execution time correctly', async () => {
      // Given: パフォーマンス指標
      const mockPerformanceMetrics = {
        averageExecutionTime: 30.0,
        longestStreak: 23,
        weeklyFrequency: 4.2,
        completionRate: 78.5
      };

      const { getPerformanceMetrics } = require('@/lib/db/queries/statistics');
      getPerformanceMetrics.mockResolvedValue(mockPerformanceMetrics);

      // When: パフォーマンス指標を取得
      const request = createMockRequest('/api/statistics/dashboard');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: パフォーマンス指標が正確に計算される
      expect(response.status).toBe(200);
      expect(responseData.performance).toEqual(mockPerformanceMetrics);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid period parameter', async () => {
      // Given: 無効な期間パラメータ
      const searchParams = new URLSearchParams({ period: 'invalid' });
      const request = createMockRequest('/api/statistics/dashboard', searchParams);
      
      // When: 無効なパラメータでAPIを呼び出す
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 適切なエラーメッセージが返される
      expect(response.status).toBe(400);
      expect(responseData.error).toEqual({
        code: 'INVALID_PARAMETER',
        message: 'Invalid period parameter. Must be one of: day, week, month, year',
        field: 'period'
      });
    });

    it('should handle unauthorized access', async () => {
      // Given: 認証エラーをモック
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid token' }
          }),
        },
      });

      // When: 認証なしでAPIを呼び出す
      const request = createMockRequest('/api/statistics/dashboard');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 認証エラーが返される
      expect(response.status).toBe(401);
      expect(responseData.error).toEqual({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired authentication token'
      });
    });

    it('should handle database errors gracefully', async () => {
      // Given: データベースエラー
      const { getDashboardStatistics } = require('@/lib/db/queries/statistics');
      getDashboardStatistics.mockRejectedValue(new Error('Database connection failed'));

      // Reset auth mock to return valid user
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      // When: APIを呼び出す
      const request = createMockRequest('/api/statistics/dashboard');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 適切なエラーハンドリング
      expect(response.status).toBe(500);
      expect(responseData.error).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve dashboard statistics'
      });
    });
  });

  describe('Timezone Handling', () => {
    it('should calculate statistics correctly for different timezones', async () => {
      // Given: タイムゾーン指定
      const mockStatistics = {
        todayExecutions: 1,
        weekExecutions: 3,
        monthExecutions: 15,
        totalExecutions: 150,
        activeRoutines: 5,
        currentStreak: 2
      };

      const { getDashboardStatistics } = require('@/lib/db/queries/statistics');
      getDashboardStatistics.mockResolvedValue(mockStatistics);

      // Reset auth mock to return valid user
      const { createServerClient } = require('@supabase/ssr');
      createServerClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user123', email: 'test@example.com' } },
            error: null
          }),
        },
      });

      // When: 異なるタイムゾーンで統計を要求
      const searchParams = new URLSearchParams({ timezone: 'Asia/Tokyo' });
      const request = createMockRequest('/api/statistics/dashboard', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: タイムゾーンを考慮した統計が返される
      expect(response.status).toBe(200);
      expect(getDashboardStatistics).toHaveBeenCalledWith(
        expect.any(String), // userId
        expect.objectContaining({ timezone: 'Asia/Tokyo' })
      );
    });
  });
});