import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './HoverCard';
import { 
  UserIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  CheckIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const meta: Meta<typeof HoverCard> = {
  title: 'UI/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ホバーカードコンポーネント - ホバー時に詳細情報を表示するカード',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HoverCard>;

export const Default: Story = {
  render: () => (
    <div className="p-8">
      <HoverCard>
        <HoverCardTrigger asChild>
          <button className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <UserIcon className="h-4 w-4 mr-2" />
            ユーザー情報
          </button>
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-semibold">田中太郎</p>
                <p className="text-xs text-gray-600">@tanaka_taro</p>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              ミッション継続中のユーザーです。健康と学習を中心に取り組んでいます。
            </p>
            <div className="flex items-center text-xs text-gray-500">
              <CalendarIcon className="h-3 w-3 mr-1" />
              参加日: 2023年4月15日
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const MissionDetails: Story = {
  name: 'ミッション詳細',
  render: () => (
    <div className="p-8 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">今日のミッション（ホバーで詳細表示）</h3>
        <div className="space-y-3">
          {[
            {
              title: '朝のランニング',
              category: '健康',
              status: 'completed',
              description: '30分間のランニングでしっかりと汗をかき、1日の始まりを活動的に。心肺機能向上と体重管理に効果的です。',
              stats: { streak: 15, totalTime: '7.5時間', lastCompleted: '今日 07:00' }
            },
            {
              title: 'プログラミング学習',
              category: '学習',
              status: 'in-progress',
              description: 'React とTypeScriptを使ったWebアプリケーション開発の学習。実践的なプロジェクトを通じてスキルアップを目指します。',
              stats: { streak: 8, totalTime: '24時間', lastCompleted: '昨日 20:30' }
            },
            {
              title: '瞑想',
              category: '健康',
              status: 'pending',
              description: '10分間のマインドフルネス瞑想。ストレス軽減と集中力向上、心の安定を図ります。',
              stats: { streak: 12, totalTime: '3時間', lastCompleted: '昨日 22:00' }
            },
          ].map((mission, i) => (
            <HoverCard key={i}>
              <HoverCardTrigger asChild>
                <div className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  mission.status === 'completed' ? 'bg-green-50 border-green-200 hover:bg-green-100' :
                  mission.status === 'in-progress' ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' :
                  'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        mission.status === 'completed' ? 'bg-green-500' :
                        mission.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-gray-300'
                      }`}>
                        {mission.status === 'completed' && <CheckIcon className="h-3 w-3 text-white" />}
                        {mission.status === 'in-progress' && <ClockIcon className="h-3 w-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium">{mission.title}</p>
                        <p className="text-sm text-gray-600">{mission.category}</p>
                      </div>
                    </div>
                    <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900">{mission.title}</p>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded mt-1">
                      {mission.category}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600">{mission.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-gray-600">
                        <StarIcon className="h-3 w-3 mr-1" />
                        連続記録
                      </span>
                      <span className="font-semibold">{mission.stats.streak}日</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-gray-600">
                        <ChartBarIcon className="h-3 w-3 mr-1" />
                        累計時間
                      </span>
                      <span className="font-semibold">{mission.stats.totalTime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-gray-600">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        最後の実行
                      </span>
                      <span className="font-semibold">{mission.stats.lastCompleted}</span>
                    </div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs text-center font-medium ${
                    mission.status === 'completed' ? 'bg-green-100 text-green-800' :
                    mission.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {mission.status === 'completed' ? '✓ 完了済み' :
                     mission.status === 'in-progress' ? '🔄 進行中' :
                     '⏳ 未着手'}
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const StatisticsTooltips: Story = {
  name: '統計情報のツールチップ',
  render: () => (
    <div className="p-8">
      <div className="max-w-md bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">今月の進捗サマリー</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">24</p>
                  <p className="text-sm text-blue-600">完了ミッション</p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <p className="font-semibold">完了ミッション詳細</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>健康関連:</span>
                    <span className="font-semibold">12ミッション</span>
                  </div>
                  <div className="flex justify-between">
                    <span>学習関連:</span>
                    <span className="font-semibold">8ミッション</span>
                  </div>
                  <div className="flex justify-between">
                    <span>その他:</span>
                    <span className="font-semibold">4ミッション</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">前月比: +15%の向上</p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-800">89%</p>
                  <p className="text-sm text-green-600">達成率</p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <p className="font-semibold">達成率の内訳</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>完了:</span>
                    <span className="font-semibold">24ミッション</span>
                  </div>
                  <div className="flex justify-between">
                    <span>未完了:</span>
                    <span className="font-semibold">3ミッション</span>
                  </div>
                  <div className="flex justify-between">
                    <span>総設定数:</span>
                    <span className="font-semibold">27ミッション</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-800">12</p>
                  <p className="text-sm text-orange-600">最長連続日</p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <p className="font-semibold">連続記録の詳細</p>
                <div className="space-y-1 text-xs">
                  <p><strong>期間:</strong> 8月10日〜8月21日</p>
                  <p><strong>ミッション:</strong> 朝のランニング</p>
                  <p><strong>カテゴリ:</strong> 健康</p>
                </div>
                <p className="text-xs text-green-600">
                  <CheckIcon className="inline h-3 w-3 mr-1" />
                  現在も継続中
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>

          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 cursor-pointer hover:bg-purple-100 transition-colors">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-800">42h</p>
                  <p className="text-sm text-purple-600">累計時間</p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-2">
                <p className="font-semibold">時間の内訳</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>運動時間:</span>
                    <span className="font-semibold">18.5時間</span>
                  </div>
                  <div className="flex justify-between">
                    <span>学習時間:</span>
                    <span className="font-semibold">20時間</span>
                  </div>
                  <div className="flex justify-between">
                    <span>その他:</span>
                    <span className="font-semibold">3.5時間</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600">1日平均: 1.4時間</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </div>
  ),
};

export const NotificationCards: Story = {
  name: '通知カード',
  render: () => (
    <div className="p-8 space-y-4 max-w-md">
      <h3 className="text-lg font-semibold">通知センター</h3>
      
      <div className="space-y-2">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">ミッションリマインダー</p>
                <p className="text-xs text-gray-600">読書の時間です</p>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <p className="font-semibold">読書ミッション</p>
              <p className="text-sm text-gray-600">
                設定された時間になりました。今日の目標は30ページの技術書を読むことです。
              </p>
              <div className="text-xs text-gray-500">
                <p>目標時間: 45分</p>
                <p>推奨時間帯: 19:00 - 20:00</p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors">
              <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">ミッション達成</p>
                <p className="text-xs text-gray-600">運動ミッションが完了しました</p>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <p className="font-semibold">🎉 おめでとうございます！</p>
              <p className="text-sm text-gray-600">
                朝のランニング（30分）が完了しました。15日連続達成中です！
              </p>
              <div className="flex items-center justify-between text-xs">
                <span>消費カロリー:</span>
                <span className="font-semibold">285kcal</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>次の目標まで:</span>
                <span className="font-semibold">5日</span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">注意が必要</p>
                <p className="text-xs text-gray-600">瞑想ミッションが2日未実行</p>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-2">
              <p className="font-semibold">⚠️ ミッションが滞っています</p>
              <p className="text-sm text-gray-600">
                瞑想ミッションが2日間実行されていません。連続記録を維持するために今日実行することをお勧めします。
              </p>
              <div className="text-xs text-gray-500">
                <p>最後の実行: 2日前</p>
                <p>推奨: 今日中に10分間の瞑想</p>
              </div>
              <button className="w-full mt-2 px-3 py-1.5 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors">
                今すぐ実行する
              </button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </div>
  ),
};

export const UserProfileCards: Story = {
  name: 'ユーザープロフィールカード',
  render: () => (
    <div className="p-8 space-y-6">
      <h3 className="text-lg font-semibold">チーム メンバー</h3>
      
      <div className="flex flex-wrap gap-4">
        {[
          {
            name: '田中太郎',
            role: 'ミッションリーダー',
            streak: 45,
            missions: 156,
            avatar: 'bg-blue-500',
            status: 'online'
          },
          {
            name: '佐藤花子',
            role: '健康スペシャリスト',
            streak: 32,
            missions: 128,
            avatar: 'bg-green-500',
            status: 'away'
          },
          {
            name: '山田次郎',
            role: '学習コーディネーター',
            streak: 28,
            missions: 89,
            avatar: 'bg-purple-500',
            status: 'offline'
          },
        ].map((user, i) => (
          <HoverCard key={i}>
            <HoverCardTrigger asChild>
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="relative">
                  <div className={`w-10 h-10 ${user.avatar} rounded-full flex items-center justify-center text-white font-semibold`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                    user.status === 'online' ? 'bg-green-400' :
                    user.status === 'away' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-gray-600">{user.role}</p>
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 ${user.avatar} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.role}</p>
                    <div className="flex items-center space-x-1 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        user.status === 'online' ? 'bg-green-400' :
                        user.status === 'away' ? 'bg-yellow-400' :
                        'bg-gray-400'
                      }`}></div>
                      <span className="text-gray-600">
                        {user.status === 'online' ? 'オンライン' :
                         user.status === 'away' ? '離席中' :
                         'オフライン'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <StarIcon className="h-4 w-4 mr-1" />
                      連続記録
                    </span>
                    <span className="font-semibold">{user.streak}日</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <BookmarkIcon className="h-4 w-4 mr-1" />
                      総ミッション
                    </span>
                    <span className="font-semibold">{user.missions}個</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-gray-600">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      参加期間
                    </span>
                    <span className="font-semibold">
                      {Math.floor(user.missions / 5)}週間
                    </span>
                  </div>
                </div>
                
                <button className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">
                  詳細を見る
                </button>
              </div>
            </HoverCardContent>
          </HoverCard>
        ))}
      </div>
    </div>
  ),
};