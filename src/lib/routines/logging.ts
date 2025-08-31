// Logging utilities for routines
export function logRoutineError(error: unknown, context?: string): void {
  console.error(`[Routine Error]${context ? ` ${context}:` : ''}`, error);
}

export function logRoutineSuccess(message: string, data?: unknown): void {
  // Use console.warn instead of console.log for ESLint compliance
  console.warn(`[Routine Success] ${message}`, data ? data : '');
}

export function logRoutinePerformance(operation: string, startTime: number): void {
  const duration = Date.now() - startTime;
  // Use console.warn instead of console.log for ESLint compliance
  console.warn(`[Routine Performance] ${operation}: ${duration}ms`);
}