import { DomainEvent } from '../../shared/types';
import { Level } from '../valueObjects/Level';
import { UserId } from '../valueObjects/UserId';
import { XPAmount } from '../valueObjects/XPAmount';

export interface LevelUpRewards {
  bonusXP: XPAmount;
  unlockedFeatures: string[];
  specialReward?: string;
}

export class LevelUpService {
  private static readonly LEVEL_THRESHOLDS: readonly number[] = [
    0,    // Level 1
    200,  // Level 2
    600,  // Level 3
    1000, // Level 4
    1350, // Level 5
    1600  // Level 6
  ];

  public calculateLevel(totalXP: XPAmount): Level {
    const xpValue = totalXP.getValue();
    
    // Calculate dynamically for all levels
    for (let level = 100; level >= 1; level--) {
      const requiredXP = this.calculateTotalXPForLevel(level);
      if (xpValue >= requiredXP) {
        return new Level(level);
      }
    }

    return new Level(1); // Minimum level
  }

  public calculateXPToNextLevel(currentLevel: Level, currentXP: XPAmount): XPAmount {
    if (currentLevel.isMaxLevel()) {
      throw new Error('最大レベルに達しています');
    }

    const totalRequiredXP = this.calculateTotalXPForLevel(currentLevel.getValue() + 1);
    const remainingXP = totalRequiredXP - currentXP.getValue();

    return new XPAmount(Math.max(0, remainingXP));
  }

  private calculateTotalXPForLevel(level: number): number {
    if (level <= 1) return 0;
    
    // Use predefined thresholds for known levels
    if (level - 1 < LevelUpService.LEVEL_THRESHOLDS.length) {
      return LevelUpService.LEVEL_THRESHOLDS[level - 1];
    }
    
    // For higher levels, use formula based on the last known threshold
    let totalXP = LevelUpService.LEVEL_THRESHOLDS[LevelUpService.LEVEL_THRESHOLDS.length - 1];
    const startLevel = LevelUpService.LEVEL_THRESHOLDS.length;
    
    for (let l = startLevel; l < level; l++) {
      totalXP += (l + 1) * 100;
    }
    
    return totalXP;
  }

  private static readonly FEATURE_UNLOCKS: readonly { level: number; feature: string }[] = [
    { level: 2, feature: 'basic_customization' },
    { level: 10, feature: 'advanced_stats' },
    { level: 25, feature: 'premium_themes' },
    { level: 50, feature: 'custom_challenges' },
    { level: 100, feature: 'master_badge' }
  ];

  private static readonly BASE_BONUS_MULTIPLIER = 25;
  private static readonly MAX_LEVEL_BONUS_MULTIPLIER = 50;
  private static readonly MAX_LEVEL_SPECIAL_REWARD = '完全制覇の称号';

  public calculateLevelUpRewards(level: Level): LevelUpRewards {
    const levelValue = level.getValue();
    
    const bonusXPMultiplier = levelValue === 100 
      ? LevelUpService.MAX_LEVEL_BONUS_MULTIPLIER 
      : LevelUpService.BASE_BONUS_MULTIPLIER;
    
    const bonusXP = new XPAmount(levelValue * bonusXPMultiplier);
    
    const unlockedFeatures = LevelUpService.FEATURE_UNLOCKS
      .filter(unlock => levelValue >= unlock.level)
      .map(unlock => unlock.feature);
    
    const specialReward = levelValue >= 100 
      ? LevelUpService.MAX_LEVEL_SPECIAL_REWARD 
      : undefined;

    return {
      bonusXP,
      unlockedFeatures,
      specialReward
    };
  }

  public createLevelUpEvent(userId: UserId, oldLevel: Level, newLevel: Level): DomainEvent {
    const levelsGained = newLevel.getValue() - oldLevel.getValue();
    const eventType = levelsGained > 1 ? 'MULTIPLE_LEVEL_UP' : 'LEVEL_UP';

    return {
      id: this.generateEventId(),
      eventType,
      aggregateId: userId.getValue(),
      aggregateType: 'UserProfile',
      eventData: {
        oldLevel: oldLevel.getValue(),
        newLevel: newLevel.getValue(),
        ...(levelsGained > 1 && { levelsGained })
      },
      occurredAt: new Date(),
      version: 1
    };
  }

  public validateXPLevelConsistency(level: Level, xp: XPAmount): boolean {
    const calculatedLevel = this.calculateLevel(xp);
    return level.equals(calculatedLevel);
  }

  private generateEventId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}