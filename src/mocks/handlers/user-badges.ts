import { http, HttpResponse } from 'msw';

import {
  getMockUserBadges,
  mockAwardBadge,
  mockMarkBadgeAsViewed,
} from '../data/user-profiles';

export const userBadgesHandlers = [
  // GET: ユーザーバッジ一覧取得
  http.get('/api/user-badges', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      const badges = getMockUserBadges(userId);
      return HttpResponse.json(badges);
    } catch (error) {
      console.error('GET /api/user-badges mock error:', error);
      return HttpResponse.json(
        { error: 'ユーザーバッジの取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: ユーザーバッジ操作
  http.post('/api/user-badges', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: 'award' | 'markViewed';
        userId: string;
        badgeId: string;
      };
      
      const { action, userId, badgeId } = body;

      switch (action) {
        case 'award':
          if (!userId || !badgeId) {
            return HttpResponse.json(
              { error: 'userIdとbadgeIdが必要です' },
              { status: 400 }
            );
          }

          const newUserBadge = mockAwardBadge(userId, badgeId);
          return HttpResponse.json(newUserBadge);

        case 'markViewed':
          if (!userId || !badgeId) {
            return HttpResponse.json(
              { error: 'userIdとbadgeIdが必要です' },
              { status: 400 }
            );
          }

          mockMarkBadgeAsViewed(userId, badgeId);
          return HttpResponse.json({ success: true });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/user-badges mock error:', error);
      
      if (error instanceof Error) {
        return HttpResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { error: 'バッジの処理に失敗しました' },
        { status: 500 }
      );
    }
  }),
];