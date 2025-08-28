import { ExecutionRecordId, UserId, RoutineId } from '../valueObjects';

export class ExecutionRecord {
  constructor(
    private readonly id: ExecutionRecordId,
    private readonly userId: UserId,
    private readonly routineId: RoutineId,
    private readonly executedAt: Date,
    private duration: number | null = null,
    private memo: string | null = null,
    private readonly createdAt: Date = new Date(),
    private updatedAt: Date = new Date()
  ) {
    this.validateFields();
  }

  private validateFields(): void {
    if (this.executedAt > new Date()) {
      throw new Error('実行日時は現在時刻より未来にできません');
    }
    
    if (this.duration !== null && this.duration <= 0) {
      throw new Error('実行時間は0より大きい値である必要があります');
    }
    
    if (this.memo !== null && this.memo.length > 500) {
      throw new Error('メモは500文字以内である必要があります');
    }
  }

  // ビジネスロジック
  public updateDuration(duration: number | null): void {
    if (duration !== null && duration <= 0) {
      throw new Error('実行時間は0より大きい値である必要があります');
    }
    
    this.duration = duration;
    this.updatedAt = new Date();
  }

  public updateMemo(memo: string | null): void {
    if (memo !== null && memo.length > 500) {
      throw new Error('メモは500文字以内である必要があります');
    }
    
    this.memo = memo;
    this.updatedAt = new Date();
  }

  // 実行日時に基づく判定メソッド
  public isExecutedOn(date: Date): boolean {
    const executedDate = new Date(this.executedAt);
    executedDate.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return executedDate.getTime() === targetDate.getTime();
  }

  public isExecutedToday(): boolean {
    return this.isExecutedOn(new Date());
  }

  public isExecutedInDateRange(startDate: Date, endDate: Date): boolean {
    return this.executedAt >= startDate && this.executedAt <= endDate;
  }

  public getWeekNumber(): number {
    const date = new Date(this.executedAt);
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
  }

  public getMonth(): number {
    return this.executedAt.getMonth() + 1; // 1-12
  }

  public getYear(): number {
    return this.executedAt.getFullYear();
  }

  // ゲッター
  public getId(): ExecutionRecordId {
    return this.id;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getRoutineId(): RoutineId {
    return this.routineId;
  }

  public getExecutedAt(): Date {
    return this.executedAt;
  }

  public getDuration(): number | null {
    return this.duration;
  }

  public getMemo(): string | null {
    return this.memo;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // 比較・判定メソッド
  public equals(other: ExecutionRecord): boolean {
    return this.id.equals(other.id);
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  public belongsToRoutine(routineId: RoutineId): boolean {
    return this.routineId.equals(routineId);
  }

  public hasDuration(): boolean {
    return this.duration !== null;
  }

  public hasMemo(): boolean {
    return this.memo !== null && this.memo.trim() !== '';
  }

  // 永続化用メソッド
  public toPersistence(): {
    id: string;
    userId: string;
    routineId: string;
    executedAt: Date;
    duration: number | null;
    memo: string | null;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      routineId: this.routineId.getValue(),
      executedAt: this.executedAt,
      duration: this.duration,
      memo: this.memo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: {
    id: string;
    userId: string;
    routineId: string;
    executedAt: Date | string;
    duration?: number | null;
    memo?: string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): ExecutionRecord {
    return new ExecutionRecord(
      new ExecutionRecordId(data.id),
      new UserId(data.userId),
      new RoutineId(data.routineId),
      typeof data.executedAt === 'string' ? new Date(data.executedAt) : data.executedAt,
      data.duration ?? null,
      data.memo ?? null,
      typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
      typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : data.updatedAt
    );
  }
}