'use client'

import { JanuaProvider } from './providers/janua-provider'
import { FeatureFlagProvider } from '@janua/feature-flags'
import { useAuth } from './providers/janua-provider'

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
          internal: user?.email?.endsWith('@janua.dev') || false,
        },
      }}
    >
      {children}
    </FeatureFlagProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JanuaProvider>
      <FeatureFlagWrapper>{children}</FeatureFlagWrapper>
    </JanuaProvider>
  )
}