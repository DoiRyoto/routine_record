import { http, HttpResponse } from 'msw';

// import { getMockStreakData } from '../data/gamification'; // Removed non-existent module
import {
  getMockUserProfile,
  mockCreateUserProfile,
  mockUpdateUserProfile,
  getMockUserBadges,
  mockAwardBadge,
  mockMarkBadgeAsViewed,
  mockAddXP,
  mockUpdateStreak,
  mockUpdateUserStats,
} from '../data/user-profiles';

export const userProfilesHandlers = [
  // GET /api/user-profiles - ユーザープロフィール取得
  http.get('/api/user-profiles', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const includeDetails = url.searchParams.get('includeDetails') === 'true';

      if (!userId) {
        return new HttpResponse(
          JSON.stringify({ error: 'userIdが必要です' }),
          { status: 400 }
        );
      }

      const userProfile = getMockUserProfile(userId);
      
      if (!userProfile) {
        return new HttpResponse(
          JSON.stringify({ error: 'ユーザープロフィールが見つかりません' }),
          { status: 404 }
        );
      }

      if (includeDetails) {
        const badges = getMockUserBadges(userId);
        // const streakData = getMockStreakData(userId); // Temporarily removed

        return HttpResponse.json({
          userProfile: {
            ...userProfile,
            badges
          },
          // streakData // Temporarily removed
        });
      }

      return HttpResponse.json(userProfile);
    } catch (error) {
      console.error('Mock user-profiles GET error:', error);
      return new HttpResponse(
        JSON.stringify({ error: 'ユーザープロフィールの取得に失敗しました' }),
        { status: 500 }
      );
    }
  }),

  // POST /api/user-profiles - ユーザープロフィール作成・更新・XP追加など
  http.post('/api/user-profiles', async ({ request }) => {
    try {
      const body = await request.json() as Record<string, unknown>;
      const { action, userId, ...data } = body;
      
      if (typeof userId !== 'string') {
        return new HttpResponse(
          JSON.stringify({ error: 'userIdが必要です' }),
          { status: 400 }
        );
      }

      switch (action) {
        case 'create':
          const newProfile = mockCreateUserProfile({
            userId,
            level: 1,
            totalXP: 0,
            currentXP: 0,
            nextLevelXP: 100,
            streak: 0,
            longestStreak: 0,
            totalRoutines: 0,
            totalExecutions: 0,
            joinedAt: new Date(),
            lastActiveAt: new Date(),
            ...data
          });
          return HttpResponse.json(newProfile);

        case 'update':
          const updatedProfile = mockUpdateUserProfile(userId, data);
          return HttpResponse.json(updatedProfile);

        case 'addXP':
          const { amount, reason, sourceType, sourceId } = data;
          if (typeof amount !== 'number' || typeof reason !== 'string' || typeof sourceType !== 'string') {
            return new HttpResponse(
              JSON.stringify({ error: 'amount, reason, sourceTypeが必要です' }),
              { status: 400 }
            );
          }

          const xpResult = mockAddXP(
            userId, 
            amount, 
            reason, 
            sourceType as 'routine_completion' | 'streak_bonus' | 'mission_completion' | 'challenge_completion' | 'daily_bonus' | 'achievement_unlock', 
            typeof sourceId === 'string' ? sourceId : undefined
          );
          return HttpResponse.json(xpResult);

        case 'updateStreak':
          const { streak } = data;
          if (typeof streak !== 'number') {
            return new HttpResponse(
              JSON.stringify({ error: 'streakが必要です' }),
              { status: 400 }
            );
          }

          const updatedStreakProfile = mockUpdateStreak(userId, streak);
          return HttpResponse.json(updatedStreakProfile);

        case 'updateStats':
          const statsProfile = mockUpdateUserStats(userId, data);
          return HttpResponse.json(statsProfile);

        default:
          return new HttpResponse(
            JSON.stringify({ error: '不正なアクションです' }),
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('Mock user-profiles POST error:', error);
      return new HttpResponse(
        JSON.stringify({ error: error instanceof Error ? error.message : 'ユーザープロフィールの処理に失敗しました' }),
        { status: 400 }
      );
    }
  }),

  // GET /api/user-badges - ユーザーバッジ取得
  http.get('/api/user-badges', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');

      if (!userId) {
        return new HttpResponse(
          JSON.stringify({ error: 'userIdが必要です' }),
          { status: 400 }
        );
      }

      const badges = getMockUserBadges(userId);
      return HttpResponse.json(badges);
    } catch (error) {
      console.error('Mock user-badges GET error:', error);
      return new HttpResponse(
        JSON.stringify({ error: 'ユーザーバッジの取得に失敗しました' }),
        { status: 500 }
      );
    }
  }),

  // POST /api/user-badges - バッジ付与・既読処理
  http.post('/api/user-badges', async ({ request }) => {
    try {
      const body = await request.json() as Record<string, unknown>;
      const { action, userId, badgeId } = body;
      
      if (typeof userId !== 'string' || typeof badgeId !== 'string') {
        return new HttpResponse(
          JSON.stringify({ error: 'userIdとbadgeIdが必要です' }),
          { status: 400 }
        );
      }

      switch (action) {
        case 'award':
          if (!userId || !badgeId) {
            return new HttpResponse(
              JSON.stringify({ error: 'userIdとbadgeIdが必要です' }),
              { status: 400 }
            );
          }

          const newUserBadge = mockAwardBadge(userId, badgeId);
          return HttpResponse.json(newUserBadge);

        case 'markViewed':
          if (!userId || !badgeId) {
            return new HttpResponse(
              JSON.stringify({ error: 'userIdとbadgeIdが必要です' }),
              { status: 400 }
            );
          }

          mockMarkBadgeAsViewed(userId, badgeId);
          return HttpResponse.json({ success: true });

        default:
          return new HttpResponse(
            JSON.stringify({ error: '不正なアクションです' }),
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('Mock user-badges POST error:', error);
      return new HttpResponse(
        JSON.stringify({ error: error instanceof Error ? error.message : 'バッジの処理に失敗しました' }),
        { status: 400 }
      );
    }
  }),
];