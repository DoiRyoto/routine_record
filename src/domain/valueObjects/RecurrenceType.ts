export class RecurrenceType {
  private static readonly VALID_TYPES = ['daily', 'weekly', 'monthly', 'custom'] as const;
  
  constructor(private readonly value: string) {
    if (!RecurrenceType.VALID_TYPES.includes(value as typeof RecurrenceType.VALID_TYPES[number])) {
      throw new Error(`無効なRecurrenceType: ${value}. 有効な値: ${RecurrenceType.VALID_TYPES.join(', ')}`);
    }
  }

  public getValue(): string {
    return this.value;
  }

  public isDaily(): boolean {
    return this.value === 'daily';
  }

  public isWeekly(): boolean {
    return this.value === 'weekly';
  }

  public isMonthly(): boolean {
    return this.value === 'monthly';
  }

  public isCustom(): boolean {
    return this.value === 'custom';
  }

  public equals(other: RecurrenceType): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}