import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from './HoverCard';

const meta: Meta<typeof HoverCard> = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">ミッション情報</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">朝のジョギング</h4>
            <p className="text-sm text-gray-600">
              毎日30分間のジョギングで健康的な体づくりを目指します。
            </p>
            <div className="flex items-center pt-2">
              <span className="text-xs text-gray-500">
                進捗率: 75% ・ 継続日数: 12日
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">ユーザー情報</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar>
            <div className="flex h-full w-full items-center justify-center bg-blue-100 text-blue-600">
              山
            </div>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">山田太郎</h4>
            <p className="text-sm">
              毎日のミッションをコツコツと継続中。
              健康的な習慣づくりが目標です。
            </p>
            <div className="flex items-center pt-2">
              <svg className="mr-2 h-4 w-4 opacity-70" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="3" rx="2" ry="2"/>
                <path d="m22 3-10 6L2 3"/>
              </svg>
              <span className="text-xs text-gray-500">
                2024年3月から参加
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const MissionProgress: Story = {
  render: () => (
    <div className="flex gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50">
            <div className="text-sm font-medium">運動ミッション</div>
            <div className="text-xs text-gray-500">3/5 完了</div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="space-y-2">
            <h4 className="font-semibold">運動ミッションの詳細</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>ジョギング</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>筋トレ</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>ストレッチ</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>ウォーキング</span>
                <span className="text-gray-400">-</span>
              </div>
              <div className="flex justify-between">
                <span>ヨガ</span>
                <span className="text-gray-400">-</span>
              </div>
            </div>
            <div className="pt-2 text-xs text-gray-500">
              達成率: 60%
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="cursor-pointer rounded-lg border p-3 hover:bg-gray-50">
            <div className="text-sm font-medium">学習ミッション</div>
            <div className="text-xs text-gray-500">1/3 完了</div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="space-y-2">
            <h4 className="font-semibold">学習ミッションの詳細</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>英語学習</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span>読書</span>
                <span className="text-gray-400">-</span>
              </div>
              <div className="flex justify-between">
                <span>プログラミング</span>
                <span className="text-gray-400">-</span>
              </div>
            </div>
            <div className="pt-2 text-xs text-gray-500">
              達成率: 33%
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};