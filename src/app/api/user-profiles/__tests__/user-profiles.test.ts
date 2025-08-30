/**
 * TASK-106: ゲーミフィケーションAPI実装 - User Profiles API テスト (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '../route';

// Supabase モックセットアップ
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
}));

// テストユーティリティ関数
function createMockRequest(searchParams: Record<string, string> = {}): NextRequest {
  const url = new URL('http://localhost:3000/api/user-profiles');
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  
  return new NextRequest(url, {
    method: 'GET',
    headers: {
      'Cookie': 'sb-access-token=mock-access-token',
    },
  });
}

describe('GET /api/user-profiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('TC-001: 認証ユーザーの基本情報取得', () => {
    it('認証されたユーザーが基本プロフィール情報を取得できる', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'profile-123',
          user_id: 'user-123',
          level: 5,
          total_xp: 2500,
          current_streak_days: 7,
          longest_streak_days: 14,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          userProfile: {
            id: 'profile-123',
            userId: 'user-123',
            level: 5,
            totalXP: 2500,
            currentXP: 2500,
            nextLevelXP: 3750, // レベル計算式: level^2 * 250 + level * 250
            streakDays: 7,
            longestStreak: 14,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        },
      });
    });
  });

  describe('TC-002: includeDetails=true で詳細情報取得', () => {
    it('詳細情報フラグでバッジと最近のXP履歴を含む情報を取得できる', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      // 基本プロフィール情報のモック
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'profile-123',
          user_id: 'user-123',
          level: 5,
          total_xp: 2500,
          current_streak_days: 7,
          longest_streak_days: 14,
        },
        error: null,
      });

      // バッジ情報のモック
      mockSupabase.select.mockReturnValueOnce({
        data: [
          {
            id: 'badge-1',
            name: '初回達成',
            description: '最初のルーチンを完了しました',
            rarity: 'common',
            earned_at: '2024-01-01T00:00:00Z',
          },
        ],
        error: null,
      });

      // XP履歴のモック
      mockSupabase.select.mockReturnValueOnce({
        data: [
          {
            id: 'xp-1',
            amount: 50,
            source: 'routine_completion',
            description: 'Morning Exercise',
            created_at: '2024-01-01T08:00:00Z',
          },
        ],
        error: null,
      });

      const request = createMockRequest({ includeDetails: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userProfile).toBeDefined();
      expect(data.data.badges).toHaveLength(1);
      expect(data.data.recentXPHistory).toHaveLength(1);
      expect(data.data.badges[0]).toEqual({
        id: 'badge-1',
        name: '初回達成',
        description: '最初のルーチンを完了しました',
        rarity: 'common',
        earnedAt: '2024-01-01T00:00:00Z',
      });
    });
  });

  describe('TC-003: 他ユーザーのプロフィール取得試行', () => {
    it('他のユーザーIDを指定した場合に権限エラーが返される', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      });

      const request = createMockRequest({ userId: 'other-user-id' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data).toEqual({
        success: false,
        error: '他のユーザーの情報にはアクセスできません',
        code: 'FORBIDDEN',
      });
    });
  });

  describe('TC-004: 無効なuserIdフォーマット', () => {
    it('無効なUUID形式のuserIdでバリデーションエラーが返される', async () => {
      const request = createMockRequest({ userId: 'invalid-uuid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: '無効なUUID形式です',
        code: 'VALIDATION_ERROR',
      });
    });
  });

  describe('TC-005: レベル計算の正確性検証', () => {
    it('totalXP = 1750 のユーザーで正確なレベル計算が行われる', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'profile-123',
          user_id: 'user-123',
          level: 2,
          total_xp: 1750,
        },
        error: null,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userProfile.level).toBe(2);
      expect(data.data.userProfile.currentXP).toBe(1750);
      expect(data.data.userProfile.nextLevelXP).toBe(2250); // レベル3への必要XP
    });
  });

  describe('TC-006: ストリーク計算の正確性検証', () => {
    it('7日間連続実行のユーザーで正確なストリーク日数が返される', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'profile-123',
          user_id: 'user-123',
          current_streak_days: 7,
        },
        error: null,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userProfile.streakDays).toBe(7);
    });
  });

  describe('TC-007: 未認証ユーザーのアクセス拒否', () => {
    it('認証情報なしでアクセスした場合に認証エラーが返される', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'No user found' },
      });

      const request = new NextRequest('http://localhost:3000/api/user-profiles', {
        method: 'GET',
        // Cookieヘッダーなし
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: '認証が必要です',
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('TC-008: 無効なトークンでのアクセス拒否', () => {
    it('無効なJWTトークンでアクセスした場合に認証エラーが返される', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid JWT' },
      });

      const request = new NextRequest('http://localhost:3000/api/user-profiles', {
        method: 'GET',
        headers: {
          'Cookie': 'sb-access-token=invalid-token',
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: '認証が必要です',
        code: 'UNAUTHORIZED',
      });
    });
  });

  describe('TC-009: レスポンス時間検証（基本情報）', () => {
    it('基本プロフィール取得が200ms以内に完了する', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: {
          id: 'profile-123',
          user_id: 'user-123',
          level: 1,
          total_xp: 100,
        },
        error: null,
      });

      const startTime = Date.now();
      const request = createMockRequest();
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(200);
    });
  });

  describe('TC-010: レスポンス時間検証（詳細情報）', () => {
    it('詳細情報取得が300ms以内に完了する', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // 複数のクエリを模擬
      mockSupabase.single.mockResolvedValue({
        data: { id: 'profile-123', user_id: 'user-123' },
        error: null,
      });
      
      mockSupabase.select.mockResolvedValue({
        data: Array(50).fill({ id: 'badge-1', name: 'test' }),
        error: null,
      });

      const startTime = Date.now();
      const request = createMockRequest({ includeDetails: 'true' });
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });
  });

  describe('データベースエラーハンドリング', () => {
    it('プロフィール取得時のデータベースエラーを適切に処理する', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'プロフィール情報の取得に失敗しました',
        code: 'DATABASE_ERROR',
      });
    });

    it('プロフィールが存在しない場合に404エラーが返される', async () => {
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: null,
        error: null,
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        success: false,
        error: 'ユーザープロフィールが見つかりません',
        code: 'PROFILE_NOT_FOUND',
      });
    });
  });

  describe('セキュリティテスト', () => {
    it('XSSペイロードがサニタイズされる', async () => {
      const request = createMockRequest({ 
        userId: '<script>alert("xss")</script>' 
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(JSON.stringify(data)).not.toContain('<script>');
    });

    it('SQLインジェクション攻撃が防がれる', async () => {
      const request = createMockRequest({ 
        userId: "'; DROP TABLE user_profiles; --" 
      });
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.code).toBe('VALIDATION_ERROR');
    });
  });
});