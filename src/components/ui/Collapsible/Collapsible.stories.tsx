import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';

import { Button } from '../Button';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './Collapsible';

const meta: Meta<typeof Collapsible> = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-96 space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            今日のミッション進捗
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <svg
                className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 font-mono text-sm">
          5個のミッション中 3個完了
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            ✅ 朝のジョギング - 完了
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            ✅ 読書30分 - 完了  
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            ✅ 英語学習 - 完了
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            ⏳ 筋トレ - 未完了
          </div>
          <div className="rounded-md border px-4 py-3 font-mono text-sm">
            ⏳ 瞑想 - 未完了
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const MissionCategories: Story = {
  render: () => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const toggleSection = (section: string) => {
      setOpenSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    return (
      <div className="w-96 space-y-4">
        <Collapsible 
          open={openSections.health} 
          onOpenChange={() => toggleSection('health')}
          className="space-y-2"
        >
          <div className="flex items-center justify-between space-x-4">
            <h4 className="text-sm font-semibold text-green-700">
              健康管理 (2/3)
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <svg
                  className={`h-4 w-4 transition-transform ${openSections.health ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border bg-green-50 px-4 py-3 text-sm">
              ✅ 朝のジョギング (30分)
            </div>
            <div className="rounded-md border bg-green-50 px-4 py-3 text-sm">
              ✅ 野菜を多く摂る
            </div>
            <div className="rounded-md border px-4 py-3 text-sm">
              ⏳ 十分な睡眠 (8時間)
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={openSections.study} 
          onOpenChange={() => toggleSection('study')}
          className="space-y-2"
        >
          <div className="flex items-center justify-between space-x-4">
            <h4 className="text-sm font-semibold text-blue-700">
              学習・成長 (1/2)
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <svg
                  className={`h-4 w-4 transition-transform ${openSections.study ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border bg-blue-50 px-4 py-3 text-sm">
              ✅ 英語学習 (30分)
            </div>
            <div className="rounded-md border px-4 py-3 text-sm">
              ⏳ 技術書を読む
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible 
          open={openSections.personal} 
          onOpenChange={() => toggleSection('personal')}
          className="space-y-2"
        >
          <div className="flex items-center justify-between space-x-4">
            <h4 className="text-sm font-semibold text-purple-700">
              個人活動 (0/2)
            </h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <svg
                  className={`h-4 w-4 transition-transform ${openSections.personal ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-2">
            <div className="rounded-md border px-4 py-3 text-sm">
              ⏳ 日記を書く
            </div>
            <div className="rounded-md border px-4 py-3 text-sm">
              ⏳ 楽器の練習
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  },
};