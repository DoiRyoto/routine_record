import type { Meta, StoryObj } from '@storybook/nextjs';

import { WithLayoutAndAuth } from '@/components/StorybookWrapper';
import type { UserSettingWithTimezone } from '@/lib/db/queries/user-settings';
import type { Routine } from '@/lib/db/schema';
import { getMockRoutines } from '@/mocks/data/routines';
import { getMockUserSettings } from '@/mocks/data/user-settings';

import RoutinesPage from './RoutinesPage';

const meta: Meta<typeof RoutinesPage> = {
  title: 'Pages/RoutinesPage',
  component: RoutinesPage,
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
const mockUserSettings: UserSettingWithTimezone = getMockUserSettings()!;

export const Default: Story = {
  args: {
    initialRoutines: mockRoutines,
    userSettings: mockUserSettings,
  },
};

export const Empty: Story = {
  args: {
    initialRoutines: [],
    userSettings: mockUserSettings,
  },
};

export const DailyRoutines: Story = {
  args: {
    initialRoutines: mockRoutines.filter(r => r.recurrenceType === 'daily'),
    userSettings: mockUserSettings,
  },
};

export const WeeklyRoutines: Story = {
  args: {
    initialRoutines: mockRoutines.filter(r => r.recurrenceType === 'weekly'),
    userSettings: mockUserSettings,
  },
};

export const InactiveRoutines: Story = {
  args: {
    initialRoutines: mockRoutines.map(r => ({ ...r, isActive: false })),
    userSettings: mockUserSettings,
  },
};

export const MixedCategories: Story = {
  args: {
    initialRoutines: [
      ...mockRoutines.filter(r => r.category === 'health'),
      ...mockRoutines.filter(r => r.category === 'work'),
      ...mockRoutines.filter(r => r.category === 'personal'),
    ],
    userSettings: mockUserSettings,
  },
};