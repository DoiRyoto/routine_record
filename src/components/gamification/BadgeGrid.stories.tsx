import type { Meta, StoryObj } from '@storybook/nextjs';

import { BadgeGrid } from './BadgeGrid';

const meta: Meta<typeof BadgeGrid> = {
  title: 'Gamification/BadgeGrid',
  component: BadgeGrid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onBadgeClick: { action: 'badge clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const createMockBadge = (id: string, name: string, rarity: 'common' | 'rare' | 'epic' | 'legendary', isNew = false) => ({
  id,
  userId: 'user1',
  badgeId: id,
  badge: {
    id,
    name,
    description: `${name}の説明`,
    iconUrl: '',
    rarity,
    category: 'テスト',
    createdAt: new Date(),
  },
  unlockedAt: new Date(),
  isNew,
});

const mockBadges = [
  createMockBadge('1', '習慣マスター', 'rare', true),
  createMockBadge('2', 'ストリークキング', 'epic'),
  createMockBadge('3', '伝説の継続者', 'legendary'),
  createMockBadge('4', '朝型人間', 'common'),
  createMockBadge('5', '夜型人間', 'common'),
  createMockBadge('6', '週末戦士', 'rare'),
];

export const Default: Story = {
  args: {
    badges: mockBadges,
    maxDisplay: 12,
  },
};

export const SmallSize: Story = {
  args: {
    badges: mockBadges,
    size: 'sm',
    maxDisplay: 18,
  },
};

export const LargeSize: Story = {
  args: {
    badges: mockBadges,
    size: 'lg',
    maxDisplay: 8,
  },
};

export const WithNewBadges: Story = {
  args: {
    badges: [
      ...mockBadges,
      createMockBadge('7', '新しいバッジ1', 'epic', true),
      createMockBadge('8', '新しいバッジ2', 'rare', true),
    ],
    maxDisplay: 16,
  },
};

export const OnlyLegendary: Story = {
  args: {
    badges: [
      createMockBadge('1', '伝説の継続者', 'legendary'),
      createMockBadge('2', '完璧主義者', 'legendary'),
      createMockBadge('3', 'マスターオブマスターズ', 'legendary'),
    ],
    size: 'lg',
    maxDisplay: 6,
  },
};

export const ManyBadges: Story = {
  args: {
    badges: Array(24).fill(null).map((_, i) => 
      createMockBadge(
        `badge-${i}`, 
        `バッジ ${i + 1}`, 
        (['common', 'rare', 'epic', 'legendary'] as const)[i % 4],
        i < 3
      )
    ),
    maxDisplay: 20,
  },
};

export const FewBadges: Story = {
  args: {
    badges: mockBadges.slice(0, 3),
    maxDisplay: 12,
    showEmpty: true,
  },
};

export const NoBadges: Story = {
  args: {
    badges: [],
    maxDisplay: 12,
    showEmpty: true,
  },
};

export const WithoutEmptySlots: Story = {
  args: {
    badges: mockBadges.slice(0, 4),
    showEmpty: false,
  },
};

export const Compact: Story = {
  args: {
    badges: mockBadges,
    size: 'sm',
    maxDisplay: 6,
    showEmpty: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'コンパクトなバッジ表示（空のスロットなし）',
      },
    },
  },
};