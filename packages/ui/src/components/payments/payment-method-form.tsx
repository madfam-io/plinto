/**
 * Payment Method Form Component
 *
 * Add payment methods with automatic provider detection.
 * Supports Conekta (Mexican customers), Stripe (International/Fallback), and Polar.
 *
 * Features:
 * - Automatic provider detection based on billing address country
 * - Client-side tokenization (PCI compliant)
 * - Support for Mexican payment methods (OXXO, SPEI via Conekta)
 * - Fallback transparency (shows when Stripe is used as fallback)
 * - Form validation and error handling
 */

'use client';

import { useState, useEffect } from 'react';
import type { PaymentMethod } from '@plinto/typescript-sdk';

export interface PaymentMethodFormProps {
  /**
   * Plinto client instance
   */
  client: any;

  /**
   * Callback when payment method is successfully added
   */
  onSuccess?: (paymentMethod: PaymentMethod) => void;

  /**
   * Callback when user cancels the form
   */
  onCancel?: () => void;

  /**
   * Set this payment method as default
   */
  setAsDefault?: boolean;

  /**
   * Custom styling
   */
  className?: string;
}

interface BillingAddress {
  country: string;
  postal_code: string;
  state?: string;
  city?: string;
  line1?: string;
  line2?: string;
}

type PaymentProvider = 'conekta' | 'stripe' | 'polar';
type PaymentMethodType = 'card' | 'oxxo' | 'spei';

