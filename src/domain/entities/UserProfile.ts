import { UserId } from '../valueObjects/UserId';
import { Level } from '../valueObjects/Level';
import { XPAmount } from '../valueObjects/XPAmount';

export class UserProfile {
  private level: Level = new Level(1);
  private totalXP: XPAmount = new XPAmount(0);

  constructor(private readonly userId: UserId) {}

  public static create(userId: UserId): UserProfile {
    return new UserProfile(userId);
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getLevel(): Level {
    return this.level;
  }

  public getTotalXP(): XPAmount {
    return this.totalXP;
  }

  public addXP(xpAmount: XPAmount): void {
    this.totalXP = this.totalXP.add(xpAmount);
  }

  public setLevel(level: Level): void {
    this.level = level;
  }

  public setTotalXP(xpAmount: XPAmount): void {
    this.totalXP = xpAmount;
  }
}