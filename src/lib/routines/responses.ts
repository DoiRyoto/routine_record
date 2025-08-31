// API Response utilities for routine and related endpoints

// Standard success response format
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// Standard error response format
export interface ErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

// Combined response type
export type APIResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Helper functions for creating responses
export function createSuccessResponse<T>(data: T, message?: string): SuccessResponse<T> {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function createErrorResponse(error: string, details?: unknown): ErrorResponse {
  return {
    success: false,
    error,
    ...(details && { details }),
  };
}

// Response creators for common HTTP status codes
export function ok<T>(data: T, message?: string): Response {
  return Response.json(createSuccessResponse(data, message));
}

export function created<T>(data: T, message?: string): Response {
  return Response.json(createSuccessResponse(data, message), { status: 201 });
}

export function badRequest(error: string, details?: unknown): Response {
  return Response.json(createErrorResponse(error, details), { status: 400 });
}

export function unauthorized(error = 'Unauthorized'): Response {
  return Response.json(createErrorResponse(error), { status: 401 });
}

export function forbidden(error = 'Forbidden'): Response {
  return Response.json(createErrorResponse(error), { status: 403 });
}

export function notFound(error = 'Not found'): Response {
  return Response.json(createErrorResponse(error), { status: 404 });
}

export function conflict(error: string, details?: unknown): Response {
  return Response.json(createErrorResponse(error, details), { status: 409 });
}

export function unprocessableEntity(error: string, details?: unknown): Response {
  return Response.json(createErrorResponse(error, details), { status: 422 });
}

export function internalServerError(error = 'Internal server error'): Response {
  return Response.json(createErrorResponse(error), { status: 500 });
}