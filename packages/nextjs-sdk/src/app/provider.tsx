'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { JanuaClient } from '@janua/typescript-sdk';
import type { User, Session, JanuaConfig } from '@janua/typescript-sdk';

interface JanuaContextValue {
  client: JanuaClient;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  updateUser: () => Promise<void>;
}

const JanuaContext = createContext<JanuaContextValue | undefined>(undefined);

export interface JanuaProviderProps {
  children: React.ReactNode;
  config: JanuaConfig;
  onAuthChange?: (user: User | null) => void;
}

export function JanuaProvider({ 
  children, 
  config,
  onAuthChange 
}: JanuaProviderProps) {
  const [client] = useState(() => new JanuaClient(config));
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateAuthState = useCallback(async () => {
    const currentUser = await client.auth.getCurrentUser();
    const currentSession = {
      accessToken: await client.getAccessToken(),
      refreshToken: await client.getRefreshToken()
    };

    setUser(currentUser);
    setSession(currentSession as any);

    if (onAuthChange) {
      onAuthChange(currentUser);
    }
  }, [client, onAuthChange]);

  const updateUser = useCallback(async () => {
    try {
      await client.auth.getCurrentUser();
      updateAuthState();
    } catch (error) {
      // Error handled silently in production
    }
  }, [client, updateAuthState]);

  const signOut = useCallback(async () => {
    try {
      await client.auth.signOut();
      setUser(null);
      setSession(null);

      if (onAuthChange) {
        onAuthChange(null);
      }
    } catch (error) {
      // Error handled silently in production
    }
  }, [client, onAuthChange]);

  useEffect(() => {
    // Check for auth params in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') && urlParams.has('state')) {
      const code = urlParams.get('code')!;
      const state = urlParams.get('state')!;
      client.auth.handleOAuthCallback(code, state)
        .then(() => updateAuthState())
        .catch(() => {
          // Error handled silently in production
        })
        .finally(() => setIsLoading(false));
    } else {
      // Load initial auth state
      updateAuthState();
      setIsLoading(false);
    }

    // Set up auth state listener
    const checkInterval = setInterval(async () => {
      const currentUser = await client.auth.getCurrentUser();
      if (currentUser !== user) {
        updateAuthState();
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [client, updateAuthState, user]);

  const value: JanuaContextValue = {
    client,
    user,
    session,
    isLoading,
    isAuthenticated: !!user && !!session,
    signOut,
    updateUser,
  };

  return (
    <JanuaContext.Provider value={value}>
      {children}
    </JanuaContext.Provider>
  );
}

export function useJanua(): JanuaContextValue {
  const context = useContext(JanuaContext);
  if (!context) {
    throw new Error('useJanua must be used within a JanuaProvider');
  }
  return context;
}

export function useAuth() {
  const { client, user, session, isAuthenticated, isLoading, signOut } = useJanua();
  return {
    auth: client.auth,
    user,
    session,
    isAuthenticated,
    isLoading,
    signOut,
  };
}

export function useUser() {
  const { user, isLoading, updateUser } = useJanua();
  return {
    user,
    isLoading,
    updateUser,
  };
}

export function useOrganizations() {
  const { client } = useJanua();
  return client.organizations;
}