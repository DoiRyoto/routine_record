import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'ボタン',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'ボタン',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'ボタン',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'ボタン',
  },
};

export const Danger: Story = {
  args: {
    variant: 'danger',
    children: '削除',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: '小さいボタン',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: '大きいボタン',
  },
};