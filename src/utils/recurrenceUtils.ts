import type { Routine } from '@/types/routine';

/**
 * 繰り返しパターンに基づいて、特定の日付がミッションの実行日かどうかを判定する
 */
export function isRoutineScheduledForDate(routine: Routine, date: Date): boolean {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  switch (routine.recurrenceType) {
    case 'daily':
      return isScheduledDaily(routine, targetDate);
    
    case 'weekly':
      return isScheduledWeekly(routine, targetDate);
    
    case 'monthly':
      return isScheduledMonthly(routine, targetDate);
    
    case 'custom':
      return isScheduledCustom(routine, targetDate);
    
    default:
      return false;
  }
}

/**
 * 毎日の繰り返し判定
 */
function isScheduledDaily(_routine: Routine, _date: Date): boolean {
  return true; // 毎日実行
}

/**
 * 週間の繰り返し判定
 */
function isScheduledWeekly(routine: Routine, date: Date): boolean {
  if (!routine.daysOfWeek) return false;
  
  try {
    const selectedDays: number[] = JSON.parse(routine.daysOfWeek);
    const dayOfWeek = date.getDay(); // 0=日曜日, 1=月曜日, ...
    return selectedDays.includes(dayOfWeek);
  } catch (error) {
    console.error('週間パターンのパース失敗:', error);
    return false;
  }
}

/**
 * 月間の繰り返し判定
 */
function isScheduledMonthly(routine: Routine, date: Date): boolean {
  if (!routine.monthlyType) return false;

  if (routine.monthlyType === 'day_of_month') {
    return isScheduledMonthlyByDay(routine, date);
  } else if (routine.monthlyType === 'day_of_week') {
    return isScheduledMonthlyByWeek(routine, date);
  }

  return false;
}

/**
 * 月の特定日での繰り返し判定（例: 毎月15日）
 */
function isScheduledMonthlyByDay(routine: Routine, date: Date): boolean {
  if (!routine.dayOfMonth) return false;
  
  const dayOfMonth = date.getDate();
  
  // 月末日の処理（例: 2月30日 → 2月28日または29日）
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const targetDay = Math.min(routine.dayOfMonth, lastDayOfMonth);
  
  return dayOfMonth === targetDay;
}

/**
 * 第○曜日での繰り返し判定（例: 第2月曜日、最終金曜日）
 */
function isScheduledMonthlyByWeek(routine: Routine, date: Date): boolean {
  if (!routine.weekOfMonth || routine.dayOfWeek === null || routine.dayOfWeek === undefined) {
    return false;
  }

  const dayOfWeek = date.getDay();
  if (dayOfWeek !== routine.dayOfWeek) return false;

  const weekOfMonth = getWeekOfMonth(date);
  
  if (routine.weekOfMonth === -1) {
    // 最終週の場合
    return isLastWeekOfMonth(date, routine.dayOfWeek);
  } else {
    return weekOfMonth === routine.weekOfMonth;
  }
}

/**
 * カスタム間隔での繰り返し判定（例: 3日おき）
 */
function isScheduledCustom(routine: Routine, date: Date): boolean {
  if (!routine.startDate || !routine.recurrenceInterval) return false;

  const startDate = new Date(routine.startDate);
  startDate.setHours(0, 0, 0, 0);
  
  const diffTime = date.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // 開始日以前は実行しない
  if (diffDays < 0) return false;
  
  // 間隔で割り切れる日のみ実行
  return diffDays % routine.recurrenceInterval === 0;
}

/**
 * 月の第何週かを取得する
 */
function getWeekOfMonth(date: Date): number {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const dayOfMonth = date.getDate();
  
  // 月初の曜日を取得
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // 第何週かを計算
  return Math.ceil((dayOfMonth + firstDayOfWeek) / 7);
}

/**
 * 指定した曜日の最終週かどうかを判定する
 */
function isLastWeekOfMonth(date: Date, targetDayOfWeek: number): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // その月の最後の日を取得
  
  // その月の最後の指定曜日を探す
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = lastDayOfMonth; day >= lastDayOfMonth - 6; day--) {
    const testDate = new Date(year, month, day);
    if (testDate.getDay() === targetDayOfWeek) {
      return date.getDate() === day;
    }
  }
  
  return false;
}

/**
 * 繰り返しパターンの説明文を生成する
 */
export function getRecurrenceDescription(routine: Routine): string {
  switch (routine.recurrenceType) {
    case 'daily':
      return '毎日';
    
    case 'weekly':
      if (routine.daysOfWeek) {
        try {
          const selectedDays: number[] = JSON.parse(routine.daysOfWeek);
          const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
          const dayLabels = selectedDays.map(day => dayNames[day]).join('・');
          return `毎週 ${dayLabels}曜日`;
        } catch {
          return '週間';
        }
      }
      return '週間';
    
    case 'monthly':
      if (routine.monthlyType === 'day_of_month' && routine.dayOfMonth) {
        return `毎月${routine.dayOfMonth}日`;
      } else if (routine.monthlyType === 'day_of_week' && routine.weekOfMonth && routine.dayOfWeek !== null && routine.dayOfWeek !== undefined) {
        const weekLabel = routine.weekOfMonth === -1 ? '最終' : `第${routine.weekOfMonth}`;
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const dayLabel = dayNames[routine.dayOfWeek];
        return `毎月${weekLabel}${dayLabel}曜日`;
      }
      return '月間';
    
    case 'custom':
      if (routine.recurrenceInterval) {
        return `${routine.recurrenceInterval}日おき`;
      }
      return 'カスタム';
    
    default:
      return '不明';
  }
}

/**
 * 指定期間内での次回実行予定日を取得する
 */
export function getNextScheduledDate(routine: Routine, fromDate: Date = new Date(), maxDays: number = 30): Date | null {
  const startDate = new Date(fromDate);
  startDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i <= maxDays; i++) {
    const testDate = new Date(startDate);
    testDate.setDate(testDate.getDate() + i);
    
    if (isRoutineScheduledForDate(routine, testDate)) {
      return testDate;
    }
  }
  
  return null;
}