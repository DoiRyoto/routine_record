import type { Meta, StoryObj } from '@storybook/react';
import { DataList } from './DataList';

const meta: Meta<typeof DataList> = {
  title: 'UI/DataList',
  component: DataList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const defaultItems = [
  { label: 'ルーチン名', value: '朝の運動' },
  { label: 'カテゴリー', value: '健康・フィットネス' },
  { label: '目標頻度', value: '毎日' },
  { label: '継続日数', value: '45日' },
  { label: '成功率', value: '89%' },
  { label: '作成日', value: '2024年1月15日' },
];

export const Default: Story = {
  args: {
    items: defaultItems,
  },
};

export const Horizontal: Story = {
  args: {
    items: defaultItems,
    orientation: 'horizontal',
  },
};

export const SmallSize: Story = {
  args: {
    items: defaultItems,
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    items: defaultItems,
    size: 'lg',
  },
};

export const WithComplexValues: Story = {
  args: {
    items: [
      { label: 'ルーチン名', value: <strong>朝の運動</strong> },
      { 
        label: 'ステータス', 
        value: (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            アクティブ
          </span>
        )
      },
      { 
        label: '進捗', 
        value: (
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
            </div>
            <span className="text-sm text-gray-600">89%</span>
          </div>
        )
      },
      { label: '目標頻度', value: '毎日' },
      { label: '継続日数', value: '45日' },
    ],
  },
};

export const MinimalItems: Story = {
  args: {
    items: [
      { label: '名前', value: '太郎' },
      { label: 'メール', value: 'taro@example.com' },
    ],
    size: 'sm',
  },
};