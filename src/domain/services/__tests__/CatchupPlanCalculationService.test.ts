/**
 * TASK-110: Catch-up Plan API Implementation - CatchupPlanCalculationService Unit Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CatchupPlanCalculationService } from '../CatchupPlanCalculationService';
import { IExecutionRecordRepository } from '../../repositories/IExecutionRecordRepository';
import { IRoutineRepository } from '../../repositories/IRoutineRepository';

describe('CatchupPlanCalculationService', () => {
  let service: CatchupPlanCalculationService;
  let mockExecutionRecordRepository: jest.Mocked<IExecutionRecordRepository>;
  let mockRoutineRepository: jest.Mocked<IRoutineRepository>;

  beforeEach(() => {
    // Mock setup following StatisticsCalculationService pattern
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
      countByRoutineIdAndDateRange: jest.fn(),
      findLatestStreakByRoutineId: jest.fn(),
      findWeeklyByUserIdAndWeek: jest.fn(),
      findMonthlyByUserIdAndMonth: jest.fn(),
    } as jest.Mocked<IExecutionRecordRepository>;

    mockRoutineRepository = {
      findById: jest.fn(),
      findByUserId: jest.fn(),
      getById: jest.fn(),
      getByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getActiveByUserId: jest.fn(),
    } as jest.Mocked<IRoutineRepository>;

    // Mock current time to 2024-01-16T12:00:00Z for consistent testing
    const mockCurrentTime = () => new Date('2024-01-16T12:00:00Z');
    
    service = new CatchupPlanCalculationService(
      mockExecutionRecordRepository,
      mockRoutineRepository,
      mockCurrentTime
    );
  });

  describe('Core Calculation Logic Tests', () => {
    it('should calculate correct daily target for frequency-based routine', async () => {
      // Given: 20 target executions, 8 completed, 12 days remaining
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        targetPeriod: 'monthly',
        userId: 'user123'
      };
      
      const mockExecutionRecords = Array(8).fill(null).map((_, i) => ({
        id: `exec${i}`,
        routineId: 'routine123',
        executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`),
        isCompleted: true
      }));

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(mockExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Calculate catch-up plan
      const result = await service.calculateCatchupPlan(input);

      // Then: Correct daily target calculated
      expect(result.originalTarget).toBe(20);
      expect(result.currentProgress).toBe(8);
      expect(result.remainingTarget).toBe(12);
      expect(result.remainingDays).toBe(16); // From Jan 16 to Jan 31
      expect(result.suggestedDailyTarget).toBe(1); // Math.ceil(12/16) = 1
      expect(result.isAchievable).toBe(true);
      expect(result.difficultyLevel).toBe('easy');
    });

    it('should calculate catch-up for schedule-based routine with daily recurrence', async () => {
      // Given: Daily routine, missing 5 days out of 16 days
      const mockRoutine = {
        id: 'routine456',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        recurrenceInterval: 1,
        userId: 'user123'
      };

      const mockExecutionRecords = Array(11).fill(null).map((_, i) => ({
        id: `exec${i}`,
        routineId: 'routine456',
        executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`),
        isCompleted: true
      }));

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(mockExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Calculate catch-up plan
      const result = await service.calculateCatchupPlan(input);

      // Then: Schedule-based calculation correct
      expect(result.originalTarget).toBe(31); // 31 days in January
      expect(result.currentProgress).toBe(11);
      expect(result.remainingTarget).toBe(20);
      expect(result.suggestedDailyTarget).toBe(2); // Math.ceil(20/16) = 2
      expect(result.difficultyLevel).toBe('moderate');
    });

    it('should handle edge case with 1 day remaining', async () => {
      // Given: High deficit with minimal time
      const mockRoutine = {
        id: 'routine789',
        goalType: 'frequency_based',
        targetCount: 30,
        targetPeriod: 'monthly',
        userId: 'user123'
      };

      const mockExecutionRecords = Array(25).fill(null).map((_, i) => ({
        id: `exec${i}`,
        routineId: 'routine789',
        executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`),
        isCompleted: true
      }));

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(mockExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-31T12:00:00Z'), // Last day
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Calculate catch-up plan
      const result = await service.calculateCatchupPlan(input);

      // Then: Handle extreme case appropriately
      expect(result.remainingTarget).toBe(5);
      expect(result.remainingDays).toBe(1);
      expect(result.suggestedDailyTarget).toBe(5);
      expect(result.difficultyLevel).toBe('extreme');
      expect(result.isAchievable).toBe(false); // Too difficult
    });

    it('should return zero target when plan is already complete', async () => {
      // Given: Over-achieved routine
      const mockRoutine = {
        id: 'routine999',
        goalType: 'frequency_based',
        targetCount: 10,
        targetPeriod: 'monthly',
        userId: 'user123'
      };

      const mockExecutionRecords = Array(12).fill(null).map((_, i) => ({
        id: `exec${i}`,
        routineId: 'routine999',
        executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`),
        isCompleted: true
      }));

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(mockExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Calculate catch-up plan
      const result = await service.calculateCatchupPlan(input);

      // Then: Plan already complete
      expect(result.originalTarget).toBe(10);
      expect(result.currentProgress).toBe(12);
      expect(result.remainingTarget).toBe(0);
      expect(result.suggestedDailyTarget).toBe(0);
      expect(result.isAchievable).toBe(true);
    });

    it('should handle weekly recurrence schedule-based routine', async () => {
      // Given: Weekly routine (3 times per week)
      const mockRoutine = {
        id: 'routine_weekly',
        goalType: 'schedule_based',
        recurrenceType: 'weekly',
        recurrenceInterval: 1,
        daysOfWeek: JSON.stringify([1, 3, 5]), // Mon, Wed, Fri
        userId: 'user123'
      };

      const mockExecutionRecords = Array(6).fill(null).map((_, i) => ({
        id: `exec${i}`,
        routineId: 'routine_weekly',
        executedAt: new Date(`2024-01-${(i * 2) + 1}T09:00:00Z`), // Every other day
        isCompleted: true
      }));

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(mockExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Calculate catch-up plan
      const result = await service.calculateCatchupPlan(input);

      // Then: Weekly schedule calculation correct
      expect(result.originalTarget).toBeGreaterThan(0);
      expect(result.currentProgress).toBe(6);
      expect(result.remainingTarget).toBeGreaterThanOrEqual(0);
      expect(result.suggestedDailyTarget).toBeGreaterThanOrEqual(0);
    });

    it('should calculate for monthly recurrence routine', async () => {
      // Given: Monthly routine
      const mockRoutine = {
        id: 'routine_monthly',
        goalType: 'schedule_based',
        recurrenceType: 'monthly',
        recurrenceInterval: 1,
        userId: 'user123'
      };

      const mockExecutionRecords = [];

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(mockExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Calculate catch-up plan
      const result = await service.calculateCatchupPlan(input);

      // Then: Monthly calculation correct
      expect(result.originalTarget).toBe(1);
      expect(result.currentProgress).toBe(0);
      expect(result.remainingTarget).toBe(1);
      expect(result.suggestedDailyTarget).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Difficulty Level Assessment Tests', () => {
    it('should correctly classify difficulty levels', () => {
      // Test data for different difficulty scenarios
      const testCases = [
        { dailyTarget: 0.5, expected: 'easy' },
        { dailyTarget: 1, expected: 'easy' },
        { dailyTarget: 2, expected: 'moderate' },
        { dailyTarget: 4, expected: 'hard' },
        { dailyTarget: 6, expected: 'extreme' }
      ];

      for (const testCase of testCases) {
        const result = service.assessDifficultyLevel(testCase.dailyTarget);
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle edge cases in difficulty assessment', () => {
      // Test edge cases
      expect(service.assessDifficultyLevel(0)).toBe('easy');
      expect(service.assessDifficultyLevel(1.5)).toBe('moderate');
      expect(service.assessDifficultyLevel(3.9)).toBe('hard');
      expect(service.assessDifficultyLevel(4.1)).toBe('extreme');
      expect(service.assessDifficultyLevel(10)).toBe('extreme');
    });

    it('should determine achievability based on difficulty', () => {
      // Test achievability assessment
      expect(service.isAchievable('easy')).toBe(true);
      expect(service.isAchievable('moderate')).toBe(true);
      expect(service.isAchievable('hard')).toBe(true);
      expect(service.isAchievable('extreme')).toBe(false);
    });
  });

  describe('Period Calculation Tests', () => {
    it('should calculate remaining days correctly', () => {
      const currentDate = new Date('2024-01-16T12:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');
      
      const remainingDays = service.calculateRemainingDays(currentDate, endDate);
      expect(remainingDays).toBe(16);
    });

    it('should handle same day calculation', () => {
      const currentDate = new Date('2024-01-31T12:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');
      
      const remainingDays = service.calculateRemainingDays(currentDate, endDate);
      expect(remainingDays).toBe(1);
    });

    it('should handle past end date', () => {
      const currentDate = new Date('2024-02-01T12:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');
      
      const remainingDays = service.calculateRemainingDays(currentDate, endDate);
      expect(remainingDays).toBe(0);
    });

    it('should calculate target for different periods correctly', () => {
      const routine = {
        id: 'test',
        goalType: 'frequency_based' as const,
        targetCount: 30,
        targetPeriod: 'monthly'
      };

      const target = service.calculateOriginalTarget(routine, {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-31T23:59:59Z')
      });

      expect(target).toBe(30);
    });
  });

  describe('Progress Analysis Tests', () => {
    it('should count completed executions correctly', async () => {
      const executionRecords = [
        { id: '1', isCompleted: true, executedAt: new Date('2024-01-15') },
        { id: '2', isCompleted: false, executedAt: new Date('2024-01-16') },
        { id: '3', isCompleted: true, executedAt: new Date('2024-01-17') }
      ];

      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(executionRecords);

      const progress = await service.calculateCurrentProgress('routine123', {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-31T23:59:59Z')
      });

      expect(progress).toBe(2); // Only completed executions
    });

    it('should handle empty execution records', async () => {
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue([]);

      const progress = await service.calculateCurrentProgress('routine123', {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-31T23:59:59Z')
      });

      expect(progress).toBe(0);
    });

    it('should filter execution records by date range correctly', async () => {
      const executionRecords = [
        { id: '1', isCompleted: true, executedAt: new Date('2023-12-31T23:59:59Z') }, // Outside range
        { id: '2', isCompleted: true, executedAt: new Date('2024-01-15T12:00:00Z') }, // In range
        { id: '3', isCompleted: true, executedAt: new Date('2024-02-01T00:00:00Z') }  // Outside range
      ];

      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue([executionRecords[1]]);

      const progress = await service.calculateCurrentProgress('routine123', {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-31T23:59:59Z')
      });

      expect(progress).toBe(1);
    });
  });

  describe('Schedule-based Target Calculation Tests', () => {
    it('should calculate target for daily recurrence', () => {
      const routine = {
        goalType: 'schedule_based' as const,
        recurrenceType: 'daily' as const,
        recurrenceInterval: 1
      };

      const period = {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-31T23:59:59Z')
      };

      const target = service.calculateScheduleBasedTarget(routine, period);
      expect(target).toBe(31); // 31 days in January
    });

    it('should calculate target for weekly recurrence', () => {
      const routine = {
        goalType: 'schedule_based' as const,
        recurrenceType: 'weekly' as const,
        recurrenceInterval: 1,
        daysOfWeek: JSON.stringify([1, 3, 5]) // Mon, Wed, Fri
      };

      const period = {
        start: new Date('2024-01-01T00:00:00Z'), // Monday
        end: new Date('2024-01-31T23:59:59Z')   // Wednesday
      };

      const target = service.calculateScheduleBasedTarget(routine, period);
      expect(target).toBeGreaterThan(0);
    });

    it('should calculate target for bi-weekly recurrence', () => {
      const routine = {
        goalType: 'schedule_based' as const,
        recurrenceType: 'weekly' as const,
        recurrenceInterval: 2 // Every other week
      };

      const period = {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-31T23:59:59Z')
      };

      const target = service.calculateScheduleBasedTarget(routine, period);
      expect(target).toBeGreaterThan(0);
      expect(target).toBeLessThan(31);
    });

    it('should handle custom recurrence patterns', () => {
      const routine = {
        goalType: 'schedule_based' as const,
        recurrenceType: 'custom' as const,
        recurrenceInterval: 3 // Every 3 days
      };

      const period = {
        start: new Date('2024-01-01T00:00:00Z'),
        end: new Date('2024-01-31T23:59:59Z')
      };

      const target = service.calculateScheduleBasedTarget(routine, period);
      expect(target).toBe(Math.floor(31 / 3)); // Approximately every 3 days
    });
  });

  describe('Error Handling Tests', () => {
    it('should throw validation error for invalid input', async () => {
      // Given: Invalid input data
      const invalidInput = {
        routine: null,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When & Then: Should throw validation error
      await expect(service.calculateCatchupPlan(invalidInput))
        .rejects
        .toThrow('Invalid routine data provided');
    });

    it('should throw error for invalid date range', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'user123'
      };

      const invalidInput = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-31T23:59:59Z'), // End before start
          end: new Date('2024-01-01T00:00:00Z')
        }
      };

      await expect(service.calculateCatchupPlan(invalidInput))
        .rejects
        .toThrow('Invalid target period: end date must be after start date');
    });

    it('should handle repository errors gracefully', async () => {
      // Given: Repository throws error
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'user123'
      };

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange
        .mockRejectedValue(new Error('Database connection failed'));

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When & Then: Should propagate database error
      await expect(service.calculateCatchupPlan(input))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should validate routine ownership', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'different_user' // Different from input
      };

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);

      const input = {
        routine: { ...mockRoutine, userId: 'user123' }, // Mismatched user
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      await expect(service.calculateCatchupPlan(input))
        .rejects
        .toThrow('Routine ownership mismatch');
    });

    it('should handle missing routine data', async () => {
      mockRoutineRepository.findById.mockResolvedValue(null);

      const input = {
        routine: { id: 'non_existent', userId: 'user123' },
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      await expect(service.calculateCatchupPlan(input))
        .rejects
        .toThrow('Routine not found');
    });
  });

  describe('Performance Tests', () => {
    it('should handle large execution record datasets efficiently', async () => {
      // Given: Large dataset of execution records
      const largeExecutionDataset = Array(1000).fill(null).map((_, i) => ({
        id: `exec-${i}`,
        routineId: 'routine-large',
        userId: 'user123',
        executedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        duration: 20 + Math.random() * 40,
        isCompleted: true
      }));

      const mockRoutine = {
        id: 'routine-large',
        goalType: 'frequency_based',
        targetCount: 50,
        targetPeriod: 'monthly',
        userId: 'user123'
      };

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange
        .mockResolvedValue(largeExecutionDataset.slice(0, 800)); // Relevant records

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Perform calculation with large dataset
      const startTime = Date.now();
      const result = await service.calculateCatchupPlan(input);
      const calculationTime = Date.now() - startTime;

      // Then: Calculation completes within acceptable time
      expect(calculationTime).toBeLessThan(100); // 100ms target
      expect(result).toBeDefined();
      expect(result.originalTarget).toBe(50);
    });

    it('should efficiently process multiple concurrent calculations', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'user123'
      };

      const mockExecutionRecords = Array(10).fill(null).map((_, i) => ({
        id: `exec${i}`,
        routineId: 'routine123',
        executedAt: new Date(`2024-01-${i + 1}T09:00:00Z`),
        isCompleted: true
      }));

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(mockExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      // When: Process multiple calculations concurrently
      const startTime = Date.now();
      const promises = Array(10).fill(null).map(() => service.calculateCatchupPlan(input));
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;

      // Then: All calculations complete efficiently
      expect(results).toHaveLength(10);
      expect(totalTime).toBeLessThan(500); // 500ms for 10 concurrent calculations
      results.forEach(result => {
        expect(result.originalTarget).toBe(20);
        expect(result.currentProgress).toBe(10);
      });
    });
  });

  describe('Integration with Historical Data Tests', () => {
    it('should consider user execution patterns for optimization', async () => {
      // Given: Historical pattern data showing user prefers morning executions
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'user123'
      };

      const patternedExecutionRecords = [
        { id: '1', executedAt: new Date('2024-01-01T07:00:00Z'), isCompleted: true },
        { id: '2', executedAt: new Date('2024-01-02T07:30:00Z'), isCompleted: true },
        { id: '3', executedAt: new Date('2024-01-03T08:00:00Z'), isCompleted: true },
        { id: '4', executedAt: new Date('2024-01-04T07:15:00Z'), isCompleted: true },
        { id: '5', executedAt: new Date('2024-01-05T07:45:00Z'), isCompleted: true }
      ];

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(patternedExecutionRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        },
        includePatternAnalysis: true
      };

      // When: Calculate with pattern analysis
      const result = await service.calculateCatchupPlan(input);

      // Then: Pattern-optimized suggestions provided
      expect(result).toBeDefined();
      expect(result.suggestedTimeOfDay).toBeDefined();
      expect(result.consistencyScore).toBeDefined();
    });

    it('should adjust suggestions based on weekend vs weekday patterns', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'user123'
      };

      // Mock records showing lower weekend activity
      const weekdayHeavyRecords = [
        { id: '1', executedAt: new Date('2024-01-01T09:00:00Z'), isCompleted: true }, // Monday
        { id: '2', executedAt: new Date('2024-01-02T09:00:00Z'), isCompleted: true }, // Tuesday
        { id: '3', executedAt: new Date('2024-01-03T09:00:00Z'), isCompleted: true }, // Wednesday
        { id: '4', executedAt: new Date('2024-01-04T09:00:00Z'), isCompleted: true }, // Thursday
        { id: '5', executedAt: new Date('2024-01-05T09:00:00Z'), isCompleted: true }, // Friday
        // No weekend executions
      ];

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue(weekdayHeavyRecords);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        },
        includeWeekendAdjustment: true
      };

      const result = await service.calculateCatchupPlan(input);

      expect(result).toBeDefined();
      expect(result.weekdayTargetAdjustment).toBeDefined();
    });
  });

  describe('Timezone Handling Tests', () => {
    it('should handle different timezones correctly', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'user123'
      };

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue([]);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        },
        timezone: 'Asia/Tokyo'
      };

      const result = await service.calculateCatchupPlan(input);

      expect(result).toBeDefined();
      expect(result.timezoneAdjusted).toBe(true);
    });

    it('should handle invalid timezone gracefully', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        userId: 'user123'
      };

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue([]);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        },
        timezone: 'Invalid/Timezone'
      };

      // Should not throw, but use UTC as fallback
      const result = await service.calculateCatchupPlan(input);
      expect(result).toBeDefined();
    });
  });

  describe('Advanced Calculation Scenarios', () => {
    it('should handle routine with start date in middle of target period', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        startDate: new Date('2024-01-15T00:00:00Z'), // Started mid-month
        userId: 'user123'
      };

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue([]);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      const result = await service.calculateCatchupPlan(input);

      // Should calculate based on actual available days
      expect(result.originalTarget).toBeLessThanOrEqual(20);
      expect(result.effectiveStartDate).toEqual(mockRoutine.startDate);
    });

    it('should handle paused/resumed routine scenarios', async () => {
      const mockRoutine = {
        id: 'routine123',
        goalType: 'frequency_based',
        targetCount: 20,
        pausedDates: [
          { start: new Date('2024-01-10T00:00:00Z'), end: new Date('2024-01-12T23:59:59Z') }
        ],
        userId: 'user123'
      };

      mockRoutineRepository.findById.mockResolvedValue(mockRoutine);
      mockExecutionRecordRepository.findByRoutineIdAndDateRange.mockResolvedValue([]);

      const input = {
        routine: mockRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      };

      const result = await service.calculateCatchupPlan(input);

      // Should exclude paused days from calculation
      expect(result.pausedDaysExcluded).toBe(3);
      expect(result.effectivePeriodDays).toBe(28); // 31 - 3 paused days
    });
  });
});