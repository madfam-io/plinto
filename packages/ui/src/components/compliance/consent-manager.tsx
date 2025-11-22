import * as React from 'react'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'
import { Label } from '../label'
import { cn } from '../../lib/utils'

export interface ConsentPurpose {
  id: string
  name: string
  description: string
  required: boolean
  legal_basis: 'consent' | 'contract' | 'legitimate_interest' | 'legal_obligation'
}

export interface ConsentRecord {
  id: string
  user_id: string
  purpose: string
  granted: boolean
  legal_basis: string
  purpose_description: string
  consent_method: string
  ip_address?: string
  user_agent?: string
  granted_at?: string
  withdrawn_at?: string
  expires_at?: string
  version: string
}

export interface ConsentManagerProps {
  className?: string
  userId: string
  purposes: ConsentPurpose[]
  existingConsents?: ConsentRecord[]
  onSubmit?: (consents: Record<string, boolean>) => Promise<void>
  onWithdraw?: (purposeId: string) => Promise<void>
  onError?: (error: Error) => void
  januaClient?: any
  apiUrl?: string
  showLegalBasis?: boolean
  mode?: 'initial' | 'manage'
}

export function ConsentManager({
  className,
  userId,
  purposes,
  existingConsents = [],
  onSubmit,
  onWithdraw,
  onError,
  januaClient,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  showLegalBasis = true,
  mode = 'initial',
}: ConsentManagerProps) {
  const [consents, setConsents] = React.useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    purposes.forEach((purpose) => {
      const existing = existingConsents.find((c) => c.purpose === purpose.id)
      initial[purpose.id] = existing?.granted ?? purpose.required
    })
    return initial
  })
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [withdrawing, setWithdrawing] = React.useState<string | null>(null)

  const handleConsentChange = (purposeId: string, granted: boolean) => {
    const purpose = purposes.find((p) => p.id === purposeId)
    if (purpose?.required && !granted) {
      setError(`${purpose.name} is required and cannot be withdrawn`)
      return
    }
    setConsents((prev) => ({ ...prev, [purposeId]: granted }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate required consents
    const missingRequired = purposes
      .filter((p) => p.required && !consents[p.id])
      .map((p) => p.name)

    if (missingRequired.length > 0) {
      setError(`Required consents missing: ${missingRequired.join(', ')}`)
      return
    }

    setIsSubmitting(true)

    try {
      if (januaClient) {
        await januaClient.compliance.recordConsents(userId, consents)
      } else if (onSubmit) {
        await onSubmit(consents)
      } else {
        const res = await fetch(`${apiUrl}/api/v1/compliance/consent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: userId,
            consents: Object.entries(consents).map(([purpose, granted]) => ({
              purpose,
              granted,
            })),
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || 'Failed to record consents')
        }
      }

      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to record consents'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWithdraw = async (purposeId: string) => {
    const purpose = purposes.find((p) => p.id === purposeId)
    if (purpose?.required) {
      setError(`${purpose.name} is required and cannot be withdrawn`)
      return
    }

    setError(null)
    setWithdrawing(purposeId)

    try {
      if (januaClient) {
        await januaClient.compliance.withdrawConsent(userId, purposeId)
      } else if (onWithdraw) {
        await onWithdraw(purposeId)
      } else {
        const res = await fetch(`${apiUrl}/api/v1/compliance/consent/${purposeId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ user_id: userId }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || 'Failed to withdraw consent')
        }
      }

      setConsents((prev) => ({ ...prev, [purposeId]: false }))
      setSuccess(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw consent'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setWithdrawing(null)
    }
  }

  const getLegalBasisLabel = (basis: string) => {
    const labels: Record<string, string> = {
      consent: 'Your consent',
      contract: 'Contract performance',
      legitimate_interest: 'Legitimate interest',
      legal_obligation: 'Legal obligation',
    }
    return labels[basis] || basis
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Consent Preferences</CardTitle>
          <CardDescription>
            {mode === 'initial'
              ? 'We need your consent to process your personal data for the following purposes:'
              : 'Manage your consent preferences. You can withdraw consent at any time.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {purposes.map((purpose) => {
              const existing = existingConsents.find((c) => c.purpose === purpose.id)
              const isGranted = consents[purpose.id]

              return (
                <div
                  key={purpose.id}
                  className={cn(
                    'flex flex-col space-y-2 rounded-lg border p-4',
                    isGranted ? 'border-green-200 bg-green-50' : 'border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-1">
                      <Label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={isGranted}
                          disabled={purpose.required || isSubmitting}
                          onChange={(e) => handleConsentChange(purpose.id, e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <span className="font-medium">
                          {purpose.name}
                          {purpose.required && (
                            <span className="ml-2 text-xs text-red-600">(Required)</span>
                          )}
                        </span>
                      </Label>
                      <p className="text-sm text-gray-600">{purpose.description}</p>
                      {showLegalBasis && (
                        <p className="text-xs text-gray-500">
                          Legal basis: {getLegalBasisLabel(purpose.legal_basis)}
                        </p>
                      )}
                      {existing && existing.granted_at && (
                        <p className="text-xs text-gray-500">
                          Granted: {new Date(existing.granted_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {mode === 'manage' && !purpose.required && isGranted && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdraw(purpose.id)}
                        disabled={withdrawing === purpose.id}
                        className="ml-4"
                      >
                        {withdrawing === purpose.id ? 'Withdrawing...' : 'Withdraw'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800">
                  {mode === 'initial'
                    ? 'Consent preferences saved successfully'
                    : 'Preferences updated successfully'}
                </p>
              </div>
            )}
          </form>
        </CardContent>
        {mode === 'initial' && (
          <CardFooter className="flex justify-between">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our Privacy Policy and Terms of Service
            </p>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardFooter>
        )}
      </Card>

      {mode === 'manage' && (
        <Card>
          <CardHeader>
            <CardTitle>Consent History</CardTitle>
            <CardDescription>Your consent record and withdrawal history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {existingConsents.length === 0 ? (
                <p className="text-sm text-gray-500">No consent records found</p>
              ) : (
                existingConsents.map((consent) => (
                  <div
                    key={consent.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{consent.purpose_description}</p>
                      <p className="text-xs text-gray-500">
                        {consent.granted ? 'Granted' : 'Withdrawn'} •{' '}
                        {consent.granted
                          ? new Date(consent.granted_at!).toLocaleDateString()
                          : new Date(consent.withdrawn_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-1 text-xs',
                        consent.granted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {consent.granted ? 'Active' : 'Withdrawn'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
