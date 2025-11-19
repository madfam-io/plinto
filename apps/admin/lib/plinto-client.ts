/**
 * Plinto SDK Client Configuration for Admin App
 */

import { PlintoClient } from '@plinto/typescript-sdk'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const apiBasePath = process.env.NEXT_PUBLIC_API_BASE_PATH || '/api/v1'

export const plintoClient = new PlintoClient({
  apiUrl,
  apiBasePath,
  debug: process.env.NODE_ENV === 'development',
  tokenStorage: 'localStorage',
  session: {
    autoRefresh: true,
    refreshThreshold: 300,
  },
  credentials: 'include',
})

export const auth = plintoClient.auth
export const users = plintoClient.users
export const organizations = plintoClient.organizations

export default plintoClient
