import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '../Button';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">ミッション追加</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>新しいミッションを作成します</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};

export const WithDifferentSides: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">上</Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>上側にツールチップ</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">右</Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>右側にツールチップ</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">下</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>下側にツールチップ</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline">左</Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>左側にツールチップ</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const MissionActions: Story = {
  render: () => (
    <TooltipProvider>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14m-7-7h14" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>新しいミッションを作成</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="m18.5 2.5 3 3L10 17H7v-3L18.5 2.5Z" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>ミッションを編集</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m3 16 4 4 4-4" />
                <path d="M7 20V4" />
                <path d="m21 8-4-4-4 4" />
                <path d="M17 4v16" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>ミッションを並び替え</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="icon" variant="outline">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>ダッシュボードに戻る</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
};

export const LongContent: Story = {
  render: () => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">詳細情報</Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            このミッションは毎日継続することで、
            健康的な生活習慣を身につけることができます。
            無理をせず、自分のペースで続けていきましょう。
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ),
};