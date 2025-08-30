import { UserSettings } from '../entities/UserSettings';
import { UserId } from '../valueObjects/UserId';

export interface IUserSettingsRepository {
  findByUserId(userId: UserId): Promise<UserSettings | null>;
  save(userSettings: UserSettings): Promise<void>;
  create(userSettings: UserSettings): Promise<UserSettings>;
}