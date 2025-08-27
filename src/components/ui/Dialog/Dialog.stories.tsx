import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '../Button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'UI/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">新しいミッションを追加</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ミッションの追加</DialogTitle>
          <DialogDescription>
            新しい習慣をミッションとして登録しましょう。継続することで成長に繋がります。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              名前
            </label>
            <input
              id="name"
              placeholder="例: 毎朝の読書"
              className="col-span-3 px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right">
              カテゴリ
            </label>
            <select
              id="category"
              className="col-span-3 px-3 py-2 border rounded"
            >
              <option>学習</option>
              <option>運動</option>
              <option>健康</option>
              <option>その他</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};