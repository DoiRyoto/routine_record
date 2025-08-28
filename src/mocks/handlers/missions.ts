import { http, HttpResponse } from 'msw';

import {
  getMockAllMissions,
  getMockMissionById,
} from '../data/missions';

export const missionsHandlers = [
  // GET: ミッション一覧取得
  http.get('/api/missions', ({ request }) => {
    try {
      const url = new URL(request.url);
      const missionId = url.searchParams.get('id');
      
      if (missionId) {
        const mission = getMockMissionById(missionId);
        if (!mission) {
          return HttpResponse.json(
            { error: 'ミッションが見つかりません' },
            { status: 404 }
          );
        }
        return HttpResponse.json(mission);
      }
      
      const missions = getMockAllMissions();
      return HttpResponse.json(missions);
    } catch (error) {
      console.error('GET /api/missions mock error:', error);
      return HttpResponse.json(
        { error: 'ミッションの取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: ミッション関連操作
  http.post('/api/missions', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: string;
        [key: string]: any;
      };
      
      const { action } = body;

      switch (action) {
        case 'getMissions':
          const missions = getMockAllMissions();
          return HttpResponse.json({
            success: true,
            data: missions,
          });

        case 'getMission':
          const { missionId } = body;
          if (!missionId) {
            return HttpResponse.json(
              { error: 'missionIdが必要です' },
              { status: 400 }
            );
          }
          
          const mission = getMockMissionById(missionId);
          if (!mission) {
            return HttpResponse.json(
              { error: 'ミッションが見つかりません' },
              { status: 404 }
            );
          }
          
          return HttpResponse.json({
            success: true,
            data: mission,
          });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/missions mock error:', error);
      
      if (error instanceof Error) {
        return HttpResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { error: 'ミッションの処理に失敗しました' },
        { status: 500 }
      );
    }
  }),
];