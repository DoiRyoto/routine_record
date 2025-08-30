import { InvalidNotificationTypeError } from '../../shared/types/GamificationErrors';
import { GameNotificationId } from '../valueObjects/GameNotificationId';
import { UserId } from '../valueObjects/UserId';

export type NotificationType = 
  | 'level_up' 
  | 'badge_unlocked' 
  | 'mission_completed' 
  | 'challenge_completed' 
  | 'streak_milestone' 
  | 'xp_milestone';

export interface GameNotificationPersistence {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string;
  isRead: boolean;
  createdAt: Date;
}

export class GameNotification {
  private static readonly VALID_TYPES: readonly NotificationType[] = [
    'level_up',
    'badge_unlocked', 
    'mission_completed',
    'challenge_completed',
    'streak_milestone',
    'xp_milestone'
  ] as const;

  private static readonly MAX_TITLE_LENGTH = 100;
  private static readonly MAX_MESSAGE_LENGTH = 500;

  private id: GameNotificationId;
  private isRead: boolean = false;

  constructor(
    private readonly userId: UserId,
    private readonly type: NotificationType,
    private readonly title: string,
    private readonly message: string,
    private readonly data?: string,
    private readonly createdAt: Date = new Date()
  ) {
    this.validateNotificationType(type);
    this.validateTitle(title);
    this.validateMessage(message);
    this.id = GameNotificationId.generate();
  }

  private validateNotificationType(type: NotificationType): void {
    if (!GameNotification.VALID_TYPES.includes(type)) {
      throw new InvalidNotificationTypeError(type);
    }
  }

  private validateTitle(title: string): void {
    if (!title || title.trim() === '') {
      throw new Error('タイトルは空にできません');
    }
    if (title.length > GameNotification.MAX_TITLE_LENGTH) {
      throw new Error(`タイトルは${GameNotification.MAX_TITLE_LENGTH}文字以内である必要があります`);
    }
  }

  private validateMessage(message: string): void {
    if (!message || message.trim() === '') {
      throw new Error('メッセージは空にできません');
    }
    if (message.length > GameNotification.MAX_MESSAGE_LENGTH) {
      throw new Error(`メッセージは${GameNotification.MAX_MESSAGE_LENGTH}文字以内である必要があります`);
    }
  }

  public static create(
    userId: UserId,
    type: NotificationType,
    title: string,
    message: string,
    data?: string
  ): GameNotification {
    return new GameNotification(userId, type, title, message, data);
  }

  public getId(): GameNotificationId {
    return this.id;
  }

  public getUserId(): UserId {
    return this.userId;
  }

  public getType(): NotificationType {
    return this.type;
  }

  public getTitle(): string {
    return this.title;
  }

  public getMessage(): string {
    return this.message;
  }

  public getData(): string | undefined {
    return this.data;
  }

  public getIsRead(): boolean {
    return this.isRead;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public markAsRead(): void {
    this.isRead = true;
  }

  public equals(other: GameNotification): boolean {
    return this.id.equals(other.id);
  }

  public belongsToUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  public isUnread(): boolean {
    return !this.isRead;
  }

  public toPersistence(): GameNotificationPersistence {
    return {
      id: this.id.getValue(),
      userId: this.userId.getValue(),
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      isRead: this.isRead,
      createdAt: this.createdAt
    };
  }

  public static fromPersistence(data: GameNotificationPersistence): GameNotification {
    const notification = new GameNotification(
      new UserId(data.userId),
      data.type,
      data.title,
      data.message,
      data.data,
      data.createdAt
    );

    // Set the ID and read status from persistence data
    Object.defineProperty(notification, 'id', {
      value: new GameNotificationId(data.id),
      writable: false
    });
    
    if (data.isRead) {
      notification.markAsRead();
    }

    return notification;
  }
}