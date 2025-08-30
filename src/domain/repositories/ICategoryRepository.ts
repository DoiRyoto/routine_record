import { Category } from '../entities/Category';
import { CategoryId, UserId } from '../valueObjects';

export interface ICategoryRepository {
  /**
   * IDでカテゴリを取得
   */
  findById(id: CategoryId): Promise<Category | null>;

  /**
   * ユーザーIDでカテゴリ一覧を取得
   */
  findByUserId(userId: UserId, includeInactive?: boolean): Promise<Category[]>;

  /**
   * ユーザーIDと名前でカテゴリを検索（重複チェック用）
   */
  findByUserIdAndName(userId: UserId, name: string): Promise<Category | null>;

  /**
   * ユーザーのデフォルトカテゴリを取得
   */
  findDefaultByUserId(userId: UserId): Promise<Category[]>;

  /**
   * カテゴリを保存（新規作成・更新両方）
   */
  save(category: Category): Promise<void>;

  /**
   * カテゴリを削除
   */
  delete(id: CategoryId): Promise<void>;

  /**
   * カテゴリがルーチンで使用されているかチェック
   */
  isUsedInRoutines(categoryId: CategoryId): Promise<boolean>;

  /**
   * カテゴリを使用しているルーチン数を取得
   */
  countUsedInRoutines(categoryId: CategoryId): Promise<number>;

  /**
   * ユーザーのカテゴリ数を取得
   */
  countByUserId(userId: UserId): Promise<number>;

  /**
   * ユーザーのアクティブカテゴリ数を取得
   */
  countActiveByUserId(userId: UserId): Promise<number>;
}