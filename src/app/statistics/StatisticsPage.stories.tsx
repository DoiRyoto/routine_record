import type { Meta, StoryObj } from '@storybook/nextjs';

import { WithLayoutAndAuth } from '@/components/StorybookWrapper';
import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { Routine, ExecutionRecord } from '@/lib/db/schema';
import { getMockExecutionRecords } from '@/mocks/data/execution-records';
import { getMockRoutines } from '@/mocks/data/routines';
import { getMockUserSettings } from '@/mocks/data/user-settings';

import StatisticsPage from './StatisticsPage';

const meta: Meta<typeof StatisticsPage> = {
  title: 'Pages/StatisticsPage',
  component: StatisticsPage,
  decorators: [
    (Story) => (
      <WithLayoutAndAuth>
        <Story />
      </WithLayoutAndAuth>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// モックデータを取得
const mockRoutines: Routine[] = getMockRoutines();
const mockExecutionRecords: ExecutionRecord[] = getMockExecutionRecords();
const mockUserSettings: UserSettingWithTimezone = getMockUserSettings()!;

export const Default: Story = {
  args: {
    initialRoutines: mockRoutines,
    initialExecutionRecords: mockExecutionRecords,
    userSettings: mockUserSettings,
  },
};

export const NoData: Story = {
  args: {
    initialRoutines: [],
    initialExecutionRecords: [],
    userSettings: mockUserSettings,
  },
};

export const HighActivity: Story = {
  args: {
    initialRoutines: mockRoutines,
    initialExecutionRecords: [
      ...mockExecutionRecords,
      // 大量のデータを追加
      ...Array.from({ length: 100 }, (_, index) => ({
        id: `record-${index + 100}`,
        userId: 'user1',
        routineId: mockRoutines[index % mockRoutines.length]?.id || '1',
        executedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // 過去90日間のランダムな日時
        duration: Math.floor(Math.random() * 60) + 10,
        memo: null,
        isCompleted: true,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      })),
    ],
    userSettings: mockUserSettings,
  },
};

export const LimitedRecords: Story = {
  args: {
    initialRoutines: mockRoutines,
    initialExecutionRecords: mockExecutionRecords.slice(0, 5),
    userSettings: mockUserSettings,
  },
};