import { DomainError } from './DomainError';

// チャレンジ関連エラー
export class ChallengeFullError extends DomainError {
  constructor(challengeId: string) {
    super(`チャレンジ '${challengeId}' は定員に達しています`, 'CHALLENGE_FULL');
  }
}

export class DuplicateParticipationError extends DomainError {
  constructor(challengeId: string) {
    super(`チャレンジ '${challengeId}' には既に参加しています`, 'DUPLICATE_PARTICIPATION');
  }
}

export class ChallengeNotActiveError extends DomainError {
  constructor(challengeId: string) {
    super(`チャレンジ '${challengeId}' は現在アクティブではありません`, 'CHALLENGE_NOT_ACTIVE');
  }
}

export class ChallengeNotFoundError extends DomainError {
  constructor(challengeId: string) {
    super(`チャレンジ '${challengeId}' が見つかりません`, 'CHALLENGE_NOT_FOUND');
  }
}

// XP関連エラー
export class InvalidXPAmountError extends DomainError {
  constructor(amount: number) {
    super(`無効なXP値です: ${amount}. XPは0以上である必要があります`, 'INVALID_XP_AMOUNT');
  }
}

export class InvalidXPSourceError extends DomainError {
  constructor(source: string) {
    super(`無効なXPソースです: '${source}'`, 'INVALID_XP_SOURCE');
  }
}

export class XPCalculationError extends DomainError {
  constructor(reason: string) {
    super(`XP計算エラー: ${reason}`, 'XP_CALCULATION_ERROR');
  }
}

// レベル関連エラー
export class InvalidLevelError extends DomainError {
  constructor(level: number) {
    super(`無効なレベル値です: ${level}. レベルは1以上である必要があります`, 'INVALID_LEVEL');
  }
}

export class MaxLevelReachedError extends DomainError {
  constructor() {
    super('最大レベルに達しています', 'MAX_LEVEL_REACHED');
  }
}

// 通知関連エラー
export class NotificationNotFoundError extends DomainError {
  constructor(notificationId: string) {
    super(`通知 '${notificationId}' が見つかりません`, 'NOTIFICATION_NOT_FOUND');
  }
}

export class InvalidNotificationTypeError extends DomainError {
  constructor(type: string) {
    super(`無効な通知タイプです: '${type}'`, 'INVALID_NOTIFICATION_TYPE');
  }
}