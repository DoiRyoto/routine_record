import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from './ScrollArea';
import { 
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  CalendarIcon,
  TagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const meta: Meta<typeof ScrollArea> = {
  title: 'UI/ScrollArea',
  component: ScrollArea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'スクロールエリアコンポーネント - 長いコンテンツのスクロール領域を提供',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['vertical', 'horizontal', 'both'],
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="w-64 h-48 border rounded-lg">
      <ScrollArea {...args} className="h-full p-4">
        <div className="space-y-2">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="p-2 bg-gray-100 rounded text-sm">
              アイテム {i + 1}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const Orientations: Story = {
  name: 'スクロール方向',
  render: () => (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium mb-2">縦スクロール</p>
        <div className="w-64 h-32 border rounded-lg">
          <ScrollArea orientation="vertical" className="h-full p-4">
            <div className="space-y-2">
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="p-2 bg-blue-50 rounded text-sm">
                  縦スクロールアイテム {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">横スクロール</p>
        <div className="w-64 h-20 border rounded-lg">
          <ScrollArea orientation="horizontal" className="h-full p-4">
            <div className="flex space-x-2" style={{ width: '600px' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="flex-shrink-0 p-2 bg-green-50 rounded text-sm whitespace-nowrap">
                  横スクロールアイテム {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">双方向スクロール</p>
        <div className="w-64 h-32 border rounded-lg">
          <ScrollArea orientation="both" className="h-full p-4">
            <div className="space-y-2" style={{ width: '400px' }}>
              {Array.from({ length: 15 }, (_, i) => (
                <div key={i} className="p-2 bg-orange-50 rounded text-sm whitespace-nowrap">
                  双方向スクロールアイテム {i + 1} - とても長いテキストがここに続きます
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  ),
};

export const MissionList: Story = {
  name: 'ミッションリスト',
  render: () => (
    <div className="w-80 h-96 border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">今日のミッション</h3>
        <p className="text-sm text-gray-600">12個のミッション</p>
      </div>
      
      <ScrollArea orientation="vertical" className="h-80">
        <div className="p-4 space-y-3">
          {[
            { id: 1, title: '朝のランニング', category: '健康', completed: true, time: '30分' },
            { id: 2, title: 'プログラミング学習', category: '学習', completed: true, time: '1時間' },
            { id: 3, title: '読書', category: '学習', completed: false, time: '45分' },
            { id: 4, title: '瞑想', category: '健康', completed: false, time: '15分' },
            { id: 5, title: '英語学習', category: '学習', completed: false, time: '30分' },
            { id: 6, title: '掃除', category: '家事', completed: true, time: '20分' },
            { id: 7, title: '料理', category: '家事', completed: false, time: '40分' },
            { id: 8, title: 'ストレッチ', category: '健康', completed: false, time: '10分' },
            { id: 9, title: '日記を書く', category: '自己啓発', completed: false, time: '15分' },
            { id: 10, title: 'SNSチェック制限', category: 'デジタルデトックス', completed: true, time: '制限中' },
            { id: 11, title: '水を2L飲む', category: '健康', completed: false, time: '継続中' },
            { id: 12, title: '早寝の準備', category: '健康', completed: false, time: '22:00' },
          ].map((mission) => (
            <div
              key={mission.id}
              className={`p-3 rounded-lg border transition-colors ${
                mission.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                    mission.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {mission.completed && <CheckIcon className="h-3 w-3 text-white" />}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      mission.completed ? 'text-green-800 line-through' : 'text-gray-900'
                    }`}>
                      {mission.title}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {mission.category}
                      </span>
                      <span className="inline-flex items-center text-xs text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {mission.time}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const StatisticsPanel: Story = {
  name: '統計パネル',
  render: () => (
    <div className="w-96 h-80 border rounded-lg bg-white shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">月次統計</h3>
        <p className="text-sm text-gray-600">過去6ヶ月の進捗</p>
      </div>
      
      <ScrollArea orientation="vertical" className="h-64">
        <div className="p-4 space-y-4">
          {[
            { month: '8月', missions: 156, completed: 142, rate: 91 },
            { month: '7月', missions: 162, completed: 138, rate: 85 },
            { month: '6月', missions: 148, completed: 131, rate: 89 },
            { month: '5月', missions: 154, completed: 125, rate: 81 },
            { month: '4月', missions: 159, completed: 143, rate: 90 },
            { month: '3月', missions: 151, completed: 128, rate: 85 },
            { month: '2月', missions: 144, completed: 122, rate: 85 },
            { month: '1月', missions: 158, completed: 134, rate: 85 },
          ].map((stat) => (
            <div key={stat.month} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{stat.month}</h4>
                <span className={`text-sm font-semibold px-2 py-1 rounded ${
                  stat.rate >= 90 ? 'bg-green-100 text-green-800' :
                  stat.rate >= 80 ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {stat.rate}%
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">完了: {stat.completed}</span>
                  <span className="text-gray-600">総数: {stat.missions}</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      stat.rate >= 90 ? 'bg-green-500' :
                      stat.rate >= 80 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stat.rate}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <ChartBarIcon className="h-3 w-3 mr-1" />
                  平均達成率
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {Math.floor(stat.missions / 4)} 週間
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const HorizontalCategoryFilter: Story = {
  name: '横スクロールカテゴリフィルター',
  render: () => (
    <div className="w-80">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">カテゴリフィルター</h3>
        <p className="text-sm text-gray-600">横にスクロールしてカテゴリを選択</p>
      </div>
      
      <div className="border rounded-lg p-2">
        <ScrollArea orientation="horizontal" className="h-12">
          <div className="flex space-x-2" style={{ width: '600px' }}>
            {[
              { name: 'すべて', count: 24, active: true },
              { name: '健康', count: 8, active: false },
              { name: '学習', count: 6, active: false },
              { name: '仕事', count: 4, active: false },
              { name: '家事', count: 3, active: false },
              { name: '趣味', count: 2, active: false },
              { name: '自己啓発', count: 1, active: false },
            ].map((category) => (
              <button
                key={category.name}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category.active
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  ),
};

export const ChatMessages: Story = {
  name: 'チャットメッセージ',
  render: () => (
    <div className="w-80 h-64 border rounded-lg bg-white">
      <div className="p-3 border-b bg-gray-50">
        <h3 className="font-medium">ミッションサポートチャット</h3>
      </div>
      
      <ScrollArea orientation="vertical" className="h-48">
        <div className="p-3 space-y-3">
          {[
            { type: 'assistant', message: '今日のミッション、素晴らしい進捗ですね！', time: '10:30' },
            { type: 'user', message: '運動ミッションを完了しました', time: '10:45' },
            { type: 'assistant', message: 'おめでとうございます！次は読書ミッションはいかがですか？', time: '10:46' },
            { type: 'user', message: '少し疲れているので、軽い瞑想から始めます', time: '11:00' },
            { type: 'assistant', message: '良い選択です。リラックスして取り組んでください。', time: '11:01' },
            { type: 'user', message: '瞑想も完了。気分がスッキリしました！', time: '11:20' },
            { type: 'assistant', message: '素晴らしいですね！今日はもう3つのミッションを達成しています。', time: '11:21' },
          ].map((msg, i) => (
            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-2 rounded-lg ${
                msg.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};