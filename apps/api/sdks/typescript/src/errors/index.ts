/**
 * Error handling system for Janua TypeScript SDK.
 *
 * Mirrors the comprehensive error hierarchy from app.sdk.error_handling
 * for consistent cross-platform error handling experience.
 */

import { SDKErrorResponse, ValidationErrorDetail } from '../types/base';

export abstract class SDKError extends Error {
  public readonly timestamp: Date;
  public readonly request_id?: string;

  constructor(message: string, request_id?: string) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.request_id = request_id;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      request_id: this.request_id
    };
  }
}

export class APIError extends SDKError {
  public readonly status_code: number;
  public readonly error_code: string;
  public readonly error_type: string;
  public readonly details?: Record<string, any>;

  constructor(
    message: string,
    status_code: number,
    error_code: string = 'API_ERROR',
    error_type: string = 'api_error',
    details?: Record<string, any>,
    request_id?: string
  ) {
    super(message, request_id);
    this.status_code = status_code;
    this.error_code = error_code;
    this.error_type = error_type;
    this.details = details;
  }

  public static fromResponse(response: SDKErrorResponse, status_code: number): APIError {
    return new APIError(
      response.message,
      status_code,
      response.error_code,
      response.error_type,
      response.details,
      response.request_id
    );
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      status_code: this.status_code,
      error_code: this.error_code,
      error_type: this.error_type,
      details: this.details
    };
  }
}

export class ValidationError extends SDKError {
  public readonly validation_errors: ValidationErrorDetail[];
  public readonly status_code: number = 422;

  constructor(
    message: string,
    validation_errors: ValidationErrorDetail[],
    request_id?: string
  ) {
    super(message, request_id);
    this.validation_errors = validation_errors;
  }

  public getFieldErrors(field: string): ValidationErrorDetail[] {
    return this.validation_errors.filter(error => error.field === field);
  }

  public getAllFields(): string[] {
    return [...new Set(this.validation_errors.map(error => error.field))];
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      status_code: this.status_code,
      validation_errors: this.validation_errors
    };
  }
}

export class AuthenticationError extends SDKError {
  public readonly status_code: number = 401;
  public readonly auth_method?: string;

  constructor(message: string, auth_method?: string, request_id?: string) {
    super(message, request_id);
    this.auth_method = auth_method;
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      status_code: this.status_code,
      auth_method: this.auth_method
    };
  }
}

export class AuthorizationError extends SDKError {
  public readonly status_code: number = 403;
  public readonly required_permissions?: string[];

  constructor(
    message: string,
    required_permissions?: string[],
    request_id?: string
  ) {
    super(message, request_id);
    this.required_permissions = required_permissions;
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      status_code: this.status_code,
      required_permissions: this.required_permissions
    };
  }
}

export class RateLimitError extends SDKError {
  public readonly status_code: number = 429;
  public readonly retry_after?: number;
  public readonly limit?: number;
  public readonly remaining?: number;
  public readonly reset_time?: Date;

  constructor(
    message: string,
    retry_after?: number,
    limit?: number,
    remaining?: number,
    reset_time?: Date,
    request_id?: string
  ) {
    super(message, request_id);
    this.retry_after = retry_after;
    this.limit = limit;
    this.remaining = remaining;
    this.reset_time = reset_time;
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      status_code: this.status_code,
      retry_after: this.retry_after,
      limit: this.limit,
      remaining: this.remaining,
      reset_time: this.reset_time?.toISOString()
    };
  }
}

export class ServerError extends SDKError {
  public readonly status_code: number;

  constructor(message: string, status_code: number = 500, request_id?: string) {
    super(message, request_id);
    this.status_code = status_code;
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      status_code: this.status_code
    };
  }
}

export class NetworkError extends SDKError {
  public readonly original_error?: Error;

  constructor(message: string, original_error?: Error, request_id?: string) {
    super(message, request_id);
    this.original_error = original_error;
  }

  public toJSON(): Record<string, any> {
    return {
      ...super.toJSON(),
      original_error: this.original_error?.message
    };
  }
}

/**
 * Create appropriate error from HTTP response
 */
export function createErrorFromResponse(
  data: any,
  status_code: number,
  request_id?: string
): SDKError {
  // Handle non-JSON error responses
  if (typeof data === 'string') {
    return new APIError(data, status_code, 'UNKNOWN_ERROR', 'unknown', undefined, request_id);
  }

  const error_response = data as Partial<SDKErrorResponse>;
  const message = error_response.message || `HTTP ${status_code} error`;

  // Authentication errors
  if (status_code === 401) {
    return new AuthenticationError(message, undefined, request_id);
  }

  // Authorization errors
  if (status_code === 403) {
    return new AuthorizationError(message, undefined, request_id);
  }

  // Validation errors
  if (status_code === 422 && error_response.validation_errors) {
    return new ValidationError(message, error_response.validation_errors, request_id);
  }

  // Rate limiting errors
  if (status_code === 429) {
    return new RateLimitError(
      message,
      error_response.retry_after,
      undefined,
      undefined,
      undefined,
      request_id
    );
  }

  // Server errors
  if (status_code >= 500) {
    return new ServerError(message, status_code, request_id);
  }

  // Generic API error for other client errors
  return new APIError(
    message,
    status_code,
    error_response.error_code || 'API_ERROR',
    error_response.error_type || 'api_error',
    error_response.details,
    request_id
  );
}