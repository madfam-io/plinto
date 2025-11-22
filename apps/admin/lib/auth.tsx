'use client'

/**
 * Admin Authentication Provider with RBAC
 *
 * Requires @janua.dev email and superadmin/admin role
 */

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { januaClient } from './janua-client'
import type { User } from '@janua/typescript-sdk'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAuthorized: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ALLOWED_ROLES = ['superadmin', 'admin']
const REQUIRED_EMAIL_DOMAIN = '@janua.dev'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthorized = useCallback(() => {
    if (!user) return false
    const hasAllowedRole = user.roles?.some((role: string) => ALLOWED_ROLES.includes(role)) || false
    const hasAllowedEmail = user.email?.endsWith(REQUIRED_EMAIL_DOMAIN) || false
    return hasAllowedRole && hasAllowedEmail
  }, [user])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await januaClient.auth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      await refreshUser()
      setIsLoading(false)
    }

    initAuth()

    const handleSignIn = ({ user: userData }: { user: User }) => setUser(userData)
    const handleSignOut = () => setUser(null)
    const handleTokenRefresh = () => refreshUser()

    januaClient.on('signIn', handleSignIn)
    januaClient.on('signOut', handleSignOut)
    januaClient.on('tokenRefreshed', handleTokenRefresh)

    return () => {
      januaClient.off('signIn', handleSignIn)
      januaClient.off('signOut', handleSignOut)
      januaClient.off('tokenRefreshed', handleTokenRefresh)
    }
  }, [refreshUser])

  const login = async (email: string, password: string) => {
    const response = await januaClient.auth.signIn({ email, password })
    setUser(response.user)
  }

  const logout = async () => {
    await januaClient.auth.signOut()
    setUser(null)
    window.location.href = '/login'
  }

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthorized: isAuthorized(),
        isLoading,
        login,
        logout,
        refreshUser,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
