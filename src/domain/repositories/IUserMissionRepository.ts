import { UserMission } from '../entities/UserMission';

export interface IUserMissionRepository {
  getByUserId(userId: string): Promise<UserMission[]>;
  getById(id: string): Promise<UserMission | null>;
  getByUserAndMission(userId: string, missionId: string): Promise<UserMission | null>;
  create(userMission: UserMission): Promise<void>;
  update(id: string, updates: Partial<UserMission>): Promise<void>;
  getActiveUserMissions(userId: string): Promise<UserMission[]>;
  markAsCompleted(id: string): Promise<void>;
}