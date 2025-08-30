import { Theme, Language, TimeFormat } from '../../domain/entities/UserSettings';

export interface UpdateUserSettingsDto {
  userId: string;
  theme?: Theme;
  language?: Language;
  timeFormat?: TimeFormat;
}