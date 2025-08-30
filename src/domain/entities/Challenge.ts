import { ChallengeId } from '../valueObjects/ChallengeId';

export type ChallengeDifficulty = 'easy' | 'normal' | 'hard';

export class Challenge {
  private id: ChallengeId;

  constructor(
    private readonly name: string,
    private readonly description: string,
    private readonly difficulty: ChallengeDifficulty,
    private readonly startDate: Date,
    private readonly endDate: Date,
    private readonly maxParticipants: number
  ) {
    this.id = ChallengeId.generate();
    this.validateDates();
  }

  private validateDates(): void {
    if (this.startDate >= this.endDate) {
      throw new Error('開始日は終了日より前である必要があります');
    }
  }

  public static create(
    name: string,
    description: string,
    difficulty: ChallengeDifficulty,
    startDate: Date,
    endDate: Date,
    maxParticipants: number
  ): Challenge {
    return new Challenge(name, description, difficulty, startDate, endDate, maxParticipants);
  }

  public getId(): ChallengeId {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getDifficulty(): ChallengeDifficulty {
    return this.difficulty;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date {
    return this.endDate;
  }

  public getMaxParticipants(): number {
    return this.maxParticipants;
  }

  public isActive(): boolean {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate;
  }

  public canAcceptParticipant(currentParticipantCount: number): boolean {
    return currentParticipantCount < this.maxParticipants;
  }
}