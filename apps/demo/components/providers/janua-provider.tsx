'use client'

/**
 * Janua SDK Provider
 *
 * This component wraps the Next.js app and provides the Janua SDK client
 * to all child components via React Context. It also handles authentication
 * state management and automatic token refresh.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { januaClient } from '@/lib/janua-client'
import type { JanuaClient, User } from '@janua/typescript-sdk'

interface JanuaContextValue {
  client: JanuaClient
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshUser: () => Promise<void>
}

const JanuaContext = createContext<JanuaContextValue | undefined>(undefined)

export function JanuaProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await januaClient.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    // Initialize authentication state
    const initAuth = async () => {
      setIsLoading(true)
      await refreshUser()
      setIsLoading(false)
    }

    initAuth()

    // Set up event listeners for auth state changes
    const handleSignIn = ({ user: userData }: { user: User }) => {
      setUser(userData)
    }

    const handleSignOut = () => {
      setUser(null)
    }

    const handleTokenRefresh = () => {
      refreshUser()
    }

    januaClient.on('signIn', handleSignIn)
    januaClient.on('signOut', handleSignOut)
    januaClient.on('tokenRefreshed', handleTokenRefresh)

    return () => {
      januaClient.off('signIn', handleSignIn)
      januaClient.off('signOut', handleSignOut)
      januaClient.off('tokenRefreshed', handleTokenRefresh)
    }
  }, [refreshUser])

  const value: JanuaContextValue = {
    client: januaClient,
    user,
    isAuthenticated: !!user,
    isLoading,
    refreshUser,
  }

  return <JanuaContext.Provider value={value}>{children}</JanuaContext.Provider>
}

// Custom hook to use Janua SDK
export function useJanua() {
  const context = useContext(JanuaContext)
  if (context === undefined) {
    throw new Error('useJanua must be used within a JanuaProvider')
  }
  return context
}

// Export auth-specific hook for convenience
export function useAuth() {
  const { user, isAuthenticated, isLoading, refreshUser } = useJanua()
  return { user, isAuthenticated, isLoading, refreshUser }
}
