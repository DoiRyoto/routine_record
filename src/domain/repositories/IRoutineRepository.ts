import { Routine } from '../entities/Routine';
import { RoutineId, UserId } from '../valueObjects';

export interface IRoutineRepository {
  /**
   * IDでルーティンを取得
   */
  findById(id: RoutineId): Promise<Routine | null>;

  /**
   * ユーザーIDでルーティン一覧を取得
   */
  findByUserId(userId: UserId): Promise<Routine[]>;

  /**
   * ユーザーのアクティブなルーティン一覧を取得
   */
  findActiveByUserId(userId: UserId): Promise<Routine[]>;

  /**
   * ルーティンを保存（新規作成・更新両方）
   */
  save(routine: Routine): Promise<void>;

  /**
   * ルーティンを削除（ソフトデリート）
   */
  delete(id: RoutineId): Promise<void>;

  /**
   * 特定のユーザーのルーティンが存在するかチェック
   */
  existsByUserIdAndId(userId: UserId, id: RoutineId): Promise<boolean>;

  /**
   * カテゴリ別のルーティン一覧を取得
   */
  findByUserIdAndCategory(userId: UserId, category: string): Promise<Routine[]>;

  /**
   * 指定した日付に実行すべきルーティン一覧を取得
   * （スケジュールベースのルーティンに使用）
   */
  findScheduledForDate(userId: UserId, date: Date): Promise<Routine[]>;

  /**
   * 頻度ベースのルーティン一覧を取得
   */
  findFrequencyBasedByUserId(userId: UserId): Promise<Routine[]>;

  /**
   * 統計用：ユーザーの全ルーティン数（アクティブ・非アクティブ含む）
   */
  countByUserId(userId: UserId): Promise<number>;

  /**
   * 統計用：ユーザーのアクティブなルーティン数
   */
  countActiveByUserId(userId: UserId): Promise<number>;
}