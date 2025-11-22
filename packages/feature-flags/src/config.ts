import { FeatureFlagConfig, RolloutStrategy } from './types';

/**
 * Default feature flag configurations for Janua platform
 */
export const defaultFeatureFlags: FeatureFlagConfig[] = [
  // ============================================================================
  // Authentication & Security Features
  // ============================================================================
  {
    key: 'passkeys',
    name: 'Passkey Authentication',
    description: 'WebAuthn-based passwordless authentication using passkeys',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'auth',
      tier: 'free',
      beta: false,
    },
  },
  {
    key: 'mfa_totp',
    name: 'TOTP Multi-Factor Authentication',
    description: 'Time-based one-time password (TOTP) for MFA',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'auth',
      tier: 'free',
      beta: false,
    },
  },
  {
    key: 'mfa_sms',
    name: 'SMS Multi-Factor Authentication',
    description: 'SMS-based one-time password for MFA',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'auth',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'mfa_email',
    name: 'Email Multi-Factor Authentication',
    description: 'Email-based one-time password for MFA',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'auth',
      tier: 'free',
      beta: false,
    },
  },
  {
    key: 'biometric_auth',
    name: 'Biometric Authentication',
    description: 'Fingerprint and face recognition authentication',
    strategy: RolloutStrategy.PERCENTAGE,
    enabled: true,
    percentage: 50,
    metadata: {
      category: 'auth',
      tier: 'pro',
      beta: true,
    },
  },

  // ============================================================================
  // Enterprise Features
  // ============================================================================
  {
    key: 'sso_saml',
    name: 'SAML Single Sign-On',
    description: 'SAML 2.0 based single sign-on for enterprise',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'enterprise',
      tier: 'enterprise',
      beta: false,
    },
  },
  {
    key: 'sso_oidc',
    name: 'OpenID Connect SSO',
    description: 'OAuth 2.0 / OpenID Connect based single sign-on',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'enterprise',
      tier: 'enterprise',
      beta: false,
    },
  },
  {
    key: 'scim_provisioning',
    name: 'SCIM User Provisioning',
    description: 'SCIM 2.0 based automatic user provisioning and deprovisioning',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    dependencies: ['sso_saml', 'sso_oidc'],
    metadata: {
      category: 'enterprise',
      tier: 'enterprise',
      beta: false,
    },
  },
  {
    key: 'rbac',
    name: 'Role-Based Access Control',
    description: 'Advanced role-based access control with custom roles',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'enterprise',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'audit_logging',
    name: 'Audit Logging',
    description: 'Comprehensive audit logging for security and compliance',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'enterprise',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'session_management',
    name: 'Advanced Session Management',
    description: 'Multi-device session management with revocation',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'enterprise',
      tier: 'pro',
      beta: false,
    },
  },

  // ============================================================================
  // Compliance & Privacy Features
  // ============================================================================
  {
    key: 'gdpr_compliance',
    name: 'GDPR Compliance',
    description: 'GDPR compliance features for EU data protection',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'compliance',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'ccpa_compliance',
    name: 'CCPA Compliance',
    description: 'CCPA compliance features for California privacy law',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'compliance',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'consent_management',
    name: 'Consent Management',
    description: 'Granular consent management for data processing',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    dependencies: ['gdpr_compliance'],
    metadata: {
      category: 'compliance',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'data_subject_requests',
    name: 'Data Subject Requests',
    description: 'Handle GDPR/CCPA data subject requests (access, erasure, portability)',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    dependencies: ['gdpr_compliance', 'ccpa_compliance'],
    metadata: {
      category: 'compliance',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'privacy_settings',
    name: 'Privacy Settings',
    description: 'User-controlled privacy settings and preferences',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'compliance',
      tier: 'free',
      beta: false,
    },
  },
  {
    key: 'data_export',
    name: 'Data Export',
    description: 'Export user data in machine-readable formats (JSON, CSV)',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    dependencies: ['data_subject_requests'],
    metadata: {
      category: 'compliance',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'data_retention',
    name: 'Data Retention Policies',
    description: 'Configurable data retention and automatic deletion',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'compliance',
      tier: 'enterprise',
      beta: false,
    },
  },

  // ============================================================================
  // Organization Features
  // ============================================================================
  {
    key: 'multi_tenancy',
    name: 'Multi-Tenancy',
    description: 'Multi-tenant organization support with data isolation',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'organization',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'org_hierarchies',
    name: 'Organization Hierarchies',
    description: 'Nested organization structures with inheritance',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    dependencies: ['multi_tenancy'],
    metadata: {
      category: 'organization',
      tier: 'enterprise',
      beta: false,
    },
  },
  {
    key: 'custom_domains',
    name: 'Custom Domains',
    description: 'Custom domain support for organization branding',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'organization',
      tier: 'enterprise',
      beta: false,
    },
  },
  {
    key: 'white_labeling',
    name: 'White Labeling',
    description: 'Complete white-label customization for organizations',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    dependencies: ['custom_domains'],
    metadata: {
      category: 'organization',
      tier: 'enterprise',
      beta: false,
    },
  },

  // ============================================================================
  // Advanced Features
  // ============================================================================
  {
    key: 'graphql_api',
    name: 'GraphQL API',
    description: 'GraphQL API with subscriptions and real-time updates',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'advanced',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'webhooks',
    name: 'Webhooks',
    description: 'Event-driven webhooks for integrations',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'advanced',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'rate_limiting',
    name: 'Advanced Rate Limiting',
    description: 'Configurable rate limiting per organization',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'advanced',
      tier: 'pro',
      beta: false,
    },
  },
  {
    key: 'ip_whitelisting',
    name: 'IP Whitelisting',
    description: 'IP-based access control for enhanced security',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'advanced',
      tier: 'enterprise',
      beta: false,
    },
  },
  {
    key: 'custom_roles',
    name: 'Custom Role Creation',
    description: 'Create custom roles with fine-grained permissions',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    dependencies: ['rbac'],
    metadata: {
      category: 'advanced',
      tier: 'enterprise',
      beta: false,
    },
  },
  {
    key: 'api_keys',
    name: 'API Key Management',
    description: 'API key generation and management for programmatic access',
    strategy: RolloutStrategy.ENABLED,
    enabled: true,
    metadata: {
      category: 'advanced',
      tier: 'pro',
      beta: false,
    },
  },
];
