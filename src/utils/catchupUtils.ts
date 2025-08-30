import type { CatchupPlan, ExecutionRecord, Routine } from '@/lib/db/schema';
import { CATCHUP_PLAN_CONSTANTS, DifficultyLevel, PeriodType } from '@/domain/constants/CatchupPlanConstants';
import {
  calculateRemainingDays,
  calculateSuggestedDailyTarget,
  determineDifficultyLevel,
  generateProgressMessage,
  suggestOptimalTimeOfDay,
  calculateWeekdayAdjustments
} from '@/lib/utils/catchupCalculations';

/**
 * 挽回プランの計算と生成に関するユーティリティ
 * リファクタリング済み：型安全性の向上と定数の活用
 */

export interface CatchupAnalysis {
  routine: Routine;
  currentProgress: number;
  targetCount: number;
  remainingTarget: number;
  remainingDays: number;
  suggestedDailyTarget: number;
  needsCatchup: boolean;
  periodType: PeriodType;
  periodStart: Date;
  periodEnd: Date;
  difficultyLevel: DifficultyLevel;
}

/**
 * 頻度ベースルーティンの進捗を分析し、挽回が必要かどうかを判定
 * リファクタリング済み：定数の活用と型安全性の向上
 */
export function analyzeCatchupNeed(
  routine: Routine,
  executionRecords: ExecutionRecord[],
  timezone?: string
): CatchupAnalysis | null {
  // 頻度ベースのルーティンのみ対象
  if (routine.goalType !== 'frequency_based' || !routine.targetPeriod || !routine.targetCount) {
    return null;
  }

  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  // 期間の開始・終了日を計算
  if (routine.targetPeriod === 'weekly') {
    periodStart = getWeekStart(now, timezone);
    periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + (CATCHUP_PLAN_CONSTANTS.DAYS_PER_WEEK - 1));
  } else if (routine.targetPeriod === 'monthly') {
    periodStart = getMonthStart(now, timezone);
    periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
  } else {
    // daily の場合は挽回の概念がないのでnullを返す
    return null;
  }

  // 現在の進捗を取得
  const currentProgress = executionRecords.filter(
    (record) =>
      record.routineId === routine.id &&
      record.isCompleted &&
      new Date(record.executedAt) >= periodStart &&
      new Date(record.executedAt) <= periodEnd
  ).length;

  const targetCount = routine.targetCount;
  const remainingTarget = Math.max(targetCount - currentProgress, CATCHUP_PLAN_CONSTANTS.MIN_PROGRESS_VALUE);
  const remainingDays = calculateRemainingDays(now, periodEnd);

  // 1日あたりの推奨実行回数を計算
  const suggestedDailyTarget = calculateSuggestedDailyTarget(remainingTarget, remainingDays);

  // 難易度レベルを判定
  const difficultyLevel = determineDifficultyLevel(suggestedDailyTarget);

  // 挽回が必要かどうかを判定
  // 残り日数に対して必要な1日あたりの実行回数が通常よりも多い場合
  const normalDailyTarget = routine.targetPeriod === 'weekly' ? 
    targetCount / CATCHUP_PLAN_CONSTANTS.DAYS_PER_WEEK : 
    targetCount / CATCHUP_PLAN_CONSTANTS.DEFAULT_DAYS_PER_MONTH;
  const needsCatchup = suggestedDailyTarget > Math.ceil(normalDailyTarget);

  return {
    routine,
    currentProgress,
    targetCount,
    remainingTarget,
    remainingDays,
    suggestedDailyTarget,
    needsCatchup,
    periodType: routine.targetPeriod as PeriodType,
    periodStart,
    periodEnd,
    difficultyLevel,
  };
}

/**
 * 複数のルーティンの挽回分析を一括実行
 */
export function analyzeAllCatchupNeeds(
  routines: Routine[],
  executionRecords: ExecutionRecord[],
  timezone?: string
): CatchupAnalysis[] {
  return routines
    .map((routine) => analyzeCatchupNeed(routine, executionRecords, timezone))
    .filter((analysis): analysis is CatchupAnalysis => analysis !== null);
}

/**
 * 挽回プランを生成
 * リファクタリング済み：型安全性の向上
 */
export function generateCatchupPlan(analysis: CatchupAnalysis): Omit<CatchupPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  return {
    routineId: analysis.routine.id,
    targetPeriodStart: analysis.periodStart,
    targetPeriodEnd: analysis.periodEnd,
    originalTarget: analysis.targetCount,
    currentProgress: analysis.currentProgress,
    remainingTarget: analysis.remainingTarget,
    suggestedDailyTarget: analysis.suggestedDailyTarget,
    isActive: true,
  };
}

/**
 * デイリーミッション提案を生成
 * リファクタリング済み：定数の活用と可読性の向上
 */
export function generateDailyMissionSuggestions(catchupAnalyses: CatchupAnalysis[]): string[] {
  const suggestions: string[] = [];
  const URGENCY_THRESHOLD = 2; // 緊急度の閾値を定数として定義
  
  catchupAnalyses
    .filter(analysis => analysis.needsCatchup && analysis.remainingTarget > CATCHUP_PLAN_CONSTANTS.MIN_PROGRESS_VALUE)
    .forEach(analysis => {
      const { routine, suggestedDailyTarget, remainingDays, periodType } = analysis;
      
      if (suggestedDailyTarget === 1) {
        suggestions.push(`今日は「${routine.name}」を1回実行しましょう`);
      } else {
        suggestions.push(
          `今日は「${routine.name}」を${suggestedDailyTarget}回実行して、` +
          `${periodType === 'weekly' ? '今週' : '今月'}の目標に近づきましょう`
        );
      }
      
      if (remainingDays <= URGENCY_THRESHOLD) {
        suggestions.push(`⚠️「${routine.name}」の期限まで残り${remainingDays}日です！`);
      }
    });

  return suggestions;
}

/**
 * 週の開始日を取得（月曜日）
 * リファクタリング済み：定数の活用
 */
function getWeekStart(date: Date, _timezone?: string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  const day = d.getDay();
  const DAYS_TO_SUBTRACT_FOR_SUNDAY = 6; // 日曜日の場合に戻る日数
  const diff = d.getDate() - day + (day === 0 ? -DAYS_TO_SUBTRACT_FOR_SUNDAY : 1); // 月曜日を週の開始とする
  d.setDate(diff);
  
  return d;
}

/**
 * 月の開始日を取得
 */
function getMonthStart(date: Date, _timezone?: string): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 挽回進捗メッセージを生成
 * リファクタリング済み：定数を活用したヘルパー関数の利用
 */
export function getCatchupProgressMessage(analysis: CatchupAnalysis): string {
  const { currentProgress, targetCount, remainingTarget, remainingDays, periodType } = analysis;
  return generateProgressMessage(currentProgress, targetCount, remainingTarget, remainingDays, periodType);
}