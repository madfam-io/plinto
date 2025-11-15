import { useState } from 'react'
import { usePlinto } from '../provider'
import type { TokenResponse, Session } from '@plinto/typescript-sdk'

export function useSession() {
  const { client, session } = usePlinto()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshTokens = async (): Promise<TokenResponse | null> => {
    const refreshToken = localStorage.getItem('plinto_refresh_token')
    if (!refreshToken) {
      return null
    }

    setIsRefreshing(true)
    try {
      const tokens = await client.auth.refreshToken({ refresh_token: refreshToken })

      localStorage.setItem('plinto_access_token', tokens.access_token)
      if (tokens.refresh_token) {
        localStorage.setItem('plinto_refresh_token', tokens.refresh_token)
      }

      return tokens
    } catch (error) {
      // Token refresh failed, removing invalid tokens
      localStorage.removeItem('plinto_access_token')
      localStorage.removeItem('plinto_refresh_token')
      return null
    } finally {
      setIsRefreshing(false)
    }
  }

  const getCurrentSession = async (): Promise<Session | null> => {
    try {
      const currentSession = await client.sessions.getCurrentSession()
      return currentSession
    } catch (error) {
      // Session retrieval failed
      return null
    }
  }

  return {
    session,
    isRefreshing,
    refreshTokens,
    getCurrentSession,
  }
}