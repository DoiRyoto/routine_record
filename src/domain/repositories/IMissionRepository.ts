import { Mission } from '../entities/Mission';

export interface IMissionRepository {
  getById(id: string): Promise<Mission | null>;
  getAll(): Promise<Mission[]>;
  getActiveByUserId(userId: string): Promise<Mission[]>;
  create(mission: Mission): Promise<void>;
  update(id: string, mission: Partial<Mission>): Promise<void>;
  delete(id: string): Promise<void>;
}