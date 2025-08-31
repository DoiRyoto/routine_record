import type { Meta, StoryObj } from '@storybook/nextjs';

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

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="カテゴリを選択" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="study">学習</SelectItem>
        <SelectItem value="exercise">運動</SelectItem>
        <SelectItem value="health">健康</SelectItem>
        <SelectItem value="hobby">趣味</SelectItem>
        <SelectItem value="other">その他</SelectItem>
      </SelectContent>
    </Select>
  ),
};