import { describe, it, expect } from '@jest/globals';
import { XPCalculationService } from '../XPCalculationService';
import { XPAmount } from '../../valueObjects/XPAmount';
import { InvalidXPSourceError } from '../../../shared/types/GamificationErrors';

describe('XPCalculationService', () => {
  let service: XPCalculationService;

  beforeEach(() => {
    service = new XPCalculationService();
  });

  describe('TC029: ルーティン完了XP計算', () => {
    it('基本ルーティン完了時の標準XP計算', () => {
      // Act
      const xp = service.calculateRoutineCompletionXP('routine', 1);

      // Assert
      expect(xp.getValue()).toBe(11); // 基本10 + ストリーク1
    });

    it('連続実行ボーナス付きXP計算', () => {
      // Act
      const xp = service.calculateRoutineCompletionXP('routine', 5);

      // Assert
      expect(xp.getValue()).toBe(15); // 基本10 + ストリーク5
    });

    it('大きな連続実行ボーナス計算', () => {
      // Act
      const xp = service.calculateRoutineCompletionXP('routine', 30);

      // Assert
      expect(xp.getValue()).toBe(40); // 基本10 + ストリーク30
    });
  });

  describe('TC030: バッジ獲得XP計算', () => {
    it('ブロンズバッジ獲得XP', () => {
      // Act
      const xp = service.calculateBadgeXP('bronze');

      // Assert
      expect(xp.getValue()).toBe(25);
    });

    it('シルバーバッジ獲得XP', () => {
      // Act
      const xp = service.calculateBadgeXP('silver');

      // Assert
      expect(xp.getValue()).toBe(50);
    });

    it('ゴールドバッジ獲得XP', () => {
      // Act
      const xp = service.calculateBadgeXP('gold');

      // Assert
      expect(xp.getValue()).toBe(100);
    });

    it('プラチナバッジ獲得XP', () => {
      // Act
      const xp = service.calculateBadgeXP('platinum');

      // Assert
      expect(xp.getValue()).toBe(200);
    });

    it('無効なバッジランクでエラー', () => {
      // Act & Assert
      expect(() => service.calculateBadgeXP('invalid' as any)).toThrow('無効なバッジランクです');
    });
  });

  describe('TC031: チャレンジ完了XP計算', () => {
    it('イージーチャレンジ完了XP', () => {
      // Act
      const xp = service.calculateChallengeCompletionXP('easy');

      // Assert
      expect(xp.getValue()).toBe(30);
    });

    it('ノーマルチャレンジ完了XP', () => {
      // Act
      const xp = service.calculateChallengeCompletionXP('normal');

      // Assert
      expect(xp.getValue()).toBe(50);
    });

    it('ハードチャレンジ完了XP', () => {
      // Act
      const xp = service.calculateChallengeCompletionXP('hard');

      // Assert
      expect(xp.getValue()).toBe(100);
    });

    it('無効な難易度でエラー', () => {
      // Act & Assert
      expect(() => service.calculateChallengeCompletionXP('invalid' as any)).toThrow('無効なチャレンジ難易度です');
    });
  });

  describe('TC032: ミッション完了XP計算', () => {
    it('デイリーミッション完了XP', () => {
      // Act
      const xp = service.calculateMissionCompletionXP('daily');

      // Assert
      expect(xp.getValue()).toBe(20);
    });

    it('ウィークリーミッション完了XP', () => {
      // Act
      const xp = service.calculateMissionCompletionXP('weekly');

      // Assert
      expect(xp.getValue()).toBe(100);
    });

    it('マンスリーミッション完了XP', () => {
      // Act
      const xp = service.calculateMissionCompletionXP('monthly');

      // Assert
      expect(xp.getValue()).toBe(500);
    });

    it('無効なミッション期間でエラー', () => {
      // Act & Assert
      expect(() => service.calculateMissionCompletionXP('invalid' as any)).toThrow('無効なミッション期間です');
    });
  });

  describe('ボーナス計算', () => {
    it('初回ボーナス適用', () => {
      // Act
      const baseXP = new XPAmount(10);
      const bonusXP = service.applyFirstTimeBonus(baseXP);

      // Assert
      expect(bonusXP.getValue()).toBe(20); // 2倍ボーナス
    });

    it('パーフェクトウィークボーナス適用', () => {
      // Act
      const baseXP = new XPAmount(100);
      const bonusXP = service.applyPerfectWeekBonus(baseXP);

      // Assert
      expect(bonusXP.getValue()).toBe(150); // 1.5倍ボーナス
    });
  });

  describe('XPソースバリデーション', () => {
    it('有効なXPソースでのバリデーション成功', () => {
      const validSources = ['routine', 'badge', 'challenge', 'mission'];
      
      validSources.forEach(source => {
        expect(() => service.validateXPSource(source)).not.toThrow();
      });
    });

    it('無効なXPソースでエラー', () => {
      // Act & Assert
      expect(() => service.validateXPSource('invalid')).toThrow(InvalidXPSourceError);
    });
  });
});