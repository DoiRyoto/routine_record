export interface UserMissionProps {
  id: string;
  userId: string;
  missionId: string;
  progress: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt: Date | null;
  claimedAt: Date | null;
}

export class UserMission {
  private readonly _props: UserMissionProps;

  constructor(props: UserMissionProps) {
    this._props = { ...props };
  }

  get id(): string {
    return this._props.id;
  }

  get userId(): string {
    return this._props.userId;
  }

  get missionId(): string {
    return this._props.missionId;
  }

  get progress(): number {
    return this._props.progress;
  }

  get isCompleted(): boolean {
    return this._props.isCompleted;
  }

  get startedAt(): Date {
    return this._props.startedAt;
  }

  get completedAt(): Date | null {
    return this._props.completedAt;
  }

  get claimedAt(): Date | null {
    return this._props.claimedAt;
  }

  public updateProgress(newProgress: number): void {
    (this._props as any).progress = newProgress;
  }

  public markAsCompleted(): void {
    (this._props as any).isCompleted = true;
    (this._props as any).completedAt = new Date();
  }

  public toObject(): UserMissionProps {
    return { ...this._props };
  }
}