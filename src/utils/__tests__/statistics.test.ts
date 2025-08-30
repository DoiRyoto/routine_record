import { 
  calculateDailyExecutions,
  calculateCategoryDistribution,
  generateHeatmapData 
} from '@/utils/statistics';

// モックデータ型定義
type MockExecutionRecord = {
  executedAt: Date;
  routineId: string;
  isCompleted: boolean;
};

type MockRoutine = {
  id: string;
  categoryId: string;
  category: { name: string };
};

describe('statisticsUtils', () => {
  describe('calculateDailyExecutions', () => {
    test('日別実行回数が正しく集計される', () => {
      const executionRecords: MockExecutionRecord[] = [
        { executedAt: new Date('2025-08-01'), routineId: 'r1', isCompleted: true },
        { executedAt: new Date('2025-08-01'), routineId: 'r2', isCompleted: true },
        { executedAt: new Date('2025-08-02'), routineId: 'r1', isCompleted: true }
      ];
      
      const result = calculateDailyExecutions(executionRecords);
      
      expect(result).toEqual([
        { date: '2025-08-01', count: 2 },
        { date: '2025-08-02', count: 1 }
      ]);
    });
    
    test('空データでもエラーが発生しない', () => {
      expect(() => calculateDailyExecutions([])).not.toThrow();
      expect(calculateDailyExecutions([])).toEqual([]);
    });
  });

  describe('calculateCategoryDistribution', () => {
    test('カテゴリ別分布が正しく計算される', () => {
      const routines: MockRoutine[] = [
        { id: 'r1', categoryId: 'c1', category: { name: '健康' } },
        { id: 'r2', categoryId: 'c2', category: { name: '学習' } }
      ];
      const executionRecords: MockExecutionRecord[] = [
        { executedAt: new Date(), routineId: 'r1', isCompleted: true },
        { executedAt: new Date(), routineId: 'r1', isCompleted: true },
        { executedAt: new Date(), routineId: 'r2', isCompleted: true }
      ];
      
      const result = calculateCategoryDistribution(routines, executionRecords);
      
      expect(result).toEqual([
        { category: '健康', count: 2, percentage: 66.7 },
        { category: '学習', count: 1, percentage: 33.3 }
      ]);
    });
    
    test('空データでもエラーが発生しない', () => {
      expect(() => calculateCategoryDistribution([], [])).not.toThrow();
      expect(calculateCategoryDistribution([], [])).toEqual([]);
    });
  });

  describe('generateHeatmapData', () => {
    test('3ヶ月のヒートマップデータが生成される', () => {
      const executionRecords: MockExecutionRecord[] = [
        { executedAt: new Date('2025-08-01'), routineId: 'r1', isCompleted: true },
        { executedAt: new Date('2025-08-01'), routineId: 'r2', isCompleted: false },
        { executedAt: new Date('2025-08-02'), routineId: 'r1', isCompleted: true }
      ];
      
      const result = generateHeatmapData(executionRecords, 90);
      
      expect(result).toHaveLength(90);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('completionRate');
      expect(result[0]).toHaveProperty('executionCount');
    });
  });
});