import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { DocsLayout } from '@/components/layout/DocsLayout';
import '@/styles/globals.css';
import '@/styles/tokens.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Janua Documentation',
  description: 'Complete documentation for the Janua identity platform',
  openGraph: {
    title: 'Janua Documentation',
    description: 'Complete documentation for the Janua identity platform',
    type: 'website',
    url: 'https://docs.janua.dev',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Janua Documentation',
    description: 'Complete documentation for the Janua identity platform',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <DocsLayout>{children}</DocsLayout>
        </Providers>
      </body>
    </html>
  );
}