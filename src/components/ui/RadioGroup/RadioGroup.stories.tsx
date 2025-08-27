import type { Meta, StoryObj } from '@storybook/nextjs';

import { Label } from '../Label';

import { RadioGroup, RadioGroupItem } from './RadioGroup';

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
        <Label htmlFor="weekly">毎週</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="monthly" id="monthly" />
        <Label htmlFor="monthly">毎月</Label>
      </div>
    </RadioGroup>
  ),
};