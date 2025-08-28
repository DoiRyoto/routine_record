import type { Routine } from '@/lib/db/schema';

export const mockRoutines: Routine[] = [
  {
    id: '1',
    userId: 'user1',
    name: '朝のストレッチ',
    description: '1日を気持ちよく始めるための軽いストレッチ',
    category: '健康',
    goalType: 'schedule_based',
    recurrenceType: 'daily',
    recurrenceInterval: 1,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: null,
    startDate: null,
    targetCount: null,
    targetPeriod: null,
    deletedAt: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    userId: 'user1',
    name: '読書時間',
    description: '週に3回、30分間の読書習慣',
    category: '学習',
    goalType: 'frequency_based',
    recurrenceType: 'daily',
    recurrenceInterval: 1,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: null,
    startDate: null,
    targetCount: 3,
    targetPeriod: 'weekly',
    deletedAt: null,
    isActive: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: '3',
    userId: 'user1',
    name: 'ジム通い',
    description: '筋力トレーニングと有酸素運動',
    category: '健康',
    goalType: 'frequency_based',
    recurrenceType: 'daily',
    recurrenceInterval: 1,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: null,
    startDate: null,
    targetCount: 2,
    targetPeriod: 'weekly',
    deletedAt: null,
    isActive: true,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: '4',
    userId: 'user1',
    name: 'プログラミング学習',
    description: '新しいプログラミング技術の学習',
    category: '学習',
    goalType: 'schedule_based',
    recurrenceType: 'weekly',
    recurrenceInterval: 1,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: null,
    startDate: null,
    targetCount: null,
    targetPeriod: null,
    deletedAt: null,
    isActive: false,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: '5',
    userId: 'user1',
    name: '英語勉強',
    description: '毎日30分の英語学習',
    category: '学習',
    goalType: 'schedule_based',
    recurrenceType: 'daily',
    recurrenceInterval: 1,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: null,
    startDate: null,
    targetCount: null,
    targetPeriod: null,
    deletedAt: null,
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  {
    id: '6',
    userId: 'user2',
    name: 'ウォーキング',
    description: '健康維持のための散歩',
    category: '健康',
    goalType: 'frequency_based',
    recurrenceType: 'daily',
    recurrenceInterval: 1,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: null,
    startDate: null,
    targetCount: 5,
    targetPeriod: 'weekly',
    deletedAt: null,
    isActive: true,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-06'),
  },
  {
    id: '7',
    userId: 'user2',
    name: '料理実践',
    description: '新しい料理に挑戦',
    category: '趣味',
    goalType: 'frequency_based',
    recurrenceType: 'weekly',
    recurrenceInterval: 1,
    monthlyType: null,
    dayOfMonth: null,
    weekOfMonth: null,
    dayOfWeek: null,
    daysOfWeek: '[0,6]',
    startDate: null,
    targetCount: 2,
    targetPeriod: 'weekly',
    deletedAt: null,
    isActive: true,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-07'),
  },
];

// モック関数
export const getMockRoutines = (userId: string) =>
  mockRoutines.filter((routine) => routine.userId === userId);

export const getMockRoutineById = (id: string) => mockRoutines.find((routine) => routine.id === id);

export const getMockActiveRoutines = (userId: string) =>
  mockRoutines.filter((routine) => routine.userId === userId && routine.isActive);

export const createMockRoutine = (routineData: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newRoutine: Routine = {
    id: Math.random().toString(36).substring(2, 11),
    ...routineData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockRoutines.push(newRoutine);
  return newRoutine;
};

export const updateMockRoutine = (id: string, updates: Partial<Routine>) => {
  const index = mockRoutines.findIndex((routine) => routine.id === id);
  if (index !== -1) {
    mockRoutines[index] = {
      ...mockRoutines[index],
      ...updates,
      updatedAt: new Date(),
    };
    return mockRoutines[index];
  }
  return null;
};

export const deleteMockRoutine = (id: string) => {
  const index = mockRoutines.findIndex((routine) => routine.id === id);
  if (index !== -1) {
    return mockRoutines.splice(index, 1)[0];
  }
  return null;
};
