/**
 * TASK-106: ゲーミフィケーションAPI実装 - User Badges API テストファイル (TDD Red Phase)
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
jest.mock('@/lib/db/queries/user-badges', () => ({
  getUserBadges: jest.fn(),
  getUserBadgesByCategory: jest.fn(),
  getUserBadgesByRarity: jest.fn(),
  getUserBadgesWithDetails: jest.fn(),
  getRecentUserBadges: jest.fn(),
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

describe('GET /api/user-badges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーで自分のユーザーバッジ一覧を取得できる', async () => {
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

      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: true,
          createdAt: new Date(),
          badge: {
            id: 'badge1',
            name: '習慣マスター',
            description: '10個のルーティンを完了',
            iconUrl: '/badges/habit-master.png',
            rarity: 'rare',
            category: '実績',
          },
        },
        {
          id: '2',
          userId: 'user-123',
          badgeId: 'badge2',
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          isNew: false,
          createdAt: new Date(),
          badge: {
            id: 'badge2',
            name: 'ストリークキング',
            description: '30日連続実行',
            iconUrl: '/badges/streak-king.png',
            rarity: 'epic',
            category: 'ストリーク',
          },
        },
      ]);

      const request = createMockRequest('/api/user-badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userBadges).toBeDefined();
      expect(Array.isArray(data.data.userBadges)).toBe(true);
      expect(data.data.userBadges).toHaveLength(2);
      expect(data.data.userBadges[0].userId).toBe('user-123');
      expect(data.data.userBadges[0].badge).toBeDefined();
    });

    it('未認証ユーザーは401エラーになる', async () => {
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

      const request = createMockRequest('/api/user-badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  describe('認可テスト', () => {
    beforeEach(() => {
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
    });

    it('他のユーザーのバッジを取得しようとすると403エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { userId: 'other-user' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('他のユーザーの情報にはアクセスできません');
    });

    it('userIdパラメータなしで自分のバッジを取得できる', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: false,
          badge: {
            id: 'badge1',
            name: 'テストバッジ',
            rarity: 'common',
            category: '実績',
          },
        },
      ]);

      const request = createMockRequest('/api/user-badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userBadges[0].userId).toBe('user-123');
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
      const { getUserBadgesByCategory } = require('@/lib/db/queries/user-badges');
      getUserBadgesByCategory.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: false,
          badge: {
            id: 'badge1',
            name: '習慣マスター',
            category: '実績',
            rarity: 'rare',
          },
        },
      ]);

      const request = createMockRequest('/api/user-badges', { category: '実績' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
      expect(data.data.userBadges[0].badge.category).toBe('実績');
      expect(getUserBadgesByCategory).toHaveBeenCalledWith('user-123', '実績');
    });

    it('レアリティフィルターが正常に動作する', async () => {
      const { getUserBadgesByRarity } = require('@/lib/db/queries/user-badges');
      getUserBadgesByRarity.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge3',
          unlockedAt: new Date(),
          isNew: false,
          badge: {
            id: 'badge3',
            name: '伝説の継続者',
            category: 'ストリーク',
            rarity: 'legendary',
          },
        },
      ]);

      const request = createMockRequest('/api/user-badges', { rarity: 'legendary' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
      expect(data.data.userBadges[0].badge.rarity).toBe('legendary');
      expect(getUserBadgesByRarity).toHaveBeenCalledWith('user-123', 'legendary');
    });

    it('新着フィルターが正常に動作する', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockImplementation((userId, filters) => {
        if (filters && filters.isNew === true) {
          return Promise.resolve([
            {
              id: '1',
              userId: 'user-123',
              badgeId: 'badge1',
              unlockedAt: new Date(),
              isNew: true,
              badge: {
                id: 'badge1',
                name: '新着バッジ',
                category: '実績',
                rarity: 'common',
              },
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/user-badges', { isNew: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
      expect(data.data.userBadges[0].isNew).toBe(true);
    });

    it('特定のバッジIDでフィルターできる', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockImplementation((userId, filters) => {
        if (filters && filters.badgeId === 'badge-123') {
          return Promise.resolve([
            {
              id: '1',
              userId: 'user-123',
              badgeId: 'badge-123',
              unlockedAt: new Date(),
              isNew: false,
              badge: {
                id: 'badge-123',
                name: '特定バッジ',
                category: '実績',
                rarity: 'rare',
              },
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/user-badges', { badgeId: 'badge-123' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
      expect(data.data.userBadges[0].badgeId).toBe('badge-123');
    });

    it('取得期間フィルターが正常に動作する', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isNew: false,
          badge: {
            id: 'badge1',
            name: '期間内バッジ',
            category: '実績',
            rarity: 'common',
          },
        },
      ]);

      const unlockedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const unlockedBefore = new Date().toISOString();
      
      const request = createMockRequest('/api/user-badges', { 
        unlockedAfter, 
        unlockedBefore 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
    });
  });

  describe('詳細データ取得テスト', () => {
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

    it('includeBadgeDetails=trueでバッジ詳細を含む', async () => {
      const { getUserBadgesWithDetails } = require('@/lib/db/queries/user-badges');
      getUserBadgesWithDetails.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: false,
          badge: {
            id: 'badge1',
            name: '習慣マスター',
            description: '10個のルーティンを完了',
            iconUrl: '/badges/habit-master.png',
            rarity: 'rare',
            category: '実績',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ]);

      const request = createMockRequest('/api/user-badges', { includeBadgeDetails: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userBadges[0].badge).toBeDefined();
      expect(data.data.userBadges[0].badge.description).toBe('10個のルーティンを完了');
      expect(data.data.userBadges[0].badge.iconUrl).toBe('/badges/habit-master.png');
    });

    it('includeBadgeDetails=falseで基本データのみ取得', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: false,
          badge: {
            id: 'badge1',
            name: '習慣マスター',
            rarity: 'rare',
            category: '実績',
          },
        },
      ]);

      const request = createMockRequest('/api/user-badges', { includeBadgeDetails: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userBadges[0].badge.description).toBeUndefined();
      expect(data.data.userBadges[0].badge.iconUrl).toBeUndefined();
    });

    it('最近の取得バッジのみを取得できる', async () => {
      const { getRecentUserBadges } = require('@/lib/db/queries/user-badges');
      getRecentUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1時間前
          isNew: true,
          badge: {
            id: 'badge1',
            name: '最近のバッジ',
            rarity: 'common',
            category: '実績',
          },
        },
      ]);

      const request = createMockRequest('/api/user-badges', { recent: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
      expect(getRecentUserBadges).toHaveBeenCalledWith('user-123', 10); // デフォルト件数
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

    it('取得日順でソートできる', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isNew: false,
          badge: { name: '新しいバッジ', rarity: 'common', category: '実績' },
        },
        {
          id: '2',
          userId: 'user-123',
          badgeId: 'badge2',
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          isNew: false,
          badge: { name: '古いバッジ', rarity: 'common', category: '実績' },
        },
      ]);

      const request = createMockRequest('/api/user-badges', { 
        sortBy: 'unlockedAt',
        sortOrder: 'desc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(2);
    });

    it('レアリティ順でソートできる', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: false,
          badge: { name: 'レジェンダリー', rarity: 'legendary', category: '実績' },
        },
        {
          id: '2',
          userId: 'user-123',
          badgeId: 'badge2',
          unlockedAt: new Date(),
          isNew: false,
          badge: { name: 'コモン', rarity: 'common', category: '実績' },
        },
      ]);

      const request = createMockRequest('/api/user-badges', { sortBy: 'rarity' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(2);
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
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(10);
        return Promise.resolve([
          {
            id: '11',
            userId: 'user-123',
            badgeId: 'badge11',
            unlockedAt: new Date(),
            isNew: false,
            badge: { name: 'ページ2のバッジ', rarity: 'common', category: '実績' },
          },
        ]);
      });

      const request = createMockRequest('/api/user-badges', { page: '2', limit: '10' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(10);
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
      const request = createMockRequest('/api/user-badges', { category: 'invalid_category' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('category');
    });

    it('無効なrarityで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { rarity: 'invalid_rarity' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('rarity');
    });

    it('無効なisNewで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { isNew: 'invalid_boolean' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('isNew');
    });

    it('無効なbadgeId UUIDで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { badgeId: 'invalid-uuid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('badgeId');
    });

    it('無効なunlockedAfterで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { unlockedAfter: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('unlockedAfter');
    });

    it('無効なunlockedBeforeで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { unlockedBefore: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('unlockedBefore');
    });

    it('unlockedAfterがunlockedBeforeより後の場合400エラーになる', async () => {
      const unlockedAfter = new Date().toISOString();
      const unlockedBefore = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const request = createMockRequest('/api/user-badges', { unlockedAfter, unlockedBefore });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('unlockedAfter');
    });

    it('無効なsortByで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { sortBy: 'invalid_field' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortBy');
    });

    it('無効なincludeBadgeDetailsで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { includeBadgeDetails: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('includeBadgeDetails');
    });

    it('無効なrecentで400エラーになる', async () => {
      const request = createMockRequest('/api/user-badges', { recent: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('recent');
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
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/user-badges');
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

    it('ユーザーバッジが存在しない場合は空配列を返す', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([]);

      const request = createMockRequest('/api/user-badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userBadges).toEqual([]);
    });

    it('フィルター結果が0件の場合は空配列を返す', async () => {
      const { getUserBadgesByCategory } = require('@/lib/db/queries/user-badges');
      getUserBadgesByCategory.mockResolvedValue([]);

      const request = createMockRequest('/api/user-badges', { category: '存在しないカテゴリ' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userBadges).toEqual([]);
    });

    it('全て新着でないバッジの場合も正常に取得できる', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          isNew: false,
          badge: { name: '古いバッジ', rarity: 'common', category: '実績' },
        },
      ]);

      const request = createMockRequest('/api/user-badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
      expect(data.data.userBadges[0].isNew).toBe(false);
    });

    it('全て新着のバッジの場合も正常に取得できる', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: true,
          badge: { name: '新着バッジ', rarity: 'rare', category: '実績' },
        },
      ]);

      const request = createMockRequest('/api/user-badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(1);
      expect(data.data.userBadges[0].isNew).toBe(true);
    });

    it('レアリティの異なる複数のバッジを正常に取得できる', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: false,
          badge: { name: 'コモンバッジ', rarity: 'common', category: '実績' },
        },
        {
          id: '2',
          userId: 'user-123',
          badgeId: 'badge2',
          unlockedAt: new Date(),
          isNew: false,
          badge: { name: 'レジェンダリーバッジ', rarity: 'legendary', category: 'ストリーク' },
        },
      ]);

      const request = createMockRequest('/api/user-badges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userBadges).toHaveLength(2);
      
      const rarities = data.data.userBadges.map((ub: any) => ub.badge.rarity);
      expect(rarities).toContain('common');
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

    it('ユーザーバッジ一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getUserBadges } = require('@/lib/db/queries/user-badges');
      getUserBadges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          badgeId: 'badge1',
          unlockedAt: new Date(),
          isNew: false,
          badge: { name: 'パフォーマンステスト', rarity: 'common', category: '実績' },
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/user-badges');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });
  });
});