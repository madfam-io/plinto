import * as React from 'react'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card'
import { Label } from '../label'
import { cn } from '../../lib/utils'

export interface PrivacyPreferences {
  analytics: boolean
  marketing: boolean
  third_party_sharing: boolean
  profile_visibility: 'public' | 'private' | 'organization'
  email_notifications: boolean
  activity_tracking: boolean
  data_retention_override?: number
  cookie_consent: boolean
}

export interface PrivacySettingsProps {
  className?: string
  userId: string
  currentPreferences?: Partial<PrivacyPreferences>
  onSave?: (preferences: PrivacyPreferences) => Promise<void>
  onError?: (error: Error) => void
  plintoClient?: any
  apiUrl?: string
  showAdvanced?: boolean
}

export function PrivacySettings({
  className,
  userId,
  currentPreferences = {},
  onSave,
  onError,
  plintoClient,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  showAdvanced = true,
}: PrivacySettingsProps) {
  const [preferences, setPreferences] = React.useState<PrivacyPreferences>({
    analytics: currentPreferences.analytics ?? false,
    marketing: currentPreferences.marketing ?? false,
    third_party_sharing: currentPreferences.third_party_sharing ?? false,
    profile_visibility: currentPreferences.profile_visibility ?? 'organization',
    email_notifications: currentPreferences.email_notifications ?? true,
    activity_tracking: currentPreferences.activity_tracking ?? false,
    data_retention_override: currentPreferences.data_retention_override,
    cookie_consent: currentPreferences.cookie_consent ?? false,
  })

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  const handlePreferenceChange = <K extends keyof PrivacyPreferences>(
    key: K,
    value: PrivacyPreferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSuccess(false)
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

    try {
      if (plintoClient) {
        await plintoClient.compliance.updatePrivacySettings(userId, preferences)
      } else if (onSave) {
        await onSave(preferences)
      } else {
        const res = await fetch(`${apiUrl}/api/v1/compliance/privacy-settings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: userId,
            preferences,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || 'Failed to save privacy settings')
        }
      }

      setSuccess(true)
      setHasChanges(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setPreferences({
      analytics: currentPreferences.analytics ?? false,
      marketing: currentPreferences.marketing ?? false,
      third_party_sharing: currentPreferences.third_party_sharing ?? false,
      profile_visibility: currentPreferences.profile_visibility ?? 'organization',
      email_notifications: currentPreferences.email_notifications ?? true,
      activity_tracking: currentPreferences.activity_tracking ?? false,
      data_retention_override: currentPreferences.data_retention_override,
      cookie_consent: currentPreferences.cookie_consent ?? false,
    })
    setHasChanges(false)
    setSuccess(false)
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Control how your data is collected, used, and shared. These settings comply with GDPR
            and other privacy regulations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Data Collection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Collection & Analytics</h3>
            
            <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
              <div className="flex-1">
                <Label className="font-medium">Analytics & Performance</Label>
                <p className="mt-1 text-sm text-gray-600">
                  Allow us to collect anonymous usage data to improve the product
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
              </label>
            </div>

            <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
              <div className="flex-1">
                <Label className="font-medium">Activity Tracking</Label>
                <p className="mt-1 text-sm text-gray-600">
                  Track your activity for personalized recommendations and insights
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.activity_tracking}
                  onChange={(e) => handlePreferenceChange('activity_tracking', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
              </label>
            </div>

            <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
              <div className="flex-1">
                <Label className="font-medium">Cookie Consent</Label>
                <p className="mt-1 text-sm text-gray-600">
                  Allow non-essential cookies for enhanced functionality
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.cookie_consent}
                  onChange={(e) => handlePreferenceChange('cookie_consent', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
              </label>
            </div>
          </div>

          {/* Marketing & Communications */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Marketing & Communications</h3>
            
            <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
              <div className="flex-1">
                <Label className="font-medium">Marketing Emails</Label>
                <p className="mt-1 text-sm text-gray-600">
                  Receive promotional emails, newsletters, and product updates
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
              </label>
            </div>

            <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
              <div className="flex-1">
                <Label className="font-medium">Email Notifications</Label>
                <p className="mt-1 text-sm text-gray-600">
                  Receive important account and security notifications
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.email_notifications}
                  onChange={(e) => handlePreferenceChange('email_notifications', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
              </label>
            </div>
          </div>

          {/* Data Sharing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Data Sharing</h3>
            
            <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
              <div className="flex-1">
                <Label className="font-medium">Third-Party Sharing</Label>
                <p className="mt-1 text-sm text-gray-600">
                  Allow sharing anonymized data with trusted partners for research
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={preferences.third_party_sharing}
                  onChange={(e) => handlePreferenceChange('third_party_sharing', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
              </label>
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <Label className="font-medium">Profile Visibility</Label>
              <p className="text-sm text-gray-600">Control who can see your profile information</p>
              <div className="mt-3 space-y-2">
                {[
                  { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
                  { value: 'organization', label: 'Organization Only', description: 'Only members of your organization' },
                  { value: 'private', label: 'Private', description: 'Only you can view your profile' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-start space-x-3 rounded-lg border p-3',
                      preferences.profile_visibility === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <input
                      type="radio"
                      name="profile_visibility"
                      value={option.value}
                      checked={preferences.profile_visibility === option.value}
                      onChange={(e) =>
                        handlePreferenceChange(
                          'profile_visibility',
                          e.target.value as 'public' | 'private' | 'organization'
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />
                    <div>
                      <p className="font-medium">{option.label}</p>
                      <p className="text-sm text-gray-600">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Advanced Settings</h3>
              
              <div className="space-y-2 rounded-lg border p-4">
                <Label className="font-medium">Data Retention Period</Label>
                <p className="text-sm text-gray-600">
                  Override default data retention (days). Leave empty for default policy.
                </p>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={preferences.data_retention_override || ''}
                  onChange={(e) =>
                    handlePreferenceChange(
                      'data_retention_override',
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  placeholder="Default retention policy"
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500">Range: 30-365 days</p>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-800">Privacy settings saved successfully</p>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <Button type="button" variant="outline" onClick={handleReset} disabled={!hasChanges || isSubmitting}>
              Reset Changes
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Privacy Rights</CardTitle>
          <CardDescription>Understanding your rights under GDPR and privacy laws</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Right to Access:</strong> You can request a copy of all data we hold about you
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Right to Erasure:</strong> You can request deletion of your personal data
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Right to Portability:</strong> You can export your data in a machine-readable format
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Right to Rectification:</strong> You can request correction of inaccurate data
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-blue-600">•</span>
              <p>
                <strong>Right to Object:</strong> You can object to processing of your data
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
