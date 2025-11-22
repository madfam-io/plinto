import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JanuaProvider } from '@janua/react-sdk';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Janua Authentication Example',
  description: 'Production-ready authentication with Janua SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JanuaProvider
          config={{
            baseURL: process.env.NEXT_PUBLIC_JANUA_API_URL || 'https://api.janua.dev',
            apiKey: process.env.NEXT_PUBLIC_JANUA_API_KEY,
            environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
          }}
        >
          {children}
        </JanuaProvider>
      </body>
    </html>
  );
}