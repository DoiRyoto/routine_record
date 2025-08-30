import { NotificationType } from '../../domain/entities/GameNotification';

export interface GetGameNotificationsDto {
  userId: string;
  includeRead: boolean;
  limit?: number;
  offset?: number;
  typeFilter?: NotificationType[];
}