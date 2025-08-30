import { DomainError } from './DomainError';

export class InactiveRoutineError extends DomainError {
  constructor(routineId: string) {
    super(
      `非アクティブなルーチン '${routineId}' は実行記録を作成できません`,
      'INACTIVE_ROUTINE'
    );
  }
}

export class InvalidExecutionDateError extends DomainError {
  constructor() {
    super(
      '実行日時は現在時刻より未来にできません',
      'INVALID_EXECUTION_DATE'
    );
  }
}

export class InvalidDurationError extends DomainError {
  constructor() {
    super(
      '実行時間は0より大きい値である必要があります',
      'INVALID_DURATION'
    );
  }
}

export class MemoTooLongError extends DomainError {
  constructor() {
    super(
      'メモは500文字以内である必要があります',
      'MEMO_TOO_LONG'
    );
  }
}

export class ExecutionRecordNotFoundError extends DomainError {
  constructor(id: string) {
    super(
      `実行記録 '${id}' が見つかりません`,
      'EXECUTION_RECORD_NOT_FOUND'
    );
  }
}

export class ExecutionRecordAccessForbiddenError extends DomainError {
  constructor(id: string) {
    super(
      `実行記録 '${id}' へのアクセス権限がありません`,
      'EXECUTION_RECORD_ACCESS_FORBIDDEN'
    );
  }
}