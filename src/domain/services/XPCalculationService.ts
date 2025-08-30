import { InvalidXPSourceError } from '../../shared/types/GamificationErrors';
import { XPAmount } from '../valueObjects/XPAmount';

export type BadgeRank = 'bronze' | 'silver' | 'gold' | 'platinum';
export type ChallengeDifficulty = 'easy' | 'normal' | 'hard';
export type MissionType = 'daily' | 'weekly' | 'monthly';
export type XPSource = 'routine' | 'badge' | 'challenge' | 'mission';

export class XPCalculationService {
  private static readonly BASE_ROUTINE_XP = 10;
  private static readonly FIRST_TIME_BONUS_MULTIPLIER = 2;
  private static readonly PERFECT_WEEK_BONUS_MULTIPLIER = 1.5;
  
  private static readonly BADGE_XP_MAP: Readonly<Record<BadgeRank, number>> = {
    bronze: 25,
    silver: 50,
    gold: 100,
    platinum: 200
  } as const;
  
  private static readonly CHALLENGE_XP_MAP: Readonly<Record<ChallengeDifficulty, number>> = {
    easy: 30,
    normal: 50,
    hard: 100
  } as const;
  
  private static readonly MISSION_XP_MAP: Readonly<Record<MissionType, number>> = {
    daily: 20,
    weekly: 100,
    monthly: 500
  } as const;
  
  private static readonly VALID_SOURCES: readonly XPSource[] = ['routine', 'badge', 'challenge', 'mission'] as const;

  public calculateRoutineCompletionXP(source: string, streakCount: number): XPAmount {
    const baseXP = XPCalculationService.BASE_ROUTINE_XP;
    const streakBonus = streakCount;
    return new XPAmount(baseXP + streakBonus);
  }

  public calculateBadgeXP(rank: BadgeRank): XPAmount {
    const xpValue = XPCalculationService.BADGE_XP_MAP[rank];
    if (xpValue === undefined) {
      throw new Error('無効なバッジランクです');
    }
    return new XPAmount(xpValue);
  }

  public calculateChallengeCompletionXP(difficulty: ChallengeDifficulty): XPAmount {
    const xpValue = XPCalculationService.CHALLENGE_XP_MAP[difficulty];
    if (xpValue === undefined) {
      throw new Error('無効なチャレンジ難易度です');
    }
    return new XPAmount(xpValue);
  }

  public calculateMissionCompletionXP(type: MissionType): XPAmount {
    const xpValue = XPCalculationService.MISSION_XP_MAP[type];
    if (xpValue === undefined) {
      throw new Error('無効なミッション期間です');
    }
    return new XPAmount(xpValue);
  }

  public applyFirstTimeBonus(baseXP: XPAmount): XPAmount {
    return baseXP.multiply(XPCalculationService.FIRST_TIME_BONUS_MULTIPLIER);
  }

  public applyPerfectWeekBonus(baseXP: XPAmount): XPAmount {
    return baseXP.multiply(XPCalculationService.PERFECT_WEEK_BONUS_MULTIPLIER);
  }

  public validateXPSource(source: string): void {
    if (!XPCalculationService.VALID_SOURCES.includes(source as XPSource)) {
      throw new InvalidXPSourceError(source);
    }
  }
}