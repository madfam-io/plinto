/**
 * Subscription Management Component
 *
 * Display and manage current subscription with upgrade/downgrade options.
 *
 * Features:
 * - Current subscription details (plan, status, billing cycle)
 * - Next billing date and amount display
 * - Upgrade/downgrade plan options
 * - Change billing interval (monthly ↔ yearly)
 * - Cancel subscription (immediate or at period end)
 * - Resume canceled subscription
 * - Trial period indicator
 * - Provider badge and fallback transparency
 */

'use client';

import { useState, useEffect } from 'react';
import type { Subscription, SubscriptionPlan, BillingInterval } from '@plinto/typescript-sdk';

export interface SubscriptionManagementProps {
  /**
   * Plinto client instance
   */
  client: any;

  /**
   * Callback when subscription is updated
   */
  onSubscriptionUpdate?: (subscription: Subscription) => void;

  /**
   * Custom styling
   */
  className?: string;
}

export function SubscriptionManagement({
  client,
  onSubscriptionUpdate,
  className = '',
}: SubscriptionManagementProps) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showChangePlan, setShowChangePlan] = useState(false);

  useEffect(() => {
    loadSubscriptionData();
  }, [client]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load current subscription and available plans in parallel
      const [subscriptions, plans] = await Promise.all([
        client.payments.listSubscriptions(),
        client.payments.listPlans(),
      ]);

      // Get active subscription (should only be one)
      const activeSubscription = subscriptions.find(
        (s: Subscription) =>
          s.status === 'active' || s.status === 'trialing' || s.status === 'past_due'
      );

      setSubscription(activeSubscription || null);
      setAvailablePlans(plans.filter((p: SubscriptionPlan) => p.is_active));
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    if (!subscription) return;

    try {
      setActionLoading(true);
      setError(null);

      const updatedSubscription = await client.payments.updateSubscription(subscription.id, {
        plan_id: planId,
      });

      setSubscription(updatedSubscription);
      setShowChangePlan(false);

      if (onSubscriptionUpdate) {
        onSubscriptionUpdate(updatedSubscription);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeBillingInterval = async (interval: BillingInterval) => {
    if (!subscription) return;

    try {
      setActionLoading(true);
      setError(null);

      const updatedSubscription = await client.payments.updateSubscription(subscription.id, {
        billing_interval: interval,
      });

      setSubscription(updatedSubscription);

      if (onSubscriptionUpdate) {
        onSubscriptionUpdate(updatedSubscription);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to change billing interval');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (immediate: boolean) => {
    if (!subscription) return;

    try {
      setActionLoading(true);
      setError(null);

      const updatedSubscription = await client.payments.cancelSubscription(
        subscription.id,
        immediate
      );

      setSubscription(updatedSubscription);
      setShowCancelConfirm(false);

      if (onSubscriptionUpdate) {
        onSubscriptionUpdate(updatedSubscription);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeSubscription = async () => {
    if (!subscription) return;

    try {
      setActionLoading(true);
      setError(null);

      const updatedSubscription = await client.payments.resumeSubscription(subscription.id);

      setSubscription(updatedSubscription);

      if (onSubscriptionUpdate) {
        onSubscriptionUpdate(updatedSubscription);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resume subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      trialing: 'bg-blue-100 text-blue-800',
      past_due: 'bg-yellow-100 text-yellow-800',
      canceled: 'bg-gray-100 text-gray-800',
      unpaid: 'bg-red-100 text-red-800',
      paused: 'bg-gray-100 text-gray-800',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusColors[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    const providerInfo: Record<string, { name: string; color: string }> = {
      conekta: { name: 'Conekta', color: 'bg-purple-100 text-purple-800' },
      stripe: { name: 'Stripe', color: 'bg-indigo-100 text-indigo-800' },
      polar: { name: 'Polar', color: 'bg-blue-100 text-blue-800' },
    };

    const info = providerInfo[provider] || { name: provider, color: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
        {info.name}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No active subscription</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have an active subscription. Choose a plan to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Subscription Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{subscription.plan_name}</h3>
            <div className="mt-1 flex items-center gap-2">
              {getStatusBadge(subscription.status)}
              {getProviderBadge(subscription.provider)}
              {subscription.trial_end && new Date(subscription.trial_end) > new Date() && (
                <span className="text-xs text-blue-600">
                  Trial ends {formatDate(subscription.trial_end)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Details */}
      <div className="px-6 py-4 space-y-4">
        {/* Billing Cycle */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Billing Cycle</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {subscription.billing_interval === 'monthly' ? 'Monthly' : 'Yearly'}
            </span>
            {!subscription.cancel_at_period_end && (
              <button
                onClick={() =>
                  handleChangeBillingInterval(
                    subscription.billing_interval === 'monthly' ? 'yearly' : 'monthly'
                  )
                }
                disabled={actionLoading}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400"
              >
                Switch to {subscription.billing_interval === 'monthly' ? 'yearly' : 'monthly'}
              </button>
            )}
          </div>
        </div>

        {/* Current Period */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Current Period</span>
          <span className="text-sm font-medium text-gray-900">
            {formatDate(subscription.current_period_start)} -{' '}
            {formatDate(subscription.current_period_end)}
          </span>
        </div>

        {/* Next Billing Date */}
        {!subscription.cancel_at_period_end && subscription.status !== 'canceled' && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Next Billing Date</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(subscription.current_period_end)}
            </span>
          </div>
        )}

        {/* Cancellation Notice */}
        {subscription.cancel_at_period_end && (
          <div className="rounded-md bg-yellow-50 p-3">
            <p className="text-sm text-yellow-800">
              Your subscription will be canceled on {formatDate(subscription.current_period_end)}
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
        {!showChangePlan && !showCancelConfirm && (
          <>
            <button
              onClick={() => setShowChangePlan(true)}
              disabled={actionLoading || subscription.cancel_at_period_end}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300"
            >
              Change Plan
            </button>

            {subscription.cancel_at_period_end ? (
              <button
                onClick={handleResumeSubscription}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-green-600 bg-white border border-green-600 rounded-md hover:bg-green-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Resume Subscription
              </button>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Cancel Subscription
              </button>
            )}
          </>
        )}

        {/* Change Plan Interface */}
        {showChangePlan && (
          <div className="w-full space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Select New Plan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availablePlans
                .filter((plan) => plan.id !== subscription.plan_id)
                .map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handleChangePlan(plan.id)}
                    disabled={actionLoading}
                    className="text-left p-3 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <div className="font-medium text-gray-900">{plan.name}</div>
                    <div className="text-sm text-gray-600">
                      $
                      {subscription.billing_interval === 'monthly'
                        ? plan.price_monthly
                        : plan.price_yearly}
                      /{subscription.billing_interval === 'monthly' ? 'mo' : 'yr'}
                    </div>
                  </button>
                ))}
            </div>
            <button
              onClick={() => setShowChangePlan(false)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Cancel Confirmation */}
        {showCancelConfirm && (
          <div className="w-full space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Cancel Subscription?</h4>
            <p className="text-sm text-gray-600">
              Choose when you want your subscription to be canceled:
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleCancelSubscription(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-300"
              >
                Cancel at Period End
              </button>
              <button
                onClick={() => handleCancelSubscription(true)}
                disabled={actionLoading}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400"
              >
                Cancel Immediately
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Keep Subscription
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
