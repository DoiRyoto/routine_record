import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from '@/lib/auth/server';
import {
  createCategory,
  getUserCategories,
  getUserCategoryNames,
} from '@/lib/db/queries/categories';

// GET: ユーザーのカテゴリ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const namesOnly = searchParams.get('names') === 'true';

    if (namesOnly) {
      // カテゴリ名のみを返す（CategorySelectorで使用）
      const categoryNames = await getUserCategoryNames(session.user.id);
      return NextResponse.json({ categories: categoryNames });
    } else {
      // 完全なカテゴリオブジェクトを返す
      const categories = await getUserCategories(session.user.id);
      return NextResponse.json({ categories });
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST: 新しいカテゴリを作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const categoryData = {
      userId: session.user.id,
      name: name.trim(),
      color: color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      isDefault: false,
      isActive: true,
    };

    const newCategory = await createCategory(categoryData);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Failed to create category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
