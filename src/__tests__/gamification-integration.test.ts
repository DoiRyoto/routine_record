/**
 * TASK-106: ゲーミフィケーションAPI実装 - 統合テスト (TDD Red Phase)
 * 
 * このファイルは意図的に失敗する統合テストを含みます。
 * 実装が完了するまでテストは失敗し続けます。
 * 
 * @jest-environment node
 */

// Next.js API Routes
import { NextRequest } from 'next/server';

import { POST as joinChallengesPOST } from '@/app/api/challenges/[id]/join/route';
import { GET as challengesGET } from '@/app/api/challenges/route';
import { GET as missionsGET } from '@/app/api/missions/route';
import { GET as userMissionsGET } from '@/app/api/user-missions/route';
import { GET as userProfilesGET } from '@/app/api/user-profiles/route';

// Use Cases
import { CalculateXPUseCase } from '@/application/usecases/CalculateXPUseCase';
import { JoinChallengeUseCase } from '@/application/usecases/JoinChallengeUseCase';
import { ProcessLevelUpUseCase } from '@/application/usecases/ProcessLevelUpUseCase';

// Domain Services
import { LevelUpService } from '@/domain/services/LevelUpService';
import { XPCalculationService } from '@/domain/services/XPCalculationService';


// Global mocks
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn().mockReturnValue({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn(),
  }),
}));

jest.mock('@/lib/db/queries/user-profiles', () => ({
  createUserProfile: jest.fn(),
  updateUserProfile: jest.fn(),
  getUserProfile: jest.fn(),
}));

jest.mock('@/lib/db/queries/missions', () => ({
  getAllMissions: jest.fn(),
  getMissionsByDifficulty: jest.fn(),
}));

jest.mock('@/lib/db/queries/user-missions', () => ({
  getUserMissions: jest.fn(),
  createUserMission: jest.fn(),
  updateUserMission: jest.fn(),
}));

jest.mock('@/lib/db/queries/challenges', () => ({
  getAllChallenges: jest.fn(),
  getChallengeById: jest.fn(),
  joinChallenge: jest.fn(),
}));

// テストユーティリティ関数
function createMockRequest(path: string, searchParams: Record<string, string> = {}): NextRequest {
  const url = new URL(`http://localhost:3000${path}`);
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

function createMockPOSTRequest(path: string, body?: any): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'sb-access-token=mock-access-token',
    },
  });
}

