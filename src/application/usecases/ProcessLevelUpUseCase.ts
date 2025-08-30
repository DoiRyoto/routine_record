// TASK-107: レベルアップ処理UseCase

export interface ProcessLevelUpInput {
  userId: string;
  currentXP: number;
  gainedXP: number;
}

export interface LevelUpNotification {
  type: string;
  title: string;
  message: string;
  data?: any;
}

export interface ProcessLevelUpResult {
  success: boolean;
  data: {
    newLevel: number;
    leveledUp: boolean;
    notifications: LevelUpNotification[];
  };
}

export class ProcessLevelUpUseCase {
  async execute(input: ProcessLevelUpInput): Promise<ProcessLevelUpResult> {
    const newTotalXP = input.currentXP + input.gainedXP;
    
    // レベル計算式: レベルn = (n-1)² × 100 - (n² × 100 - 1)XP
    // 簡略化: レベル1: 0-99, レベル2: 100-249, レベル3: 250-499, レベル4: 500-849, レベル5: 850-1299
    const oldLevel = this.calculateLevel(input.currentXP);
    const newLevel = this.calculateLevel(newTotalXP);
    
    const leveledUp = newLevel > oldLevel;
    const notifications: LevelUpNotification[] = [];
    
    if (leveledUp) {
      notifications.push({
        type: 'LEVEL_UP',
        title: 'レベルアップ！',
        message: `レベル${newLevel}に到達しました！`,
        data: {
          oldLevel,
          newLevel
        }
      });
    }

    return {
      success: true,
      data: {
        newLevel,
        leveledUp,
        notifications
      }
    };
  }

  private calculateLevel(totalXP: number): number {
    if (totalXP < 100) return 1;
    if (totalXP < 250) return 2;
    if (totalXP < 500) return 3;
    if (totalXP < 850) return 4;
    if (totalXP < 1300) return 5;
    
    // より高いレベルの計算（簡略化）
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }
}