// Common validation utilities for API queries

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult<T> {
  params: T;
  errors: ValidationError[];
}

// Badge query validation
export function validateBadgeQuery(searchParams: URLSearchParams): ValidationResult<{
  category?: string;
  rarity?: string;
  sortBy?: string;
  sortOrder?: string;
  pagination: PaginationParams;
}> {
  const params = {
    category: searchParams.get('category'),
    rarity: searchParams.get('rarity'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  };

  const errors: ValidationError[] = [];

  if (params.page < 1) {
    errors.push({ field: 'page', message: 'Page must be at least 1' });
  }

  if (params.limit < 1 || params.limit > 100) {
    errors.push({ field: 'limit', message: 'Limit must be between 1 and 100' });
  }

  return {
    params: {
      ...params,
      pagination: { page: params.page, limit: params.limit },
    },
    errors,
  };
}

// Mission query validation
export function validateMissionQuery(searchParams: URLSearchParams): ValidationResult<{
  difficulty?: string;
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  pagination: PaginationParams;
}> {
  const params = {
    difficulty: searchParams.get('difficulty'),
    type: searchParams.get('type'),
    isActive: searchParams.get('isActive'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  };

  const errors: ValidationError[] = [];

  if (params.page < 1) {
    errors.push({ field: 'page', message: 'Page must be at least 1' });
  }

  if (params.limit < 1 || params.limit > 100) {
    errors.push({ field: 'limit', message: 'Limit must be between 1 and 100' });
  }

  return {
    params: {
      ...params,
      pagination: { page: params.page, limit: params.limit },
      isActive: params.isActive === 'true' ? true : params.isActive === 'false' ? false : undefined,
    },
    errors,
  };
}

// Challenge query validation
export function validateChallengeQuery(searchParams: URLSearchParams): ValidationResult<{
  type?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
  pagination: PaginationParams;
}> {
  const params = {
    type: searchParams.get('type'),
    isActive: searchParams.get('isActive'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  };

  const errors: ValidationError[] = [];

  if (params.page < 1) {
    errors.push({ field: 'page', message: 'Page must be at least 1' });
  }

  if (params.limit < 1 || params.limit > 100) {
    errors.push({ field: 'limit', message: 'Limit must be between 1 and 100' });
  }

  return {
    params: {
      ...params,
      pagination: { page: params.page, limit: params.limit },
      isActive: params.isActive === 'true' ? true : params.isActive === 'false' ? false : undefined,
    },
    errors,
  };
}