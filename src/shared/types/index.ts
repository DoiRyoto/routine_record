export * from './DomainError';
export * from './ExecutionRecordErrors';
export * from './CategoryErrors';
export * from './UserSettingsErrors';
export * from './GamificationErrors';

// Common result type for use cases and services
export type Result<T, E = Error> = Success<T> | Failure<E>;

export interface Success<T> {
  isSuccess: true;
  isFailure: false;
  value: T;
}

export interface Failure<E> {
  isSuccess: false;
  isFailure: true;
  error: E;
}

// Helper functions for creating Results
export const success = <T>(value: T): Success<T> => ({
  isSuccess: true,
  isFailure: false,
  value,
});

export const failure = <E>(error: E): Failure<E> => ({
  isSuccess: false,
  isFailure: true,
  error,
});

// Pagination types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Date range type
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Common query filters
export interface BaseFilter {
  userId: string;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    version: string;
    requestId?: string;
  };
}

// Helper for creating API responses
export const createApiResponse = <T>(
  data: T,
  isSuccess: boolean = true,
  error?: ApiResponse<T>['error']
): ApiResponse<T> => ({
  success: isSuccess,
  data: isSuccess ? data : undefined,
  error: !isSuccess ? error : undefined,
  metadata: {
    timestamp: new Date(),
    version: '1.0',
  },
});

// Event types for domain events
export interface DomainEvent {
  id: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: any;
  occurredAt: Date;
  version: number;
}

// Base aggregate root interface
export interface AggregateRoot {
  getId(): string;
  getUncommittedEvents(): DomainEvent[];
  markEventsAsCommitted(): void;
}