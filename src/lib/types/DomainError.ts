export abstract class DomainError extends Error {
  public readonly timestamp: Date;
  public readonly code: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.code = code || this.constructor.name;

    // Set the prototype explicitly to maintain instanceof behavior
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

// Specific domain errors
export class ValidationError extends DomainError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier '${identifier}' was not found`, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends DomainError {
  constructor(action: string) {
    super(`Unauthorized to perform action: ${action}`, 'UNAUTHORIZED');
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(rule: string, details?: string) {
    const message = details 
      ? `Business rule violation: ${rule}. ${details}`
      : `Business rule violation: ${rule}`;
    super(message, 'BUSINESS_RULE_VIOLATION');
  }
}

export class ConcurrencyError extends DomainError {
  constructor(resource: string) {
    super(`Concurrency conflict detected for resource: ${resource}`, 'CONCURRENCY_ERROR');
  }
}

// Helper function to check if error is a domain error
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}