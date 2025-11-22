import React, { createContext, useContext, useState, useEffect } from 'react'
import { JanuaClient, type JanuaConfig, type User, type Session } from '@janua/typescript-sdk'

interface JanuaContextValue {
  client: JanuaClient
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const JanuaContext = createContext<JanuaContextValue | undefined>(undefined)

export interface JanuaProviderProps {
  children: React.ReactNode
  config: JanuaConfig
}

export function JanuaProvider({ children, config }: JanuaProviderProps) {
  const [client] = useState(() => new JanuaClient(config))
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('janua_access_token')
        if (token) {
          const currentUser = await client.getCurrentUser()
          if (currentUser) {
            setUser(currentUser)
            // Session management will be handled by the client internally
            // setSession(currentSession) // We'll handle this when session API is ready
          }
        }
      } catch (error) {
        // Error handled silently in production
        localStorage.removeItem('janua_access_token')
        localStorage.removeItem('janua_refresh_token')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [client])

  const signIn = async (email: string, password: string) => {
    const response = await client.signIn({ email, password })

    if (response.tokens.access_token) {
      localStorage.setItem('janua_access_token', response.tokens.access_token)
    }
    if (response.tokens.refresh_token) {
      localStorage.setItem('janua_refresh_token', response.tokens.refresh_token)
    }

    const currentUser = await client.getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
  }

  const signOut = async () => {
    await client.signOut()
    setSession(null)
    setUser(null)
    localStorage.removeItem('janua_access_token')
    localStorage.removeItem('janua_refresh_token')
  }

  const value: JanuaContextValue = {
    client,
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signOut,
  }

  return <JanuaContext.Provider value={value}>{children}</JanuaContext.Provider>
}

export function useJanua() {
  const context = useContext(JanuaContext)
  if (!context) {
    throw new Error('useJanua must be used within a JanuaProvider')
  }
  return context
}