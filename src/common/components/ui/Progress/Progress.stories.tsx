import type { Meta, StoryObj } from '@storybook/nextjs';

import { Progress } from './Progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
  render: (args) => (
    <div className="w-60">
      <div className="mb-2 text-sm font-medium">今日のミッション進捗</div>
      <Progress value={args.value} />
      <div className="mt-1 text-xs text-gray">{args.value}% 完了</div>
    </div>
  ),
};

export const Low: Story = {
  args: {
    value: 15,
  },
  render: (args) => (
    <div className="w-60">
      <div className="mb-2 text-sm font-medium">週間ミッション進捗</div>
      <Progress value={args.value} />
      <div className="mt-1 text-xs text-gray">{args.value}% 完了</div>
    </div>
  ),
};

export const Medium: Story = {
  args: {
    value: 65,
  },
  render: (args) => (
    <div className="w-60">
      <div className="mb-2 text-sm font-medium">月間ミッション進捗</div>
      <Progress value={args.value} />
      <div className="mt-1 text-xs text-gray">{args.value}% 完了</div>
    </div>
  ),
};

export const High: Story = {
  args: {
    value: 90,
  },
  render: (args) => (
    <div className="w-60">
      <div className="mb-2 text-sm font-medium">年間目標進捗</div>
      <Progress value={args.value} />
      <div className="mt-1 text-xs text-gray">{args.value}% 完了</div>
    </div>
  ),
};

export const Complete: Story = {
  args: {
    value: 100,
  },
  render: (args) => (
    <div className="w-60">
      <div className="mb-2 text-sm font-medium">読書ミッション</div>
      <Progress value={args.value} />
      <div className="mt-1 text-xs text-green font-medium">
        🎉 {args.value}% 達成！おめでとうございます！
      </div>
    </div>
  ),
};

export const MultipleProgress: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="w-60">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">運動ミッション</span>
          <span className="text-gray">3/5 完了</span>
        </div>
        <Progress value={60} />
      </div>
      <div className="w-60">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">読書ミッション</span>
          <span className="text-gray">2/3 完了</span>
        </div>
        <Progress value={67} />
      </div>
      <div className="w-60">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">学習ミッション</span>
          <span className="text-gray">1/4 完了</span>
        </div>
        <Progress value={25} />
      </div>
    </div>
  ),
};