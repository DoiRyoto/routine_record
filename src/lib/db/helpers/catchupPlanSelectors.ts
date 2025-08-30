import { catchupPlans, routines, type CatchupPlan, type Routine } from '../schema';

/**
 * Database query selectors and builders for catch-up plans
 * Extracted to reduce code duplication and improve maintainability
 */

/**
 * Standard field selector for catch-up plan queries
 */
export const CATCHUP_PLAN_FIELDS = {
  id: catchupPlans.id,
  routineId: catchupPlans.routineId,
  userId: catchupPlans.userId,
  targetPeriodStart: catchupPlans.targetPeriodStart,
  targetPeriodEnd: catchupPlans.targetPeriodEnd,
  originalTarget: catchupPlans.originalTarget,
  currentProgress: catchupPlans.currentProgress,
  remainingTarget: catchupPlans.remainingTarget,
  suggestedDailyTarget: catchupPlans.suggestedDailyTarget,
  isActive: catchupPlans.isActive,
  createdAt: catchupPlans.createdAt,
  updatedAt: catchupPlans.updatedAt,
} as const;

/**
 * Standard field selector for routine queries within catch-up plan context
 */
export const ROUTINE_FIELDS_FOR_CATCHUP = {
  id: routines.id,
  userId: routines.userId,
  name: routines.name,
  description: routines.description,
  category: routines.category,
  goalType: routines.goalType,
  targetCount: routines.targetCount,
  targetPeriod: routines.targetPeriod,
  recurrenceType: routines.recurrenceType,
  recurrenceInterval: routines.recurrenceInterval,
  monthlyType: routines.monthlyType,
  dayOfMonth: routines.dayOfMonth,
  weekOfMonth: routines.weekOfMonth,
  dayOfWeek: routines.dayOfWeek,
  daysOfWeek: routines.daysOfWeek,
  startDate: routines.startDate,
  createdAt: routines.createdAt,
  updatedAt: routines.updatedAt,
  isActive: routines.isActive,
  deletedAt: routines.deletedAt,
} as const;

/**
 * Combined selector for catch-up plans with routine information
 */
export const CATCHUP_PLAN_WITH_ROUTINE_FIELDS = {
  ...CATCHUP_PLAN_FIELDS,
  routine: ROUTINE_FIELDS_FOR_CATCHUP
} as const;

/**
 * Type for catch-up plan with routine data
 */
export type CatchupPlanWithRoutine = CatchupPlan & { routine: Routine };

/**
 * Helper to create update data with automatic timestamp
 */
export function createUpdateData<T extends Partial<CatchupPlan>>(
  updates: Omit<T, 'updatedAt'>
): T & { updatedAt: Date } {
  return {
    ...updates,
    updatedAt: new Date()
  } as T & { updatedAt: Date };
}

/**
 * Helper to validate user ownership conditions
 */
export function createOwnershipConditions(planId: string, userId: string) {
  return {
    planId,
    userId
  };
}
