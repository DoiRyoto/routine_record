import type { Meta, StoryObj } from '@storybook/nextjs';

import { WithAuthPageLayout } from '@/components/StorybookWrapper';

import SignInPage from './SignInPage';

const meta: Meta<typeof SignInPage> = {
  title: 'Pages/SignInPage',
  component: SignInPage,
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
        story: 'ダークモードでのサインインページの表示',
      },
    },
  },
};