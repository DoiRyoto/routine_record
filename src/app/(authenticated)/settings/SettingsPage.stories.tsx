import type { Meta, StoryObj } from '@storybook/nextjs';

import { WithLayoutAndAuth } from '@/components/StorybookWrapper';
import type { UserSetting } from '@/lib/db/schema';
import { getMockUserSettings } from '@/mocks/data/user-settings';

import SettingsPage from './SettingsPage';

const meta: Meta<typeof SettingsPage> = {
  title: 'Pages/SettingsPage',
  component: SettingsPage,
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
const mockSettings = getMockUserSettings()!;
const baseSetting: UserSetting = {
  id: mockSettings.id,
  userId: mockSettings.userId,
  theme: mockSettings.theme,
  language: mockSettings.language,
  timeFormat: mockSettings.timeFormat,
  createdAt: mockSettings.createdAt,
  updatedAt: mockSettings.updatedAt,
};

export const Default: Story = {
  args: {
    initialSettings: baseSetting,
  },
};

export const LightTheme: Story = {
  args: {
    initialSettings: {
      ...baseSetting,
      theme: 'light',
    },
  },
};

export const DarkTheme: Story = {
  args: {
    initialSettings: {
      ...baseSetting,
      theme: 'dark',
    },
  },
};

export const AutoTheme: Story = {
  args: {
    initialSettings: {
      ...baseSetting,
      theme: 'auto',
    },
  },
};

export const EnglishLanguage: Story = {
  args: {
    initialSettings: {
      ...baseSetting,
      language: 'en',
    },
  },
};

export const TwelveHourFormat: Story = {
  args: {
    initialSettings: {
      ...baseSetting,
      timeFormat: '12h',
    },
  },
};