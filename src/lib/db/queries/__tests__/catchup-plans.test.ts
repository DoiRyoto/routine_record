/**
 * TASK-110: Catch-up Plan API Implementation - Database Query Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { db } from '@/lib/db';
import { catchupPlans } from '@/lib/db/schema';

import * as catchupQueries from '../catchup-plans';

// Mock database
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }
}));

describe('Catchup Plans Database Queries', () => {
  let mockDb: jest.Mocked<typeof db>;

  beforeEach(() => {
    mockDb = db as jest.Mocked<typeof db>;
    jest.clearAllMocks();
  });

  describe('getUserCatchupPlans', () => {
    it('should retrieve only user-specific plans', async () => {
      // Given: Mock database response
      const mockPlans = [
        {
          id: 'plan123',
          userId: 'user123',
          routineId: 'routine456',
          originalTarget: 20,
          currentProgress: 8,
          remainingTarget: 12,
          suggestedDailyTarget: 1,
          isActive: true,
          createdAt: new Date('2024-01-16T12:00:00Z'),
          updatedAt: new Date('2024-01-16T12:00:00Z'),
          routine: {
            id: 'routine456',
            name: 'Morning Exercise',
            category: 'Health'
          }
        }
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockPlans)
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      // When: Get user plans
      const result = await catchupQueries.getUserCatchupPlans('user123');

      // Then: Only user's plans returned with proper filtering
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockQuery.where).toHaveBeenCalledWith(
        expect.any(Function) // userId filter
      );
      expect(result).toEqual(mockPlans);
    });

    it('should return empty array for user with no plans', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await catchupQueries.getUserCatchupPlans('user_no_plans');

      expect(result).toEqual([]);
      expect(mockQuery.where).toHaveBeenCalled();
    });

    it('should include routine information in join', async () => {
      const mockPlansWithRoutines = [
        {
          id: 'plan123',
          userId: 'user123',
          routineId: 'routine456',
          routine: {
            id: 'routine456',
            name: 'Morning Exercise',
            description: 'Daily morning workout',
            category: 'Health',
            goalType: 'frequency_based'
          }
        }
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockPlansWithRoutines)
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await catchupQueries.getUserCatchupPlans('user123');

      expect(mockQuery.leftJoin).toHaveBeenCalled();
      expect(result[0].routine).toBeDefined();
      expect(result[0].routine.name).toBe('Morning Exercise');
    });

    it('should order plans by creation date descending', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      await catchupQueries.getUserCatchupPlans('user123');

      expect(mockQuery.orderBy).toHaveBeenCalledWith(
        expect.any(Function) // desc(createdAt)
      );
    });
  });

  describe('getActiveCatchupPlans', () => {
    it('should return only active plans with future end dates', async () => {
      const mockActivePlans = [
        {
          id: 'plan123',
          userId: 'user123',
          routineId: 'routine456',
          isActive: true,
          targetPeriodEnd: new Date('2024-02-01T00:00:00Z') // Future date
        }
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockActivePlans)
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await catchupQueries.getActiveCatchupPlans('user123');

      expect(mockQuery.where).toHaveBeenCalledWith(
        expect.any(Function) // Active and future date filters
      );
      expect(result).toEqual(mockActivePlans);
    });

    it('should exclude past plans even if marked active', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await catchupQueries.getActiveCatchupPlans('user123');

      // Should have compound WHERE condition for active AND future date
      expect(mockQuery.where).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(result).toEqual([]);
    });

    it('should include routine data for active plans', async () => {
      const mockActivePlansWithRoutines = [
        {
          id: 'plan123',
          userId: 'user123',
          isActive: true,
          routine: {
            id: 'routine456',
            name: 'Reading',
            isActive: true
          }
        }
      ];

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(mockActivePlansWithRoutines)
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await catchupQueries.getActiveCatchupPlans('user123');

      expect(result[0].routine).toBeDefined();
      expect(mockQuery.leftJoin).toHaveBeenCalled();
    });
  });

  describe('getCatchupPlanByRoutine', () => {
    it('should return plan for specific routine', async () => {
      const mockRoutinePlan = {
        id: 'plan789',
        routineId: 'routine456',
        userId: 'user123',
        originalTarget: 15,
        currentProgress: 5,
        remainingTarget: 10,
        routine: {
          id: 'routine456',
          name: 'Reading'
        }
      };

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([mockRoutinePlan])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await catchupQueries.getCatchupPlanByRoutine('user123', 'routine456');

      expect(mockQuery.where).toHaveBeenCalledWith(
        expect.any(Function) // userId and routineId filter
      );
      expect(mockQuery.limit).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockRoutinePlan);
    });

    it('should return null when no plan exists for routine', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const result = await catchupQueries.getCatchupPlanByRoutine('user123', 'routine456');

      expect(result).toBeNull();
    });

    it('should filter by both userId and routineId', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      await catchupQueries.getCatchupPlanByRoutine('user123', 'routine456');

      // Should have compound WHERE condition for both userId and routineId
      expect(mockQuery.where).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should prefer active plans over inactive ones', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      await catchupQueries.getCatchupPlanByRoutine('user123', 'routine456');

      expect(mockQuery.orderBy).toHaveBeenCalledWith(
        expect.any(Function) // Order by isActive desc
      );
    });
  });

  describe('createCatchupPlan', () => {
    it('should create new catchup plan with all required fields', async () => {
      // Given: Plan data
      const planData = {
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1,
        isActive: true
      };

      const mockInsertQuery = {
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{ id: 'plan789', ...planData }])
      };

      mockDb.insert.mockReturnValue(mockInsertQuery as any);

      // When: Create plan
      const result = await catchupQueries.createCatchupPlan(planData);

      // Then: Plan created with generated ID
      expect(mockDb.insert).toHaveBeenCalledWith(catchupPlans);
      expect(mockInsertQuery.values).toHaveBeenCalledWith(
        expect.objectContaining(planData)
      );
      expect(result.id).toBe('plan789');
    });

    it('should auto-generate timestamps for new plan', async () => {
      const planData = {
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1,
        isActive: true
      };

      const mockInsertQuery = {
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'plan789',
          ...planData,
          createdAt: new Date(),
          updatedAt: new Date()
        }])
      };

      mockDb.insert.mockReturnValue(mockInsertQuery as any);

      const result = await catchupQueries.createCatchupPlan(planData);

      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should set default values correctly', async () => {
      const minimalPlanData = {
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
        // isActive not provided - should default to true
      };

      const mockInsertQuery = {
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'plan789',
          ...minimalPlanData,
          isActive: true // Default value
        }])
      };

      mockDb.insert.mockReturnValue(mockInsertQuery as any);

      const result = await catchupQueries.createCatchupPlan(minimalPlanData);

      expect(result.isActive).toBe(true);
    });

    it('should handle database constraint violations', async () => {
      const planData = {
        routineId: 'non_existent_routine',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      const mockInsertQuery = {
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Foreign key constraint violation'))
      };

      mockDb.insert.mockReturnValue(mockInsertQuery as any);

      await expect(catchupQueries.createCatchupPlan(planData))
        .rejects
        .toThrow('Foreign key constraint violation');
    });
  });

  describe('updateCatchupPlanProgress', () => {
    it('should update progress and recalculate targets', async () => {
      // Given: Progress update data
      const planId = 'plan123';
      const userId = 'user123';
      const newProgress = 15;

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: planId,
          userId,
          currentProgress: newProgress,
          remainingTarget: 5, // Recalculated
          suggestedDailyTarget: 1,
          updatedAt: new Date()
        }])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      // When: Update progress
      const result = await catchupQueries.updateCatchupPlanProgress(
        planId, 
        userId, 
        newProgress
      );

      // Then: Progress updated with recalculated values
      expect(mockDb.update).toHaveBeenCalledWith(catchupPlans);
      expect(mockUpdateQuery.set).toHaveBeenCalledWith(
        expect.objectContaining({
          currentProgress: newProgress,
          remainingTarget: expect.any(Number),
          updatedAt: expect.any(Date)
        })
      );
      expect(mockUpdateQuery.where).toHaveBeenCalledWith(
        expect.any(Function) // planId and userId filter
      );
      expect(result.currentProgress).toBe(newProgress);
      expect(result.remainingTarget).toBe(5);
    });

    it('should return null when plan not found', async () => {
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.updateCatchupPlanProgress(
        'non_existent_plan',
        'user123',
        15
      );

      expect(result).toBeNull();
    });

    it('should update timestamp on progress change', async () => {
      const beforeUpdate = new Date();
      
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'plan123',
          currentProgress: 15,
          updatedAt: new Date(beforeUpdate.getTime() + 1000) // 1 second later
        }])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.updateCatchupPlanProgress('plan123', 'user123', 15);

      expect(mockUpdateQuery.set).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(Date)
        })
      );
      expect(result.updatedAt.getTime()).toBeGreaterThan(beforeUpdate.getTime());
    });

    it('should recalculate daily target based on remaining days', async () => {
      // Mock plan with 10 days remaining and 15 target remaining
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'plan123',
          originalTarget: 30,
          currentProgress: 15,
          remainingTarget: 15,
          suggestedDailyTarget: 2, // Math.ceil(15/10) = 2
          targetPeriodEnd: new Date('2024-01-26T23:59:59Z') // 10 days from now
        }])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.updateCatchupPlanProgress('plan123', 'user123', 15);

      expect(result.suggestedDailyTarget).toBe(2);
      expect(result.remainingTarget).toBe(15);
    });
  });

  describe('updateCatchupPlan', () => {
    it('should update plan with arbitrary fields', async () => {
      const planId = 'plan123';
      const userId = 'user123';
      const updates = {
        originalTarget: 25,
        targetPeriodEnd: new Date('2024-02-29T23:59:59Z'),
        isActive: false
      };

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: planId,
          userId,
          ...updates,
          updatedAt: new Date()
        }])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.updateCatchupPlan(planId, userId, updates);

      expect(mockUpdateQuery.set).toHaveBeenCalledWith(
        expect.objectContaining(updates)
      );
      expect(result.originalTarget).toBe(25);
      expect(result.isActive).toBe(false);
    });

    it('should automatically update timestamp', async () => {
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'plan123',
          updatedAt: new Date()
        }])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      await catchupQueries.updateCatchupPlan('plan123', 'user123', { isActive: false });

      expect(mockUpdateQuery.set).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedAt: expect.any(Date)
        })
      );
    });

    it('should prevent updating other users plans', async () => {
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.updateCatchupPlan('plan123', 'different_user', {
        isActive: false
      });

      expect(mockUpdateQuery.where).toHaveBeenCalledWith(
        expect.any(Function) // Should include both planId AND userId
      );
      expect(result).toBeNull();
    });
  });

  describe('deactivateCatchupPlan', () => {
    it('should deactivate plan successfully', async () => {
      const planId = 'plan789';
      const userId = 'user123';

      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: planId,
          userId,
          isActive: false,
          updatedAt: new Date()
        }])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.deactivateCatchupPlan(planId, userId);

      expect(mockUpdateQuery.set).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          updatedAt: expect.any(Date)
        })
      );
      expect(result.isActive).toBe(false);
    });

    it('should return null when plan not found or not owned by user', async () => {
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.deactivateCatchupPlan('non_existent', 'user123');

      expect(result).toBeNull();
    });

    it('should not affect already deactivated plans', async () => {
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: 'plan789',
          isActive: false,
          updatedAt: new Date()
        }])
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      const result = await catchupQueries.deactivateCatchupPlan('plan789', 'user123');

      expect(result.isActive).toBe(false);
    });
  });

  describe('deleteCatchupPlan', () => {
    it('should permanently delete plan', async () => {
      const planId = 'plan123';
      const userId = 'user123';

      const mockDeleteQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([{
          id: planId,
          userId
        }])
      };

      mockDb.delete.mockReturnValue(mockDeleteQuery as any);

      const result = await catchupQueries.deleteCatchupPlan(planId, userId);

      expect(mockDb.delete).toHaveBeenCalledWith(catchupPlans);
      expect(mockDeleteQuery.where).toHaveBeenCalledWith(
        expect.any(Function) // planId and userId filter
      );
      expect(result.id).toBe(planId);
    });

    it('should return null when plan not found', async () => {
      const mockDeleteQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([])
      };

      mockDb.delete.mockReturnValue(mockDeleteQuery as any);

      const result = await catchupQueries.deleteCatchupPlan('non_existent', 'user123');

      expect(result).toBeNull();
    });

    it('should not delete plans belonging to other users', async () => {
      const mockDeleteQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue([])
      };

      mockDb.delete.mockReturnValue(mockDeleteQuery as any);

      const result = await catchupQueries.deleteCatchupPlan('plan123', 'different_user');

      expect(mockDeleteQuery.where).toHaveBeenCalledWith(
        expect.any(Function) // Should filter by both planId AND userId
      );
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      await expect(catchupQueries.getUserCatchupPlans('user123'))
        .rejects
        .toThrow('Database connection failed');
    });

    it('should handle malformed query parameters gracefully', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      // Should not throw with null or undefined userId
      const result1 = await catchupQueries.getUserCatchupPlans(null as any);
      const result2 = await catchupQueries.getUserCatchupPlans(undefined as any);

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('should handle invalid data types in updates', async () => {
      const mockUpdateQuery = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockRejectedValue(new Error('Invalid data type'))
      };

      mockDb.update.mockReturnValue(mockUpdateQuery as any);

      await expect(catchupQueries.updateCatchupPlanProgress('plan123', 'user123', 'invalid' as any))
        .rejects
        .toThrow('Invalid data type');
    });
  });

  describe('Performance', () => {
    it('should efficiently handle queries for users with many plans', async () => {
      const largePlanSet = Array(100).fill(null).map((_, i) => ({
        id: `plan${i}`,
        userId: 'power_user',
        routineId: `routine${i}`,
        originalTarget: 20,
        currentProgress: 10
      }));

      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(largePlanSet)
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      const startTime = Date.now();
      const result = await catchupQueries.getUserCatchupPlans('power_user');
      const queryTime = Date.now() - startTime;

      expect(result).toHaveLength(100);
      expect(queryTime).toBeLessThan(100); // Should complete quickly
    });

    it('should use appropriate indexes for common query patterns', async () => {
      const mockQuery = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue([])
      };

      mockDb.select.mockReturnValue(mockQuery as any);

      // These queries should be optimized with proper indexes
      await catchupQueries.getUserCatchupPlans('user123');
      await catchupQueries.getActiveCatchupPlans('user123');
      await catchupQueries.getCatchupPlanByRoutine('user123', 'routine456');

      // Verify that where clauses are constructed efficiently
      expect(mockQuery.where).toHaveBeenCalledTimes(3);
    });
  });
});