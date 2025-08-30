/**
 * Sorting Utilities
 * Refactored from TDD implementation to provide consistent sorting
 */

// Type-safe sorting configurations
export const SORT_CONFIGS = {
  difficulty: {
    easy: 1,
    medium: 2,
    hard: 3,
    extreme: 4
  },
  rarity: {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 4
  }
} as const;

export type SortableValue = string | number | Date | undefined | null;
export type SortOrder = 'asc' | 'desc';

/**
 * Generic sort function that handles various data types
 */
export function sortData<T extends Record<string, any>>(
  data: T[],
  sortBy: keyof T,
  sortOrder: SortOrder = 'asc'
): T[] {
  if (!sortBy) return data;

  const order = sortOrder === 'desc' ? -1 : 1;
  
  return [...data].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    // Handle special sorting for difficulty and rarity
    if (sortBy === 'difficulty' && typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = SORT_CONFIGS.difficulty[aValue as keyof typeof SORT_CONFIGS.difficulty] || 0;
      bValue = SORT_CONFIGS.difficulty[bValue as keyof typeof SORT_CONFIGS.difficulty] || 0;
    } else if (sortBy === 'rarity' && typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = SORT_CONFIGS.rarity[aValue as keyof typeof SORT_CONFIGS.rarity] || 0;
      bValue = SORT_CONFIGS.rarity[bValue as keyof typeof SORT_CONFIGS.rarity] || 0;
    }

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) {
      if (bValue === null || bValue === undefined) return 0;
      return 1 * order; // nulls last
    }
    if (bValue === null || bValue === undefined) {
      return -1 * order; // nulls last
    }

    // Handle Date objects
    if (aValue instanceof Date && bValue instanceof Date) {
      return (aValue.getTime() - bValue.getTime()) * order;
    }

    // Handle string dates (ISO format)
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const dateA = new Date(aValue);
      const dateB = new Date(bValue);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return (dateA.getTime() - dateB.getTime()) * order;
      }
    }

    // Handle numbers
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return (aValue - bValue) * order;
    }

    // Handle strings (case-insensitive)
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (aStr < bStr) return -1 * order;
    if (aStr > bStr) return 1 * order;
    return 0;
  });
}

/**
 * Sort missions with proper difficulty ordering
 */
export function sortMissions<T extends Record<string, any>>(
  missions: T[],
  sortBy?: string,
  sortOrder?: SortOrder
): T[] {
  if (!sortBy) return missions;
  return sortData(missions, sortBy, sortOrder);
}

/**
 * Sort challenges with proper date handling
 */
export function sortChallenges<T extends Record<string, any>>(
  challenges: T[],
  sortBy?: string,
  sortOrder?: SortOrder
): T[] {
  if (!sortBy) return challenges;
  return sortData(challenges, sortBy, sortOrder);
}

/**
 * Sort badges with proper rarity ordering
 */
export function sortBadges<T extends Record<string, any>>(
  badges: T[],
  sortBy?: string,
  sortOrder?: SortOrder
): T[] {
  if (!sortBy) return badges;
  return sortData(badges, sortBy, sortOrder);
}