import type { Meta, StoryObj } from '@storybook/nextjs';
import Image from 'next/image';

import { AspectRatio } from './AspectRatio';

const meta: Meta<typeof AspectRatio> = {
  title: 'UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: { type: 'number' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => (
    <div className="w-96">
      <AspectRatio ratio={args.ratio} className="bg-gray-100 rounded-md overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
          alt="ミッションのイメージ写真"
          fill
          className="object-cover"
        />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  args: {
    ratio: 1,
  },
  render: (args) => (
    <div className="w-64">
      <AspectRatio ratio={args.ratio} className="bg-gray-100 rounded-md overflow-hidden">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-green-400 text-white font-semibold">
          ミッション完了！
        </div>
      </AspectRatio>
    </div>
  ),
};

export const Portrait: Story = {
  args: {
    ratio: 3 / 4,
  },
  render: (args) => (
    <div className="w-64">
      <AspectRatio ratio={args.ratio} className="bg-gray-100 rounded-md overflow-hidden">
        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-orange-300 to-orange-500 text-white p-4 text-center">
          <div className="text-2xl mb-2">📚</div>
          <div className="font-semibold">読書ミッション</div>
          <div className="text-sm opacity-90">今日も1章読みました</div>
        </div>
      </AspectRatio>
    </div>
  ),
};

export const MissionCard: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
      <div className="border rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
            <div className="text-center">
              <div className="text-3xl mb-2">🏃‍♂️</div>
              <div className="font-semibold">朝のジョギング</div>
            </div>
          </div>
        </AspectRatio>
        <div className="p-4">
          <h3 className="font-semibold mb-2">朝のジョギング</h3>
          <p className="text-sm text-gray-600 mb-3">
            毎朝30分のジョギングで健康的な1日をスタート
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>進捗: 12/30日</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
              継続中
            </span>
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <AspectRatio ratio={16 / 9}>
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 text-white">
            <div className="text-center">
              <div className="text-3xl mb-2">📖</div>
              <div className="font-semibold">読書習慣</div>
            </div>
          </div>
        </AspectRatio>
        <div className="p-4">
          <h3 className="font-semibold mb-2">読書習慣</h3>
          <p className="text-sm text-gray-600 mb-3">
            毎日最低30分の読書で知識を積み重ねる
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>進捗: 8/30日</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
              開始したばかり
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
};