import { http, HttpResponse } from 'msw';

import {
  getMockExecutionRecords,
  getMockExecutionRecordById,
  getMockExecutionRecordsByDateRange,
  createMockExecutionRecord,
  updateMockExecutionRecord,
  deleteMockExecutionRecord,
} from '../data/execution-records';

export const executionRecordsHandlers = [
  // GET: 実行記録一覧取得
  http.get('/api/execution-records', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    if (!userId) {
      return HttpResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    let records;
    if (startDate && endDate) {
      records = getMockExecutionRecordsByDateRange(
        new Date(startDate),
        new Date(endDate),
        userId
      );
    } else {
      records = getMockExecutionRecords(userId);
    }

    return HttpResponse.json({
      success: true,
      data: records,
    });
  }),

  // GET: 個別実行記録取得
  http.get('/api/execution-records/:id', ({ params }) => {
    const { id } = params;
    
    if (typeof id !== 'string') {
      return HttpResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    const record = getMockExecutionRecordById(id);
    
    if (!record) {
      return HttpResponse.json(
        { error: '実行記録が見つかりません' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: record,
    });
  }),

  // POST: 実行記録作成
  http.post('/api/execution-records', async ({ request }) => {
    try {
      const body = await request.json() as {
        routineId: string;
        userId: string;
        executedAt?: Date | string;
        duration?: number;
        memo?: string;
        isCompleted?: boolean;
      };
      const { routineId, userId, executedAt, duration, memo, isCompleted } = body;

      // バリデーション
      if (!routineId || !userId) {
        return HttpResponse.json(
          { error: 'ルーチンIDとユーザーIDが必要です' },
          { status: 400 }
        );
      }

      const newRecord = createMockExecutionRecord({
        routineId,
        userId,
        executedAt: executedAt ? new Date(executedAt) : new Date(),
        duration: duration || null,
        memo: memo || null,
        isCompleted: isCompleted !== undefined ? isCompleted : false,
      });

      return HttpResponse.json({
        success: true,
        message: '実行記録が作成されました',
        data: newRecord,
      });
    } catch {
      return HttpResponse.json(
        { error: '実行記録の作成に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // PATCH: 実行記録更新
  http.patch('/api/execution-records/:id', async ({ request, params }) => {
    try {
      const { id } = params;
      
      if (typeof id !== 'string') {
        return HttpResponse.json(
          { error: '無効なIDです' },
          { status: 400 }
        );
      }

      const updates = await request.json() as {
        executedAt?: Date | string;
        duration?: number;
        memo?: string;
        isCompleted?: boolean;
      };
      
      const processedUpdates = {
        ...updates,
        executedAt: updates.executedAt ? new Date(updates.executedAt) : undefined
      };

      const updatedRecord = updateMockExecutionRecord(id, processedUpdates);

      if (!updatedRecord) {
        return HttpResponse.json(
          { error: '実行記録が見つかりません' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: '実行記録が更新されました',
        data: updatedRecord,
      });
    } catch {
      return HttpResponse.json(
        { error: '実行記録の更新に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // DELETE: 実行記録削除
  http.delete('/api/execution-records/:id', ({ params }) => {
    try {
      const { id } = params;
      
      if (typeof id !== 'string') {
        return HttpResponse.json(
          { error: '無効なIDです' },
          { status: 400 }
        );
      }

      const deletedRecord = deleteMockExecutionRecord(id);

      if (!deletedRecord) {
        return HttpResponse.json(
          { error: '実行記録が見つかりません' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: '実行記録が削除されました',
      });
    } catch {
      return HttpResponse.json(
        { error: '実行記録の削除に失敗しました' },
        { status: 500 }
      );
    }
  }),
];