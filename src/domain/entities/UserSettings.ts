import { UserSettingsId, UserId } from '../valueObjects';
import { 
  UserSettingsInvalidThemeError,
  UserSettingsInvalidLanguageError,
  UserSettingsInvalidTimeFormatError
} from '../../shared/types/UserSettingsErrors';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'ja' | 'en';
export type TimeFormat = '12h' | '24h';

export class UserSettings {
  public static readonly VALID_THEMES: Theme[] = ['light', 'dark', 'auto'];
  public static readonly VALID_LANGUAGES: Language[] = ['ja', 'en'];
  public static readonly VALID_TIME_FORMATS: TimeFormat[] = ['12h', '24h'];
  
  public static readonly DEFAULT_THEME: Theme = 'auto';
  public static readonly DEFAULT_LANGUAGE: Language = 'ja';
  public static readonly DEFAULT_TIME_FORMAT: TimeFormat = '24h';
  constructor(
    private readonly id: UserSettingsId,
    private readonly userId: UserId,
    private theme: Theme,
    private language: Language,
    private timeFormat: TimeFormat,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {
    this.validateFields();
  }

  // 静的バリデーションメソッド
  public static validateSettingsData(
    theme?: string,
    language?: string,
    timeFormat?: string
  ): void {
    if (theme !== undefined && !UserSettings.VALID_THEMES.includes(theme as Theme)) {
      throw new UserSettingsInvalidThemeError(theme);
    }
    if (language !== undefined && !UserSettings.VALID_LANGUAGES.includes(language as Language)) {
      throw new UserSettingsInvalidLanguageError(language);
    }
    if (timeFormat !== undefined && !UserSettings.VALID_TIME_FORMATS.includes(timeFormat as TimeFormat)) {
      throw new UserSettingsInvalidTimeFormatError(timeFormat);
    }
  }

  private validateFields(): void {
    this.validateTheme(this.theme);
    this.validateLanguage(this.language);
    this.validateTimeFormat(this.timeFormat);
  }

  private validateTheme(theme: string): void {
    if (!UserSettings.VALID_THEMES.includes(theme as Theme)) {
      throw new UserSettingsInvalidThemeError(theme);
    }
  }

  private validateLanguage(language: string): void {
    if (!UserSettings.VALID_LANGUAGES.includes(language as Language)) {
      throw new UserSettingsInvalidLanguageError(language);
    }
  }

  private validateTimeFormat(timeFormat: string): void {
    if (!UserSettings.VALID_TIME_FORMATS.includes(timeFormat as TimeFormat)) {
      throw new UserSettingsInvalidTimeFormatError(timeFormat);
    }
  }

  public static createDefault(userId: UserId): UserSettings {
    return new UserSettings(
      UserSettingsId.generate(),
      userId,
      UserSettings.DEFAULT_THEME,
      UserSettings.DEFAULT_LANGUAGE,
      UserSettings.DEFAULT_TIME_FORMAT
    );
  }

  public updateTheme(theme: Theme): void {
    this.validateTheme(theme);
    this.theme = theme;
    this.updatedAt = new Date();
  }

  public updateLanguage(language: Language): void {
    this.validateLanguage(language);
    this.language = language;
    this.updatedAt = new Date();
  }

  public updateTimeFormat(timeFormat: TimeFormat): void {
    this.validateTimeFormat(timeFormat);
    this.timeFormat = timeFormat;
    this.updatedAt = new Date();
  }

  // ゲッター
  public getId(): UserSettingsId {
    return this.id;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getTheme(): Theme {
    return this.theme;
  }

  public getLanguage(): Language {
    return this.language;
  }

  public getTimeFormat(): TimeFormat {
    return this.timeFormat;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // 比較・判定メソッド
  public equals(other: UserSettings): boolean {
    return this.id.equals(other.id);
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  // 永続化用メソッド
  public toPersistence(): {
    id: string;
    userId: string;
    theme: Theme;
    language: Language;
    timeFormat: TimeFormat;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      theme: this.theme,
      language: this.language,
      timeFormat: this.timeFormat,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: {
    id: string;
    userId: string;
    theme: Theme;
    language: Language;
    timeFormat: TimeFormat;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): UserSettings {
    return new UserSettings(
      new UserSettingsId(data.id),
      new UserId(data.userId),
      data.theme,
      data.language,
      data.timeFormat,
      typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
      typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : data.updatedAt
    );
  }
}