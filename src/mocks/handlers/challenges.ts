import { http, HttpResponse } from 'msw';

import {
  getMockActiveChallenges,
  getMockUserChallenges,
  mockJoinChallenge,
  mockLeaveChallenge,
  mockUpdateChallengeProgress,
} from '../data/challenges';

export const challengesHandlers = [
  // GET /api/challenges - チャレンジ一覧取得
  http.get('/api/challenges', ({ request: _request }) => {
    try {
      const challenges = getMockActiveChallenges();
      return HttpResponse.json(challenges);
    } catch (error) {
      console.error('Mock challenges error:', error);
      return new HttpResponse(
        JSON.stringify({ error: 'チャレンジの取得に失敗しました' }),
        { status: 500 }
      );
    }
  }),

  // POST /api/challenges - チャレンジ参加・作成
  http.post('/api/challenges', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: string;
        userId: string;
        challengeId: string;
      };
      const { action, userId, challengeId } = body;

      switch (action) {
        case 'join':
          if (!userId || !challengeId) {
            return new HttpResponse(
              JSON.stringify({ error: 'userIdとchallengeIdが必要です' }),
              { status: 400 }
            );
          }
          
          const userChallenge = mockJoinChallenge(userId, challengeId);
          return HttpResponse.json(userChallenge);

        default:
          return new HttpResponse(
            JSON.stringify({ error: '不正なアクションです' }),
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('Mock challenges POST error:', error);
      return new HttpResponse(
        JSON.stringify({ error: error instanceof Error ? error.message : 'チャレンジの処理に失敗しました' }),
        { status: 400 }
      );
    }
  }),

  // DELETE /api/challenges/[id] - チャレンジ脱退
  http.delete('/api/challenges/:id', async ({ params, request }) => {
    try {
      const challengeId = params.id as string;
      const body = await request.json() as {
        userId: string;
      };
      const { userId } = body;

      if (!userId) {
        return new HttpResponse(
          JSON.stringify({ error: 'userIdが必要です' }),
          { status: 400 }
        );
      }

      mockLeaveChallenge(userId, challengeId);
      return HttpResponse.json({ success: true });
    } catch (error) {
      console.error('Mock challenges DELETE error:', error);
      return new HttpResponse(
        JSON.stringify({ error: error instanceof Error ? error.message : 'チャレンジからの脱退に失敗しました' }),
        { status: 400 }
      );
    }
  }),

  // PATCH /api/challenges/[id] - チャレンジ進捗更新
  http.patch('/api/challenges/:id', async ({ params, request }) => {
    try {
      const challengeId = params.id as string;
      const body = await request.json() as {
        userId: string;
        progress: number;
      };
      const { userId, progress } = body;

      if (!userId || progress === undefined) {
        return new HttpResponse(
          JSON.stringify({ error: 'userIdとprogressが必要です' }),
          { status: 400 }
        );
      }

      const updatedUserChallenge = mockUpdateChallengeProgress(userId, challengeId, progress);
      return HttpResponse.json(updatedUserChallenge);
    } catch (error) {
      console.error('Mock challenges PATCH error:', error);
      return new HttpResponse(
        JSON.stringify({ error: error instanceof Error ? error.message : 'チャレンジ進捗の更新に失敗しました' }),
        { status: 400 }
      );
    }
  }),

  // GET /api/user-challenges - ユーザーのチャレンジ参加状況取得
  http.get('/api/user-challenges', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');

      if (!userId) {
        return new HttpResponse(
          JSON.stringify({ error: 'userIdが必要です' }),
          { status: 400 }
        );
      }

      const userChallenges = getMockUserChallenges(userId);
      return HttpResponse.json(userChallenges);
    } catch (error) {
      console.error('Mock user-challenges error:', error);
      return new HttpResponse(
        JSON.stringify({ error: 'ユーザーチャレンジの取得に失敗しました' }),
        { status: 500 }
      );
    }
  }),
];