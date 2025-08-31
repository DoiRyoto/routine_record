// Routine validation utilities
import { z } from 'zod';

// Routine validation schemas
export const routineValidationSchema = z.object({
  name: z.string().min(1, 'Routine name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  goalType: z.enum(['count', 'duration', 'completion', 'frequency_based']),
  targetValue: z.number().min(1, 'Target value must be positive'),
  targetCount: z.number().optional(),
  targetPeriod: z.enum(['daily', 'weekly', 'monthly']).optional(),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly']),
  isActive: z.boolean().default(true),
});

export const routineUpdateSchema = routineValidationSchema.partial().extend({
  id: z.string().min(1, 'Routine ID is required'),
});

// Execution record validation
export const executionRecordValidationSchema = z.object({
  routineId: z.string().min(1, 'Routine ID is required'),
  executedAt: z.date().default(() => new Date()),
  value: z.number().min(0, 'Value must be non-negative'),
  isCompleted: z.boolean().default(true),
  notes: z.string().optional(),
});

// Query validation helpers
export function validateRoutineQuery(searchParams: URLSearchParams) {
  const params = {
    userId: searchParams.get('userId'),
    categoryId: searchParams.get('categoryId'),
    isActive: searchParams.get('isActive'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '10'),
  };

  const errors: Array<{ field: string; message: string }> = [];

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

// Request body validation schemas
export const createRoutineRequestSchema = routineValidationSchema;
export const updateRoutineRequestSchema = routineUpdateSchema;
export const createExecutionRecordRequestSchema = executionRecordValidationSchema;

// Validation helper functions
export function validateRoutineData(data: unknown) {
  return routineValidationSchema.safeParse(data);
}

export function validateExecutionRecordData(data: unknown) {
  return executionRecordValidationSchema.safeParse(data);
}

export function validateUpdateRoutineData(data: unknown) {
  return routineUpdateSchema.safeParse(data);
}