/**
 * TASK-102: ルーチン管理API実装 - テストファイル (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Supabase モックセットアップ
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

// Database queries モック
jest.mock('@/lib/db/queries/routines', () => ({
  getRoutines: jest.fn(),
  createRoutine: jest.fn(),
}));

// Next.js cookies モック
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// テストユーティリティ関数
function createMockRequest(path: string, body?: any): NextRequest {
  const url = `http://localhost:3000${path}`;
  const init: RequestInit = {
    method: body ? 'POST' : 'GET',
  };
  
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }

  return new NextRequest(url, init);
}

describe('GET /api/routines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーでルーチン一覧を取得できる', async () => {
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

      const { getRoutines } = require('@/lib/db/queries/routines');
      getRoutines.mockResolvedValue({
        routines: [
          {
            id: 'routine-1',
            name: '朝の運動',
            category: '健康',
            goalType: 'schedule_based',
          },
        ],
        pagination: { page: 1, limit: 50, total: 1, pages: 1 },
      });

      const request = createMockRequest('/api/routines');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.routines).toBeDefined();
      expect(Array.isArray(data.data.routines)).toBe(true);
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

      const request = createMockRequest('/api/routines');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  describe('フィルタリング・ページング', () => {
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
      const { getRoutines } = require('@/lib/db/queries/routines');
      getRoutines.mockResolvedValue({
        routines: [
          {
            id: 'routine-1',
            name: '朝の運動',
            category: '健康',
          },
        ],
        pagination: { page: 1, limit: 50, total: 1, pages: 1 },
      });

      const request = createMockRequest('/api/routines?category=健康');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.routines.every((r: any) => r.category === '健康')).toBe(true);
    });

    it('ページングパラメータが正しく処理される', async () => {
      const { getRoutines } = require('@/lib/db/queries/routines');
      getRoutines.mockImplementation((userId, options) => {
        expect(options.page).toBe(2);
        expect(options.limit).toBe(10);
        return Promise.resolve({
          routines: [],
          pagination: { page: 2, limit: 10, total: 0, pages: 0 },
        });
      });

      const request = createMockRequest('/api/routines?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(10);
    });
  });
});

describe('POST /api/routines', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 認証成功のデフォルト設定
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

  describe('スケジュールベース作成', () => {
    it('有効なスケジュールベースルーチンが作成できる', async () => {
      const { createRoutine } = require('@/lib/db/queries/routines');
      createRoutine.mockResolvedValue({
        id: 'routine-123',
        name: '朝の運動',
        description: '毎朝のストレッチ',
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        recurrenceInterval: 1,
      });

      const payload = {
        name: '朝の運動',
        description: '毎朝のストレッチ',
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
        recurrenceInterval: 1,
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.routine.goalType).toBe('schedule_based');
    });
  });

  describe('頻度ベース作成 (REQ-101)', () => {
    it('有効な頻度ベースルーチンが作成できる', async () => {
      const { createRoutine } = require('@/lib/db/queries/routines');
      createRoutine.mockResolvedValue({
        id: 'routine-123',
        name: '読書',
        description: '週3回の読書',
        category: '学習',
        goalType: 'frequency_based',
        targetCount: 3,
        targetPeriod: 'weekly',
      });

      const payload = {
        name: '読書',
        description: '週3回の読書',
        category: '学習',
        goalType: 'frequency_based',
        targetCount: 3,
        targetPeriod: 'weekly',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.routine.goalType).toBe('frequency_based');
      expect(data.data.routine.targetCount).toBe(3);
      expect(data.data.routine.targetPeriod).toBe('weekly');
    });

    it('頻度ベースでtargetCountが不足するとエラーになる', async () => {
      const payload = {
        name: '読書',
        category: '学習',
        goalType: 'frequency_based',
        targetPeriod: 'weekly',
        // targetCount が不足
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('targetCount');
    });

    it('頻度ベースでtargetPeriodが不足するとエラーになる', async () => {
      const payload = {
        name: '読書',
        category: '学習',
        goalType: 'frequency_based',
        targetCount: 3,
        // targetPeriod が不足
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('targetPeriod');
    });
  });

  describe('スケジュールベース検証', () => {
    it('スケジュールベースでrecurrenceTypeが不足するとエラーになる', async () => {
      const payload = {
        name: '運動',
        category: '健康',
        goalType: 'schedule_based',
        // recurrenceType が不足
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('recurrenceType');
    });
  });

  describe('REQ-404 文字数制限検証', () => {
    it('name が100文字を超えるとエラーになる', async () => {
      const payload = {
        name: 'a'.repeat(101), // 101文字
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('name');
    });

    it('description が500文字を超えるとエラーになる', async () => {
      const payload = {
        name: '運動',
        description: 'a'.repeat(501), // 501文字
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('description');
    });

    it('category が50文字を超えるとエラーになる', async () => {
      const payload = {
        name: '運動',
        category: 'a'.repeat(51), // 51文字
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('category');
    });
  });

  describe('必須フィールド検証', () => {
    it('name が空の場合エラーになる', async () => {
      const payload = {
        name: '',
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('name');
    });

    it('category が空の場合エラーになる', async () => {
      const payload = {
        name: '運動',
        category: '',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('category');
    });

    it('goalType が空の場合エラーになる', async () => {
      const payload = {
        name: '運動',
        category: '健康',
        goalType: '',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('goalType');
    });
  });

  describe('Input Sanitization', () => {
    it('XSSペイロードがサニタイズされる', async () => {
      const { createRoutine } = require('@/lib/db/queries/routines');
      createRoutine.mockResolvedValue({
        id: 'routine-123',
        name: 'alert("xss")',
        description: '',
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      });

      const maliciousPayload = {
        name: '<script>alert("xss")</script>',
        description: '<img src="x" onerror="alert(1)">',
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', maliciousPayload);
      const response = await POST(request);
      const data = await response.json();

      if (response.status === 201) {
        expect(JSON.stringify(data)).not.toContain('<script>');
        expect(JSON.stringify(data)).not.toContain('<img');
      }
    });
  });

  describe('認証テスト', () => {
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

      const payload = {
        name: '運動',
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  describe('エラーハンドリング', () => {
    it('データベースエラー時に500エラーを返す', async () => {
      const { createRoutine } = require('@/lib/db/queries/routines');
      createRoutine.mockRejectedValue(new Error('Database error'));

      const payload = {
        name: '運動',
        category: '健康',
        goalType: 'schedule_based',
        recurrenceType: 'daily',
      };

      const request = createMockRequest('/api/routines', payload);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
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

  it('ルーチン一覧取得のレスポンス時間が300ms以下である', async () => {
    const { getRoutines } = require('@/lib/db/queries/routines');
    getRoutines.mockResolvedValue({
      routines: [],
      pagination: { page: 1, limit: 50, total: 0, pages: 0 },
    });

    const startTime = Date.now();
    const request = createMockRequest('/api/routines');
    await GET(request);
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(300);
  });

  it('ルーチン作成のレスポンス時間が500ms以下である', async () => {
    const { createRoutine } = require('@/lib/db/queries/routines');
    createRoutine.mockResolvedValue({
      id: 'routine-123',
      name: 'パフォーマンステスト',
      category: 'テスト',
      goalType: 'schedule_based',
      recurrenceType: 'daily',
    });

    const startTime = Date.now();
    const request = createMockRequest('/api/routines', {
      name: 'パフォーマンステスト',
      category: 'テスト',
      goalType: 'schedule_based',
      recurrenceType: 'daily',
    });
    await POST(request);
    const responseTime = Date.now() - startTime;

    expect(responseTime).toBeLessThan(500);
  });
});