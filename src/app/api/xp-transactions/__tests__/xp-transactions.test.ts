/**
 * TASK-106: ゲーミフィケーションAPI実装 - XP Transactions API テストファイル (TDD Red Phase)
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
jest.mock('@/server/lib/db/queries/xp-transactions', () => ({
  getXPTransactions: jest.fn(),
  getXPTransactionsBySource: jest.fn(),
  getXPTransactionsByDateRange: jest.fn(),
  getXPSummaryByPeriod: jest.fn(),
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

describe('GET /api/xp-transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーで自分のXPトランザクション一覧を取得できる', async () => {
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

      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: '朝の運動完了',
          sourceType: 'routine_completion',
          sourceId: 'routine-1',
          createdAt: new Date(),
        },
        {
          id: 'xp-2',
          userId: 'user-123',
          amount: 100,
          reason: '7日ストリーク達成',
          sourceType: 'streak_bonus',
          sourceId: 'streak-7',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.xpTransactions).toBeDefined();
      expect(Array.isArray(data.data.xpTransactions)).toBe(true);
      expect(data.data.xpTransactions).toHaveLength(2);
      expect(data.data.xpTransactions[0].userId).toBe('user-123');
      expect(data.data.xpTransactions[0].amount).toBe(50);
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

      const request = createMockRequest('/api/xp-transactions');
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

    it('他のユーザーのXPトランザクションを取得しようとすると403エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { userId: 'other-user' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('他のユーザーの情報にはアクセスできません');
    });

    it('userIdパラメータなしで自分のXPトランザクションを取得できる', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 25,
          reason: 'ルーティン実行',
          sourceType: 'routine_completion',
          sourceId: 'routine-1',
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.xpTransactions[0].userId).toBe('user-123');
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

    it('sourceTypeフィルターが正常に動作する', async () => {
      const { getXPTransactionsBySource } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactionsBySource.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: '朝の運動完了',
          sourceType: 'routine_completion',
          sourceId: 'routine-1',
          createdAt: new Date(),
        },
        {
          id: 'xp-2',
          userId: 'user-123',
          amount: 30,
          reason: '夜の読書完了',
          sourceType: 'routine_completion',
          sourceId: 'routine-2',
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions', { sourceType: 'routine_completion' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(2);
      expect(data.data.xpTransactions.every((tx: any) => tx.sourceType === 'routine_completion')).toBe(true);
      expect(getXPTransactionsBySource).toHaveBeenCalledWith('user-123', 'routine_completion');
    });

    it('特定のsourceIdでフィルターできる', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockImplementation((userId, filters) => {
        if (filters && filters.sourceId === 'routine-123') {
          return Promise.resolve([
            {
              id: 'xp-1',
              userId: 'user-123',
              amount: 75,
              reason: '特定ルーティン完了',
              sourceType: 'routine_completion',
              sourceId: 'routine-123',
              createdAt: new Date(),
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/xp-transactions', { sourceId: 'routine-123' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(1);
      expect(data.data.xpTransactions[0].sourceId).toBe('routine-123');
    });

    it('日付範囲フィルターが正常に動作する', async () => {
      const { getXPTransactionsByDateRange } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactionsByDateRange.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: '期間内のXP',
          sourceType: 'routine_completion',
          sourceId: 'routine-1',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]);

      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const request = createMockRequest('/api/xp-transactions', { 
        startDate, 
        endDate 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(1);
      expect(getXPTransactionsByDateRange).toHaveBeenCalledWith('user-123', startDate, endDate);
    });

    it('XP量の範囲フィルターが正常に動作する', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockImplementation((userId, filters) => {
        if (filters && filters.minAmount === 50 && filters.maxAmount === 100) {
          return Promise.resolve([
            {
              id: 'xp-1',
              userId: 'user-123',
              amount: 75,
              reason: '範囲内のXP',
              sourceType: 'routine_completion',
              createdAt: new Date(),
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/xp-transactions', { 
        minAmount: '50',
        maxAmount: '100'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(1);
      expect(data.data.xpTransactions[0].amount).toBe(75);
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

    it('作成日順でソートできる（デフォルト：降順）', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: '最新のXP',
          sourceType: 'routine_completion',
          createdAt: new Date(),
        },
        {
          id: 'xp-2',
          userId: 'user-123',
          amount: 30,
          reason: '古いXP',
          sourceType: 'routine_completion',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions', { sortBy: 'createdAt' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(2);
    });

    it('XP量順でソートできる', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 100,
          reason: '高XP',
          sourceType: 'mission_completion',
          createdAt: new Date(),
        },
        {
          id: 'xp-2',
          userId: 'user-123',
          amount: 25,
          reason: '低XP',
          sourceType: 'routine_completion',
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions', { 
        sortBy: 'amount',
        sortOrder: 'desc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(2);
    });
  });

  describe('集計データテスト', () => {
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

    it('includeSummary=trueで集計データを含む', async () => {
      const { getXPTransactions, getXPSummaryByPeriod } = require('@/server/lib/db/queries/xp-transactions');
      
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: 'ルーティン完了',
          sourceType: 'routine_completion',
          createdAt: new Date(),
        },
      ]);

      getXPSummaryByPeriod.mockResolvedValue({
        totalXP: 350,
        transactionCount: 7,
        averageXP: 50,
        maxXP: 100,
        minXP: 25,
        dailySummary: [
          { date: '2025-01-01', totalXP: 100, transactionCount: 2 },
          { date: '2025-01-02', totalXP: 150, transactionCount: 3 },
          { date: '2025-01-03', totalXP: 100, transactionCount: 2 },
        ],
      });

      const request = createMockRequest('/api/xp-transactions', { includeSummary: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.xpTransactions).toBeDefined();
      expect(data.data.summary).toBeDefined();
      expect(data.data.summary.totalXP).toBe(350);
      expect(data.data.summary.transactionCount).toBe(7);
      expect(data.data.summary.dailySummary).toBeDefined();
      expect(Array.isArray(data.data.summary.dailySummary)).toBe(true);
    });

    it('includeSummary=falseで基本データのみ取得', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: 'ルーティン完了',
          sourceType: 'routine_completion',
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions', { includeSummary: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.xpTransactions).toBeDefined();
      expect(data.data.summary).toBeUndefined();
    });

    it('期間指定での集計データを取得できる', async () => {
      const { getXPSummaryByPeriod } = require('@/server/lib/db/queries/xp-transactions');
      getXPSummaryByPeriod.mockResolvedValue({
        totalXP: 200,
        transactionCount: 4,
        averageXP: 50,
        period: 'weekly',
      });

      const request = createMockRequest('/api/xp-transactions', { 
        includeSummary: 'true',
        summaryPeriod: 'weekly'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.summary.period).toBe('weekly');
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
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(20);
        return Promise.resolve([
          {
            id: 'xp-21',
            userId: 'user-123',
            amount: 30,
            reason: 'ページ2のXP',
            sourceType: 'routine_completion',
            createdAt: new Date(),
          },
        ]);
      });

      const request = createMockRequest('/api/xp-transactions', { page: '2', limit: '20' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(20);
    });

    it('デフォルトページング値が適用される', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(50);
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/xp-transactions');
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

    it('無効なsourceTypeで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { sourceType: 'invalid_source' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sourceType');
    });

    it('無効なsourceId UUIDで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { sourceId: 'invalid-uuid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sourceId');
    });

    it('無効なstartDateで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { startDate: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('startDate');
    });

    it('無効なendDateで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { endDate: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('endDate');
    });

    it('startDateがendDateより後の場合400エラーになる', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const request = createMockRequest('/api/xp-transactions', { startDate, endDate });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('startDate');
    });

    it('無効なminAmountで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { minAmount: '-10' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('minAmount');
    });

    it('無効なmaxAmountで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { maxAmount: '-5' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('maxAmount');
    });

    it('minAmountがmaxAmountより大きい場合400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { 
        minAmount: '100',
        maxAmount: '50'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('minAmount');
    });

    it('無効なsortByで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { sortBy: 'invalid_field' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortBy');
    });

    it('無効なincludeSummaryで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { includeSummary: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('includeSummary');
    });

    it('無効なsummaryPeriodで400エラーになる', async () => {
      const request = createMockRequest('/api/xp-transactions', { 
        includeSummary: 'true',
        summaryPeriod: 'invalid_period'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('summaryPeriod');
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
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/xp-transactions');
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

    it('XPトランザクションが存在しない場合は空配列を返す', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([]);

      const request = createMockRequest('/api/xp-transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.xpTransactions).toEqual([]);
    });

    it('フィルター結果が0件の場合は空配列を返す', async () => {
      const { getXPTransactionsBySource } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactionsBySource.mockResolvedValue([]);

      const request = createMockRequest('/api/xp-transactions', { sourceType: 'mission_completion' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.xpTransactions).toEqual([]);
    });

    it('0XPのトランザクションも正常に取得できる', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 0,
          reason: 'テスト実行（0XP）',
          sourceType: 'routine_completion',
          sourceId: 'routine-test',
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(1);
      expect(data.data.xpTransactions[0].amount).toBe(0);
    });

    it('大きなXP量のトランザクションも正常に取得できる', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 10000,
          reason: '大型チャレンジ完了',
          sourceType: 'challenge_completion',
          sourceId: 'challenge-mega',
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(1);
      expect(data.data.xpTransactions[0].amount).toBe(10000);
    });

    it('sourceIdがnullのトランザクションも正常に取得できる', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 25,
          reason: 'デイリーボーナス',
          sourceType: 'daily_bonus',
          sourceId: null, // sourceIdなし
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(1);
      expect(data.data.xpTransactions[0].sourceId).toBeNull();
    });

    it('長い理由文を持つトランザクションも正常に取得できる', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      const longReason = 'とても長い理由文'.repeat(20);
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: longReason,
          sourceType: 'routine_completion',
          sourceId: 'routine-1',
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/xp-transactions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.xpTransactions).toHaveLength(1);
      expect(data.data.xpTransactions[0].reason).toBe(longReason);
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

    it('XPトランザクション一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getXPTransactions } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([
        {
          id: 'xp-1',
          userId: 'user-123',
          amount: 50,
          reason: 'パフォーマンステスト',
          sourceType: 'routine_completion',
          createdAt: new Date(),
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/xp-transactions');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });

    it('集計データ付きXPトランザクション取得のレスポンス時間が500ms以下である', async () => {
      const { getXPTransactions, getXPSummaryByPeriod } = require('@/server/lib/db/queries/xp-transactions');
      getXPTransactions.mockResolvedValue([]);
      getXPSummaryByPeriod.mockResolvedValue({
        totalXP: 1000,
        transactionCount: 20,
        averageXP: 50,
      });

      const startTime = Date.now();
      const request = createMockRequest('/api/xp-transactions', { includeSummary: 'true' });
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(500);
    });
  });
});