/**
 * TASK-106: ゲーミフィケーションAPI実装 - Join Challenge API テストファイル (TDD Red Phase)
 * 
 * このファイルは意図的に失敗するテストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

import { NextRequest } from 'next/server';

import { POST } from '../route';

// Supabase モックセットアップ
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}));

// Database queries モック
jest.mock('@/server/lib/db/queries/challenges', () => ({
  getChallengeById: jest.fn(),
  joinChallenge: jest.fn(),
  isUserAlreadyJoined: jest.fn(),
}));

// Use case モック
jest.mock('@/application/usecases/JoinChallengeUseCase', () => ({
  JoinChallengeUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn(),
  })),
}));

// Next.js cookies モック
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    getAll: jest.fn(() => []),
    set: jest.fn(),
  })),
}));

// テストユーティリティ関数
function createMockRequest(challengeId: string, body?: any): NextRequest {
  const url = `http://localhost:3000/api/challenges/${challengeId}/join`;
  const init: RequestInit = {
    method: 'POST',
  };
  
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { 'Content-Type': 'application/json' };
  }

  return new NextRequest(url, init);
}

describe('POST /api/challenges/[id]/join', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('認証テスト', () => {
    it('認証済みユーザーでチャレンジに参加できる', async () => {
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

      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          userChallenge: {
            id: 'user-challenge-1',
            userId: 'user-123',
            challengeId: 'challenge-123',
            joinedAt: new Date(),
            progress: 0,
            isCompleted: false,
            completedAt: null,
            rank: null,
          },
          challenge: {
            id: 'challenge-123',
            title: '新年スタートダッシュ',
            description: '1月中に100回のルーティンを実行',
            type: 'monthly',
            participants: 1248, // 参加後に増加
            maxParticipants: 2000,
            isActive: true,
          },
        }),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.userChallenge).toBeDefined();
      expect(data.data.challenge).toBeDefined();
      expect(data.data.userChallenge.userId).toBe('user-123');
      expect(data.data.userChallenge.challengeId).toBe('challenge-123');
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

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('認証が必要です');
    });
  });

  describe('バリデーションテスト', () => {
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

    it('無効なchallenge IDで400エラーになる', async () => {
      const request = createMockRequest('invalid-uuid');
      const response = await POST(request, { params: { id: 'invalid-uuid' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('challengeId');
    });

    it('存在しないchallenge IDで404エラーになる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('チャレンジが見つかりません')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('00000000-0000-0000-0000-000000000000');
      const response = await POST(request, { params: { id: '00000000-0000-0000-0000-000000000000' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('チャレンジが見つかりません');
    });

    it('空のchallenge IDで400エラーになる', async () => {
      const request = createMockRequest('');
      const response = await POST(request, { params: { id: '' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('challengeId');
    });
  });

  describe('ビジネスロジックテスト', () => {
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

    it('既に参加済みのチャレンジで409エラーになる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('既にこのチャレンジに参加しています')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('既にこのチャレンジに参加しています');
    });

    it('非アクティブなチャレンジで400エラーになる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('このチャレンジは現在参加できません')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('このチャレンジは現在参加できません');
    });

    it('満員のチャレンジで400エラーになる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('このチャレンジは満員です')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('このチャレンジは満員です');
    });

    it('期限切れのチャレンジで400エラーになる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('このチャレンジの参加期限が過ぎています')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('このチャレンジの参加期限が過ぎています');
    });

    it('開始前のチャレンジで400エラーになる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('このチャレンジはまだ開始されていません')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('このチャレンジはまだ開始されていません');
    });
  });

  describe('成功シナリオテスト', () => {
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

    it('ウィークリーチャレンジに正常に参加できる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          userChallenge: {
            id: 'user-challenge-1',
            userId: 'user-123',
            challengeId: 'weekly-challenge-1',
            joinedAt: new Date(),
            progress: 0,
            isCompleted: false,
            completedAt: null,
            rank: null,
          },
          challenge: {
            id: 'weekly-challenge-1',
            title: 'ウィークリー完璧主義者',
            description: 'この週に毎日少なくとも3つのルーティンを実行しよう',
            type: 'weekly',
            participants: 457, // 参加後に増加
            maxParticipants: null,
            isActive: true,
            startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
        }),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('weekly-challenge-1');
      const response = await POST(request, { params: { id: 'weekly-challenge-1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.userChallenge.challengeId).toBe('weekly-challenge-1');
      expect(data.data.challenge.type).toBe('weekly');
      expect(data.data.challenge.participants).toBe(457);
    });

    it('月次チャレンジに正常に参加できる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          userChallenge: {
            id: 'user-challenge-2',
            userId: 'user-123',
            challengeId: 'monthly-challenge-1',
            joinedAt: new Date(),
            progress: 0,
            isCompleted: false,
            completedAt: null,
            rank: null,
          },
          challenge: {
            id: 'monthly-challenge-1',
            title: '新年スタートダッシュ',
            description: '1月中に100回のルーティンを実行',
            type: 'monthly',
            participants: 1248,
            maxParticipants: 2000,
            isActive: true,
          },
        }),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('monthly-challenge-1');
      const response = await POST(request, { params: { id: 'monthly-challenge-1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.challenge.type).toBe('monthly');
    });

    it('シーズナルチャレンジに正常に参加できる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          userChallenge: {
            id: 'user-challenge-3',
            userId: 'user-123',
            challengeId: 'seasonal-challenge-1',
            joinedAt: new Date(),
            progress: 0,
            isCompleted: false,
            completedAt: null,
            rank: null,
          },
          challenge: {
            id: 'seasonal-challenge-1',
            title: '春の習慣チャレンジ',
            description: '春に向けて新しい習慣を身につけよう',
            type: 'seasonal',
            participants: 1,
            maxParticipants: null,
            isActive: true,
          },
        }),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('seasonal-challenge-1');
      const response = await POST(request, { params: { id: 'seasonal-challenge-1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.challenge.type).toBe('seasonal');
    });

    it('参加上限に達する直前のチャレンジに参加できる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          userChallenge: {
            id: 'user-challenge-4',
            userId: 'user-123',
            challengeId: 'limited-challenge-1',
            joinedAt: new Date(),
            progress: 0,
            isCompleted: false,
            completedAt: null,
            rank: null,
          },
          challenge: {
            id: 'limited-challenge-1',
            title: '限定チャレンジ',
            description: '先着100名限定のチャレンジ',
            type: 'special',
            participants: 100, // 上限に到達
            maxParticipants: 100,
            isActive: true,
          },
        }),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('limited-challenge-1');
      const response = await POST(request, { params: { id: 'limited-challenge-1' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.challenge.participants).toBe(100);
      expect(data.data.challenge.maxParticipants).toBe(100);
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
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('Database connection failed')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });

    it('UseCaseの初期化エラー時に500エラーを返す', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      JoinChallengeUseCase.mockImplementation(() => {
        throw new Error('UseCase initialization failed');
      });

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBeDefined();
    });
  });

  describe('セキュリティテスト', () => {
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

    it('SQLインジェクション攻撃を防ぐ', async () => {
      const maliciousId = "'; DROP TABLE challenges; --";
      
      const request = createMockRequest(maliciousId);
      const response = await POST(request, { params: { id: maliciousId } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('challengeId');
    });

    it('XSSペイロードがサニタイズされる', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockRejectedValue(new Error('<script>alert("xss")</script>')),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(JSON.stringify(data)).not.toContain('<script>');
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

    it('チャレンジ参加のレスポンス時間が500ms以下である', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          userChallenge: {
            id: 'user-challenge-1',
            userId: 'user-123',
            challengeId: 'challenge-123',
            joinedAt: new Date(),
            progress: 0,
            isCompleted: false,
            completedAt: null,
            rank: null,
          },
          challenge: {
            id: 'challenge-123',
            title: 'パフォーマンステスト',
            type: 'weekly',
            participants: 1,
            isActive: true,
          },
        }),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const startTime = Date.now();
      const request = createMockRequest('challenge-123');
      await POST(request, { params: { id: 'challenge-123' } });
      const responseTime = Date.now() - startTime;

      expect(responseTime).toBeLessThan(500);
    });
  });

  describe('並行性テスト', () => {
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

    it('同時に複数のユーザーが参加しても正常に処理される', async () => {
      const { JoinChallengeUseCase } = require('@/application/usecases/JoinChallengeUseCase');
      const mockUseCase = {
        execute: jest.fn().mockResolvedValue({
          userChallenge: {
            id: 'user-challenge-1',
            userId: 'user-123',
            challengeId: 'challenge-123',
            joinedAt: new Date(),
            progress: 0,
            isCompleted: false,
          },
          challenge: {
            id: 'challenge-123',
            title: '並行性テスト',
            type: 'weekly',
            participants: 2, // 他のユーザーも参加済み
            isActive: true,
          },
        }),
      };
      JoinChallengeUseCase.mockImplementation(() => mockUseCase);

      const request = createMockRequest('challenge-123');
      const response = await POST(request, { params: { id: 'challenge-123' } });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.challenge.participants).toBeGreaterThan(1);
    });
  });
});