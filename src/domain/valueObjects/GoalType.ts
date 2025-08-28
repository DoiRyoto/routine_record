export class GoalType {
  private static readonly VALID_TYPES = ['frequency_based', 'schedule_based'] as const;
  
  constructor(private readonly value: string) {
    if (!GoalType.VALID_TYPES.includes(value as typeof GoalType.VALID_TYPES[number])) {
      throw new Error(`無効なGoalType: ${value}. 有効な値: ${GoalType.VALID_TYPES.join(', ')}`);
    }
  }

  public getValue(): string {
    return this.value;
  }

  public isFrequencyBased(): boolean {
    return this.value === 'frequency_based';
  }

  public isScheduleBased(): boolean {
    return this.value === 'schedule_based';
  }

  public equals(other: GoalType): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}