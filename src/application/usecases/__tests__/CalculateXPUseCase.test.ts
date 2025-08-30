import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { UserProfile } from '../../../domain/entities/UserProfile';
import { IUserProfileRepository } from '../../../domain/repositories/IUserProfileRepository';
import { XPCalculationService } from '../../../domain/services/XPCalculationService';
import { UserId } from '../../../domain/valueObjects/UserId';
import { XPAmount } from '../../../domain/valueObjects/XPAmount';
import { CalculateXPDto } from '../../dtos/CalculateXPDto';
import { CalculateXPUseCase } from '../CalculateXPUseCase';

describe('CalculateXPUseCase', () => {
  let useCase: CalculateXPUseCase;
  let mockXPService: jest.Mocked<XPCalculationService>;
  let mockUserProfileRepository: jest.Mocked<IUserProfileRepository>;
  
  const validUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');

  beforeEach(() => {
    mockXPService = {
      calculateRoutineCompletionXP: jest.fn(),
      calculateBadgeXP: jest.fn(),
      calculateChallengeCompletionXP: jest.fn(),
      calculateMissionCompletionXP: jest.fn(),
      applyFirstTimeBonus: jest.fn(),
      applyPerfectWeekBonus: jest.fn(),
      validateXPSource: jest.fn()
    } as jest.Mocked<XPCalculationService>;

    mockUserProfileRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      exists: jest.fn()
    } as jest.Mocked<IUserProfileRepository>;

    useCase = new CalculateXPUseCase(mockXPService, mockUserProfileRepository);
  });

  describe('TC042: ルーティン完了XP計算', () => {
    it('基本ルーティン完了XPの正常計算', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateRoutineCompletionXP.mockReturnValue(new XPAmount(10));
      mockXPService.validateXPSource.mockImplementation(() => {});

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'routine',
        sourceId: 'routine-123',
        streakCount: 1
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(10);
        expect(result.value.source).toBe('routine');
        expect(result.value.bonusApplied).toBe(false);
      }
      expect(mockXPService.calculateRoutineCompletionXP).toHaveBeenCalledWith('routine', 1);
    });

    it('連続実行ボーナス付きXP計算', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateRoutineCompletionXP.mockReturnValue(new XPAmount(25));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'routine',
        sourceId: 'routine-123',
        streakCount: 15 // 高い連続実行数
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(25);
        expect(result.value.streakBonus).toBe(15);
      }
    });
  });

  describe('TC043: バッジ獲得XP計算', () => {
    it('ゴールドバッジ獲得XP計算', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateBadgeXP.mockReturnValue(new XPAmount(100));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'badge',
        sourceId: 'badge-gold-001',
        badgeRank: 'gold'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(100);
        expect(result.value.source).toBe('badge');
        expect(result.value.badgeRank).toBe('gold');
      }
    });

    it('プラチナバッジ獲得XP計算', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateBadgeXP.mockReturnValue(new XPAmount(200));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'badge',
        sourceId: 'badge-platinum-001',
        badgeRank: 'platinum'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(200);
      }
    });
  });

  describe('TC044: チャレンジ完了XP計算', () => {
    it('ハードチャレンジ完了XP計算', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateChallengeCompletionXP.mockReturnValue(new XPAmount(100));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'challenge',
        sourceId: 'challenge-hard-001',
        challengeDifficulty: 'hard'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(100);
        expect(result.value.challengeDifficulty).toBe('hard');
      }
    });
  });

  describe('TC045: ミッション完了XP計算', () => {
    it('ウィークリーミッション完了XP計算', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateMissionCompletionXP.mockReturnValue(new XPAmount(100));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'mission',
        sourceId: 'mission-weekly-001',
        missionType: 'weekly'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(100);
        expect(result.value.missionType).toBe('weekly');
      }
    });

    it('マンスリーミッション完了XP計算', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateMissionCompletionXP.mockReturnValue(new XPAmount(500));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'mission',
        sourceId: 'mission-monthly-001',
        missionType: 'monthly'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(500);
      }
    });
  });

  describe('ボーナス適用', () => {
    it('初回完了ボーナスの適用', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateRoutineCompletionXP.mockReturnValue(new XPAmount(10));
      mockXPService.applyFirstTimeBonus.mockReturnValue(new XPAmount(20));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'routine',
        sourceId: 'routine-123',
        isFirstTime: true
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(20);
        expect(result.value.bonusApplied).toBe(true);
        expect(result.value.bonusType).toBe('first_time');
      }
    });

    it('パーフェクトウィークボーナスの適用', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateRoutineCompletionXP.mockReturnValue(new XPAmount(100));
      mockXPService.applyPerfectWeekBonus.mockReturnValue(new XPAmount(150));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'routine',
        sourceId: 'routine-123',
        isPerfectWeek: true
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.calculatedXP).toBe(150);
        expect(result.value.bonusType).toBe('perfect_week');
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('存在しないユーザーでエラー', async () => {
      // Arrange
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'routine',
        sourceId: 'routine-123'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('ユーザープロファイルが見つかりません');
      }
    });

    it('無効なXPソースでエラー', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.validateXPSource.mockImplementation(() => {
        throw new Error('無効なXPソースです');
      });

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'invalid' as any,
        sourceId: 'invalid-123'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toBe('無効なXPソースです');
      }
    });

    it('無効なUserId形式でエラー', async () => {
      // Arrange
      const dto: CalculateXPDto = {
        userId: 'invalid-uuid',
        source: 'routine',
        sourceId: 'routine-123'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('UserIdはUUID形式');
      }
    });

    it('リポジトリエラーの処理', async () => {
      // Arrange
      mockUserProfileRepository.findByUserId.mockRejectedValue(new Error('Database error'));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'routine',
        sourceId: 'routine-123'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toBe('Database error');
      }
    });
  });

  describe('詳細な計算結果', () => {
    it('計算結果に詳細情報を含む', async () => {
      // Arrange
      const userProfile = UserProfile.create(validUserId);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockXPService.calculateRoutineCompletionXP.mockReturnValue(new XPAmount(15));

      const dto: CalculateXPDto = {
        userId: validUserId.getValue(),
        source: 'routine',
        sourceId: 'routine-123',
        streakCount: 5,
        metadata: {
          routineName: 'Morning Exercise',
          category: 'Health'
        }
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.sourceId).toBe('routine-123');
        expect(result.value.calculatedAt).toBeInstanceOf(Date);
        expect(result.value.metadata).toEqual({
          routineName: 'Morning Exercise',
          category: 'Health'
        });
      }
    });
  });
});