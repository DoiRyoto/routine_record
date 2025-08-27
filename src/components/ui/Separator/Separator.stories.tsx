import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './Separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <h4 className="text-sm font-medium leading-none">今日のミッション</h4>
        <p className="text-sm text-text-secondary">完了状況を確認しましょう</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium leading-none">週間進捗</h4>
        <p className="text-sm text-text-secondary">この週の成果をレビュー</p>
      </div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 text-sm">
      <div>朝の運動</div>
      <Separator orientation="vertical" />
      <div>読書</div>
      <Separator orientation="vertical" />
      <div>瞑想</div>
    </div>
  ),
};