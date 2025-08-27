import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'elevated', 'interactive'],
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <CardContent>
        <p>これはデフォルトのカードです。</p>
      </CardContent>
    ),
  },
};

export const WithHeader: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>カードタイトル</CardTitle>
        <CardDescription>これはカードの説明文です。</CardDescription>
      </CardHeader>
      <CardContent>
        <p>カードのコンテンツがここに入ります。</p>
      </CardContent>
    </Card>
  ),
};

export const Elevated: Story = {
  args: {
    variant: 'elevated',
    children: (
      <CardContent>
        <p>これは少し浮いて見えるカードです。</p>
      </CardContent>
    ),
  },
};

export const Interactive: Story = {
  args: {
    variant: 'interactive',
    children: (
      <CardContent>
        <p>このカードはホバーすると反応します。</p>
      </CardContent>
    ),
  },
};

export const NoPadding: Story = {
  args: {
    padding: 'none',
    children: (
      <div className="p-4">
        <p>このカードは padding が none で、内側で手動調整しています。</p>
      </div>
    ),
  },
};

export const SmallPadding: Story = {
  args: {
    padding: 'sm',
    children: <p>小さなパディングのカードです。</p>,
  },
};

export const LargePadding: Story = {
  args: {
    padding: 'lg',
    children: <p>大きなパディングのカードです。</p>,
  },
};

export const RoutineCard: Story = {
  render: () => (
    <Card variant="interactive" className="max-w-md">
      <CardHeader>
        <CardTitle>毎日の運動</CardTitle>
        <CardDescription>健康維持のための日課</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>進捗</span>
            <span className="font-medium">3/5回</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 mt-2">
            健康
          </span>
        </div>
      </CardContent>
    </Card>
  ),
};