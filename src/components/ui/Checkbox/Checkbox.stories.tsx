import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from './Checkbox';
import { Label } from '../Label/Label';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Checkbox id="default" />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="with-label" />
      <Label htmlFor="with-label">ミッションを完了した</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" defaultChecked />
      <Label htmlFor="checked">完了済み</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled" disabled />
        <Label htmlFor="disabled">無効なチェックボックス</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="disabled-checked" disabled defaultChecked />
        <Label htmlFor="disabled-checked">無効かつチェック済み</Label>
      </div>
    </div>
  ),
};

export const MissionList: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border-light hover:bg-gray-50">
        <Checkbox id="morning-exercise" />
        <div className="flex-1">
          <Label htmlFor="morning-exercise" className="font-medium">朝の運動</Label>
          <p className="text-xs text-text-secondary mt-1">30分間のウォーキング</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border-light hover:bg-gray-50">
        <Checkbox id="reading" defaultChecked />
        <div className="flex-1">
          <Label htmlFor="reading" className="font-medium">読書</Label>
          <p className="text-xs text-text-secondary mt-1">30ページ以上</p>
        </div>
      </div>
      <div className="flex items-center space-x-3 p-3 rounded-lg border border-border-light hover:bg-gray-50">
        <Checkbox id="meditation" />
        <div className="flex-1">
          <Label htmlFor="meditation" className="font-medium">瞳想</Label>
          <p className="text-xs text-text-secondary mt-1">10分間のマインドフルネス</p>
        </div>
      </div>
    </div>
  ),
};