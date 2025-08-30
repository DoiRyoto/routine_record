import { CatchupPlanId, UserId, RoutineId } from '../valueObjects';

export interface CatchupPlanData {
  id: string;
  routineId: string;
  userId: string;
  targetPeriodStart: Date;
  targetPeriodEnd: Date;
  originalTarget: number;
  currentProgress: number;
  remainingTarget: number;
  suggestedDailyTarget: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CatchupPlan {
  private readonly id: CatchupPlanId;
  private readonly userId: UserId;
  private readonly routineId: RoutineId;
  private readonly targetPeriodStart: Date;
  private readonly targetPeriodEnd: Date;
  private originalTarget: number;
  private currentProgress: number;
  private remainingTarget: number;
  private suggestedDailyTarget: number;
  private active: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(data: CatchupPlanData) {
    this.id = new CatchupPlanId(data.id);
    this.userId = new UserId(data.userId);
    this.routineId = new RoutineId(data.routineId);
    this.targetPeriodStart = data.targetPeriodStart;
    this.targetPeriodEnd = data.targetPeriodEnd;
    this.originalTarget = data.originalTarget;
    this.currentProgress = data.currentProgress;
    this.remainingTarget = data.remainingTarget;
    this.suggestedDailyTarget = data.suggestedDailyTarget;
    this.active = data.isActive ?? true;
    this.createdAt = data.createdAt ?? new Date();
    this.updatedAt = data.updatedAt ?? new Date();

    this.validateFields();
  }

  private validateFields(): void {
    if (this.targetPeriodStart >= this.targetPeriodEnd) {
      throw new Error('目標期間の開始日は終了日より前である必要があります');
    }
    
    if (this.originalTarget < 0) {
      throw new Error('元の目標は0以上である必要があります');
    }
    
    if (this.currentProgress < 0) {
      throw new Error('現在の進捗は0以上である必要があります');
    }
    
    if (this.remainingTarget < 0) {
      throw new Error('残り目標は0以上である必要があります');
    }
    
    if (this.suggestedDailyTarget < 0) {
      throw new Error('推奨1日目標は0以上である必要があります');
    }
  }

  // Business logic methods
  public updateProgress(newProgress: number): void {
    if (newProgress < 0) {
      throw new Error('進捗は0以上である必要があります');
    }
    
    this.currentProgress = newProgress;
    this.remainingTarget = Math.max(0, this.originalTarget - newProgress);
    this.recalculateDailyTarget();
    this.updatedAt = new Date();
  }

  public updateTarget(newTarget: number): void {
    if (newTarget < 0) {
      throw new Error('目標は0以上である必要があります');
    }
    
    this.originalTarget = newTarget;
    this.remainingTarget = Math.max(0, newTarget - this.currentProgress);
    this.recalculateDailyTarget();
    this.updatedAt = new Date();
  }

  public deactivate(): void {
    this.active = false;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.active = true;
    this.updatedAt = new Date();
  }

  public reactivate(): void {
    this.activate();
  }

  private recalculateDailyTarget(): void {
    const now = new Date();
    const remainingDays = Math.max(1, Math.ceil((this.targetPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    this.suggestedDailyTarget = Math.ceil(this.remainingTarget / remainingDays);
  }

  // Query methods
  public isCompleted(): boolean {
    return this.currentProgress >= this.originalTarget;
  }

  public isExpired(): boolean {
    return new Date() > this.targetPeriodEnd;
  }

  public getRemainingDays(currentDate?: Date): number {
    const now = currentDate || new Date();
    return Math.max(0, Math.ceil((this.targetPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  public getProgressPercentage(): number {
    if (this.originalTarget === 0) return 100;
    return Math.round((this.currentProgress / this.originalTarget) * 100);
  }

  public getDifficultyLevel(): 'easy' | 'moderate' | 'hard' | 'extreme' {
    const dailyRatio = this.suggestedDailyTarget;
    
    if (dailyRatio <= 1) return 'easy';
    if (dailyRatio <= 2) return 'moderate';
    if (dailyRatio <= 4) return 'hard';
    return 'extreme';
  }

  public isAchievable(): boolean {
    // Consider extreme difficulty as not achievable
    return this.getDifficultyLevel() !== 'extreme';
  }

  // Getters
  public getId(): CatchupPlanId {
    return this.id;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getRoutineId(): RoutineId {
    return this.routineId;
  }

  public getTargetPeriodStart(): Date {
    return this.targetPeriodStart;
  }

  public getTargetPeriodEnd(): Date {
    return this.targetPeriodEnd;
  }

  public getOriginalTarget(): number {
    return this.originalTarget;
  }

  public getCurrentProgress(): number {
    return this.currentProgress;
  }

  public getRemainingTarget(): number {
    return this.remainingTarget;
  }

  public getSuggestedDailyTarget(): number {
    return this.suggestedDailyTarget;
  }

  public isActive(): boolean {
    return this.active;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Comparison methods
  public equals(other: CatchupPlan): boolean {
    return this.id.equals(other.id);
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  public belongsToRoutine(routineId: RoutineId): boolean {
    return this.routineId.equals(routineId);
  }

  // Serialization methods expected by tests
  public toPlainObject(): any {
    return this.toPersistence();
  }

  public getHashCode(): number {
    return this.id.getValue().length; // Simple hash for testing
  }

  // Persistence methods
  public toPersistence(): {
    id: string;
    userId: string;
    routineId: string;
    targetPeriodStart: Date;
    targetPeriodEnd: Date;
    originalTarget: number;
    currentProgress: number;
    remainingTarget: number;
    suggestedDailyTarget: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      routineId: this.routineId.getValue(),
      targetPeriodStart: this.targetPeriodStart,
      targetPeriodEnd: this.targetPeriodEnd,
      originalTarget: this.originalTarget,
      currentProgress: this.currentProgress,
      remainingTarget: this.remainingTarget,
      suggestedDailyTarget: this.suggestedDailyTarget,
      isActive: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public static fromPersistence(data: {
    id: string;
    userId: string;
    routineId: string;
    targetPeriodStart: Date | string;
    targetPeriodEnd: Date | string;
    originalTarget: number;
    currentProgress: number;
    remainingTarget: number;
    suggestedDailyTarget: number;
    isActive?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }): CatchupPlan {
    return new CatchupPlan({
      id: data.id,
      userId: data.userId,
      routineId: data.routineId,
      targetPeriodStart: typeof data.targetPeriodStart === 'string' ? new Date(data.targetPeriodStart) : data.targetPeriodStart,
      targetPeriodEnd: typeof data.targetPeriodEnd === 'string' ? new Date(data.targetPeriodEnd) : data.targetPeriodEnd,
      originalTarget: data.originalTarget,
      currentProgress: data.currentProgress,
      remainingTarget: data.remainingTarget,
      suggestedDailyTarget: data.suggestedDailyTarget,
      isActive: data.isActive ?? true,
      createdAt: typeof data.createdAt === 'string' ? new Date(data.createdAt) : data.createdAt,
      updatedAt: typeof data.updatedAt === 'string' ? new Date(data.updatedAt) : data.updatedAt,
    });
  }
}