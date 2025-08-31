import type { Meta, StoryObj } from '@storybook/nextjs';

import { Label } from '../Label';

import { Switch } from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications" />
      <Label htmlFor="notifications">通知を受け取る</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="dark-mode" defaultChecked />
      <Label htmlFor="dark-mode">ダークモード</Label>
    </div>
  ),
};

export const WithSettings: Story = {
  render: () => (
    <div className="space-y-4 w-64">
      <div className="flex items-center justify-between">
        <Label htmlFor="mission-reminders">ミッション通知</Label>
        <Switch id="mission-reminders" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="weekly-report">週次レポート</Label>
        <Switch id="weekly-report" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="public-profile">プロフィール公開</Label>
        <Switch id="public-profile" />
      </div>
    </div>
  ),
};