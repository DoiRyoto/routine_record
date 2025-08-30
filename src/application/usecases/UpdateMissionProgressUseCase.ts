import { UserMission } from '../../domain/entities/UserMission';
import { MissionNotFoundException } from '../../domain/exceptions/MissionProgressExceptions';
import { IGameNotificationRepository } from '../../domain/repositories/IGameNotificationRepository';
import { IMissionRepository } from '../../domain/repositories/IMissionRepository';
import { IUserBadgeRepository } from '../../domain/repositories/IUserBadgeRepository';
import { IUserMissionRepository } from '../../domain/repositories/IUserMissionRepository';
import { IUserProfileRepository } from '../../domain/repositories/IUserProfileRepository';
import { MissionProgressCalculationService } from '../../domain/services/MissionProgressCalculationService';
import { UserId } from '../../domain/valueObjects';
import { UpdateMissionProgressDto } from '../dtos';

import { ProcessLevelUpUseCase } from './ProcessLevelUpUseCase';


export interface UpdateMissionProgressResult {
  updatedMissions: UserMission[];
  completedMissions: UserMission[];
  totalXPGranted: number;
}

export class UpdateMissionProgressUseCase {
  constructor(
    private userMissionRepository: IUserMissionRepository,
    private missionRepository: IMissionRepository,
    private userProfileRepository: IUserProfileRepository,
    private userBadgeRepository: IUserBadgeRepository,
    private gameNotificationRepository: IGameNotificationRepository,
    private missionProgressService: MissionProgressCalculationService,
    private processLevelUpUseCase: ProcessLevelUpUseCase
  ) {}

  async execute(dto: UpdateMissionProgressDto): Promise<UpdateMissionProgressResult> {
    const { userId } = dto;
    
    // Get all active user missions
    const activeUserMissions = await this.userMissionRepository.getActiveUserMissions(userId);
    
    const updatedMissions: UserMission[] = [];
    const completedMissions: UserMission[] = [];
    let totalXPGranted = 0;

    // Update progress for each active mission
    for (const userMission of activeUserMissions) {
      const mission = await this.missionRepository.getById(userMission.missionId);
      
      if (!mission) {
        throw new MissionNotFoundException(userMission.missionId);
      }

      // Calculate new progress
      const newProgress = await this.missionProgressService.calculateProgress(userId, mission);
      
      // Update progress
      userMission.updateProgress(newProgress);
      
      // Check if mission is completed
      if (newProgress >= mission.targetValue && !userMission.isCompleted) {
        userMission.markAsCompleted();
        
        // Grant rewards
        await this.grantMissionRewards(userId, mission);
        totalXPGranted += mission.xpReward;
        
        completedMissions.push(userMission);
        
        // Mark as completed in repository
        await this.userMissionRepository.markAsCompleted(userMission.id);
        
        // Create mission completion notification
        await this.gameNotificationRepository.create({
          userId,
          type: 'mission_completed',
          title: 'Mission Completed!',
          message: `You completed: ${mission.title}`,
          missionId: mission.id,
          isRead: false,
          createdAt: new Date()
        });
      }
      
      // Update the user mission
      await this.userMissionRepository.update(userMission.id, {
        progress: newProgress,
        isCompleted: userMission.isCompleted,
        completedAt: userMission.completedAt
      });
      
      updatedMissions.push(userMission);
    }

    // Process level up if XP was granted
    if (totalXPGranted > 0) {
      const userProfile = await this.userProfileRepository.findByUserId(new UserId(userId));
      if (userProfile) {
        await this.processLevelUpUseCase.execute({ 
          userId, 
          currentXP: userProfile.getTotalXP().getValue(), 
          gainedXP: totalXPGranted 
        });
      }
    }

    return {
      updatedMissions,
      completedMissions,
      totalXPGranted
    };
  }

  private async grantMissionRewards(userId: string, mission: any): Promise<void> {
    // Grant XP
    await this.userProfileRepository.addXP(userId, mission.xpReward);
    
    // Grant badge if specified
    if (mission.badgeId) {
      await this.userBadgeRepository.awardBadge(userId, mission.badgeId);
    }
  }
}