/**
 * TASK-109: 統計・分析API実装 - ルーチン分析API テストファイル (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { GET } from '../routines/route';

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
  getRoutineStatistics: jest.fn(),
  getRoutineTimeSeries: jest.fn(),
  getRoutinePatterns: jest.fn(),
  getRoutineComparison: jest.fn(),
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

describe('GET /api/statistics/routines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Routine Statistics', () => {
    it('should return detailed statistics for each routine', async () => {
      // Given: ルーチン統計データ
      const mockRoutineStatistics = [
        {
          routineId: 'routine123',
          routineName: '朝の運動',
          categoryId: 'health',
          statistics: {
            totalExecutions: 3,
            averageExecutionTime: 30.0,
            lastExecutionDate: '2024-01-16',
            currentStreak: 3,
            longestStreak: 3,
            successRate: 100.0
          }
        }
      ];

      const { getRoutineStatistics } = require('@/lib/db/queries/statistics');
      getRoutineStatistics.mockResolvedValue(mockRoutineStatistics);

      // When: ルーチン分析APIを呼び出す
      const searchParams = new URLSearchParams({ routineId: 'routine123' });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: ルーチン別詳細統計が返される
      expect(response.status).toBe(200);
      expect(responseData.routines).toEqual(mockRoutineStatistics);
    });

    it('should return statistics for all routines when no specific routine is requested', async () => {
      // Given: 全ルーチンの統計データ
      const mockAllRoutineStatistics = [
        {
          routineId: 'routine123',
          routineName: '朝の運動',
          categoryId: 'health',
          statistics: { totalExecutions: 30, averageExecutionTime: 25.0 }
        },
        {
          routineId: 'routine456',
          routineName: '読書',
          categoryId: 'personal',
          statistics: { totalExecutions: 20, averageExecutionTime: 45.0 }
        }
      ];

      const { getRoutineStatistics } = require('@/lib/db/queries/statistics');
      getRoutineStatistics.mockResolvedValue(mockAllRoutineStatistics);

      // When: 全ルーチンの統計を要求
      const request = createMockRequest('/api/statistics/routines');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 全ルーチンの統計が返される
      expect(response.status).toBe(200);
      expect(responseData.routines).toHaveLength(2);
    });
  });

  describe('Time Series Data', () => {
    it('should return time series data for routine executions', async () => {
      // Given: 時系列データ
      const mockTimeSeries = [
        { date: '2024-01-16', executions: 1, duration: 30 },
        { date: '2024-01-15', executions: 1, duration: 25 },
        { date: '2024-01-14', executions: 0, duration: 0 }
      ];

      const { getRoutineTimeSeries } = require('@/lib/db/queries/statistics');
      getRoutineTimeSeries.mockResolvedValue(mockTimeSeries);

      // When: 時系列分析を要求
      const searchParams = new URLSearchParams({
        period: 'month',
        include: 'timeSeries'
      });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 時系列データが返される
      expect(response.status).toBe(200);
      expect(responseData.routines[0].timeSeries).toEqual(mockTimeSeries);
    });
  });

  describe('Execution Patterns', () => {
    it('should analyze weekday execution patterns', async () => {
      // Given: 曜日別実行パターン
      const mockPatterns = {
        weekdayDistribution: {
          monday: 8, tuesday: 7, wednesday: 6, thursday: 9,
          friday: 5, saturday: 3, sunday: 2
        },
        hourDistribution: {
          '06': 12, '07': 18, '08': 15, '09': 8, '10': 5
        }
      };

      const { getRoutinePatterns } = require('@/lib/db/queries/statistics');
      getRoutinePatterns.mockResolvedValue(mockPatterns);

      // When: パターン分析を要求
      const searchParams = new URLSearchParams({ include: 'patterns' });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 実行パターンが分析される
      expect(response.status).toBe(200);
      expect(responseData.routines[0].patterns).toEqual(mockPatterns);
    });
  });

  describe('Comparison Analysis', () => {
    it('should compare statistics with previous period', async () => {
      // Given: 期間比較データ
      const mockComparison = {
        previousPeriod: {
          totalExecutions: 38,
          averageExecutionTime: 27.2,
          changePercentage: 18.4
        },
        categoryRanking: [
          { category: 'health', rank: 1, executions: 45 },
          { category: 'work', rank: 2, executions: 32 },
          { category: 'personal', rank: 3, executions: 18 }
        ]
      };

      const { getRoutineComparison } = require('@/lib/db/queries/statistics');
      getRoutineComparison.mockResolvedValue(mockComparison);

      // When: 期間比較分析を要求
      const searchParams = new URLSearchParams({
        period: 'month',
        include: 'comparison'
      });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 比較データが返される
      expect(response.status).toBe(200);
      expect(responseData.comparison).toEqual(mockComparison);
    });
  });

  describe('Sorting and Filtering', () => {
    it('should sort routines by executions', async () => {
      // Given: ソート用のルーチンデータ
      const mockSortedRoutines = [
        { routineId: 'r1', statistics: { totalExecutions: 50 } },
        { routineId: 'r2', statistics: { totalExecutions: 30 } },
        { routineId: 'r3', statistics: { totalExecutions: 10 } }
      ];

      const { getRoutineStatistics } = require('@/lib/db/queries/statistics');
      getRoutineStatistics.mockResolvedValue(mockSortedRoutines);

      // When: 実行回数でソートを要求
      const searchParams = new URLSearchParams({ sort: 'executions' });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 実行回数順にソートされる
      expect(response.status).toBe(200);
      expect(responseData.routines[0].statistics.totalExecutions).toBeGreaterThan(
        responseData.routines[1].statistics.totalExecutions
      );
    });

    it('should limit results when limit parameter is provided', async () => {
      // Given: 多数のルーチンデータ
      const mockManyRoutines = Array(100).fill(null).map((_, i) => ({
        routineId: `routine${i}`,
        statistics: { totalExecutions: i }
      }));

      const { getRoutineStatistics } = require('@/lib/db/queries/statistics');
      getRoutineStatistics.mockResolvedValue(mockManyRoutines.slice(0, 10));

      // When: 制限数を指定して要求
      const searchParams = new URLSearchParams({ limit: '10' });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 指定された件数で制限される
      expect(response.status).toBe(200);
      expect(responseData.routines).toHaveLength(10);
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent routine ID', async () => {
      // Given: 存在しないルーチンID
      const { getRoutineStatistics } = require('@/lib/db/queries/statistics');
      getRoutineStatistics.mockResolvedValue([]);

      // When: 存在しないルーチンの統計を要求
      const searchParams = new URLSearchParams({ routineId: 'non-existent-routine' });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 404エラーが返される
      expect(response.status).toBe(404);
      expect(responseData.error).toEqual({
        code: 'ROUTINE_NOT_FOUND',
        message: "Routine with ID 'non-existent-routine' not found",
        routineId: 'non-existent-routine'
      });
    });

    it('should handle invalid sort parameter', async () => {
      // Given: 無効なソートパラメータ
      const searchParams = new URLSearchParams({ sort: 'invalid_sort' });
      const request = createMockRequest('/api/statistics/routines', searchParams);
      
      // When: 無効なソートパラメータでAPIを呼び出す
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 適切なエラーメッセージが返される
      expect(response.status).toBe(400);
      expect(responseData.error).toEqual({
        code: 'INVALID_PARAMETER',
        message: 'Invalid sort parameter. Must be one of: executions, duration, streak',
        field: 'sort'
      });
    });

    it('should handle database errors gracefully', async () => {
      // Given: データベースエラー
      const { getRoutineStatistics } = require('@/lib/db/queries/statistics');
      getRoutineStatistics.mockRejectedValue(new Error('Database query failed'));

      // When: APIを呼び出す
      const request = createMockRequest('/api/statistics/routines');
      const response = await GET(request);
      const responseData = await response.json();

      // Then: 適切なエラーハンドリング
      expect(response.status).toBe(500);
      expect(responseData.error).toEqual({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve routine statistics'
      });
    });
  });

  describe('Performance', () => {
    it('should handle large dataset requests efficiently', async () => {
      // Given: 大量のルーチンデータ
      const largeDataset = Array(1000).fill(null).map((_, i) => ({
        routineId: `routine${i}`,
        statistics: { totalExecutions: Math.floor(Math.random() * 100) }
      }));

      const { getRoutineStatistics } = require('@/lib/db/queries/statistics');
      getRoutineStatistics.mockResolvedValue(largeDataset);

      // When: 大量データでAPIを呼び出す
      const startTime = Date.now();
      const request = createMockRequest('/api/statistics/routines');
      const response = await GET(request);
      const responseTime = Date.now() - startTime;

      // Then: 合理的な時間内で応答
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // 1秒以内
    });
  });
});