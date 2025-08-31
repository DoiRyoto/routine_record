import type { Meta, StoryObj } from '@storybook/nextjs';

import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
  ToolbarLink,
  ToolbarToggleGroup,
  ToolbarToggleItem,
} from './Toolbar';

const meta: Meta<typeof Toolbar> = {
  title: 'UI/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Toolbar className="w-full">
      <ToolbarButton>
        新規ミッション
      </ToolbarButton>
      <ToolbarButton>
        編集
      </ToolbarButton>
      <ToolbarButton disabled>
        削除
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarLink href="/statistics">
        統計を見る
      </ToolbarLink>
    </Toolbar>
  ),
};

export const WithToggleGroup: Story = {
  render: () => (
    <Toolbar className="w-full">
      <ToolbarButton>
        保存
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="single" defaultValue="week">
        <ToolbarToggleItem value="day">
          日
        </ToolbarToggleItem>
        <ToolbarToggleItem value="week">
          週
        </ToolbarToggleItem>
        <ToolbarToggleItem value="month">
          月
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="multiple" defaultValue={['bold']}>
        <ToolbarToggleItem value="bold">
          <strong>B</strong>
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic">
          <em>I</em>
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline">
          <u>U</u>
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  ),
};

export const MissionToolbar: Story = {
  render: () => (
    <Toolbar className="w-full">
      <ToolbarButton>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12 5v14m-7-7h14" />
        </svg>
        新規作成
      </ToolbarButton>
      <ToolbarButton>
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="m18.5 2.5 3 3L10 17H7v-3L18.5 2.5Z" />
        </svg>
        編集
      </ToolbarButton>
      <ToolbarSeparator />
      <ToolbarToggleGroup type="single" defaultValue="all">
        <ToolbarToggleItem value="all">
          すべて
        </ToolbarToggleItem>
        <ToolbarToggleItem value="completed">
          完了済み
        </ToolbarToggleItem>
        <ToolbarToggleItem value="active">
          進行中
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarSeparator />
      <ToolbarLink href="/settings">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        設定
      </ToolbarLink>
    </Toolbar>
  ),
};