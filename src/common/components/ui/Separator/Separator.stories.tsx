import type { Meta, StoryObj } from '@storybook/nextjs';

import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">今日のミッション</h3>
        <p className="text-sm text-gray">3つのタスクが残っています</p>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-semibold">今週の進捗</h3>
        <p className="text-sm text-gray">順調に進んでいます</p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-16 items-center space-x-4">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue">12</div>
        <div className="text-sm text-gray">完了</div>
      </div>
      <Separator orientation="vertical" />
      <div className="text-center">
        <div className="text-2xl font-bold text-orange">3</div>
        <div className="text-sm text-gray">進行中</div>
      </div>
      <Separator orientation="vertical" />
      <div className="text-center">
        <div className="text-2xl font-bold text-gray">8</div>
        <div className="text-sm text-gray">待機中</div>
      </div>
    </div>
  ),
};