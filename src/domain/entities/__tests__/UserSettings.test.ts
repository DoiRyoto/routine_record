import { describe, it, expect, beforeEach } from '@jest/globals';

import {
  UserSettingsInvalidThemeError,
  UserSettingsInvalidLanguageError,
  UserSettingsInvalidTimeFormatError
} from '../../../shared/types/UserSettingsErrors';
import { UserId } from '../../valueObjects/UserId';
import { UserSettingsId } from '../../valueObjects/UserSettingsId';
import { UserSettings } from '../UserSettings';

describe('UserSettings', () => {
  const validUserSettingsId = new UserSettingsId('550e8400-e29b-41d4-a716-446655440001');
  const validUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');
  const testDate = new Date('2025-08-30T00:00:00Z');

  describe('インスタンス作成テスト', () => {
    it('TC019: 正常なエンティティ作成', () => {
      // Act
      const userSettings = new UserSettings(
        validUserSettingsId,
        validUserId,
        'dark',
        'en',
        '12h',
        testDate,
        testDate
      );

      // Assert
      expect(userSettings.getId()).toBe(validUserSettingsId);
      expect(userSettings.getUserId()).toBe(validUserId);
      expect(userSettings.getTheme()).toBe('dark');
      expect(userSettings.getLanguage()).toBe('en');
      expect(userSettings.getTimeFormat()).toBe('12h');
      expect(userSettings.getCreatedAt()).toBe(testDate);
      expect(userSettings.getUpdatedAt()).toBe(testDate);
    });

    it('TC020: デフォルト値でのエンティティ作成', () => {
      // Act
      const userSettings = UserSettings.createDefault(validUserId);

      // Assert
      expect(userSettings.getUserId()).toBe(validUserId);
      expect(userSettings.getTheme()).toBe('auto');
      expect(userSettings.getLanguage()).toBe('ja');
      expect(userSettings.getTimeFormat()).toBe('24h');
    });
  });

  describe('更新メソッドテスト', () => {
    let userSettings: UserSettings;

    beforeEach(() => {
      userSettings = UserSettings.createDefault(validUserId);
    });

    it('TC021: theme更新メソッド', () => {
      // Arrange
      const originalUpdatedAt = userSettings.getUpdatedAt();

      // Act
      userSettings.updateTheme('dark');

      // Assert
      expect(userSettings.getTheme()).toBe('dark');
      expect(userSettings.getUpdatedAt()).not.toBe(originalUpdatedAt);
    });

    it('TC022: language更新メソッド', () => {
      // Arrange
      const originalUpdatedAt = userSettings.getUpdatedAt();

      // Act
      userSettings.updateLanguage('en');

      // Assert
      expect(userSettings.getLanguage()).toBe('en');
      expect(userSettings.getUpdatedAt()).not.toBe(originalUpdatedAt);
    });

    it('TC023: timeFormat更新メソッド', () => {
      // Arrange
      const originalUpdatedAt = userSettings.getUpdatedAt();

      // Act
      userSettings.updateTimeFormat('12h');

      // Assert
      expect(userSettings.getTimeFormat()).toBe('12h');
      expect(userSettings.getUpdatedAt()).not.toBe(originalUpdatedAt);
    });
  });

  describe('バリデーションテスト', () => {
    it('TC024: 無効なtheme値でのエンティティ作成拒否', () => {
      // Act & Assert
      expect(() => new UserSettings(
        validUserSettingsId,
        validUserId,
        'invalid' as any,
        'ja',
        '24h',
        testDate,
        testDate
      )).toThrow(UserSettingsInvalidThemeError);
    });

    it('無効なlanguage値でのエンティティ作成拒否', () => {
      // Act & Assert
      expect(() => new UserSettings(
        validUserSettingsId,
        validUserId,
        'auto',
        'invalid' as any,
        '24h',
        testDate,
        testDate
      )).toThrow(UserSettingsInvalidLanguageError);
    });

    it('無効なtimeFormat値でのエンティティ作成拒否', () => {
      // Act & Assert
      expect(() => new UserSettings(
        validUserSettingsId,
        validUserId,
        'auto',
        'ja',
        'invalid' as any,
        testDate,
        testDate
      )).toThrow(UserSettingsInvalidTimeFormatError);
    });
  });

  describe('比較・判定メソッド', () => {
    it('equals()で同じIDの設定を正しく比較する', () => {
      // Arrange
      const settings1 = new UserSettings(validUserSettingsId, validUserId, 'auto', 'ja', '24h');
      const settings2 = new UserSettings(validUserSettingsId, validUserId, 'dark', 'en', '12h');

      // Act & Assert
      expect(settings1.equals(settings2)).toBe(true);
    });

    it('belongsToUser()でユーザー所有を正しく判定する', () => {
      // Arrange
      const settings = UserSettings.createDefault(validUserId);
      const otherUserId = new UserId('550e8400-e29b-41d4-a716-446655440999');

      // Act & Assert
      expect(settings.belongsToUser(validUserId)).toBe(true);
      expect(settings.belongsToUser(otherUserId)).toBe(false);
    });
  });

  describe('永続化メソッド', () => {
    it('toPersistence()で適切な形式に変換する', () => {
      // Arrange
      const settings = new UserSettings(
        validUserSettingsId,
        validUserId,
        'dark',
        'en',
        '12h',
        testDate,
        testDate
      );

      // Act
      const persistence = settings.toPersistence();

      // Assert
      expect(persistence).toEqual({
        id: validUserSettingsId.getValue(),
        userId: validUserId.getValue(),
        theme: 'dark',
        language: 'en',
        timeFormat: '12h',
        createdAt: testDate,
        updatedAt: testDate
      });
    });

    it('fromPersistence()で適切にインスタンス化する', () => {
      // Arrange
      const persistenceData = {
        id: validUserSettingsId.getValue(),
        userId: validUserId.getValue(),
        theme: 'dark' as const,
        language: 'en' as const,
        timeFormat: '12h' as const,
        createdAt: testDate,
        updatedAt: testDate
      };

      // Act
      const settings = UserSettings.fromPersistence(persistenceData);

      // Assert
      expect(settings.getId().getValue()).toBe(validUserSettingsId.getValue());
      expect(settings.getUserId().getValue()).toBe(validUserId.getValue());
      expect(settings.getTheme()).toBe('dark');
      expect(settings.getLanguage()).toBe('en');
      expect(settings.getTimeFormat()).toBe('12h');
    });
  });
});