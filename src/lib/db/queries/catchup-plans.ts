import { eq, and, desc, gte } from 'drizzle-orm';

import { db } from '../index';
import {
  catchupPlans,
  routines,
  type CatchupPlan,
  type Routine,
  type InsertCatchupPlan,
} from '../schema';

// ユーザーの挽回プラン一覧取得
export async function getUserCatchupPlans(userId: string): Promise<(CatchupPlan & { routine: Routine })[]> {
  try {
    const plans = await db
      .select({
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
        routine: {
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
        }
      })
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
    throw new Error('ユーザー挽回プランの取得に失敗しました');
  }
}

// アクティブな挽回プラン取得
export async function getActiveCatchupPlans(userId: string): Promise<(CatchupPlan & { routine: Routine })[]> {
  try {
    const now = new Date();
    
    const plans = await db
      .select({
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
        routine: {
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
        }
      })
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
    throw new Error('アクティブな挽回プランの取得に失敗しました');
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
    throw new Error('挽回プランの作成に失敗しました');
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
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      )
      .returning();

    if (!updatedPlan) {
      throw new Error('挽回プランが見つかりません');
    }

    return updatedPlan;
  } catch (error) {
    console.error('Failed to update catchup plan:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('挽回プランの更新に失敗しました');
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
      throw new Error('挽回プランが見つかりません');
    }

    // 残り目標を再計算
    const remainingTarget = Math.max(0, existingPlan.originalTarget - currentProgress);
    
    // 残り日数を計算
    const now = new Date();
    const endDate = new Date(existingPlan.targetPeriodEnd);
    const remainingDays = Math.max(1, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    // 1日あたりの推奨目標を再計算
    const suggestedDailyTarget = Math.ceil(remainingTarget / remainingDays);

    const [updatedPlan] = await db
      .update(catchupPlans)
      .set({
        currentProgress,
        remainingTarget,
        suggestedDailyTarget,
        updatedAt: new Date()
      })
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
    throw new Error('挽回プラン進捗の更新に失敗しました');
  }
}

// 挽回プラン削除（非アクティブ化）
export async function deactivateCatchupPlan(planId: string, userId: string): Promise<void> {
  try {
    const result = await db
      .update(catchupPlans)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(catchupPlans.id, planId),
          eq(catchupPlans.userId, userId)
        )
      );

    if (result.count === 0) {
      throw new Error('挽回プランが見つかりません');
    }
  } catch (error) {
    console.error('Failed to deactivate catchup plan:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('挽回プランの非アクティブ化に失敗しました');
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
    throw new Error('ルーティン別挽回プランの取得に失敗しました');
  }
}