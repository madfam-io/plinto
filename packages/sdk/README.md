# @plinto/sdk

> **Official JavaScript/TypeScript SDK** for Plinto authentication and identity management

**Version:** 0.1.0 · **Support:** Browser & Node.js · **Status:** Production Ready

## 📋 Overview

The Plinto SDK provides a simple, secure, and type-safe way to integrate Plinto authentication into your JavaScript applications. Supports both browser and Node.js environments with full TypeScript support.

## 🚀 Quick Start

### Installation

```bash
# npm
npm install @plinto/sdk

# yarn
yarn add @plinto/sdk

# pnpm
pnpm add @plinto/sdk
```

### Basic Usage

```typescript
import { PlintoClient } from '@plinto/sdk';

// Initialize the client
const plinto = new PlintoClient({
  appId: 'your-app-id',
  apiUrl: 'https://api.plinto.dev', // Optional, defaults to production
});

// Sign in a user
const { user, tokens } = await plinto.auth.signIn({
  email: 'user@example.com',
  password: 'secure-password'
});

// Get current user
const currentUser = await plinto.auth.getCurrentUser();

// Sign out
await plinto.auth.signOut();
```

## 🏗️ Architecture

### Package Structure

```
packages/sdk/
├── src/
│   ├── client/              # Main client class
│   │   ├── PlintoClient.ts # Core client
│   │   └── types.ts        # Client types
│   ├── modules/            # SDK modules
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # User management
│   │   ├── sessions/      # Session management
│   │   ├── organizations/ # Org management
│   │   └── webhooks/      # Webhook utilities
│   ├── utils/             # Utility functions
│   │   ├── http.ts       # HTTP client
│   │   ├── crypto.ts     # Crypto utilities
│   │   └── storage.ts    # Token storage
│   ├── errors/           # Custom errors
│   └── index.ts         # Main export
├── dist/                # Built files
│   ├── esm/            # ES modules
│   ├── cjs/            # CommonJS
│   └── umd/            # UMD bundle
├── tests/              # Test files
└── package.json       # Package config
```

### SDK Architecture

```
┌─────────────────────────────────────┐
│         PlintoClient                │
├─────────────────────────────────────┤
│  Modules:                           │
│  - auth: Authentication methods     │
│  - users: User management           │
│  - sessions: Session handling       │
│  - orgs: Organization management    │
│  - webhooks: Webhook verification   │
└─────────────────────────────────────┘
```

## 🔐 Authentication

### Email/Password Authentication

```typescript
// Sign up a new user
const { user } = await plinto.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'John Doe',
  metadata: {
    source: 'marketing-campaign'
  }
});

// Sign in
const { user, tokens } = await plinto.auth.signIn({
  email: 'user@example.com',
  password: 'secure-password'
});

// Sign out
await plinto.auth.signOut();
```

### Social Authentication

```typescript
// OAuth with Google
await plinto.auth.signInWithOAuth({
  provider: 'google',
  redirectUrl: 'https://app.example.com/auth/callback'
});

// OAuth with GitHub
await plinto.auth.signInWithOAuth({
  provider: 'github',
  scopes: ['user:email', 'read:user']
});

// OAuth with Microsoft
await plinto.auth.signInWithOAuth({
  provider: 'microsoft'
});
```

### Passkey/WebAuthn

```typescript
// Register a passkey
const credential = await plinto.auth.registerPasskey({
  displayName: 'My MacBook'
});

// Sign in with passkey
const { user, tokens } = await plinto.auth.signInWithPasskey();

// List user's passkeys
const passkeys = await plinto.auth.listPasskeys();

// Delete a passkey
await plinto.auth.deletePasskey(passkeyId);
```

### Multi-Factor Authentication

```typescript
// Enable TOTP (Google Authenticator)
const { secret, qrCode } = await plinto.auth.enableTOTP();

// Verify TOTP code
await plinto.auth.verifyTOTP({
  code: '123456'
});

// Enable SMS MFA
await plinto.auth.enableSMS({
  phoneNumber: '+1234567890'
});

// Verify SMS code
await plinto.auth.verifySMS({
  code: '123456'
});

// Generate backup codes
const { codes } = await plinto.auth.generateBackupCodes();
```

### Password Management

```typescript
// Request password reset
await plinto.auth.forgotPassword({
  email: 'user@example.com'
});

// Reset password with token
await plinto.auth.resetPassword({
  token: 'reset-token-from-email',
  newPassword: 'new-secure-password'
});

// Change password (authenticated)
await plinto.auth.changePassword({
  currentPassword: 'current-password',
  newPassword: 'new-password'
});
```

