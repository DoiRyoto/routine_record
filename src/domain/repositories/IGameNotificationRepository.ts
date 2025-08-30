import { GameNotification, NotificationType } from '../entities/GameNotification';
import { GameNotificationId } from '../valueObjects/GameNotificationId';
import { UserId } from '../valueObjects/UserId';

export interface IGameNotificationRepository {
  findByUserId(userId: UserId, limit?: number, offset?: number, includeRead?: boolean): Promise<GameNotification[]>;
  findUnreadByUserId(userId: UserId, limit?: number, offset?: number): Promise<GameNotification[]>;
  findById(id: GameNotificationId): Promise<GameNotification | null>;
  save(notification: GameNotification): Promise<void>;
  markAsRead(id: GameNotificationId): Promise<void>;
  deleteOldNotifications(olderThanDays: number): Promise<void>;
  
  // Additional methods for mission progress system
  getByUserId(userId: string): Promise<GameNotification[]>;
  create(notification: any): Promise<void>;
}