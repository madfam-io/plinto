/**
 * Janua SDK Client Configuration for Dashboard
 *
 * Replaces custom auth implementation with official @janua/typescript-sdk
 */

import { JanuaClient } from '@janua/typescript-sdk'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1'

export const januaClient = new JanuaClient({
  apiUrl,
  apiBasePath,
  debug: process.env.NODE_ENV === 'development',
  tokenStorage: {
    type: 'localStorage' as const,
    key: 'janua_auth_token',
  },
  session: {
    autoRefresh: true,
    refreshThreshold: 300, // Refresh 5 minutes before expiration
  },
  credentials: 'include',
})

// Export modules for convenience
export const auth = januaClient.auth
export const users = januaClient.users
export const sessions = januaClient.sessions
export const organizations = januaClient.organizations

export default januaClient