## 👤 User Management

### User Profile

```typescript
// Get current user
const user = await plinto.users.getCurrentUser();

// Update user profile
const updatedUser = await plinto.users.updateProfile({
  name: 'Jane Doe',
  avatar: 'https://example.com/avatar.jpg',
  metadata: {
    timezone: 'America/New_York'
  }
});

// Delete user account
await plinto.users.deleteAccount({
  confirmation: 'DELETE'
});
```

### Email Verification

```typescript
// Send verification email
await plinto.users.sendVerificationEmail();

// Verify email with token
await plinto.users.verifyEmail({
  token: 'verification-token'
});
```

## 🏢 Organizations

### Organization Management

```typescript
// Create organization
const org = await plinto.orgs.create({
  name: 'Acme Corp',
  slug: 'acme-corp',
  metadata: {
    industry: 'Technology'
  }
});

// List user's organizations
const orgs = await plinto.orgs.list();

// Switch organization context
await plinto.orgs.switchTo(orgId);

// Update organization
await plinto.orgs.update(orgId, {
  name: 'Acme Corporation',
  settings: {
    allowSignups: false
  }
});

// Delete organization
await plinto.orgs.delete(orgId);
```

### Team Management

```typescript
// Invite team member
const invitation = await plinto.orgs.inviteMember({
  email: 'colleague@example.com',
  role: 'member',
  teams: ['engineering']
});

// List organization members
const members = await plinto.orgs.listMembers(orgId);

// Update member role
await plinto.orgs.updateMember(memberId, {
  role: 'admin'
});

// Remove member
await plinto.orgs.removeMember(memberId);
```

## 🔄 Session Management

### Session Handling

```typescript
// Get current session
const session = await plinto.sessions.getCurrent();

// List all sessions
const sessions = await plinto.sessions.list();

// Revoke specific session
await plinto.sessions.revoke(sessionId);

// Revoke all other sessions
await plinto.sessions.revokeAll({
  exceptCurrent: true
});
```

### Token Management

```typescript
// Refresh access token
const { accessToken, expiresIn } = await plinto.sessions.refreshToken();

// Validate token
const isValid = await plinto.sessions.validateToken(token);

// Get token claims
const claims = plinto.sessions.getTokenClaims(token);
```

## 🔔 Webhooks

### Webhook Verification

```typescript
import { verifyWebhook } from '@plinto/sdk/webhooks';

// Express.js example
app.post('/webhooks/plinto', (req, res) => {
  const signature = req.headers['x-plinto-signature'];
  const timestamp = req.headers['x-plinto-timestamp'];
  
  try {
    const event = verifyWebhook({
      payload: req.body,
      signature,
      timestamp,
      secret: process.env.PLINTO_WEBHOOK_SECRET
    });
    
    // Handle the event
    switch (event.type) {
      case 'user.created':
        console.log('New user:', event.data);
        break;
      case 'user.deleted':
        console.log('User deleted:', event.data);
        break;
      // ... handle other events
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Invalid webhook:', error);
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

### Event Types

```typescript
type WebhookEvent = 
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.signin'
  | 'user.signout'
  | 'org.created'
  | 'org.updated'
  | 'org.deleted'
  | 'member.invited'
  | 'member.joined'
  | 'member.removed'
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.cancelled';
```

## ⚙️ Configuration

### Client Options

```typescript
const plinto = new PlintoClient({
  // Required
  appId: 'your-app-id',
  
  // Optional
  apiUrl: 'https://api.plinto.dev',
  apiVersion: 'v1',
  timeout: 30000, // 30 seconds
  retries: 3,
  
  // Storage (browser only)
  storage: localStorage, // or sessionStorage
  storageKey: 'plinto_auth',
  
  // Callbacks
  onTokenRefresh: (tokens) => {
    console.log('Tokens refreshed:', tokens);
  },
  onSignOut: () => {
    window.location.href = '/login';
  }
});
```

### Environment-Specific Configuration

```typescript
// Development
const plintoDev = new PlintoClient({
  appId: 'dev-app-id',
  apiUrl: 'http://localhost:8000',
  debug: true
});

// Staging
const plintoStaging = new PlintoClient({
  appId: 'staging-app-id',
  apiUrl: 'https://api-staging.plinto.dev'
});

// Production
const plintoProd = new PlintoClient({
  appId: 'prod-app-id',
  apiUrl: 'https://api.plinto.dev'
});
```

## 🌐 Browser Support

### Storage Options

```typescript
// Use localStorage (persistent)
const plinto = new PlintoClient({
  appId: 'your-app-id',
  storage: localStorage
});

