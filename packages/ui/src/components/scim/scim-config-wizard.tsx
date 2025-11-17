import * as React from 'react'
import { Button } from '../button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../card'
import { Input } from '../input'
import { Label } from '../label'
import { cn } from '../../lib/utils'

export interface SCIMConfiguration {
  id?: string
  organization_id: string
  provider: 'okta' | 'azure_ad' | 'google' | 'onelogin' | 'generic'
  scim_url: string
  bearer_token: string
  enabled: boolean
  user_sync_enabled: boolean
  group_sync_enabled: boolean
  auto_create_users: boolean
  auto_suspend_users: boolean
  attribute_mapping?: Record<string, string>
}

export interface SCIMConfigWizardProps {
  className?: string
  organizationId: string
  existingConfig?: SCIMConfiguration
  onSubmit?: (config: Omit<SCIMConfiguration, 'id'>) => Promise<SCIMConfiguration>
  onCancel?: () => void
  onSuccess?: (config: SCIMConfiguration) => void
  onError?: (error: Error) => void
  plintoClient?: any
  apiUrl?: string
}

export function SCIMConfigWizard({
  className,
  organizationId,
  existingConfig,
  onSubmit,
  onCancel,
  onSuccess,
  onError,
  plintoClient,
  apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
}: SCIMConfigWizardProps) {
  const [step, setStep] = React.useState(1)
  const [provider, setProvider] = React.useState<SCIMConfiguration['provider']>(
    existingConfig?.provider || 'okta'
  )
  const [bearerToken, setBearerToken] = React.useState(existingConfig?.bearer_token || '')
  const [userSyncEnabled, setUserSyncEnabled] = React.useState(
    existingConfig?.user_sync_enabled ?? true
  )
  const [groupSyncEnabled, setGroupSyncEnabled] = React.useState(
    existingConfig?.group_sync_enabled ?? true
  )
  const [autoCreateUsers, setAutoCreateUsers] = React.useState(
    existingConfig?.auto_create_users ?? true
  )
  const [autoSuspendUsers, setAutoSuspendUsers] = React.useState(
    existingConfig?.auto_suspend_users ?? false
  )
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [showToken, setShowToken] = React.useState(false)
  const [scimUrl, setScimUrl] = React.useState('')
  const [generatedToken, setGeneratedToken] = React.useState<string | null>(null)

  const providers = [
    {
      value: 'okta' as const,
      label: 'Okta',
      description: 'Okta Identity Management',
      icon: '🔐',
      docsUrl: 'https://developer.okta.com/docs/concepts/scim/',
    },
    {
      value: 'azure_ad' as const,
      label: 'Azure AD',
      description: 'Microsoft Azure Active Directory',
      icon: '🔷',
      docsUrl: 'https://learn.microsoft.com/azure/active-directory/app-provisioning/use-scim-to-provision-users-and-groups',
    },
    {
      value: 'google' as const,
      label: 'Google Workspace',
      description: 'Google Workspace Directory',
      icon: '🔵',
      docsUrl: 'https://developers.google.com/admin-sdk/directory',
    },
    {
      value: 'onelogin' as const,
      label: 'OneLogin',
      description: 'OneLogin Identity Platform',
      icon: '🟡',
      docsUrl: 'https://developers.onelogin.com/scim',
    },
    {
      value: 'generic' as const,
      label: 'Generic SCIM 2.0',
      description: 'Any SCIM 2.0 compliant provider',
      icon: '⚙️',
      docsUrl: 'https://scim.cloud',
    },
  ]

  const selectedProvider = providers.find((p) => p.value === provider)!

  React.useEffect(() => {
    // Generate SCIM endpoint URL
    const baseUrl = apiUrl.replace('/api', '')
    setScimUrl(`${baseUrl}/scim/v2/organizations/${organizationId}`)
  }, [apiUrl, organizationId])

  const generateBearerToken = () => {
    // Generate a secure random token
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    const token = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
    setGeneratedToken(token)
    setBearerToken(token)
  }

  const handleSubmit = async () => {
    setError(null)

    // Validation
    if (!bearerToken) {
      setError('Bearer token is required')
      return
    }

    setIsSubmitting(true)

    try {
      const configData: Omit<SCIMConfiguration, 'id'> = {
        organization_id: organizationId,
        provider,
        scim_url: scimUrl,
        bearer_token: bearerToken,
        enabled: true,
        user_sync_enabled: userSyncEnabled,
        group_sync_enabled: groupSyncEnabled,
        auto_create_users: autoCreateUsers,
        auto_suspend_users: autoSuspendUsers,
      }

      let config: SCIMConfiguration

      if (plintoClient) {
        config = existingConfig
          ? await plintoClient.scim.updateConfiguration(existingConfig.id, configData)
          : await plintoClient.scim.createConfiguration(configData)
      } else if (onSubmit) {
        config = await onSubmit(configData)
      } else {
        const res = await fetch(`${apiUrl}/api/v1/scim/configuration`, {
          method: existingConfig ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(configData),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.detail || 'Failed to configure SCIM')
        }

        config = await res.json()
      }

      onSuccess?.(config)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to configure SCIM'
      setError(errorMessage)
      onError?.(err instanceof Error ? err : new Error(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold',
                step >= s
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              )}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={cn('h-1 w-16', step > s ? 'bg-blue-600' : 'bg-gray-300')}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Choose Provider */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choose Your Identity Provider</CardTitle>
            <CardDescription>
              Select the identity provider you want to connect with SCIM 2.0
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {providers.map((p) => (
                <div
                  key={p.value}
                  className={cn(
                    'cursor-pointer rounded-lg border-2 p-4 transition-colors',
                    provider === p.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => setProvider(p.value)}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">{p.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold">{p.label}</h3>
                      <p className="mt-1 text-sm text-gray-600">{p.description}</p>
                      <a
                        href={p.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Documentation →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button onClick={() => setStep(2)} className="ml-auto">
              Next: Configuration
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Configure SCIM */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure SCIM Endpoint</CardTitle>
            <CardDescription>
              Use these credentials to configure {selectedProvider.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>SCIM Endpoint URL</Label>
              <div className="flex space-x-2">
                <Input value={scimUrl} readOnly className="font-mono text-sm" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(scimUrl)}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Configure this URL in your {selectedProvider.label} SCIM settings
              </p>
            </div>

            <div className="space-y-2">
              <Label>Bearer Token</Label>
              <div className="flex space-x-2">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="Enter or generate bearer token"
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? 'Hide' : 'Show'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Use this token in your {selectedProvider.label} authentication settings
                </p>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={generateBearerToken}
                  className="text-xs"
                >
                  Generate Token
                </Button>
              </div>
              {generatedToken && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-sm font-semibold text-green-800">
                    Token Generated Successfully
                  </p>
                  <p className="mt-1 text-xs text-green-700">
                    Save this token securely - it won't be shown again
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="text-sm font-semibold text-blue-800">
                {selectedProvider.label} Setup Instructions
              </h4>
              <ol className="mt-2 space-y-1 text-sm text-blue-700">
                <li>1. Copy the SCIM Endpoint URL above</li>
                <li>2. Generate and copy the Bearer Token</li>
                <li>3. Open your {selectedProvider.label} admin console</li>
                <li>4. Navigate to SCIM provisioning settings</li>
                <li>5. Paste the URL and token</li>
                <li>6. Enable user and group provisioning</li>
              </ol>
              <a
                href={selectedProvider.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-sm text-blue-600 hover:underline"
              >
                View Detailed Guide →
              </a>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!bearerToken}
            >
              Next: Sync Settings
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Sync Settings */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>
              Configure how users and groups should be synchronized
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1">
                  <Label className="font-medium">User Synchronization</Label>
                  <p className="mt-1 text-sm text-gray-600">
                    Automatically sync users from {selectedProvider.label}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={userSyncEnabled}
                    onChange={(e) => setUserSyncEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1">
                  <Label className="font-medium">Group Synchronization</Label>
                  <p className="mt-1 text-sm text-gray-600">
                    Automatically sync groups and memberships
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={groupSyncEnabled}
                    onChange={(e) => setGroupSyncEnabled(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1">
                  <Label className="font-medium">Auto-Create Users</Label>
                  <p className="mt-1 text-sm text-gray-600">
                    Automatically create accounts for new users from IdP
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={autoCreateUsers}
                    onChange={(e) => setAutoCreateUsers(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-start justify-between space-x-4 rounded-lg border p-4">
                <div className="flex-1">
                  <Label className="font-medium">Auto-Suspend Users</Label>
                  <p className="mt-1 text-sm text-gray-600">
                    Automatically suspend users deactivated in IdP
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={autoSuspendUsers}
                    onChange={(e) => setAutoSuspendUsers(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="text-sm font-semibold text-green-800">Ready to Enable SCIM</h4>
              <ul className="mt-2 space-y-1 text-sm text-green-700">
                <li>✓ Provider: {selectedProvider.label}</li>
                <li>✓ SCIM URL configured</li>
                <li>✓ Bearer token set</li>
                <li>✓ Sync preferences configured</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Enabling SCIM...' : 'Enable SCIM Provisioning'}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
