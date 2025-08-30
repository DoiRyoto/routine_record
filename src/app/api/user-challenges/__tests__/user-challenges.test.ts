/**
 * TASK-106: ゲーミフィケーションAPI実装 - User Challenges API テストファイル (TDD Red Phase)
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
jest.mock('@/lib/db/queries/user-challenges', () => ({
  getUserChallenges: jest.fn(),
  getUserChallengesByStatus: jest.fn(),
  getUserChallengesWithDetails: jest.fn(),
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

describe('GET /api/user-challenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーで自分のユーザーチャレンジ一覧を取得できる', async () => {
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

      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          progress: 65,
          isCompleted: false,
          completedAt: null,
          rank: 23,
        },
        {
          id: '2',
          userId: 'user-123',
          challengeId: '2',
          joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          progress: 100,
          isCompleted: true,
          completedAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000),
          rank: 1,
        },
      ]);

      const request = createMockRequest('/api/user-challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userChallenges).toBeDefined();
      expect(Array.isArray(data.data.userChallenges)).toBe(true);
      expect(data.data.userChallenges).toHaveLength(2);
      expect(data.data.userChallenges[0].userId).toBe('user-123');
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

      const request = createMockRequest('/api/user-challenges');
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

    it('他のユーザーのチャレンジを取得しようとすると403エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { userId: 'other-user' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('他のユーザーの情報にはアクセスできません');
    });

    it('userIdパラメータなしで自分のチャレンジを取得できる', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 50,
          isCompleted: false,
        },
      ]);

      const request = createMockRequest('/api/user-challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userChallenges[0].userId).toBe('user-123');
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

    it('完了状態フィルターが正常に動作する（完了済み）', async () => {
      const { getUserChallengesByStatus } = require('@/lib/db/queries/user-challenges');
      getUserChallengesByStatus.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 100,
          isCompleted: true,
          completedAt: new Date(),
          rank: 5,
        },
      ]);

      const request = createMockRequest('/api/user-challenges', { status: 'completed' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges).toHaveLength(1);
      expect(data.data.userChallenges[0].isCompleted).toBe(true);
      expect(getUserChallengesByStatus).toHaveBeenCalledWith('user-123', 'completed');
    });

    it('完了状態フィルターが正常に動作する（進行中）', async () => {
      const { getUserChallengesByStatus } = require('@/lib/db/queries/user-challenges');
      getUserChallengesByStatus.mockResolvedValue([
        {
          id: '2',
          userId: 'user-123',
          challengeId: '2',
          progress: 75,
          isCompleted: false,
          completedAt: null,
          rank: null,
        },
      ]);

      const request = createMockRequest('/api/user-challenges', { status: 'in_progress' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges).toHaveLength(1);
      expect(data.data.userChallenges[0].isCompleted).toBe(false);
      expect(getUserChallengesByStatus).toHaveBeenCalledWith('user-123', 'in_progress');
    });

    it('特定のチャレンジIDでフィルターできる', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockImplementation((userId, filters) => {
        if (filters && filters.challengeId === 'challenge-123') {
          return Promise.resolve([
            {
              id: '1',
              userId: 'user-123',
              challengeId: 'challenge-123',
              progress: 80,
              isCompleted: false,
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/user-challenges', { challengeId: 'challenge-123' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges).toHaveLength(1);
      expect(data.data.userChallenges[0].challengeId).toBe('challenge-123');
    });

    it('参加期間フィルターが正常に動作する', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          progress: 60,
          isCompleted: false,
        },
      ]);

      const joinedAfter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const joinedBefore = new Date().toISOString();
      
      const request = createMockRequest('/api/user-challenges', { 
        joinedAfter, 
        joinedBefore 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges).toHaveLength(1);
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

    it('includeChallengeDetails=trueでチャレンジ詳細を含む', async () => {
      const { getUserChallengesWithDetails } = require('@/lib/db/queries/user-challenges');
      getUserChallengesWithDetails.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 65,
          isCompleted: false,
          rank: 23,
          challenge: {
            id: '1',
            title: '新年スタートダッシュ',
            description: '1月中に100回のルーティンを実行',
            type: 'monthly',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            participants: 1247,
            maxParticipants: 2000,
            isActive: true,
          },
        },
      ]);

      const request = createMockRequest('/api/user-challenges', { includeChallengeDetails: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userChallenges[0].challenge).toBeDefined();
      expect(data.data.userChallenges[0].challenge.title).toBe('新年スタートダッシュ');
    });

    it('includeChallengeDetails=falseで基本データのみ取得', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 65,
          isCompleted: false,
        },
      ]);

      const request = createMockRequest('/api/user-challenges', { includeChallengeDetails: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userChallenges[0].challenge).toBeUndefined();
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

    it('進行度順でソートできる', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 90,
          isCompleted: false,
        },
        {
          id: '2',
          userId: 'user-123',
          challengeId: '2',
          progress: 45,
          isCompleted: false,
        },
      ]);

      const request = createMockRequest('/api/user-challenges', { 
        sortBy: 'progress',
        sortOrder: 'desc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges).toHaveLength(2);
    });

    it('参加日順でソートできる', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          progress: 30,
          isCompleted: false,
        },
        {
          id: '2',
          userId: 'user-123',
          challengeId: '2',
          joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          progress: 80,
          isCompleted: false,
        },
      ]);

      const request = createMockRequest('/api/user-challenges', { sortBy: 'joinedAt' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges).toHaveLength(2);
    });

    it('順位順でソートできる', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 100,
          isCompleted: true,
          rank: 1,
        },
        {
          id: '2',
          userId: 'user-123',
          challengeId: '2',
          progress: 100,
          isCompleted: true,
          rank: 10,
        },
      ]);

      const request = createMockRequest('/api/user-challenges', { 
        sortBy: 'rank',
        sortOrder: 'asc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges).toHaveLength(2);
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
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(10);
        return Promise.resolve([
          {
            id: '11',
            userId: 'user-123',
            challengeId: '11',
            progress: 25,
            isCompleted: false,
          },
        ]);
      });

      const request = createMockRequest('/api/user-challenges', { page: '2', limit: '10' });
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

    it('無効なstatusで400エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { status: 'invalid_status' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('status');
    });

    it('無効なchallengeId UUIDで400エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { challengeId: 'invalid-uuid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('challengeId');
    });

    it('無効なjoinedAfterで400エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { joinedAfter: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('joinedAfter');
    });

    it('無効なjoinedBeforeで400エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { joinedBefore: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('joinedBefore');
    });

    it('joinedAfterがjoinedBeforeより後の場合400エラーになる', async () => {
      const joinedAfter = new Date(Date.now()).toISOString();
      const joinedBefore = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const request = createMockRequest('/api/user-challenges', { joinedAfter, joinedBefore });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('joinedAfter');
    });

    it('無効なincludeChallengeDetailsで400エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { includeChallengeDetails: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('includeChallengeDetails');
    });

    it('無効なsortByで400エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { sortBy: 'invalid_field' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortBy');
    });

    it('無効なsortOrderで400エラーになる', async () => {
      const request = createMockRequest('/api/user-challenges', { 
        sortBy: 'progress',
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
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/user-challenges');
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

    it('ユーザーチャレンジが存在しない場合は空配列を返す', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([]);

      const request = createMockRequest('/api/user-challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userChallenges).toEqual([]);
    });

    it('進行度100%だが未完了のチャレンジも正常に取得できる', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 100, // 100%だが未完了
          isCompleted: false,
          completedAt: null,
          rank: null,
        },
      ]);

      const request = createMockRequest('/api/user-challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges[0].progress).toBe(100);
      expect(data.data.userChallenges[0].isCompleted).toBe(false);
    });

    it('完了済みで順位が未設定のチャレンジも正常に取得できる', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 100,
          isCompleted: true,
          completedAt: new Date(),
          rank: null, // 順位未設定
        },
      ]);

      const request = createMockRequest('/api/user-challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userChallenges[0].isCompleted).toBe(true);
      expect(data.data.userChallenges[0].rank).toBeNull();
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

    it('ユーザーチャレンジ一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getUserChallenges } = require('@/lib/db/queries/user-challenges');
      getUserChallenges.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          challengeId: '1',
          progress: 50,
          isCompleted: false,
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/user-challenges');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });
  });
});