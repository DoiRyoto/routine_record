/**
 * Common Validation Utilities
 * Refactored from TDD implementation to eliminate code duplication
 */

// Common enum values used across the application
export const MISSION_DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'] as const;
export const MISSION_TYPES = ['streak', 'count', 'variety', 'consistency'] as const;
export const CHALLENGE_TYPES = ['daily', 'weekly', 'monthly', 'special'] as const;
export const CHALLENGE_STATUS_FILTERS = ['active', 'completed', 'expired'] as const;
export const USER_MISSION_STATUS_FILTERS = ['active', 'completed', 'claimed'] as const;
export const BADGE_CATEGORIES = ['実績', 'ストリーク', 'チャレンジ'] as const;
export const BADGE_RARITIES = ['common', 'rare', 'epic', 'legendary'] as const;
export const XP_SOURCES = ['routine_completion', 'streak_bonus', 'mission_completion', 'challenge_completion'] as const;
export const NOTIFICATION_TYPES = ['level_up', 'badge_unlocked', 'mission_completed', 'challenge_completed'] as const;
export const SORT_ORDERS = ['asc', 'desc'] as const;

// Sort field validators by context
export const MISSION_SORT_FIELDS = ['difficulty', 'xpReward', 'targetValue', 'createdAt'] as const;
export const CHALLENGE_SORT_FIELDS = ['startDate', 'endDate', 'participants', 'createdAt'] as const;
export const BADGE_SORT_FIELDS = ['name', 'rarity', 'createdAt'] as const;

export interface ValidationError {
  message: string;
  field?: string;
}

/**
 * Validate UUID format
 */
export function validateUUID(value: string, fieldName: string = 'ID'): ValidationError | null {
  if (!value.match(/^[0-9a-f-]{36}$/i)) {
    return { message: `無効な${fieldName}フォーマットです`, field: fieldName.toLowerCase() };
  }
  return null;
}

/**
 * Validate boolean parameter
 */
export function validateBoolean(value: string | null, fieldName: string): ValidationError | null {
  if (value !== null && !['true', 'false'].includes(value)) {
    return { 
      message: `${fieldName}パラメータが無効です。trueまたはfalseを指定してください`,
      field: fieldName.toLowerCase()
    };
  }
  return null;
}

/**
 * Validate enum value
 */
export function validateEnum<T extends readonly string[]>(
  value: string | null,
  allowedValues: T,
  fieldName: string
): ValidationError | null {
  if (value !== null && !allowedValues.includes(value as T[number])) {
    return {
      message: `${fieldName}パラメータが無効です。${allowedValues.join(', ')}のいずれかを指定してください`,
      field: fieldName.toLowerCase()
    };
  }
  return null;
}

/**
 * Validate pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export function validatePagination(searchParams: URLSearchParams): { params: PaginationParams; error: ValidationError | null } {
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');

  // Default values
  let page = 1;
  let limit = 20;

  // Validate page
  if (pageStr !== null) {
    const pageNum = parseInt(pageStr, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        params: { page, limit },
        error: { message: 'ページ番号は1以上である必要があります', field: 'page' }
      };
    }
    page = pageNum;
  }

  // Validate limit
  if (limitStr !== null) {
    const limitNum = parseInt(limitStr, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      return {
        params: { page, limit },
        error: { message: '件数制限は1以上である必要があります', field: 'limit' }
      };
    }
    if (limitNum > 100) {
      return {
        params: { page, limit },
        error: { message: '件数制限は100以下である必要があります', field: 'limit' }
      };
    }
    limit = limitNum;
  }

  return { params: { page, limit }, error: null };
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: string | null,
  endDate: string | null
): ValidationError | null {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { message: '無効な日付形式です。ISO 8601形式を使用してください' };
    }
    
    if (start >= end) {
      return { message: '開始日は終了日より前である必要があります' };
    }
  }
  
  return null;
}

/**
 * Validate and parse query parameters for missions endpoint
 */
export interface MissionQueryParams {
  difficulty?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  pagination: PaginationParams;
}

export function validateMissionQuery(searchParams: URLSearchParams): { params: MissionQueryParams; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  const difficulty = searchParams.get('difficulty');
  const type = searchParams.get('type');
  const isActive = searchParams.get('isActive');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  // Validate individual fields
  const difficultyError = validateEnum(difficulty, MISSION_DIFFICULTIES, 'difficulty');
  if (difficultyError) errors.push(difficultyError);

  const typeError = validateEnum(type, MISSION_TYPES, 'type');
  if (typeError) errors.push(typeError);

  const isActiveError = validateBoolean(isActive, 'isActive');
  if (isActiveError) errors.push(isActiveError);

  const sortByError = validateEnum(sortBy, MISSION_SORT_FIELDS, 'sortBy');
  if (sortByError) errors.push(sortByError);

  const sortOrderError = validateEnum(sortOrder, SORT_ORDERS, 'sortOrder');
  if (sortOrderError) errors.push(sortOrderError);

  // Custom pagination for missions - default to large limit to match existing behavior
  const { params: pagination, error: paginationError } = validateMissionPagination(searchParams);
  if (paginationError) errors.push(paginationError);

  const params: MissionQueryParams = {
    difficulty: difficulty || undefined,
    type: type || undefined,
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
    pagination
  };

  return { params, errors };
}

/**
 * Validate pagination parameters for missions (higher default limit)
 */
