import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './Slider';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const MissionProgress: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>週間目標進捗</span>
          <span>75%</span>
        </div>
        <Slider defaultValue={[75]} max={100} step={1} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>今月の達成率</span>
          <span>45%</span>
        </div>
        <Slider defaultValue={[45]} max={100} step={1} />
      </div>
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>習慣化レベル</span>
          <span>8/10</span>
        </div>
        <Slider defaultValue={[8]} max={10} step={1} />
      </div>
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div className="w-64 space-y-4">
      <div>
        <div className="text-sm mb-2">実行時間帯設定</div>
        <Slider defaultValue={[6, 8]} max={24} step={1} />
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>6:00</span>
          <span>8:00</span>
        </div>
      </div>
    </div>
  ),
};