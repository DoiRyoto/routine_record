import { Mission } from '../../domain/entities/Mission';
import { IMissionRepository } from '../../domain/repositories/IMissionRepository';
import { MissionProgressCalculationService } from '../../domain/services/MissionProgressCalculationService';
import { CalculateMissionProgressDto } from '../dtos';

export interface CalculateMissionProgressResult {
  mission: Mission;
  progress: number;
  isCompleted: boolean;
  completionPercentage: number;
}

export class CalculateMissionProgressUseCase {
  constructor(
    private missionRepository: IMissionRepository,
    private missionProgressService: MissionProgressCalculationService
  ) {}

  async execute(dto: CalculateMissionProgressDto): Promise<CalculateMissionProgressResult> {
    const { userId, missionId } = dto;
    
    // Get the mission
    const mission = await this.missionRepository.getById(missionId);
    if (!mission) {
      throw new Error(`Mission not found: ${missionId}`);
    }

    // Calculate progress
    let progress = await this.missionProgressService.calculateProgress(userId, mission);
    
    // Ensure progress is not negative (normalize edge cases)
    progress = Math.max(0, progress);
    
    // Check if completed
    const isCompleted = progress >= mission.targetValue;
    
    // Calculate completion percentage
    const completionPercentage = mission.targetValue > 0 
      ? Math.round((progress / mission.targetValue) * 100)
      : progress > 0 ? Infinity : 0;
    
    return {
      mission,
      progress,
      isCompleted,
      completionPercentage
    };
  }
}