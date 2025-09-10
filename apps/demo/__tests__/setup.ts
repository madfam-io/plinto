// Test setup for demo app
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock environment
process.env.NEXT_PUBLIC_PLINTO_ENV = 'test'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000'
