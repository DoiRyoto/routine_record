import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './Select';

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="オプションを選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">オプション 1</SelectItem>
          <SelectItem value="option2">オプション 2</SelectItem>
          <SelectItem value="option3">オプション 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <label className="text-sm font-medium text-gray-700">
        カテゴリを選択
      </label>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="カテゴリを選択してください" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="health">健康</SelectItem>
          <SelectItem value="study">学習</SelectItem>
          <SelectItem value="work">仕事</SelectItem>
          <SelectItem value="hobby">趣味</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const FrequencySelect: Story = {
  render: () => (
    <div className="w-64 space-y-2">
      <label className="text-sm font-medium text-gray-700">
        頻度
      </label>
      <Select defaultValue="daily">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">毎日</SelectItem>
          <SelectItem value="weekly">毎週</SelectItem>
          <SelectItem value="monthly">毎月</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const DisabledOption: Story = {
  render: () => (
    <div className="w-64">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="設定を選択" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="basic">基本設定</SelectItem>
          <SelectItem value="advanced">高度な設定</SelectItem>
          <SelectItem value="premium" disabled>
            プレミアム設定（有料）
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

export const MissionCategorySelect: Story = {
  render: () => (
    <div className="w-80 space-y-4 p-6 bg-white rounded-lg border">
      <h3 className="text-lg font-semibold">新しいミッション</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          ミッション名
        </label>
        <input
          placeholder="例：毎朝のジョギング"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          カテゴリ
        </label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="カテゴリを選択してください" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="health">🏃 健康・フィットネス</SelectItem>
            <SelectItem value="study">📚 学習・スキルアップ</SelectItem>
            <SelectItem value="work">💼 仕事・キャリア</SelectItem>
            <SelectItem value="hobby">🎨 趣味・娯楽</SelectItem>
            <SelectItem value="family">👨‍👩‍👧‍👦 家族・人間関係</SelectItem>
            <SelectItem value="finance">💰 お金・投資</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          実行頻度
        </label>
        <Select defaultValue="daily">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">毎日</SelectItem>
            <SelectItem value="weekly">週に数回</SelectItem>
            <SelectItem value="monthly">月に数回</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};