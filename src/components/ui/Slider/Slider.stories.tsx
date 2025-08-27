import type { Meta, StoryObj } from '@storybook/nextjs';

import { Label } from '../Label';

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
    <div className="w-[300px] space-y-4">
      <div>
        <Label>実行時間（分）</Label>
        <Slider defaultValue={[30]} max={120} step={5} className="mt-2" />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0分</span>
          <span>60分</span>
          <span>120分</span>
        </div>
      </div>
    </div>
  ),
};