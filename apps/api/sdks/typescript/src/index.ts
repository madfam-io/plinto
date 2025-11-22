/**
 * Janua TypeScript SDK
 *
 * Enterprise-grade authentication and user management for modern applications.
 */

// Main client export
export { JanuaClient } from './client/janua-client';
export { BaseAPIClient } from './client/base-client';

// Authentication exports
export { TokenManager, MemoryTokenStorage, LocalStorageTokenStorage } from './auth/token-manager';
export type { TokenStorage, TokenRefreshCallback } from './auth/token-manager';

// Type exports
export type {
  ClientConfig,
  RequestOptions,
  RetryConfig,
  SDKBaseResponse,
  SDKDataResponse,
  SDKListResponse,
  SDKSuccessResponse,
  SDKErrorResponse,
  SDKBulkResponse,
  PaginationMetadata,
  BulkOperationResult,
  BulkOperationError,
  ValidationErrorDetail,
  TokenResponse,
  UserProfile
} from './types/base';

export { APIStatus, AuthenticationMethod } from './types/base';

// Error exports
export {
  SDKError,
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  ServerError,
  NetworkError,
  createErrorFromResponse
} from './errors';

// API-specific types
export type {
  LoginRequest,
  RegisterRequest,
  Organization,
  CreateOrganizationRequest,
  MFASetupResponse,
  MFAVerifyRequest,
  Session
} from './client/janua-client';

// Utility function to create a client with sensible defaults
export { createClient } from './utils/factory';

// Version info
export const VERSION = '0.1.0';
export const USER_AGENT = `janua-typescript-sdk/${VERSION}`;

// Note: Default export available via named export: import { JanuaClient } from '@janua/typescript-sdk'