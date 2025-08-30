import { describe, it, expect, beforeEach } from '@jest/globals';

import { InvalidNotificationTypeError } from '../../../shared/types/GamificationErrors';
import { UserId } from '../../valueObjects/UserId';
import { GameNotification } from '../GameNotification';

describe('GameNotification', () => {
  const validUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');
  const testDate = new Date('2025-08-30T00:00:00Z');

  describe('インスタンス作成テスト', () => {
    it('TC023: 通知インスタンス正常作成', () => {
      // Act
      const notification = new GameNotification(
        validUserId,
        'level_up',
        'レベルアップ！',
        'レベル2になりました！',
        '{"newLevel": 2}',
        testDate
      );

      // Assert
      expect(notification.getUserId()).toBe(validUserId);
      expect(notification.getType()).toBe('level_up');
      expect(notification.getTitle()).toBe('レベルアップ！');
      expect(notification.getMessage()).toBe('レベル2になりました！');
      expect(notification.getData()).toBe('{"newLevel": 2}');
      expect(notification.getIsRead()).toBe(false);
      expect(notification.getCreatedAt()).toBe(testDate);
    });

    it('データなしでの通知作成', () => {
      // Act
      const notification = new GameNotification(
        validUserId,
        'badge_unlocked',
        'バッジ獲得！',
        '新しいバッジを獲得しました'
      );

      // Assert
      expect(notification.getData()).toBeUndefined();
      expect(notification.getIsRead()).toBe(false);
    });

    it('全ての通知タイプでのインスタンス作成', () => {
      const validTypes = ['level_up', 'badge_unlocked', 'mission_completed', 'challenge_completed', 'streak_milestone', 'xp_milestone'] as const;

      validTypes.forEach(type => {
        // Act
        const notification = new GameNotification(
          validUserId,
          type,
          'テストタイトル',
          'テストメッセージ'
        );

        // Assert
        expect(notification.getType()).toBe(type);
      });
    });
  });

  describe('更新メソッドテスト', () => {
    let notification: GameNotification;

    beforeEach(() => {
      notification = new GameNotification(
        validUserId,
        'level_up',
        'レベルアップ！',
        'レベル2になりました！'
      );
    });

    it('TC024: 通知既読処理', () => {
      // Act
      notification.markAsRead();

      // Assert
      expect(notification.getIsRead()).toBe(true);
    });

    it('既に既読の通知を再度既読にしても問題ない', () => {
      // Arrange
      notification.markAsRead();
      expect(notification.getIsRead()).toBe(true);

      // Act
      notification.markAsRead();

      // Assert
      expect(notification.getIsRead()).toBe(true);
    });
  });

  describe('バリデーションテスト', () => {
    it('無効な通知タイプでの作成拒否', () => {
      // Act & Assert
      expect(() => new GameNotification(
        validUserId,
        'invalid_type' as any,
        'タイトル',
        'メッセージ'
      )).toThrow(InvalidNotificationTypeError);
    });

    it('空のタイトルでの作成拒否', () => {
      // Act & Assert
      expect(() => new GameNotification(
        validUserId,
        'level_up',
        '',
        'メッセージ'
      )).toThrow('タイトルは空にできません');
    });

    it('空のメッセージでの作成拒否', () => {
      // Act & Assert
      expect(() => new GameNotification(
        validUserId,
        'level_up',
        'タイトル',
        ''
      )).toThrow('メッセージは空にできません');
    });

    it('nullタイトルでの作成拒否', () => {
      // Act & Assert
      expect(() => new GameNotification(
        validUserId,
        'level_up',
        null as any,
        'メッセージ'
      )).toThrow('タイトルは空にできません');
    });

    it('undefinedメッセージでの作成拒否', () => {
      // Act & Assert
      expect(() => new GameNotification(
        validUserId,
        'level_up',
        'タイトル',
        undefined as any
      )).toThrow('メッセージは空にできません');
    });
  });

  describe('比較・判定メソッド', () => {
    it('equals()で同じIDの通知を正しく比較する', () => {
      // Arrange
      const notification1 = GameNotification.create(validUserId, 'level_up', 'タイトル1', 'メッセージ1');
      const notification2 = GameNotification.create(validUserId, 'badge_unlocked', 'タイトル2', 'メッセージ2');
      
      // 同じIDを強制的に設定（テストのため）
      Object.defineProperty(notification2, 'id', {
        value: notification1.getId(),
        writable: false
      });

      // Act & Assert
      expect(notification1.equals(notification2)).toBe(true);
    });

    it('belongsToUser()でユーザー所有を正しく判定する', () => {
      // Arrange
      const notification = GameNotification.create(validUserId, 'level_up', 'タイトル', 'メッセージ');
      const otherUserId = new UserId('550e8400-e29b-41d4-a716-446655440999');

      // Act & Assert
      expect(notification.belongsToUser(validUserId)).toBe(true);
      expect(notification.belongsToUser(otherUserId)).toBe(false);
    });

    it('isUnread()で未読判定ができる', () => {
      // Arrange
      const notification = GameNotification.create(validUserId, 'level_up', 'タイトル', 'メッセージ');

      // Act & Assert
      expect(notification.isUnread()).toBe(true);
      
      notification.markAsRead();
      expect(notification.isUnread()).toBe(false);
    });
  });

  describe('永続化メソッド', () => {
    it('toPersistence()で適切な形式に変換する', () => {
      // Arrange
      const notification = new GameNotification(
        validUserId,
        'level_up',
        'タイトル',
        'メッセージ',
        '{"data": "test"}',
        testDate
      );

      // Act
      const persistence = notification.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: notification.getId().getValue(),
        userId: validUserId.getValue(),
        type: 'level_up',
        title: 'タイトル',
        message: 'メッセージ',
        data: '{"data": "test"}',
        isRead: false,
        createdAt: testDate
      });
    });

    it('fromPersistence()で適切にインスタンス化する', () => {
      // Arrange
      const persistenceData = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        userId: validUserId.getValue(),
        type: 'badge_unlocked' as const,
        title: 'バッジ獲得',
        message: 'テストバッジを獲得しました',
        data: '{"badgeId": "123"}',
        isRead: true,
        createdAt: testDate
      };

      // Act
      const notification = GameNotification.fromPersistence(persistenceData);

      // Assert
      expect(notification.getId().getValue()).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(notification.getUserId().getValue()).toBe(validUserId.getValue());
      expect(notification.getType()).toBe('badge_unlocked');
      expect(notification.getTitle()).toBe('バッジ獲得');
      expect(notification.getMessage()).toBe('テストバッジを獲得しました');
      expect(notification.getData()).toBe('{"badgeId": "123"}');
      expect(notification.getIsRead()).toBe(true);
      expect(notification.getCreatedAt()).toBe(testDate);
    });
  });
});