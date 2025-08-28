/**
 * 日付操作のユーティリティ関数群
 */

/**
 * 日付を YYYY-MM-DD 形式の文字列に変換
 */
export function formatDateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * 日付を YYYY-MM-DD HH:mm:ss 形式の文字列に変換
 */
export function formatDateTimeToString(date: Date): string {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

/**
 * 日付の時刻部分をリセット (00:00:00.000)
 */
export function resetTimeToStartOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
}

/**
 * 日付の時刻を一日の終わり (23:59:59.999) に設定
 */
export function setTimeToEndOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
}

/**
 * 2つの日付が同じ日かどうかをチェック
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 指定した日数を日付に加算
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 指定した週数を日付に加算
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

/**
 * 指定した月数を日付に加算
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * 週の始まり（日曜日）の日付を取得
 */
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0: Sunday, 1: Monday, ..., 6: Saturday
  result.setDate(result.getDate() - day);
  return resetTimeToStartOfDay(result);
}

/**
 * 週の終わり（土曜日）の日付を取得
 */
export function getEndOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() + (6 - day));
  return setTimeToEndOfDay(result);
}

/**
 * 月の始まり（1日）の日付を取得
 */
export function getStartOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  return resetTimeToStartOfDay(result);
}

/**
 * 月の終わり（月末）の日付を取得
 */
export function getEndOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1, 0); // 翌月の0日 = 今月の最終日
  return setTimeToEndOfDay(result);
}

/**
 * 年の始まり（1月1日）の日付を取得
 */
export function getStartOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  return resetTimeToStartOfDay(result);
}

/**
 * 年の終わり（12月31日）の日付を取得
 */
export function getEndOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  return setTimeToEndOfDay(result);
}

/**
 * 指定した日付が今日かどうかをチェック
 */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/**
 * 指定した日付が昨日かどうかをチェック
 */
export function isYesterday(date: Date): boolean {
  const yesterday = addDays(new Date(), -1);
  return isSameDay(date, yesterday);
}

/**
 * 指定した日付が明日かどうかをチェック
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
}

/**
 * 指定した日付が今週かどうかをチェック
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);
  
  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * 指定した日付が今月かどうかをチェック
 */
export function isThisMonth(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  );
}

/**
 * 2つの日付の差分（日数）を計算
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const firstDate = resetTimeToStartOfDay(date1);
  const secondDate = resetTimeToStartOfDay(date2);
  
  return Math.round((secondDate.getTime() - firstDate.getTime()) / oneDay);
}

/**
 * 日付の週番号を取得（年の第何週かを返す）
 */
export function getWeekNumber(date: Date): number {
  const startOfYear = getStartOfYear(date);
  const pastDaysOfYear = getDaysDifference(startOfYear, date);
  return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
}

/**
 * 日付配列を生成（開始日から終了日まで）
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * 指定した月の日付配列を生成
 */
export function getDatesInMonth(year: number, month: number): Date[] {
  const startDate = new Date(year, month - 1, 1); // month is 0-indexed
  const endDate = getEndOfMonth(startDate);
  
  return getDateRange(startDate, endDate);
}

/**
 * 指定した週の日付配列を生成（日曜日〜土曜日）
 */
export function getDatesInWeek(date: Date): Date[] {
  const startOfWeek = getStartOfWeek(date);
  const endOfWeek = getEndOfWeek(date);
  
  return getDateRange(startOfWeek, endOfWeek);
}

/**
 * タイムゾーンを考慮した現在時刻を取得
 */
export function getCurrentTimeInTimezone(timezone: string = 'Asia/Tokyo'): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * 日付をタイムゾーンに合わせて変換
 */
export function convertToTimezone(date: Date, timezone: string = 'Asia/Tokyo'): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
}