import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ProcessLevelUpUseCase } from '../ProcessLevelUpUseCase';
import { LevelUpService } from '../../../domain/services/LevelUpService';
import { IUserProfileRepository } from '../../../domain/repositories/IUserProfileRepository';
import { IGameNotificationRepository } from '../../../domain/repositories/IGameNotificationRepository';
import { UserProfile } from '../../../domain/entities/UserProfile';
import { UserId } from '../../../domain/valueObjects/UserId';
import { XPAmount } from '../../../domain/valueObjects/XPAmount';
import { Level } from '../../../domain/valueObjects/Level';
import { ProcessLevelUpDto } from '../../dtos/ProcessLevelUpDto';

describe('ProcessLevelUpUseCase', () => {
  let useCase: ProcessLevelUpUseCase;
  let mockLevelUpService: jest.Mocked<LevelUpService>;
  let mockUserProfileRepository: jest.Mocked<IUserProfileRepository>;
  let mockNotificationRepository: jest.Mocked<IGameNotificationRepository>;
  
  const validUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');

  beforeEach(() => {
    mockLevelUpService = {
      calculateLevel: jest.fn(),
      calculateXPToNextLevel: jest.fn(),
      calculateLevelUpRewards: jest.fn(),
      createLevelUpEvent: jest.fn(),
      validateXPLevelConsistency: jest.fn()
    } as jest.Mocked<LevelUpService>;

    mockUserProfileRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      exists: jest.fn()
    } as jest.Mocked<IUserProfileRepository>;

    mockNotificationRepository = {
      findByUserId: jest.fn(),
      findUnreadByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      markAsRead: jest.fn(),
      deleteOldNotifications: jest.fn()
    } as jest.Mocked<IGameNotificationRepository>;

    useCase = new ProcessLevelUpUseCase(
      mockLevelUpService,
      mockUserProfileRepository,
      mockNotificationRepository
    );
  });

  describe('TC046: レベルアップ処理成功', () => {
    it('レベル1から2へのレベルアップ処理', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      userProfile.addXP(new XPAmount(200)); // レベル2に必要なXP
      
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(2));
      mockLevelUpService.calculateLevelUpRewards.mockReturnValue({
        bonusXP: new XPAmount(50),
        unlockedFeatures: ['basic_customization'],
        specialReward: undefined
      });
      mockLevelUpService.createLevelUpEvent.mockReturnValue({
        id: 'event-123',
        eventType: 'LEVEL_UP',
        aggregateId: validUserId.getValue(),
        aggregateType: 'UserProfile',
        eventData: { oldLevel: 1, newLevel: 2 },
        occurredAt: new Date(),
        version: 1
      });

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 200
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.oldLevel).toBe(1);
        expect(result.value.newLevel).toBe(2);
        expect(result.value.leveledUp).toBe(true);
        expect(result.value.rewards.bonusXP).toBe(50);
        expect(result.value.rewards.unlockedFeatures).toContain('basic_customization');
      }
    });

    it('複数レベルアップの処理', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      userProfile.addXP(new XPAmount(1000)); // レベル4相当
      
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(4));
      mockLevelUpService.calculateLevelUpRewards.mockReturnValue({
        bonusXP: new XPAmount(200),
        unlockedFeatures: ['advanced_stats', 'custom_themes'],
        specialReward: undefined
      });
      mockLevelUpService.createLevelUpEvent.mockReturnValue({
        id: 'event-123',
        eventType: 'MULTIPLE_LEVEL_UP',
        aggregateId: validUserId.getValue(),
        aggregateType: 'UserProfile',
        eventData: { oldLevel: 1, newLevel: 4, levelsGained: 3 },
        occurredAt: new Date(),
        version: 1
      });

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 1000
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.newLevel).toBe(4);
        expect(result.value.levelsGained).toBe(3);
        expect(result.value.rewards.unlockedFeatures).toHaveLength(2);
      }
    });

    it('レベルアップなしの場合', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      userProfile.addXP(new XPAmount(100)); // レベル1のまま
      
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(1));

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 100
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.leveledUp).toBe(false);
        expect(result.value.oldLevel).toBe(1);
        expect(result.value.newLevel).toBe(1);
        expect(result.value.levelsGained).toBe(0);
      }
    });
  });

  describe('TC047: 最大レベル到達処理', () => {
    it('最大レベル到達時の特別報酬', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      userProfile.addXP(new XPAmount(505000)); // 最大レベル以上のXP
      
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(100));
      mockLevelUpService.calculateLevelUpRewards.mockReturnValue({
        bonusXP: new XPAmount(5000),
        unlockedFeatures: ['master_badge'],
        specialReward: '完全制覇の称号'
      });

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 505000
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.newLevel).toBe(100);
        expect(result.value.rewards.specialReward).toBe('完全制覇の称号');
        expect(result.value.isMaxLevelReached).toBe(true);
      }
    });
  });

  describe('TC048: 通知生成', () => {
    it('レベルアップ通知の正常生成', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      userProfile.addXP(new XPAmount(200));
      
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(2));
      mockLevelUpService.calculateLevelUpRewards.mockReturnValue({
        bonusXP: new XPAmount(50),
        unlockedFeatures: ['basic_customization'],
        specialReward: undefined
      });
      mockNotificationRepository.save.mockResolvedValue(undefined);

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 200
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      
      // 通知の内容を検証
      const saveCall = mockNotificationRepository.save.mock.calls[0][0];
      expect(saveCall.getType()).toBe('level_up');
      expect(saveCall.getTitle()).toBe('レベルアップ！');
      expect(saveCall.getMessage()).toContain('レベル2');
    });

    it('特別報酬付きレベルアップ通知', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(100));
      mockLevelUpService.calculateLevelUpRewards.mockReturnValue({
        bonusXP: new XPAmount(5000),
        unlockedFeatures: ['master_badge'],
        specialReward: '完全制覇の称号'
      });

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 505000
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      const saveCall = mockNotificationRepository.save.mock.calls[0][0];
      expect(saveCall.getMessage()).toContain('完全制覇の称号');
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないユーザーでエラー', async () => {
      // Arrange
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 200
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('ユーザープロファイルが見つかりません');
      }
    });

    it('無効なXP値でエラー', async () => {
      // Arrange
      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: -100
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('XPは0以上');
      }
    });

    it('無効なUserId形式でエラー', async () => {
      // Arrange
      const dto: ProcessLevelUpDto = {
        userId: 'invalid-uuid',
        newXPAmount: 200
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('UserIdはUUID形式');
      }
    });

    it('リポジトリ保存エラー', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(2));
      mockUserProfileRepository.save.mockRejectedValue(new Error('Save failed'));

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 200
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toBe('Save failed');
      }
    });

    it('通知保存エラー', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(2));
      mockLevelUpService.calculateLevelUpRewards.mockReturnValue({
        bonusXP: new XPAmount(50),
        unlockedFeatures: [],
        specialReward: undefined
      });
      mockNotificationRepository.save.mockRejectedValue(new Error('Notification save failed'));

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 200
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toBe('Notification save failed');
      }
    });
  });

  describe('XPとレベルの整合性検証', () => {
    it('整合性のあるXPとレベルで処理成功', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      userProfile.addXP(new XPAmount(300));
      
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(2));
      mockLevelUpService.validateXPLevelConsistency.mockReturnValue(true);

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 300
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
    });

    it('整合性のないXPとレベルで警告', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockLevelUpService.calculateLevel.mockReturnValue(new Level(5));
      mockLevelUpService.validateXPLevelConsistency.mockReturnValue(false);

      const dto: ProcessLevelUpDto = {
        userId: validUserId.getValue(),
        newXPAmount: 100 // レベル5には不足
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.warnings).toContain('XPとレベルの整合性に問題があります');
      }
    });
  });
});