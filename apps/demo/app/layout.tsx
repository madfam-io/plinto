import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { DemoBanner } from '@/components/demo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Janua Auth - Secure Identity Platform',
  description: 'Sign in to your Janua account',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <DemoBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}