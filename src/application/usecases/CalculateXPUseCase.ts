import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { XPCalculationService, BadgeRank, ChallengeDifficulty, MissionType } from '../../domain/services/XPCalculationService';
import { UserId } from '../../domain/valueObjects/UserId';
import { Result, success, failure } from '../../shared/types';
import { CalculateXPDto } from '../dtos/CalculateXPDto';

export interface CalculateXPResult {
  calculatedXP: number;
  source: string;
  sourceId: string;
  bonusApplied: boolean;
  bonusType?: 'first_time' | 'perfect_week';
  streakBonus?: number;
  badgeRank?: BadgeRank;
  challengeDifficulty?: ChallengeDifficulty;
  missionType?: MissionType;
  calculatedAt: Date;
  metadata?: Record<string, any>;
}

export class CalculateXPUseCase {
  constructor(
    private readonly xpService: XPCalculationService,
    private readonly userProfileRepository: IUserProfileRepository
  ) {}

  public async execute(dto: CalculateXPDto): Promise<Result<CalculateXPResult>> {
    try {
      // Validate inputs
      const userId = new UserId(dto.userId);
      this.xpService.validateXPSource(dto.source);

      // Check if user profile exists
      const userProfile = await this.userProfileRepository.findByUserId(userId);
      if (!userProfile) {
        throw new Error('ユーザープロファイルが見つかりません');
      }

      // Calculate base XP based on source
      let calculatedXP = this.calculateBaseXP(dto);

      // Apply bonuses
      let bonusApplied = false;
      let bonusType: 'first_time' | 'perfect_week' | undefined;

      if (dto.isFirstTime) {
        calculatedXP = this.xpService.applyFirstTimeBonus(calculatedXP);
        bonusApplied = true;
        bonusType = 'first_time';
      } else if (dto.isPerfectWeek) {
        calculatedXP = this.xpService.applyPerfectWeekBonus(calculatedXP);
        bonusApplied = true;
        bonusType = 'perfect_week';
      }

      const result: CalculateXPResult = {
        calculatedXP: calculatedXP.getValue(),
        source: dto.source,
        sourceId: dto.sourceId,
        bonusApplied,
        bonusType,
        streakBonus: dto.streakCount,
        badgeRank: dto.badgeRank,
        challengeDifficulty: dto.challengeDifficulty,
        missionType: dto.missionType,
        calculatedAt: new Date(),
        metadata: dto.metadata
      };

      return success(result);
    } catch (error) {
      return failure(error as Error);
    }
  }

  private calculateBaseXP(dto: CalculateXPDto) {
    switch (dto.source) {
      case 'routine':
        return this.xpService.calculateRoutineCompletionXP(dto.source, dto.streakCount ?? 1);
      case 'badge':
        if (!dto.badgeRank) throw new Error('バッジランクが指定されていません');
        return this.xpService.calculateBadgeXP(dto.badgeRank);
      case 'challenge':
        if (!dto.challengeDifficulty) throw new Error('チャレンジ難易度が指定されていません');
        return this.xpService.calculateChallengeCompletionXP(dto.challengeDifficulty);
      case 'mission':
        if (!dto.missionType) throw new Error('ミッションタイプが指定されていません');
        return this.xpService.calculateMissionCompletionXP(dto.missionType);
      default:
        throw new Error(`未対応のXPソースです: ${dto.source}`);
    }
  }
}