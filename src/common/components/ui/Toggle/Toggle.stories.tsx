import type { Meta, StoryObj } from '@storybook/nextjs';

import { Toggle, ToggleGroup, ToggleGroupItem } from './Toggle';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'トグル',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'アウトライン',
  },
};

export const WithIcon: Story = {
  render: () => (
    <Toggle variant="outline">
      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      </svg>
      ミッション記録
    </Toggle>
  ),
};

export const ToggleGroupSingle: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="week">
      <ToggleGroupItem value="day" variant="outline">
        日
      </ToggleGroupItem>
      <ToggleGroupItem value="week" variant="outline">
        週
      </ToggleGroupItem>
      <ToggleGroupItem value="month" variant="outline">
        月
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const ToggleGroupMultiple: Story = {
  render: () => (
    <ToggleGroup type="multiple" defaultValue={['bold']}>
      <ToggleGroupItem value="bold" variant="outline">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" variant="outline">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <line x1="19" y1="4" x2="10" y2="4" />
          <line x1="14" y1="20" x2="5" y2="20" />
          <line x1="15" y1="4" x2="9" y2="20" />
        </svg>
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" variant="outline">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M6 4v6a6 6 0 0 0 12 0V4" />
          <line x1="4" y1="20" x2="20" y2="20" />
        </svg>
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const MissionCategories: Story = {
  render: () => (
    <ToggleGroup type="multiple" className="flex-wrap">
      <ToggleGroupItem value="health" variant="outline">
        <span className="mr-2">💪</span>
        健康管理
      </ToggleGroupItem>
      <ToggleGroupItem value="study" variant="outline">
        <span className="mr-2">📚</span>
        学習・成長
      </ToggleGroupItem>
      <ToggleGroupItem value="work" variant="outline">
        <span className="mr-2">💼</span>
        仕事・キャリア
      </ToggleGroupItem>
      <ToggleGroupItem value="hobby" variant="outline">
        <span className="mr-2">🎨</span>
        趣味・娯楽
      </ToggleGroupItem>
      <ToggleGroupItem value="life" variant="outline">
        <span className="mr-2">🏠</span>
        生活・家事
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

export const MissionViewToggle: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">表示期間</h3>
        <ToggleGroup type="single" defaultValue="today">
          <ToggleGroupItem value="today">今日</ToggleGroupItem>
          <ToggleGroupItem value="week">今週</ToggleGroupItem>
          <ToggleGroupItem value="month">今月</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">表示形式</h3>
        <ToggleGroup type="single" defaultValue="card">
          <ToggleGroupItem value="list" variant="outline">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
            リスト
          </ToggleGroupItem>
          <ToggleGroupItem value="card" variant="outline">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            カード
          </ToggleGroupItem>
          <ToggleGroupItem value="calendar" variant="outline">
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M8 2v4" />
              <path d="M16 2v4" />
              <rect width="18" height="18" x="3" y="4" rx="2" />
              <path d="M3 10h18" />
            </svg>
            カレンダー
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  ),
};