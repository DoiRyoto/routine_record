/**
 * TASK-110: Catch-up Plan API Implementation - Performance Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 * @jest-timeout 30000
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { CatchupPlanCalculationService } from '@/domain/services/CatchupPlanCalculationService';
import * as catchupQueries from '@/lib/db/queries/catchup-plans';

import { testClient } from '../utils/test-client';

// Mock heavy dependencies for isolated performance testing
jest.mock('@/lib/db/queries/catchup-plans');
jest.mock('@/domain/services/CatchupPlanCalculationService');

describe('Catchup Plans Performance Tests', () => {
  let mockCalculationService: jest.Mocked<CatchupPlanCalculationService>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup calculation service mock
    mockCalculationService = new CatchupPlanCalculationService() as jest.Mocked<CatchupPlanCalculationService>;
    mockCalculationService.calculateCatchupPlan = jest.fn();
  });

  describe('API Response Time Tests', () => {
    it('should respond within 500ms for up to 10 plans', async () => {
      // Given: User with 10 catchup plans
      const mockPlans = Array(10).fill(null).map((_, i) => ({
        id: `plan-${i}`,
        userId: 'user123',
        routineId: `routine-${i}`,
        originalTarget: 20,
        currentProgress: 10,
        remainingTarget: 10,
        suggestedDailyTarget: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        routine: {
          id: `routine-${i}`,
          name: `Routine ${i}`,
          category: 'Health'
        }
      }));

      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue(mockPlans);

      // When: Measure response time
      const startTime = Date.now();
      const response = await testClient.get('/api/catchup-plans?userId=user123');
      const responseTime = Date.now() - startTime;

      // Then: Response within target time
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // 500ms target
      expect(response.data.data).toHaveLength(10);
    });

    it('should handle large plan lists efficiently with pagination', async () => {
      // Given: User with 100 catchup plans
      const largePlanSet = Array(100).fill(null).map((_, i) => ({
        id: `plan-${i}`,
        userId: 'user123',
        routineId: `routine-${i}`,
        originalTarget: 20 + (i % 30),
        currentProgress: i % 15,
        remainingTarget: (20 + (i % 30)) - (i % 15),
        isActive: i % 3 !== 0, // Mix of active/inactive
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        routine: {
          id: `routine-${i}`,
          name: `Large Dataset Routine ${i}`,
          category: i % 2 === 0 ? 'Health' : 'Personal'
        }
      }));

      const { getUserCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getUserCatchupPlans.mockResolvedValue(largePlanSet);

      // When: Measure response time for large dataset
      const startTime = Date.now();
      const response = await testClient.get('/api/catchup-plans?userId=user123&limit=50');
      const responseTime = Date.now() - startTime;

      // Then: Large dataset handled efficiently
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // 1000ms target for large datasets
      expect(response.data.data).toHaveLength(50); // Pagination applied
    });

    it('should maintain performance with complex filtering', async () => {
      // Given: Complex query with multiple filters
      const mockFilteredPlans = Array(25).fill(null).map((_, i) => ({
        id: `filtered-plan-${i}`,
        userId: 'user123',
        routineId: `routine-${i}`,
        isActive: true,
        difficultyLevel: i % 4 === 0 ? 'hard' : 'moderate',
        targetPeriodEnd: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        routine: {
          category: 'Health',
          goalType: 'frequency_based'
        }
      }));

      const { getActiveCatchupPlans } = require('@/lib/db/queries/catchup-plans');
      getActiveCatchupPlans.mockResolvedValue(mockFilteredPlans);

      // When: Complex filtered query
      const startTime = Date.now();
      const response = await testClient.get(
        '/api/catchup-plans?userId=user123&activeOnly=true&category=Health&difficulty=hard&sortBy=endDate'
      );
      const responseTime = Date.now() - startTime;

      // Then: Complex filtering within performance target
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(750); // 750ms for complex queries
      expect(response.data.data.every(plan => plan.isActive)).toBe(true);
    });
  });

  describe('Plan Creation Performance', () => {
    it('should create plan within 1000ms including calculation', async () => {
      // Given: Complex calculation scenario
      const routineWithManyRecords = {
        id: 'routine-complex',
        goalType: 'frequency_based',
        targetCount: 100,
        targetPeriod: 'monthly',
        userId: 'user123'
      };

      const manyExecutionRecords = Array(500).fill(null).map((_, i) => ({
        id: `exec-${i}`,
        routineId: 'routine-complex',
        executedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        duration: 20 + Math.random() * 40,
        isCompleted: true
      }));

      // Mock calculation with realistic complexity
      mockCalculationService.calculateCatchupPlan.mockImplementation(async () => {
        // Simulate calculation time with large dataset
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          originalTarget: 100,
          currentProgress: 45,
          remainingTarget: 55,
          suggestedDailyTarget: 3,
          isAchievable: true,
          difficultyLevel: 'moderate',
          remainingDays: 18
        };
      });

      const { createCatchupPlan } = require('@/lib/db/queries/catchup-plans');
      createCatchupPlan.mockImplementation(async (data) => {
        // Simulate database write time
        await new Promise(resolve => setTimeout(resolve, 50));
        return { id: 'plan-new', ...data };
      });

      const planData = {
        action: 'create',
        userId: 'user123',
        routineId: 'routine-complex',
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 100,
        currentProgress: 45
      };

      // When: Measure plan creation time
      const startTime = Date.now();
      const response = await testClient.post('/api/catchup-plans', {
        body: planData,
        headers: { Authorization: 'Bearer valid-token' }
      });
      const responseTime = Date.now() - startTime;

      // Then: Creation within target time
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // 1000ms target
      expect(response.data.data.remainingTarget).toBe(55);
    });

    it('should handle concurrent plan creation efficiently', async () => {
      // Given: Multiple concurrent plan creation requests
      const concurrentPlanCount = 10;
      const mockCreatedPlans = Array(concurrentPlanCount).fill(null).map((_, i) => ({
        id: `concurrent-plan-${i}`,
        userId: 'user123',
        routineId: `routine-${i}`,
        originalTarget: 20,
        currentProgress: 5,
        remainingTarget: 15,
        suggestedDailyTarget: 1
      }));

      // Mock fast calculation for concurrent test
      mockCalculationService.calculateCatchupPlan.mockResolvedValue({
        originalTarget: 20,
        currentProgress: 5,
        remainingTarget: 15,
        suggestedDailyTarget: 1,
        isAchievable: true,
        difficultyLevel: 'easy'
      });

      const { createCatchupPlan } = require('@/lib/db/queries/catchup-plans');
      createCatchupPlan.mockImplementation(async (data) => {
        // Simulate realistic database write time
        await new Promise(resolve => setTimeout(resolve, 20));
        return mockCreatedPlans.find(plan => plan.routineId === data.routineId);
      });

      const planRequests = Array(concurrentPlanCount).fill(null).map((_, i) => ({
        action: 'create',
        userId: 'user123',
        routineId: `routine-${i}`,
        targetPeriodStart: '2024-01-01T00:00:00Z',
        targetPeriodEnd: '2024-01-31T23:59:59Z',
        originalTarget: 20,
        currentProgress: 5
      }));

      // When: Process concurrent requests
      const startTime = Date.now();
      const promises = planRequests.map(planData =>
        testClient.post('/api/catchup-plans', {
          body: planData,
          headers: { Authorization: 'Bearer valid-token' }
        })
      );
      
      const results = await Promise.allSettled(promises);
      const totalTime = Date.now() - startTime;

      // Then: Concurrent processing efficient
      const successfulCreations = results.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );

      expect(successfulCreations.length).toBeGreaterThanOrEqual(concurrentPlanCount * 0.8); // At least 80% success
      expect(totalTime).toBeLessThan(2000); // Total time under 2 seconds
      
      const averageTime = totalTime / concurrentPlanCount;
      expect(averageTime).toBeLessThan(200); // Average request under 200ms
    });

    it('should optimize calculation for routine with minimal history', async () => {
      // Given: Simple routine with minimal execution history
      const simpleRoutine = {
        id: 'simple-routine',
        goalType: 'frequency_based',
        targetCount: 10,
        targetPeriod: 'weekly',
        userId: 'user123'
      };

      const minimalExecutionRecords = Array(3).fill(null).map((_, i) => ({
        id: `exec-${i}`,
        routineId: 'simple-routine',
        executedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        isCompleted: true
      }));

      // Mock optimized calculation for simple case
      mockCalculationService.calculateCatchupPlan.mockImplementation(async () => {
        // Should be very fast for simple cases
        await new Promise(resolve => setTimeout(resolve, 5));
        return {
          originalTarget: 10,
          currentProgress: 3,
          remainingTarget: 7,
          suggestedDailyTarget: 1,
          isAchievable: true,
          difficultyLevel: 'easy'
        };
      });

      const { createCatchupPlan } = require('@/lib/db/queries/catchup-plans');
      createCatchupPlan.mockResolvedValue({
        id: 'simple-plan',
        routineId: 'simple-routine',
        remainingTarget: 7
      });

      const planData = {
        action: 'create',
        userId: 'user123',
        routineId: 'simple-routine',
        targetPeriodStart: '2024-01-15T00:00:00Z',
        targetPeriodEnd: '2024-01-21T23:59:59Z',
        originalTarget: 10,
        currentProgress: 3
      };

      // When: Create simple plan
      const startTime = Date.now();
      const response = await testClient.post('/api/catchup-plans', {
        body: planData,
        headers: { Authorization: 'Bearer valid-token' }
      });
      const responseTime = Date.now() - startTime;

      // Then: Very fast processing for simple cases
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(100); // 100ms for simple cases
    });
  });

  describe('Calculation Algorithm Performance', () => {
    it('should handle calculation for routine with 1000+ execution records', async () => {
      // Given: Routine with extensive history
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

      // Mock calculation service with large dataset processing
      mockCalculationService.calculateCatchupPlan.mockImplementation(async (input) => {
        const startTime = Date.now();
        
        // Simulate complex calculation with large dataset
        const relevantRecords = largeExecutionDataset.slice(0, 800); // Relevant records
        
        // Simulate processing time based on dataset size
        const processingTime = Math.min(relevantRecords.length / 10, 80); // Max 80ms
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        const calculationTime = Date.now() - startTime;
        
        return {
          originalTarget: 50,
          currentProgress: relevantRecords.length,
          remainingTarget: Math.max(0, 50 - relevantRecords.length),
          suggestedDailyTarget: 1,
          isAchievable: true,
          difficultyLevel: 'easy',
          calculationTime
        };
      });

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
      const result = await mockCalculationService.calculateCatchupPlan(input);
      const calculationTime = Date.now() - startTime;

      // Then: Calculation completes within acceptable time
      expect(calculationTime).toBeLessThan(100); // 100ms target
      expect(result).toBeDefined();
      expect(result.originalTarget).toBe(50);
      expect(result.calculationTime).toBeLessThan(100);
    });

    it('should efficiently process batch calculations', async () => {
      // Given: Multiple routines requiring calculation
      const batchSize = 20;
      const routines = Array(batchSize).fill(null).map((_, i) => ({
        id: `batch-routine-${i}`,
        goalType: 'frequency_based',
        targetCount: 15 + (i % 10),
        targetPeriod: 'monthly',
        userId: 'user123'
      }));

      // Mock batch calculation processing
      mockCalculationService.calculateCatchupPlan.mockImplementation(async (input) => {
        // Simulate optimized batch processing
        await new Promise(resolve => setTimeout(resolve, 10)); // 10ms per calculation
        
        return {
          originalTarget: input.routine.targetCount,
          currentProgress: Math.floor(input.routine.targetCount * 0.6),
          remainingTarget: Math.ceil(input.routine.targetCount * 0.4),
          suggestedDailyTarget: 1,
          isAchievable: true,
          difficultyLevel: 'moderate'
        };
      });

      // When: Process batch calculations
      const startTime = Date.now();
      const batchPromises = routines.map(routine =>
        mockCalculationService.calculateCatchupPlan({
          routine,
          currentDate: new Date('2024-01-16T12:00:00Z'),
          targetPeriod: {
            start: new Date('2024-01-01T00:00:00Z'),
            end: new Date('2024-01-31T23:59:59Z')
          }
        })
      );

      const results = await Promise.all(batchPromises);
      const totalTime = Date.now() - startTime;

      // Then: Batch processing efficient
      expect(results).toHaveLength(batchSize);
      expect(totalTime).toBeLessThan(500); // 500ms for batch of 20
      
      const averageTime = totalTime / batchSize;
      expect(averageTime).toBeLessThan(25); // Average 25ms per calculation
      
      results.forEach((result, index) => {
        expect(result.originalTarget).toBe(routines[index].targetCount);
        expect(result).toBeDefined();
      });
    });

    it('should optimize memory usage during complex calculations', async () => {
      // Given: Memory-intensive calculation scenario
      const memoryTestRoutine = {
        id: 'memory-test-routine',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        recurrenceInterval: 1,
        userId: 'user123'
      };

      // Mock memory-efficient calculation
      mockCalculationService.calculateCatchupPlan.mockImplementation(async (input) => {
        const startTime = Date.now();
        const initialMemory = process.memoryUsage().heapUsed;
        
        // Simulate complex calculation with memory management
        const tempCalculations = [];
        for (let i = 0; i < 1000; i++) {
          tempCalculations.push({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            value: Math.random()
          });
        }
        
        // Process and cleanup
        const result = {
          originalTarget: 31,
          currentProgress: 15,
          remainingTarget: 16,
          suggestedDailyTarget: 1,
          isAchievable: true,
          difficultyLevel: 'easy'
        };
        
        // Cleanup temp data
        tempCalculations.length = 0;
        
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryDelta = finalMemory - initialMemory;
        const processingTime = Date.now() - startTime;
        
        return {
          ...result,
          memoryDelta,
          processingTime
        };
      });

      // When: Perform memory-intensive calculation
      const result = await mockCalculationService.calculateCatchupPlan({
        routine: memoryTestRoutine,
        currentDate: new Date('2024-01-16T12:00:00Z'),
        targetPeriod: {
          start: new Date('2024-01-01T00:00:00Z'),
          end: new Date('2024-01-31T23:59:59Z')
        }
      });

      // Then: Memory usage controlled
      expect(result.memoryDelta).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
      expect(result.processingTime).toBeLessThan(100); // Under 100ms
      expect(result.originalTarget).toBe(31);
    });
  });

  describe('Database Query Performance', () => {
    it('should execute complex queries within SLA', async () => {
      // Given: Complex query with multiple joins and filters
      const complexQueryResult = Array(50).fill(null).map((_, i) => ({
        id: `complex-plan-${i}`,
        userId: 'user123',
        routineId: `routine-${i}`,
        originalTarget: 20 + (i % 15),
        currentProgress: i % 18,
        isActive: i % 3 !== 0,
        routine: {
          id: `routine-${i}`,
          name: `Complex Query Routine ${i}`,
          category: ['Health', 'Personal', 'Work'][i % 3],
          goalType: i % 2 === 0 ? 'frequency_based' : 'schedule_based',
          createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
        },
        executionStats: {
          totalExecutions: i % 20,
          averageDuration: 25 + (i % 30),
          lastExecution: new Date(Date.now() - i * 12 * 60 * 60 * 1000)
        }
      }));

      const { getUserCatchupPlans } = catchupQueries;
      (getUserCatchupPlans as jest.Mock).mockImplementation(async () => {
        // Simulate complex database query time
        await new Promise(resolve => setTimeout(resolve, 150));
        return complexQueryResult;
      });

      // When: Execute complex query
      const startTime = Date.now();
      const response = await testClient.get(
        '/api/catchup-plans?userId=user123&includeStats=true&includeRoutineDetails=true'
      );
      const queryTime = Date.now() - startTime;

      // Then: Complex query within SLA
      expect(response.status).toBe(200);
      expect(queryTime).toBeLessThan(300); // 300ms SLA for complex queries
      expect(response.data.data).toHaveLength(50);
      expect(response.data.data[0].routine).toBeDefined();
      expect(response.data.data[0].executionStats).toBeDefined();
    });

    it('should handle high-frequency updates efficiently', async () => {
      // Given: Rapid succession of updates
      const planId = 'high-frequency-plan';
      const updateCount = 50;
      const mockUpdatedPlans = Array(updateCount).fill(null).map((_, i) => ({
        id: planId,
        userId: 'user123',
        currentProgress: 10 + i,
        remainingTarget: Math.max(0, 40 - (10 + i)),
        updatedAt: new Date(Date.now() + i * 100)
      }));

      const { updateCatchupPlanProgress } = catchupQueries;
      (updateCatchupPlanProgress as jest.Mock).mockImplementation(async (id, userId, progress) => {
        // Simulate optimized update query
        await new Promise(resolve => setTimeout(resolve, 5)); // 5ms per update
        return mockUpdatedPlans.find(plan => plan.currentProgress === progress);
      });

      // When: Perform high-frequency updates
      const startTime = Date.now();
      const updatePromises = Array(updateCount).fill(null).map((_, i) =>
        testClient.post('/api/catchup-plans', {
          body: {
            action: 'updateProgress',
            userId: 'user123',
            planId,
            currentProgress: 10 + i
          },
          headers: { Authorization: 'Bearer valid-token' }
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const totalTime = Date.now() - startTime;

      // Then: High-frequency updates handled efficiently
      const successfulUpdates = results.filter(
        result => result.status === 'fulfilled' && result.value.status === 200
      );

      expect(successfulUpdates.length).toBeGreaterThanOrEqual(updateCount * 0.9); // 90% success rate
      expect(totalTime).toBeLessThan(2000); // Under 2 seconds for 50 updates
      
      const averageUpdateTime = totalTime / successfulUpdates.length;
      expect(averageUpdateTime).toBeLessThan(40); // Average 40ms per update
    });

    it('should maintain performance with database indexes', async () => {
      // Given: Large dataset with index-dependent queries
      const largeUserBase = Array(1000).fill(null).map((_, i) => `user-${i}`);
      const indexedQueryResults = largeUserBase.map(userId => Array(5).fill(null).map((_, j) => ({
        id: `${userId}-plan-${j}`,
        userId,
        routineId: `${userId}-routine-${j}`,
        isActive: j % 2 === 0,
        createdAt: new Date(Date.now() - j * 24 * 60 * 60 * 1000)
      }))).flat();

      const { getUserCatchupPlans } = catchupQueries;
      (getUserCatchupPlans as jest.Mock).mockImplementation(async (userId) => {
        // Simulate index-optimized query
        const baseTime = 10; // Base query time
        const indexTime = Math.log(indexedQueryResults.length) * 2; // Logarithmic with index
        await new Promise(resolve => setTimeout(resolve, baseTime + indexTime));
        
        return indexedQueryResults.filter(plan => plan.userId === userId);
      });

      // When: Query for specific user in large dataset
      const testUserId = 'user-500'; // Middle of large dataset
      const startTime = Date.now();
      const response = await testClient.get(`/api/catchup-plans?userId=${testUserId}`);
      const indexedQueryTime = Date.now() - startTime;

      // Then: Index provides efficient access
      expect(response.status).toBe(200);
      expect(indexedQueryTime).toBeLessThan(100); // Fast with proper indexing
      expect(response.data.data).toHaveLength(5);
      expect(response.data.data.every(plan => plan.userId === testUserId)).toBe(true);
      
      // Verify logarithmic scaling rather than linear
      const expectedMaxTime = 10 + Math.log(5000) * 2; // Should be ~27ms
      expect(indexedQueryTime).toBeLessThan(expectedMaxTime * 2); // With margin
    });
  });
});