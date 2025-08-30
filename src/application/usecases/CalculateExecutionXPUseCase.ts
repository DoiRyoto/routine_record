// TASK-107: 実行記録作成時のXP計算UseCase

export interface CalculateExecutionXPInput {
  executionRecordId: string;
  userId: string;
  routineId: string;
  executionTimeMinutes?: number;
  executionDate?: string;
  categoryId?: string;
  previousStreakDays?: number;
  lastExecutionDate?: string;
  dailyCategoriesCount?: number;
}

export interface XPTransaction {
  type: 'EXECUTION' | 'TIME_BONUS' | 'STREAK_BONUS' | 'DIVERSITY_BONUS';
  amount: number;
  description: string;
}

export interface GameNotification {
  type: string;
  title: string;
  message: string;
  data?: any;
}

export interface CalculateExecutionXPResult {
  success: boolean;
  data: {
    baseXP: number;
    timeBonus: number;
    streakBonus: number;
    diversityBonus: number;
    totalXP: number;
    streakDays: number;
    transactions: XPTransaction[];
    notifications: GameNotification[];
  };
}

export class CalculateExecutionXPUseCase {
  async execute(input: CalculateExecutionXPInput): Promise<CalculateExecutionXPResult> {
    // 基本XP計算
    const baseXP = 10;
    
    // 時間ボーナス計算
    let timeBonus = 0;
    const executionTime = input.executionTimeMinutes || 0;
    if (executionTime >= 120) {
      timeBonus = 20;
    } else if (executionTime >= 60) {
      timeBonus = 15;
    } else if (executionTime >= 30) {
      timeBonus = 10;
    } else if (executionTime >= 15) {
      timeBonus = 5;
    }

    // ストリークボーナス計算
    let streakBonus = 0;
    let streakDays = 1;
    
    if (input.previousStreakDays !== undefined) {
      streakDays = input.previousStreakDays + 1;
      
      if (streakDays >= 30) {
        streakBonus = 50;
      } else if (streakDays >= 14) {
        streakBonus = 30;
      } else if (streakDays >= 7) {
        streakBonus = 15;
      } else if (streakDays >= 3) {
        streakBonus = 5;
      }
    }

    // ストリーク途切れ判定
    if (input.lastExecutionDate && input.executionDate) {
      const lastDate = new Date(input.lastExecutionDate);
      const currentDate = new Date(input.executionDate);
      const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1) {
        streakBonus = 0;
        streakDays = 1;
      }
    }

    // カテゴリ多様性ボーナス計算
    let diversityBonus = 0;
    const categoriesCount = input.dailyCategoriesCount || 1;
    if (categoriesCount >= 4) {
      diversityBonus = 15;
    } else if (categoriesCount === 3) {
      diversityBonus = 8;
    } else if (categoriesCount === 2) {
      diversityBonus = 3;
    }

    // トランザクション作成
    const transactions: XPTransaction[] = [
      {
        type: 'EXECUTION',
        amount: baseXP,
        description: '実行記録作成'
      }
    ];

    if (timeBonus > 0) {
      transactions.push({
        type: 'TIME_BONUS',
        amount: timeBonus,
        description: `実行時間ボーナス (${executionTime}分)`
      });
    }

    if (streakBonus > 0) {
      transactions.push({
        type: 'STREAK_BONUS',
        amount: streakBonus,
        description: `ストリークボーナス (${streakDays}日連続)`
      });
    }

    if (diversityBonus > 0) {
      transactions.push({
        type: 'DIVERSITY_BONUS',
        amount: diversityBonus,
        description: `カテゴリ多様性ボーナス (${categoriesCount}カテゴリ)`
      });
    }

    // 通知生成
    const totalXP = baseXP + timeBonus + streakBonus + diversityBonus;
    const notifications: GameNotification[] = [
      {
        type: 'xp_gained',
        title: 'XPを獲得しました！',
        message: `${totalXP}XPを獲得しました`,
        data: {
          xpGained: totalXP,
          breakdown: { baseXP, timeBonus, streakBonus, diversityBonus }
        }
      }
    ];

    return {
      success: true,
      data: {
        baseXP,
        timeBonus,
        streakBonus,
        diversityBonus,
        totalXP,
        streakDays,
        transactions,
        notifications
      }
    };
  }
}