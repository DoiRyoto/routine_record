import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { Mission } from '../../../domain/entities/Mission';
import { IMissionRepository } from '../../../domain/repositories/IMissionRepository';
import { MissionProgressCalculationService } from '../../../domain/services/MissionProgressCalculationService';
import { CalculateMissionProgressDto } from '../../dtos';
import { CalculateMissionProgressUseCase } from '../CalculateMissionProgressUseCase';

describe('CalculateMissionProgressUseCase', () => {
  let useCase: CalculateMissionProgressUseCase;
  let mockMissionRepository: jest.Mocked<IMissionRepository>;
  let mockMissionProgressService: jest.Mocked<MissionProgressCalculationService>;

  beforeEach(() => {
    mockMissionRepository = {
      getById: jest.fn(),
      getAll: jest.fn(),
      getActiveByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IMissionRepository>;

    mockMissionProgressService = {
      calculateProgress: jest.fn(),
      calculateStreakProgress: jest.fn(),
      calculateCountProgress: jest.fn(),
      calculateVarietyProgress: jest.fn(),
      calculateConsistencyProgress: jest.fn(),
    } as jest.Mocked<MissionProgressCalculationService>;

    useCase = new CalculateMissionProgressUseCase(
      mockMissionRepository,
      mockMissionProgressService
    );
  });

  describe('Progress Calculation', () => {
    it('should calculate progress for specific mission', async () => {
      // Given: 特定のミッション
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'mission1'
      };

      const mission = new Mission({
        id: 'mission1',
        title: 'Test Mission',
        type: 'count',
        targetValue: 10,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '10回実行',
        badgeId: null
      });

      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(7);

      // When: 進捗計算を実行
      const result = await useCase.execute(dto);

      // Then: 正しい進捗値が返される
      expect(mockMissionRepository.getById).toHaveBeenCalledWith('mission1');
      expect(mockMissionProgressService.calculateProgress).toHaveBeenCalledWith('user1', mission);
      expect(result.progress).toBe(7);
      expect(result.mission).toEqual(mission);
      expect(result.isCompleted).toBe(false);
      expect(result.completionPercentage).toBe(70);
    });

    it('should identify completed mission', async () => {
      // Given: 完了済みのミッション
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'mission1'
      };

      const mission = new Mission({
        id: 'mission1',
        title: 'Test Mission',
        type: 'count',
        targetValue: 10,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '10回実行',
        badgeId: null
      });

      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(10);

      // When: 進捗計算を実行
      const result = await useCase.execute(dto);

      // Then: 完了状態が正しく判定される
      expect(result.progress).toBe(10);
      expect(result.isCompleted).toBe(true);
      expect(result.completionPercentage).toBe(100);
    });

    it('should handle over-completion', async () => {
      // Given: 目標値を超えた進捗
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'mission1'
      };

      const mission = new Mission({
        id: 'mission1',
        title: 'Test Mission',
        type: 'count',
        targetValue: 10,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '10回実行',
        badgeId: null
      });

      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(15);

      // When: 進捗計算を実行
      const result = await useCase.execute(dto);

      // Then: 適切に処理される
      expect(result.progress).toBe(15);
      expect(result.isCompleted).toBe(true);
      expect(result.completionPercentage).toBe(150);
    });

    it('should calculate different mission types correctly', async () => {
      // Given: 異なるタイプのミッション
      const missions = [
        {
          mission: new Mission({
            id: 'streak1',
            title: 'Streak Mission',
            type: 'streak' as const,
            targetValue: 7,
            xpReward: 100,
            difficulty: 'medium' as const,
            isActive: true,
            description: '7日連続',
            badgeId: null
          }),
          expectedProgress: 3
        },
        {
          mission: new Mission({
            id: 'count1',
            title: 'Count Mission',
            type: 'count' as const,
            targetValue: 10,
            xpReward: 100,
            difficulty: 'medium' as const,
            isActive: true,
            description: '10回実行',
            badgeId: null
          }),
          expectedProgress: 5
        },
        {
          mission: new Mission({
            id: 'variety1',
            title: 'Variety Mission',
            type: 'variety' as const,
            targetValue: 3,
            xpReward: 100,
            difficulty: 'medium' as const,
            isActive: true,
            description: '3つのカテゴリ',
            badgeId: null
          }),
          expectedProgress: 2
        },
        {
          mission: new Mission({
            id: 'consistency1',
            title: 'Consistency Mission',
            type: 'consistency' as const,
            targetValue: 7,
            xpReward: 100,
            difficulty: 'medium' as const,
            isActive: true,
            description: '7日間実行',
            badgeId: null
          }),
          expectedProgress: 4
        }
      ];

      for (const { mission, expectedProgress } of missions) {
        // Given: 特定のミッションタイプ
        mockMissionRepository.getById.mockResolvedValue(mission);
        mockMissionProgressService.calculateProgress.mockResolvedValue(expectedProgress);

        // When: 進捗計算を実行
        const result = await useCase.execute({
          userId: 'user1',
          missionId: mission.id
        });

        // Then: 適切な進捗が計算される
        expect(result.progress).toBe(expectedProgress);
        expect(result.mission.type).toBe(mission.type);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw error when mission not found', async () => {
      // Given: 存在しないミッション
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'nonexistent'
      };

      mockMissionRepository.getById.mockResolvedValue(null);

      // When: 進捗計算を試行
      const promise = useCase.execute(dto);

      // Then: 適切なエラーが発生
      await expect(promise).rejects.toThrow('Mission not found: nonexistent');
    });

    it('should handle calculation service errors', async () => {
      // Given: 計算サービスエラー
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'mission1'
      };

      const mission = new Mission({
        id: 'mission1',
        title: 'Test Mission',
        type: 'count',
        targetValue: 10,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '10回実行',
        badgeId: null
      });

      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockRejectedValue(new Error('Calculation Error'));

      // When: 進捗計算を実行
      const promise = useCase.execute(dto);

      // Then: エラーが適切に処理される
      await expect(promise).rejects.toThrow('Calculation Error');
    });

    it('should handle database errors', async () => {
      // Given: データベースエラー
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'mission1'
      };

      mockMissionRepository.getById.mockRejectedValue(new Error('DB Connection Error'));

      // When: 進捗計算を実行
      const promise = useCase.execute(dto);

      // Then: エラーが適切に処理される
      await expect(promise).rejects.toThrow('DB Connection Error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero target value', async () => {
      // Given: 目標値が0のミッション
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'mission1'
      };

      const mission = new Mission({
        id: 'mission1',
        title: 'Zero Target Mission',
        type: 'count',
        targetValue: 0,
        xpReward: 50,
        difficulty: 'easy',
        isActive: true,
        description: '特殊ミッション',
        badgeId: null
      });

      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(1);

      // When: 進捗計算を実行
      const result = await useCase.execute(dto);

      // Then: 適切に処理される（ゼロ除算エラーを回避）
      expect(result.progress).toBe(1);
      expect(result.completionPercentage).toBe(Infinity); // または適切なデフォルト値
      expect(result.isCompleted).toBe(true);
    });

    it('should handle negative progress', async () => {
      // Given: 負の進捗値（異常ケース）
      const dto: CalculateMissionProgressDto = {
        userId: 'user1',
        missionId: 'mission1'
      };

      const mission = new Mission({
        id: 'mission1',
        title: 'Test Mission',
        type: 'count',
        targetValue: 10,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '10回実行',
        badgeId: null
      });

      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(-1);

      // When: 進捗計算を実行
      const result = await useCase.execute(dto);

      // Then: 適切に正規化される
      expect(result.progress).toBe(0); // 負の値は0にクリップ
      expect(result.completionPercentage).toBe(0);
      expect(result.isCompleted).toBe(false);
    });
  });
});