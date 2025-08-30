import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CalculateExecutionXPUseCase } from '../CalculateExecutionXPUseCase';
import { ProcessLevelUpUseCase } from '../ProcessLevelUpUseCase';

// TASK-107用の新しいXP計算テスト
describe('CalculateExecutionXPUseCase - TASK-107', () => {
  let calculateXPUseCase: CalculateExecutionXPUseCase;
  let processLevelUpUseCase: ProcessLevelUpUseCase;

  beforeEach(() => {
    // これらのクラスはまだ存在しないため、テストは失敗する
    calculateXPUseCase = new CalculateExecutionXPUseCase();
    processLevelUpUseCase = new ProcessLevelUpUseCase();
  });

  describe('TC-001: 基本XP計算テスト', () => {
    it('TC-001-01: 実行記録作成時の基本XP付与', async () => {
      // Arrange
      const input = {
        executionRecordId: 'record-001',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 0
      };

      // Act
      const result = await calculateXPUseCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.baseXP).toBe(10);
      expect(result.data.timeBonus).toBe(0);
      expect(result.data.totalXP).toBe(10);
      expect(result.data.transactions).toHaveLength(1);
      expect(result.data.transactions[0].type).toBe('EXECUTION');
    });

    it('TC-001-02: 実行時間ボーナス - 15分', async () => {
      // Arrange
      const input = {
        executionRecordId: 'record-002',
        userId: 'user-001',
        routineId: 'routine-001', 
        executionTimeMinutes: 15
      };

      // Act
      const result = await calculateXPUseCase.execute(input);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.baseXP).toBe(10);
      expect(result.data.timeBonus).toBe(5);
      expect(result.data.totalXP).toBe(15);
      expect(result.data.transactions).toHaveLength(2);
    });

    it('TC-001-03: 実行時間ボーナス - 30分', async () => {
      const input = {
        executionRecordId: 'record-003',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 30
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.timeBonus).toBe(10);
      expect(result.data.totalXP).toBe(20);
    });

    it('TC-001-04: 実行時間ボーナス - 60分', async () => {
      const input = {
        executionRecordId: 'record-004',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 60
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.timeBonus).toBe(15);
      expect(result.data.totalXP).toBe(25);
    });

    it('TC-001-05: 実行時間ボーナス - 120分', async () => {
      const input = {
        executionRecordId: 'record-005',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 120
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.timeBonus).toBe(20);
      expect(result.data.totalXP).toBe(30);
    });
  });

  describe('TC-002: ストリークボーナス計算テスト', () => {
    it('TC-002-01: ストリーク1日目（ボーナスなし）', async () => {
      const input = {
        executionRecordId: 'record-006',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 0,
        executionDate: '2024-01-01'
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.streakBonus).toBe(0);
      expect(result.data.streakDays).toBe(1);
    });

    it('TC-002-02: ストリーク3日連続', async () => {
      const input = {
        executionRecordId: 'record-007',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 0,
        executionDate: '2024-01-03',
        previousStreakDays: 2
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.streakBonus).toBe(5);
      expect(result.data.streakDays).toBe(3);
    });

    it('TC-002-03: ストリーク7日連続', async () => {
      const input = {
        executionRecordId: 'record-008',
        userId: 'user-001', 
        routineId: 'routine-001',
        executionTimeMinutes: 0,
        executionDate: '2024-01-07',
        previousStreakDays: 6
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.streakBonus).toBe(15);
      expect(result.data.streakDays).toBe(7);
    });

    it('TC-002-04: ストリーク14日連続', async () => {
      const input = {
        executionRecordId: 'record-009',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 0,
        executionDate: '2024-01-14',
        previousStreakDays: 13
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.streakBonus).toBe(30);
      expect(result.data.streakDays).toBe(14);
    });

    it('TC-002-05: ストリーク30日連続', async () => {
      const input = {
        executionRecordId: 'record-010',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 0,
        executionDate: '2024-01-30',
        previousStreakDays: 29
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.streakBonus).toBe(50);
      expect(result.data.streakDays).toBe(30);
    });

    it('TC-002-06: ストリーク途切れ', async () => {
      const input = {
        executionRecordId: 'record-011',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 0,
        executionDate: '2024-01-05',
        lastExecutionDate: '2024-01-03'
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.streakBonus).toBe(0);
      expect(result.data.streakDays).toBe(1);
    });
  });

  describe('TC-003: カテゴリ多様性ボーナステスト', () => {
    it('TC-003-01: 単一カテゴリ（ボーナスなし）', async () => {
      const input = {
        executionRecordId: 'record-012',
        userId: 'user-001',
        routineId: 'routine-001',
        categoryId: 'cat-001',
        executionDate: '2024-01-01',
        dailyCategoriesCount: 1
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.diversityBonus).toBe(0);
    });

    it('TC-003-02: 2カテゴリ実行', async () => {
      const input = {
        executionRecordId: 'record-013',
        userId: 'user-001',
        routineId: 'routine-002',
        categoryId: 'cat-002',
        executionDate: '2024-01-01',
        dailyCategoriesCount: 2
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.diversityBonus).toBe(3);
    });

    it('TC-003-03: 3カテゴリ実行', async () => {
      const input = {
        executionRecordId: 'record-014',
        userId: 'user-001',
        routineId: 'routine-003',
        categoryId: 'cat-003',
        executionDate: '2024-01-01',
        dailyCategoriesCount: 3
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.diversityBonus).toBe(8);
    });

    it('TC-003-04: 4カテゴリ以上実行', async () => {
      const input = {
        executionRecordId: 'record-015',
        userId: 'user-001',
        routineId: 'routine-004', 
        categoryId: 'cat-004',
        executionDate: '2024-01-01',
        dailyCategoriesCount: 4
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.diversityBonus).toBe(15);
    });
  });

  describe('TC-004: レベル計算・更新テスト', () => {
    it('TC-004-01: レベル1 (0-99XP)', async () => {
      const input = {
        userId: 'user-001',
        currentXP: 50,
        gainedXP: 30
      };

      const result = await processLevelUpUseCase.execute(input);

      expect(result.data.newLevel).toBe(1);
      expect(result.data.leveledUp).toBe(false);
    });

    it('TC-004-02: レベル1→2へのアップ (100XP)', async () => {
      const input = {
        userId: 'user-001', 
        currentXP: 95,
        gainedXP: 10
      };

      const result = await processLevelUpUseCase.execute(input);

      expect(result.data.newLevel).toBe(2);
      expect(result.data.leveledUp).toBe(true);
      expect(result.data.notifications).toHaveLength(1);
      expect(result.data.notifications[0].type).toBe('LEVEL_UP');
    });

    it('TC-004-03: レベル2 (100-249XP)', async () => {
      const input = {
        userId: 'user-001',
        currentXP: 200,
        gainedXP: 30
      };

      const result = await processLevelUpUseCase.execute(input);

      expect(result.data.newLevel).toBe(2);
      expect(result.data.leveledUp).toBe(false);
    });

    it('TC-004-04: レベル2→3へのアップ (250XP)', async () => {
      const input = {
        userId: 'user-001',
        currentXP: 240,
        gainedXP: 15
      };

      const result = await processLevelUpUseCase.execute(input);

      expect(result.data.newLevel).toBe(3);
      expect(result.data.leveledUp).toBe(true);
    });
  });

  describe('TC-005: 通知生成テスト', () => {
    it('TC-005-01: XP獲得通知', async () => {
      const input = {
        executionRecordId: 'record-016',
        userId: 'user-001',
        routineId: 'routine-001',
        executionTimeMinutes: 15
      };

      const result = await calculateXPUseCase.execute(input);

      expect(result.data.notifications).toHaveLength(1);
      expect(result.data.notifications[0].type).toBe('xp_gained');
      expect(result.data.notifications[0].title).toBe('XPを獲得しました！');
      expect(result.data.notifications[0].message).toBe('15XPを獲得しました');
    });

    it('TC-005-02: レベルアップ通知', async () => {
      const input = {
        userId: 'user-001',
        currentXP: 95,
        gainedXP: 10
      };

      const result = await processLevelUpUseCase.execute(input);

      const levelUpNotification = result.data.notifications.find(n => n.type === 'LEVEL_UP');
      expect(levelUpNotification).toBeDefined();
      expect(levelUpNotification?.title).toBe('レベルアップ！');
      expect(levelUpNotification?.message).toBe('レベル2に到達しました！');
    });
  });
});