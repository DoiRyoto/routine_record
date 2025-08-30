export type MissionType = 'streak' | 'count' | 'variety' | 'consistency';
export type MissionDifficulty = 'easy' | 'medium' | 'hard' | 'extreme';

export interface MissionProps {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  targetValue: number;
  xpReward: number;
  difficulty: MissionDifficulty;
  isActive: boolean;
  badgeId: string | null;
}

export class Mission {
  private readonly _props: MissionProps;

  constructor(props: MissionProps) {
    this._props = { ...props };
  }

  get id(): string {
    return this._props.id;
  }

  get title(): string {
    return this._props.title;
  }

  get description(): string {
    return this._props.description;
  }

  get type(): MissionType {
    return this._props.type;
  }

  get targetValue(): number {
    return this._props.targetValue;
  }

  get xpReward(): number {
    return this._props.xpReward;
  }

  get difficulty(): MissionDifficulty {
    return this._props.difficulty;
  }

  get isActive(): boolean {
    return this._props.isActive;
  }

  get badgeId(): string | null {
    return this._props.badgeId;
  }

  public toObject(): MissionProps {
    return { ...this._props };
  }
}