import { useJanua } from '../provider'

export function useAuth() {
  const { user, session, isLoading, isAuthenticated, signIn, signOut } = useJanua()
  
  return {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn,
    signOut,
  }
}