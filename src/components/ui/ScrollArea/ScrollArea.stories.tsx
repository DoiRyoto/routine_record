import type { Meta, StoryObj } from '@storybook/nextjs';

import { Separator } from '../Separator';

import { ScrollArea } from './ScrollArea';

const meta: Meta<typeof ScrollArea> = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const tags = Array.from({ length: 50 }).map(
  (_, i) => `ミッション${i + 1}: ${
    i % 5 === 0 ? '運動' : 
    i % 5 === 1 ? '学習' : 
    i % 5 === 2 ? '健康' : 
    i % 5 === 3 ? '趣味' : '仕事'
  }関連のタスク`
);

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-72 w-48 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">ミッション一覧</h4>
        {tags.map((tag, index) => (
          <div key={tag}>
            <div className="text-sm py-2">
              {tag}
            </div>
            {index < tags.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea className="w-96 whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-green-500 h-24 w-32 flex items-center justify-center text-white font-semibold"
          >
            ミッション {i + 1}
          </div>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const MissionProgress: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">今週のミッション進捗</h3>
      <ScrollArea className="h-80 w-full rounded-md border">
        <div className="p-4 space-y-4">
          {[
            { name: '朝のジョギング', category: '運動', progress: 5, total: 7, status: 'active' },
            { name: '英語学習', category: '学習', progress: 6, total: 7, status: 'active' },
            { name: '読書30分', category: '学習', progress: 4, total: 7, status: 'behind' },
            { name: '瞑想', category: '健康', progress: 7, total: 7, status: 'complete' },
            { name: '筋力トレーニング', category: '運動', progress: 3, total: 7, status: 'behind' },
            { name: '野菜を多く摂る', category: '健康', progress: 6, total: 7, status: 'active' },
            { name: '日記を書く', category: '趣味', progress: 2, total: 7, status: 'behind' },
            { name: '楽器の練習', category: '趣味', progress: 4, total: 7, status: 'active' },
            { name: '家事整理', category: '生活', progress: 5, total: 7, status: 'active' },
            { name: 'プログラミング学習', category: '学習', progress: 6, total: 7, status: 'active' },
            { name: 'ストレッチ', category: '健康', progress: 7, total: 7, status: 'complete' },
            { name: '料理の練習', category: '生活', progress: 3, total: 7, status: 'behind' },
          ].map((mission, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-sm">{mission.name}</h4>
                  <p className="text-xs text-gray-500">{mission.category}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  mission.status === 'complete' 
                    ? 'bg-green-100 text-green-700' 
                    : mission.status === 'active' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {mission.status === 'complete' 
                    ? '完了' 
                    : mission.status === 'active' 
                    ? '進行中' 
                    : '要注意'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        mission.status === 'complete' 
                          ? 'bg-green-500' 
                          : mission.status === 'active' 
                          ? 'bg-blue-500' 
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${(mission.progress / mission.total) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-600">
                  {mission.progress}/{mission.total}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const MissionHistory: Story = {
  render: () => (
    <ScrollArea className="h-96 w-80 rounded-md border">
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium">最近の実行履歴</h4>
        <div className="space-y-3">
          {[
            { date: '2024-03-20', time: '07:00', mission: '朝のジョギング', duration: '30分' },
            { date: '2024-03-20', time: '08:30', mission: '英語学習', duration: '25分' },
            { date: '2024-03-20', time: '12:15', mission: '読書', duration: '20分' },
            { date: '2024-03-19', time: '07:15', mission: '朝のジョギング', duration: '32分' },
            { date: '2024-03-19', time: '09:00', mission: '瞑想', duration: '15分' },
            { date: '2024-03-19', time: '20:30', mission: '筋力トレーニング', duration: '40分' },
            { date: '2024-03-18', time: '07:30', mission: '朝のジョギング', duration: '28分' },
            { date: '2024-03-18', time: '21:00', mission: '日記を書く', duration: '10分' },
            { date: '2024-03-17', time: '06:45', mission: '朝のジョギング', duration: '35分' },
            { date: '2024-03-17', time: '19:15', mission: '楽器の練習', duration: '45分' },
            { date: '2024-03-16', time: '08:00', mission: '英語学習', duration: '30分' },
            { date: '2024-03-16', time: '13:30', mission: 'プログラミング学習', duration: '60分' },
          ].map((entry, index) => (
            <div key={index} className="flex items-center space-x-3 text-sm">
              <div className="flex flex-col min-w-0">
                <div className="font-medium text-gray-900 truncate">{entry.mission}</div>
                <div className="text-gray-500 text-xs">
                  {entry.date} {entry.time} • {entry.duration}
                </div>
              </div>
              <div className="flex-shrink-0 w-3 h-3 bg-green-400 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  ),
};