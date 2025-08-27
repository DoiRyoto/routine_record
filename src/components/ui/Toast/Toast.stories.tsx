import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { Button } from '../Button';

import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'UI/Toast',
  component: Toast,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ToastDemo = ({ 
  variant = 'default', 
  title, 
  description, 
  actionLabel 
}: { 
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  title: string;
  description: string;
  actionLabel?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <ToastProvider swipeDirection="right">
      <div className="flex justify-center">
        <Button onClick={() => setOpen(true)}>
          トーストを表示
        </Button>
      </div>
      <Toast open={open} onOpenChange={setOpen} variant={variant}>
        <div className="grid gap-1">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </div>
        {actionLabel && (
          <ToastAction altText="アクションを実行" onClick={() => setOpen(false)}>
            {actionLabel}
          </ToastAction>
        )}
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  );
};

export const Default: Story = {
  render: () => (
    <ToastDemo 
      title="ミッション完了！"
      description="「朝のジョギング」を完了しました。"
    />
  ),
};

export const Success: Story = {
  render: () => (
    <ToastDemo 
      variant="success"
      title="目標達成！"
      description="今週のミッションをすべて完了しました。おめでとうございます！"
    />
  ),
};

export const Warning: Story = {
  render: () => (
    <ToastDemo 
      variant="warning"
      title="注意"
      description="今日はまだミッションを完了していません。"
      actionLabel="確認する"
    />
  ),
};

export const Destructive: Story = {
  render: () => (
    <ToastDemo 
      variant="destructive"
      title="エラー"
      description="ミッションの保存に失敗しました。"
      actionLabel="再試行"
    />
  ),
};

export const WithAction: Story = {
  render: () => (
    <ToastDemo 
      title="新しいミッションが追加されました"
      description="「英語学習」ミッションを確認してください。"
      actionLabel="今すぐ見る"
    />
  ),
};

export const MultipleToasts: Story = {
  render: () => {
    const [toasts, setToasts] = useState<Array<{ id: number; variant: 'default' | 'success' | 'warning' | 'destructive'; title: string; description: string; }>>([]);

    const showToast = (variant: 'default' | 'success' | 'warning' | 'destructive', title: string, description: string) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, variant, title, description }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, 3000);
    };

    return (
      <ToastProvider swipeDirection="right">
        <div className="flex gap-2 flex-wrap justify-center">
          <Button onClick={() => showToast('success', '成功', '運動ミッション完了！')}>
            成功
          </Button>
          <Button onClick={() => showToast('warning', '警告', 'ミッション期限が近づいています')}>
            警告
          </Button>
          <Button onClick={() => showToast('destructive', 'エラー', 'データの保存に失敗しました')}>
            エラー
          </Button>
          <Button onClick={() => showToast('default', '通知', '新しいミッションが作成されました')}>
            通知
          </Button>
        </div>
        {toasts.map((toast) => (
          <Toast key={toast.id} variant={toast.variant}>
            <div className="grid gap-1">
              <ToastTitle>{toast.title}</ToastTitle>
              <ToastDescription>{toast.description}</ToastDescription>
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    );
  },
};