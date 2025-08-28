import type { CatchupPlan } from '@/lib/db/schema';

export const mockCatchupPlans: CatchupPlan[] = [
  {
    id: '1',
    routineId: '1',
    userId: 'user1',
    targetPeriodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    targetPeriodEnd: new Date(),
    originalTarget: 7,
    currentProgress: 4,
    remainingTarget: 3,
    suggestedDailyTarget: 2,
    isActive: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    routineId: '2',
    userId: 'user1',
    targetPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    targetPeriodEnd: new Date(),
    originalTarget: 3,
    currentProgress: 1,
    remainingTarget: 2,
    suggestedDailyTarget: 1,
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    routineId: '6',
    userId: 'user2',
    targetPeriodStart: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    targetPeriodEnd: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    originalTarget: 5,
    currentProgress: 5,
    remainingTarget: 0,
    suggestedDailyTarget: 0,
    isActive: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

// Mock関数 - lib/db/queries/catchup-plans.ts に対応
export const getMockCatchupPlans = (userId: string): CatchupPlan[] => {
  return mockCatchupPlans.filter(plan => plan.userId === userId);
};

export const getMockActiveCatchupPlans = (userId: string): CatchupPlan[] => {
  return mockCatchupPlans.filter(plan => plan.userId === userId && plan.isActive);
};

export const getMockCatchupPlanById = (id: string): CatchupPlan | null => {
  return mockCatchupPlans.find(plan => plan.id === id) || null;
};

export const getMockCatchupPlanByRoutine = (routineId: string, userId: string): CatchupPlan | null => {
  return mockCatchupPlans.find(plan => 
    plan.routineId === routineId && plan.userId === userId && plan.isActive
  ) || null;
};

export const mockCreateCatchupPlan = (
  planData: Omit<CatchupPlan, 'id' | 'createdAt' | 'updatedAt'>
): CatchupPlan => {
  const newPlan: CatchupPlan = {
    id: `catchup-plan-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    ...planData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockCatchupPlans.push(newPlan);
  return newPlan;
};

export const mockUpdateCatchupPlan = (
  id: string,
  updates: Partial<Omit<CatchupPlan, 'id' | 'createdAt' | 'updatedAt'>>
): CatchupPlan => {
  const plan = mockCatchupPlans.find(p => p.id === id);
  if (!plan) {
    throw new Error('挽回プランが見つかりません');
  }
  
  Object.assign(plan, updates, { updatedAt: new Date() });
  return plan;
};

export const mockDeactivateCatchupPlan = (id: string): CatchupPlan => {
  const plan = mockCatchupPlans.find(p => p.id === id);
  if (!plan) {
    throw new Error('挽回プランが見つかりません');
  }
  
  plan.isActive = false;
  plan.updatedAt = new Date();
  return plan;
};

export const mockDeleteCatchupPlan = (id: string): void => {
  const index = mockCatchupPlans.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('挽回プランが見つかりません');
  }
  
  mockCatchupPlans.splice(index, 1);
};