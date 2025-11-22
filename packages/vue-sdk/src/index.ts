// Re-export everything from @janua/typescript-sdk
export * from '@janua/typescript-sdk';

// Plugin
export { createJanua, JANUA_KEY } from './plugin';
export type { JanuaState, JanuaPluginOptions, JanuaVue } from './plugin';

// Composables
export {
  useJanua,
  useAuth,
  useUser,
  useSession,
  useOrganizations,
  useSignIn,
  useSignUp,
  useSignOut,
  useMagicLink,
  useOAuth,
  usePasskeys,
  useMFA,
} from './composables';