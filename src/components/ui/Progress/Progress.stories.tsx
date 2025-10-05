import type { Meta, StoryObj } from '@storybook/nextjs';
import { useEffect, useState } from 'react';

import { Progress } from './Progress';

const meta = {
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
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 50,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Empty: Story = {
  args: {
    value: 0,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Quarter: Story = {
  args: {
    value: 25,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Half: Story = {
  args: {
    value: 50,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const ThreeQuarters: Story = {
  args: {
    value: 75,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Full: Story = {
  args: {
    value: 100,
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Small: Story = {
  args: {
    value: 50,
    className: 'h-2',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Large: Story = {
  args: {
    value: 50,
    className: 'h-5',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span className="font-semibold">60%</span>
      </div>
      <Progress value={60} />
    </div>
  ),
};

export const MultipleProgresses: Story = {
  render: () => (
    <div className="w-[400px] space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Morning Routine</span>
          <span className="font-semibold">100%</span>
        </div>
        <Progress value={100} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Exercise</span>
          <span className="font-semibold">75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Reading</span>
          <span className="font-semibold">40%</span>
        </div>
        <Progress value={40} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Meditation</span>
          <span className="font-semibold">0%</span>
        </div>
        <Progress value={0} />
      </div>
    </div>
  ),
};

export const LevelProgress: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Level 5</span>
        <span className="text-xs text-gray">350 / 500 XP</span>
      </div>
      <Progress value={70} />
      <p className="text-center text-xs text-gray">150 XP to next level</p>
    </div>
  ),
};

export const AnimatedProgress: Story = {
  render: () => {
    const [value, setValue] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setValue((prev) => {
          if (prev >= 100) return 0;
          return prev + 1;
        });
      }, 50);

      return () => clearInterval(interval);
    }, []);

    return (
      <div className="w-[400px] space-y-2">
        <div className="flex justify-between text-sm">
          <span>Loading...</span>
          <span className="font-semibold">{value}%</span>
        </div>
        <Progress value={value} />
      </div>
    );
  },
};
