import { http, HttpResponse } from 'msw';

import {
  getMockCatchupPlans,
  getMockActiveCatchupPlans,
  getMockCatchupPlanById,
  getMockCatchupPlanByRoutine,
  mockCreateCatchupPlan,
  mockUpdateCatchupPlan,
  mockDeactivateCatchupPlan,
  mockDeleteCatchupPlan,
} from '../data/catchup-plans';

export const catchupPlansHandlers = [
  // GET: 挽回プラン一覧取得
  http.get('/api/catchup-plans', ({ request }) => {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const routineId = url.searchParams.get('routineId');
      const activeOnly = url.searchParams.get('activeOnly') === 'true';
      const planId = url.searchParams.get('id');
      
      if (planId) {
        const plan = getMockCatchupPlanById(planId);
        if (!plan) {
          return HttpResponse.json(
            { error: '挽回プランが見つかりません' },
            { status: 404 }
          );
        }
        return HttpResponse.json({
          success: true,
          data: plan,
        });
      }

      if (!userId) {
        return HttpResponse.json(
          { error: 'userIdが必要です' },
          { status: 400 }
        );
      }

      let plans;
      if (routineId) {
        const plan = getMockCatchupPlanByRoutine(routineId, userId);
        plans = plan ? [plan] : [];
      } else if (activeOnly) {
        plans = getMockActiveCatchupPlans(userId);
      } else {
        plans = getMockCatchupPlans(userId);
      }

      return HttpResponse.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      console.error('GET /api/catchup-plans mock error:', error);
      return HttpResponse.json(
        { error: '挽回プランの取得に失敗しました' },
        { status: 500 }
      );
    }
  }),

  // POST: 挽回プラン操作
  http.post('/api/catchup-plans', async ({ request }) => {
    try {
      const body = await request.json() as {
        action: 'create' | 'update' | 'deactivate' | 'delete';
        planId?: string;
        routineId?: string;
        userId?: string;
        targetPeriodStart?: string;
        targetPeriodEnd?: string;
        originalTarget?: number;
        currentProgress?: number;
        remainingTarget?: number;
        suggestedDailyTarget?: number;
        [key: string]: any;
      };
      
      const { action, planId, ...planData } = body;

      switch (action) {
        case 'create':
          if (!planData.routineId || !planData.userId || !planData.targetPeriodStart || !planData.targetPeriodEnd) {
            return HttpResponse.json(
              { error: 'routineId, userId, targetPeriodStart, targetPeriodEndが必要です' },
              { status: 400 }
            );
          }

          const newPlan = mockCreateCatchupPlan({
            routineId: planData.routineId,
            userId: planData.userId,
            targetPeriodStart: new Date(planData.targetPeriodStart),
            targetPeriodEnd: new Date(planData.targetPeriodEnd),
            originalTarget: planData.originalTarget || 0,
            currentProgress: planData.currentProgress || 0,
            remainingTarget: planData.remainingTarget || 0,
            suggestedDailyTarget: planData.suggestedDailyTarget || 1,
            isActive: true,
          });

          return HttpResponse.json({
            success: true,
            data: newPlan,
          });

        case 'update':
          if (!planId) {
            return HttpResponse.json(
              { error: 'planIdが必要です' },
              { status: 400 }
            );
          }

          const updateData: any = { ...planData };
          if (updateData.targetPeriodStart) {
            updateData.targetPeriodStart = new Date(updateData.targetPeriodStart);
          }
          if (updateData.targetPeriodEnd) {
            updateData.targetPeriodEnd = new Date(updateData.targetPeriodEnd);
          }
          
          const updatedPlan = mockUpdateCatchupPlan(planId, updateData);
          return HttpResponse.json({
            success: true,
            data: updatedPlan,
          });

        case 'deactivate':
          if (!planId) {
            return HttpResponse.json(
              { error: 'planIdが必要です' },
              { status: 400 }
            );
          }

          const deactivatedPlan = mockDeactivateCatchupPlan(planId);
          return HttpResponse.json({
            success: true,
            data: deactivatedPlan,
          });

        case 'delete':
          if (!planId) {
            return HttpResponse.json(
              { error: 'planIdが必要です' },
              { status: 400 }
            );
          }

          mockDeleteCatchupPlan(planId);
          return HttpResponse.json({
            success: true,
            message: '挽回プランを削除しました',
          });

        default:
          return HttpResponse.json(
            { error: '不正なアクションです' },
            { status: 400 }
          );
      }
    } catch (error) {
      console.error('POST /api/catchup-plans mock error:', error);
      
      if (error instanceof Error) {
        return HttpResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return HttpResponse.json(
        { error: '挽回プランの処理に失敗しました' },
        { status: 500 }
      );
    }
  }),
];