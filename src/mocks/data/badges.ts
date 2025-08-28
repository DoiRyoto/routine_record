import type { Badge } from '@/lib/db/schema';

export const mockBadges: Badge[] = [
  {
    id: 'badge1',
    name: '習慣マスター',
    description: '10個のルーティンを完了',
    iconUrl: '/badges/habit-master.png',
    rarity: 'rare',
    category: '実績',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'badge2',
    name: 'ストリークキング',
    description: '30日連続実行',
    iconUrl: '/badges/streak-king.png',
    rarity: 'epic',
    category: 'ストリーク',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'badge3',
    name: '伝説の継続者',
    description: '100日連続実行',
    iconUrl: '/badges/legendary-streak.png',
    rarity: 'legendary',
    category: 'ストリーク',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'new-year-2025',
    name: '新年マスターバッジ',
    description: '2025年最初のチャレンジ完了者',
    iconUrl: '/badges/new-year-2025.png',
    rarity: 'epic',
    category: 'チャレンジ',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'spring-habits',
    name: '春の新習慣バッジ',
    description: 'シーズナルチャレンジ完了者',
    iconUrl: '/badges/spring-habits.png',
    rarity: 'rare',
    category: 'チャレンジ',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'streak-master-30',
    name: '継続マスターバッジ',
    description: '30日連続達成者',
    iconUrl: '/badges/streak-master-30.png',
    rarity: 'epic',
    category: 'ストリーク',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'summer-health',
    name: '夏の健康バッジ',
    description: '夏季健康チャレンジ完了者',
    iconUrl: '/badges/summer-health.png',
    rarity: 'rare',
    category: 'チャレンジ',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'routine-creator',
    name: 'ルーティン作成者',
    description: '初めてルーティンを作成',
    iconUrl: '/badges/routine-creator.png',
    rarity: 'common',
    category: '実績',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'weekly-warrior',
    name: '週間ウォリアー',
    description: '1週間毎日実行',
    iconUrl: '/badges/weekly-warrior.png',
    rarity: 'common',
    category: 'ストリーク',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'perfectionist',
    name: 'パーフェクショニスト',
    description: '1日に10回のルーティン実行',
    iconUrl: '/badges/perfectionist.png',
    rarity: 'rare',
    category: '実績',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Mock関数 - lib/db/queries/badges.ts に対応
export const getMockAllBadges = (): Badge[] => {
  return mockBadges;
};

export const getMockBadgesByCategory = (category: string): Badge[] => {
  return mockBadges.filter(badge => badge.category === category);
};

export const getMockBadgeById = (id: string): Badge | null => {
  return mockBadges.find(badge => badge.id === id) || null;
};

export const mockCreateBadge = (badgeData: Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>): Badge => {
  const newBadge: Badge = {
    id: `badge-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    ...badgeData,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  mockBadges.push(newBadge);
  return newBadge;
};

export const mockUpdateBadge = (
  id: string, 
  updates: Partial<Omit<Badge, 'id' | 'createdAt' | 'updatedAt'>>
): Badge => {
  const badge = mockBadges.find(b => b.id === id);
  if (!badge) {
    throw new Error('バッジが見つかりません');
  }
  
  Object.assign(badge, updates, { updatedAt: new Date() });
  return badge;
};

export const mockDeleteBadge = (id: string): void => {
  const index = mockBadges.findIndex(b => b.id === id);
  if (index === -1) {
    throw new Error('バッジが見つかりません');
  }
  
  mockBadges.splice(index, 1);
};