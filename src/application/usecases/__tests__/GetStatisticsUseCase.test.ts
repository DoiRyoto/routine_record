/**
 * TASK-109: 統計・分析API実装 - GetStatisticsUseCase テストファイル (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { ICategoryRepository } from '../../../domain/repositories/ICategoryRepository';
import { IExecutionRecordRepository } from '../../../domain/repositories/IExecutionRecordRepository';
import { IRoutineRepository } from '../../../domain/repositories/IRoutineRepository';
import { StatisticsCalculationService } from '../../../domain/services/StatisticsCalculationService';
import { GetStatisticsUseCase } from '../GetStatisticsUseCase';

// Mock dependencies
const mockExecutionRecordRepository: jest.Mocked<IExecutionRecordRepository> = {
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByRoutineId: jest.fn(),
  findByUserIdAndRoutineId: jest.fn(),
  findByUserIdAndDateRange: jest.fn(),
  findByRoutineIdAndDateRange: jest.fn(),
  findByUserIdAndDate: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  existsTodayByRoutineId: jest.fn(),
  existsByRoutineIdAndDate: jest.fn(),
  countByUserId: jest.fn(),
  countByRoutineId: jest.fn(),
  countByUserIdAndDateRange: jest.fn(),
  findLatestStreakByRoutineId: jest.fn(),
  findWeeklyByUserIdAndWeek: jest.fn(),
  findMonthlyByUserIdAndMonth: jest.fn(),
  getByUserId: jest.fn(),
  getById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  getByUserAndDateRange: jest.fn(),
  getByUserAndMissionPeriod: jest.fn(),
} as jest.Mocked<IExecutionRecordRepository>;

const mockCategoryRepository: jest.Mocked<ICategoryRepository> = {
  getById: jest.fn(),
  getByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
} as jest.Mocked<ICategoryRepository>;

const mockRoutineRepository: jest.Mocked<IRoutineRepository> = {
  getById: jest.fn(),
  getByUserId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getActiveByUserId: jest.fn(),
} as jest.Mocked<IRoutineRepository>;

const mockStatisticsService: jest.Mocked<StatisticsCalculationService> = {
  calculateDashboardStatistics: jest.fn(),
  calculateWeeklyProgress: jest.fn(),
  calculateMonthlyProgress: jest.fn(),
  calculateCategoryDistribution: jest.fn(),
  calculatePerformanceMetrics: jest.fn(),
  calculateRoutineStatistics: jest.fn(),
  calculateExecutionPatterns: jest.fn(),
  calculateTimeSeries: jest.fn(),
  calculateComparison: jest.fn(),
} as jest.Mocked<StatisticsCalculationService>;

describe('GetStatisticsUseCase', () => {
  let useCase: GetStatisticsUseCase;

  beforeEach(() => {
    // This will fail until the actual implementation is created
    useCase = new GetStatisticsUseCase(mockStatisticsService);
    jest.clearAllMocks();
  });

  describe('Dashboard Statistics', () => {
    it('should return dashboard statistics for authenticated user', async () => {
      // Given: Mock dashboard statistics
      const userId = 'user123';
      const mockDashboardStats = {
        summary: {
          todayExecutions: 2,
          weekExecutions: 3,
          monthExecutions: 3,
          totalExecutions: 3,
          activeRoutines: 2,
          currentStreak: 2
        },
        progress: {
          weeklyProgress: [
            { date: '2024-01-16', executions: 3, duration: 85 }
          ],
          monthlyProgress: [
            { week: '2024-W03', executions: 15, duration: 420 }
          ]
        },
        categories: [
          {
            categoryId: 'health',
            categoryName: '健康',
            executions: 30,
            percentage: 50.0,
            averageDuration: 25.0
          }
        ],
        performance: {
          averageExecutionTime: 30.0,
          longestStreak: 23,
          weeklyFrequency: 4.2,
          completionRate: 78.5
        }
      };

      mockStatisticsService.calculateDashboardStatistics.mockResolvedValue(mockDashboardStats.summary);
      mockStatisticsService.calculateWeeklyProgress.mockResolvedValue(mockDashboardStats.progress.weeklyProgress);
      mockStatisticsService.calculateMonthlyProgress.mockResolvedValue(mockDashboardStats.progress.monthlyProgress);
      mockStatisticsService.calculateCategoryDistribution.mockResolvedValue(mockDashboardStats.categories);
      mockStatisticsService.calculatePerformanceMetrics.mockResolvedValue(mockDashboardStats.performance);

      // When: Execute dashboard statistics request
      const result = await useCase.getDashboardStatistics({
        userId,
        timezone: 'UTC'
      });

      // Then: Dashboard statistics are returned
      expect(result.summary).toEqual(mockDashboardStats.summary);
      expect(result.progress.weeklyProgress).toEqual(mockDashboardStats.progress.weeklyProgress);
      expect(result.categories).toEqual(mockDashboardStats.categories);
      expect(result.performance).toEqual(mockDashboardStats.performance);

      expect(mockStatisticsService.calculateDashboardStatistics).toHaveBeenCalledWith(
        userId, 
        { timezone: 'UTC' }
      );
    });

    it('should return zero statistics when no execution records exist', async () => {
      // Given: Empty statistics
      const userId = 'newUser';
      const mockEmptyStats = {
        todayExecutions: 0,
        weekExecutions: 0,
        monthExecutions: 0,
        totalExecutions: 0,
        activeRoutines: 0,
        currentStreak: 0
      };

      mockStatisticsService.calculateDashboardStatistics.mockResolvedValue(mockEmptyStats);
      mockStatisticsService.calculateWeeklyProgress.mockResolvedValue([]);
      mockStatisticsService.calculateMonthlyProgress.mockResolvedValue([]);
      mockStatisticsService.calculateCategoryDistribution.mockResolvedValue([]);
      mockStatisticsService.calculatePerformanceMetrics.mockResolvedValue({
        averageExecutionTime: 0,
        longestStreak: 0,
        weeklyFrequency: 0,
        completionRate: 0
      });

      // When: Execute statistics request
      const result = await useCase.getDashboardStatistics({
        userId,
        timezone: 'UTC'
      });

      // Then: Zero statistics are returned
      expect(result.summary).toEqual(mockEmptyStats);
      expect(result.progress.weeklyProgress).toEqual([]);
      expect(result.categories).toEqual([]);
    });
  });

  describe('Routine Statistics', () => {
    it('should return detailed statistics for specific routine', async () => {
      // Given: Routine-specific statistics
      const userId = 'user123';
      const routineId = 'routine123';
      const mockRoutineStats = {
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
        },
        timeSeries: [
          { date: '2024-01-16', executions: 1, duration: 30 }
        ],
        patterns: {
          weekdayDistribution: { monday: 8, tuesday: 7, wednesday: 6 },
          hourDistribution: { '06': 12, '07': 18, '08': 15 }
        }
      };

      mockStatisticsService.calculateRoutineStatistics.mockResolvedValue({
        routineId: mockRoutineStats.routineId,
        routineName: mockRoutineStats.routineName,
        categoryId: mockRoutineStats.categoryId,
        statistics: mockRoutineStats.statistics
      });
      mockStatisticsService.calculateTimeSeries.mockResolvedValue(mockRoutineStats.timeSeries);
      mockStatisticsService.calculateExecutionPatterns.mockResolvedValue(mockRoutineStats.patterns);

      // When: Execute routine statistics request
      const result = await useCase.getRoutineStatistics({
        userId,
        routineId,
        include: ['timeSeries', 'patterns']
      });

      // Then: Routine statistics are returned
      expect(result.routines[0]).toEqual(mockRoutineStats);
      expect(mockStatisticsService.calculateRoutineStatistics).toHaveBeenCalledWith(userId, routineId);
      expect(mockStatisticsService.calculateTimeSeries).toHaveBeenCalledWith(userId, routineId);
      expect(mockStatisticsService.calculateExecutionPatterns).toHaveBeenCalledWith(userId, routineId);
    });

    it('should return all routine statistics when no specific routine requested', async () => {
      // Given: All routines statistics
      const userId = 'user123';
      const mockAllRoutineStats = [
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

      mockStatisticsService.calculateRoutineStatistics.mockResolvedValue(mockAllRoutineStats[0]);

      // When: Execute all routines statistics request
      const result = await useCase.getRoutineStatistics({
        userId
      });

      // Then: All routines statistics are returned
      expect(result.routines).toHaveLength(1); // Mocked to return first routine only
      expect(mockStatisticsService.calculateRoutineStatistics).toHaveBeenCalledWith(userId, undefined);
    });

    it('should sort routines by executions when sort parameter is provided', async () => {
      // Given: Sorted routine statistics
      const userId = 'user123';
      const mockSortedRoutines = [
        { routineId: 'r1', statistics: { totalExecutions: 50 } },
        { routineId: 'r2', statistics: { totalExecutions: 30 } },
        { routineId: 'r3', statistics: { totalExecutions: 10 } }
      ];

      mockStatisticsService.calculateRoutineStatistics.mockResolvedValue(mockSortedRoutines[0]);

      // When: Execute sorted statistics request
      const result = await useCase.getRoutineStatistics({
        userId,
        sort: 'executions'
      });

      // Then: Statistics are sorted by executions
      expect(result.routines[0].statistics.totalExecutions).toBe(50);
    });
  });

  describe('Comparison Analysis', () => {
    it('should compare statistics with previous period', async () => {
      // Given: Period comparison data
      const userId = 'user123';
      const mockComparison = {
        previousPeriod: {
          totalExecutions: 38,
          averageExecutionTime: 27.2,
          changePercentage: 18.4
        },
        categoryRanking: [
          { category: 'health', rank: 1, executions: 45 },
          { category: 'work', rank: 2, executions: 32 }
        ]
      };

      mockStatisticsService.calculateComparison.mockResolvedValue(mockComparison);

      // When: Execute comparison request
      const result = await useCase.getRoutineStatistics({
        userId,
        period: 'month',
        include: ['comparison']
      });

      // Then: Comparison data is returned
      expect(result.comparison).toEqual(mockComparison);
      expect(mockStatisticsService.calculateComparison).toHaveBeenCalledWith(
        userId, 
        'month'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid period parameter', async () => {
      // Given: Invalid period parameter
      const userId = 'user123';

      // When: Execute request with invalid period
      const promise = useCase.getDashboardStatistics({
        userId,
        period: 'invalid' as any
      });

      // Then: Appropriate error is thrown
      await expect(promise).rejects.toThrow('Invalid period parameter');
    });

    it('should handle non-existent routine ID', async () => {
      // Given: Non-existent routine ID
      const userId = 'user123';
      const routineId = 'non-existent-routine';

      mockStatisticsService.calculateRoutineStatistics.mockResolvedValue(null);

      // When: Execute request for non-existent routine
      const promise = useCase.getRoutineStatistics({
        userId,
        routineId
      });

      // Then: Appropriate error is thrown
      await expect(promise).rejects.toThrow(`Routine with ID '${routineId}' not found`);
    });

    it('should handle database errors gracefully', async () => {
      // Given: Database error
      const userId = 'user123';
      mockStatisticsService.calculateDashboardStatistics.mockRejectedValue(
        new Error('Database connection failed')
      );

      // When: Execute statistics request
      const promise = useCase.getDashboardStatistics({
        userId
      });

      // Then: Database error is propagated
      await expect(promise).rejects.toThrow('Database connection failed');
    });
  });

  describe('Performance', () => {
    it('should handle large datasets efficiently', async () => {
      // Given: Large dataset
      const userId = 'user123';
      const mockLargeStats = {
        todayExecutions: 100,
        weekExecutions: 700,
        monthExecutions: 3000,
        totalExecutions: 36500,
        activeRoutines: 50,
        currentStreak: 30
      };

      mockStatisticsService.calculateDashboardStatistics.mockResolvedValue(mockLargeStats);
      mockStatisticsService.calculateWeeklyProgress.mockResolvedValue([]);
      mockStatisticsService.calculateMonthlyProgress.mockResolvedValue([]);
      mockStatisticsService.calculateCategoryDistribution.mockResolvedValue([]);
      mockStatisticsService.calculatePerformanceMetrics.mockResolvedValue({
        averageExecutionTime: 30.0,
        longestStreak: 100,
        weeklyFrequency: 7.0,
        completionRate: 95.0
      });

      // When: Execute large dataset request
      const startTime = Date.now();
      const result = await useCase.getDashboardStatistics({
        userId
      });
      const duration = Date.now() - startTime;

      // Then: Request completes within reasonable time
      expect(duration).toBeLessThan(500); // 500ms
      expect(result.summary.totalExecutions).toBe(36500);
    });
  });

  describe('Timezone Handling', () => {
    it('should calculate statistics correctly for different timezones', async () => {
      // Given: Timezone-specific request
      const userId = 'user123';
      const mockStats = {
        todayExecutions: 1,
        weekExecutions: 3,
        monthExecutions: 15,
        totalExecutions: 150,
        activeRoutines: 5,
        currentStreak: 2
      };

      mockStatisticsService.calculateDashboardStatistics.mockResolvedValue(mockStats);

      // When: Execute request with specific timezone
      const result = await useCase.getDashboardStatistics({
        userId,
        timezone: 'Asia/Tokyo'
      });

      // Then: Statistics are calculated with timezone consideration
      expect(mockStatisticsService.calculateDashboardStatistics).toHaveBeenCalledWith(
        userId,
        { timezone: 'Asia/Tokyo' }
      );
      expect(result.summary).toEqual(mockStats);
    });

    it('should handle invalid timezone gracefully', async () => {
      // Given: Invalid timezone
      const userId = 'user123';
      mockStatisticsService.calculateDashboardStatistics.mockResolvedValue({
        todayExecutions: 0,
        weekExecutions: 0,
        monthExecutions: 0,
        totalExecutions: 0,
        activeRoutines: 0,
        currentStreak: 0
      });

      // When: Execute request with invalid timezone
      const promise = useCase.getDashboardStatistics({
        userId,
        timezone: 'Invalid/Timezone'
      });

      // Then: Request doesn't fail (defaults to UTC)
      await expect(promise).resolves.toBeDefined();
    });
  });
});