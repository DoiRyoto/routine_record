import { http, HttpResponse } from 'msw';

import {
  getMockUserChallenges,
  mockJoinChallenge,
  mockLeaveChallenge,
  mockUpdateChallengeProgress,
} from '../data/challenges';

export const userChallengesHandlers = [
  // GET: ユーザーチャレンジ一覧取得
  http.get('/api/user-challenges', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      
      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      const userChallenges = getMockUserChallenges(userId);
      return HttpResponse.json({
        success: true,
        data: userChallenges,
      });
    } catch (error) {
      console.error('GET /api/user-challenges mock error:', error);
      return HttpResponse.json(
        { error: 'ユーザーチャレンジの取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: ユーザーチャレンジ操作
  http.post('/api/user-challenges', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: 'join' | 'leave' | 'updateProgress';
        userId: string;
        challengeId?: string;
        progress?: number;
      };
      
      const { action, userId, challengeId, progress } = body;

      switch (action) {
        case 'join':
          if (!userId || !challengeId) {
            return HttpResponse.json(
              { error: 'userIdとchallengeIdが必要です' },
              { status: 400 }
            );
          }

          const newUserChallenge = mockJoinChallenge(userId, challengeId);
          return HttpResponse.json({
            success: true,
            data: newUserChallenge,
          });

        case 'leave':
          if (!userId || !challengeId) {
            return HttpResponse.json(
              { error: 'userIdとchallengeIdが必要です' },
              { status: 400 }
            );
          }

          mockLeaveChallenge(userId, challengeId);
          return HttpResponse.json({
            success: true,
            message: 'チャレンジから離脱しました',
          });

        case 'updateProgress':
          if (!userId || !challengeId || progress === undefined) {
            return HttpResponse.json(
              { error: 'userId、challengeId、progressが必要です' },
              { status: 400 }
            );
          }

          const updatedUserChallenge = mockUpdateChallengeProgress(userId, challengeId, progress);
          return HttpResponse.json({
            success: true,
            data: updatedUserChallenge,
          });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/user-challenges mock error:', error);
      
      if (error instanceof Error) {
        return HttpResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { error: 'ユーザーチャレンジの処理に失敗しました' },
        { status: 500 }
      );
    }
  }),
];