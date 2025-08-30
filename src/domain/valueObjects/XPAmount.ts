import { InvalidXPAmountError } from '../../shared/types/GamificationErrors';

export class XPAmount {
  constructor(private readonly value: number) {
    if (!this.isValidXPAmount(value)) {
      throw new InvalidXPAmountError(value);
    }
  }

  private isValidXPAmount(value: number): boolean {
    return (
      typeof value === 'number' &&
      !isNaN(value) &&
      isFinite(value) &&
      value >= 0
    );
  }

  public getValue(): number {
    return this.value;
  }

  public add(other: XPAmount): XPAmount {
    return new XPAmount(this.value + other.value);
  }

  public multiply(multiplier: number): XPAmount {
    const result = Math.floor(this.value * multiplier);
    return new XPAmount(result);
  }

  public equals(other: XPAmount): boolean {
    return this.value === other.value;
  }
}