import type { CatchupPlan, ExecutionRecord, Routine } from '@/types/routine';

/**
 * 挽回プランの計算と生成に関するユーティリティ
 */

export interface CatchupAnalysis {
  routine: Routine;
  currentProgress: number;
  targetCount: number;
  remainingTarget: number;
  remainingDays: number;
  suggestedDailyTarget: number;
  needsCatchup: boolean;
  periodType: 'weekly' | 'monthly';
  periodStart: Date;
  periodEnd: Date;
}

/**
 * 頻度ベースルーティンの進捗を分析し、挽回が必要かどうかを判定
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
    periodEnd.setDate(periodEnd.getDate() + 6);
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
  const remainingTarget = Math.max(targetCount - currentProgress, 0);
  const remainingDays = Math.max(
    Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    1
  );

  // 1日あたりの推奨実行回数を計算
  const suggestedDailyTarget = remainingTarget > 0 ? Math.ceil(remainingTarget / remainingDays) : 0;

  // 挽回が必要かどうかを判定
  // 残り日数に対して必要な1日あたりの実行回数が通常よりも多い場合
  const normalDailyTarget = routine.targetPeriod === 'weekly' ? targetCount / 7 : targetCount / 30;
  const needsCatchup = suggestedDailyTarget > Math.ceil(normalDailyTarget);

  return {
    routine,
    currentProgress,
    targetCount,
    remainingTarget,
    remainingDays,
    suggestedDailyTarget,
    needsCatchup,
    periodType: routine.targetPeriod as 'weekly' | 'monthly',
    periodStart,
    periodEnd,
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
 */
export function generateDailyMissionSuggestions(catchupAnalyses: CatchupAnalysis[]): string[] {
  const suggestions: string[] = [];
  
  catchupAnalyses
    .filter(analysis => analysis.needsCatchup && analysis.remainingTarget > 0)
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
      
      if (remainingDays <= 2) {
        suggestions.push(`⚠️「${routine.name}」の期限まで残り${remainingDays}日です！`);
      }
    });

  return suggestions;
}

/**
 * 週の開始日を取得（月曜日）
 */
function getWeekStart(date: Date, _timezone?: string): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // 月曜日を週の開始とする
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
 */
export function getCatchupProgressMessage(analysis: CatchupAnalysis): string {
  const { currentProgress, targetCount, remainingTarget, remainingDays, periodType } = analysis;
  
  if (remainingTarget === 0) {
    return `🎉 ${periodType === 'weekly' ? '今週' : '今月'}の目標を達成しました！`;
  }
  
  if (remainingDays === 0) {
    return `⏰ 期限終了。最終結果: ${currentProgress}/${targetCount}回`;
  }
  
  const progressRate = Math.round((currentProgress / targetCount) * 100);
  
  if (progressRate >= 80) {
    return `👍 順調です！あと${remainingTarget}回で目標達成`;
  } else if (progressRate >= 50) {
    return `💪 頑張りましょう！残り${remainingDays}日で${remainingTarget}回`;
  } else {
    return `🚨 挽回が必要です！残り${remainingDays}日で${remainingTarget}回`;
  }
}