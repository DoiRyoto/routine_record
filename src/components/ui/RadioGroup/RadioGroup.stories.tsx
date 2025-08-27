import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';
import { Label } from '../Label/Label';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="daily">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="daily" id="daily" />
        <Label htmlFor="daily">毎日</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="weekly" id="weekly" />
        <Label htmlFor="weekly">週間</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="monthly" id="monthly" />
        <Label htmlFor="monthly">月間</Label>
      </div>
    </RadioGroup>
  ),
};

export const MissionFrequency: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <h3 className="font-semibold">ミッション頻度を選択</h3>
      <RadioGroup defaultValue="daily" className="space-y-3">
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border-light hover:bg-gray-50">
          <RadioGroupItem value="daily" id="freq-daily" />
          <div className="flex-1">
            <Label htmlFor="freq-daily" className="font-medium">毎日実行</Label>
            <p className="text-xs text-text-secondary">継続的な習慣形成に最適</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border-light hover:bg-gray-50">
          <RadioGroupItem value="weekly" id="freq-weekly" />
          <div className="flex-1">
            <Label htmlFor="freq-weekly" className="font-medium">週単位で実行</Label>
            <p className="text-xs text-text-secondary">柔軟性のある目標設定</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 rounded-lg border border-border-light hover:bg-gray-50">
          <RadioGroupItem value="monthly" id="freq-monthly" />
          <div className="flex-1">
            <Label htmlFor="freq-monthly" className="font-medium">月単位で実行</Label>
            <p className="text-xs text-text-secondary">長期的な目標達成</p>
          </div>
        </div>
      </RadioGroup>
    </div>
  ),
};