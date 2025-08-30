import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { GameNotification } from '../../../domain/entities/GameNotification';
import { IGameNotificationRepository } from '../../../domain/repositories/IGameNotificationRepository';
import { UserId } from '../../../domain/valueObjects/UserId';
import { NotificationNotFoundError } from '../../../shared/types/GamificationErrors';
import { GetGameNotificationsDto } from '../../dtos/GetGameNotificationsDto';
import { GetGameNotificationsUseCase } from '../GetGameNotificationsUseCase';

describe('GetGameNotificationsUseCase', () => {
  let useCase: GetGameNotificationsUseCase;
  let mockRepository: jest.Mocked<IGameNotificationRepository>;
  const validUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');

  beforeEach(() => {
    mockRepository = {
      findByUserId: jest.fn(),
      findUnreadByUserId: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      markAsRead: jest.fn(),
      deleteOldNotifications: jest.fn()
    } as jest.Mocked<IGameNotificationRepository>;

    useCase = new GetGameNotificationsUseCase(mockRepository);
  });

  describe('TC036: 全通知取得', () => {
    it('ユーザーの全通知を正常に取得', async () => {
      // Arrange
      const notifications = [
        GameNotification.create(validUserId, 'level_up', 'レベルアップ', 'レベル2になりました'),
        GameNotification.create(validUserId, 'badge_unlocked', 'バッジ獲得', 'はじめの一歩バッジ獲得')
      ];
      mockRepository.findByUserId.mockResolvedValue(notifications);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true,
        limit: 10
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.notifications).toHaveLength(2);
        expect(result.value.notifications[0].type).toBe('level_up');
        expect(result.value.notifications[1].type).toBe('badge_unlocked');
      }
    });

    it('空の通知リストを正常に取得', async () => {
      // Arrange
      mockRepository.findByUserId.mockResolvedValue([]);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true,
        limit: 10
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.notifications).toHaveLength(0);
        expect(result.value.totalCount).toBe(0);
      }
    });
  });

  describe('TC037: 未読通知のみ取得', () => {
    it('未読通知のみを正常に取得', async () => {
      // Arrange
      const unreadNotifications = [
        GameNotification.create(validUserId, 'level_up', 'レベルアップ', 'レベル3になりました')
      ];
      mockRepository.findUnreadByUserId.mockResolvedValue(unreadNotifications);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: false,
        limit: 10
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.notifications).toHaveLength(1);
        expect(result.value.notifications[0].isRead).toBe(false);
      }
      expect(mockRepository.findUnreadByUserId).toHaveBeenCalledWith(validUserId, 10, 0);
    });

    it('未読通知が存在しない場合', async () => {
      // Arrange
      mockRepository.findUnreadByUserId.mockResolvedValue([]);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: false,
        limit: 10
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.notifications).toHaveLength(0);
        expect(result.value.hasUnread).toBe(false);
      }
    });
  });

  describe('TC038: ページネーション機能', () => {
    it('ページネーションで正しく取得', async () => {
      // Arrange
      const notifications = Array.from({ length: 5 }, (_, i) => 
        GameNotification.create(validUserId, 'level_up', `通知${i+1}`, `メッセージ${i+1}`)
      );
      mockRepository.findByUserId.mockResolvedValue(notifications);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true,
        limit: 3,
        offset: 2
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.notifications).toHaveLength(5);
      }
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(validUserId, 3, 2, true);
    });

    it('limit未指定時のデフォルト値適用', async () => {
      // Arrange
      mockRepository.findByUserId.mockResolvedValue([]);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true
      };

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockRepository.findByUserId).toHaveBeenCalledWith(validUserId, 20, 0, true);
    });
  });

  describe('TC039: 通知タイプフィルタリング', () => {
    it('特定の通知タイプのみ取得', async () => {
      // Arrange
      const levelUpNotifications = [
        GameNotification.create(validUserId, 'level_up', 'レベルアップ1', 'メッセージ1'),
        GameNotification.create(validUserId, 'level_up', 'レベルアップ2', 'メッセージ2')
      ];
      mockRepository.findByUserId.mockResolvedValue(levelUpNotifications);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true,
        typeFilter: ['level_up']
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        result.value.notifications.forEach(notification => {
          expect(notification.type).toBe('level_up');
        });
      }
    });

    it('複数の通知タイプでフィルタリング', async () => {
      // Arrange
      const notifications = [
        GameNotification.create(validUserId, 'level_up', 'レベルアップ', 'メッセージ1'),
        GameNotification.create(validUserId, 'badge_unlocked', 'バッジ獲得', 'メッセージ2')
      ];
      mockRepository.findByUserId.mockResolvedValue(notifications);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true,
        typeFilter: ['level_up', 'badge_unlocked']
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.notifications).toHaveLength(2);
        expect(['level_up', 'badge_unlocked']).toContain(result.value.notifications[0].type);
        expect(['level_up', 'badge_unlocked']).toContain(result.value.notifications[1].type);
      }
    });
  });

  describe('エラーハンドリング', () => {
    it('無効なUserIdでエラー', async () => {
      // Arrange
      const dto: GetGameNotificationsDto = {
        userId: 'invalid-uuid',
        includeRead: true
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('UserIdはUUID形式');
      }
    });

    it('リポジトリエラーでエラー', async () => {
      // Arrange
      mockRepository.findByUserId.mockRejectedValue(new Error('Database connection failed'));

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toBe('Database connection failed');
      }
    });

    it('無効なlimit値でエラー', async () => {
      // Arrange
      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true,
        limit: -1
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('limit は1以上');
      }
    });

    it('無効なoffset値でエラー', async () => {
      // Arrange
      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true,
        offset: -1
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(false);
      if (result.isFailure) {
        expect(result.error.message).toContain('offset は0以上');
      }
    });
  });

  describe('統計情報計算', () => {
    it('通知統計の正確な計算', async () => {
      // Arrange
      const notifications = [
        GameNotification.create(validUserId, 'level_up', 'レベルアップ', 'メッセージ1'),
        GameNotification.create(validUserId, 'badge_unlocked', 'バッジ獲得', 'メッセージ2')
      ];
      notifications[0].markAsRead(); // 1つを既読にする
      
      mockRepository.findByUserId.mockResolvedValue(notifications);

      const dto: GetGameNotificationsDto = {
        userId: validUserId.getValue(),
        includeRead: true
      };

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(result.isSuccess).toBe(true);
      if (result.isSuccess) {
        expect(result.value.totalCount).toBe(2);
        expect(result.value.unreadCount).toBe(1);
        expect(result.value.hasUnread).toBe(true);
      }
    });
  });
});