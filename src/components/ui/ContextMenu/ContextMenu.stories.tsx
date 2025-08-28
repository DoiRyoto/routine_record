import type { Meta, StoryObj } from '@storybook/nextjs';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from './ContextMenu';

const meta: Meta<typeof ContextMenu> = {
  title: 'UI/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-gray text-sm">
        右クリックでメニューを表示
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>ミッションを編集</ContextMenuItem>
        <ContextMenuItem>記録を追加</ContextMenuItem>
        <ContextMenuItem>統計を表示</ContextMenuItem>
        <ContextMenuItem className="text-red">削除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const MissionCard: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="p-4 bg-white rounded-lg border shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray">毎日の読書</h3>
          <p className="text-sm text-gray mt-1">30分間の読書習慣</p>
          <div className="mt-2 flex items-center">
            <div className="text-sm text-green font-medium">7日連続達成</div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>📝 編集</ContextMenuItem>
        <ContextMenuItem>✅ 今日完了にする</ContextMenuItem>
        <ContextMenuItem>📊 進捗を確認</ContextMenuItem>
        <ContextMenuItem>📅 スケジュール変更</ContextMenuItem>
        <ContextMenuItem className="text-red">🗑️ 削除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};