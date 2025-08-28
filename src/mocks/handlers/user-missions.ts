import { http, HttpResponse } from 'msw';

import {
  getMockUserMissions,
  getMockUserMissionById,
  mockStartMission,
  mockUpdateMissionProgress,
  mockClaimMissionReward,
} from '../data/missions';

export const userMissionsHandlers = [
  // GET: ユーザーミッション一覧取得
  http.get('/api/user-missions', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const userMissionId = url.searchParams.get('id');
      
      if (userMissionId) {
        const userMission = getMockUserMissionById(userMissionId);
        if (!userMission) {
          return HttpResponse.json(
            { error: 'ユーザーミッションが見つかりません' },
            { status: 404 }
          );
        }
        return HttpResponse.json(userMission);
      }
      
      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      const userMissions = getMockUserMissions(userId);
      return HttpResponse.json(userMissions);
    } catch (error) {
      console.error('GET /api/user-missions mock error:', error);
      return HttpResponse.json(
        { error: 'ユーザーミッションの取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: ユーザーミッション操作
  http.post('/api/user-missions', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: 'start' | 'updateProgress' | 'claimReward';
        userId?: string;
        missionId?: string;
        userMissionId?: string;
        progress?: number;
      };
      
      const { action, userId, missionId, userMissionId, progress } = body;

      switch (action) {
        case 'start':
          if (!userId || !missionId) {
            return HttpResponse.json(
              { error: 'userIdとmissionIdが必要です' },
              { status: 400 }
            );
          }

          const newUserMission = mockStartMission(userId, missionId);
          return HttpResponse.json({
            success: true,
            data: newUserMission,
          });

        case 'updateProgress':
          if (!userMissionId || progress === undefined) {
            return HttpResponse.json(
              { error: 'userMissionIdとprogressが必要です' },
              { status: 400 }
            );
          }

          const updatedUserMission = mockUpdateMissionProgress(userMissionId, progress);
          return HttpResponse.json({
            success: true,
            data: updatedUserMission,
          });

        case 'claimReward':
          if (!userMissionId) {
            return HttpResponse.json(
              { error: 'userMissionIdが必要です' },
              { status: 400 }
            );
          }

          const claimedUserMission = mockClaimMissionReward(userMissionId);
          return HttpResponse.json({
            success: true,
            data: claimedUserMission,
          });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/user-missions mock error:', error);
      
      if (error instanceof Error) {
        return HttpResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { error: 'ユーザーミッションの処理に失敗しました' },
        { status: 500 }
      );
    }
  }),
];