describe('ゲーミフィケーションシステム統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // 共通の認証モック
    const { createServerClient } = require('@/lib/supabase/server');
    const mockSupabase = createServerClient();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });
  });

  describe('TC-065: 新規ユーザーのゲーミフィケーション体験', () => {
    it('新規ユーザーが初回ルーチン完了から始まる完全なジャーニーをテスト', async () => {
      // 1. 初期ユーザープロフィール確認
      const { getUserProfile } = require('@/lib/db/queries/user-profiles');
      getUserProfile.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        level: 1,
        total_xp: 0,
        current_streak_days: 0,
        longest_streak_days: 0,
      });

      let profileRequest = createMockRequest('/api/user-profiles');
      let profileResponse = await userProfilesGET(profileRequest);
      let profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(200);
      expect(profileData.data.userProfile.level).toBe(1);
      expect(profileData.data.userProfile.totalXP).toBe(0);

      // 2. XP計算テスト（初回ルーチン完了）
      const xpService = new XPCalculationService();
      const calculatedXP = await xpService.calculateRoutineCompletionXP({
        userId: 'user-123',
        routineId: 'routine-1',
        difficulty: 'easy',
        streakDays: 1,
        isFirstCompletion: true,
      });

      expect(calculatedXP.baseXP).toBeGreaterThan(0);
      expect(calculatedXP.bonusXP).toBeGreaterThan(0); // 初回ボーナス
      expect(calculatedXP.totalXP).toBe(calculatedXP.baseXP + calculatedXP.bonusXP);

      // 3. レベルアップ判定テスト
      const levelUpService = new LevelUpService();
      const levelUpResult = await levelUpService.checkAndProcessLevelUp({
        userId: 'user-123',
        currentXP: calculatedXP.totalXP,
        currentLevel: 1,
      });

      expect(levelUpResult.leveledUp).toBeDefined();
      expect(levelUpResult.newLevel).toBeGreaterThanOrEqual(1);

      // 4. 更新されたプロフィール確認
      getUserProfile.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        level: levelUpResult.newLevel,
        total_xp: calculatedXP.totalXP,
        current_streak_days: 1,
        longest_streak_days: 1,
      });

      profileRequest = createMockRequest('/api/user-profiles');
      profileResponse = await userProfilesGET(profileRequest);
      profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(200);
      expect(profileData.data.userProfile.totalXP).toBe(calculatedXP.totalXP);
      expect(profileData.data.userProfile.level).toBe(levelUpResult.newLevel);
      expect(profileData.data.userProfile.streakDays).toBe(1);

      // 5. バッジ確認（初回達成バッジが獲得されているか）
      profileRequest = createMockRequest('/api/user-profiles', { includeDetails: 'true' });
      profileResponse = await userProfilesGET(profileRequest);
      profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(200);
      expect(profileData.data.badges).toBeDefined();
      expect(Array.isArray(profileData.data.badges)).toBe(true);
      
      const firstCompletionBadge = profileData.data.badges.find(
        (badge: any) => badge.name === '初回達成'
      );
      expect(firstCompletionBadge).toBeDefined();
      expect(firstCompletionBadge.rarity).toBe('common');
    });
  });

  describe('TC-066: チャレンジ参加から完了までのフロー', () => {
    it('チャレンジ参加から進捗更新、完了、報酬受取まで', async () => {
      // 1. チャレンジ一覧取得
      const { getAllChallenges } = require('@/lib/db/queries/challenges');
      getAllChallenges.mockResolvedValue([
        {
          id: 'challenge-1',
          title: '週間チャレンジ',
          description: '今週中に21回ルーチンを実行',
          type: 'weekly',
          participants: 100,
          maxParticipants: 500,
          isActive: true,
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        },
      ]);

      const challengesRequest = createMockRequest('/api/challenges');
      const challengesResponse = await challengesGET(challengesRequest);
      const challengesData = await challengesResponse.json();

      expect(challengesResponse.status).toBe(200);
      expect(challengesData.data.challenges).toHaveLength(1);
      expect(challengesData.data.challenges[0].isActive).toBe(true);

      // 2. チャレンジ参加
      const { getChallengeById, joinChallenge } = require('@/lib/db/queries/challenges');
      getChallengeById.mockResolvedValue({
        id: 'challenge-1',
        title: '週間チャレンジ',
        participants: 100,
        maxParticipants: 500,
        isActive: true,
      });
      
      joinChallenge.mockResolvedValue({
        id: 'user-challenge-1',
        userId: 'user-123',
        challengeId: 'challenge-1',
        progress: 0,
        isCompleted: false,
      });

      const joinRequest = createMockPOSTRequest('/api/challenges/challenge-1/join');
      const joinResponse = await joinChallengesPOST(joinRequest, { 
        params: { id: 'challenge-1' } 
      });
      const joinData = await joinResponse.json();

      expect(joinResponse.status).toBe(201);
      expect(joinData.success).toBe(true);
      expect(joinData.data.userChallenge.challengeId).toBe('challenge-1');
      expect(joinData.data.userChallenge.progress).toBe(0);

      // 3. ルーチン実行による進捗更新（シミュレーション）
      const { getUserMissions, updateUserMission } = require('@/lib/db/queries/user-missions');
      getUserMissions.mockResolvedValue([
        {
          id: 'user-challenge-1',
          userId: 'user-123',
          challengeId: 'challenge-1',
          progress: 10, // 10回実行済み
          isCompleted: false,
        },
      ]);

      let userChallengesRequest = createMockRequest('/api/user-challenges');
      let userChallengesResponse = await userMissionsGET(userChallengesRequest);
      let userChallengesData = await userChallengesResponse.json();

      expect(userChallengesResponse.status).toBe(200);
      expect(userChallengesData.data.userMissions[0].progress).toBe(10);

      // 4. チャレンジ完了（21回達成）
      getUserMissions.mockResolvedValue([
        {
          id: 'user-challenge-1',
          userId: 'user-123',
          challengeId: 'challenge-1',
          progress: 21, // 目標達成
          isCompleted: true,
          completedAt: new Date(),
        },
      ]);

      userChallengesRequest = createMockRequest('/api/user-challenges');
      userChallengesResponse = await userMissionsGET(userChallengesRequest);
      userChallengesData = await userChallengesResponse.json();

      expect(userChallengesResponse.status).toBe(200);
      expect(userChallengesData.data.userMissions[0].isCompleted).toBe(true);
      expect(userChallengesData.data.userMissions[0].progress).toBe(21);

      // 5. 報酬XP計算と付与
      const calculateXPUseCase = new CalculateXPUseCase();
      const challengeXP = await calculateXPUseCase.execute({
        userId: 'user-123',
        source: 'challenge_completion',
        challengeId: 'challenge-1',
      });

      expect(challengeXP.isSuccess).toBe(true);
      if (challengeXP.isSuccess) {
        expect(challengeXP.value.totalXP).toBeGreaterThan(0);
        expect(challengeXP.value.source).toBe('challenge_completion');
      }
    });
  });

  describe('TC-067: レベルアップ時の連鎖処理', () => {
    it('レベルアップトリガーでの全連鎖処理テスト', async () => {
      // 1. レベルアップ直前のユーザー状態
      const { getUserProfile } = require('@/lib/db/queries/user-profiles');
      getUserProfile.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        level: 2,
        total_xp: 1240, // レベル3まであと10XP
        current_streak_days: 5,
        longest_streak_days: 10,
      });

      let profileRequest = createMockRequest('/api/user-profiles');
      let profileResponse = await userProfilesGET(profileRequest);
      let profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(200);
      expect(profileData.data.userProfile.level).toBe(2);
      expect(profileData.data.userProfile.totalXP).toBe(1240);

      // 2. XP付与でレベルアップ発生
      const calculateXPUseCase = new CalculateXPUseCase();
      const newXP = await calculateXPUseCase.execute({
        userId: 'user-123',
        source: 'routine_completion',
        routineId: 'routine-1',
        amount: 15, // これでレベルアップ
      });

      expect(newXP.isSuccess).toBe(true);

      // 3. レベルアップ処理の実行
      const processLevelUpUseCase = new ProcessLevelUpUseCase();
      const levelUpResult = await processLevelUpUseCase.execute({
        userId: 'user-123',
        newTotalXP: 1255, // 1240 + 15
      });

      expect(levelUpResult.isSuccess).toBe(true);
      if (levelUpResult.isSuccess) {
        expect(levelUpResult.value.leveledUp).toBe(true);
        expect(levelUpResult.value.newLevel).toBe(3);
        expect(levelUpResult.value.notificationGenerated).toBe(true);
      }

      // 4. レベルアップ後のプロフィール確認
      getUserProfile.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        level: 3,
        total_xp: 1255,
        current_streak_days: 6,
        longest_streak_days: 10,
      });

      profileRequest = createMockRequest('/api/user-profiles');
      profileResponse = await userProfilesGET(profileRequest);
      profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(200);
      expect(profileData.data.userProfile.level).toBe(3);
      expect(profileData.data.userProfile.totalXP).toBe(1255);

      // 5. レベルアップ通知の確認
      profileRequest = createMockRequest('/api/user-profiles', { includeDetails: 'true' });
      profileResponse = await userProfilesGET(profileRequest);
      profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(200);
      expect(profileData.data.recentXPHistory).toBeDefined();
      
      const levelUpEntry = profileData.data.recentXPHistory.find(
        (entry: any) => entry.source === 'level_up'
      );
      expect(levelUpEntry).toBeDefined();

      // 6. レベル達成バッジの自動獲得確認
      const levelBadge = profileData.data.badges.find(
        (badge: any) => badge.name.includes('レベル3達成')
      );
      expect(levelBadge).toBeDefined();
      expect(levelBadge.rarity).toBe('rare');
    });
  });

  describe('データ整合性統合テスト', () => {
    it('複数のゲーミフィケーション要素間でのデータ整合性', async () => {
      // 1. 初期状態確認
      const { getUserProfile } = require('@/lib/db/queries/user-profiles');
      const { getUserMissions } = require('@/lib/db/queries/user-missions');

      getUserProfile.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        level: 1,
        total_xp: 0,
        current_streak_days: 0,
      });

      getUserMissions.mockResolvedValue([]);

      // プロフィール確認
      let profileRequest = createMockRequest('/api/user-profiles');
      let profileResponse = await userProfilesGET(profileRequest);
      let profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(200);
      expect(profileData.data.userProfile.totalXP).toBe(0);

      // ミッション確認
      let missionsRequest = createMockRequest('/api/user-missions');
      let missionsResponse = await userMissionsGET(missionsRequest);
      let missionsData = await missionsResponse.json();

      expect(missionsResponse.status).toBe(200);
      expect(missionsData.data.userMissions).toHaveLength(0);

      // 2. 複数のゲーミフィケーション要素同時更新
      const xpCalculation = new XPCalculationService();
      const totalXP = await xpCalculation.calculateRoutineCompletionXP({
        userId: 'user-123',
        routineId: 'routine-1',
        difficulty: 'medium',
        streakDays: 1,
        isFirstCompletion: true,
      });

      // XP更新後の状態
      getUserProfile.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        level: 1,
        total_xp: totalXP.totalXP,
        current_streak_days: 1,
      });

      // ミッション進捗も更新
      getUserMissions.mockResolvedValue([
        {
          id: 'user-mission-1',
          userId: 'user-123',
          missionId: 'mission-1',
          progress: 1,
          isCompleted: false,
        },
      ]);

      // 3. 整合性確認
      profileRequest = createMockRequest('/api/user-profiles');
      profileResponse = await userProfilesGET(profileRequest);
      profileData = await profileResponse.json();

      missionsRequest = createMockRequest('/api/user-missions');
      missionsResponse = await userMissionsGET(missionsRequest);
      missionsData = await missionsResponse.json();

      // プロフィールとミッションの両方が正しく更新されている
      expect(profileData.data.userProfile.totalXP).toBe(totalXP.totalXP);
      expect(profileData.data.userProfile.streakDays).toBe(1);
      expect(missionsData.data.userMissions[0].progress).toBe(1);

      // XP履歴とミッション進捗の時系列一貫性
      profileRequest = createMockRequest('/api/user-profiles', { includeDetails: 'true' });
      profileResponse = await userProfilesGET(profileRequest);
      profileData = await profileResponse.json();

      const xpHistory = profileData.data.recentXPHistory;
      expect(xpHistory).toBeDefined();
      expect(Array.isArray(xpHistory)).toBe(true);
      
      if (xpHistory.length > 0) {
        expect(xpHistory[0].amount).toBe(totalXP.totalXP);
        expect(xpHistory[0].source).toBe('routine_completion');
      }
    });
  });

  describe('エラーハンドリング統合テスト', () => {
    it('ゲーミフィケーション処理中のエラーが適切にハンドリングされる', async () => {
      // 1. データベース接続エラーシミュレーション
      const { getUserProfile } = require('@/lib/db/queries/user-profiles');
      getUserProfile.mockRejectedValue(new Error('Database connection failed'));

      const profileRequest = createMockRequest('/api/user-profiles');
      const profileResponse = await userProfilesGET(profileRequest);
      const profileData = await profileResponse.json();

      expect(profileResponse.status).toBe(500);
      expect(profileData.success).toBe(false);
      expect(profileData.error).toBeDefined();

      // 2. 認証エラー時の連鎖処理確認
      const { createServerClient } = require('@/lib/supabase/server');
      const mockSupabase = createServerClient();
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unauthorized' },
      });

      const unauthorizedRequest = createMockRequest('/api/user-profiles');
      const unauthorizedResponse = await userProfilesGET(unauthorizedRequest);
      const unauthorizedData = await unauthorizedResponse.json();

      expect(unauthorizedResponse.status).toBe(401);
      expect(unauthorizedData.error).toBe('認証が必要です');

      // 3. ビジネスルールエラー時の処理確認
      // 認証を正常に戻す
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const joinRequest = createMockPOSTRequest('/api/challenges/invalid-challenge/join');
      const joinResponse = await joinChallengesPOST(joinRequest, { 
        params: { id: 'invalid-challenge' } 
      });
      const joinData = await joinResponse.json();

      // チャレンジが存在しない場合の適切なエラーハンドリング
      expect([400, 404, 500]).toContain(joinResponse.status);
      expect(joinData.success).toBe(false);
      expect(joinData.error).toBeDefined();
    });
  });

  describe('パフォーマンス統合テスト', () => {
    it('ゲーミフィケーション機能のレスポンス時間が許容範囲内', async () => {
      const { getUserProfile } = require('@/lib/db/queries/user-profiles');
      const { getAllMissions } = require('@/lib/db/queries/missions');

      getUserProfile.mockResolvedValue({
        id: 'profile-123',
        user_id: 'user-123',
        level: 5,
        total_xp: 2500,
      });

      getAllMissions.mockResolvedValue(Array.from({ length: 50 }, (_, i) => ({
        id: `mission-${i}`,
        title: `ミッション${i}`,
        type: 'count',
        difficulty: 'easy',
        xpReward: 100,
        isActive: true,
      })));

      // 複数APIの同時実行時間測定
      const startTime = Date.now();

      const [profileResponse, missionsResponse] = await Promise.all([
        userProfilesGET(createMockRequest('/api/user-profiles', { includeDetails: 'true' })),
        missionsGET(createMockRequest('/api/missions')),
      ]);

      const responseTime = Date.now() - startTime;

      expect(profileResponse.status).toBe(200);
      expect(missionsResponse.status).toBe(200);
      expect(responseTime).toBeLessThan(800); // 複数API同時実行で800ms以内

      // 単一APIのレスポンス時間
      const singleStartTime = Date.now();
      await userProfilesGET(createMockRequest('/api/user-profiles'));
      const singleResponseTime = Date.now() - singleStartTime;

      expect(singleResponseTime).toBeLessThan(300); // 単一APIで300ms以内
    });
  });
});