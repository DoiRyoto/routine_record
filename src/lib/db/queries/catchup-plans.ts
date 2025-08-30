import { eq, and, desc, gte } from 'drizzle-orm';

import { CATCHUP_PLAN_CONSTANTS } from '@/domain/constants/CatchupPlanConstants';

import {
  CATCHUP_PLAN_WITH_ROUTINE_FIELDS,
  createUpdateData,
  type CatchupPlanWithRoutine
} from '../helpers/catchupPlanSelectors';
import { db } from '../index';
import {
  catchupPlans,
  routines,
  type CatchupPlan,
  type InsertCatchupPlan,
} from '../schema';

// ユーザーの挽回プラン一覧取得
export async function getUserCatchupPlans(userId: string): Promise<CatchupPlanWithRoutine[]> {
  try {
    const plans = await db
      .select(CATCHUP_PLAN_WITH_ROUTINE_FIELDS)
      .from(catchupPlans)
      .innerJoin(routines, eq(catchupPlans.routineId, routines.id))
      .where(
        and(
          eq(catchupPlans.userId, userId),
          eq(catchupPlans.isActive, true)
        )
      )
      .orderBy(desc(catchupPlans.createdAt));

    return plans;
  } catch (error) {
    console.error('Failed to get user catchup plans:', error);
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.USER_PLANS_FETCH_FAILED);
  }
}

// アクティブな挽回プラン取得
export async function getActiveCatchupPlans(userId: string): Promise<CatchupPlanWithRoutine[]> {
  try {
    const now = new Date();
    
    const plans = await db
      .select(CATCHUP_PLAN_WITH_ROUTINE_FIELDS)
      .from(catchupPlans)
      .innerJoin(routines, eq(catchupPlans.routineId, routines.id))
      .where(
        and(
          eq(catchupPlans.userId, userId),
          eq(catchupPlans.isActive, true),
          gte(catchupPlans.targetPeriodEnd, now)
        )
      )
      .orderBy(catchupPlans.targetPeriodEnd);

    return plans;
  } catch (error) {
    console.error('Failed to get active catchup plans:', error);
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.ACTIVE_PLANS_FETCH_FAILED);
  }
}

// 挽回プラン作成
export async function createCatchupPlan(planData: InsertCatchupPlan): Promise<CatchupPlan> {
  try {
    const [newPlan] = await db
      .insert(catchupPlans)
      .values(planData)
      .returning();

    return newPlan;
  } catch (error) {
    console.error('Failed to create catchup plan:', error);
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PLAN_CREATION_FAILED);
  }
}

// 挽回プラン更新
export async function updateCatchupPlan(
  planId: string,
  userId: string,
  updates: Partial<Omit<CatchupPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<CatchupPlan> {
  try {
    const [updatedPlan] = await db
      .update(catchupPlans)
      .set(createUpdateData(updates))
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      )
      .returning();

    if (!updatedPlan) {
      throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PLAN_NOT_FOUND);
    }

    return updatedPlan;
  } catch (error) {
    console.error('Failed to update catchup plan:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PLAN_UPDATE_FAILED);
  }
}

// 挽回プラン進捗更新
export async function updateCatchupPlanProgress(
  planId: string,
  userId: string,
  currentProgress: number
): Promise<CatchupPlan> {
  try {
    // 現在のプランを取得
    const [existingPlan] = await db
      .select()
      .from(catchupPlans)
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      )
      .limit(1);

    if (!existingPlan) {
      throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PLAN_NOT_FOUND);
    }

    // 残り目標を再計算
    const remainingTarget = Math.max(CATCHUP_PLAN_CONSTANTS.MIN_PROGRESS_VALUE, existingPlan.originalTarget - currentProgress);
    
    // 残り日数を計算
    const now = new Date();
    const endDate = new Date(existingPlan.targetPeriodEnd);
    const remainingDays = Math.max(
      CATCHUP_PLAN_CONSTANTS.MIN_REMAINING_DAYS, 
      Math.ceil((endDate.getTime() - now.getTime()) / CATCHUP_PLAN_CONSTANTS.MILLISECONDS_PER_DAY)
    );
    
    // 1日あたりの推奨目標を再計算
    const suggestedDailyTarget = Math.ceil(remainingTarget / remainingDays);

    const [updatedPlan] = await db
      .update(catchupPlans)
      .set(createUpdateData({
        currentProgress,
        remainingTarget,
        suggestedDailyTarget
      }))
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      )
      .returning();

    return updatedPlan;
  } catch (error) {
    console.error('Failed to update catchup plan progress:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PROGRESS_UPDATE_FAILED);
  }
}

// 挽回プラン削除（非アクティブ化）
export async function deactivateCatchupPlan(planId: string, userId: string): Promise<void> {
  try {
    const result = await db
      .update(catchupPlans)
      .set(createUpdateData({ isActive: false }))
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      );

    if (result.count === 0) {
      throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PLAN_NOT_FOUND);
    }
  } catch (error) {
    console.error('Failed to deactivate catchup plan:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PLAN_DEACTIVATION_FAILED);
  }
}

// ルーティン別挽回プラン取得
export async function getCatchupPlanByRoutine(
  userId: string,
  routineId: string
): Promise<CatchupPlan | null> {
  try {
    const [plan] = await db
      .select()
      .from(catchupPlans)
      .where(
        and(
          eq(catchupPlans.userId, userId),
          eq(catchupPlans.routineId, routineId),
          eq(catchupPlans.isActive, true)
        )
      )
      .orderBy(desc(catchupPlans.createdAt))
      .limit(1);

    return plan || null;
  } catch (error) {
    console.error('Failed to get catchup plan by routine:', error);
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.ROUTINE_PLAN_FETCH_FAILED);
  }
}

// 挽回プラン削除（物理削除）
export async function deleteCatchupPlan(planId: string, userId: string): Promise<CatchupPlan | null> {
  try {
    // First check if plan exists and belongs to user
    const [existingPlan] = await db
      .select()
      .from(catchupPlans)
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      )
      .limit(1);

    if (!existingPlan) {
      return null;
    }

    // Delete the plan
    const [deletedPlan] = await db
      .delete(catchupPlans)
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      )
      .returning();

    return deletedPlan || null;
  } catch (error) {
    console.error('Failed to delete catchup plan:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(CATCHUP_PLAN_CONSTANTS.ERROR_MESSAGES.PLAN_DELETION_FAILED);
  }
}