import type { Meta, StoryObj } from '@storybook/nextjs';

import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="mission-name">ミッション名</Label>
        <input
          id="mission-name"
          className="mt-1 block w-full px-3 py-2 border border-gray rounded-md shadow-sm focus:outline-none focus:ring-blue focus:border-blue"
          placeholder="例: 毎朝の読書"
        />
      </div>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div>
      <Label htmlFor="email">
        メールアドレス <span className="text-red">*</span>
      </Label>
      <input
        id="email"
        type="email"
        className="mt-1 block w-full px-3 py-2 border border-gray rounded-md shadow-sm focus:outline-none focus:ring-blue focus:border-blue"
        placeholder="example@email.com"
      />
    </div>
  ),
};