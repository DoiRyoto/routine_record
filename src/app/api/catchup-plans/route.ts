import { NextRequest, NextResponse } from 'next/server';

import { 
  getUserCatchupPlans,
  getActiveCatchupPlans,
  createCatchupPlan,
  updateCatchupPlan,
  updateCatchupPlanProgress,
  deactivateCatchupPlan,
  getCatchupPlanByRoutine
} from '@/lib/db/queries/catchup-plans';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const routineId = searchParams.get('routineId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userIdが必要です' },
        { status: 400 }
      );
    }

    if (routineId) {
      const plan = await getCatchupPlanByRoutine(userId, routineId);
      return NextResponse.json(plan);
    }

    let plans;
    if (activeOnly) {
      plans = await getActiveCatchupPlans(userId);
    } else {
      plans = await getUserCatchupPlans(userId);
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('GET /api/catchup-plans error:', error);
    return NextResponse.json(
      { error: '挽回プランの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, planId, ...planData } = body;

    switch (action) {
      case 'create':
        if (!userId) {
          return NextResponse.json(
            { error: 'userIdが必要です' },
            { status: 400 }
          );
        }
        const newPlan = await createCatchupPlan({ ...planData, userId });
        return NextResponse.json(newPlan);

      case 'update':
        if (!userId || !planId) {
          return NextResponse.json(
            { error: 'userIdとplanIdが必要です' },
            { status: 400 }
          );
        }
        const updatedPlan = await updateCatchupPlan(planId, userId, planData);
        return NextResponse.json(updatedPlan);

      case 'updateProgress':
        if (!userId || !planId || planData.currentProgress === undefined) {
          return NextResponse.json(
            { error: 'userId、planId、currentProgressが必要です' },
            { status: 400 }
          );
        }
        const progressUpdatedPlan = await updateCatchupPlanProgress(
          planId,
          userId,
          planData.currentProgress
        );
        return NextResponse.json(progressUpdatedPlan);

      case 'deactivate':
        if (!userId || !planId) {
          return NextResponse.json(
            { error: 'userIdとplanIdが必要です' },
            { status: 400 }
          );
        }
        await deactivateCatchupPlan(planId, userId);
        return NextResponse.json({ message: '挽回プランを非アクティブにしました' });

      default:
        return NextResponse.json(
          { error: '不正なアクションです' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/catchup-plans error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '挽回プランの処理に失敗しました' },
      { status: 500 }
    );
  }
}