/**
 * Mission Card 関連のユーティリティ関数
 */

import { TimeSlot, FormattedTimeSlot, MissionStatus, ProgressData } from '@/types/mission-card';

/**
 * ISO 8601 日時文字列からTimeSlotを生成
 */
export function createTimeSlot(
  startTime: string,
  endTime: string,
  currentTime: Date = new Date()
): TimeSlot {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = currentTime;
  
  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  
  return {
    startTime,
    endTime,
    duration,
    isActive: now >= start && now <= end,
    isPast: now > end,
    isFuture: now < start
  };
}

/**
 * TimeSlotを指定フォーマットでフォーマット
 */
export function formatTimeSlot(
  timeSlot: TimeSlot,
  format: '12h' | '24h' = '12h'
): FormattedTimeSlot {
  const start = new Date(timeSlot.startTime);
  const end = new Date(timeSlot.endTime);
  
  const formatOptions: Intl.DateTimeFormatOptions = 
    format === '12h' 
      ? { hour: 'numeric', minute: '2-digit', hour12: true }
      : { hour: '2-digit', minute: '2-digit', hour12: false };
  
  const startTimeFormatted = start.toLocaleTimeString('en-US', formatOptions);
  const endTimeFormatted = end.toLocaleTimeString('en-US', formatOptions);
  
  // 継続時間のフォーマット
  const hours = Math.floor(timeSlot.duration / 60);
  const minutes = timeSlot.duration % 60;
  let durationFormatted = '';
  
  if (hours > 0 && minutes > 0) {
    durationFormatted = `${hours}h ${minutes}min`;
  } else if (hours > 0) {
    durationFormatted = `${hours}h`;
  } else {
    durationFormatted = `${minutes}min`;
  }
  
  return {
    startTime: startTimeFormatted,
    endTime: endTimeFormatted,
    duration: durationFormatted,
    format
  };
}

/**
 * 進捗値とターゲットからProgressDataを計算
 */
export function calculateProgress(
  current: number,
  target: number,
  isCompleted: boolean = false,
  isOverdue: boolean = false
): ProgressData {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  let status: ProgressData['status'] = 'not_started';
  
  if (isCompleted) {
    status = 'completed';
  } else if (isOverdue) {
    status = 'overdue';
  } else if (current > 0) {
    status = 'in_progress';
  }
  
  return {
    current,
    target,
    percentage: Math.round(percentage * 100) / 100, // 小数点以下2桁
    status
  };
}

/**
 * ミッション状態の判定
 */
export function determineMissionStatus(
  isCompleted: boolean,
  isActive: boolean,
  timeSlot?: TimeSlot,
  _currentTime: Date = new Date()
): MissionStatus {
  if (!isActive) {
    return 'cancelled';
  }
  
  if (isCompleted) {
    return 'completed';
  }
  
  if (timeSlot) {
    if (timeSlot.isActive) {
      return 'active';
    }
    if (timeSlot.isPast) {
      return 'overdue';
    }
  }
  
  return 'pending';
}

/**
 * カテゴリ名から背景色クラスを取得
 */
export function getCategoryBackgroundClass(categoryName: string): string {
  const colorMap: Record<string, string> = {
    health: 'bg-green-100 dark:bg-green-900',
    work: 'bg-blue-100 dark:bg-blue-900',
    personal: 'bg-purple-100 dark:bg-purple-900',
    fitness: 'bg-orange-100 dark:bg-orange-900',
    learning: 'bg-yellow-100 dark:bg-yellow-900',
    social: 'bg-pink-100 dark:bg-pink-900',
    default: 'bg-gray-100 dark:bg-gray-900'
  };
  
  return colorMap[categoryName.toLowerCase()] || colorMap.default;
}

/**
 * カテゴリ名からテキスト色クラスを取得
 */
export function getCategoryTextClass(categoryName: string): string {
  const colorMap: Record<string, string> = {
    health: 'text-green-800 dark:text-green-100',
    work: 'text-blue-800 dark:text-blue-100',
    personal: 'text-purple-800 dark:text-purple-100',
    fitness: 'text-orange-800 dark:text-orange-100',
    learning: 'text-yellow-800 dark:text-yellow-100',
    social: 'text-pink-800 dark:text-pink-100',
    default: 'text-gray-800 dark:text-gray-100'
  };
  
  return colorMap[categoryName.toLowerCase()] || colorMap.default;
}

/**
 * 参加者一覧を表示用に変換
 */
export function prepareParticipantDisplay(
  participants: Array<{ id: string; displayName: string; avatarUrl?: string }>,
  maxVisible: number = 3
) {
  return participants.map((participant, index) => ({
    ...participant,
    order: index,
    visible: index < maxVisible
  }));
}

/**
 * 日付文字列から日本語フォーマットに変換
 */
export function formatDateJapanese(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
}

/**
 * 今日かどうかを判定
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * 時間の経過を人間可読な形式で表現
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days > 0) {
    return `${days}日前`;
  } else if (hours > 0) {
    return `${hours}時間前`;
  } else if (minutes > 0) {
    return `${minutes}分前`;
  } else {
    return '今';
  }
}