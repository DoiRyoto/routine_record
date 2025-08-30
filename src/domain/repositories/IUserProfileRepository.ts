import { UserProfile } from '../entities/UserProfile';
import { UserId } from '../valueObjects/UserId';

export interface IUserProfileRepository {
  findByUserId(userId: UserId): Promise<UserProfile | null>;
  save(userProfile: UserProfile): Promise<void>;
  exists(userId: UserId): Promise<boolean>;
  
  // Additional methods for mission progress system
  getByUserId(userId: string): Promise<UserProfile | null>;
  create(userProfile: UserProfile): Promise<void>;
  update(userId: string, updates: Partial<UserProfile>): Promise<void>;
  addXP(userId: string, xpAmount: number): Promise<void>;
}