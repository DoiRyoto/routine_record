import type { Meta, StoryObj } from '@storybook/nextjs';

import { WithLayoutAndAuth } from '@/components/StorybookWrapper';
import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { Routine, ExecutionRecord } from '@/lib/db/schema';
import { getMockExecutionRecords } from '@/mocks/data/execution-records';
import { getMockRoutines } from '@/mocks/data/routines';
import { getMockUserSettings } from '@/mocks/data/user-settings';

import CalendarPage from './CalendarPage';

const meta: Meta<typeof CalendarPage> = {
  title: 'Pages/CalendarPage',
  component: CalendarPage,
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

export const NoRoutines: Story = {
  args: {
    initialRoutines: [],
    initialExecutionRecords: [],
    userSettings: mockUserSettings,
  },
};

export const ManyRecords: Story = {
  args: {
    initialRoutines: mockRoutines,
    initialExecutionRecords: [
      ...mockExecutionRecords,
      // 30日分の実行記録を追加
      ...Array.from({ length: 30 }, (_, index) => ({
        id: `record-${index + 100}`,
        userId: 'user1',
        routineId: mockRoutines[index % mockRoutines.length]?.id || '1',
        executedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
        duration: null,
        memo: null,
        isCompleted: true,
        createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000),
      })),
    ],
    userSettings: mockUserSettings,
  },
};

export const WeeklyView: Story = {
  args: {
    initialRoutines: mockRoutines.filter(r => r.recurrenceType === 'weekly'),
    initialExecutionRecords: mockExecutionRecords.filter(record => 
      mockRoutines.find(r => r.id === record.routineId && r.recurrenceType === 'weekly')
    ),
    userSettings: mockUserSettings,
  },
};