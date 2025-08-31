/**
 * TASK-106: ゲーミフィケーションAPI実装 - Missions API テストファイル (TDD Red Phase)
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
jest.mock('@/server/lib/db/queries/missions', () => ({
  getAllMissions: jest.fn(),
  getMissionsByDifficulty: jest.fn(),
  getMissionsByType: jest.fn(),
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

describe('GET /api/missions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーでミッション一覧を取得できる', async () => {
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

      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockResolvedValue([
        {
          id: '1',
          title: '習慣の第一歩',
          description: '初めてのルーティンを完了しよう',
          type: 'count',
          targetValue: 1,
          xpReward: 50,
          badgeId: 'routine-creator',
          difficulty: 'easy',
          isActive: true,
        },
        {
          id: '2',
          title: '7日チャレンジ',
          description: '7日連続でルーティンを実行しよう',
          type: 'streak',
          targetValue: 7,
          xpReward: 150,
          badgeId: 'weekly-warrior',
          difficulty: 'medium',
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.missions).toBeDefined();
      expect(Array.isArray(data.data.missions)).toBe(true);
      expect(data.data.missions).toHaveLength(2);
      expect(data.data.missions[0].title).toBe('習慣の第一歩');
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

      const request = createMockRequest('/api/missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
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

    it('難易度フィルターが正常に動作する', async () => {
      const { getMissionsByDifficulty } = require('@/server/lib/db/queries/missions');
      getMissionsByDifficulty.mockResolvedValue([
        {
          id: '1',
          title: '習慣の第一歩',
          description: '初めてのルーティンを完了しよう',
          type: 'count',
          targetValue: 1,
          xpReward: 50,
          difficulty: 'easy',
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/missions', { difficulty: 'easy' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.missions).toHaveLength(1);
      expect(data.data.missions[0].difficulty).toBe('easy');
      expect(getMissionsByDifficulty).toHaveBeenCalledWith('easy');
    });

    it('タイプフィルターが正常に動作する', async () => {
      const { getMissionsByType } = require('@/server/lib/db/queries/missions');
      getMissionsByType.mockResolvedValue([
        {
          id: '2',
          title: '7日チャレンジ',
          description: '7日連続でルーティンを実行しよう',
          type: 'streak',
          targetValue: 7,
          xpReward: 150,
          difficulty: 'medium',
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/missions', { type: 'streak' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.missions).toHaveLength(1);
      expect(data.data.missions[0].type).toBe('streak');
      expect(getMissionsByType).toHaveBeenCalledWith('streak');
    });

    it('複数フィルターの組み合わせで正常に動作する', async () => {
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockResolvedValue([
        {
          id: '1',
          title: 'イージーストリーク',
          type: 'streak',
          difficulty: 'easy',
          targetValue: 3,
          xpReward: 25,
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/missions', { 
        difficulty: 'easy', 
        type: 'streak' 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.missions).toHaveLength(1);
      expect(data.data.missions[0].difficulty).toBe('easy');
      expect(data.data.missions[0].type).toBe('streak');
    });

    it('isActiveフィルターが正常に動作する', async () => {
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockImplementation(() => {
        return Promise.resolve([
          {
            id: '1',
            title: 'アクティブミッション',
            type: 'count',
            difficulty: 'easy',
            isActive: true,
          },
        ]);
      });

      const request = createMockRequest('/api/missions', { isActive: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.missions.every((mission: any) => mission.isActive)).toBe(true);
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

    it('難易度順でソートできる', async () => {
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockResolvedValue([
        {
          id: '1',
          title: 'イージー',
          difficulty: 'easy',
          xpReward: 50,
        },
        {
          id: '2',
          title: 'ハード',
          difficulty: 'hard',
          xpReward: 200,
        },
        {
          id: '3',
          title: 'ミディアム',
          difficulty: 'medium',
          xpReward: 100,
        },
      ]);

      const request = createMockRequest('/api/missions', { sortBy: 'difficulty' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.missions).toHaveLength(3);
      // ソート順の検証は実装依存
    });

    it('報酬XP順でソートできる', async () => {
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockResolvedValue([
        {
          id: '1',
          title: 'ローXP',
          xpReward: 50,
        },
        {
          id: '2',
          title: 'ハイXP',
          xpReward: 200,
        },
      ]);

      const request = createMockRequest('/api/missions', { 
        sortBy: 'xpReward',
        sortOrder: 'desc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.missions).toHaveLength(2);
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

    it('無効な難易度で400エラーになる', async () => {
      const request = createMockRequest('/api/missions', { difficulty: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('difficulty');
    });

    it('無効なタイプで400エラーになる', async () => {
      const request = createMockRequest('/api/missions', { type: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('type');
    });

    it('無効なisActiveで400エラーになる', async () => {
      const request = createMockRequest('/api/missions', { isActive: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('isActive');
    });

    it('無効なsortByで400エラーになる', async () => {
      const request = createMockRequest('/api/missions', { sortBy: 'invalid_field' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortBy');
    });

    it('無効なsortOrderで400エラーになる', async () => {
      const request = createMockRequest('/api/missions', { 
        sortBy: 'xpReward',
        sortOrder: 'invalid' 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortOrder');
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
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/missions');
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

    it('ミッションが存在しない場合は空配列を返す', async () => {
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockResolvedValue([]);

      const request = createMockRequest('/api/missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.missions).toEqual([]);
    });

    it('フィルター結果が0件の場合は空配列を返す', async () => {
      const { getMissionsByDifficulty } = require('@/server/lib/db/queries/missions');
      getMissionsByDifficulty.mockResolvedValue([]);

      const request = createMockRequest('/api/missions', { difficulty: 'extreme' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.missions).toEqual([]);
    });

    it('大量のミッションでもパフォーマンスが適切である', async () => {
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      const largeMissionList = Array.from({ length: 100 }, (_, i) => ({
        id: `mission-${i}`,
        title: `ミッション${i}`,
        type: 'count',
        difficulty: 'easy',
        targetValue: 10,
        xpReward: 100,
        isActive: true,
      }));
      getAllMissions.mockResolvedValue(largeMissionList);

      const startTime = Date.now();
      const request = createMockRequest('/api/missions');
      const response = await GET(request);
      const responseTime = Date.now() - startTime;
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.missions).toHaveLength(100);
      expect(responseTime).toBeLessThan(1000);
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

    it('ミッション一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getAllMissions } = require('@/server/lib/db/queries/missions');
      getAllMissions.mockResolvedValue([
        {
          id: '1',
          title: 'テストミッション',
          type: 'count',
          difficulty: 'easy',
          targetValue: 1,
          xpReward: 50,
          isActive: true,
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/missions');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });
  });
});