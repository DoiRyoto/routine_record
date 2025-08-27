import { http, HttpResponse } from 'msw';

import {
  getMockRoutines,
  getMockRoutineById,
  createMockRoutine,
  updateMockRoutine,
  deleteMockRoutine,
} from '../data/routines';

export const routinesHandlers = [
  // GET: ルーチン一覧取得
  http.get('/api/routines', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return HttpResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    const routines = getMockRoutines(userId);
    return HttpResponse.json({
      success: true,
      data: routines,
    });
  }),

  // GET: 個別ルーチン取得
  http.get('/api/routines/:id', ({ params }) => {
    const { id } = params;
    
    if (typeof id !== 'string') {
      return HttpResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    const routine = getMockRoutineById(id);
    
    if (!routine) {
      return HttpResponse.json(
        { error: 'ルーチンが見つかりません' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: routine,
    });
  }),

  // POST: ルーチン作成
  http.post('/api/routines', async ({ request }) => {
    try {
      const body = await request.json() as any;
      const { name, description, category, goalType, targetCount, targetPeriod, recurrenceType, userId } = body;

      // バリデーション
      if (!name || !category || !goalType || !recurrenceType || !userId) {
        return HttpResponse.json(
          { error: '必須項目が不足しています' },
          { status: 400 }
        );
      }

      // 頻度ベースの場合は targetCount と targetPeriod が必要
      if (goalType === 'frequency_based' && (!targetCount || !targetPeriod)) {
        return HttpResponse.json(
          { error: '頻度ベースミッションには目標回数と期間が必要です' },
          { status: 400 }
        );
      }

      const newRoutine = createMockRoutine({
        userId,
        name,
        description: description || null,
        category,
        goalType,
        recurrenceType,
        targetCount: targetCount || null,
        targetPeriod: targetPeriod || null,
        isActive: true,
      });

      return HttpResponse.json({
        success: true,
        message: 'ルーチンが作成されました',
        data: newRoutine,
      });
    } catch {
      return HttpResponse.json(
        { error: 'ルーチンの作成に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // PATCH: ルーチン更新
  http.patch('/api/routines/:id', async ({ request, params }) => {
    try {
      const { id } = params;
      
      if (typeof id !== 'string') {
        return HttpResponse.json(
          { error: '無効なIDです' },
          { status: 400 }
        );
      }

      const updates = await request.json() as any;
      const updatedRoutine = updateMockRoutine(id, updates);

      if (!updatedRoutine) {
        return HttpResponse.json(
          { error: 'ルーチンが見つかりません' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'ルーチンが更新されました',
        data: updatedRoutine,
      });
    } catch {
      return HttpResponse.json(
        { error: 'ルーチンの更新に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // DELETE: ルーチン削除
  http.delete('/api/routines/:id', ({ params }) => {
    try {
      const { id } = params;
      
      if (typeof id !== 'string') {
        return HttpResponse.json(
          { error: '無効なIDです' },
          { status: 400 }
        );
      }

      const deletedRoutine = deleteMockRoutine(id);

      if (!deletedRoutine) {
        return HttpResponse.json(
          { error: 'ルーチンが見つかりません' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'ルーチンが削除されました',
      });
    } catch {
      return HttpResponse.json(
        { error: 'ルーチンの削除に失敗しました' },
        { status: 500 }
      );
    }
  }),
];