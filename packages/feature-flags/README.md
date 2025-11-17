# @plinto/feature-flags

Feature flag system for gradual rollout and A/B testing in the Plinto platform.

## Installation

```bash
npm install @plinto/feature-flags
```

## Features

- 🎯 **Multiple Rollout Strategies**: Percentage, user-based, organization-based, attribute-based, and custom
- 🔄 **Dependency Management**: Define feature dependencies and automatic validation
- 📊 **Evaluation Context**: Rich context for intelligent feature targeting
- ⚛️ **React Integration**: Hooks and components for seamless React integration
- 🏢 **Enterprise Features**: Support for SSO, SCIM, RBAC, and compliance features
- 🔍 **Detailed Evaluation**: Get detailed reasons for feature flag decisions
- 🎨 **TypeScript**: Full TypeScript support with type safety

## Quick Start

### Basic Usage

```typescript
import { featureFlagService } from '@plinto/feature-flags';

// Check if a feature is enabled
const isEnabled = await featureFlagService.isEnabled('passkeys', {
  userId: 'user-123',
  organizationId: 'org-456',
});

if (isEnabled) {
  // Show passkey authentication option
}
```

### React Integration

```tsx
import { FeatureFlagProvider, Feature, useFeatureFlag } from '@plinto/feature-flags';

// Wrap your app with the provider
function App() {
  return (
    <FeatureFlagProvider
      context={{
        userId: currentUser.id,
        organizationId: currentUser.organizationId,
        email: currentUser.email,
        plan: currentUser.organization.plan,
      }}
    >
      <YourApp />
    </FeatureFlagProvider>
  );
}

// Use the Feature component
function AuthOptions() {
  return (
    <>
      <Feature name="passkeys">
        <PasskeyAuth />
      </Feature>
      
      <Feature name="mfa_totp">
        <TOTPSetup />
      </Feature>
      
      <Feature name="sso_saml" fallback={<UpgradePrompt />}>
        <SSOConfiguration />
      </Feature>
    </>
  );
}

// Or use the hook
function ComplianceSettings() {
  const gdprEnabled = useFeatureFlag('gdpr_compliance');
  const ccpaEnabled = useFeatureFlag('ccpa_compliance');
  
  return (
    <div>
      {gdprEnabled && <GDPRSettings />}
      {ccpaEnabled && <CCPASettings />}
    </div>
  );
}
```

## Rollout Strategies

### 1. Enabled/Disabled

Enable or disable a feature for everyone:

```typescript
{
  key: 'passkeys',
  strategy: RolloutStrategy.ENABLED,
  enabled: true,
}
```

### 2. Percentage Rollout

Enable a feature for a percentage of users:

```typescript
{
  key: 'biometric_auth',
  strategy: RolloutStrategy.PERCENTAGE,
  enabled: true,
  percentage: 50, // 50% of users
}
```

The percentage is calculated using consistent hashing on the user ID, ensuring the same user always gets the same result.

### 3. User-Based Rollout

Enable a feature for specific users:

```typescript
{
  key: 'beta_features',
  strategy: RolloutStrategy.USERS,
  enabled: true,
  userIds: ['user-123', 'user-456', 'user-789'],
}
```

### 4. Organization-Based Rollout

Enable a feature for specific organizations:

```typescript
{
  key: 'enterprise_features',
  strategy: RolloutStrategy.ORGANIZATIONS,
  enabled: true,
  organizationIds: ['org-enterprise-1', 'org-enterprise-2'],
}
```

### 5. Attribute-Based Rollout

Enable a feature based on user attributes:

```typescript
{
  key: 'premium_features',
  strategy: RolloutStrategy.ATTRIBUTES,
  enabled: true,
  attributeRules: [
    {
      attribute: 'plan',
      operator: 'in',
      value: ['pro', 'enterprise'],
    },
    {
      attribute: 'email',
      operator: 'contains',
      value: '@enterprise.com',
    },
  ],
}
```

**Supported Operators:**
- `equals`, `not_equals`: Exact match
- `contains`, `not_contains`: String/array contains
- `in`, `not_in`: Value in array
- `greater_than`, `less_than`: Numeric comparison

### 6. Custom Rollout

Use custom logic for feature evaluation:

```typescript
{
  key: 'custom_feature',
  strategy: RolloutStrategy.CUSTOM,
  enabled: true,
  customEvaluator: (context) => {
    // Custom logic
    return context.email?.endsWith('@plinto.dev') || false;
  },
}
```

## Feature Dependencies

Define dependencies between features:

```typescript
{
  key: 'scim_provisioning',
  dependencies: ['sso_saml', 'sso_oidc'],
  // SCIM only enabled if SSO is enabled
}
```

