import type { Meta, StoryObj } from '@storybook/nextjs';

import { Input } from '../Input/Input';

import { Label } from './Label';

const meta = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const Required: Story = {
  render: () => (
    <Label>
      Email <span className="text-red">*</span>
    </Label>
  ),
};

export const WithInput: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="email">Email Address</Label>
      <Input id="email" type="email" placeholder="name@example.com" />
    </div>
  ),
};

export const WithRequiredInput: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="password">
        Password <span className="text-red">*</span>
      </Label>
      <Input id="password" type="password" placeholder="••••••••" />
    </div>
  ),
};

export const FormWithLabels: Story = {
  render: () => (
    <form className="w-[400px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" type="text" placeholder="Enter your username" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red">*</span>
        </Label>
        <Input id="email" type="email" placeholder="name@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red">*</span>
        </Label>
        <Input id="password" type="password" placeholder="••••••••" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          className="flex min-h-[80px] w-full rounded-lg border-2 border-gray/30 bg-white px-4 py-2 text-sm"
          placeholder="Tell us about yourself"
        />
      </div>
    </form>
  ),
};

export const DisabledState: Story = {
  render: () => (
    <div className="w-[300px] space-y-2">
      <Label htmlFor="disabled-input">Disabled Field</Label>
      <Input id="disabled-input" type="text" placeholder="Cannot edit" disabled />
    </div>
  ),
};
