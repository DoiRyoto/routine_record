import type { Meta, StoryObj } from '@storybook/react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuCheckboxItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuShortcut,
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
      <ContextMenuTrigger asChild>
        <div className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          右クリックしてメニューを表示
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>編集</ContextMenuItem>
        <ContextMenuItem>コピー</ContextMenuItem>
        <ContextMenuItem>貼り付け</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>削除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithShortcuts: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          右クリックしてショートカット付きメニューを表示
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          編集
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          コピー
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          貼り付け
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          削除
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxAndRadio: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          右クリックしてチェックボックス/ラジオ付きメニューを表示
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuLabel>表示オプション</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          ツールバーを表示
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>
          サイドバーを表示
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>テーマ</ContextMenuLabel>
        <ContextMenuRadioGroup value="light">
          <ContextMenuRadioItem value="light">
            ライト
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="dark">
            ダーク
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="system">
            システム
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
};