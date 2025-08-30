import { BadgeRank, ChallengeDifficulty, MissionType } from '../../domain/services/XPCalculationService';

export interface CalculateXPDto {
  userId: string;
  source: 'routine' | 'badge' | 'challenge' | 'mission';
  sourceId: string;
  streakCount?: number;
  badgeRank?: BadgeRank;
  challengeDifficulty?: ChallengeDifficulty;
  missionType?: MissionType;
  isFirstTime?: boolean;
  isPerfectWeek?: boolean;
  metadata?: Record<string, any>;
}