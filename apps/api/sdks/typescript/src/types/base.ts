/**
 * Base types for Janua TypeScript SDK.
 *
 * Mirrors the standardized response models from app.schemas.sdk_models
 * for consistent cross-platform SDK experience.
 */

export enum APIStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL = 'partial'
}

export interface SDKBaseResponse {
  status: APIStatus;
  message: string;
  request_id?: string;
  timestamp: string;
}

export interface SDKDataResponse<T = any> extends SDKBaseResponse {
  data: T;
}

export interface PaginationMetadata {
  page: number;
  size: number;
  total: number;
  pages: number;
  has_prev: boolean;
  has_next: boolean;
  prev_page?: number;
  next_page?: number;
}

export interface SDKListResponse<T = any> extends SDKBaseResponse {
  data: T[];
  pagination: PaginationMetadata;
}

export interface SDKSuccessResponse extends SDKBaseResponse {
  success: boolean;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
  value?: any;
}

export interface SDKErrorResponse extends SDKBaseResponse {
  error_code: string;
  error_type: string;
  details?: Record<string, any>;
  validation_errors?: ValidationErrorDetail[];
  retry_after?: number;
}

export interface BulkOperationError {
  id: string;
  index: number;
  error_code: string;
  message: string;
}

export interface BulkOperationResult {
  total_requested: number;
  successful_count: number;
  failed_count: number;
  successful_ids: string[];
  failed_operations: BulkOperationError[];
}

export interface SDKBulkResponse extends SDKBaseResponse {
  result: BulkOperationResult;
}

// Authentication and session types
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Configuration types
export enum AuthenticationMethod {
  API_KEY = 'api_key',
  JWT_TOKEN = 'jwt_token',
  OAUTH = 'oauth',
  MAGIC_LINK = 'magic_link'
}

export interface RetryConfig {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_factor: number;
  retry_on_status_codes: number[];
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  query_params?: Record<string, any>;
}

export interface ClientConfig {
  base_url: string;
  api_key?: string;
  authentication_method: AuthenticationMethod;
  timeout: number;
  retry_config: RetryConfig;
  user_agent: string;
  debug: boolean;
}