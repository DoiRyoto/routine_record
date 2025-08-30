/**
 * Pagination Utilities
 * Refactored from TDD implementation to provide consistent pagination
 */

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Calculate pagination information
 */
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): PaginationInfo {
  const pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1
  };
}

/**
 * Apply pagination to an array of data
 */
export function paginateArray<T>(
  data: T[],
  page: number,
  limit: number
): PaginatedResult<T> {
  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedData = data.slice(startIndex, endIndex);
  const pagination = calculatePagination(total, page, limit);
  
  return {
    data: paginatedData,
    pagination
  };
}

/**
 * Create pagination metadata for database queries
 */
export function createPaginationMeta(page: number, limit: number) {
  const offset = (page - 1) * limit;
  
  return {
    offset,
    limit
  };
}