import { DomainError } from './DomainError';

export class UserSettingsInvalidThemeError extends DomainError {
  constructor(theme: string) {
    super(`無効なテーマ設定です: '${theme}'. 'light', 'dark', 'auto' のいずれかを指定してください`, 'USER_SETTINGS_INVALID_THEME');
  }
}

export class UserSettingsInvalidLanguageError extends DomainError {
  constructor(language: string) {
    super(`無効な言語設定です: '${language}'. 'ja', 'en' のいずれかを指定してください`, 'USER_SETTINGS_INVALID_LANGUAGE');
  }
}

export class UserSettingsInvalidTimeFormatError extends DomainError {
  constructor(timeFormat: string) {
    super(`無効な時刻フォーマット設定です: '${timeFormat}'. '12h', '24h' のいずれかを指定してください`, 'USER_SETTINGS_INVALID_TIME_FORMAT');
  }
}

export class UserSettingsEmptyUpdateError extends DomainError {
  constructor() {
    super('更新する項目が指定されていません。theme、language、timeFormat のいずれかを指定してください', 'USER_SETTINGS_EMPTY_UPDATE');
  }
}

export class UserSettingsNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`ユーザー設定が見つかりません: ${userId}`, 'USER_SETTINGS_NOT_FOUND');
  }
}