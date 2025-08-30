import { describe, it, expect } from '@jest/globals';

import { InvalidLevelError } from '../../../shared/types/GamificationErrors';
import { Level } from '../Level';

describe('Level', () => {
  describe('正常系テストケース', () => {
    it('TC027: 有効なレベル値でのインスタンス作成', () => {
      // Act
      const level = new Level(5);

      // Assert
      expect(level.getValue()).toBe(5);
    });

    it('レベル1での作成', () => {
      // Act
      const level = new Level(1);

      // Assert
      expect(level.getValue()).toBe(1);
    });

    it('TC028: レベル計算メソッド - calculateNextLevelXP', () => {
      // Arrange
      const level = new Level(5);

      // Act
      const nextLevelXP = level.calculateNextLevelXP();

      // Assert
      expect(nextLevelXP).toBe(600); // レベル6に必要なXP = 6 * 100
    });

    it('レベル1の次レベル必要XP計算', () => {
      // Arrange
      const level = new Level(1);

      // Act
      const nextLevelXP = level.calculateNextLevelXP();

      // Assert
      expect(nextLevelXP).toBe(200); // レベル2に必要なXP = 2 * 100
    });

    it('levelUp()でレベルが上がる', () => {
      // Arrange
      const level = new Level(5);

      // Act
      const newLevel = level.levelUp();

      // Assert
      expect(newLevel.getValue()).toBe(6);
      expect(level.getValue()).toBe(5); // 元のオブジェクトは不変
    });

    it('equals()で同じレベルの比較ができる', () => {
      // Arrange
      const level1 = new Level(5);
      const level2 = new Level(5);

      // Act & Assert
      expect(level1.equals(level2)).toBe(true);
    });

    it('equals()で異なるレベルの比較ができる', () => {
      // Arrange
      const level1 = new Level(5);
      const level2 = new Level(10);

      // Act & Assert
      expect(level1.equals(level2)).toBe(false);
    });

    it('isMaxLevel()で最大レベル判定', () => {
      // Arrange
      const maxLevel = new Level(100);
      const normalLevel = new Level(50);

      // Act & Assert
      expect(maxLevel.isMaxLevel()).toBe(true);
      expect(normalLevel.isMaxLevel()).toBe(false);
    });
  });

  describe('異常系テストケース', () => {
    it('レベル0での作成拒否', () => {
      // Act & Assert
      expect(() => new Level(0)).toThrow(InvalidLevelError);
    });

    it('負のレベルでの作成拒否', () => {
      // Act & Assert
      expect(() => new Level(-1)).toThrow(InvalidLevelError);
    });

    it('NaNでの作成拒否', () => {
      // Act & Assert
      expect(() => new Level(NaN)).toThrow(InvalidLevelError);
    });

    it('Infinityでの作成拒否', () => {
      // Act & Assert
      expect(() => new Level(Infinity)).toThrow(InvalidLevelError);
    });

    it('非数値での作成拒否', () => {
      // Act & Assert
      expect(() => new Level('invalid' as any)).toThrow(InvalidLevelError);
    });

    it('最大レベルを超えるレベルアップ拒否', () => {
      // Arrange
      const maxLevel = new Level(100);

      // Act & Assert
      expect(() => maxLevel.levelUp()).toThrow('最大レベルに達しています');
    });
  });

  describe('境界値テストケース', () => {
    it('レベル1での必要XP計算', () => {
      // Arrange
      const level = new Level(1);

      // Act
      const nextLevelXP = level.calculateNextLevelXP();

      // Assert
      expect(nextLevelXP).toBe(200); // レベル2に必要なXP = 2 * 100
    });

    it('レベル99での必要XP計算', () => {
      // Arrange
      const level = new Level(99);

      // Act
      const nextLevelXP = level.calculateNextLevelXP();

      // Assert
      expect(nextLevelXP).toBe(10000); // レベル100に必要なXP = 100 * 100
    });

    it('最大レベル（100）での必要XP計算', () => {
      // Arrange
      const level = new Level(100);

      // Act & Assert
      expect(() => level.calculateNextLevelXP()).toThrow('最大レベルに達しています');
    });
  });
});