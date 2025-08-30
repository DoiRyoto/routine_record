import { InvalidLevelError } from '../../shared/types/GamificationErrors';

export class Level {
  private static readonly MAX_LEVEL = 100;

  constructor(private readonly value: number) {
    if (!this.isValidLevel(value)) {
      throw new InvalidLevelError(value);
    }
  }

  private isValidLevel(value: number): boolean {
    return (
      typeof value === 'number' &&
      !isNaN(value) &&
      isFinite(value) &&
      value >= 1 &&
      value <= Level.MAX_LEVEL
    );
  }

  public getValue(): number {
    return this.value;
  }

  public calculateNextLevelXP(): number {
    if (this.isMaxLevel()) {
      throw new Error('最大レベルに達しています');
    }
    return (this.value + 1) * 100;
  }

  public levelUp(): Level {
    if (this.isMaxLevel()) {
      throw new Error('最大レベルに達しています');
    }
    return new Level(this.value + 1);
  }

  public equals(other: Level): boolean {
    return this.value === other.value;
  }

  public isMaxLevel(): boolean {
    return this.value === Level.MAX_LEVEL;
  }
}