export function PaymentMethodForm({
  client,
  onSuccess,
  onCancel,
  setAsDefault = false,
  className = '',
}: PaymentMethodFormProps) {
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    country: '',
    postal_code: '',
  });

  const [detectedProvider, setDetectedProvider] = useState<PaymentProvider | null>(null);
  const [selectedMethodType, setSelectedMethodType] = useState<PaymentMethodType>('card');
  const [providerLoaded, setProviderLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackInfo, setFallbackInfo] = useState<string | null>(null);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');

  // Detect provider based on billing address country
  useEffect(() => {
    if (billingAddress.country) {
      const provider = detectProvider(billingAddress.country);
      setDetectedProvider(provider);
      setProviderLoaded(false);

      // Load appropriate provider SDK
      loadProviderSDK(provider);
    }
  }, [billingAddress.country]);

  const detectProvider = (country: string): PaymentProvider => {
    // Mexico → Conekta
    if (country === 'MX') {
      return 'conekta';
    }
    // Default → Stripe (international)
    return 'stripe';
  };

  const loadProviderSDK = async (provider: PaymentProvider) => {
    try {
      if (provider === 'conekta') {
        await loadConektaSDK();
      } else if (provider === 'stripe') {
        await loadStripeSDK();
      }
      setProviderLoaded(true);
    } catch (err: any) {
      setError(`Failed to load payment provider: ${err.message}`);
    }
  };

  const loadConektaSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Conekta) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.conekta.io/js/latest/conekta.js';
      script.onload = () => {
        // Initialize Conekta with public key
        const publicKey = process.env.NEXT_PUBLIC_CONEKTA_PUBLIC_KEY;
        if (publicKey) {
          (window as any).Conekta.setPublicKey(publicKey);
          resolve();
        } else {
          reject(new Error('Conekta public key not configured'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Conekta SDK'));
      document.body.appendChild(script);
    });
  };

  const loadStripeSDK = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
        if (publicKey) {
          (window as any).stripe = (window as any).Stripe(publicKey);
          resolve();
        } else {
          reject(new Error('Stripe public key not configured'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Stripe SDK'));
      document.body.appendChild(script);
    });
  };

  const tokenizeCard = async (): Promise<string> => {
    if (!detectedProvider || !providerLoaded) {
      throw new Error('Payment provider not loaded');
    }

    if (detectedProvider === 'conekta') {
      return await tokenizeWithConekta();
    } else if (detectedProvider === 'stripe') {
      return await tokenizeWithStripe();
    }

    throw new Error('Unsupported payment provider');
  };

  const tokenizeWithConekta = async (): Promise<string> => {
    const Conekta = (window as any).Conekta;

    const tokenParams = {
      card: {
        number: cardNumber.replace(/\s/g, ''),
        name: cardName,
        exp_year: expiryYear,
        exp_month: expiryMonth,
        cvc: cvv,
      },
    };

    return new Promise((resolve, reject) => {
      Conekta.Token.create(
        tokenParams,
        (token: any) => {
          resolve(token.id);
        },
        (error: any) => {
          reject(new Error(error.message_to_purchaser || 'Tokenization failed'));
        }
      );
    });
  };

  const tokenizeWithStripe = async (): Promise<string> => {
    const stripe = (window as any).stripe;

    const result = await stripe.createToken('card', {
      number: cardNumber.replace(/\s/g, ''),
      exp_month: parseInt(expiryMonth),
      exp_year: parseInt(expiryYear),
      cvc: cvv,
      name: cardName,
      address_country: billingAddress.country,
      address_zip: billingAddress.postal_code,
      address_state: billingAddress.state,
      address_city: billingAddress.city,
      address_line1: billingAddress.line1,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.token.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFallbackInfo(null);

    try {
      // Validate form
      if (!billingAddress.country || !billingAddress.postal_code) {
        throw new Error('Please complete billing address');
      }

      if (selectedMethodType === 'card') {
        if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
          throw new Error('Please complete all card fields');
        }
      }

      // Tokenize payment method (client-side, PCI compliant)
      const token = await tokenizeCard();

      // Submit to backend
      const paymentMethod = await client.payments.addPaymentMethod({
        token,
        billing_address: billingAddress,
        set_as_default: setAsDefault,
      });

      // Check for fallback info
      const providerInfo = await client.payments.getProviderInfo();
      if (providerInfo.fallback_info) {
        setFallbackInfo(
          `Note: Payment processed via ${providerInfo.fallback_info.fallback_provider} (${providerInfo.fallback_info.reason.replace(/_/g, ' ')})`
        );
      }

      if (onSuccess) {
        onSuccess(paymentMethod);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Add Payment Method</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Billing Address Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Billing Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={billingAddress.country}
                onChange={(e) =>
                  setBillingAddress({ ...billingAddress, country: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select country</option>
                <option value="MX">Mexico</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                {/* Add more countries as needed */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={billingAddress.postal_code}
                onChange={(e) =>
                  setBillingAddress({ ...billingAddress, postal_code: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={billingAddress.city || ''}
                onChange={(e) =>
                  setBillingAddress({ ...billingAddress, city: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <input
                type="text"
                value={billingAddress.state || ''}
                onChange={(e) =>
                  setBillingAddress({ ...billingAddress, state: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                value={billingAddress.line1 || ''}
                onChange={(e) =>
                  setBillingAddress({ ...billingAddress, line1: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Provider Detection Info */}
        {detectedProvider && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Payment Provider:</span>{' '}
              {detectedProvider === 'conekta'
                ? 'Conekta (Mexican payment processor)'
                : 'Stripe (International payment processor)'}
            </p>
          </div>
        )}

        {/* Payment Method Type Selection (for Conekta) */}
        {detectedProvider === 'conekta' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method Type
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedMethodType('card')}
                className={`px-4 py-2 rounded-md border ${
                  selectedMethodType === 'card'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                Credit/Debit Card
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethodType('oxxo')}
                className={`px-4 py-2 rounded-md border ${
                  selectedMethodType === 'oxxo'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                OXXO
              </button>
              <button
                type="button"
                onClick={() => setSelectedMethodType('spei')}
                className={`px-4 py-2 rounded-md border ${
                  selectedMethodType === 'spei'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                SPEI (Bank Transfer)
              </button>
            </div>
          </div>
        )}

        {/* Card Form (for card payment method) */}
        {selectedMethodType === 'card' && providerLoaded && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Card Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cardholder Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">YYYY</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(
                      (year) => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Fallback Info Display */}
        {fallbackInfo && (
          <div className="rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">{fallbackInfo}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !providerLoaded}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Add Payment Method'}
          </button>
        </div>
      </form>
    </div>
  );
}
