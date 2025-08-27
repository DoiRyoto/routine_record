import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'success', 'warning', 'error', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '新着',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: '進行中',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: '完了',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: '注意',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: '未完了',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'カテゴリ',
  },
};

export const MissionStatus: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge variant="success">今日完了</Badge>
      <Badge variant="secondary">継続中</Badge>
      <Badge variant="warning">期限近し</Badge>
      <Badge variant="error">未達成</Badge>
      <Badge variant="outline">健康</Badge>
      <Badge variant="outline">学習</Badge>
      <Badge variant="outline">ライフスタイル</Badge>
    </div>
  ),
};