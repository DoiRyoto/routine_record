import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';

import { HabitForm } from './HabitForm';

const meta = {
  title: 'Feature/HabitForm',
  component: HabitForm,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HabitForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const DefaultStory = () => {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>習慣を追加</Button>
      <HabitForm open={open} onOpenChange={setOpen} />
    </div>
  );
};

export const Default: Story = {
  args: {
    open: false,
    onOpenChange: () => {},
  },
  render: DefaultStory,
};

export const Open: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
  },
};
