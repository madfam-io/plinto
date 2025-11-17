import { z } from 'zod';

/**
 * Feature flag identifier
 */
export type FeatureFlagKey =
  // Authentication & Security
  | 'passkeys'
  | 'mfa_totp'
  | 'mfa_sms'
  | 'mfa_email'
  | 'biometric_auth'
  
  // Enterprise Features
  | 'sso_saml'
  | 'sso_oidc'
  | 'scim_provisioning'
  | 'rbac'
  | 'audit_logging'
  | 'session_management'
  
  // Compliance & Privacy
  | 'gdpr_compliance'
  | 'ccpa_compliance'
  | 'consent_management'
  | 'data_subject_requests'
  | 'privacy_settings'
  | 'data_export'
  | 'data_retention'
  
  // Organizations
  | 'multi_tenancy'
  | 'org_hierarchies'
  | 'custom_domains'
  | 'white_labeling'
  
  // Advanced Features
  | 'graphql_api'
  | 'webhooks'
  | 'rate_limiting'
  | 'ip_whitelisting'
  | 'custom_roles'
  | 'api_keys';

/**
 * Feature flag rollout strategy
 */
export enum RolloutStrategy {
  /** Feature is disabled for everyone */
  DISABLED = 'disabled',
  
  /** Feature is enabled for everyone */
  ENABLED = 'enabled',
  
  /** Feature is enabled for specific percentage of users */
  PERCENTAGE = 'percentage',
  
  /** Feature is enabled for specific users */
  USERS = 'users',
  
  /** Feature is enabled for specific organizations */
  ORGANIZATIONS = 'organizations',
  
  /** Feature is enabled for specific user attributes */
  ATTRIBUTES = 'attributes',
  
  /** Feature is enabled based on custom rules */
  CUSTOM = 'custom',
}

/**
 * Feature flag configuration
 */
export interface FeatureFlagConfig {
  /** Unique feature flag key */
  key: FeatureFlagKey;
  
  /** Human-readable name */
  name: string;
  
  /** Description of the feature */
  description: string;
  
  /** Rollout strategy */
  strategy: RolloutStrategy;
  
  /** Whether the flag is enabled (shortcut for strategy = ENABLED) */
  enabled: boolean;
  
  /** Percentage rollout (0-100) when strategy is PERCENTAGE */
  percentage?: number;
  
  /** List of user IDs when strategy is USERS */
  userIds?: string[];
  
  /** List of organization IDs when strategy is ORGANIZATIONS */
  organizationIds?: string[];
  
  /** User attribute rules when strategy is ATTRIBUTES */
  attributeRules?: AttributeRule[];
  
  /** Custom evaluation function when strategy is CUSTOM */
  customEvaluator?: (context: EvaluationContext) => boolean;
  
  /** Feature dependencies (required features) */
  dependencies?: FeatureFlagKey[];
  
  /** Metadata for the flag */
  metadata?: {
    category?: 'auth' | 'enterprise' | 'compliance' | 'organization' | 'advanced';
    tier?: 'free' | 'pro' | 'enterprise';
    beta?: boolean;
    deprecated?: boolean;
    deprecationDate?: string;
  };
}

/**
 * Attribute-based rule for feature flags
 */
export interface AttributeRule {
  /** Attribute key (e.g., 'email', 'role', 'plan') */
  attribute: string;
  
  /** Comparison operator */
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  
  /** Value to compare against */
  value: string | number | boolean | string[];
}

/**
 * Context for feature flag evaluation
 */
export interface EvaluationContext {
  /** Current user ID */
  userId?: string;
  
  /** Current organization ID */
  organizationId?: string;
  
  /** User email */
  email?: string;
  
  /** User roles */
  roles?: string[];
  
  /** Organization plan/tier */
  plan?: string;
  
  /** Custom user attributes */
  attributes?: Record<string, string | number | boolean>;
  
  /** Request metadata */
  request?: {
    ip?: string;
    userAgent?: string;
    country?: string;
  };
}

/**
 * Feature flag evaluation result
 */
export interface EvaluationResult {
  /** Feature flag key */
  key: FeatureFlagKey;
  
  /** Whether the feature is enabled for the context */
  enabled: boolean;
  
  /** Reason for the evaluation result */
  reason: string;
  
  /** Strategy used for evaluation */
  strategy: RolloutStrategy;
  
  /** Variant/value for the flag (for A/B testing) */
  variant?: string | number | boolean;
}

/**
 * Feature flag service interface
 */
export interface IFeatureFlagService {
  /** Check if a feature is enabled for the given context */
  isEnabled(key: FeatureFlagKey, context?: EvaluationContext): Promise<boolean>;
  
  /** Get evaluation result with detailed information */
  evaluate(key: FeatureFlagKey, context?: EvaluationContext): Promise<EvaluationResult>;
  
  /** Get all feature flags */
  getAllFlags(): Promise<FeatureFlagConfig[]>;
  
  /** Get feature flag by key */
  getFlag(key: FeatureFlagKey): Promise<FeatureFlagConfig | null>;
  
  /** Update feature flag configuration */
  updateFlag(key: FeatureFlagKey, config: Partial<FeatureFlagConfig>): Promise<void>;
  
  /** Get all enabled features for a context */
  getEnabledFeatures(context?: EvaluationContext): Promise<FeatureFlagKey[]>;
}

/**
 * Zod schemas for validation
 */
export const AttributeRuleSchema = z.object({
  attribute: z.string(),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'in', 'not_in', 'greater_than', 'less_than']),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});

export const FeatureFlagConfigSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string(),
  strategy: z.nativeEnum(RolloutStrategy),
  enabled: z.boolean(),
  percentage: z.number().min(0).max(100).optional(),
  userIds: z.array(z.string()).optional(),
  organizationIds: z.array(z.string()).optional(),
  attributeRules: z.array(AttributeRuleSchema).optional(),
  dependencies: z.array(z.string()).optional(),
  metadata: z.object({
    category: z.enum(['auth', 'enterprise', 'compliance', 'organization', 'advanced']).optional(),
    tier: z.enum(['free', 'pro', 'enterprise']).optional(),
    beta: z.boolean().optional(),
    deprecated: z.boolean().optional(),
    deprecationDate: z.string().optional(),
  }).optional(),
});

export const EvaluationContextSchema = z.object({
  userId: z.string().optional(),
  organizationId: z.string().optional(),
  email: z.string().email().optional(),
  roles: z.array(z.string()).optional(),
  plan: z.string().optional(),
  attributes: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
  request: z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});
