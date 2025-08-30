import { DomainError } from './DomainError';

export class CategoryNameConflictError extends DomainError {
  constructor(name: string) {
    super(
      `カテゴリ名 '${name}' は既に存在します`,
      'CATEGORY_NAME_CONFLICT'
    );
  }
}

export class DefaultCategoryModificationError extends DomainError {
  constructor(categoryId: string) {
    super(
      `デフォルトカテゴリ '${categoryId}' は変更できません`,
      'DEFAULT_CATEGORY_MODIFICATION'
    );
  }
}

export class CategoryInUseError extends DomainError {
  constructor(categoryId: string, usedByRoutines: number) {
    super(
      `カテゴリ '${categoryId}' は ${usedByRoutines} 個のルーチンで使用中のため削除できません`,
      'CATEGORY_IN_USE'
    );
  }
}

export class CategoryNotFoundError extends DomainError {
  constructor(id: string) {
    super(
      `カテゴリ '${id}' が見つかりません`,
      'CATEGORY_NOT_FOUND'
    );
  }
}

export class CategoryAccessForbiddenError extends DomainError {
  constructor(id: string) {
    super(
      `カテゴリ '${id}' へのアクセス権限がありません`,
      'CATEGORY_ACCESS_FORBIDDEN'
    );
  }
}

export class CategoryNameTooLongError extends DomainError {
  constructor() {
    super(
      'カテゴリ名は50文字以内である必要があります',
      'CATEGORY_NAME_TOO_LONG'
    );
  }
}

export class CategoryNameEmptyError extends DomainError {
  constructor() {
    super(
      'カテゴリ名は必須です',
      'CATEGORY_NAME_EMPTY'
    );
  }
}