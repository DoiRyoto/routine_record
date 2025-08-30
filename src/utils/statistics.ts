import { format, isSameDay, startOfDay, subDays } from 'date-fns';

// 型定義
export interface DailyExecutionData {
  date: string;
  count: number;
}

export interface CategoryDistributionData {
  category: string;
  count: number;
  percentage: number;
}

export interface HeatmapData {
  date: string;
  completionRate: number;
  executionCount: number;
}

// 実行記録型（最小限の定義）
interface ExecutionRecord {
  executedAt: Date;
  routineId: string;
  isCompleted: boolean;
}

// ルーチン型（最小限の定義）
interface Routine {
  id: string;
  categoryId?: string;
  category: string | { name: string };
}

/**
 * 日別実行回数を計算する
 */
export function calculateDailyExecutions(
  executionRecords: ExecutionRecord[]
): DailyExecutionData[] {
  if (executionRecords.length === 0) {
    return [];
  }

  // 完了済みの記録のみを集計
  const completedRecords = executionRecords.filter(record => record.isCompleted);
  
  // 日付別にグループ化
  const dateGroups = completedRecords.reduce((acc, record) => {
    const dateKey = format(startOfDay(record.executedAt), 'yyyy-MM-dd');
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 結果をソートして返す
  return Object.entries(dateGroups)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * カテゴリ別分布を計算する
 */
export function calculateCategoryDistribution(
  routines: Routine[],
  executionRecords: ExecutionRecord[]
): CategoryDistributionData[] {
  if (routines.length === 0 || executionRecords.length === 0) {
    return [];
  }

  // 完了済みの記録のみを集計
  const completedRecords = executionRecords.filter(record => record.isCompleted);
  
  // ルーチンIDからカテゴリへのマッピング作成
  const routineToCategory = routines.reduce((acc, routine) => {
    const categoryName = typeof routine.category === 'string' 
      ? routine.category 
      : routine.category.name;
    acc[routine.id] = categoryName;
    return acc;
  }, {} as Record<string, string>);

  // カテゴリ別に実行回数を集計
  const categoryGroups = completedRecords.reduce((acc, record) => {
    const category = routineToCategory[record.routineId];
    if (category) {
      acc[category] = (acc[category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const totalExecutions = completedRecords.length;
  
  // 結果を計算
  return Object.entries(categoryGroups).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / totalExecutions) * 100 * 10) / 10, // 小数点1桁
  }));
}

/**
 * ヒートマップデータを生成する
 */
export function generateHeatmapData(
  executionRecords: ExecutionRecord[],
  days: number = 90
): HeatmapData[] {
  const result: HeatmapData[] = [];
  const today = startOfDay(new Date());

  // 指定日数分のデータを生成
  for (let i = days - 1; i >= 0; i--) {
    const targetDate = subDays(today, i);
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    
    // その日の実行記録を取得
    const dayRecords = executionRecords.filter(record => 
      isSameDay(record.executedAt, targetDate)
    );

    const executionCount = dayRecords.length;
    const completedCount = dayRecords.filter(record => record.isCompleted).length;
    const completionRate = executionCount > 0 ? 
      Math.round((completedCount / executionCount) * 100) : 0;

    result.push({
      date: dateStr,
      completionRate,
      executionCount
    });
  }

  return result;
}