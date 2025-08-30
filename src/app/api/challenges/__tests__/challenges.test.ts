/**
 * TASK-106: ゲーミフィケーションAPI実装 - Challenges API テストファイル (TDD Red Phase)
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
jest.mock('@/lib/db/queries/challenges', () => ({
  getAllChallenges: jest.fn(),
  getActiveChallenges: jest.fn(),
  getChallengesByType: jest.fn(),
  getChallengesWithDetails: jest.fn(),
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

describe('GET /api/challenges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーでチャレンジ一覧を取得できる', async () => {
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

      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: '新年スタートダッシュ',
          description: '1月中に100回のルーティンを実行して2025年を最高のスタートにしよう！',
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          type: 'monthly',
          participants: 1247,
          maxParticipants: 2000,
          isActive: true,
        },
        {
          id: '2',
          title: 'ウィークリー完璧主義者',
          description: 'この週に毎日少なくとも3つのルーティンを実行しよう',
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          type: 'weekly',
          participants: 456,
          maxParticipants: null,
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.challenges).toBeDefined();
      expect(Array.isArray(data.data.challenges)).toBe(true);
      expect(data.data.challenges).toHaveLength(2);
      expect(data.data.challenges[0].title).toBe('新年スタートダッシュ');
    });

    it('未認証ユーザーでもチャレンジ一覧を取得できる（公開情報）', async () => {
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

      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: 'オープンチャレンジ',
          description: '誰でも参加できるチャレンジ',
          type: 'weekly',
          participants: 100,
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.challenges).toBeDefined();
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

    it('アクティブフィルターが正常に動作する', async () => {
      const { getActiveChallenges } = require('@/lib/db/queries/challenges');
      getActiveChallenges.mockResolvedValue([
        {
          id: '1',
          title: 'アクティブチャレンジ',
          type: 'weekly',
          isActive: true,
          startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/challenges', { isActive: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toHaveLength(1);
      expect(data.data.challenges[0].isActive).toBe(true);
      expect(getActiveChallenges).toHaveBeenCalled();
    });

    it('タイプフィルターが正常に動作する', async () => {
      const { getChallengesByType } = require('@/lib/db/queries/challenges');
      getChallengesByType.mockResolvedValue([
        {
          id: '1',
          title: 'ウィークリーチャレンジ',
          type: 'weekly',
          participants: 250,
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/challenges', { type: 'weekly' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toHaveLength(1);
      expect(data.data.challenges[0].type).toBe('weekly');
      expect(getChallengesByType).toHaveBeenCalledWith('weekly');
    });

    it('参加可能フィルターが正常に動作する', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: '参加可能チャレンジ',
          participants: 50,
          maxParticipants: 100,
          isActive: true,
          startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/challenges', { joinable: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toHaveLength(1);
      expect(data.data.challenges[0].participants).toBeLessThan(data.data.challenges[0].maxParticipants);
    });

    it('期間フィルターが正常に動作する', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockImplementation(() => {
        const now = new Date();
        return Promise.resolve([
          {
            id: '1',
            title: '今週のチャレンジ',
            startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
            isActive: true,
          },
        ]);
      });

      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const request = createMockRequest('/api/challenges', { 
        startDate, 
        endDate 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toHaveLength(1);
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

    it('includeDetails=trueで要件と報酬を含む', async () => {
      const { getChallengesWithDetails } = require('@/lib/db/queries/challenges');
      getChallengesWithDetails.mockResolvedValue([
        {
          id: '1',
          title: '詳細チャレンジ',
          description: 'テスト用チャレンジ',
          type: 'weekly',
          participants: 100,
          isActive: true,
          requirements: [
            {
              id: '1',
              challengeId: '1',
              type: 'routine_count',
              value: 21,
              description: '週間で21回のルーティンを実行',
            },
          ],
          rewards: [
            {
              id: '1',
              challengeId: '1',
              name: 'XPブースト',
              description: '週間完了報酬',
              xpAmount: 200,
              requirement: 'completion',
            },
          ],
        },
      ]);

      const request = createMockRequest('/api/challenges', { includeDetails: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.challenges[0].requirements).toBeDefined();
      expect(data.data.challenges[0].rewards).toBeDefined();
      expect(Array.isArray(data.data.challenges[0].requirements)).toBe(true);
      expect(Array.isArray(data.data.challenges[0].rewards)).toBe(true);
    });

    it('includeDetails=falseで基本データのみ取得', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: '基本チャレンジ',
          type: 'weekly',
          participants: 50,
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/challenges', { includeDetails: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.challenges[0].requirements).toBeUndefined();
      expect(data.data.challenges[0].rewards).toBeUndefined();
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

    it('参加者数順でソートできる', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: '人気チャレンジ',
          participants: 1000,
          isActive: true,
        },
        {
          id: '2',
          title: '新しいチャレンジ',
          participants: 50,
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/challenges', { 
        sortBy: 'participants',
        sortOrder: 'desc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toHaveLength(2);
    });

    it('開始日順でソートできる', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: '最新チャレンジ',
          startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
        {
          id: '2',
          title: '古いチャレンジ',
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/challenges', { sortBy: 'startDate' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toHaveLength(2);
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
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockImplementation((filters, pagination) => {
        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(10);
        return Promise.resolve([
          {
            id: '11',
            title: 'ページ2のチャレンジ',
            type: 'weekly',
            isActive: true,
          },
        ]);
      });

      const request = createMockRequest('/api/challenges', { page: '2', limit: '10' });
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

    it('無効なtypeで400エラーになる', async () => {
      const request = createMockRequest('/api/challenges', { type: 'invalid_type' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('type');
    });

    it('無効なisActiveで400エラーになる', async () => {
      const request = createMockRequest('/api/challenges', { isActive: 'invalid_boolean' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('isActive');
    });

    it('無効なjoinableで400エラーになる', async () => {
      const request = createMockRequest('/api/challenges', { joinable: 'invalid_boolean' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('joinable');
    });

    it('無効なstartDateで400エラーになる', async () => {
      const request = createMockRequest('/api/challenges', { startDate: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('startDate');
    });

    it('無効なendDateで400エラーになる', async () => {
      const request = createMockRequest('/api/challenges', { endDate: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('endDate');
    });

    it('startDateがendDateより後の場合400エラーになる', async () => {
      const startDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date(Date.now()).toISOString();
      
      const request = createMockRequest('/api/challenges', { startDate, endDate });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('startDate');
    });

    it('無効なsortByで400エラーになる', async () => {
      const request = createMockRequest('/api/challenges', { sortBy: 'invalid_field' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortBy');
    });

    it('無効なincludeDetailsで400エラーになる', async () => {
      const request = createMockRequest('/api/challenges', { includeDetails: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('includeDetails');
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
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/challenges');
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

    it('チャレンジが存在しない場合は空配列を返す', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([]);

      const request = createMockRequest('/api/challenges');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.challenges).toEqual([]);
    });

    it('満員のチャレンジは参加不可として扱われる', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: '満員チャレンジ',
          participants: 100,
          maxParticipants: 100,
          isActive: true,
        },
      ]);

      const request = createMockRequest('/api/challenges', { joinable: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // 満員のチャレンジは参加不可なのでフィルタリングされる
      expect(data.data.challenges).toEqual([]);
    });

    it('期限切れのチャレンジは非アクティブとして扱われる', async () => {
      const { getActiveChallenges } = require('@/lib/db/queries/challenges');
      getActiveChallenges.mockResolvedValue([]); // 期限切れのため空

      const request = createMockRequest('/api/challenges', { isActive: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.challenges).toEqual([]);
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

    it('チャレンジ一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: '1',
          title: 'パフォーマンステスト',
          type: 'weekly',
          participants: 100,
          isActive: true,
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/challenges');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });

    it('詳細データ付きチャレンジ一覧取得のレスポンス時間が500ms以下である', async () => {
      const { getChallengesWithDetails } = require('@/lib/db/queries/challenges');
      getChallengesWithDetails.mockResolvedValue([
        {
          id: '1',
          title: '詳細パフォーマンステスト',
          type: 'weekly',
          participants: 100,
          isActive: true,
          requirements: [],
          rewards: [],
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/challenges', { includeDetails: 'true' });
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(500);
    });
  });
});