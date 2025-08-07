import { NextRequest, NextResponse } from 'next/server';

import { getServerSession } from '@/lib/auth/server';
import { deleteCategory, hardDeleteCategory, updateCategory } from '@/lib/db/queries/categories';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: カテゴリを更新
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // 更新可能なフィールドのみを許可
    const allowedFields = ['name', 'color', 'isActive'] as const;
    const updates: Partial<{ name: string; color: string; isActive: boolean }> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const updatedCategory = await updateCategory(id, updates);

    if (!updatedCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE: カテゴリを削除
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const hard = searchParams.get('hard') === 'true';

    if (hard) {
      // 完全削除
      await hardDeleteCategory(id);
    } else {
      // ソフトデリート
      await deleteCategory(id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
