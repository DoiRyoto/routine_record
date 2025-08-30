export interface IUserBadgeRepository {
  getUserBadges(userId: string): Promise<any[]>;
  create(userBadge: any): Promise<void>;
  awardBadge(userId: string, badgeId: string): Promise<void>;
}