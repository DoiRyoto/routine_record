import { describe, it, expect } from '@jest/globals';

import { InvalidXPAmountError } from '../../../shared/types/GamificationErrors';
import { XPAmount } from '../XPAmount';

describe('XPAmount', () => {
  describe('正常系テストケース', () => {
    it('TC025: 有効なXP値でのインスタンス作成', () => {
      // Act
      const xpAmount = new XPAmount(100);

      // Assert
      expect(xpAmount.getValue()).toBe(100);
    });

    it('XP値0での作成', () => {
      // Act
      const xpAmount = new XPAmount(0);

      // Assert
      expect(xpAmount.getValue()).toBe(0);
    });

    it('add()で加算ができる', () => {
      // Arrange
      const xp1 = new XPAmount(100);
      const xp2 = new XPAmount(50);

      // Act
      const result = xp1.add(xp2);

      // Assert
      expect(result.getValue()).toBe(150);
    });

    it('multiply()で乗算ができる', () => {
      // Arrange
      const xpAmount = new XPAmount(10);

      // Act
      const result = xpAmount.multiply(3);

      // Assert
      expect(result.getValue()).toBe(30);
    });

    it('equals()で同じXP値の比較ができる', () => {
      // Arrange
      const xp1 = new XPAmount(100);
      const xp2 = new XPAmount(100);

      // Act & Assert
      expect(xp1.equals(xp2)).toBe(true);
    });

    it('equals()で異なるXP値の比較ができる', () => {
      // Arrange
      const xp1 = new XPAmount(100);
      const xp2 = new XPAmount(200);

      // Act & Assert
      expect(xp1.equals(xp2)).toBe(false);
    });
  });

  describe('異常系テストケース', () => {
    it('TC026: 無効なXP値での作成拒否 - 負の値', () => {
      // Act & Assert
      expect(() => new XPAmount(-10)).toThrow(InvalidXPAmountError);
    });

    it('負の値（-1）での作成拒否', () => {
      // Act & Assert
      expect(() => new XPAmount(-1)).toThrow(InvalidXPAmountError);
    });

    it('NaN値での作成拒否', () => {
      // Act & Assert
      expect(() => new XPAmount(NaN)).toThrow(InvalidXPAmountError);
    });

    it('Infinity値での作成拒否', () => {
      // Act & Assert
      expect(() => new XPAmount(Infinity)).toThrow(InvalidXPAmountError);
    });

    it('非数値での作成拒否', () => {
      // Act & Assert
      expect(() => new XPAmount('invalid' as any)).toThrow(InvalidXPAmountError);
    });
  });

  describe('計算メソッドテスト', () => {
    it('大きな値の加算', () => {
      // Arrange
      const xp1 = new XPAmount(999999);
      const xp2 = new XPAmount(1);

      // Act
      const result = xp1.add(xp2);

      // Assert
      expect(result.getValue()).toBe(1000000);
    });

    it('乗算時の小数点以下切り捨て', () => {
      // Arrange
      const xpAmount = new XPAmount(10);

      // Act
      const result = xpAmount.multiply(1.5);

      // Assert
      expect(result.getValue()).toBe(15);
    });

    it('0での乗算', () => {
      // Arrange
      const xpAmount = new XPAmount(100);

      // Act
      const result = xpAmount.multiply(0);

      // Assert
      expect(result.getValue()).toBe(0);
    });
  });
});