## Evaluation Context

Provide rich context for feature evaluation:

```typescript
const context: EvaluationContext = {
  // User information
  userId: 'user-123',
  email: 'user@example.com',
  roles: ['admin', 'developer'],
  
  // Organization information
  organizationId: 'org-456',
  plan: 'enterprise',
  
  // Custom attributes
  attributes: {
    department: 'engineering',
    country: 'US',
    tier: 'premium',
  },
  
  // Request metadata
  request: {
    ip: '192.168.1.1',
    userAgent: 'Mozilla/5.0...',
    country: 'US',
  },
};

const enabled = await featureFlagService.isEnabled('feature_key', context);
```

## Detailed Evaluation

Get detailed information about why a feature is enabled or disabled:

```typescript
const result = await featureFlagService.evaluate('sso_saml', {
  userId: 'user-123',
  organizationId: 'org-enterprise',
});

console.log(result);
// {
//   key: 'sso_saml',
//   enabled: true,
//   reason: 'Organization in allowlist',
//   strategy: 'organizations',
// }
```

## Available Features

### Authentication & Security
- `passkeys`: WebAuthn passkey authentication
- `mfa_totp`: TOTP multi-factor authentication
- `mfa_sms`: SMS multi-factor authentication
- `mfa_email`: Email multi-factor authentication
- `biometric_auth`: Fingerprint/face recognition

### Enterprise Features
- `sso_saml`: SAML 2.0 single sign-on
- `sso_oidc`: OpenID Connect SSO
- `scim_provisioning`: SCIM 2.0 user provisioning
- `rbac`: Role-based access control
- `audit_logging`: Comprehensive audit logs
- `session_management`: Advanced session management

### Compliance & Privacy
- `gdpr_compliance`: GDPR compliance features
- `ccpa_compliance`: CCPA compliance features
- `consent_management`: Granular consent management
- `data_subject_requests`: Handle GDPR/CCPA requests
- `privacy_settings`: User privacy controls
- `data_export`: Data export in JSON/CSV
- `data_retention`: Automatic data retention

### Organization Features
- `multi_tenancy`: Multi-tenant support
- `org_hierarchies`: Nested organization structures
- `custom_domains`: Custom domain branding
- `white_labeling`: Complete white-label customization

### Advanced Features
- `graphql_api`: GraphQL API with subscriptions
- `webhooks`: Event-driven webhooks
- `rate_limiting`: Advanced rate limiting
- `ip_whitelisting`: IP-based access control
- `custom_roles`: Custom role creation
- `api_keys`: API key management

## API Reference

### FeatureFlagService

```typescript
class FeatureFlagService {
  // Check if feature is enabled
  isEnabled(key: FeatureFlagKey, context?: EvaluationContext): Promise<boolean>;
  
  // Get detailed evaluation result
  evaluate(key: FeatureFlagKey, context?: EvaluationContext): Promise<EvaluationResult>;
  
  // Get all feature flags
  getAllFlags(): Promise<FeatureFlagConfig[]>;
  
  // Get single feature flag
  getFlag(key: FeatureFlagKey): Promise<FeatureFlagConfig | null>;
  
  // Update feature flag
  updateFlag(key: FeatureFlagKey, config: Partial<FeatureFlagConfig>): Promise<void>;
  
  // Get all enabled features for context
  getEnabledFeatures(context?: EvaluationContext): Promise<FeatureFlagKey[]>;
}
```

### React Hooks

```typescript
// Get feature flag context
const { isEnabled, evaluate, loading } = useFeatureFlags();

// Check if feature is enabled
const enabled = useFeatureFlag('feature_key');

// Get evaluation result
const result = useFeatureFlagEvaluation('feature_key');
```

### React Components

```tsx
// Conditional rendering
<Feature name="feature_key" fallback={<Fallback />}>
  <FeatureContent />
</Feature>

// Higher-order component
const FeatureFlaggedComponent = withFeatureFlag(
  MyComponent,
  'feature_key',
  FallbackComponent
);
```

## Best Practices

1. **Use Percentage Rollout for New Features**: Start with 10%, gradually increase to 100%
2. **Define Dependencies**: Always define feature dependencies to avoid broken states
3. **Provide Rich Context**: Include all relevant user/org information for accurate targeting
4. **Monitor Evaluation**: Use detailed evaluation to understand feature adoption
5. **Clean Up Old Flags**: Remove feature flags once fully rolled out
6. **Document Flags**: Add clear descriptions for each feature flag
7. **Test Both States**: Test your app with features both enabled and disabled

## License

MIT
