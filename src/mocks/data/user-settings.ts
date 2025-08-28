import type { UserSetting } from '@/lib/db/schema';

export const mockUserSettings: UserSetting[] = [
  {
    id: '1',
    userId: 'user1',
    theme: 'auto',
    language: 'ja',
    timeFormat: '24h',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: 'user2',
    theme: 'dark',
    language: 'en',
    timeFormat: '12h',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    userId: 'user3',
    theme: 'light',
    language: 'ja',
    timeFormat: '24h',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
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
  const newSettings: UserSetting = {
    id: Math.random().toString(36).substring(2, 11),
    userId,
    theme: 'auto',
    language: 'ja',
    timeFormat: '24h',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockUserSettings.push(newSettings);
  return newSettings;
};

export const updateMockUserSettings = (
  userId: string,
  updates: Partial<UserSetting>
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
  settingsData: Omit<UserSetting, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const newSettings: UserSetting = {
    id: Math.random().toString(36).substring(2, 11),
    ...settingsData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockUserSettings.push(newSettings);
  return newSettings;
};