// Use sessionStorage (session only)
const plinto = new PlintoClient({
  appId: 'your-app-id',
  storage: sessionStorage
});

// Use custom storage
const customStorage = {
  getItem: (key) => { /* ... */ },
  setItem: (key, value) => { /* ... */ },
  removeItem: (key) => { /* ... */ }
};

const plinto = new PlintoClient({
  appId: 'your-app-id',
  storage: customStorage
});
```

### Cookie Configuration

```typescript
// Configure secure cookies
const plinto = new PlintoClient({
  appId: 'your-app-id',
  cookies: {
    secure: true,
    sameSite: 'strict',
    domain: '.example.com',
    path: '/'
  }
});
```

## 🖥️ Node.js Support

### Server-Side Usage

```typescript
// Node.js environment
import { PlintoClient } from '@plinto/sdk/node';

const plinto = new PlintoClient({
  appId: 'your-app-id',
  apiKey: process.env.PLINTO_API_KEY, // Server-side API key
});

// Verify user token from request
app.use(async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const user = await plinto.auth.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
```

## 🔧 Error Handling

### Error Types

```typescript
import { 
  PlintoError,
  AuthenticationError,
  ValidationError,
  NetworkError,
  RateLimitError 
} from '@plinto/sdk/errors';

try {
  await plinto.auth.signIn({ email, password });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid credentials');
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited. Retry after:', error.retryAfter);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Retry Logic

```typescript
// Automatic retry with exponential backoff
const plinto = new PlintoClient({
  appId: 'your-app-id',
  retries: 3,
  retryDelay: 1000, // Start with 1 second
  retryBackoff: 2, // Double each time
});

// Manual retry
async function signInWithRetry(email, password, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await plinto.auth.signIn({ email, password });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```

## 📦 TypeScript Support

### Type Definitions

```typescript
// Full TypeScript support out of the box
import { User, Session, Organization, Token } from '@plinto/sdk/types';

const user: User = await plinto.auth.getCurrentUser();
const session: Session = await plinto.sessions.getCurrent();
const org: Organization = await plinto.orgs.get(orgId);
```

### Custom Types

```typescript
// Extend user metadata
interface CustomUserMetadata {
  preferredLanguage: string;
  timezone: string;
  newsletter: boolean;
}

const user = await plinto.users.updateProfile({
  metadata: {
    preferredLanguage: 'en',
    timezone: 'UTC',
    newsletter: true
  } as CustomUserMetadata
});
```

## 🧪 Testing

### Mock Client

```typescript
import { MockPlintoClient } from '@plinto/sdk/testing';

// Use in tests
const mockPlinto = new MockPlintoClient({
  users: [
    { id: '1', email: 'test@example.com', name: 'Test User' }
  ],
  sessions: [
    { id: 'session1', userId: '1', expiresAt: new Date() }
  ]
});

// Test your code
const user = await mockPlinto.auth.getCurrentUser();
expect(user.email).toBe('test@example.com');
```

## 📊 Monitoring

### Debug Mode

```typescript
// Enable debug logging
const plinto = new PlintoClient({
  appId: 'your-app-id',
  debug: true,
  logger: console // or custom logger
});
```

### Performance Metrics

```typescript
// Track SDK performance
plinto.on('request', (event) => {
  console.log('Request:', event.method, event.url);
});

plinto.on('response', (event) => {
  console.log('Response:', event.status, event.duration + 'ms');
});

plinto.on('error', (error) => {
  console.error('SDK Error:', error);
});
```

## 🎯 Roadmap

### Current Version (0.1.0)
- ✅ Email/password authentication
- ✅ Social authentication (Google, GitHub, Microsoft)
- ✅ Passkey/WebAuthn support
- ✅ Multi-factor authentication
- ✅ Organization management
- ✅ Session management
- ✅ Webhook verification

### Next Release (0.2.0)
- [ ] Real-time subscriptions
- [ ] Advanced role-based access control
- [ ] Batch operations
- [ ] Offline support
- [ ] React Native support

### Future (0.3.0+)
- [ ] GraphQL support
- [ ] End-to-end encryption
- [ ] Biometric authentication
- [ ] Advanced analytics

## 📚 Resources

- [API Documentation](https://docs.plinto.dev/api)
- [Integration Guides](https://docs.plinto.dev/guides)
- [Example Applications](https://github.com/plinto/examples)
- [Support](https://support.plinto.dev)

## 🤝 Contributing

See [SDK Contributing Guide](../../docs/contributing/sdk.md) for development guidelines.

## 📄 License

Part of the Plinto platform. See [LICENSE](../../LICENSE) in the root directory.