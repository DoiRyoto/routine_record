import type { Meta, StoryObj } from '@storybook/react';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
} from './Menubar';

const meta: Meta<typeof Menubar> = {
  title: 'UI/Menubar',
  component: Menubar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Menubar className="border">
      <MenubarMenu>
        <MenubarTrigger>ファイル</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            新しいミッション <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            ミッションを開く <MenubarShortcut>⌘O</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            エクスポート <MenubarShortcut>⌘E</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            印刷 <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>編集</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            元に戻す <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            やり直し <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem>
            選択されたミッションを削除
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>表示</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem>
            統計パネル <MenubarShortcut>⌘⇧P</MenubarShortcut>
          </MenubarCheckboxItem>
          <MenubarCheckboxItem checked>
            サイドバー <MenubarShortcut>⌘S</MenubarShortcut>
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            フルスクリーン表示
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithRadioItems: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>表示</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="week">
            <MenubarRadioItem value="day">
              日表示
            </MenubarRadioItem>
            <MenubarRadioItem value="week">
              週表示
            </MenubarRadioItem>
            <MenubarRadioItem value="month">
              月表示
            </MenubarRadioItem>
          </MenubarRadioGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>フィルター</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked>
            完了したミッション
          </MenubarCheckboxItem>
          <MenubarCheckboxItem>
            未完了のミッション
          </MenubarCheckboxItem>
          <MenubarCheckboxItem>
            今日のミッション
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};

export const WithSubmenu: Story = {
  render: () => (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>ミッション</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>新しいミッション</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>カテゴリ別管理</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>健康管理</MenubarItem>
              <MenubarItem>勉強・学習</MenubarItem>
              <MenubarItem>仕事・キャリア</MenubarItem>
              <MenubarItem>趣味・娯楽</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>設定</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>統計</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>進捗レポート</MenubarItem>
          <MenubarItem>達成率グラフ</MenubarItem>
          <MenubarSeparator />
          <MenubarItem>データエクスポート</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  ),
};