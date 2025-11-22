/**
 * Invoice List Component
 *
 * Display and manage invoice history with payment actions.
 *
 * Features:
 * - Invoice list with pagination
 * - Filter by status (pending, paid, failed)
 * - Invoice details (amount, date, status)
 * - Pay pending invoices
 * - Download invoice PDF
 * - Provider badge for each invoice
 * - Payment retry for failed invoices
 */

'use client';

import { useState, useEffect } from 'react';
import type { Invoice, PaymentStatus } from '@janua/typescript-sdk';

export interface InvoiceListProps {
  /**
   * Janua client instance
   */
  client: any;

  /**
   * Number of invoices per page
   */
  limit?: number;

  /**
   * Custom styling
   */
  className?: string;
}

export function InvoiceList({ client, limit = 20, className = '' }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredStatus, setFilteredStatus] = useState<PaymentStatus | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInvoices();
  }, [client, filteredStatus, currentPage]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await client.payments.listInvoices(
        filteredStatus,
        limit,
        currentPage * limit
      );

      setInvoices(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      setActionLoading(invoiceId);
      setError(null);

      await client.payments.payInvoice(invoiceId);

      // Reload invoices to reflect payment
      await loadInvoices();
    } catch (err: any) {
      setError(err.message || 'Failed to pay invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      setActionLoading(invoiceId);
      setError(null);

      const pdfUrl = await client.payments.getInvoicePdfUrl(invoiceId);

      // Open PDF in new window
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      setError(err.message || 'Failed to download invoice PDF');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Amount is in cents
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const statusConfig: Record<
      PaymentStatus,
      { label: string; color: string; icon: string }
    > = {
      pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⏳',
      },
      paid: {
        label: 'Paid',
        color: 'bg-green-100 text-green-800',
        icon: '✓',
      },
      failed: {
        label: 'Failed',
        color: 'bg-red-100 text-red-800',
        icon: '✗',
      },
      refunded: {
        label: 'Refunded',
        color: 'bg-gray-100 text-gray-800',
        icon: '↩',
      },
      void: {
        label: 'Void',
        color: 'bg-gray-100 text-gray-800',
        icon: '—',
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <span className="mr-1">{config.icon}</span>
        {config.label}
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
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${info.color}`}
      >
        {info.name}
      </span>
    );
  };

  if (loading && invoices.length === 0) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter:</label>
            <select
              value={filteredStatus || ''}
              onChange={(e) => {
                setFilteredStatus(
                  e.target.value ? (e.target.value as PaymentStatus) : undefined
                );
                setCurrentPage(0);
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Invoices</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="void">Void</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 rounded-md bg-red-50 p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Invoice Table */}
      {invoices.length === 0 ? (
        <div className="text-center py-12">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No invoices</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filteredStatus
              ? `No ${filteredStatus} invoices found`
              : 'You have no invoices yet'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Invoice
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Provider
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{invoice.id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(invoice.invoice_date)}
                      </div>
                      {invoice.due_date && (
                        <div className="text-xs text-gray-500">
                          Due: {formatDate(invoice.due_date)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getProviderBadge(invoice.provider)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {/* Pay Invoice Button (for pending/failed invoices) */}
                        {(invoice.status === 'pending' || invoice.status === 'failed') && (
                          <button
                            onClick={() => handlePayInvoice(invoice.id)}
                            disabled={actionLoading === invoice.id}
                            className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                          >
                            {actionLoading === invoice.id ? 'Processing...' : 'Pay'}
                          </button>
                        )}

                        {/* Download PDF Button */}
                        {invoice.invoice_pdf && (
                          <button
                            onClick={() => handleDownloadPdf(invoice.id)}
                            disabled={actionLoading === invoice.id}
                            className="text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                            title="Download PDF"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </button>
                        )}

                        {/* View Hosted Invoice */}
                        {invoice.hosted_invoice_url && (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                            title="View Invoice"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {currentPage + 1}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={invoices.length < limit || loading}
                className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
