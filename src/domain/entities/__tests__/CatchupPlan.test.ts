/**
 * TASK-110: Catch-up Plan API Implementation - CatchupPlan Entity Tests (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { describe, it, expect } from '@jest/globals';

import { CatchupPlanId } from '../../valueObjects/CatchupPlanId';
import { RoutineId } from '../../valueObjects/RoutineId';
import { UserId } from '../../valueObjects/UserId';
import { CatchupPlan } from '../CatchupPlan';

describe('CatchupPlan Domain Entity', () => {
  describe('Constructor and Basic Properties', () => {
    it('should create valid catchup plan with all required properties', () => {
      // Given: Valid catchup plan data
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1,
        isActive: true,
        createdAt: new Date('2024-01-16T12:00:00Z'),
        updatedAt: new Date('2024-01-16T12:00:00Z')
      };

      // When: Create catchup plan entity
      const plan = new CatchupPlan(planData);

      // Then: All properties correctly set
      expect(plan.getId().getValue()).toBe('plan123');
      expect(plan.getRoutineId().getValue()).toBe('routine456');
      expect(plan.getUserId().getValue()).toBe('user123');
      expect(plan.getOriginalTarget()).toBe(20);
      expect(plan.getCurrentProgress()).toBe(8);
      expect(plan.getRemainingTarget()).toBe(12);
      expect(plan.getSuggestedDailyTarget()).toBe(1);
      expect(plan.isActive()).toBe(true);
      expect(plan.getTargetPeriodStart()).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(plan.getTargetPeriodEnd()).toEqual(new Date('2024-01-31T23:59:59Z'));
      expect(plan.getCreatedAt()).toEqual(new Date('2024-01-16T12:00:00Z'));
      expect(plan.getUpdatedAt()).toEqual(new Date('2024-01-16T12:00:00Z'));
    });

    it('should create plan with value objects correctly', () => {
      const planData = {
        id: 'plan123',
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

      const plan = new CatchupPlan(planData);

      expect(plan.getId()).toBeInstanceOf(CatchupPlanId);
      expect(plan.getRoutineId()).toBeInstanceOf(RoutineId);
      expect(plan.getUserId()).toBeInstanceOf(UserId);
    });

    it('should handle optional fields correctly', () => {
      const minimalPlanData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
        // isActive, createdAt, updatedAt not provided
      };

      const plan = new CatchupPlan(minimalPlanData);

      expect(plan.isActive()).toBe(true); // Default value
      expect(plan.getCreatedAt()).toBeInstanceOf(Date);
      expect(plan.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should auto-generate timestamps when not provided', () => {
      const beforeCreation = new Date();
      
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      const plan = new CatchupPlan(planData);
      const afterCreation = new Date();

      expect(plan.getCreatedAt().getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(plan.getCreatedAt().getTime()).toBeLessThanOrEqual(afterCreation.getTime());
      expect(plan.getUpdatedAt().getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
      expect(plan.getUpdatedAt().getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    });
  });

  describe('Input Validation', () => {
    it('should throw validation error for invalid data', () => {
      // Given: Invalid catchup plan data
      const invalidData = {
        id: 'plan123',
        routineId: '', // Empty routine ID
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-31T23:59:59Z'),
        targetPeriodEnd: new Date('2024-01-01T00:00:00Z'), // End before start
        originalTarget: -5, // Negative target
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      // When & Then: Should throw validation error
      expect(() => new CatchupPlan(invalidData))
        .toThrow('Invalid catchup plan data');
    });

    it('should validate required fields', () => {
      const testCases = [
        { field: 'id', value: '' },
        { field: 'id', value: null },
        { field: 'routineId', value: '' },
        { field: 'routineId', value: null },
        { field: 'userId', value: '' },
        { field: 'userId', value: null }
      ];

      testCases.forEach(({ field, value }) => {
        const invalidData = {
          id: 'plan123',
          routineId: 'routine456',
          userId: 'user123',
          targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
          targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
          originalTarget: 20,
          currentProgress: 8,
          remainingTarget: 12,
          suggestedDailyTarget: 1,
          [field]: value
        };

        expect(() => new CatchupPlan(invalidData))
          .toThrow(`${field} is required`);
      });
    });

    it('should validate numeric fields are non-negative', () => {
      const numericFields = [
        'originalTarget',
        'currentProgress',
        'remainingTarget',
        'suggestedDailyTarget'
      ];

      numericFields.forEach(field => {
        const invalidData = {
          id: 'plan123',
          routineId: 'routine456',
          userId: 'user123',
          targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
          targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
          originalTarget: 20,
          currentProgress: 8,
          remainingTarget: 12,
          suggestedDailyTarget: 1,
          [field]: -1
        };

        expect(() => new CatchupPlan(invalidData))
          .toThrow(`${field} must be non-negative`);
      });
    });

    it('should validate date ranges', () => {
      const invalidData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-31T23:59:59Z'), // After end date
        targetPeriodEnd: new Date('2024-01-01T00:00:00Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      expect(() => new CatchupPlan(invalidData))
        .toThrow('Target period end must be after start date');
    });

    it('should validate progress consistency', () => {
      const invalidData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 25, // More than original target
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      expect(() => new CatchupPlan(invalidData))
        .toThrow('Current progress cannot exceed original target');
    });

    it('should validate remaining target calculation', () => {
      const invalidData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 15, // Should be 12 (20-8)
        suggestedDailyTarget: 1
      };

      expect(() => new CatchupPlan(invalidData))
        .toThrow('Remaining target must equal original target minus current progress');
    });

    it('should validate ID formats', () => {
      const invalidIdFormats = ['', '   ', '123', 'plan_', 'very-long-id-that-exceeds-reasonable-length-limits-for-database-storage'];

      invalidIdFormats.forEach(invalidId => {
        const invalidData = {
          id: invalidId,
          routineId: 'routine456',
          userId: 'user123',
          targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
          targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
          originalTarget: 20,
          currentProgress: 8,
          remainingTarget: 12,
          suggestedDailyTarget: 1
        };

        expect(() => new CatchupPlan(invalidData))
          .toThrow('Invalid ID format');
      });
    });
  });

  describe('Business Logic Methods', () => {
    let validPlan: CatchupPlan;

    beforeEach(() => {
      const planData = {
        id: 'plan123',
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
      validPlan = new CatchupPlan(planData);
    });

    it('should update progress correctly', () => {
      const newProgress = 15;
      
      validPlan.updateProgress(newProgress);

      expect(validPlan.getCurrentProgress()).toBe(15);
      expect(validPlan.getRemainingTarget()).toBe(5); // 20 - 15
      expect(validPlan.getUpdatedAt().getTime()).toBeGreaterThan(validPlan.getCreatedAt().getTime());
    });

    it('should recalculate daily target when progress updated', () => {
      // Mock current date to be 10 days before end
      const currentDate = new Date('2024-01-22T12:00:00Z'); // 9 days remaining
      
      validPlan.updateProgress(15, currentDate);

      expect(validPlan.getCurrentProgress()).toBe(15);
      expect(validPlan.getRemainingTarget()).toBe(5);
      expect(validPlan.getSuggestedDailyTarget()).toBe(1); // Math.ceil(5/9) = 1
    });

    it('should handle completion when progress equals target', () => {
      validPlan.updateProgress(20);

      expect(validPlan.getCurrentProgress()).toBe(20);
      expect(validPlan.getRemainingTarget()).toBe(0);
      expect(validPlan.getSuggestedDailyTarget()).toBe(0);
      expect(validPlan.isCompleted()).toBe(true);
    });

    it('should handle over-achievement gracefully', () => {
      validPlan.updateProgress(25);

      expect(validPlan.getCurrentProgress()).toBe(25);
      expect(validPlan.getRemainingTarget()).toBe(0);
      expect(validPlan.getSuggestedDailyTarget()).toBe(0);
      expect(validPlan.isCompleted()).toBe(true);
      expect(validPlan.isOverAchieved()).toBe(true);
    });

    it('should validate progress updates', () => {
      expect(() => validPlan.updateProgress(-1))
        .toThrow('Progress cannot be negative');

      expect(() => validPlan.updateProgress(null as any))
        .toThrow('Progress must be a valid number');
    });

    it('should calculate difficulty level correctly', () => {
      const easyPlan = new CatchupPlan({
        id: 'plan1',
        routineId: 'routine1',
        userId: 'user1',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 19,
        remainingTarget: 1,
        suggestedDailyTarget: 0.5
      });

      const extremePlan = new CatchupPlan({
        id: 'plan2',
        routineId: 'routine2',
        userId: 'user2',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 30,
        currentProgress: 5,
        remainingTarget: 25,
        suggestedDailyTarget: 6
      });

      expect(easyPlan.getDifficultyLevel()).toBe('easy');
      expect(extremePlan.getDifficultyLevel()).toBe('extreme');
    });

    it('should determine achievability correctly', () => {
      const achievablePlan = new CatchupPlan({
        id: 'plan1',
        routineId: 'routine1',
        userId: 'user1',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 15,
        remainingTarget: 5,
        suggestedDailyTarget: 1
      });

      const unachievablePlan = new CatchupPlan({
        id: 'plan2',
        routineId: 'routine2',
        userId: 'user2',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 30,
        currentProgress: 5,
        remainingTarget: 25,
        suggestedDailyTarget: 8
      });

      expect(achievablePlan.isAchievable()).toBe(true);
      expect(unachievablePlan.isAchievable()).toBe(false);
    });

    it('should deactivate plan', () => {
      expect(validPlan.isActive()).toBe(true);

      validPlan.deactivate();

      expect(validPlan.isActive()).toBe(false);
      expect(validPlan.getUpdatedAt().getTime()).toBeGreaterThan(validPlan.getCreatedAt().getTime());
    });

    it('should reactivate plan', () => {
      validPlan.deactivate();
      expect(validPlan.isActive()).toBe(false);

      validPlan.reactivate();

      expect(validPlan.isActive()).toBe(true);
    });

    it('should calculate remaining days correctly', () => {
      const currentDate = new Date('2024-01-16T12:00:00Z');
      const remainingDays = validPlan.getRemainingDays(currentDate);

      expect(remainingDays).toBe(16); // From Jan 16 to Jan 31
    });

    it('should handle past end dates', () => {
      const pastDate = new Date('2024-02-01T12:00:00Z');
      const remainingDays = validPlan.getRemainingDays(pastDate);

      expect(remainingDays).toBe(0);
    });
  });

  describe('Serialization and Equality', () => {
    it('should serialize to plain object correctly', () => {
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1,
        isActive: true,
        createdAt: new Date('2024-01-16T12:00:00Z'),
        updatedAt: new Date('2024-01-16T12:00:00Z')
      };

      const plan = new CatchupPlan(planData);
      const serialized = plan.toPlainObject();

      expect(serialized).toEqual({
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1,
        isActive: true,
        createdAt: new Date('2024-01-16T12:00:00Z'),
        updatedAt: new Date('2024-01-16T12:00:00Z')
      });
    });

    it('should compare plans for equality correctly', () => {
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      const plan1 = new CatchupPlan(planData);
      const plan2 = new CatchupPlan(planData);
      const plan3 = new CatchupPlan({ ...planData, id: 'different_id' });

      expect(plan1.equals(plan2)).toBe(true);
      expect(plan1.equals(plan3)).toBe(false);
    });

    it('should generate consistent hash codes', () => {
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      const plan1 = new CatchupPlan(planData);
      const plan2 = new CatchupPlan(planData);

      expect(plan1.getHashCode()).toBe(plan2.getHashCode());
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle zero targets gracefully', () => {
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 0,
        currentProgress: 0,
        remainingTarget: 0,
        suggestedDailyTarget: 0
      };

      const plan = new CatchupPlan(planData);

      expect(plan.isCompleted()).toBe(true);
      expect(plan.getDifficultyLevel()).toBe('easy');
    });

    it('should handle same-day periods', () => {
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-01-16T00:00:00Z'),
        targetPeriodEnd: new Date('2024-01-16T23:59:59Z'), // Same day
        originalTarget: 1,
        currentProgress: 0,
        remainingTarget: 1,
        suggestedDailyTarget: 1
      };

      const plan = new CatchupPlan(planData);
      const currentDate = new Date('2024-01-16T12:00:00Z');
      
      expect(plan.getRemainingDays(currentDate)).toBe(1);
    });

    it('should handle leap year calculations', () => {
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('2024-02-01T00:00:00Z'),
        targetPeriodEnd: new Date('2024-02-29T23:59:59Z'), // Leap year
        originalTarget: 29,
        currentProgress: 15,
        remainingTarget: 14,
        suggestedDailyTarget: 1
      };

      expect(() => new CatchupPlan(planData)).not.toThrow();

      const plan = new CatchupPlan(planData);
      const currentDate = new Date('2024-02-15T12:00:00Z');
      
      expect(plan.getRemainingDays(currentDate)).toBe(15); // 15 days remaining in leap February
    });

    it('should handle null and undefined gracefully', () => {
      expect(() => new CatchupPlan(null as any)).toThrow();
      expect(() => new CatchupPlan(undefined as any)).toThrow();
    });

    it('should handle malformed date objects', () => {
      const planData = {
        id: 'plan123',
        routineId: 'routine456',
        userId: 'user123',
        targetPeriodStart: new Date('invalid-date'),
        targetPeriodEnd: new Date('2024-01-31T23:59:59Z'),
        originalTarget: 20,
        currentProgress: 8,
        remainingTarget: 12,
        suggestedDailyTarget: 1
      };

      expect(() => new CatchupPlan(planData))
        .toThrow('Invalid date format');
    });
  });
});