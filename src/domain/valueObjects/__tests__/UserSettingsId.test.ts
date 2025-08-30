import { describe, it, expect } from '@jest/globals';
import { UserSettingsId } from '../UserSettingsId';

describe('UserSettingsId', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440001';

  describe('正常系テストケース', () => {
    it('TC025: 有効なUUIDでのインスタンス作成', () => {
      // Act
      const userSettingsId = new UserSettingsId(validUuid);

      // Assert
      expect(userSettingsId.getValue()).toBe(validUuid);
    });

    it('TC026: UUIDの生成', () => {
      // Act
      const userSettingsId = UserSettingsId.generate();

      // Assert
      expect(userSettingsId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('equals()で同じIDの比較ができる', () => {
      // Arrange
      const id1 = new UserSettingsId(validUuid);
      const id2 = new UserSettingsId(validUuid);

      // Act & Assert
      expect(id1.equals(id2)).toBe(true);
    });

    it('equals()で異なるIDの比較ができる', () => {
      // Arrange
      const id1 = new UserSettingsId(validUuid);
      const id2 = UserSettingsId.generate();

      // Act & Assert
      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('異常系テストケース', () => {
    it('TC027: 無効なUUID形式での作成拒否', () => {
      // Act & Assert
      expect(() => new UserSettingsId('invalid-uuid')).toThrow('UserSettingsIdはUUID形式である必要があります');
    });

    it('TC028: 空文字列での作成拒否', () => {
      // Act & Assert
      expect(() => new UserSettingsId('')).toThrow('UserSettingsIdは空にできません');
    });

    it('null値での作成拒否', () => {
      // Act & Assert
      expect(() => new UserSettingsId(null as any)).toThrow('UserSettingsIdは空にできません');
    });

    it('undefined値での作成拒否', () => {
      // Act & Assert
      expect(() => new UserSettingsId(undefined as any)).toThrow('UserSettingsIdは空にできません');
    });
  });
});