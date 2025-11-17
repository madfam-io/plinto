import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { FeatureFlagProvider } from '@plinto/feature-flags'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Plinto Dashboard',
  description: 'Manage your authentication and identity settings',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FeatureFlagProvider
            context={{
              attributes: { app: 'dashboard', internal: true },
            }}
          >
            {children}
          </FeatureFlagProvider>
        </AuthProvider>
      </body>
    </html>
  )
}