function validateMissionPagination(searchParams: URLSearchParams): { params: PaginationParams; error: ValidationError | null } {
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');

  // Default values for missions - higher limit to match existing test behavior
  let page = 1;
  let limit = 100;

  // Validate page
  if (pageStr !== null) {
    const pageNum = parseInt(pageStr, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        params: { page, limit },
        error: { message: 'ページ番号は1以上である必要があります', field: 'page' }
      };
    }
    page = pageNum;
  }

  // Validate limit
  if (limitStr !== null) {
    const limitNum = parseInt(limitStr, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      return {
        params: { page, limit },
        error: { message: '件数制限は1以上である必要があります', field: 'limit' }
      };
    }
    if (limitNum > 100) {
      return {
        params: { page, limit },
        error: { message: '件数制限は100以下である必要があります', field: 'limit' }
      };
    }
    limit = limitNum;
  }

  return { params: { page, limit }, error: null };
}

/**
 * Validate and parse query parameters for challenges endpoint
 */
export interface ChallengeQueryParams {
  isActive?: boolean;
  type?: string;
  joinable?: boolean;
  startDate?: string;
  endDate?: string;
  includeDetails?: boolean;
  sortBy?: string;
  sortOrder?: string;
  pagination: PaginationParams;
}

export function validateChallengeQuery(searchParams: URLSearchParams): { params: ChallengeQueryParams; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  const isActive = searchParams.get('isActive');
  const type = searchParams.get('type');
  const joinable = searchParams.get('joinable');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const includeDetails = searchParams.get('includeDetails');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  // Validate individual fields
  const isActiveError = validateBoolean(isActive, 'isActive');
  if (isActiveError) errors.push(isActiveError);

  const typeError = validateEnum(type, CHALLENGE_TYPES, 'type');
  if (typeError) errors.push(typeError);

  const joinableError = validateBoolean(joinable, 'joinable');
  if (joinableError) errors.push(joinableError);

  const includeDetailsError = validateBoolean(includeDetails, 'includeDetails');
  if (includeDetailsError) errors.push(includeDetailsError);

  const sortByError = validateEnum(sortBy, CHALLENGE_SORT_FIELDS, 'sortBy');
  if (sortByError) errors.push(sortByError);

  const sortOrderError = validateEnum(sortOrder, SORT_ORDERS, 'sortOrder');
  if (sortOrderError) errors.push(sortOrderError);

  // Validate date range
  const dateRangeError = validateDateRange(startDate, endDate);
  if (dateRangeError) errors.push(dateRangeError);

  // Validate pagination
  const { params: pagination, error: paginationError } = validatePagination(searchParams);
  if (paginationError) errors.push(paginationError);

  const params: ChallengeQueryParams = {
    isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
    type: type || undefined,
    joinable: joinable === 'true' ? true : joinable === 'false' ? false : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    includeDetails: includeDetails === 'true' ? true : includeDetails === 'false' ? false : undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
    pagination
  };

  return { params, errors };
}

/**
 * Validate and parse query parameters for badges endpoint
 */
export interface BadgeQueryParams {
  category?: string;
  rarity?: string;
  sortBy?: string;
  sortOrder?: string;
  pagination: PaginationParams;
}

export function validateBadgeQuery(searchParams: URLSearchParams): { params: BadgeQueryParams; errors: ValidationError[] } {
  const errors: ValidationError[] = [];
  
  const category = searchParams.get('category');
  const rarity = searchParams.get('rarity');
  const sortBy = searchParams.get('sortBy');
  const sortOrder = searchParams.get('sortOrder');

  // Validate individual fields
  const categoryError = validateEnum(category, BADGE_CATEGORIES, 'category');
  if (categoryError) errors.push(categoryError);

  const rarityError = validateEnum(rarity, BADGE_RARITIES, 'rarity');
  if (rarityError) errors.push(rarityError);

  const sortByError = validateEnum(sortBy, BADGE_SORT_FIELDS, 'sortBy');
  if (sortByError) errors.push(sortByError);

  const sortOrderError = validateEnum(sortOrder, SORT_ORDERS, 'sortOrder');
  if (sortOrderError) errors.push(sortOrderError);

  // Custom pagination for badges - default to large limit to match existing behavior
  const { params: pagination, error: paginationError } = validateBadgePagination(searchParams);
  if (paginationError) errors.push(paginationError);

  const params: BadgeQueryParams = {
    category: category || undefined,
    rarity: rarity || undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
    pagination
  };

  return { params, errors };
}

/**
 * Validate pagination parameters for badges (higher default limit)
 */
function validateBadgePagination(searchParams: URLSearchParams): { params: PaginationParams; error: ValidationError | null } {
  const pageStr = searchParams.get('page');
  const limitStr = searchParams.get('limit');

  // Default values for badges - higher limit to match existing test behavior
  let page = 1;
  let limit = 100;

  // Validate page
  if (pageStr !== null) {
    const pageNum = parseInt(pageStr, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return {
        params: { page, limit },
        error: { message: 'ページ番号は1以上である必要があります', field: 'page' }
      };
    }
    page = pageNum;
  }

  // Validate limit
  if (limitStr !== null) {
    const limitNum = parseInt(limitStr, 10);
    if (isNaN(limitNum) || limitNum < 1) {
      return {
        params: { page, limit },
        error: { message: '件数制限は1以上である必要があります', field: 'limit' }
      };
    }
    if (limitNum > 100) {
      return {
        params: { page, limit },
        error: { message: '件数制限は100以下である必要があります', field: 'limit' }
      };
    }
    limit = limitNum;
  }

  return { params: { page, limit }, error: null };
}