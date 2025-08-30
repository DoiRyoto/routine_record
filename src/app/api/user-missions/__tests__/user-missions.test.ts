/**
 * TASK-106: ゲーミフィケーションAPI実装 - User Missions API テストファイル (TDD Red Phase)
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
jest.mock('@/lib/db/queries/user-missions', () => ({
  getUserMissions: jest.fn(),
  getUserMissionsByStatus: jest.fn(),
  getUserMissionsWithMissionDetails: jest.fn(),
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

describe('GET /api/user-missions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーで自分のユーザーミッション一覧を取得できる', async () => {
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

      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 5,
          isCompleted: false,
          startedAt: new Date(),
          completedAt: null,
          claimedAt: null,
        },
        {
          id: '2',
          userId: 'user-123',
          missionId: '2',
          progress: 7,
          isCompleted: true,
          startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          claimedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ]);

      const request = createMockRequest('/api/user-missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userMissions).toBeDefined();
      expect(Array.isArray(data.data.userMissions)).toBe(true);
      expect(data.data.userMissions).toHaveLength(2);
      expect(data.data.userMissions[0].userId).toBe('user-123');
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

      const request = createMockRequest('/api/user-missions');
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

    it('他のユーザーのミッションを取得しようとすると403エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { userId: 'other-user' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('他のユーザーの情報にはアクセスできません');
    });

    it('userIdパラメータなしで自分のミッションを取得できる', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 3,
          isCompleted: false,
        },
      ]);

      const request = createMockRequest('/api/user-missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userMissions[0].userId).toBe('user-123');
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
      const { getUserMissionsByStatus } = require('@/lib/db/queries/user-missions');
      getUserMissionsByStatus.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 10,
          isCompleted: true,
          completedAt: new Date(),
          claimedAt: new Date(),
        },
      ]);

      const request = createMockRequest('/api/user-missions', { status: 'completed' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userMissions).toHaveLength(1);
      expect(data.data.userMissions[0].isCompleted).toBe(true);
      expect(getUserMissionsByStatus).toHaveBeenCalledWith('user-123', 'completed');
    });

    it('完了状態フィルターが正常に動作する（進行中）', async () => {
      const { getUserMissionsByStatus } = require('@/lib/db/queries/user-missions');
      getUserMissionsByStatus.mockResolvedValue([
        {
          id: '2',
          userId: 'user-123',
          missionId: '2',
          progress: 5,
          isCompleted: false,
          completedAt: null,
          claimedAt: null,
        },
      ]);

      const request = createMockRequest('/api/user-missions', { status: 'in_progress' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userMissions).toHaveLength(1);
      expect(data.data.userMissions[0].isCompleted).toBe(false);
      expect(getUserMissionsByStatus).toHaveBeenCalledWith('user-123', 'in_progress');
    });

    it('報酬受取状態フィルターが正常に動作する（未受取）', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 10,
          isCompleted: true,
          completedAt: new Date(),
          claimedAt: null, // 未受取
        },
      ]);

      const request = createMockRequest('/api/user-missions', { claimed: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userMissions).toHaveLength(1);
      expect(data.data.userMissions[0].claimedAt).toBeNull();
    });

    it('特定のミッションIDでフィルターできる', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockImplementation((userId, filters) => {
        if (filters && filters.missionId === 'mission-123') {
          return Promise.resolve([
            {
              id: '1',
              userId: 'user-123',
              missionId: 'mission-123',
              progress: 8,
              isCompleted: false,
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/user-missions', { missionId: 'mission-123' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userMissions).toHaveLength(1);
      expect(data.data.userMissions[0].missionId).toBe('mission-123');
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

    it('includeMissionDetails=trueでミッション詳細を含む', async () => {
      const { getUserMissionsWithMissionDetails } = require('@/lib/db/queries/user-missions');
      getUserMissionsWithMissionDetails.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 5,
          isCompleted: false,
          mission: {
            id: '1',
            title: '習慣の第一歩',
            description: '初めてのルーティンを完了しよう',
            type: 'count',
            targetValue: 1,
            xpReward: 50,
            badgeId: 'routine-creator',
            difficulty: 'easy',
          },
        },
      ]);

      const request = createMockRequest('/api/user-missions', { includeMissionDetails: 'true' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userMissions[0].mission).toBeDefined();
      expect(data.data.userMissions[0].mission.title).toBe('習慣の第一歩');
    });

    it('includeMissionDetails=falseで基本データのみ取得', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 5,
          isCompleted: false,
        },
      ]);

      const request = createMockRequest('/api/user-missions', { includeMissionDetails: 'false' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userMissions[0].mission).toBeUndefined();
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
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(2);
        expect(pagination.limit).toBe(10);
        return Promise.resolve([
          {
            id: '11',
            userId: 'user-123',
            missionId: '11',
            progress: 1,
            isCompleted: false,
          },
        ]);
      });

      const request = createMockRequest('/api/user-missions', { page: '2', limit: '10' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination).toBeDefined();
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(10);
    });

    it('デフォルトページング値が適用される', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockImplementation((userId, filters, pagination) => {
        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(50);
        return Promise.resolve([]);
      });

      const request = createMockRequest('/api/user-missions');
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

    it('無効なstatusで400エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { status: 'invalid_status' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('status');
    });

    it('無効なclaimedで400エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { claimed: 'invalid_boolean' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('claimed');
    });

    it('無効なincludeMissionDetailsで400エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { includeMissionDetails: 'invalid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('includeMissionDetails');
    });

    it('無効なpageで400エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { page: '-1' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('page');
    });

    it('無効なlimitで400エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { limit: '0' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('limit');
    });

    it('limitが100を超えると400エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { limit: '101' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('limit');
    });

    it('無効なmissionId UUIDで400エラーになる', async () => {
      const request = createMockRequest('/api/user-missions', { missionId: 'invalid-uuid' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('missionId');
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
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest('/api/user-missions');
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

    it('ユーザーミッションが存在しない場合は空配列を返す', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([]);

      const request = createMockRequest('/api/user-missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userMissions).toEqual([]);
    });

    it('フィルター結果が0件の場合は空配列を返す', async () => {
      const { getUserMissionsByStatus } = require('@/lib/db/queries/user-missions');
      getUserMissionsByStatus.mockResolvedValue([]);

      const request = createMockRequest('/api/user-missions', { status: 'completed' });
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.userMissions).toEqual([]);
    });

    it('進行度100%だが未完了のミッションも正常に取得できる', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 100, // 100%だが未完了
          isCompleted: false,
          completedAt: null,
          claimedAt: null,
        },
      ]);

      const request = createMockRequest('/api/user-missions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.userMissions[0].progress).toBe(100);
      expect(data.data.userMissions[0].isCompleted).toBe(false);
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

    it('ユーザーミッション一覧取得のレスポンス時間が300ms以下である', async () => {
      const { getUserMissions } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([
        {
          id: '1',
          userId: 'user-123',
          missionId: '1',
          progress: 5,
          isCompleted: false,
        },
      ]);

      const startTime = Date.now();
      const request = createMockRequest('/api/user-missions');
      await GET(request);
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(300);
    });
  });
});