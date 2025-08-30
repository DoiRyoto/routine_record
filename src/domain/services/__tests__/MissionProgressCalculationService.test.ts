import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { Mission } from '../../entities/Mission';
import { IExecutionRecordRepository } from '../../repositories/IExecutionRecordRepository';
import { MissionProgressCalculationService } from '../MissionProgressCalculationService';

describe('MissionProgressCalculationService', () => {
  let service: MissionProgressCalculationService;
  let mockExecutionRecordRepository: jest.Mocked<IExecutionRecordRepository>;

  beforeEach(() => {
    mockExecutionRecordRepository = {
      getByUserId: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getByUserAndDateRange: jest.fn(),
      getByUserAndMissionPeriod: jest.fn(),
    } as jest.Mocked<IExecutionRecordRepository>;

    service = new MissionProgressCalculationService(mockExecutionRecordRepository);
  });

  describe('Streak Mission Type', () => {
    it('should calculate correct streak for consecutive days', async () => {
      // Given: 連続3日間の実行記録がある
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Streak Mission',
        description: '7日連続でルーティンを実行',
        type: 'streak',
        targetValue: 7,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        badgeId: null
      });

      const mockExecutionRecords = [
        {
          id: 'exec1',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-03T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec2',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-02T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec3',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-01T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(mockExecutionRecords);

      // When: ストリーク計算を実行
      const progress = await service.calculateStreakProgress(userId, mission);

      // Then: 進捗は3になる
      expect(progress).toBe(3);
    });

    it('should reset streak when day is missed', async () => {
      // Given: 1/1, 1/2実行、1/3休み、1/4, 1/5実行
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Streak Mission',
        type: 'streak',
        targetValue: 7,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '7日連続',
        badgeId: null
      });

      const mockExecutionRecords = [
        {
          id: 'exec1',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-05T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec2',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-04T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        // 1/3 は実行なし
        {
          id: 'exec3',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-02T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec4',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-01T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(mockExecutionRecords);

      // When: 最新ストリーク計算
      const progress = await service.calculateStreakProgress(userId, mission);

      // Then: 最新の連続は2日
      expect(progress).toBe(2);
    });

    it('should count multiple executions on same day as 1', async () => {
      // Given: 同日に複数回実行
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Streak Mission',
        type: 'streak',
        targetValue: 7,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '7日連続',
        badgeId: null
      });

      const mockExecutionRecords = [
        {
          id: 'exec1',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-02T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec2',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-01T18:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec3',
          userId: 'user1',
          routineId: 'routine2',
          executedAt: new Date('2024-01-01T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockExecutionRecordRepository.getByUserId.mockResolvedValue(mockExecutionRecords);

      // When: ストリーク計算
      const progress = await service.calculateStreakProgress(userId, mission);

      // Then: 2日のストリーク
      expect(progress).toBe(2);
    });
  });

  describe('Count Mission Type', () => {
    it('should calculate total execution count since mission start', async () => {
      // Given: ミッション開始後10回の実行
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Count Mission',
        type: 'count',
        targetValue: 15,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '15回実行',
        badgeId: null
      });

      const mockExecutionRecords = Array(10).fill(null).map((_, i) => ({
        id: `exec${i}`,
        userId: 'user1',
        routineId: 'routine1',
        executedAt: new Date('2024-01-01T09:00:00Z'),
        duration: 30,
        memo: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      mockExecutionRecordRepository.getByUserAndMissionPeriod.mockResolvedValue(mockExecutionRecords);

      // When: カウント計算
      const progress = await service.calculateCountProgress(userId, mission);

      // Then: 10回の実行をカウント
      expect(progress).toBe(10);
    });

    it('should exclude executions before mission start', async () => {
      // Given: ミッション開始前後の実行記録
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Count Mission',
        type: 'count',
        targetValue: 10,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '10回実行',
        badgeId: null
      });

      const mockExecutionRecords = [
        // ミッション開始後の実行のみ
        {
          id: 'exec1',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-02T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec2',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-03T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockExecutionRecordRepository.getByUserAndMissionPeriod.mockResolvedValue(mockExecutionRecords);

      // When: カウント計算
      const progress = await service.calculateCountProgress(userId, mission);

      // Then: ミッション開始後の2回のみカウント
      expect(progress).toBe(2);
    });
  });

  describe('Variety Mission Type', () => {
    it('should count unique categories', async () => {
      // Given: 3つの異なるカテゴリで実行
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Variety Mission',
        type: 'variety',
        targetValue: 3,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '3つのカテゴリ',
        badgeId: null
      });

      const mockExecutionRecords = [
        {
          id: 'exec1',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-01T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          routine: { categoryId: 'cat1' }
        },
        {
          id: 'exec2',
          userId: 'user1',
          routineId: 'routine2',
          executedAt: new Date('2024-01-01T10:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          routine: { categoryId: 'cat2' }
        },
        {
          id: 'exec3',
          userId: 'user1',
          routineId: 'routine3',
          executedAt: new Date('2024-01-01T11:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          routine: { categoryId: 'cat3' }
        },
        {
          id: 'exec4',
          userId: 'user1',
          routineId: 'routine4',
          executedAt: new Date('2024-01-01T12:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          routine: { categoryId: 'cat1' } // 重複
        }
      ];

      mockExecutionRecordRepository.getByUserAndMissionPeriod.mockResolvedValue(mockExecutionRecords);

      // When: バラエティ計算
      const progress = await service.calculateVarietyProgress(userId, mission);

      // Then: ユニークカテゴリ数は3
      expect(progress).toBe(3);
    });
  });

  describe('Consistency Mission Type', () => {
    it('should count execution days regardless of consecutiveness', async () => {
      // Given: 5日間実行（連続していない）
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Consistency Mission',
        type: 'consistency',
        targetValue: 7,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '7日間実行',
        badgeId: null
      });

      const mockExecutionRecords = [
        {
          id: 'exec1',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-01T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec2',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-03T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec3',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-05T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec4',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-07T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'exec5',
          userId: 'user1',
          routineId: 'routine1',
          executedAt: new Date('2024-01-10T09:00:00Z'),
          duration: 30,
          memo: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockExecutionRecordRepository.getByUserAndMissionPeriod.mockResolvedValue(mockExecutionRecords);

      // When: 一貫性計算
      const progress = await service.calculateConsistencyProgress(userId, mission);

      // Then: 5日間の実行をカウント
      expect(progress).toBe(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid mission type gracefully', async () => {
      // Given: 無効なミッションタイプ
      const userId = 'user1';
      const invalidMission = new Mission({
        id: 'mission1',
        title: 'Invalid Mission',
        type: 'invalid_type' as any,
        targetValue: 5,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '無効なタイプ',
        badgeId: null
      });

      // When: 進捗計算を試行
      const promise = service.calculateProgress(userId, invalidMission);

      // Then: 適切なエラーが発生
      await expect(promise).rejects.toThrow('Invalid mission type: invalid_type');
    });

    it('should handle database connection errors', async () => {
      // Given: データベース接続エラー
      const userId = 'user1';
      const mission = new Mission({
        id: 'mission1',
        title: 'Test Mission',
        type: 'count',
        targetValue: 5,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: 'テストミッション',
        badgeId: null
      });

      mockExecutionRecordRepository.getByUserAndMissionPeriod.mockRejectedValue(new Error('Connection failed'));

      // When: 進捗計算を試行
      const promise = service.calculateCountProgress(userId, mission);

      // Then: エラーが適切に処理される
      await expect(promise).rejects.toThrow('Connection failed');
    });
  });
});