import { IGameNotificationRepository } from '../../domain/repositories/IGameNotificationRepository';
import { UserId } from '../../domain/valueObjects/UserId';
import { GetGameNotificationsDto } from '../dtos/GetGameNotificationsDto';
import { Result, success, failure } from '../../shared/types';

export interface GetGameNotificationsResult {
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    data?: string;
    isRead: boolean;
    createdAt: Date;
  }>;
  totalCount: number;
  unreadCount: number;
  hasUnread: boolean;
}

export class GetGameNotificationsUseCase {
  constructor(
    private readonly notificationRepository: IGameNotificationRepository
  ) {}

  public async execute(dto: GetGameNotificationsDto): Promise<Result<GetGameNotificationsResult>> {
    try {
      // Validate inputs
      const validationResult = this.validateDto(dto);
      if (validationResult.isFailure) {
        return validationResult;
      }

      const userId = new UserId(dto.userId);
      const limit = dto.limit ?? 20;
      const offset = dto.offset ?? 0;

      // Get notifications
      let notifications;
      if (dto.includeRead) {
        notifications = await this.notificationRepository.findByUserId(userId, limit, offset, true);
      } else {
        notifications = await this.notificationRepository.findUnreadByUserId(userId, limit, offset);
      }

      // Filter by type if specified
      if (dto.typeFilter && dto.typeFilter.length > 0) {
        notifications = notifications.filter(n => dto.typeFilter!.includes(n.getType()));
      }

      // Calculate statistics
      const totalCount = notifications.length;
      const unreadCount = notifications.filter(n => n.isUnread()).length;
      const hasUnread = unreadCount > 0;

      const result: GetGameNotificationsResult = {
        notifications: notifications.map(n => ({
          id: n.getId().getValue(),
          type: n.getType(),
          title: n.getTitle(),
          message: n.getMessage(),
          data: n.getData(),
          isRead: n.getIsRead(),
          createdAt: n.getCreatedAt()
        })),
        totalCount,
        unreadCount,
        hasUnread
      };

      return success(result);
    } catch (error) {
      return failure(error as Error);
    }
  }

  private validateDto(dto: GetGameNotificationsDto): Result<void> {
    try {
      // Validate userId
      new UserId(dto.userId);

      // Validate limit and offset
      if (dto.limit !== undefined && dto.limit < 1) {
        throw new Error('limit は1以上である必要があります');
      }
      if (dto.offset !== undefined && dto.offset < 0) {
        throw new Error('offset は0以上である必要があります');
      }

      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }
}