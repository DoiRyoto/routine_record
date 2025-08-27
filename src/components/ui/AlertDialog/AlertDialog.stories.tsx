import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './AlertDialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'UI/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
        ミッションを削除
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            このミッションを削除すると、関連する実行記録もすべて削除されます。
            この操作は元に戻すことができません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction>削除する</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const DestructiveAction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-error-500 text-white hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2">
        データをリセット
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>すべてのデータを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作により、すべてのミッション、実行記録、統計データが完全に削除されます。
            この操作は絶対に元に戻すことができません。慎重に検討してください。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction className="bg-error-500 hover:bg-error-600 focus:ring-error-500">
            すべて削除する
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const PositiveAction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger className="inline-flex h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-secondary-500 text-white hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2">
        目標を達成
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>🎉 目標達成おめでとうございます！</AlertDialogTitle>
          <AlertDialogDescription>
            今週のミッション目標を見事に達成しました！
            継続的な努力が実を結んでいます。この調子で次の目標に向かいましょう。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>閉じる</AlertDialogCancel>
          <AlertDialogAction className="bg-success-500 hover:bg-success-600 focus:ring-success-500">
            次の目標を設定
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};