import type { Meta, StoryObj } from '@storybook/nextjs';
import { Plus } from 'lucide-react';

import { Button } from './Button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'default',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'default',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
    size: 'default',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
    size: 'default',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger Button',
    variant: 'danger',
    size: 'default',
  },
};

export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
    size: 'default',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning Button',
    variant: 'warning',
    size: 'default',
  },
};

export const Info: Story = {
  args: {
    children: 'Info Button',
    variant: 'info',
    size: 'default',
  },
};

export const ExtraSmall: Story = {
  args: {
    children: 'Extra Small',
    variant: 'primary',
    size: 'xs',
  },
};

export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large Button',
    variant: 'primary',
    size: 'xl',
  },
};

export const Icon: Story = {
  args: {
    children: <Plus className="h-4 w-4" />,
    variant: 'primary',
    size: 'icon',
  },
};

export const IconSmall: Story = {
  args: {
    children: <Plus className="h-4 w-4" />,
    variant: 'primary',
    size: 'icon-sm',
  },
};

export const IconLarge: Story = {
  args: {
    children: <Plus className="h-4 w-4" />,
    variant: 'primary',
    size: 'icon-lg',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    size: 'default',
    disabled: true,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="danger">Danger</Button>
        <Button variant="success">Success</Button>
        <Button variant="warning">Warning</Button>
        <Button variant="info">Info</Button>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

export const AllIconSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="icon-sm"><Plus className="h-4 w-4" /></Button>
      <Button size="icon"><Plus className="h-4 w-4" /></Button>
      <Button size="icon-lg"><Plus className="h-4 w-4" /></Button>
    </div>
  ),
};
