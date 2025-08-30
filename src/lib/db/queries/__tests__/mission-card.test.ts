/**
 * Mission Card データベースクエリ関数のテスト
 * TDD Red Phase - 失敗するテストを先に実装
 */

// Jest環境でのテスト実装
import type { 
  MissionWithDetails, 
  UpdateMissionStatusRequest,
  GetMissionProgressRequest 
} from '@/types/mission-card';

import { db } from '../../index';
import { users, missions, userMissions, categories, executionRecords } from '../../schema';
import { 
  getTodayMissions, 
  updateMissionStatus, 
  getMissionProgress 
} from '../mission-card';

// テストデータ型定義
interface TestUser {
  id: string;
  displayName: string;
  email: string;
}

interface TestMission {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'count' | 'variety' | 'consistency';
  targetValue: number;
  isActive: boolean;
}

interface TestCategory {
  id: string;
  name: string;
  color: string;
  userId: string;
}

describe('Mission Card Database Queries', () => {
  // テストデータ
  const testUsers: TestUser[] = [
    {
      id: 'user-123',
      displayName: 'テストユーザー1',
      email: 'test1@example.com'
    },
    {
      id: 'user-456', 
      displayName: 'テストユーザー2',
      email: 'test2@example.com'
    }
  ];

  const testMissions: TestMission[] = [
    {
      id: 'mission-123',
      title: 'モーニングルーティン',
      description: '毎朝のルーティンを実行する',
      type: 'streak',
      targetValue: 7,
      isActive: true
    },
    {
      id: 'mission-456',
      title: 'ワークアウト',
      description: '週3回の運動を実行する',
      type: 'count',
      targetValue: 3,
      isActive: true
    },
    {
      id: 'mission-completed',
      title: '完了済みミッション',
      description: '既に完了しているミッション',
      type: 'streak',
      targetValue: 1,
      isActive: true
    }
  ];

  const testCategories: TestCategory[] = [
    {
      id: 'cat-health',
      name: 'health',
      color: 'bg-green-100 text-green-800',
      userId: 'user-123'
    },
    {
      id: 'cat-fitness',
      name: 'fitness',
      color: 'bg-orange-100 text-orange-800',
      userId: 'user-123'
    }
  ];

  // テストデータのセットアップとクリーンアップ
  beforeEach(async () => {
    // テストデータの挿入
    await db.insert(users).values(testUsers.map(user => ({
      ...user,
      timezone: 'Asia/Tokyo',
      status: 'active' as const,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })));

    await db.insert(categories).values(testCategories.map(cat => ({
      ...cat,
      isDefault: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })));

    await db.insert(missions).values(testMissions.map(mission => ({
      ...mission,
      xpReward: 100,
      difficulty: 'easy' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    })));
  });

  afterEach(async () => {
    // テストデータのクリーンアップ
    await db.delete(executionRecords);
    await db.delete(userMissions);
    await db.delete(missions);
    await db.delete(categories);
    await db.delete(users);
  });

  describe('getTodayMissions', () => {
    describe('正常ケース', () => {
      it('TC-001: 基本的な今日のミッション取得', async () => {
        // テスト用のユーザーミッションデータを準備
        await db.insert(userMissions).values([
          {
            userId: 'user-123',
            missionId: 'mission-123',
            progress: 0,
            isCompleted: false,
            startedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            userId: 'user-123',
            missionId: 'mission-456',
            progress: 1,
            isCompleted: false,
            startedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            userId: 'user-123',
            missionId: 'mission-completed',
            progress: 1,
            isCompleted: true,
            startedAt: new Date(),
            completedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);

        const result = await getTodayMissions({
          userId: 'user-123',
          date: '2024-01-15',
          timezone: 'Asia/Tokyo'
        });

        // アサーション
        expect(result).toHaveLength(3);
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'mission-123',
              name: 'モーニングルーティン',
              status: 'pending',
              progress: expect.objectContaining({
                current: 0,
                target: 7,
                percentage: 0,
                status: 'not_started'
              }),
              categoryInfo: expect.objectContaining({
                name: expect.any(String),
                backgroundColor: expect.any(String),
                textColor: expect.any(String)
              }),
              isScheduledToday: expect.any(Boolean)
            })
          ])
        );
      });

      it('TC-002: 完了済みミッションを除外して取得', async () => {
        // テスト用データ準備（完了済み2個、未完了3個）
        await db.insert(userMissions).values([
          {
            userId: 'user-123',
            missionId: 'mission-123',
            progress: 0,
            isCompleted: false,
            startedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            userId: 'user-123',
            missionId: 'mission-completed',
            progress: 1,
            isCompleted: true,
            startedAt: new Date(),
            completedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);

        const result = await getTodayMissions({
          userId: 'user-123',
          date: '2024-01-15',
          includeCompleted: false
        });

        // 完了済みミッションは除外される
        expect(result).toHaveLength(1);
        expect(result.every(m => m.status !== 'completed')).toBe(true);
      });

      it('TC-004: 頻度ベースミッションの進捗計算', async () => {
        // 週3回の頻度ベースミッション、今週1回実行済み
        await db.insert(userMissions).values({
          userId: 'user-123',
          missionId: 'mission-456', // count type, targetValue: 3
          progress: 1,
          isCompleted: false,
          startedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const result = await getTodayMissions({
          userId: 'user-123',
          date: '2024-01-15'
        });

        const countMission = result.find(m => m.id === 'mission-456');
        expect(countMission?.progress).toEqual({
          current: 1,
          target: 3,
          percentage: 33.33,
          status: 'in_progress'
        });
      });
    });

    describe('エッジケース', () => {
      it('TC-005: データが存在しないケース', async () => {
        const result = await getTodayMissions({
          userId: 'user-999', // 存在しないユーザー
          date: '2024-01-15'
        });

        expect(result).toEqual([]);
      });

      it('TC-007: 未来の日付での取得', async () => {
        await db.insert(userMissions).values({
          userId: 'user-123',
          missionId: 'mission-123',
          progress: 0,
          isCompleted: false,
          startedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        });

        const result = await getTodayMissions({
          userId: 'user-123',
          date: '2025-01-15' // 未来の日付
        });

        // 未来の日付でも基本的には取得できる
        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              status: 'pending'
            })
          ])
        );
      });
    });

    describe('異常ケース', () => {
      it('TC-008: 不正な日付フォーマット', async () => {
        await expect(
          getTodayMissions({
            userId: 'user-123',
            date: 'invalid-date'
          })
        ).rejects.toThrow('INVALID_DATE');
      });

      it('TC-009: 不正なユーザーIDフォーマット', async () => {
        await expect(
          getTodayMissions({
            userId: 'not-a-uuid',
            date: '2024-01-15'
          })
        ).rejects.toThrow('INVALID_USER_ID');
      });
    });
  });

  describe('updateMissionStatus', () => {
    beforeEach(async () => {
      // テスト用のユーザーミッション準備
      await db.insert(userMissions).values({
        id: 'user-mission-123',
        userId: 'user-123',
        missionId: 'mission-123',
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    describe('start アクション', () => {
      it('TC-011: ミッション開始成功', async () => {
        const request: UpdateMissionStatusRequest = {
          missionId: 'mission-456', // まだ開始されていないミッション
          userId: 'user-123',
          action: 'start',
          executedAt: '2024-01-15T09:00:00Z'
        };

        const result = await updateMissionStatus(request);

        expect(result.success).toBe(true);
        expect(result.updatedMission).toEqual(
          expect.objectContaining({
            id: 'mission-456',
            status: 'active'
          })
        );
      });

      it('TC-012: 既に開始済みのミッション', async () => {
        const request: UpdateMissionStatusRequest = {
          missionId: 'mission-123', // 既に開始済み
          userId: 'user-123',
          action: 'start'
        };

        const result = await updateMissionStatus(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('既に開始済み');
      });
    });

    describe('complete アクション', () => {
      it('TC-013: ミッション完了成功', async () => {
        const request: UpdateMissionStatusRequest = {
          missionId: 'mission-123',
          userId: 'user-123',
          action: 'complete',
          duration: 30,
          memo: 'よくできました'
        };

        const result = await updateMissionStatus(request);

        expect(result.success).toBe(true);
        expect(result.updatedMission?.status).toBe('completed');
      });

      it('TC-014: 未開始ミッションの完了試行', async () => {
        const request: UpdateMissionStatusRequest = {
          missionId: 'mission-456', // 未開始
          userId: 'user-123',
          action: 'complete'
        };

        const result = await updateMissionStatus(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('開始されていません');
      });
    });

    describe('異常ケース', () => {
      it('TC-016: 存在しないミッション', async () => {
        const request: UpdateMissionStatusRequest = {
          missionId: 'non-existent',
          userId: 'user-123',
          action: 'start'
        };

        const result = await updateMissionStatus(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('見つかりません');
      });

      it('TC-017: 他のユーザーのミッション操作', async () => {
        const request: UpdateMissionStatusRequest = {
          missionId: 'mission-123',
          userId: 'user-456', // 異なるユーザー
          action: 'start'
        };

        const result = await updateMissionStatus(request);

        expect(result.success).toBe(false);
        expect(result.error).toContain('アクセス権限');
      });
    });
  });

  describe('getMissionProgress', () => {
    beforeEach(async () => {
      // テスト用データ準備
      await db.insert(userMissions).values({
        userId: 'user-123',
        missionId: 'mission-123',
        progress: 3,
        isCompleted: false,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // 実行記録追加
      await db.insert(executionRecords).values([
        {
          routineId: 'mission-123', // 便宜上routineIdをmissionIdとして使用
          userId: 'user-123',
          executedAt: new Date(),
          duration: 30,
          isCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
    });

    it('TC-018: 基本的な進捗情報取得', async () => {
      const request: GetMissionProgressRequest = {
        userId: 'user-123',
        missionId: 'mission-123',
        period: 'today'
      };
      
      const result = await getMissionProgress(request);

      expect(result).toEqual(
        expect.objectContaining({
          mission: expect.objectContaining({
            id: 'mission-123'
          }),
          progress: expect.objectContaining({
            current: 3,
            target: 7,
            percentage: expect.any(Number)
          }),
          history: expect.any(Array),
          streak: expect.objectContaining({
            current: expect.any(Number),
            longest: expect.any(Number),
            isActive: expect.any(Boolean)
          })
        })
      );
    });

    it('TC-020: 実行記録がないミッション', async () => {
      // 実行記録を削除
      await db.delete(executionRecords);

      const request: GetMissionProgressRequest = {
        userId: 'user-123',
        missionId: 'mission-123',
        period: 'today'
      };
      
      const result = await getMissionProgress(request);

      expect(result.progress.current).toBe(3); // userMissionのprogress値
      expect(result.history).toEqual([]);
    });
  });

  describe('パフォーマンステスト', () => {
    it('TC-021: 大量データでの性能テスト', async () => {
      // 100個のミッションとユーザーミッションを作成
      const largeMissions = Array.from({ length: 100 }, (_, i) => ({
        id: `mission-large-${i}`,
        title: `大量テストミッション${i}`,
        description: `テスト用ミッション${i}`,
        type: 'count' as const,
        targetValue: 5,
        xpReward: 50,
        difficulty: 'easy' as const,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const largeUserMissions = Array.from({ length: 100 }, (_, i) => ({
        userId: 'user-123',
        missionId: `mission-large-${i}`,
        progress: Math.floor(Math.random() * 5),
        isCompleted: Math.random() > 0.7,
        startedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      await db.insert(missions).values(largeMissions);
      await db.insert(userMissions).values(largeUserMissions);

      const startTime = Date.now();
      
      const result = await getTodayMissions({
        userId: 'user-123',
        date: '2024-01-15'
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(result).toHaveLength(100);
      expect(responseTime).toBeLessThan(300); // 300ms以内
    });
  });

  describe('統合テスト', () => {
    it('TC-023: ミッション開始から完了までの一連の流れ', async () => {
      // 1. 未開始ミッション確認
      let missions = await getTodayMissions({
        userId: 'user-123',
        date: '2024-01-15'
      });
      
      const unstarted = missions.find(m => m.id === 'mission-456');
      expect(unstarted?.status).toBe('pending');

      // 2. ミッション開始
      const startResult = await updateMissionStatus({
        missionId: 'mission-456',
        userId: 'user-123',
        action: 'start'
      });
      expect(startResult.success).toBe(true);

      // 3. 開始済み確認
      missions = await getTodayMissions({
        userId: 'user-123',
        date: '2024-01-15'
      });
      const started = missions.find(m => m.id === 'mission-456');
      expect(started?.status).toBe('active');

      // 4. ミッション完了
      const completeResult = await updateMissionStatus({
        missionId: 'mission-456',
        userId: 'user-123',
        action: 'complete'
      });
      expect(completeResult.success).toBe(true);

      // 5. 完了済み確認
      missions = await getTodayMissions({
        userId: 'user-123',
        date: '2024-01-15'
      });
      const completed = missions.find(m => m.id === 'mission-456');
      expect(completed?.status).toBe('completed');
    });

    it('TC-024: 複数ユーザーでのデータ分離テスト', async () => {
      // 各ユーザーにミッション追加
      await db.insert(userMissions).values([
        {
          userId: 'user-123',
          missionId: 'mission-123',
          progress: 1,
          isCompleted: false,
          startedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: 'user-456',
          missionId: 'mission-456',
          progress: 2,
          isCompleted: false,
          startedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      const user123Missions = await getTodayMissions({
        userId: 'user-123',
        date: '2024-01-15'
      });

      const user456Missions = await getTodayMissions({
        userId: 'user-456',
        date: '2024-01-15'
      });

      // 各ユーザーは自分のミッションのみ取得
      expect(user123Missions.every(m => 
        m.userMission?.userId === 'user-123'
      )).toBe(true);
      
      expect(user456Missions.every(m => 
        m.userMission?.userId === 'user-456'
      )).toBe(true);

      // 他のユーザーのデータは含まれない
      expect(user123Missions.find(m => 
        m.userMission?.userId === 'user-456'
      )).toBeUndefined();
    });
  });
});