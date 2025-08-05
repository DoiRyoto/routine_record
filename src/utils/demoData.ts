import { Routine, ExecutionRecord } from '@/types/routine';

export const demoRoutines: Routine[] = [
  {
    id: 'demo-1',
    name: '朝の運動',
    description: '毎朝30分のジョギングまたはストレッチ',
    category: '健康',
    targetFrequency: 'daily',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'demo-2',
    name: '読書',
    description: '1日30分以上の読書時間を確保',
    category: '学習',
    targetFrequency: 'daily',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'demo-3',
    name: '瞑想',
    description: '10分間のマインドフルネス瞑想',
    category: '健康',
    targetFrequency: 'daily',
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'demo-4',
    name: '英語学習',
    description: 'オンライン英会話レッスン',
    category: '学習',
    targetFrequency: 'weekly',
    targetCount: 3,
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
  {
    id: 'demo-5',
    name: '家計簿記録',
    description: '支出の記録と家計管理',
    category: '生活',
    targetFrequency: 'weekly',
    targetCount: 1,
    createdAt: new Date('2024-01-01'),
    isActive: true,
  },
];

export const demoExecutionRecords: ExecutionRecord[] = [
  // 今日の記録
  {
    id: 'exec-1',
    routineId: 'demo-1',
    executedAt: new Date(),
    duration: 30,
    isCompleted: true,
  },
  {
    id: 'exec-2',
    routineId: 'demo-2',
    executedAt: new Date(),
    duration: 45,
    isCompleted: true,
  },
  // 昨日の記録
  {
    id: 'exec-3',
    routineId: 'demo-1',
    executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 25,
    isCompleted: true,
  },
  {
    id: 'exec-4',
    routineId: 'demo-2',
    executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 35,
    isCompleted: true,
  },
  {
    id: 'exec-5',
    routineId: 'demo-3',
    executedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    duration: 10,
    isCompleted: true,
  },
  // 一昨日の記録
  {
    id: 'exec-6',
    routineId: 'demo-1',
    executedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: 35,
    isCompleted: true,
  },
  {
    id: 'exec-7',
    routineId: 'demo-4',
    executedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: 60,
    isCompleted: true,
  },
];