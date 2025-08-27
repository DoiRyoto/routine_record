import { UserSettingWithTimezone } from '../../lib/db/queries/user-settings';

export const mockUserSettings: UserSettingWithTimezone[] = [
  {
    id: '1',
    userId: 'user1',
    theme: 'system',
    language: 'ja',
    timeFormat: '24h',
    dailyGoal: 3,
    weeklyGoal: 15,
    monthlyGoal: 60,
    timezone: 'Asia/Tokyo',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
];

// モック関数
export const getMockUserSettings = (userId: string) =>
  mockUserSettings.find((settings) => settings.userId === userId);

export const getMockOrCreateUserSettings = (userId: string) => {
  const existing = getMockUserSettings(userId);
  if (existing) {
    return existing;
  }

  // デフォルト設定で新規作成
  const newSettings: UserSettingWithTimezone = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    theme: 'system',
    language: 'ja',
    timeFormat: '24h',
    dailyGoal: 3,
    weeklyGoal: 15,
    monthlyGoal: 60,
    timezone: 'Asia/Tokyo',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockUserSettings.push(newSettings);
  return newSettings;
};

export const updateMockUserSettings = (
  userId: string,
  updates: Partial<UserSettingWithTimezone>
) => {
  const index = mockUserSettings.findIndex((settings) => settings.userId === userId);
  if (index !== -1) {
    mockUserSettings[index] = {
      ...mockUserSettings[index],
      ...updates,
      updatedAt: new Date(),
    };
    return mockUserSettings[index];
  }
  return null;
};

export const createMockUserSettings = (
  settingsData: Omit<UserSettingWithTimezone, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const newSettings: UserSettingWithTimezone = {
    id: Math.random().toString(36).substr(2, 9),
    ...settingsData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockUserSettings.push(newSettings);
  return newSettings;
};
