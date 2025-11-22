// Re-export everything from @janua/typescript-sdk
export * from '@janua/typescript-sdk';
export { JanuaClient } from '@janua/typescript-sdk';

// Export middleware utilities
export { createJanuaMiddleware, withAuth, config } from './middleware';
export type { JanuaMiddlewareConfig } from './middleware';

// Export App Router utilities (most common)
export {
  JanuaProvider,
  useJanua,
  useAuth,
  useUser,
  useOrganizations,
  SignInForm,
  SignUpForm,
  UserButton,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  Protect,
  JanuaServerClient,
  getSession,
  requireAuth,
  validateRequest,
} from './app';

export type {
  JanuaProviderProps,
  SignInFormProps,
  SignUpFormProps,
  UserButtonProps,
  SignedInProps,
  SignedOutProps,
  RedirectToSignInProps,
  ProtectProps,
} from './app';