import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { StatisticsCalculationService } from '../StatisticsCalculationService';
import { IExecutionRecordRepository } from '../../repositories/IExecutionRecordRepository';
import { ICategoryRepository } from '../../repositories/ICategoryRepository';
import { IRoutineRepository } from '../../repositories/IRoutineRepository';

describe('StatisticsCalculationService', () => {
  let service: StatisticsCalculationService;
  let mockExecutionRecordRepository: jest.Mocked<IExecutionRecordRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;
  let mockRoutineRepository: jest.Mocked<IRoutineRepository>;

  beforeEach(() => {
    mockExecutionRecordRepository = {
      getByUserId: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getByUserAndDateRange: jest.fn(),
      getByUserAndMissionPeriod: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByRoutineId: jest.fn(),
      findByUserIdAndRoutineId: jest.fn(),
      findByUserIdAndDateRange: jest.fn(),
      findByRoutineIdAndDateRange: jest.fn(),
      findByUserIdAndDate: jest.fn(),
      save: jest.fn(),
      existsTodayByRoutineId: jest.fn(),
      existsByRoutineIdAndDate: jest.fn(),
      countByUserId: jest.fn(),
      countByRoutineId: jest.fn(),
      countByUserIdAndDateRange: jest.fn(),
      findLatestStreakByRoutineId: jest.fn(),
      findWeeklyByUserIdAndWeek: jest.fn(),
      findMonthlyByUserIdAndMonth: jest.fn(),
    } as jest.Mocked<IExecutionRecordRepository>;

    mockCategoryRepository = {
      getById: jest.fn(),
      getByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<ICategoryRepository>;

    mockRoutineRepository = {
      getById: jest.fn(),
      getByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getActiveByUserId: jest.fn(),
    } as jest.Mocked<IRoutineRepository>;

    // Mock current time to 2024-01-16T12:00:00Z for consistent testing
    const mockCurrentTime = () => new Date('2024-01-16T12:00:00Z');
    
    service = new StatisticsCalculationService(
      mockExecutionRecordRepository,
      mockCategoryRepository,
      mockRoutineRepository,
      mockCurrentTime
    );
  });

  describe('Dashboard Statistics Calculation', () => {
    it('should calculate basic dashboard statistics correctly', async () => {
      // Given: ユーザーの実行記録
      const userId = 'user123';
      const today = new Date('2024-01-16');
      const executionRecords = [
        {
          id: 'exec1',
          userId,
          routineId: 'routine1',
          executedAt: new Date('2024-01-16T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec2',
          userId,
          routineId: 'routine2',
          executedAt: new Date('2024-01-16T10:00:00Z'),
          duration: 25,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec3',
          userId,
          routineId: 'routine1',
          executedAt: new Date('2024-01-15T09:00:00Z'),
          duration: 28,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const activeRoutines = [
        { id: 'routine1', name: 'Morning Exercise' },
        { id: 'routine2', name: 'Reading' }
      ];

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(executionRecords);
      mockRoutineRepository.getActiveByUserId.mockResolvedValue(activeRoutines);

      // When: ダッシュボード統計を計算
      const result = await service.calculateDashboardStatistics(userId, { timezone: 'UTC' });

      // Then: 正確な統計が計算される
      expect(result).toEqual({
        todayExecutions: 2,
        weekExecutions: 3,
        monthExecutions: 3,
        totalExecutions: 3,
        activeRoutines: 2,
        currentStreak: 2
      });
    });

    it('should handle empty data correctly', async () => {
      // Given: 実行記録がないユーザー
      const userId = 'newUser';
      
      mockExecutionRecordRepository.getByUserId.mockResolvedValue([]);
      mockRoutineRepository.getActiveByUserId.mockResolvedValue([]);

      // When: 統計を計算
      const result = await service.calculateDashboardStatistics(userId, { timezone: 'UTC' });

      // Then: ゼロ値の統計が返される
      expect(result).toEqual({
        todayExecutions: 0,
        weekExecutions: 0,
        monthExecutions: 0,
        totalExecutions: 0,
        activeRoutines: 0,
        currentStreak: 0
      });
    });
  });

  describe('Weekly Progress Calculation', () => {
    it('should calculate weekly progress for last 7 days', async () => {
      // Given: 過去7日間の実行記録
      const userId = 'user123';
      const weeklyRecords = [
        { executedAt: new Date('2024-01-16T09:00:00Z'), duration: 30 },
        { executedAt: new Date('2024-01-16T10:00:00Z'), duration: 25 },
        { executedAt: new Date('2024-01-15T09:00:00Z'), duration: 30 },
        { executedAt: new Date('2024-01-14T09:00:00Z'), duration: 35 }
      ];

      mockExecutionRecordRepository.getByUserAndDateRange.mockResolvedValue(weeklyRecords);

      // When: 週次進捗を計算
      const result = await service.calculateWeeklyProgress(userId);

      // Then: 7日分のデータが返される
      expect(result).toHaveLength(7);
      expect(result[6]).toEqual({
        date: '2024-01-16',
        executions: 2,
        duration: 55
      });
      expect(result[5]).toEqual({
        date: '2024-01-15',
        executions: 1,
        duration: 30
      });
    });
  });

  describe('Monthly Progress Calculation', () => {
    it('should calculate monthly progress grouped by weeks', async () => {
      // Given: 月間の実行記録
      const userId = 'user123';
      const monthlyRecords = Array(30).fill(null).map((_, i) => ({
        executedAt: new Date(2024, 0, i + 1), // 1月1日から30日
        duration: 30
      }));

      mockExecutionRecordRepository.getByUserAndDateRange.mockResolvedValue(monthlyRecords);

      // When: 月次進捗を計算
      const result = await service.calculateMonthlyProgress(userId);

      // Then: 週別にグループ化されたデータが返される
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toEqual({
        week: expect.stringMatching(/2024-W\d+/),
        executions: expect.any(Number),
        duration: expect.any(Number)
      });
    });
  });

  describe('Category Distribution Calculation', () => {
    it('should calculate category distribution with correct percentages', async () => {
      // Given: カテゴリ別実行データ
      const userId = 'user123';
      const executionRecords = [
        { routineId: 'r1', duration: 25 },
        { routineId: 'r2', duration: 30 },
        { routineId: 'r3', duration: 35 }
      ];

      const routines = [
        { id: 'r1', categoryId: 'health' },
        { id: 'r2', categoryId: 'health' },
        { id: 'r3', categoryId: 'work' }
      ];

      const categories = [
        { id: 'health', name: '健康' },
        { id: 'work', name: '仕事' }
      ];

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(executionRecords);
      mockRoutineRepository.getByUserId.mockResolvedValue(routines);
      mockCategoryRepository.getByUserId.mockResolvedValue(categories);

      // When: カテゴリ別分布を計算
      const result = await service.calculateCategoryDistribution(userId);

      // Then: 正確な分布が計算される
      expect(result).toEqual([
        {
          categoryId: 'health',
          categoryName: '健康',
          executions: 2,
          percentage: 66.7,
          averageDuration: 27.5
        },
        {
          categoryId: 'work',
          categoryName: '仕事',
          executions: 1,
          percentage: 33.3,
          averageDuration: 35.0
        }
      ]);
    });
  });

  describe('Performance Metrics Calculation', () => {
    it('should calculate performance metrics correctly', async () => {
      // Given: 実行記録データ
      const userId = 'user123';
      const executionRecords = [
        { executedAt: new Date('2024-01-16'), duration: 30 },
        { executedAt: new Date('2024-01-15'), duration: 25 },
        { executedAt: new Date('2024-01-14'), duration: 35 },
        { executedAt: new Date('2024-01-13'), duration: 20 },
        { executedAt: new Date('2024-01-12'), duration: 40 }
      ];

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(executionRecords);

      // When: パフォーマンス指標を計算
      const result = await service.calculatePerformanceMetrics(userId);

      // Then: 正確な指標が計算される
      expect(result).toEqual({
        averageExecutionTime: 30.0,
        longestStreak: 5,
        weeklyFrequency: expect.any(Number),
        completionRate: expect.any(Number)
      });
    });
  });

  describe('Routine Statistics Calculation', () => {
    it('should calculate detailed routine statistics', async () => {
      // Given: 特定ルーチンの実行記録
      const userId = 'user123';
      const routineId = 'routine123';
      const routineRecords = [
        { id: '1', routineId, duration: 30, executedAt: new Date('2024-01-16') },
        { id: '2', routineId, duration: 25, executedAt: new Date('2024-01-15') },
        { id: '3', routineId, duration: 35, executedAt: new Date('2024-01-14') }
      ];

      const routine = {
        id: routineId,
        name: '朝の運動',
        categoryId: 'health',
        userId
      };

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(routineRecords);
      mockRoutineRepository.getById.mockResolvedValue(routine);

      // When: ルーチン統計を計算
      const result = await service.calculateRoutineStatistics(userId, routineId);

      // Then: 詳細統計が返される
      expect(result).toEqual({
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
      });
    });
  });

  describe('Execution Patterns Analysis', () => {
    it('should analyze weekday and hourly patterns', async () => {
      // Given: パターン分析用の実行データ
      const userId = 'user123';
      const patternData = [
        { executedAt: new Date('2024-01-15T07:00:00Z') }, // Monday 07:00 UTC
        { executedAt: new Date('2024-01-16T08:00:00Z') }, // Tuesday 08:00 UTC
        { executedAt: new Date('2024-01-17T07:00:00Z') }, // Wednesday 07:00 UTC
      ];

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(patternData);

      // When: パターンを分析
      const result = await service.calculateExecutionPatterns(userId);

      // Then: パターン分析結果が返される
      expect(result.weekdayDistribution).toEqual(expect.objectContaining({
        monday: expect.any(Number),
        tuesday: expect.any(Number),
        wednesday: expect.any(Number)
      }));
      expect(result.hourDistribution).toEqual(expect.objectContaining({
        '07': expect.any(Number),
        '08': expect.any(Number)
      }));
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Given: データベースエラー
      const userId = 'user123';
      mockExecutionRecordRepository.getByUserId.mockRejectedValue(
        new Error('Database connection failed')
      );

      // When: 統計計算を実行
      const promise = service.calculateDashboardStatistics(userId, {});

      // Then: 適切なエラーが発生
      await expect(promise).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid timezone gracefully', async () => {
      // Given: 無効なタイムゾーン
      const userId = 'user123';
      mockExecutionRecordRepository.getByUserId.mockResolvedValue([]);
      mockRoutineRepository.getActiveByUserId.mockResolvedValue([]);

      // When: 無効なタイムゾーンで計算
      const promise = service.calculateDashboardStatistics(userId, { 
        timezone: 'Invalid/Timezone' 
      });

      // Then: デフォルトタイムゾーンで処理される（エラーにならない）
      await expect(promise).resolves.toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should handle large datasets efficiently', async () => {
      // Given: 大量のデータ
      const userId = 'user123';
      const largeDataset = Array(10000).fill(null).map((_, i) => ({
        id: `exec${i}`,
        userId,
        routineId: 'routine1',
        executedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        duration: 20 + Math.random() * 40,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(largeDataset);
      mockRoutineRepository.getActiveByUserId.mockResolvedValue([
        { id: 'routine1', name: 'Test Routine' }
      ]);

      // When: 大量データで統計計算
      const startTime = Date.now();
      const result = await service.calculateDashboardStatistics(userId, {});
      const duration = Date.now() - startTime;

      // Then: 合理的な時間内で計算完了
      expect(duration).toBeLessThan(1000); // 1秒以内
      expect(result).toBeDefined();
    });
  });
});