import { http, HttpResponse } from 'msw';

import {
  getMockUserSettings,
  getMockOrCreateUserSettings,
  updateMockUserSettings,
  createMockUserSettings,
} from '../data/user-settings';

export const userSettingsHandlers = [
  // GET: ユーザー設定取得
  http.get('/api/user-settings', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return HttpResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    const settings = getMockOrCreateUserSettings(userId);

    return HttpResponse.json({
      success: true,
      data: settings,
    });
  }),

  // POST: ユーザー設定作成
  http.post('/api/user-settings', async ({ request }) => {
    try {
      const body = await request.json() as any;
      const { userId, theme, language, timeFormat, dailyGoal, weeklyGoal, monthlyGoal, timezone } = body;

      // バリデーション
      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      const newSettings = createMockUserSettings({
        userId,
        theme: theme || 'system',
        language: language || 'ja',
        timeFormat: timeFormat || '24h',
        dailyGoal: dailyGoal || 3,
        weeklyGoal: weeklyGoal || 15,
        monthlyGoal: monthlyGoal || 60,
        timezone: timezone || 'Asia/Tokyo',
      });

      return HttpResponse.json({
        success: true,
        message: 'ユーザー設定が作成されました',
        data: newSettings,
      });
    } catch {
      return HttpResponse.json(
        { error: 'ユーザー設定の作成に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // PUT: ユーザー設定更新
  http.put('/api/user-settings', async ({ request }) => {
    try {
      const body = await request.json() as any;
      const { userId, ...updates } = body;

      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      // 更新可能なフィールドをフィルタリング
      const allowedFields = [
        'theme',
        'language', 
        'timeFormat',
        'dailyGoal',
        'weeklyGoal',
        'monthlyGoal',
        'timezone'
      ];

      const filteredUpdates = Object.keys(updates)
        .filter((key) => allowedFields.includes(key))
        .reduce((obj: Record<string, unknown>, key) => {
          obj[key] = updates[key];
          return obj;
        }, {});

      if (Object.keys(filteredUpdates).length === 0) {
        return HttpResponse.json(
          { error: '更新可能なフィールドが指定されていません' },
          { status: 400 }
        );
      }

      const updatedSettings = updateMockUserSettings(userId, filteredUpdates);

      if (!updatedSettings) {
        return HttpResponse.json(
          { error: 'ユーザー設定が見つかりません' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'ユーザー設定が更新されました',
        data: updatedSettings,
      });
    } catch {
      return HttpResponse.json(
        { error: 'ユーザー設定の更新に失敗しました' },
        { status: 500 }
      );
    }
  }),
];