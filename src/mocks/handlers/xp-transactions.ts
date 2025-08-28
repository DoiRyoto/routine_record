import { http, HttpResponse } from 'msw';

import { getMockXPHistory } from '../data/user-profiles';

export const xpTransactionsHandlers = [
  // GET: XP取引履歴取得
  http.get('/api/xp-transactions', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const limit = url.searchParams.get('limit');
      
      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      const limitNumber = limit ? parseInt(limit, 10) : 50;
      const transactions = getMockXPHistory(userId, limitNumber);

      return HttpResponse.json({
        success: true,
        data: transactions,
      });
    } catch (error) {
      console.error('GET /api/xp-transactions mock error:', error);
      return HttpResponse.json(
        { error: 'XP取引履歴の取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: XP取引履歴関連操作
  http.post('/api/xp-transactions', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: 'getHistory';
        userId: string;
        limit?: number;
      };
      
      const { action, userId, limit } = body;

      switch (action) {
        case 'getHistory':
          if (!userId) {
            return HttpResponse.json(
              { error: 'userIdが必要です' },
              { status: 400 }
            );
          }

          const transactions = getMockXPHistory(userId, limit || 50);
          return HttpResponse.json({
            success: true,
            data: transactions,
          });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/xp-transactions mock error:', error);
      
      if (error instanceof Error) {
        return HttpResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { error: 'XP取引履歴の処理に失敗しました' },
        { status: 500 }
      );
    }
  }),
];