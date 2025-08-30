import { Mission, MissionType } from '../entities/Mission';
import { IExecutionRecordRepository } from '../repositories/IExecutionRecordRepository';
import {
  MissionCalculatorStrategy,
  StreakMissionCalculator,
  CountMissionCalculator,
  VarietyMissionCalculator,
  ConsistencyMissionCalculator
} from './MissionCalculatorStrategy';
import { InvalidMissionTypeException, MissionProgressCalculationException } from '../exceptions/MissionProgressExceptions';

export class MissionProgressCalculationService {
  private strategies: Map<MissionType, MissionCalculatorStrategy>;

  constructor(
    private executionRecordRepository: IExecutionRecordRepository
  ) {
    this.strategies = new Map();
    this.strategies.set('streak', new StreakMissionCalculator());
    this.strategies.set('count', new CountMissionCalculator());
    this.strategies.set('variety', new VarietyMissionCalculator());
    this.strategies.set('consistency', new ConsistencyMissionCalculator());
  }

  async calculateProgress(userId: string, mission: Mission): Promise<number> {
    try {
      const strategy = this.strategies.get(mission.type);
      if (!strategy) {
        throw new InvalidMissionTypeException(mission.type);
      }

      const executionRecords = await this.getExecutionRecordsForMission(userId, mission);
      return await strategy.calculate(userId, mission, executionRecords);
    } catch (error) {
      if (error instanceof InvalidMissionTypeException) {
        throw error;
      }
      throw new MissionProgressCalculationException(
        `Failed to calculate progress for mission ${mission.id}`,
        error as Error
      );
    }
  }

  private async getExecutionRecordsForMission(userId: string, mission: Mission): Promise<any[]> {
    switch (mission.type) {
      case 'count':
      case 'variety':
      case 'consistency':
        return await this.executionRecordRepository.getByUserAndMissionPeriod(userId);
      case 'streak':
        return await this.executionRecordRepository.getByUserId(userId);
      default:
        return await this.executionRecordRepository.getByUserId(userId);
    }
  }

  async calculateStreakProgress(userId: string, mission: Mission): Promise<number> {
    const strategy = this.strategies.get('streak');
    const executionRecords = await this.executionRecordRepository.getByUserId(userId);
    return await strategy!.calculate(userId, mission, executionRecords);
  }

  async calculateCountProgress(userId: string, mission: Mission): Promise<number> {
    const strategy = this.strategies.get('count');
    const executionRecords = await this.executionRecordRepository.getByUserAndMissionPeriod(userId);
    return await strategy!.calculate(userId, mission, executionRecords);
  }

  async calculateVarietyProgress(userId: string, mission: Mission): Promise<number> {
    const strategy = this.strategies.get('variety');
    const executionRecords = await this.executionRecordRepository.getByUserAndMissionPeriod(userId);
    return await strategy!.calculate(userId, mission, executionRecords);
  }

  async calculateConsistencyProgress(userId: string, mission: Mission): Promise<number> {
    const strategy = this.strategies.get('consistency');
    const executionRecords = await this.executionRecordRepository.getByUserAndMissionPeriod(userId);
    return await strategy!.calculate(userId, mission, executionRecords);
  }
}