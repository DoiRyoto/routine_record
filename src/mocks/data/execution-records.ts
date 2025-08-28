import type { ExecutionRecord } from '@/lib/db/schema';

export const mockExecutionRecords: ExecutionRecord[] = [
  {
    id: '1',
    routineId: '1',
    userId: 'user1',
    executedAt: new Date('2024-01-15T07:00:00'),
    duration: 15,
    memo: '気持ちよくストレッチできました',
    isCompleted: true,
    createdAt: new Date('2024-01-15T07:15:00'),
    updatedAt: new Date('2024-01-15T07:15:00'),
  },
  {
    id: '2',
    routineId: '2',
    userId: 'user1',
    executedAt: new Date('2024-01-15T20:00:00'),
    duration: 30,
    memo: 'ビジネス書を読みました',
    isCompleted: true,
    createdAt: new Date('2024-01-15T20:30:00'),
    updatedAt: new Date('2024-01-15T20:30:00'),
  },
  {
    id: '3',
    routineId: '1',
    userId: 'user1',
    executedAt: new Date('2024-01-16T07:00:00'),
    duration: 10,
    memo: '少し時間が短かったけど実行',
    isCompleted: true,
    createdAt: new Date('2024-01-16T07:10:00'),
    updatedAt: new Date('2024-01-16T07:10:00'),
  },
  {
    id: '4',
    routineId: '3',
    userId: 'user1',
    executedAt: new Date('2024-01-16T18:00:00'),
    duration: 60,
    memo: '筋トレと有酸素運動',
    isCompleted: true,
    createdAt: new Date('2024-01-16T19:00:00'),
    updatedAt: new Date('2024-01-16T19:00:00'),
  },
  {
    id: '5',
    routineId: '2',
    userId: 'user1',
    executedAt: new Date('2024-01-17T21:00:00'),
    duration: 25,
    memo: '技術書を読みました',
    isCompleted: true,
    createdAt: new Date('2024-01-17T21:25:00'),
    updatedAt: new Date('2024-01-17T21:25:00'),
  },
  {
    id: '6',
    routineId: '5',
    userId: 'user1',
    executedAt: new Date('2024-01-18T08:00:00'),
    duration: 35,
    memo: 'TOEIC対策を重点的に',
    isCompleted: true,
    createdAt: new Date('2024-01-18T08:35:00'),
    updatedAt: new Date('2024-01-18T08:35:00'),
  },
  {
    id: '7',
    routineId: '6',
    userId: 'user2',
    executedAt: new Date('2024-01-18T17:30:00'),
    duration: 45,
    memo: '公園を一周',
    isCompleted: true,
    createdAt: new Date('2024-01-18T18:15:00'),
    updatedAt: new Date('2024-01-18T18:15:00'),
  },
  {
    id: '8',
    routineId: '7',
    userId: 'user2',
    executedAt: new Date('2024-01-19T19:00:00'),
    duration: 90,
    memo: 'パスタを作りました',
    isCompleted: true,
    createdAt: new Date('2024-01-19T20:30:00'),
    updatedAt: new Date('2024-01-19T20:30:00'),
  },
  {
    id: '9',
    routineId: '1',
    userId: 'user1',
    executedAt: new Date('2024-01-19T07:15:00'),
    duration: 20,
    memo: '今日は念入りにストレッチ',
    isCompleted: true,
    createdAt: new Date('2024-01-19T07:35:00'),
    updatedAt: new Date('2024-01-19T07:35:00'),
  },
  {
    id: '10',
    routineId: '2',
    userId: 'user1',
    executedAt: new Date('2024-01-20T20:00:00'),
    duration: 40,
    memo: '小説を読みました',
    isCompleted: true,
    createdAt: new Date('2024-01-20T20:40:00'),
    updatedAt: new Date('2024-01-20T20:40:00'),
  },
];

// モック関数
export const getMockExecutionRecords = (userId: string) =>
  mockExecutionRecords.filter((record) => record.userId === userId);

export const getMockExecutionRecordById = (id: string) =>
  mockExecutionRecords.find((record) => record.id === id);

export const getMockExecutionRecordsByRoutine = (routineId: string) =>
  mockExecutionRecords.filter((record) => record.routineId === routineId);

export const getMockExecutionRecordsByDateRange = (
  startDate: Date,
  endDate: Date,
  userId: string
) =>
  mockExecutionRecords.filter(
    (record) =>
      record.userId === userId && record.executedAt >= startDate && record.executedAt <= endDate
  );

export const createMockExecutionRecord = (
  recordData: Omit<ExecutionRecord, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const newRecord: ExecutionRecord = {
    id: Math.random().toString(36).substring(2, 11),
    ...recordData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockExecutionRecords.push(newRecord);
  return newRecord;
};

export const updateMockExecutionRecord = (id: string, updates: Partial<ExecutionRecord>) => {
  const index = mockExecutionRecords.findIndex((record) => record.id === id);
  if (index !== -1) {
    mockExecutionRecords[index] = {
      ...mockExecutionRecords[index],
      ...updates,
      updatedAt: new Date(),
    };
    return mockExecutionRecords[index];
  }
  return null;
};

export const deleteMockExecutionRecord = (id: string) => {
  const index = mockExecutionRecords.findIndex((record) => record.id === id);
  if (index !== -1) {
    return mockExecutionRecords.splice(index, 1)[0];
  }
  return null;
};
