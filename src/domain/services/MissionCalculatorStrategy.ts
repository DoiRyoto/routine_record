import { Mission } from '../entities/Mission';
import { MISSION_CONSTANTS } from '../constants/MissionConstants';

export interface MissionCalculatorStrategy {
  calculate(userId: string, mission: Mission, executionRecords: any[]): Promise<number>;
}

export class StreakMissionCalculator implements MissionCalculatorStrategy {
  async calculate(userId: string, mission: Mission, executionRecords: any[]): Promise<number> {
    if (executionRecords.length === 0) {
      return MISSION_CONSTANTS.MIN_PROGRESS_VALUE;
    }

    // Performance optimization: limit processing for very large datasets
    const recordsToProcess = executionRecords.slice(0, MISSION_CONSTANTS.MAX_EXECUTION_RECORDS_TO_PROCESS);

    // Get unique days and sort them
    const uniqueDays = new Set<string>();
    for (const record of recordsToProcess) {
      const day = new Date(record.executedAt).toISOString().split('T')[0];
      uniqueDays.add(day);
    }

    const sortedDays = Array.from(uniqueDays).sort();
    
    if (sortedDays.length === 0) {
      return 0;
    }
    
    // Calculate current active streak (ending with the latest day)
    let currentStreak = 1;
    for (let i = sortedDays.length - 1; i > 0; i--) {
      const currentDay = new Date(sortedDays[i]);
      const previousDay = new Date(sortedDays[i - 1]);
      
      const dayDiff = Math.floor((currentDay.getTime() - previousDay.getTime()) / MISSION_CONSTANTS.MILLISECONDS_PER_DAY);
      
      if (dayDiff === 1) {
        currentStreak++;
      } else {
        break; // Streak is broken
      }
    }

    return currentStreak;
  }
}

export class CountMissionCalculator implements MissionCalculatorStrategy {
  async calculate(userId: string, mission: Mission, executionRecords: any[]): Promise<number> {
    return executionRecords.length;
  }
}

export class VarietyMissionCalculator implements MissionCalculatorStrategy {
  async calculate(userId: string, mission: Mission, executionRecords: any[]): Promise<number> {
    // Count unique categories
    const uniqueCategories = new Set<string>();
    for (const record of executionRecords) {
      if (record.routine?.categoryId) {
        uniqueCategories.add(record.routine.categoryId);
      }
    }

    return uniqueCategories.size;
  }
}

export class ConsistencyMissionCalculator implements MissionCalculatorStrategy {
  async calculate(userId: string, mission: Mission, executionRecords: any[]): Promise<number> {
    // Count unique days with executions
    const uniqueDays = new Set<string>();
    for (const record of executionRecords) {
      const day = new Date(record.executedAt).toISOString().split('T')[0];
      uniqueDays.add(day);
    }

    return uniqueDays.size;
  }
}