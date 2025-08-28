import { RoutineId, UserId, GoalType, RecurrenceType } from '../valueObjects';

export class Routine {
  constructor(
    private readonly id: RoutineId,
    private readonly userId: UserId,
    private name: string,
    private description: string | null,
    private category: string,
    private goalType: GoalType,
    private recurrenceType: RecurrenceType,
    private targetCount: number | null = null,
    private targetPeriod: string | null = null,
    private recurrenceInterval: number = 1,
    private isActive: boolean = true,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {
    this.validateFields();
  }

  private validateFields(): void {
    if (!this.name.trim()) {
      throw new Error('ルーティン名は必須です');
    }
    
    if (!this.category.trim()) {
      throw new Error('カテゴリは必須です');
    }
    
    if (this.goalType.isFrequencyBased()) {
      if (!this.targetCount || this.targetCount <= 0) {
        throw new Error('頻度ベースのルーティンは目標回数が必要です');
      }
      if (!this.targetPeriod) {
        throw new Error('頻度ベースのルーティンは目標期間が必要です');
      }
    }
    
    if (this.recurrenceInterval <= 0) {
      throw new Error('繰り返し間隔は1以上である必要があります');
    }
  }

  // ビジネスロジック
  public complete(_executedAt: Date = new Date()): void {
    if (!this.isActive) {
      throw new Error('非アクティブなルーティンは実行できません');
    }
    
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  public updateName(name: string): void {
    if (!name.trim()) {
      throw new Error('ルーティン名は必須です');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  public updateDescription(description: string | null): void {
    this.description = description;
    this.updatedAt = new Date();
  }

  public updateCategory(category: string): void {
    if (!category.trim()) {
      throw new Error('カテゴリは必須です');
    }
    this.category = category.trim();
    this.updatedAt = new Date();
  }

  public updateGoalSettings(
    goalType: GoalType,
    targetCount?: number | null,
    targetPeriod?: string | null
  ): void {
    this.goalType = goalType;
    this.targetCount = targetCount ?? null;
    this.targetPeriod = targetPeriod ?? null;
    
    this.validateFields(); // 新しい設定が有効かチェック
    this.updatedAt = new Date();
  }

  public updateRecurrenceSettings(
    recurrenceType: RecurrenceType,
    interval: number = 1
  ): void {
    if (interval <= 0) {
      throw new Error('繰り返し間隔は1以上である必要があります');
    }
    
    this.recurrenceType = recurrenceType;
    this.recurrenceInterval = interval;
    this.updatedAt = new Date();
  }

  // ゲッター
  public getId(): RoutineId {
    return this.id;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string | null {
    return this.description;
  }

  public getCategory(): string {
    return this.category;
  }

  public getGoalType(): GoalType {
    return this.goalType;
  }

  public getRecurrenceType(): RecurrenceType {
    return this.recurrenceType;
  }

  public getTargetCount(): number | null {
    return this.targetCount;
  }

  public getTargetPeriod(): string | null {
    return this.targetPeriod;
  }

  public getRecurrenceInterval(): number {
    return this.recurrenceInterval;
  }

  public isCurrentlyActive(): boolean {
    return this.isActive;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // 比較・判定メソッド
  public equals(other: Routine): boolean {
    return this.id.equals(other.id);
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  public isScheduleBased(): boolean {
    return this.goalType.isScheduleBased();
  }

  public isFrequencyBased(): boolean {
    return this.goalType.isFrequencyBased();
  }

  // ドメインオブジェクトから永続化用のプレーンオブジェクトに変換
  public toPersistence(): {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    category: string;
    goalType: string;
    recurrenceType: string;
    targetCount: number | null;
    targetPeriod: string | null;
    recurrenceInterval: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      name: this.name,
      description: this.description,
      category: this.category,
      goalType: this.goalType.getValue(),
      recurrenceType: this.recurrenceType.getValue(),
      targetCount: this.targetCount,
      targetPeriod: this.targetPeriod,
      recurrenceInterval: this.recurrenceInterval,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // 永続化されたデータからドメインオブジェクトを復元
  public static fromPersistence(data: {
    id: string;
    userId: string;
    name: string;
    description: string | null;
    category: string;
    goalType: string;
    recurrenceType: string;
    targetCount?: number | null;
    targetPeriod?: string | null;
    recurrenceInterval?: number;
    isActive?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
    deletedAt?: Date | string | null;
  }): Routine {
    return new Routine(
      new RoutineId(data.id),
      new UserId(data.userId),
      data.name,
      data.description,
      data.category,
      new GoalType(data.goalType),
      new RecurrenceType(data.recurrenceType),
      data.targetCount ?? null,
      data.targetPeriod ?? null,
      data.recurrenceInterval ?? 1,
      data.isActive ?? true,
      typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
      typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : data.updatedAt
    );
  }
}