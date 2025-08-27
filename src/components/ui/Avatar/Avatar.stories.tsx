import type { Meta, StoryObj } from '@storybook/react';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="" alt="User" />
      <AvatarFallback>田中</AvatarFallback>
    </Avatar>
  ),
};

export const UserInitials: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="" alt="佐藤太郎" />
      <AvatarFallback>佐藤</AvatarFallback>
    </Avatar>
  ),
};

export const Large: Story = {
  render: () => (
    <Avatar className="h-16 w-16">
      <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
      <AvatarFallback className="text-lg">V</AvatarFallback>
    </Avatar>
  ),
};

export const Small: Story = {
  render: () => (
    <Avatar className="h-6 w-6">
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback className="text-xs">CN</AvatarFallback>
    </Avatar>
  ),
};

export const WithBrandColors: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar>
        <AvatarImage src="" alt="Primary User" />
        <AvatarFallback className="bg-primary-100 text-primary-700">主</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="" alt="Secondary User" />
        <AvatarFallback className="bg-secondary-100 text-secondary-700">副</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="" alt="Success User" />
        <AvatarFallback className="bg-success-100 text-success-700">成</AvatarFallback>
      </Avatar>
    </div>
  ),
};