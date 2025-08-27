import type { Meta, StoryObj } from '@storybook/nextjs';

import { LevelIndicator } from './LevelIndicator';

const meta: Meta<typeof LevelIndicator> = {
  title: 'Gamification/LevelIndicator',
  component: LevelIndicator,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'light',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    level: 8,
    currentXP: 150,
    nextLevelXP: 300,
    totalXP: 1650,
  },
};

export const SmallSize: Story = {
  args: {
    level: 5,
    currentXP: 80,
    nextLevelXP: 150,
    totalXP: 580,
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    level: 25,
    currentXP: 450,
    nextLevelXP: 600,
    totalXP: 8450,
    size: 'lg',
  },
};

export const AlmostLevelUp: Story = {
  args: {
    level: 12,
    currentXP: 285,
    nextLevelXP: 300,
    totalXP: 3285,
    showXPNumbers: true,
  },
};

export const ReadyToLevelUp: Story = {
  args: {
    level: 15,
    currentXP: 500,
    nextLevelXP: 500,
    totalXP: 5000,
    showXPNumbers: true,
  },
};

export const LowLevel: Story = {
  args: {
    level: 1,
    currentXP: 25,
    nextLevelXP: 100,
    totalXP: 25,
  },
};

export const HighLevel: Story = {
  args: {
    level: 67,
    currentXP: 820,
    nextLevelXP: 1200,
    totalXP: 45820,
    showXPNumbers: true,
    size: 'lg',
  },
};

export const WithoutXPNumbers: Story = {
  args: {
    level: 10,
    currentXP: 200,
    nextLevelXP: 400,
    totalXP: 2200,
    showXPNumbers: false,
  },
};

export const JustStarted: Story = {
  args: {
    level: 1,
    currentXP: 0,
    nextLevelXP: 100,
    totalXP: 0,
  },
};