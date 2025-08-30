/**
 * TASK-106: ゲーミフィケーションAPI実装 - Badges API テストファイル (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

// Supabase モックセットアップ
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

// Database queries モック
jest.mock('@/lib/db/queries/badges', () => ({
  getAllBadges: jest.fn(),
  getBadgesByCategory: jest.fn(),
  getBadgesByRarity: jest.fn(),
}));

// Next.js cookies モック
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// テストユーティリティ関数
function createMockRequest(path: string, queryParams?: Record<string, string>): NextRequest {
  const url = new URL(`http://localhost:3000${path}`);
  
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return new NextRequest(url.toString(), {
    method: 'GET',
  });
}

describe('GET /api/badges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーでバッジ一覧を取得できる', async () => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123', email: 'test@example.com' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);

      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
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
      ]);

      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badges).toBeDefined();
      expect(Array.isArray(data.data.badges)).toBe(true);
      expect(data.data.badges).toHaveLength(2);
      expect(data.data.badges[0].name).toBe('習慣マスター');
    });

    it('未認証ユーザーでもバッジ一覧を取得できる（公開情報）', async () => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);

      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: '公開バッジ',
          description: '誰でも見ることができるバッジ',
          iconUrl: '/badges/public-badge.png',
          rarity: 'common',
          category: '実績',
        },
      ]);

      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badges).toBeDefined();
    });
  });

  describe('フィルタリングテスト', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('カテゴリフィルターが正常に動作する', async () => {
      const { getBadgesByCategory } = require('@/lib/db/queries/badges');
      getBadgesByCategory.mockResolvedValue([
        {
          id: 'badge1',
          name: '習慣マスター',
          description: '10個のルーティンを完了',
          iconUrl: '/badges/habit-master.png',
          rarity: 'rare',
          category: '実績',
        },
        {
          id: 'badge2',
          name: 'ルーティン作成者',
          description: '初めてルーティンを作成',
          iconUrl: '/badges/routine-creator.png',
          rarity: 'common',
          category: '実績',
        },
      ]);

      const request = createMockRequest('/api/badges', { category: '実績' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(2);
      expect(data.data.badges.every((badge: any) => badge.category === '実績')).toBe(true);
      expect(getBadgesByCategory).toHaveBeenCalledWith('実績');
    });

    it('レアリティフィルターが正常に動作する', async () => {
      const { getBadgesByRarity } = require('@/lib/db/queries/badges');
      getBadgesByRarity.mockResolvedValue([
        {
          id: 'badge3',
          name: '伝説の継続者',
          description: '100日連続実行',
          iconUrl: '/badges/legendary-streak.png',
          rarity: 'legendary',
          category: 'ストリーク',
        },
      ]);

      const request = createMockRequest('/api/badges', { rarity: 'legendary' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(1);
      expect(data.data.badges[0].rarity).toBe('legendary');
      expect(getBadgesByRarity).toHaveBeenCalledWith('legendary');
    });

    it('複数フィルターの組み合わせで正常に動作する', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockImplementation(() => {
        return Promise.resolve([
          {
            id: 'badge1',
            name: 'エピックストリーク',
            description: '50日連続実行',
            iconUrl: '/badges/epic-streak.png',
            rarity: 'epic',
            category: 'ストリーク',
          },
        ]);
      });

      const request = createMockRequest('/api/badges', { 
        category: 'ストリーク',
        rarity: 'epic'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(1);
      expect(data.data.badges[0].category).toBe('ストリーク');
      expect(data.data.badges[0].rarity).toBe('epic');
    });
  });

  describe('ソーティングテスト', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('レアリティ順でソートできる', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: 'コモンバッジ',
          rarity: 'common',
          category: '実績',
        },
        {
          id: 'badge2',
          name: 'レアバッジ',
          rarity: 'rare',
          category: '実績',
        },
        {
          id: 'badge3',
          name: 'レジェンダリーバッジ',
          rarity: 'legendary',
          category: '実績',
        },
      ]);

      const request = createMockRequest('/api/badges', { sortBy: 'rarity' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(3);
    });

    it('名前順でソートできる', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: 'A バッジ',
          rarity: 'common',
          category: '実績',
        },
        {
          id: 'badge2',
          name: 'Z バッジ',
          rarity: 'common',
          category: '実績',
        },
      ]);

      const request = createMockRequest('/api/badges', { 
        sortBy: 'name',
        sortOrder: 'asc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(2);
    });

    it('作成日順でソートできる', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: '新しいバッジ',
          rarity: 'common',
          category: '実績',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'badge2',
          name: '古いバッジ',
          rarity: 'common',
          category: '実績',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/badges', { sortBy: 'createdAt' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(2);
    });
  });

  describe('ページングテスト', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('ページングパラメータが正しく処理される', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      // Create enough badges to test pagination (30 badges total)
      const allBadges = Array.from({ length: 30 }, (_, i) => ({
        id: `badge${i}`,
        name: `バッジ${i}`,
        rarity: 'common',
        category: '実績',
      }));
      getAllBadges.mockResolvedValue(allBadges);

      const request = createMockRequest('/api/badges', { page: '2', limit: '10' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(10);
      expect(data.data.badges).toHaveLength(10); // Second page should have 10 items
      expect(data.data.pagination.total).toBe(30);
      expect(data.data.pagination.pages).toBe(3);
    });

    it('デフォルトページング値が適用される', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockImplementation((filters, pagination) => {
        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(50);
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/badges');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('入力バリデーション', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('無効なcategoryで400エラーになる', async () => {
      const request = createMockRequest('/api/badges', { category: 'invalid_category' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('category');
    });

    it('無効なrarityで400エラーになる', async () => {
      const request = createMockRequest('/api/badges', { rarity: 'invalid_rarity' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('rarity');
    });

    it('無効なsortByで400エラーになる', async () => {
      const request = createMockRequest('/api/badges', { sortBy: 'invalid_field' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortBy');
    });

    it('無効なsortOrderで400エラーになる', async () => {
      const request = createMockRequest('/api/badges', { 
        sortBy: 'name',
        sortOrder: 'invalid' 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortOrder');
    });

    it('無効なpageで400エラーになる', async () => {
      const request = createMockRequest('/api/badges', { page: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('page');
    });

    it('無効なlimitで400エラーになる', async () => {
      const request = createMockRequest('/api/badges', { limit: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('limit');
    });

    it('limitが100を超えると400エラーになる', async () => {
      const request = createMockRequest('/api/badges', { limit: '101' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('limit');
    });
  });

  describe('エラーハンドリング', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('データベースエラー時に500エラーを返す', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('エッジケース', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('バッジが存在しない場合は空配列を返す', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([]);

      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badges).toEqual([]);
    });

    it('フィルター結果が0件の場合は空配列を返す', async () => {
      const { getBadgesByCategory } = require('@/lib/db/queries/badges');
      getBadgesByCategory.mockResolvedValue([]);

      const request = createMockRequest('/api/badges', { category: '存在しないカテゴリ' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.badges).toEqual([]);
    });

    it('iconUrlがnullのバッジも正常に取得できる', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: 'アイコンなしバッジ',
          description: 'アイコンが設定されていないバッジ',
          iconUrl: null,
          rarity: 'common',
          category: '実績',
        },
      ]);

      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(1);
      expect(data.data.badges[0].iconUrl).toBeNull();
    });

    it('長い名前や説明を持つバッジも正常に取得できる', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: 'とても長いバッジ名'.repeat(10), // 長い名前
          description: 'とても長い説明文'.repeat(20), // 長い説明
          iconUrl: '/badges/long-name-badge.png',
          rarity: 'rare',
          category: '実績',
        },
      ]);

      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(1);
      expect(data.data.badges[0].name).toBeDefined();
      expect(data.data.badges[0].description).toBeDefined();
    });

    it('大量のバッジでもパフォーマンスが適切である', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      const largeBadgeList = Array.from({ length: 100 }, (_, i) => ({
        id: `badge-${i}`,
        name: `バッジ${i}`,
        description: `説明${i}`,
        iconUrl: `/badges/badge-${i}.png`,
        rarity: 'common',
        category: '実績',
      }));
      getAllBadges.mockResolvedValue(largeBadgeList);

      const startTime = Date.now();
      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const responseTime = Date.now() - startTime;
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(100);
      expect(responseTime).toBeLessThan(1000);
    });
  });

  describe('レアリティ順序テスト', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('全レアリティのバッジを正常に取得できる', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: 'コモンバッジ',
          rarity: 'common',
          category: '実績',
        },
        {
          id: 'badge2',
          name: 'レアバッジ',
          rarity: 'rare',
          category: '実績',
        },
        {
          id: 'badge3',
          name: 'エピックバッジ',
          rarity: 'epic',
          category: '実績',
        },
        {
          id: 'badge4',
          name: 'レジェンダリーバッジ',
          rarity: 'legendary',
          category: '実績',
        },
      ]);

      const request = createMockRequest('/api/badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.badges).toHaveLength(4);
      
      const rarities = data.data.badges.map((badge: any) => badge.rarity);
      expect(rarities).toContain('common');
      expect(rarities).toContain('rare');
      expect(rarities).toContain('epic');
      expect(rarities).toContain('legendary');
    });
  });

  describe('パフォーマンステスト', () => {
    beforeEach(() => {
      const { createServerClient } = require('@supabase/ssr');
      const mockSupabase = {
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
      };
      createServerClient.mockReturnValue(mockSupabase);
    });

    it('バッジ一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getAllBadges } = require('@/lib/db/queries/badges');
      getAllBadges.mockResolvedValue([
        {
          id: 'badge1',
          name: 'パフォーマンステスト',
          description: 'テスト用バッジ',
          iconUrl: '/badges/test.png',
          rarity: 'common',
          category: '実績',
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/badges');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });
  });
});