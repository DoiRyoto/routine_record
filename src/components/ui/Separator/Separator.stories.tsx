import type { Meta, StoryObj } from '@storybook/nextjs';

import { Separator } from './Separator';

const meta = {
  title: 'UI/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    decorative: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  decorators: [
    (Story) => (
      <div className="h-[200px]">
        <Story />
      </div>
    ),
  ],
};

export const InText: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <p className="text-sm">
        This is some text content that appears above the separator.
      </p>
      <Separator />
      <p className="text-sm">
        This is some text content that appears below the separator.
      </p>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="border-gray/20 w-[350px] rounded-xl border bg-white p-6 shadow-md">
      <h3 className="mb-2 text-lg font-bold">Card Title</h3>
      <p className="text-gray/70 mb-4 text-sm">Card description goes here</p>
      <Separator className="my-4" />
      <p className="text-sm">Main content of the card.</p>
      <Separator className="my-4" />
      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 text-sm">Cancel</button>
        <button className="bg-blue rounded-lg px-4 py-2 text-sm text-white">
          Confirm
        </button>
      </div>
    </div>
  ),
};

export const VerticalInFlex: Story = {
  render: () => (
    <div className="flex h-[100px] items-center gap-4">
      <div className="text-center">
        <p className="text-2xl font-bold">24</p>
        <p className="text-gray/70 text-sm">Routines</p>
      </div>
      <Separator orientation="vertical" />
      <div className="text-center">
        <p className="text-2xl font-bold">156</p>
        <p className="text-gray/70 text-sm">Completed</p>
      </div>
      <Separator orientation="vertical" />
      <div className="text-center">
        <p className="text-2xl font-bold">7</p>
        <p className="text-gray/70 text-sm">Day Streak</p>
      </div>
    </div>
  ),
};

export const Navigation: Story = {
  render: () => (
    <nav className="w-[400px]">
      <ul className="space-y-1">
        <li className="hover:bg-gray/10 cursor-pointer rounded px-4 py-2">Home</li>
        <li className="hover:bg-gray/10 cursor-pointer rounded px-4 py-2">Dashboard</li>
        <li className="hover:bg-gray/10 cursor-pointer rounded px-4 py-2">Routines</li>
        <Separator className="my-2" />
        <li className="hover:bg-gray/10 cursor-pointer rounded px-4 py-2">Settings</li>
        <li className="hover:bg-gray/10 cursor-pointer rounded px-4 py-2">Help</li>
        <Separator className="my-2" />
        <li className="hover:bg-gray/10 text-red cursor-pointer rounded px-4 py-2">
          Sign Out
        </li>
      </ul>
    </nav>
  ),
};

export const WithCustomColor: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <p className="text-sm">Default gray separator</p>
      <Separator />
      <p className="text-sm">Blue separator</p>
      <Separator className="bg-blue" />
      <p className="text-sm">Green separator</p>
      <Separator className="bg-green" />
      <p className="text-sm">Red separator</p>
      <Separator className="bg-red" />
    </div>
  ),
};

export const WithDifferentThickness: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <p className="text-sm">Thin (1px)</p>
      <Separator className="h-[1px]" />
      <p className="text-sm">Medium (2px)</p>
      <Separator className="h-[2px]" />
      <p className="text-sm">Thick (4px)</p>
      <Separator className="h-[4px]" />
    </div>
  ),
};
