import { http, HttpResponse } from 'msw';

import {
  getMockAllBadges,
  getMockBadgesByCategory,
  mockCreateBadge,
  mockUpdateBadge,
  mockDeleteBadge,
} from '../data/badges';

export const badgesHandlers = [
  // GET: バッジ一覧取得
  http.get('/api/badges', ({ request }) => {
    try {
      const url = new URL(request.url);
      const category = url.searchParams.get('category');
      
      let badges;
      if (category) {
        badges = getMockBadgesByCategory(category);
      } else {
        badges = getMockAllBadges();
      }
      
      return HttpResponse.json(badges);
    } catch (error) {
      console.error('GET /api/badges mock error:', error);
      return HttpResponse.json(
        { error: 'バッジの取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: バッジ作成・更新・削除
  http.post('/api/badges', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: 'create' | 'update' | 'delete';
        badgeId?: string;
        name?: string;
        description?: string;
        iconUrl?: string;
        rarity?: 'common' | 'rare' | 'epic' | 'legendary';
        category?: string;
      };
      
      const { action, badgeId, ...badgeData } = body;

      switch (action) {
        case 'create':
          if (!badgeData.name || !badgeData.description || !badgeData.category) {
            return HttpResponse.json(
              { error: 'name, description, categoryが必要です' },
              { status: 400 }
            );
          }
          
          const newBadge = mockCreateBadge({
            name: badgeData.name,
            description: badgeData.description,
            iconUrl: badgeData.iconUrl || null,
            rarity: badgeData.rarity || 'common',
            category: badgeData.category,
          });
          
          return HttpResponse.json(newBadge);

        case 'update':
          if (!badgeId) {
            return HttpResponse.json(
              { error: 'badgeIdが必要です' },
              { status: 400 }
            );
          }
          
          const updatedBadge = mockUpdateBadge(badgeId, badgeData);
          return HttpResponse.json(updatedBadge);

        case 'delete':
          if (!badgeId) {
            return HttpResponse.json(
              { error: 'badgeIdが必要です' },
              { status: 400 }
            );
          }
          
          mockDeleteBadge(badgeId);
          return HttpResponse.json({ message: 'バッジが削除されました' });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/badges mock error:', error);
      
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