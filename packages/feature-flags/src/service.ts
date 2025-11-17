import {
  FeatureFlagConfig,
  FeatureFlagKey,
  RolloutStrategy,
  EvaluationContext,
  EvaluationResult,
  IFeatureFlagService,
  AttributeRule,
} from './types';
import { defaultFeatureFlags } from './config';

/**
 * In-memory feature flag service implementation
 */
export class FeatureFlagService implements IFeatureFlagService {
  private flags: Map<FeatureFlagKey, FeatureFlagConfig>;

  constructor(initialFlags: FeatureFlagConfig[] = defaultFeatureFlags) {
    this.flags = new Map(initialFlags.map(flag => [flag.key, flag]));
  }

  /**
   * Check if a feature is enabled for the given context
   */
  async isEnabled(key: FeatureFlagKey, context?: EvaluationContext): Promise<boolean> {
    const result = await this.evaluate(key, context);
    return result.enabled;
  }

  /**
   * Get evaluation result with detailed information
   */
  async evaluate(key: FeatureFlagKey, context?: EvaluationContext): Promise<EvaluationResult> {
    const flag = this.flags.get(key);

    if (!flag) {
      return {
        key,
        enabled: false,
        reason: 'Feature flag not found',
        strategy: RolloutStrategy.DISABLED,
      };
    }

    // Check dependencies first
    if (flag.dependencies && flag.dependencies.length > 0) {
      for (const depKey of flag.dependencies) {
        const depEnabled = await this.isEnabled(depKey as FeatureFlagKey, context);
        if (!depEnabled) {
          return {
            key,
            enabled: false,
            reason: `Dependency '${depKey}' is not enabled`,
            strategy: flag.strategy,
          };
        }
      }
    }

    // Evaluate based on strategy
    switch (flag.strategy) {
      case RolloutStrategy.DISABLED:
        return {
          key,
          enabled: false,
          reason: 'Feature is disabled',
          strategy: flag.strategy,
        };

      case RolloutStrategy.ENABLED:
        return {
          key,
          enabled: flag.enabled,
          reason: flag.enabled ? 'Feature is enabled for all' : 'Feature is disabled',
          strategy: flag.strategy,
        };

      case RolloutStrategy.PERCENTAGE:
        if (!context?.userId) {
          return {
            key,
            enabled: false,
            reason: 'User ID required for percentage rollout',
            strategy: flag.strategy,
          };
        }
        const enabled = this.evaluatePercentage(context.userId, flag.percentage || 0);
        return {
          key,
          enabled,
          reason: enabled
            ? `User in ${flag.percentage}% rollout`
            : `User not in ${flag.percentage}% rollout`,
          strategy: flag.strategy,
        };

      case RolloutStrategy.USERS:
        if (!context?.userId) {
          return {
            key,
            enabled: false,
            reason: 'User ID required for user-based rollout',
            strategy: flag.strategy,
          };
        }
        const userEnabled = flag.userIds?.includes(context.userId) || false;
        return {
          key,
          enabled: userEnabled,
          reason: userEnabled ? 'User in allowlist' : 'User not in allowlist',
          strategy: flag.strategy,
        };

      case RolloutStrategy.ORGANIZATIONS:
        if (!context?.organizationId) {
          return {
            key,
            enabled: false,
            reason: 'Organization ID required for organization-based rollout',
            strategy: flag.strategy,
          };
        }
        const orgEnabled = flag.organizationIds?.includes(context.organizationId) || false;
        return {
          key,
          enabled: orgEnabled,
          reason: orgEnabled ? 'Organization in allowlist' : 'Organization not in allowlist',
          strategy: flag.strategy,
        };

      case RolloutStrategy.ATTRIBUTES:
        if (!flag.attributeRules || flag.attributeRules.length === 0) {
          return {
            key,
            enabled: false,
            reason: 'No attribute rules defined',
            strategy: flag.strategy,
          };
        }
        const attrEnabled = this.evaluateAttributeRules(flag.attributeRules, context);
        return {
          key,
          enabled: attrEnabled,
          reason: attrEnabled ? 'Attribute rules matched' : 'Attribute rules not matched',
          strategy: flag.strategy,
        };

      case RolloutStrategy.CUSTOM:
        if (!flag.customEvaluator) {
          return {
            key,
            enabled: false,
            reason: 'No custom evaluator defined',
            strategy: flag.strategy,
          };
        }
        try {
          const customEnabled = flag.customEvaluator(context || {});
          return {
            key,
            enabled: customEnabled,
            reason: customEnabled ? 'Custom evaluator passed' : 'Custom evaluator failed',
            strategy: flag.strategy,
          };
        } catch (error) {
          return {
            key,
            enabled: false,
            reason: `Custom evaluator error: ${error}`,
            strategy: flag.strategy,
          };
        }

      default:
        return {
          key,
          enabled: false,
          reason: 'Unknown strategy',
          strategy: flag.strategy,
        };
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFlags(): Promise<FeatureFlagConfig[]> {
    return Array.from(this.flags.values());
  }

  /**
   * Get feature flag by key
   */
  async getFlag(key: FeatureFlagKey): Promise<FeatureFlagConfig | null> {
    return this.flags.get(key) || null;
  }

  /**
   * Update feature flag configuration
   */
  async updateFlag(key: FeatureFlagKey, config: Partial<FeatureFlagConfig>): Promise<void> {
    const existing = this.flags.get(key);
    if (!existing) {
      throw new Error(`Feature flag '${key}' not found`);
    }

    this.flags.set(key, {
      ...existing,
      ...config,
      key, // Ensure key cannot be changed
    });
  }

  /**
   * Get all enabled features for a context
   */
  async getEnabledFeatures(context?: EvaluationContext): Promise<FeatureFlagKey[]> {
    const enabledFlags: FeatureFlagKey[] = [];

    for (const key of this.flags.keys()) {
      const enabled = await this.isEnabled(key, context);
      if (enabled) {
        enabledFlags.push(key);
      }
    }

    return enabledFlags;
  }

  /**
   * Evaluate percentage rollout using consistent hashing
   */
  private evaluatePercentage(userId: string, percentage: number): boolean {
    if (percentage === 0) return false;
    if (percentage === 100) return true;

    // Simple hash function for consistent percentage rollout
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = (hash << 5) - hash + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    const bucket = Math.abs(hash % 100);
    return bucket < percentage;
  }

  /**
   * Evaluate attribute rules (all rules must match)
   */
  private evaluateAttributeRules(rules: AttributeRule[], context?: EvaluationContext): boolean {
    if (!context) return false;

    return rules.every(rule => this.evaluateAttributeRule(rule, context));
  }

  /**
   * Evaluate a single attribute rule
   */
  private evaluateAttributeRule(rule: AttributeRule, context: EvaluationContext): boolean {
    // Get the attribute value from context
    let attributeValue: string | number | boolean | string[] | undefined;

    if (rule.attribute === 'email') {
      attributeValue = context.email;
    } else if (rule.attribute === 'role' || rule.attribute === 'roles') {
      attributeValue = context.roles;
    } else if (rule.attribute === 'plan') {
      attributeValue = context.plan;
    } else if (context.attributes && rule.attribute in context.attributes) {
      attributeValue = context.attributes[rule.attribute];
    } else {
      return false;
    }

    if (attributeValue === undefined) return false;

    // Evaluate based on operator
    switch (rule.operator) {
      case 'equals':
        return attributeValue === rule.value;

      case 'not_equals':
        return attributeValue !== rule.value;

      case 'contains':
        if (typeof attributeValue === 'string' && typeof rule.value === 'string') {
          return attributeValue.includes(rule.value);
        }
        if (Array.isArray(attributeValue) && typeof rule.value === 'string') {
          return attributeValue.includes(rule.value);
        }
        return false;

      case 'not_contains':
        if (typeof attributeValue === 'string' && typeof rule.value === 'string') {
          return !attributeValue.includes(rule.value);
        }
        if (Array.isArray(attributeValue) && typeof rule.value === 'string') {
          return !attributeValue.includes(rule.value);
        }
        return false;

      case 'in':
        if (Array.isArray(rule.value)) {
          return rule.value.includes(attributeValue as string);
        }
        return false;

      case 'not_in':
        if (Array.isArray(rule.value)) {
          return !rule.value.includes(attributeValue as string);
        }
        return false;

      case 'greater_than':
        if (typeof attributeValue === 'number' && typeof rule.value === 'number') {
          return attributeValue > rule.value;
        }
        return false;

      case 'less_than':
        if (typeof attributeValue === 'number' && typeof rule.value === 'number') {
          return attributeValue < rule.value;
        }
        return false;

      default:
        return false;
    }
  }
}

/**
 * Singleton instance for global access
 */
export const featureFlagService = new FeatureFlagService();
