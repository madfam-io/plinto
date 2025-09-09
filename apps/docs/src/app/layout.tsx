import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import '@/styles/globals.css'
import '@/styles/prism.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Plinto Docs',
    default: 'Plinto Docs - Identity Platform Documentation',
  },
  description: 'Complete documentation for Plinto identity platform. Learn how to implement secure authentication with passkeys, manage sessions, and build identity features.',
  keywords: ['plinto', 'authentication', 'identity', 'passkeys', 'webauthn', 'documentation'],
  authors: [{ name: 'Plinto Team' }],
  openGraph: {
    title: 'Plinto Documentation',
    description: 'Complete documentation for Plinto identity platform',
    url: 'https://docs.plinto.dev',
    siteName: 'Plinto Docs',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plinto Documentation',
    description: 'Complete documentation for Plinto identity platform',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}