import type { Meta, StoryObj } from '@storybook/nextjs';

import type { Habit, HabitLog } from '@/lib/db/schema';

import DashboardPage from './DashboardPage';

const meta = {
  title: 'Pages/DashboardPage',
  component: DashboardPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DashboardPage>;

export default meta;
type Story = StoryObj<typeof meta>;

// モックデータ: 習慣
const mockHabits: Habit[] = [
  {
    id: 'habit-1',
    userId: 'user-1',
    name: 'ランニング',
    frequencyType: 'weekly',
    targetCount: 3,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'habit-2',
    userId: 'user-1',
    name: '読書',
    frequencyType: 'weekly',
    targetCount: 5,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  {
    id: 'habit-3',
    userId: 'user-1',
    name: '瞑想',
    frequencyType: 'monthly',
    targetCount: 20,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
];

// モックデータ: 習慣ログ（進捗状況を作るため）
const mockHabitLogs: HabitLog[] = [
  // ランニング（週3回目標、現在2回完了）
  {
    id: 'log-1',
    habitId: 'habit-1',
    doneAt: new Date(),
  },
  {
    id: 'log-2',
    habitId: 'habit-1',
    doneAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1日前
  },
  // 読書（週5回目標、現在5回完了 = 達成）
  {
    id: 'log-3',
    habitId: 'habit-2',
    doneAt: new Date(),
  },
  {
    id: 'log-4',
    habitId: 'habit-2',
    doneAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-5',
    habitId: 'habit-2',
    doneAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-6',
    habitId: 'habit-2',
    doneAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-7',
    habitId: 'habit-2',
    doneAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  // 瞑想（月20回目標、現在10回完了）
  {
    id: 'log-8',
    habitId: 'habit-3',
    doneAt: new Date(),
  },
  {
    id: 'log-9',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-10',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-11',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-12',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-13',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-14',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-15',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-16',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'log-17',
    habitId: 'habit-3',
    doneAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
];

export const Default: Story = {
  args: {
    initialHabits: mockHabits,
    initialHabitLogs: mockHabitLogs,
  },
};

export const NoHabits: Story = {
  args: {
    initialHabits: [],
    initialHabitLogs: [],
  },
};

export const OneHabit: Story = {
  args: {
    initialHabits: [mockHabits[0]],
    initialHabitLogs: mockHabitLogs.filter(log => log.habitId === 'habit-1'),
  },
};

export const AllAchieved: Story = {
  args: {
    initialHabits: mockHabits,
    initialHabitLogs: [
      // ランニング（週3回達成）
      { id: 'log-a1', habitId: 'habit-1', doneAt: new Date() },
      { id: 'log-a2', habitId: 'habit-1', doneAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: 'log-a3', habitId: 'habit-1', doneAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      // 読書（週5回達成）
      { id: 'log-b1', habitId: 'habit-2', doneAt: new Date() },
      { id: 'log-b2', habitId: 'habit-2', doneAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      { id: 'log-b3', habitId: 'habit-2', doneAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { id: 'log-b4', habitId: 'habit-2', doneAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: 'log-b5', habitId: 'habit-2', doneAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      // 瞑想（月20回達成）
      ...Array.from({ length: 20 }, (_, i) => ({
        id: `log-c${i + 1}`,
        habitId: 'habit-3',
        doneAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      })),
    ],
  },
};

export const NoProgress: Story = {
  args: {
    initialHabits: mockHabits,
    initialHabitLogs: [],
  },
};

export const ManyHabits: Story = {
  args: {
    initialHabits: [
      ...mockHabits,
      {
        id: 'habit-4',
        userId: 'user-1',
        name: 'ストレッチ',
        frequencyType: 'weekly' as const,
        targetCount: 7,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'habit-5',
        userId: 'user-1',
        name: '日記',
        frequencyType: 'weekly' as const,
        targetCount: 7,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'habit-6',
        userId: 'user-1',
        name: '英語学習',
        frequencyType: 'monthly' as const,
        targetCount: 15,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ],
    initialHabitLogs: mockHabitLogs,
  },
};
