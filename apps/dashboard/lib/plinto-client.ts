/**
 * Plinto SDK Client Configuration for Dashboard
 *
 * Replaces custom auth implementation with official @plinto/typescript-sdk
 */

import { PlintoClient } from '@plinto/typescript-sdk'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1'

export const plintoClient = new PlintoClient({
  apiUrl,
  apiBasePath,
  debug: process.env.NODE_ENV === 'development',
  tokenStorage: {
    type: 'localStorage' as const,
    key: 'plinto_auth_token',
  },
  session: {
    autoRefresh: true,
    refreshThreshold: 300, // Refresh 5 minutes before expiration
  },
  credentials: 'include',
})

// Export modules for convenience
export const auth = plintoClient.auth
export const users = plintoClient.users
export const sessions = plintoClient.sessions
export const organizations = plintoClient.organizations

export default plintoClient
