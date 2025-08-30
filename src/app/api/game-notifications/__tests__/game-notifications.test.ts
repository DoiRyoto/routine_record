/**
 * TASK-106: ゲーミフィケーションAPI実装 - Game Notifications API テストファイル (TDD Red Phase)
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
jest.mock('@/lib/db/queries/game-notifications', () => ({
  getGameNotifications: jest.fn(),
  getUnreadNotifications: jest.fn(),
  getNotificationsByType: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
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

describe('GET /api/game-notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーで自分のゲーム通知一覧を取得できる', async () => {
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

      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: 'レベルアップ！',
          message: 'レベル12に到達しました！継続の力を感じますね。',
          data: JSON.stringify({ level: 12, xpGained: 100 }),
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'badge_unlocked',
          title: '新しいバッジを獲得！',
          message: '「習慣マスター」バッジを獲得しました！',
          data: JSON.stringify({ badgeId: 'badge1', badgeName: '習慣マスター' }),
          isRead: false,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.notifications).toBeDefined();
      expect(Array.isArray(data.data.notifications)).toBe(true);
      expect(data.data.notifications).toHaveLength(2);
      expect(data.data.notifications[0].userId).toBe('user-123');
      expect(data.data.notifications[0].type).toBe('level_up');
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

      const request = createMockRequest('/api/game-notifications');
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

    it('他のユーザーの通知を取得しようとすると403エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { userId: 'other-user' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('他のユーザーの情報にはアクセスできません');
    });

    it('userIdパラメータなしで自分の通知を取得できる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'streak_milestone',
          title: 'ストリーク記録更新！',
          message: '10日連続でルーティンを実行中！',
          data: JSON.stringify({ streak: 10 }),
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.notifications[0].userId).toBe('user-123');
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

    it('通知タイプフィルターが正常に動作する', async () => {
      const { getNotificationsByType } = require('@/lib/db/queries/game-notifications');
      getNotificationsByType.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: 'レベルアップ！',
          message: 'レベル5に到達しました！',
          data: JSON.stringify({ level: 5, xpGained: 80 }),
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'level_up',
          title: 'レベルアップ！',
          message: 'レベル6に到達しました！',
          data: JSON.stringify({ level: 6, xpGained: 90 }),
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/game-notifications', { type: 'level_up' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(2);
      expect(data.data.notifications.every((n: any) => n.type === 'level_up')).toBe(true);
      expect(getNotificationsByType).toHaveBeenCalledWith('user-123', 'level_up');
    });

    it('未読フィルターが正常に動作する', async () => {
      const { getUnreadNotifications } = require('@/lib/db/queries/game-notifications');
      getUnreadNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'badge_unlocked',
          title: '新しいバッジを獲得！',
          message: '「週間ウォリアー」バッジを獲得しました！',
          data: JSON.stringify({ badgeId: 'weekly-warrior', badgeName: '週間ウォリアー' }),
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications', { isRead: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(1);
      expect(data.data.notifications[0].isRead).toBe(false);
      expect(getUnreadNotifications).toHaveBeenCalledWith('user-123');
    });

    it('既読フィルターが正常に動作する', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockImplementation((userId, filters) => {
        if (filters && filters.isRead === true) {
          return Promise.resolve([
            {
              id: '1',
              userId: 'user-123',
              type: 'mission_completed',
              title: 'ミッション完了！',
              message: '「習慣の第一歩」ミッションを完了しました！',
              data: JSON.stringify({ missionId: '1', missionName: '習慣の第一歩' }),
              isRead: true,
              createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/game-notifications', { isRead: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(1);
      expect(data.data.notifications[0].isRead).toBe(true);
    });

    it('日付範囲フィルターが正常に動作する', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'challenge_completed',
          title: 'チャレンジ完了！',
          message: '「ウィークリー完璧主義者」チャレンジを完了しました！',
          data: JSON.stringify({ challengeId: '2', challengeName: 'ウィークリー完璧主義者' }),
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ]);

      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const request = createMockRequest('/api/game-notifications', { 
        startDate, 
        endDate 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(1);
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
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'xp_milestone',
          title: 'XP記録達成！',
          message: '総XP 1000を達成しました！',
          data: JSON.stringify({ totalXP: 1000, milestone: 1000 }),
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'streak_milestone',
          title: 'ストリーク記録更新！',
          message: '30日連続でルーティンを実行中！',
          data: JSON.stringify({ streak: 30, milestone: 30 }),
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/game-notifications', { sortBy: 'createdAt' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(2);
    });

    it('通知タイプ順でソートできる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'badge_unlocked',
          title: 'バッジ獲得',
          message: 'バッジを獲得しました',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'level_up',
          title: 'レベルアップ',
          message: 'レベルが上がりました',
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications', { sortBy: 'type' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(2);
    });

    it('既読状態順でソートできる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: '未読通知',
          message: '未読メッセージ',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'badge_unlocked',
          title: '既読通知',
          message: '既読メッセージ',
          isRead: true,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications', { 
        sortBy: 'isRead',
        sortOrder: 'asc'
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(2);
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
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(10);
        return Promise.resolve([
          {
            id: '11',
            userId: 'user-123',
            type: 'level_up',
            title: 'ページ2の通知',
            message: 'ページ2のメッセージ',
            isRead: false,
            createdAt: new Date(),
          },
        ]);
      });

      const request = createMockRequest('/api/game-notifications', { page: '2', limit: '10' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(10);
    });

    it('デフォルトページング値が適用される', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(50);
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('統計データテスト', () => {
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

    it('includeStats=trueで統計データを含む', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: 'レベルアップ！',
          message: 'レベル5に到達しました！',
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications', { includeStats: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.notifications).toBeDefined();
      expect(data.data.stats).toBeDefined();
      expect(data.data.stats.totalCount).toBeDefined();
      expect(data.data.stats.unreadCount).toBeDefined();
      expect(data.data.stats.byType).toBeDefined();
    });

    it('includeStats=falseで基本データのみ取得', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: 'レベルアップ！',
          message: 'レベル5に到達しました！',
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications', { includeStats: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.notifications).toBeDefined();
      expect(data.data.stats).toBeUndefined();
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
      const request = createMockRequest('/api/game-notifications', { type: 'invalid_type' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('type');
    });

    it('無効なisReadで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { isRead: 'invalid_boolean' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('isRead');
    });

    it('無効なstartDateで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { startDate: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('startDate');
    });

    it('無効なendDateで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { endDate: 'invalid_date' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('endDate');
    });

    it('startDateがendDateより後の場合400エラーになる', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const request = createMockRequest('/api/game-notifications', { startDate, endDate });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('startDate');
    });

    it('無効なsortByで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { sortBy: 'invalid_field' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortBy');
    });

    it('無効なsortOrderで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { 
        sortBy: 'createdAt',
        sortOrder: 'invalid' 
      });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('sortOrder');
    });

    it('無効なincludeStatsで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { includeStats: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('includeStats');
    });

    it('無効なpageで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { page: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('page');
    });

    it('無効なlimitで400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { limit: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('limit');
    });

    it('limitが100を超えると400エラーになる', async () => {
      const request = createMockRequest('/api/game-notifications', { limit: '101' });
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
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/game-notifications');
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

    it('ゲーム通知が存在しない場合は空配列を返す', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.notifications).toEqual([]);
    });

    it('フィルター結果が0件の場合は空配列を返す', async () => {
      const { getNotificationsByType } = require('@/lib/db/queries/game-notifications');
      getNotificationsByType.mockResolvedValue([]);

      const request = createMockRequest('/api/game-notifications', { type: 'challenge_completed' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.notifications).toEqual([]);
    });

    it('全て未読の通知も正常に取得できる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: '未読通知1',
          message: 'メッセージ1',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'badge_unlocked',
          title: '未読通知2',
          message: 'メッセージ2',
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(2);
      expect(data.data.notifications.every((n: any) => !n.isRead)).toBe(true);
    });

    it('全て既読の通知も正常に取得できる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'mission_completed',
          title: '既読通知1',
          message: 'メッセージ1',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(1);
      expect(data.data.notifications[0].isRead).toBe(true);
    });

    it('dataフィールドがnullの通知も正常に取得できる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'daily_bonus',
          title: 'データなし通知',
          message: 'デイリーボーナスを受け取りました',
          data: null, // dataなし
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(1);
      expect(data.data.notifications[0].data).toBeNull();
    });

    it('長いタイトルとメッセージを持つ通知も正常に取得できる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      const longTitle = 'とても長いタイトル'.repeat(10);
      const longMessage = 'とても長いメッセージ'.repeat(20);
      
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'achievement_unlock',
          title: longTitle,
          message: longMessage,
          data: JSON.stringify({ achievementId: 'long-text-achievement' }),
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(1);
      expect(data.data.notifications[0].title).toBe(longTitle);
      expect(data.data.notifications[0].message).toBe(longMessage);
    });

    it('古い通知と新しい通知の混在も正常に取得できる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: '新しい通知',
          message: '最近のレベルアップ',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'badge_unlocked',
          title: '古い通知',
          message: '1年前のバッジ獲得',
          isRead: true,
          createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(2);
      
      const creationDates = data.data.notifications.map((n: any) => new Date(n.createdAt));
      expect(creationDates.some(date => date.getTime() > Date.now() - 24 * 60 * 60 * 1000)).toBe(true); // 最近の通知
      expect(creationDates.some(date => date.getTime() < Date.now() - 300 * 24 * 60 * 60 * 1000)).toBe(true); // 古い通知
    });
  });

  describe('通知タイプ別テスト', () => {
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

    it('全通知タイプを正常に取得できる', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: 'レベルアップ',
          message: 'レベルが上がりました',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'badge_unlocked',
          title: 'バッジ獲得',
          message: 'バッジを獲得しました',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '3',
          userId: 'user-123',
          type: 'mission_completed',
          title: 'ミッション完了',
          message: 'ミッションを完了しました',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '4',
          userId: 'user-123',
          type: 'challenge_completed',
          title: 'チャレンジ完了',
          message: 'チャレンジを完了しました',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '5',
          userId: 'user-123',
          type: 'streak_milestone',
          title: 'ストリーク記録',
          message: 'ストリーク記録を更新しました',
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: '6',
          userId: 'user-123',
          type: 'xp_milestone',
          title: 'XP記録',
          message: 'XP記録を達成しました',
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/game-notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.notifications).toHaveLength(6);
      
      const types = data.data.notifications.map((n: any) => n.type);
      expect(types).toContain('level_up');
      expect(types).toContain('badge_unlocked');
      expect(types).toContain('mission_completed');
      expect(types).toContain('challenge_completed');
      expect(types).toContain('streak_milestone');
      expect(types).toContain('xp_milestone');
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

    it('ゲーム通知一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          type: 'level_up',
          title: 'パフォーマンステスト',
          message: 'テスト用通知',
          isRead: false,
          createdAt: new Date(),
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/game-notifications');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });

    it('統計データ付きゲーム通知取得のレスポンス時間が500ms以下である', async () => {
      const { getGameNotifications } = require('@/lib/db/queries/game-notifications');
      getGameNotifications.mockResolvedValue([]);

      const startTime = Date.now();
      const request = createMockRequest('/api/game-notifications', { includeStats: 'true' });
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(500);
    });
  });
});