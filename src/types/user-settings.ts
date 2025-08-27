export interface UserSettings {
  id: string;
  theme: 'auto' | 'light' | 'dark';
  language: 'ja' | 'en';
  timeFormat: '12h' | '24h';
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  timezone: string | null;
}

export type Theme = UserSettings['theme'];
export type Language = UserSettings['language'];
export type TimeFormat = UserSettings['timeFormat'];