import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { JoinChallengeUseCase } from '../JoinChallengeUseCase';
import { IChallengeRepository } from '../../../domain/repositories/IChallengeRepository';
import { IUserProfileRepository } from '../../../domain/repositories/IUserProfileRepository';
import { Challenge } from '../../../domain/entities/Challenge';
import { UserProfile } from '../../../domain/entities/UserProfile';
import { UserId } from '../../../domain/valueObjects/UserId';
import { ChallengeId } from '../../../domain/valueObjects/ChallengeId';
import { JoinChallengeDto } from '../../dtos/JoinChallengeDto';
import { 
  ChallengeNotFoundError,
  ChallengeNotActiveError,
  ChallengeFullError,
  DuplicateParticipationError 
} from '../../../shared/types/GamificationErrors';

describe('JoinChallengeUseCase', () => {
  let useCase: JoinChallengeUseCase;
  let mockChallengeRepository: jest.Mocked<IChallengeRepository>;
  let mockUserProfileRepository: jest.Mocked<IUserProfileRepository>;
  
  const validUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');
  const validChallengeId = new ChallengeId('550e8400-e29b-41d4-a716-446655440001');

  beforeEach(() => {
    mockChallengeRepository = {
      findById: jest.fn(),
      findActive: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findParticipants: jest.fn(),
      addParticipant: jest.fn(),
      removeParticipant: jest.fn()
    } as jest.Mocked<IChallengeRepository>;

    mockUserProfileRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      exists: jest.fn()
    } as jest.Mocked<IUserProfileRepository>;

    useCase = new JoinChallengeUseCase(mockChallengeRepository, mockUserProfileRepository);
  });

  describe('TC040: チャレンジ参加成功', () => {
    it('有効なチャレンジに正常参加', async () => {
      // Arrange
      const challenge = Challenge.create(
        'テストチャレンジ',
        '7日間連続実行',
        'easy',
        new Date('2025-08-30'),
        new Date('2025-09-06'),
        10 // 最大参加者数
      );
      const userProfile = UserProfile.create(validUserId);
      
      mockChallengeRepository.findById.mockResolvedValue(challenge);
      mockUserProfileRepository.findByUserId.mockResolvedValue(userProfile);
      mockChallengeRepository.findParticipants.mockResolvedValue([]);
      mockChallengeRepository.addParticipant.mockResolvedValue(undefined);

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.challengeId).toBe(validChallengeId.getValue());
        expect(result.value.userId).toBe(validUserId.getValue());
        expect(result.value.joinedAt).toBeInstanceOf(Date);
      }
      expect(mockChallengeRepository.addParticipant).toHaveBeenCalledWith(validChallengeId, validUserId);
    });

    it('参加者数が上限未満のチャレンジへの参加', async () => {
      // Arrange
      const challenge = Challenge.create(
        'テストチャレンジ',
        '説明',
        'normal',
        new Date('2025-08-30'),
        new Date('2025-09-06'),
        5
      );
      
      const existingParticipants = [
        new UserId('550e8400-e29b-41d4-a716-446655440002'),
        new UserId('550e8400-e29b-41d4-a716-446655440003')
      ]; // 2人参加済み（5人まで参加可能）
      
      mockChallengeRepository.findById.mockResolvedValue(challenge);
      mockUserProfileRepository.findByUserId.mockResolvedValue(UserProfile.create(validUserId));
      mockChallengeRepository.findParticipants.mockResolvedValue(existingParticipants);

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
    });
  });

  describe('TC041: チャレンジ参加エラーケース', () => {
    it('存在しないチャレンジへの参加でエラー', async () => {
      // Arrange
      mockChallengeRepository.findById.mockResolvedValue(null);

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(ChallengeNotFoundError);
      }
    });

    it('非アクティブなチャレンジへの参加でエラー', async () => {
      // Arrange
      const inactiveChallenge = Challenge.create(
        'テストチャレンジ',
        '説明',
        'easy',
        new Date('2025-07-01'), // 過去の日付
        new Date('2025-07-07'), // 終了済み
        10
      );
      
      mockChallengeRepository.findById.mockResolvedValue(inactiveChallenge);

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(ChallengeNotActiveError);
      }
    });

    it('定員に達したチャレンジへの参加でエラー', async () => {
      // Arrange
      const fullChallenge = Challenge.create(
        'テストチャレンジ',
        '説明',
        'easy',
        new Date('2025-08-30'),
        new Date('2025-09-06'),
        2 // 最大2名
      );
      
      const fullParticipants = [
        new UserId('550e8400-e29b-41d4-a716-446655440002'),
        new UserId('550e8400-e29b-41d4-a716-446655440003')
      ]; // 既に2名参加済み
      
      mockChallengeRepository.findById.mockResolvedValue(fullChallenge);
      mockChallengeRepository.findParticipants.mockResolvedValue(fullParticipants);

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(ChallengeFullError);
      }
    });

    it('既に参加済みのチャレンジへの重複参加でエラー', async () => {
      // Arrange
      const challenge = Challenge.create(
        'テストチャレンジ',
        '説明',
        'easy',
        new Date('2025-08-30'),
        new Date('2025-09-06'),
        10
      );
      
      const participants = [validUserId]; // 既に参加済み
      
      mockChallengeRepository.findById.mockResolvedValue(challenge);
      mockChallengeRepository.findParticipants.mockResolvedValue(participants);

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error).toBeInstanceOf(DuplicateParticipationError);
      }
    });

    it('存在しないユーザープロファイルでエラー', async () => {
      // Arrange
      const challenge = Challenge.create(
        'テストチャレンジ',
        '説明',
        'easy',
        new Date('2025-08-30'),
        new Date('2025-09-06'),
        10
      );
      
      mockChallengeRepository.findById.mockResolvedValue(challenge);
      mockUserProfileRepository.findByUserId.mockResolvedValue(null);

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('ユーザープロファイルが見つかりません');
      }
    });
  });

  describe('バリデーション', () => {
    it('無効なUserId形式でエラー', async () => {
      // Arrange
      const dto: JoinChallengeDto = {
        userId: 'invalid-uuid',
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('UserIdはUUID形式');
      }
    });

    it('無効なChallengeId形式でエラー', async () => {
      // Arrange
      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: 'invalid-uuid'
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('ChallengeIdはUUID形式');
      }
    });

    it('空のUserIdでエラー', async () => {
      // Arrange
      const dto: JoinChallengeDto = {
        userId: '',
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('UserIdは空にできません');
      }
    });
  });

  describe('リポジトリエラーハンドリング', () => {
    it('チャレンジリポジトリエラーの処理', async () => {
      // Arrange
      mockChallengeRepository.findById.mockRejectedValue(new Error('Database connection failed'));

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });

    it('参加者追加時のリポジトリエラー', async () => {
      // Arrange
      const challenge = Challenge.create(
        'テストチャレンジ',
        '説明',
        'easy',
        new Date('2025-08-30'),
        new Date('2025-09-06'),
        10
      );
      
      mockChallengeRepository.findById.mockResolvedValue(challenge);
      mockUserProfileRepository.findByUserId.mockResolvedValue(UserProfile.create(validUserId));
      mockChallengeRepository.findParticipants.mockResolvedValue([]);
      mockChallengeRepository.addParticipant.mockRejectedValue(new Error('Failed to add participant'));

      const dto: JoinChallengeDto = {
        userId: validUserId.getValue(),
        challengeId: validChallengeId.getValue()
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toBe('Failed to add participant');
      }
    });
  });
});