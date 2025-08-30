import { CategoryId, UserId } from '../valueObjects';
import { 
  CategoryNameEmptyError,
  CategoryNameTooLongError
} from '../../shared/types/CategoryErrors';

export class Category {
  public static readonly DEFAULT_COLOR = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  private static readonly MAX_NAME_LENGTH = 50;
  constructor(
    private readonly id: CategoryId,
    private readonly userId: UserId,
    private name: string,
    private color: string = Category.DEFAULT_COLOR,
    private readonly isDefault: boolean = false,
    private isActive: boolean = true,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {
    this.validateFields();
  }

  private validateFields(): void {
    if (!this.name || this.name.trim() === '') {
      throw new CategoryNameEmptyError();
    }
    
    if (this.name.length > Category.MAX_NAME_LENGTH) {
      throw new CategoryNameTooLongError();
    }
  }

  // 静的バリデーションメソッド
  public static validateCategoryData(name: string, color?: string): void {
    if (!name || name.trim() === '') {
      throw new CategoryNameEmptyError();
    }
    
    if (name.length > Category.MAX_NAME_LENGTH) {
      throw new CategoryNameTooLongError();
    }
  }

  // ビジネスロジック
  public updateName(name: string): void {
    Category.validateCategoryData(name, this.color);
    this.name = name;
    this.updatedAt = new Date();
  }

  public updateColor(color: string): void {
    this.color = color;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // ゲッター
  public getId(): CategoryId {
    return this.id;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getName(): string {
    return this.name;
  }

  public getColor(): string {
    return this.color;
  }

  public getIsDefault(): boolean {
    return this.isDefault;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // 比較・判定メソッド
  public equals(other: Category): boolean {
    return this.id.equals(other.id);
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  public isDefaultCategory(): boolean {
    return this.isDefault;
  }

  public isActiveCategory(): boolean {
    return this.isActive;
  }

  // 永続化用メソッド
  public toPersistence(): {
    id: string;
    userId: string;
    name: string;
    color: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      name: this.name,
      color: this.color,
      isDefault: this.isDefault,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: {
    id: string;
    userId: string;
    name: string;
    color: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): Category {
    return new Category(
      new CategoryId(data.id),
      new UserId(data.userId),
      data.name,
      data.color,
      data.isDefault,
      data.isActive,
      typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
      typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : data.updatedAt
    );
  }
}