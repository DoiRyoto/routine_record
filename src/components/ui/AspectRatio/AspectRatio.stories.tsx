import type { Meta, StoryObj } from '@storybook/react';
import { AspectRatio } from './AspectRatio';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  PhotoIcon,
  PlayIcon,
  DocumentTextIcon,
  CameraIcon
} from '@heroicons/react/24/outline';

const meta: Meta<typeof AspectRatio> = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'アスペクト比コンポーネント - 画像や動画、チャートなどのアスペクト比を維持',
      },
    },
  },
  argTypes: {
    ratio: {
      control: { type: 'number', min: 0.1, max: 5, step: 0.1 },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-80">
      <AspectRatio {...args}>
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg border">
          <PhotoIcon className="h-12 w-12 text-gray-400" />
        </div>
      </AspectRatio>
    </div>
  ),
};

export const CommonRatios: Story = {
  name: '一般的なアスペクト比',
  render: () => (
    <div className="space-y-6 w-96">
      <div>
        <p className="text-sm font-medium mb-2">正方形 (1:1)</p>
        <AspectRatio ratio={1}>
          <div className="flex items-center justify-center h-full bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-center">
              <CameraIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <span className="text-sm text-blue-800">1:1</span>
            </div>
          </div>
        </AspectRatio>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">4:3</p>
        <AspectRatio ratio={4 / 3}>
          <div className="flex items-center justify-center h-full bg-green-50 rounded-lg border border-green-200">
            <div className="text-center">
              <PhotoIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <span className="text-sm text-green-800">4:3</span>
            </div>
          </div>
        </AspectRatio>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">16:9 (ワイド)</p>
        <AspectRatio ratio={16 / 9}>
          <div className="flex items-center justify-center h-full bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-center">
              <PlayIcon className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <span className="text-sm text-orange-800">16:9</span>
            </div>
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};

export const WithImages: Story = {
  name: '画像の例',
  render: () => (
    <div className="space-y-6 w-96">
      <div>
        <p className="text-sm font-medium mb-2">プロフィール画像</p>
        <div className="w-32">
          <AspectRatio ratio={1}>
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
              alt="プロフィール"
              className="object-cover rounded-lg"
            />
          </AspectRatio>
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">バナー画像</p>
        <AspectRatio ratio={21 / 9}>
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="バナー"
            className="object-cover rounded-lg"
          />
        </AspectRatio>
      </div>
    </div>
  ),
};

export const MissionTracking: Story = {
  name: 'ミッション追跡の使用例',
  render: () => (
    <div className="space-y-6 p-6 bg-gray-50 rounded-lg max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">ミッション進捗ダッシュボード</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium mb-2">週次統計チャート</p>
          <AspectRatio ratio={4 / 3}>
            <div className="flex flex-col items-center justify-center h-full bg-blue-50 rounded-lg border border-blue-200 p-4">
              <ChartBarIcon className="h-12 w-12 text-blue-600 mb-4" />
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-800">85%</p>
                <p className="text-sm text-blue-600">今週の達成率</p>
              </div>
              <div className="mt-4 w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </AspectRatio>
        </div>
        
        <div>
          <p className="text-sm font-medium mb-2">月間カレンダー</p>
          <AspectRatio ratio={4 / 3}>
            <div className="flex flex-col items-center justify-center h-full bg-green-50 rounded-lg border border-green-200 p-4">
              <CalendarIcon className="h-12 w-12 text-green-600 mb-4" />
              <div className="text-center">
                <p className="text-2xl font-bold text-green-800">24</p>
                <p className="text-sm text-green-600">今月の達成日数</p>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div 
                    key={i}
                    className={`w-2 h-2 rounded-sm ${
                      i < 10 ? 'bg-green-600' : 'bg-green-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </AspectRatio>
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">ミッション詳細カード</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: '運動', count: 12, color: 'orange' },
            { title: '読書', count: 8, color: 'purple' },
            { title: '瞑想', count: 15, color: 'indigo' }
          ].map((mission) => (
            <div key={mission.title}>
              <AspectRatio ratio={1}>
                <div className={`flex flex-col items-center justify-center h-full bg-${mission.color}-50 rounded-lg border border-${mission.color}-200 p-4`}>
                  <DocumentTextIcon className={`h-8 w-8 text-${mission.color}-600 mb-2`} />
                  <p className={`text-lg font-bold text-${mission.color}-800`}>{mission.count}</p>
                  <p className={`text-sm text-${mission.color}-600`}>{mission.title}</p>
                </div>
              </AspectRatio>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <p className="text-sm font-medium mb-2">動機付け画像</p>
        <AspectRatio ratio={21 / 9}>
          <div className="flex items-center justify-center h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-lg text-white p-6">
            <div className="text-center">
              <h4 className="text-2xl font-bold mb-2">今日も頑張りましょう！</h4>
              <p className="text-lg opacity-90">継続は力なり</p>
            </div>
          </div>
        </AspectRatio>
      </div>
    </div>
  ),
};

export const ResponsiveGrid: Story = {
  name: 'レスポンシブグリッド',
  render: () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <AspectRatio ratio={4 / 3}>
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg border">
              <div className="text-center">
                <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm text-gray-600">アイテム {i + 1}</span>
              </div>
            </div>
          </AspectRatio>
        </div>
      ))}
    </div>
  ),
};