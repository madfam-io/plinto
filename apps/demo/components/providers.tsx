'use client'

import { PlintoProvider } from './providers/plinto-provider'
import { FeatureFlagProvider } from '@plinto/feature-flags'
import { useAuth } from './providers/plinto-provider'

function FeatureFlagWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  
  return (
    <FeatureFlagProvider
      context={{
        userId: user?.id,
        organizationId: user?.organizationId,
        email: user?.email,
        plan: user?.organization?.plan || 'free',
        attributes: {
          app: 'demo',
          internal: user?.email?.endsWith('@plinto.dev') || false,
        },
      }}
    >
      {children}
    </FeatureFlagProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PlintoProvider>
      <FeatureFlagWrapper>{children}</FeatureFlagWrapper>
    </PlintoProvider>
  )
}