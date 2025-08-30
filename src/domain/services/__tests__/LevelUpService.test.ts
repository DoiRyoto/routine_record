import { describe, it, expect } from '@jest/globals';
import { LevelUpService } from '../LevelUpService';
import { XPAmount } from '../../valueObjects/XPAmount';
import { Level } from '../../valueObjects/Level';
import { UserId } from '../../valueObjects/UserId';

describe('LevelUpService', () => {
  let service: LevelUpService;
  const validUserId = new UserId('550e8400-e29b-41d4-a716-446655440000');

  beforeEach(() => {
    service = new LevelUpService();
  });

  describe('TC033: レベルアップ判定', () => {
    it('レベルアップ条件を満たす場合のレベル判定', () => {
      // Arrange
      const currentLevel = new Level(1);
      const currentXP = new XPAmount(200); // レベル2に必要なXP

      // Act
      const result = service.calculateLevel(currentXP);

      // Assert
      expect(result.getValue()).toBe(2);
    });

    it('レベルアップ条件を満たさない場合のレベル判定', () => {
      // Arrange
      const currentXP = new XPAmount(150); // レベル2に足りない

      // Act
      const result = service.calculateLevel(currentXP);

      // Assert
      expect(result.getValue()).toBe(1);
    });

    it('複数レベルアップの判定', () => {
      // Arrange
      const currentXP = new XPAmount(900); // レベル4相当だが、1000必要なので900ではレベル3

      // Act
      const result = service.calculateLevel(currentXP);

      // Assert
      expect(result.getValue()).toBe(3);
    });

    it('最大レベル到達判定', () => {
      // Arrange
      const maxXP = new XPAmount(505000); // 最大レベル以上のXP

      // Act
      const result = service.calculateLevel(maxXP);

      // Assert
      expect(result.getValue()).toBe(100); // 最大レベル
    });
  });

  describe('TC034: 次レベル必要XP計算', () => {
    it('レベル1から2への必要XP計算', () => {
      // Arrange
      const currentLevel = new Level(1);
      const currentXP = new XPAmount(0);

      // Act
      const result = service.calculateXPToNextLevel(currentLevel, currentXP);

      // Assert
      expect(result.getValue()).toBe(200); // レベル2に必要なXP
    });

    it('レベル5から6への必要XP計算（一部XP取得済み）', () => {
      // Arrange
      const currentLevel = new Level(5);
      const currentXP = new XPAmount(1350); // レベル5のXP + 少し

      // Act
      const result = service.calculateXPToNextLevel(currentLevel, currentXP);

      // Assert
      expect(result.getValue()).toBe(250); // レベル6に必要な残りXP
    });

    it('最大レベルでの必要XP計算', () => {
      // Arrange
      const maxLevel = new Level(100);
      const currentXP = new XPAmount(500000);

      // Act & Assert
      expect(() => service.calculateXPToNextLevel(maxLevel, currentXP)).toThrow('最大レベルに達しています');
    });
  });

  describe('TC035: レベルアップ報酬計算', () => {
    it('レベル2到達報酬計算', () => {
      // Act
      const rewards = service.calculateLevelUpRewards(new Level(2));

      // Assert
      expect(rewards.bonusXP.getValue()).toBe(50);
      expect(rewards.unlockedFeatures).toContain('basic_customization');
    });

    it('レベル10到達報酬計算', () => {
      // Act
      const rewards = service.calculateLevelUpRewards(new Level(10));

      // Assert
      expect(rewards.bonusXP.getValue()).toBe(250);
      expect(rewards.unlockedFeatures).toContain('advanced_stats');
    });

    it('レベル50到達報酬計算', () => {
      // Act
      const rewards = service.calculateLevelUpRewards(new Level(50));

      // Assert
      expect(rewards.bonusXP.getValue()).toBe(1250);
      expect(rewards.unlockedFeatures).toContain('premium_themes');
    });

    it('最大レベル到達報酬計算', () => {
      // Act
      const rewards = service.calculateLevelUpRewards(new Level(100));

      // Assert
      expect(rewards.bonusXP.getValue()).toBe(5000);
      expect(rewards.unlockedFeatures).toContain('master_badge');
      expect(rewards.specialReward).toBe('完全制覇の称号');
    });
  });

  describe('レベルアップイベント処理', () => {
    it('レベルアップ発生時のイベント生成', () => {
      // Act
      const event = service.createLevelUpEvent(validUserId, new Level(1), new Level(2));

      // Assert
      expect(event.eventType).toBe('LEVEL_UP');
      expect(event.aggregateId).toBe(validUserId.getValue());
      expect(event.eventData.oldLevel).toBe(1);
      expect(event.eventData.newLevel).toBe(2);
    });

    it('複数レベルアップ時のイベント生成', () => {
      // Act
      const event = service.createLevelUpEvent(validUserId, new Level(1), new Level(5));

      // Assert
      expect(event.eventType).toBe('MULTIPLE_LEVEL_UP');
      expect(event.eventData.levelsGained).toBe(4);
    });
  });

  describe('XPとレベルの整合性チェック', () => {
    it('XPとレベルが一致する場合', () => {
      // Arrange
      const level = new Level(3);
      const xp = new XPAmount(600); // レベル3のXP

      // Act
      const isConsistent = service.validateXPLevelConsistency(level, xp);

      // Assert
      expect(isConsistent).toBe(true);
    });

    it('XPとレベルが一致しない場合', () => {
      // Arrange
      const level = new Level(5);
      const xp = new XPAmount(200); // レベル2のXP

      // Act
      const isConsistent = service.validateXPLevelConsistency(level, xp);

      // Assert
      expect(isConsistent).toBe(false);
    });
  });
});