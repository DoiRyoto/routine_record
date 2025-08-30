import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { UpdateMissionProgressUseCase } from '../UpdateMissionProgressUseCase';
import { UpdateMissionProgressDto } from '../../dtos';
import { IUserMissionRepository } from '../../../domain/repositories/IUserMissionRepository';
import { IMissionRepository } from '../../../domain/repositories/IMissionRepository';
import { IUserProfileRepository } from '../../../domain/repositories/IUserProfileRepository';
import { IUserBadgeRepository } from '../../../domain/repositories/IUserBadgeRepository';
import { IGameNotificationRepository } from '../../../domain/repositories/IGameNotificationRepository';
import { MissionProgressCalculationService } from '../../../domain/services/MissionProgressCalculationService';
import { ProcessLevelUpUseCase } from '../ProcessLevelUpUseCase';
import { Mission } from '../../../domain/entities/Mission';
import { UserMission } from '../../../domain/entities/UserMission';
import { UserProfile } from '../../../domain/entities/UserProfile';

describe('UpdateMissionProgressUseCase', () => {
  let useCase: UpdateMissionProgressUseCase;
  let mockUserMissionRepository: jest.Mocked<IUserMissionRepository>;
  let mockMissionRepository: jest.Mocked<IMissionRepository>;
  let mockUserProfileRepository: jest.Mocked<IUserProfileRepository>;
  let mockUserBadgeRepository: jest.Mocked<IUserBadgeRepository>;
  let mockGameNotificationRepository: jest.Mocked<IGameNotificationRepository>;
  let mockMissionProgressService: jest.Mocked<MissionProgressCalculationService>;
  let mockProcessLevelUpUseCase: jest.Mocked<ProcessLevelUpUseCase>;

  beforeEach(() => {
    mockUserMissionRepository = {
      getByUserId: jest.fn(),
      getById: jest.fn(),
      getByUserAndMission: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      getActiveUserMissions: jest.fn(),
      markAsCompleted: jest.fn(),
    } as jest.Mocked<IUserMissionRepository>;

    mockMissionRepository = {
      getById: jest.fn(),
      getAll: jest.fn(),
      getActiveByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as jest.Mocked<IMissionRepository>;

    mockUserProfileRepository = {
      getByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      addXP: jest.fn(),
    } as jest.Mocked<IUserProfileRepository>;

    mockUserBadgeRepository = {
      getUserBadges: jest.fn(),
      create: jest.fn(),
      awardBadge: jest.fn(),
    } as jest.Mocked<IUserBadgeRepository>;

    mockGameNotificationRepository = {
      getByUserId: jest.fn(),
      create: jest.fn(),
      markAsRead: jest.fn(),
    } as jest.Mocked<IGameNotificationRepository>;

    mockMissionProgressService = {
      calculateProgress: jest.fn(),
      calculateStreakProgress: jest.fn(),
      calculateCountProgress: jest.fn(),
      calculateVarietyProgress: jest.fn(),
      calculateConsistencyProgress: jest.fn(),
    } as jest.Mocked<MissionProgressCalculationService>;

    mockProcessLevelUpUseCase = {
      execute: jest.fn(),
    } as jest.Mocked<ProcessLevelUpUseCase>;

    useCase = new UpdateMissionProgressUseCase(
      mockUserMissionRepository,
      mockMissionRepository,
      mockUserProfileRepository,
      mockUserBadgeRepository,
      mockGameNotificationRepository,
      mockMissionProgressService,
      mockProcessLevelUpUseCase
    );
  });

  describe('Auto Progress Update', () => {
    it('should update all active mission progress when execution record created', async () => {
      // Given: ユーザーが3つのアクティブなミッションを持つ
      const dto: UpdateMissionProgressDto = {
        userId: 'user1',
        executionRecordId: 'exec1'
      };

      const activeMissions = [
        new Mission({
          id: 'm1',
          title: 'Streak Mission',
          type: 'streak',
          targetValue: 5,
          xpReward: 100,
          difficulty: 'medium',
          isActive: true,
          description: '5日連続',
          badgeId: null
        }),
        new Mission({
          id: 'm2',
          title: 'Count Mission',
          type: 'count',
          targetValue: 10,
          xpReward: 150,
          difficulty: 'medium',
          isActive: true,
          description: '10回実行',
          badgeId: null
        }),
        new Mission({
          id: 'm3',
          title: 'Variety Mission',
          type: 'variety',
          targetValue: 3,
          xpReward: 200,
          difficulty: 'medium',
          isActive: true,
          description: '3つのカテゴリ',
          badgeId: null
        })
      ];

      const userMissions = activeMissions.map((mission, index) => 
        new UserMission({
          id: `um${index + 1}`,
          userId: 'user1',
          missionId: mission.id,
          progress: 0,
          isCompleted: false,
          startedAt: new Date(),
          completedAt: null,
          claimedAt: null
        })
      );

      mockUserMissionRepository.getActiveUserMissions.mockResolvedValue(userMissions);
      mockMissionRepository.getById.mockImplementation(async (id) => 
        activeMissions.find(m => m.id === id) || null
      );
      mockMissionProgressService.calculateProgress.mockResolvedValue(1);
      mockUserMissionRepository.update.mockResolvedValue();

      // When: 進捗更新を実行
      const result = await useCase.execute(dto);

      // Then: 全てのアクティブミッション進捗が更新される
      expect(mockUserMissionRepository.getActiveUserMissions).toHaveBeenCalledWith('user1');
      expect(mockMissionProgressService.calculateProgress).toHaveBeenCalledTimes(3);
      expect(mockUserMissionRepository.update).toHaveBeenCalledTimes(3);
      expect(result.updatedMissions).toHaveLength(3);
    });

    it('should complete mission when target is reached', async () => {
      // Given: あと1回で完了するミッション
      const dto: UpdateMissionProgressDto = {
        userId: 'user1',
        executionRecordId: 'exec1'
      };

      const mission = new Mission({
        id: 'm1',
        title: 'Count Mission',
        type: 'count',
        targetValue: 5,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '5回実行',
        badgeId: 'badge1'
      });

      const userMission = new UserMission({
        id: 'um1',
        userId: 'user1',
        missionId: 'm1',
        progress: 4,
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null,
        claimedAt: null
      });

      const userProfile = new UserProfile({
        id: 'up1',
        userId: 'user1',
        displayName: 'Test User',
        level: 1,
        totalXP: 50,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockUserMissionRepository.getActiveUserMissions.mockResolvedValue([userMission]);
      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(5); // 目標達成
      mockUserProfileRepository.getByUserId.mockResolvedValue(userProfile);
      mockUserMissionRepository.markAsCompleted.mockResolvedValue();
      mockUserProfileRepository.addXP.mockResolvedValue();
      mockUserBadgeRepository.awardBadge.mockResolvedValue();
      mockGameNotificationRepository.create.mockResolvedValue();
      mockProcessLevelUpUseCase.execute.mockResolvedValue({ leveledUp: false, newLevel: 1 });

      // When: 進捗更新を実行
      const result = await useCase.execute(dto);

      // Then: ミッションが完了し、報酬が付与される
      expect(mockUserMissionRepository.markAsCompleted).toHaveBeenCalledWith('um1');
      expect(mockUserProfileRepository.addXP).toHaveBeenCalledWith('user1', 100);
      expect(mockUserBadgeRepository.awardBadge).toHaveBeenCalledWith('user1', 'badge1');
      expect(mockGameNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user1',
          type: 'mission_completed'
        })
      );
      expect(mockProcessLevelUpUseCase.execute).toHaveBeenCalledWith({ userId: 'user1' });
    });

    it('should trigger level up process when XP granted', async () => {
      // Given: レベルアップ閾値に近いユーザー
      const dto: UpdateMissionProgressDto = {
        userId: 'user1',
        executionRecordId: 'exec1'
      };

      const mission = new Mission({
        id: 'm1',
        title: 'Mission',
        type: 'count',
        targetValue: 1,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '1回実行',
        badgeId: null
      });

      const userMission = new UserMission({
        id: 'um1',
        userId: 'user1',
        missionId: 'm1',
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null,
        claimedAt: null
      });

      const userProfile = new UserProfile({
        id: 'up1',
        userId: 'user1',
        displayName: 'Test User',
        level: 1,
        totalXP: 950, // レベル2は1000XP
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockUserMissionRepository.getActiveUserMissions.mockResolvedValue([userMission]);
      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(1);
      mockUserProfileRepository.getByUserId.mockResolvedValue(userProfile);
      mockUserMissionRepository.markAsCompleted.mockResolvedValue();
      mockUserProfileRepository.addXP.mockResolvedValue();
      mockGameNotificationRepository.create.mockResolvedValue();
      mockProcessLevelUpUseCase.execute.mockResolvedValue({ leveledUp: true, newLevel: 2 });

      // When: ミッション完了でXP付与
      await useCase.execute(dto);

      // Then: レベルアップ処理が実行される
      expect(mockProcessLevelUpUseCase.execute).toHaveBeenCalledWith({ userId: 'user1' });
    });
  });

  describe('Error Handling', () => {
    it('should rollback if mission progress update fails', async () => {
      // Given: 進捗更新でエラーが発生する設定
      const dto: UpdateMissionProgressDto = {
        userId: 'user1',
        executionRecordId: 'exec1'
      };

      const userMission = new UserMission({
        id: 'um1',
        userId: 'user1',
        missionId: 'm1',
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null,
        claimedAt: null
      });

      mockUserMissionRepository.getActiveUserMissions.mockResolvedValue([userMission]);
      mockMissionRepository.getById.mockRejectedValue(new Error('DB Error'));

      // When: 進捗更新を試行
      const promise = useCase.execute(dto);

      // Then: 適切なエラーが発生
      await expect(promise).rejects.toThrow('DB Error');
    });

    it('should handle missing mission gracefully', async () => {
      // Given: 存在しないミッション
      const dto: UpdateMissionProgressDto = {
        userId: 'user1',
        executionRecordId: 'exec1'
      };

      const userMission = new UserMission({
        id: 'um1',
        userId: 'user1',
        missionId: 'nonexistent',
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null,
        claimedAt: null
      });

      mockUserMissionRepository.getActiveUserMissions.mockResolvedValue([userMission]);
      mockMissionRepository.getById.mockResolvedValue(null);

      // When: 進捗更新を実行
      const promise = useCase.execute(dto);

      // Then: 適切なエラーが発生
      await expect(promise).rejects.toThrow('Mission not found: nonexistent');
    });

    it('should handle reward granting failures', async () => {
      // Given: 報酬付与でエラーが発生
      const dto: UpdateMissionProgressDto = {
        userId: 'user1',
        executionRecordId: 'exec1'
      };

      const mission = new Mission({
        id: 'm1',
        title: 'Mission',
        type: 'count',
        targetValue: 1,
        xpReward: 100,
        difficulty: 'medium',
        isActive: true,
        description: '1回実行',
        badgeId: 'badge1'
      });

      const userMission = new UserMission({
        id: 'um1',
        userId: 'user1',
        missionId: 'm1',
        progress: 0,
        isCompleted: false,
        startedAt: new Date(),
        completedAt: null,
        claimedAt: null
      });

      const userProfile = new UserProfile({
        id: 'up1',
        userId: 'user1',
        displayName: 'Test User',
        level: 1,
        totalXP: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      mockUserMissionRepository.getActiveUserMissions.mockResolvedValue([userMission]);
      mockMissionRepository.getById.mockResolvedValue(mission);
      mockMissionProgressService.calculateProgress.mockResolvedValue(1);
      mockUserProfileRepository.getByUserId.mockResolvedValue(userProfile);
      mockUserMissionRepository.markAsCompleted.mockResolvedValue();
      mockUserProfileRepository.addXP.mockRejectedValue(new Error('XP Error'));

      // When: 進捗更新を実行
      const promise = useCase.execute(dto);

      // Then: エラーが適切に処理される
      await expect(promise).rejects.toThrow('XP Error');
    });
  });
});