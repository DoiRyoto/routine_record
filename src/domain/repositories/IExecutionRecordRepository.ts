import { ExecutionRecord } from '../entities/ExecutionRecord';
import { ExecutionRecordId, UserId, RoutineId } from '../valueObjects';

export interface IExecutionRecordRepository {
  /**
   * IDで実行記録を取得
   */
  findById(id: ExecutionRecordId): Promise<ExecutionRecord | null>;
  
  /**
   * Alternative methods for test compatibility
   */
  getById(id: string): Promise<ExecutionRecord | null>;
  getByUserId(userId: string): Promise<ExecutionRecord[]>;
  create(executionRecord: any): Promise<ExecutionRecord>;
  update(id: string, executionRecord: any): Promise<void>;
  delete(id: string): Promise<void>;
  getByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<ExecutionRecord[]>;
  getByUserAndMissionPeriod(userId: string, missionStartDate?: Date): Promise<ExecutionRecord[]>;

  /**
   * ユーザーIDで実行記録一覧を取得
   */
  findByUserId(userId: UserId): Promise<ExecutionRecord[]>;

  /**
   * ルーティンIDで実行記録一覧を取得
   */
  findByRoutineId(routineId: RoutineId): Promise<ExecutionRecord[]>;

  /**
   * ユーザーIDとルーティンIDで実行記録一覧を取得
   */
  findByUserIdAndRoutineId(userId: UserId, routineId: RoutineId): Promise<ExecutionRecord[]>;

  /**
   * 日付範囲で実行記録を取得
   */
  findByUserIdAndDateRange(
    userId: UserId,
    startDate: Date,
    endDate: Date
  ): Promise<ExecutionRecord[]>;

  /**
   * ルーティンIDと日付範囲で実行記録を取得
   */
  findByRoutineIdAndDateRange(
    routineId: RoutineId,
    startDate: Date,
    endDate: Date
  ): Promise<ExecutionRecord[]>;

  /**
   * 特定の日付の実行記録を取得
   */
  findByUserIdAndDate(userId: UserId, date: Date): Promise<ExecutionRecord[]>;

  /**
   * 実行記録を保存（新規作成・更新両方）
   */
  save(executionRecord: ExecutionRecord): Promise<void>;

  /**
   * 実行記録を削除
   */
  delete(id: ExecutionRecordId): Promise<void>;

  /**
   * 特定のルーティンの今日の実行記録があるかチェック
   */
  existsTodayByRoutineId(routineId: RoutineId): Promise<boolean>;

  /**
   * 特定のルーティンの特定日の実行記録があるかチェック
   */
  existsByRoutineIdAndDate(routineId: RoutineId, date: Date): Promise<boolean>;

  /**
   * 統計用：ユーザーの総実行記録数
   */
  countByUserId(userId: UserId): Promise<number>;

  /**
   * 統計用：ルーティンの実行記録数
   */
  countByRoutineId(routineId: RoutineId): Promise<number>;

  /**
   * 統計用：期間内の実行記録数
   */
  countByUserIdAndDateRange(
    userId: UserId,
    startDate: Date,
    endDate: Date
  ): Promise<number>;

  /**
   * ストリーク計算用：最新の連続実行記録を取得
   */
  findLatestStreakByRoutineId(routineId: RoutineId): Promise<ExecutionRecord[]>;

  /**
   * 週間実行記録を取得（週のはじめの日曜日から計算）
   */
  findWeeklyByUserIdAndWeek(
    userId: UserId,
    year: number,
    week: number
  ): Promise<ExecutionRecord[]>;

  /**
   * 月間実行記録を取得
   */
  findMonthlyByUserIdAndMonth(
    userId: UserId,
    year: number,
    month: number
  ): Promise<ExecutionRecord[]>;
}