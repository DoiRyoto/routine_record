import type { Meta, StoryObj } from '@storybook/nextjs';

import { WithLayoutAndAuth } from '@/components/StorybookWrapper';
import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { Routine, ExecutionRecord, UserProfile } from '@/lib/db/schema';
import { getMockExecutionRecords } from '@/mocks/data/execution-records';
import { getMockRoutines } from '@/mocks/data/routines';
import { getMockUserProfile } from '@/mocks/data/user-profiles';
import { getMockUserSettings } from '@/mocks/data/user-settings';

import DashboardPage from './DashboardPage';

const meta: Meta<typeof DashboardPage> = {
  title: 'Pages/DashboardPage',
  component: DashboardPage,
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
const mockUserProfile: UserProfile | null = getMockUserProfile();

export const Default: Story = {
  args: {
    initialRoutines: mockRoutines,
    initialExecutionRecords: mockExecutionRecords,
    userSettings: mockUserSettings,
    userProfile: mockUserProfile!,
  },
};

export const NoProfile: Story = {
  args: {
    initialRoutines: mockRoutines,
    initialExecutionRecords: mockExecutionRecords,
    userSettings: mockUserSettings,
    userProfile: undefined,
  },
};

export const NoRoutines: Story = {
  args: {
    initialRoutines: [],
    initialExecutionRecords: [],
    userSettings: mockUserSettings,
    userProfile: mockUserProfile!,
  },
};

export const HighLevel: Story = {
  args: {
    initialRoutines: mockRoutines,
    initialExecutionRecords: mockExecutionRecords,
    userSettings: mockUserSettings,
    userProfile: {
      ...mockUserProfile!,
      level: 25,
      totalXP: 50000,
      currentXP: 1200,
      nextLevelXP: 2500,
      streak: 45,
      longestStreak: 67,
    },
  },
};

export const NewUser: Story = {
  args: {
    initialRoutines: [],
    initialExecutionRecords: [],
    userSettings: mockUserSettings,
    userProfile: {
      ...mockUserProfile!,
      level: 1,
      totalXP: 0,
      currentXP: 0,
      nextLevelXP: 100,
      streak: 0,
      longestStreak: 0,
    },
  },
};