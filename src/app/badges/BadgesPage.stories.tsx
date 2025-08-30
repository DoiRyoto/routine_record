import type { Meta, StoryObj } from '@storybook/nextjs';

import { BadgesPage } from './BadgesPage';

const meta: Meta<typeof BadgesPage> = {
  title: 'Pages/BadgesPage',
  component: BadgesPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'バッジコレクション画面 - ユーザーが獲得したバッジを表示・管理する画面'
      }
    }
  },
  decorators: [
    (Story) => {
      // Mock API responses for Storybook
      const mockBadges = [
        {
          id: 'badge-1',
          name: '初回実行',
          description: '最初のルーチンを実行しました',
          iconUrl: '',
          rarity: 'common' as const,
          category: '実績',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'badge-2', 
          name: '10回連続',
          description: 'ルーチンを10回連続で実行しました',
          iconUrl: '',
          rarity: 'rare' as const,
          category: 'ストリーク',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'badge-3',
          name: '継続は力なり',
          description: '30日間連続でルーチンを実行しました',
          iconUrl: '',
          rarity: 'epic' as const,
          category: 'ストリーク',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'badge-4',
          name: 'マスター',
          description: '100回のルーチンを完了しました',
          iconUrl: '',
          rarity: 'legendary' as const,
          category: '実績',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const mockUserBadges = [
        {
          userId: 'user-1',
          badgeId: 'badge-1',
          earnedAt: new Date('2024-12-01'),
          isNew: false,
          createdAt: new Date('2024-12-01'),
          updatedAt: new Date('2024-12-01')
        },
        {
          userId: 'user-1', 
          badgeId: 'badge-2',
          earnedAt: new Date('2024-12-15'),
          isNew: true,
          createdAt: new Date('2024-12-15'),
          updatedAt: new Date('2024-12-15')
        }
      ];

      // Mock fetch calls
      const originalFetch = global.fetch;
      global.fetch = jest.fn((url) => {
        if (url === '/api/badges') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ badges: mockBadges })
          } as Response);
        }
        if (url === '/api/user-badges') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ userBadges: mockUserBadges })
          } as Response);
        }
        return originalFetch(url);
      }) as jest.Mock;

      const StoryWrapper = () => <Story />;
      
      return <StoryWrapper />;
    }
  ]
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'デフォルト',
  parameters: {
    docs: {
      description: {
        story: 'バッジコレクション画面の基本表示。取得済みと未取得のバッジが混在している状態。'
      }
    }
  }
};

export const WithNewBadges: Story = {
  name: '新規バッジあり',
  parameters: {
    docs: {
      description: {
        story: '新規取得バッジがある状態。NEWバッジとアニメーションが表示される。'
      }
    }
  }
};

export const Loading: Story = {
  name: 'ローディング状態',
  decorators: [
    (Story) => {
      // Mock loading state
      global.fetch = jest.fn(() => 
        new Promise(resolve => setTimeout(resolve, 5000))
      ) as jest.Mock;
      
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'データ取得中のローディング状態。スケルトン表示される。'
      }
    }
  }
};

export const Error: Story = {
  name: 'エラー状態',
  decorators: [
    (Story) => {
      // Mock error state
      global.fetch = jest.fn(() => 
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ error: 'Server error' })
        } as Response)
      ) as jest.Mock;
      
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'APIエラー発生時の表示。エラーメッセージと再試行ボタンが表示される。'
      }
    }
  }
};

export const NoBadges: Story = {
  name: 'バッジなし',
  decorators: [
    (Story) => {
      // Mock empty state
      global.fetch = jest.fn((url) => {
        if (url === '/api/badges') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ badges: [] })
          } as Response);
        }
        if (url === '/api/user-badges') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ userBadges: [] })
          } as Response);
        }
        return Promise.reject(new Error('Unknown endpoint'));
      }) as jest.Mock;
      
      return <Story />;
    }
  ],
  parameters: {
    docs: {
      description: {
        story: 'バッジが存在しない場合の空状態表示。'
      }
    }
  }
};