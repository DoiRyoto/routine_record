import type { Meta, StoryObj } from '@storybook/react';
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
      control: { type: 'number', min: 0, max: 100 },
    },
    max: {
      control: { type: 'number', min: 1, max: 200 },
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'success', 'warning', 'danger'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 60,
    max: 100,
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
};

export const Success: Story = {
  args: {
    value: 85,
    max: 100,
    variant: 'success',
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
};

export const Warning: Story = {
  args: {
    value: 45,
    max: 100,
    variant: 'warning',
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
};

export const Danger: Story = {
  args: {
    value: 15,
    max: 100,
    variant: 'danger',
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
};

export const Empty: Story = {
  args: {
    value: 0,
    max: 100,
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
};

export const Full: Story = {
  args: {
    value: 100,
    max: 100,
    variant: 'success',
  },
  render: (args) => (
    <div className="w-64">
      <Progress {...args} />
    </div>
  ),
};

export const CustomMax: Story = {
  args: {
    value: 7,
    max: 10,
    variant: 'default',
  },
  render: (args) => (
    <div className="w-64 space-y-2">
      <div className="flex justify-between text-sm">
        <span>今週の進捗</span>
        <span>{args.value}/{args.max}回</span>
      </div>
      <Progress {...args} />
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="w-80 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>デフォルト (60%)</span>
          <span>60%</span>
        </div>
        <Progress value={60} variant="default" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>成功 (85%)</span>
          <span>85%</span>
        </div>
        <Progress value={85} variant="success" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>警告 (45%)</span>
          <span>45%</span>
        </div>
        <Progress value={45} variant="warning" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>危険 (15%)</span>
          <span>15%</span>
        </div>
        <Progress value={15} variant="danger" />
      </div>
    </div>
  ),
};