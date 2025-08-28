import type { Meta, StoryObj } from '@storybook/nextjs';

import { WithAuthPageLayout } from '@/components/StorybookWrapper';

import SignUpPage from './SignUpPage';

const meta: Meta<typeof SignUpPage> = {
  title: 'Pages/SignUpPage',
  component: SignUpPage,
  decorators: [
    (Story) => (
      <WithAuthPageLayout>
        <Story />
      </WithAuthPageLayout>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'responsive',
    },
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
    docs: {
      description: {
        story: 'ダークモードでのサインアップページの表示',
      },
    },
  },
};