import { http, HttpResponse } from 'msw';

import {
  getMockCategories,
  getMockCategoryById,
  createMockCategory,
  updateMockCategory,
  deleteMockCategory,
} from '../data/categories';

export const categoriesHandlers = [
  // GET: カテゴリ一覧取得
  http.get('/api/categories', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return HttpResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    const categories = getMockCategories(userId);
    return HttpResponse.json({
      success: true,
      data: categories,
    });
  }),

  // GET: 個別カテゴリ取得
  http.get('/api/categories/:id', ({ params }) => {
    const { id } = params;
    
    if (typeof id !== 'string') {
      return HttpResponse.json(
        { error: '無効なIDです' },
        { status: 400 }
      );
    }

    const category = getMockCategoryById(id);
    
    if (!category) {
      return HttpResponse.json(
        { error: 'カテゴリが見つかりません' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: category,
    });
  }),

  // POST: カテゴリ作成
  http.post('/api/categories', async ({ request }) => {
    try {
      const body = await request.json() as any;
      const { name, description, color, userId } = body;

      // バリデーション
      if (!name || !userId) {
        return HttpResponse.json(
          { error: '必須項目が不足しています' },
          { status: 400 }
        );
      }

      const newCategory = createMockCategory({
        userId,
        name,
        description: description || null,
        color: color || '#4CAF50',
        isActive: true,
      });

      return HttpResponse.json({
        success: true,
        message: 'カテゴリが作成されました',
        data: newCategory,
      });
    } catch {
      return HttpResponse.json(
        { error: 'カテゴリの作成に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // PATCH: カテゴリ更新
  http.patch('/api/categories/:id', async ({ request, params }) => {
    try {
      const { id } = params;
      
      if (typeof id !== 'string') {
        return HttpResponse.json(
          { error: '無効なIDです' },
          { status: 400 }
        );
      }

      const updates = await request.json() as any;
      const updatedCategory = updateMockCategory(id, updates);

      if (!updatedCategory) {
        return HttpResponse.json(
          { error: 'カテゴリが見つかりません' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'カテゴリが更新されました',
        data: updatedCategory,
      });
    } catch {
      return HttpResponse.json(
        { error: 'カテゴリの更新に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // DELETE: カテゴリ削除
  http.delete('/api/categories/:id', ({ params }) => {
    try {
      const { id } = params;
      
      if (typeof id !== 'string') {
        return HttpResponse.json(
          { error: '無効なIDです' },
          { status: 400 }
        );
      }

      const deletedCategory = deleteMockCategory(id);

      if (!deletedCategory) {
        return HttpResponse.json(
          { error: 'カテゴリが見つかりません' },
          { status: 404 }
        );
      }

      return HttpResponse.json({
        success: true,
        message: 'カテゴリが削除されました',
      });
    } catch {
      return HttpResponse.json(
        { error: 'カテゴリの削除に失敗しました' },
        { status: 500 }
      );
    }
  }),
];