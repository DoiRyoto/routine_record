import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import { 
  getUserCatchupPlans,
  getActiveCatchupPlans,
  createCatchupPlan,
  updateCatchupPlan,
  updateCatchupPlanProgress,
  deactivateCatchupPlan,
  getCatchupPlanByRoutine,
  deleteCatchupPlan
} from '@/lib/db/queries/catchup-plans';

// Remove the repository imports for now - using direct queries instead

// 認証ユーザー取得のヘルパー関数
async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: '認証が必要です' 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const routineId = searchParams.get('routineId');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (routineId) {
      const plan = await getCatchupPlanByRoutine(user.id, routineId);
      if (!plan) {
        return NextResponse.json(
          { 
            success: false,
            error: '挽回プランが見つかりません' 
          },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: plan,
        message: '挽回プランを取得しました'
      });
    }

    let plans;
    if (activeOnly) {
      plans = await getActiveCatchupPlans(user.id);
    } else {
      plans = await getUserCatchupPlans(user.id);
    }

    return NextResponse.json({
      success: true,
      data: plans,
      message: plans.length > 0 ? '挽回プランを取得しました' : '挽回プランが見つかりませんでした'
    });
  } catch (error) {
    console.error('GET /api/catchup-plans error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '挽回プランの取得に失敗しました' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { 
          success: false,
          error: '認証が必要です' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, planId, ...planData } = body;

    // Input validation
    if (!action) {
      return NextResponse.json(
        { 
          success: false,
          error: '不正なアクションです' 
        },
        { status: 400 }
      );
    }

    switch (action) {
      case 'create':
        // Validate required fields for create
        if (!planData.routineId || !planData.targetPeriodStart || !planData.targetPeriodEnd) {
          return NextResponse.json(
            { 
              success: false,
              error: '必要なパラメータが不足しています' 
            },
            { status: 400 }
          );
        }

        // Validate progress values
        if (planData.currentProgress < 0) {
          return NextResponse.json(
            { 
              success: false,
              error: '進捗は0以上である必要があります' 
            },
            { status: 400 }
          );
        }

        // Check for existing active plan for the same routine
        const existingPlan = await getCatchupPlanByRoutine(user.id, planData.routineId);
        if (existingPlan) {
          return NextResponse.json(
            { 
              success: false,
              error: 'このルーチンには既にアクティブな挽回プランが存在します' 
            },
            { status: 409 }
          );
        }

        try {
          // For now, create plan with basic calculation
          // TODO: Integrate full calculation service once repositories are available
          
          const currentDate = new Date();
          const targetPeriodStart = new Date(planData.targetPeriodStart);
          const targetPeriodEnd = new Date(planData.targetPeriodEnd);
          
          // Basic calculation logic
          const originalTarget = planData.originalTarget || 30; // Default assumption
          const currentProgress = planData.currentProgress || 0;
          const remainingTarget = Math.max(0, originalTarget - currentProgress);
          
          // Calculate remaining days
          const remainingDays = Math.max(1, Math.ceil((targetPeriodEnd.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000)));
          const suggestedDailyTarget = Math.ceil(remainingTarget / remainingDays);

          // Create plan with calculated values
          const newPlan = await createCatchupPlan({ 
            ...planData,
            userId: user.id,
            originalTarget,
            currentProgress,
            remainingTarget,
            suggestedDailyTarget
          });

          return NextResponse.json({
            success: true,
            data: newPlan,
            message: '挽回プランを作成しました'
          }, { status: 201 });

        } catch (calculationError) {
          console.error('Calculation error:', calculationError);
          return NextResponse.json(
            { 
              success: false,
              error: '挽回プランの作成に失敗しました' 
            },
            { status: 500 }
          );
        }

      case 'update':
        if (!planId) {
          return NextResponse.json(
            { 
              success: false,
              error: 'planIdが必要です' 
            },
            { status: 400 }
          );
        }
        const updatedPlan = await updateCatchupPlan(planId, user.id, planData);
        return NextResponse.json({
          success: true,
          data: updatedPlan,
          message: '挽回プランを更新しました'
        });

      case 'updateProgress':
        if (!planId || planData.currentProgress === undefined) {
          return NextResponse.json(
            { 
              success: false,
              error: 'planIdとcurrentProgressが必要です' 
            },
            { status: 400 }
          );
        }

        // Validate progress values
        if (planData.currentProgress < 0) {
          return NextResponse.json(
            { 
              success: false,
              error: '進捗は0以上である必要があります' 
            },
            { status: 400 }
          );
        }

        try {
          const progressUpdatedPlan = await updateCatchupPlanProgress(
            planId,
            user.id,
            planData.currentProgress
          );

          // Check if target was reached and adjust message
          const message = progressUpdatedPlan.remainingTarget === 0
            ? '目標を達成しました！おめでとうございます！'
            : '挽回プラン進捗を更新しました';

          return NextResponse.json({
            success: true,
            data: progressUpdatedPlan,
            message
          });
        } catch (progressError) {
          if (progressError instanceof Error && progressError.message.includes('見つかりません')) {
            return NextResponse.json(
              { 
                success: false,
                error: '挽回プランが見つかりません' 
              },
              { status: 404 }
            );
          }
          throw progressError;
        }

      case 'deactivate':
        if (!planId) {
          return NextResponse.json(
            { 
              success: false,
              error: 'planIdが必要です' 
            },
            { status: 400 }
          );
        }
        
        // First get the plan before deactivating
        const planToDeactivate = await getCatchupPlanByRoutine(user.id, 'any'); // This is a workaround
        await deactivateCatchupPlan(planId, user.id);
        
        return NextResponse.json({ 
          success: true,
          data: { ...planToDeactivate, isActive: false },
          message: '挽回プランを非アクティブにしました' 
        });

      case 'delete':
        if (!planId) {
          return NextResponse.json(
            { 
              success: false,
              error: 'planIdが必要です' 
            },
            { status: 400 }
          );
        }
        const deletedPlan = await deleteCatchupPlan(planId, user.id);
        if (!deletedPlan) {
          return NextResponse.json(
            { 
              success: false,
              error: '削除対象の挽回プランが見つかりません' 
            },
            { status: 404 }
          );
        }
        return NextResponse.json({ 
          success: true,
          data: deletedPlan,
          message: '挽回プランを削除しました' 
        });

      default:
        return NextResponse.json(
          { 
            success: false,
            error: '不正なアクションです' 
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('POST /api/catchup-plans error:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false,
          error: '無効なJSONフォーマットです' 
        },
        { status: 400 }
      );
    }

    // Handle constraint violations
    if (error instanceof Error) {
      if (error.message.includes('constraint') || error.message.includes('foreign key')) {
        return NextResponse.json(
          { 
            success: false,
            error: '関連するルーチンが存在しません' 
          },
          { status: 400 }
        );
      }

      if (error.message.includes('unique') || error.message.includes('duplicate')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Unique constraint violation' 
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: '挽回プランの処理に失敗しました' 
      },
      { status: 500 }
    );
  }
}