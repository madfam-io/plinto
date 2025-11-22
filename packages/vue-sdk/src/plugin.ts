import { App, reactive, readonly } from 'vue';
import { JanuaClient } from '@janua/typescript-sdk';
import type { User, Session, JanuaConfig } from '@janua/typescript-sdk';

export interface JanuaState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface JanuaPluginOptions extends JanuaConfig {
  onAuthChange?: (user: User | null) => void;
}

const JANUA_KEY = Symbol('janua');

class JanuaVue {
  private client: JanuaClient;
  private state: JanuaState;
  private onAuthChange?: (user: User | null) => void;

  constructor(options: JanuaPluginOptions) {
    const { onAuthChange, ...config } = options;
    
    this.client = new JanuaClient(config);
    this.onAuthChange = onAuthChange;
    
    this.state = reactive({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
    });

    this.initialize();
  }

  private async initialize() {
    try {
      // Check for OAuth callback parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('code') && urlParams.has('state')) {
        const code = urlParams.get('code')!;
        const state = urlParams.get('state')!;
        await this.client.auth.handleOAuthCallback(code, state);
      }

      await this.updateAuthState();
    } catch (error) {
      // Error handled silently in production
    } finally {
      this.state.isLoading = false;
    }

    // Set up periodic auth state check
    setInterval(async () => {
      const currentUser = await this.client.getCurrentUser();
      if (currentUser !== this.state.user) {
        await this.updateAuthState();
      }
    }, 1000);
  }

  private async updateAuthState() {
    const user = await this.client.getCurrentUser();
    const session = user ? {
      accessToken: await this.client.getAccessToken(),
      refreshToken: await this.client.getRefreshToken()
    } as any : null;
    
    this.state.user = user;
    this.state.session = session;
    this.state.isAuthenticated = !!user && !!session;

    if (this.onAuthChange) {
      this.onAuthChange(user);
    }
  }

  async signIn(email: string, password: string) {
    const response = await this.client.auth.signIn({ email, password });
    this.updateAuthState();
    return response;
  }

  async signUp(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) {
    const response = await this.client.auth.signUp(data);
    this.updateAuthState();
    return response;
  }

  async signOut() {
    await this.client.signOut();
    this.state.user = null;
    this.state.session = null;
    this.state.isAuthenticated = false;

    if (this.onAuthChange) {
      this.onAuthChange(null);
    }
  }

  async updateSession() {
    // Refresh the current user and update auth state
    await this.client.auth.getCurrentUser();
    this.updateAuthState();
  }

  getClient() {
    return this.client;
  }

  getState() {
    return readonly(this.state);
  }

  getUser() {
    return this.state.user;
  }

  getSession() {
    return this.state.session;
  }

  isAuthenticated() {
    return this.state.isAuthenticated;
  }
}

export const createJanua = (options: JanuaPluginOptions) => {
  return {
    install(app: App) {
      const janua = new JanuaVue(options);
      app.provide(JANUA_KEY, janua);
      app.config.globalProperties.$janua = janua;
    },
  };
};

export { JANUA_KEY };
export type { JanuaVue };