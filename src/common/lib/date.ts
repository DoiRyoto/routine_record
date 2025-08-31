/**
 * タイムゾーン対応の日付時刻ユーティリティ
 */

/**
 * ユーザーのタイムゾーンを取得する
 * @param userTimezone ユーザー設定のタイムゾーン
 * @returns タイムゾーン文字列
 */
export function getUserTimezone(userTimezone?: string | null): string {
  // ユーザー設定があればそれを使用、なければ日本時間をデフォルトとして使用
  return userTimezone || 'Asia/Tokyo';
}

/**
 * 日付をユーザーのタイムゾーンで表示用にフォーマットする
 * @param date 日付
 * @param userTimezone ユーザーのタイムゾーン
 * @param options フォーマットオプション
 * @returns フォーマットされた日付文字列
 */
export function formatDateInUserTimezone(
  date: Date | string,
  userTimezone?: string | null,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const timezone = getUserTimezone(userTimezone);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('ja-JP', defaultOptions).format(dateObj);
}

/**
 * 時刻をユーザーのタイムゾーンで表示用にフォーマットする
 * @param date 日付時刻
 * @param userTimezone ユーザーのタイムゾーン
 * @param timeFormat 時刻フォーマット（12h/24h）
 * @returns フォーマットされた時刻文字列
 */
export function formatTimeInUserTimezone(
  date: Date | string,
  userTimezone?: string | null,
  timeFormat: '12h' | '24h' = '24h'
): string {
  const timezone = getUserTimezone(userTimezone);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  };

  return new Intl.DateTimeFormat('ja-JP', options).format(dateObj);
}

/**
 * 日付時刻をユーザーのタイムゾーンで表示用にフォーマットする
 * @param date 日付時刻
 * @param userTimezone ユーザーのタイムゾーン
 * @param timeFormat 時刻フォーマット（12h/24h）
 * @returns フォーマットされた日付時刻文字列
 */
export function formatDateTimeInUserTimezone(
  date: Date | string,
  userTimezone?: string | null,
  timeFormat: '12h' | '24h' = '24h'
): string {
  const timezone = getUserTimezone(userTimezone);
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: timeFormat === '12h',
  };

  return new Intl.DateTimeFormat('ja-JP', options).format(dateObj);
}

/**
 * ユーザーのタイムゾーンでの「今日」の開始時刻を取得する
 * @param userTimezone ユーザーのタイムゾーン
 * @returns 今日の開始時刻（UTC）
 */
export function getTodayStartInUserTimezone(userTimezone?: string | null): Date {
  const timezone = getUserTimezone(userTimezone);
  const now = new Date();

  // ユーザーのタイムゾーンでの今日の日付を取得
  const todayInUserTz = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  // 今日の開始時刻をユーザーのタイムゾーンで作成してUTCに変換
  return new Date(`${todayInUserTz}T00:00:00`);
}

/**
 * ユーザーのタイムゾーンでの「今日」の終了時刻を取得する
 * @param userTimezone ユーザーのタイムゾーン
 * @returns 今日の終了時刻（UTC）
 */
export function getTodayEndInUserTimezone(userTimezone?: string | null): Date {
  const timezone = getUserTimezone(userTimezone);
  const now = new Date();

  // ユーザーのタイムゾーンでの今日の日付を取得
  const todayInUserTz = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

  // 今日の終了時刻をユーザーのタイムゾーンで作成してUTCに変換
  return new Date(`${todayInUserTz}T23:59:59.999`);
}

/**
 * ユーザーのタイムゾーンでの週の開始日を取得する
 * @param date 基準日
 * @param userTimezone ユーザーのタイムゾーン
 * @returns 週の開始日（日曜日）
 */
export function getWeekStartInUserTimezone(
  date: Date = new Date(),
  userTimezone?: string | null
): Date {
  const timezone = getUserTimezone(userTimezone);

  // ユーザーのタイムゾーンでの日付を取得
  const dateInUserTz = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  const dateObj = new Date(`${dateInUserTz}T00:00:00`);
  const dayOfWeek = dateObj.getDay();
  const startOfWeek = new Date(dateObj);
  startOfWeek.setDate(dateObj.getDate() - dayOfWeek);

  return startOfWeek;
}

/**
 * ユーザーのタイムゾーンでの月の開始日を取得する
 * @param date 基準日
 * @param userTimezone ユーザーのタイムゾーン
 * @returns 月の開始日
 */
export function getMonthStartInUserTimezone(
  date: Date = new Date(),
  userTimezone?: string | null
): Date {
  const timezone = getUserTimezone(userTimezone);

  // ユーザーのタイムゾーンでの年月を取得
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;

  return new Date(`${year}-${month}-01T00:00:00`);
}

/**
 * 2つの日付が同じ日かどうかをユーザーのタイムゾーンで判定する
 * @param date1 日付1
 * @param date2 日付2
 * @param userTimezone ユーザーのタイムゾーン
 * @returns 同じ日かどうか
 */
export function isSameDayInUserTimezone(
  date1: Date | string,
  date2: Date | string,
  userTimezone?: string | null
): boolean {
  const timezone = getUserTimezone(userTimezone);
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(dateObj1) === formatter.format(dateObj2);
}
