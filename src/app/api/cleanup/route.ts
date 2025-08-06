import { and, isNotNull, lt } from 'drizzle-orm';
import { NextResponse, type NextRequest } from 'next/server';

import { db } from '@/lib/db';
import { routines } from '@/lib/db/schema';

// 削除されてから24時間経過したルーチンを物理削除するクリーンアップジョブ
export async function POST(request: NextRequest) {
  try {
    // 認証チェック（簡単なAPIキーまたはcronジョブ用の認証）
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CLEANUP_API_KEY}`) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 24時間前の時刻を計算
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // 削除されてから24時間経過したルーチンを物理削除
    const deletedRoutines = await db
      .delete(routines)
      .where(and(isNotNull(routines.deletedAt), lt(routines.deletedAt, twentyFourHoursAgo)))
      .returning();

    return NextResponse.json({
      success: true,
      message: `${deletedRoutines.length}件のルーチンを物理削除しました`,
      deleted: deletedRoutines.length,
    });
  } catch {
    return NextResponse.json({ error: 'クリーンアップに失敗しました' }, { status: 500 });
  }
}
