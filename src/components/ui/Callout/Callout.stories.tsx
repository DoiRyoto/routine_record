import type { Meta, StoryObj } from '@storybook/react';
import { Callout } from './Callout';

const meta: Meta<typeof Callout> = {
  title: 'UI/Callout',
  component: Callout,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'info', 'warning', 'error', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a default callout with some important information.',
  },
};

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'This is an info callout with helpful information.',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'This is a warning callout. Please pay attention to this message.',
  },
};

export const Error: Story = {
  args: {
    variant: 'error',
    children: 'This is an error callout. Something went wrong.',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'This is a success callout. Everything went well!',
  },
};

export const WithLongText: Story = {
  args: {
    variant: 'info',
    children: 'This is a callout with longer text content. It demonstrates how the component handles multiple lines and wrapping text. The callout should maintain its styling and readability even with extended content.',
  },
};