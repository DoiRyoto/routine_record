import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './Dialog';
import { Button } from '../Button';

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

export const Basic: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>ダイアログを開く</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>基本的なダイアログ</DialogTitle>
          <DialogDescription>
            これは基本的なダイアログの例です。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>ここにダイアログのコンテンツが入ります。</p>
        </div>
        <DialogFooter>
          <Button variant="secondary">キャンセル</Button>
          <Button>確認</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ConfirmationDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="danger">削除</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ミッションを削除しますか？</DialogTitle>
          <DialogDescription>
            この操作は元に戻せません。ミッション「毎朝のジョギング」とその実行記録がすべて削除されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary">キャンセル</Button>
          <Button variant="danger">削除する</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button>新しいミッション</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ミッションを追加</DialogTitle>
          <DialogDescription>
            新しいミッションを作成してください。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium">
              名前
            </label>
            <input
              id="name"
              placeholder="例：毎朝のジョギング"
              className="col-span-3 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right text-sm font-medium">
              説明
            </label>
            <input
              id="description"
              placeholder="健康維持のための運動"
              className="col-span-3 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="target" className="text-right text-sm font-medium">
              目標回数
            </label>
            <input
              id="target"
              type="number"
              placeholder="5"
              className="col-span-3 flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary">キャンセル</Button>
          <Button>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const InfoDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost">情報</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ミッション進捗</DialogTitle>
          <DialogDescription>
            今週の進捗状況をお知らせします。
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
            <span className="font-medium">完了したミッション</span>
            <span className="text-green-600 font-bold">8件</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
            <span className="font-medium">進行中のミッション</span>
            <span className="text-blue-600 font-bold">3件</span>
          </div>
          <div className="text-sm text-gray-600">
            この調子で続けていけば、今月の目標を達成できそうです！
          </div>
        </div>
        <DialogFooter>
          <Button>閉じる</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};