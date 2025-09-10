# @plinto/sdk-js

> **Vanilla JavaScript SDK** for Plinto authentication - no framework dependencies

**Version:** 0.1.0 · **Support:** Browser & Node.js · **Status:** Production Ready

## 📋 Overview

@plinto/sdk-js is a lightweight, framework-agnostic JavaScript SDK for Plinto authentication. Perfect for vanilla JavaScript applications, legacy systems, or as a foundation for framework-specific implementations. Zero dependencies, full TypeScript support, and tree-shakeable.

## 🚀 Quick Start

### Installation

#### NPM/Yarn

```bash
# npm
npm install @plinto/sdk-js

# yarn
yarn add @plinto/sdk-js

# pnpm
pnpm add @plinto/sdk-js
```

#### CDN

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/npm/@plinto/sdk-js/dist/plinto.min.js"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/@plinto/sdk-js@0.1.0/dist/plinto.min.js"></script>
```

### Basic Usage

#### ES Modules

```javascript
import Plinto from '@plinto/sdk-js';

const plinto = new Plinto({
  appId: 'your-app-id',
  publicKey: 'your-public-key'
});

// Sign in
const { user, tokens } = await plinto.auth.signIn({
  email: 'user@example.com',
  password: 'secure-password'
});

// Get current user
const currentUser = await plinto.auth.getCurrentUser();
```

#### CommonJS

```javascript
const Plinto = require('@plinto/sdk-js');

const plinto = new Plinto({
  appId: 'your-app-id',
  publicKey: 'your-public-key'
});
```

#### Browser Global

```html
<script>
  const plinto = new window.Plinto({
    appId: 'your-app-id',
    publicKey: 'your-public-key'
  });
  
  plinto.auth.signIn({
    email: 'user@example.com',
    password: 'password'
  }).then(result => {
    console.log('Signed in:', result.user);
  });
</script>
```

## 🏗️ Architecture

### Package Structure

```
packages/sdk-js/
├── src/
│   ├── core/              # Core SDK functionality
│   │   ├── client.js     # Main client class
│   │   ├── http.js       # HTTP client
│   │   ├── events.js     # Event emitter
│   │   └── storage.js    # Token storage
│   ├── modules/          # Feature modules
│   │   ├── auth.js       # Authentication
│   │   ├── users.js      # User management
│   │   ├── sessions.js   # Session handling
│   │   ├── passkeys.js   # WebAuthn support
│   │   └── mfa.js        # Multi-factor auth
│   ├── utils/           # Utilities
│   │   ├── crypto.js    # Cryptographic utils
│   │   ├── validation.js # Input validation
│   │   └── polyfills.js # Browser polyfills
│   ├── browser/         # Browser-specific
│   │   ├── cookies.js   # Cookie management
│   │   └── webauthn.js  # WebAuthn API
│   ├── node/           # Node.js-specific
│   │   └── crypto.js   # Node crypto
│   └── index.js       # Main export
├── dist/             # Built files
│   ├── plinto.js    # UMD bundle
│   ├── plinto.min.js # Minified UMD
│   ├── plinto.esm.js # ES modules
│   └── plinto.cjs.js # CommonJS
├── types/           # TypeScript definitions
└── package.json    # Package config
```

### Build Targets

```javascript
// Multiple build outputs for different environments
{
  "main": "dist/plinto.cjs.js",      // CommonJS for Node.js
  "module": "dist/plinto.esm.js",    // ES modules
  "browser": "dist/plinto.min.js",   // Browser UMD
  "unpkg": "dist/plinto.min.js",     // CDN
  "types": "types/index.d.ts"        // TypeScript
}
```

## 🔐 Authentication

### Email/Password

```javascript
// Sign up
const { user } = await plinto.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  name: 'John Doe',
  metadata: {
    referralSource: 'google'
  }
});

// Sign in
const { user, tokens } = await plinto.auth.signIn({
  email: 'user@example.com',
  password: 'secure-password',
  rememberMe: true
});

// Sign out
await plinto.auth.signOut();
```

### Social Authentication

```javascript
// OAuth with popup
await plinto.auth.signInWithPopup({
  provider: 'google',
  scopes: ['email', 'profile']
});

// OAuth with redirect
await plinto.auth.signInWithRedirect({
  provider: 'github',
  redirectUrl: window.location.origin + '/auth/callback'
});

// Handle OAuth callback
const result = await plinto.auth.handleRedirectCallback();
console.log('User:', result.user);
```

### Passkeys/WebAuthn

```javascript
// Check browser support
if (plinto.passkeys.isSupported()) {
  // Register passkey
  const credential = await plinto.passkeys.register({
    displayName: 'My Laptop',
    requireResidentKey: true
  });
  
  // Sign in with passkey
  const { user } = await plinto.passkeys.signIn();
}
```

### Multi-Factor Authentication

```javascript
// Enable TOTP
const { secret, qrCode } = await plinto.mfa.enableTOTP();

// Display QR code
document.getElementById('qr').src = qrCode;

// Verify TOTP code
await plinto.mfa.verifyTOTP('123456');

// Generate backup codes
const { codes } = await plinto.mfa.generateBackupCodes();
```

## 👤 User Management

### Profile Management

```javascript
// Get current user
const user = await plinto.users.getCurrent();

// Update profile
await plinto.users.update({
  name: 'Jane Doe',
  avatar: 'https://example.com/avatar.jpg',
  metadata: {
    theme: 'dark'
  }
});

// Upload avatar
const file = document.getElementById('avatar').files[0];
const avatarUrl = await plinto.users.uploadAvatar(file);

// Delete account
await plinto.users.deleteAccount({
  confirmation: 'DELETE'
});
```

### Email Verification

```javascript
// Send verification email
await plinto.users.sendVerificationEmail();

// Verify email with token from URL
const token = new URLSearchParams(window.location.search).get('token');
await plinto.users.verifyEmail(token);
```

## 🔄 Session Management

### Session Handling

```javascript
// Get current session
const session = await plinto.sessions.getCurrent();

// List all sessions
const sessions = await plinto.sessions.list();

// Revoke session
await plinto.sessions.revoke(sessionId);

// Revoke all other sessions
await plinto.sessions.revokeOthers();
```

### Token Management

```javascript
// Manual token refresh
const { accessToken } = await plinto.sessions.refreshToken();

// Auto-refresh setup
plinto.sessions.enableAutoRefresh({
  buffer: 300 // Refresh 5 minutes before expiry
});

// Token events
plinto.on('token:refreshed', (tokens) => {
  console.log('New tokens:', tokens);
});

plinto.on('token:expired', () => {
  window.location.href = '/login';
});
```

## 🌐 Browser Features

### Cookie Management

```javascript
// Configure cookies
plinto.configure({
  cookies: {
    secure: true,
    sameSite: 'strict',
    domain: '.example.com',
    path: '/',
    expires: 7 // days
  }
});
```

### Local Storage

```javascript
// Use localStorage instead of cookies
plinto.configure({
  storage: 'local', // or 'session' for sessionStorage
  storageKey: 'plinto_auth'
});

// Custom storage adapter
plinto.configure({
  storage: {
    getItem: (key) => customStorage.get(key),
    setItem: (key, value) => customStorage.set(key, value),
    removeItem: (key) => customStorage.remove(key)
  }
});
```

### Cross-Domain Communication

```javascript
// Parent window
const plinto = new Plinto({ appId: 'your-app-id' });
plinto.enableCrossOrigin({
  trustedOrigins: ['https://app.example.com']
});

// Child iframe
plinto.auth.requestParentAuth();
```

## 🖥️ Node.js Support

### Server-Side Usage

```javascript
const Plinto = require('@plinto/sdk-js/node');

const plinto = new Plinto({
  appId: 'your-app-id',
  secretKey: process.env.PLINTO_SECRET_KEY // Server-side only
});

// Verify user token
async function authenticateRequest(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  try {
    const user = await plinto.auth.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```

### Webhook Verification

```javascript
// Express webhook handler
app.post('/webhooks/plinto', (req, res) => {
  const signature = req.headers['x-plinto-signature'];
  
  try {
    const event = plinto.webhooks.verify({
      payload: req.body,
      signature,
      secret: process.env.PLINTO_WEBHOOK_SECRET
    });
    
    // Handle event
    switch (event.type) {
      case 'user.created':
        handleUserCreated(event.data);
        break;
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

## 📡 Events

### Event Subscription

```javascript
// Subscribe to events
plinto.on('auth:success', (user) => {
  console.log('User signed in:', user);
});

plinto.on('auth:signout', () => {
  console.log('User signed out');
});

plinto.on('session:expired', () => {
  console.log('Session expired');
});

// Unsubscribe
const handler = (user) => console.log(user);
plinto.on('auth:success', handler);
plinto.off('auth:success', handler);
```

### Available Events

```javascript
// Authentication events
'auth:success'        // Successful sign in
'auth:signout'       // User signed out
'auth:error'         // Authentication error

// Session events
'session:created'    // New session created
'session:expired'    // Session expired
'session:refreshed'  // Session refreshed

// Token events
'token:refreshed'    // Access token refreshed
'token:expired'      // Token expired

// User events
'user:updated'       // User profile updated
'user:deleted'       // User account deleted
```

## 🔧 Configuration

### Initialization Options

```javascript
const plinto = new Plinto({
  // Required
  appId: 'your-app-id',
  
  // Optional
  publicKey: 'your-public-key',
  apiUrl: 'https://api.plinto.dev',
  apiVersion: 'v1',
  
  // Timeouts
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000,
  
  // Storage
  storage: 'local', // 'local', 'session', 'cookie', or custom
  storageKey: 'plinto_auth',
  
  // Features
  autoRefreshTokens: true,
  persistSession: true,
  
  // Callbacks
  onAuthChange: (user) => console.log('Auth changed:', user),
  onError: (error) => console.error('SDK Error:', error)
});
```

### Runtime Configuration

```javascript
// Update configuration
plinto.configure({
  timeout: 60000,
  debug: true
});

// Enable debug mode
plinto.debug(true);

// Get current configuration
const config = plinto.getConfig();
```

## 🧪 Testing

### Unit Testing

```javascript
// Mock for testing
import { MockPlinto } from '@plinto/sdk-js/testing';

const mockPlinto = new MockPlinto({
  users: [
    { id: '1', email: 'test@example.com' }
  ]
});

// Test authentication
const result = await mockPlinto.auth.signIn({
  email: 'test@example.com',
  password: 'password'
});

expect(result.user.email).toBe('test@example.com');
```

### Browser Testing

```javascript
// Playwright/Puppeteer testing
await page.evaluate(() => {
  window.plinto = new Plinto({
    appId: 'test-app',
    apiUrl: 'http://localhost:8000'
  });
});

await page.evaluate(async () => {
  await window.plinto.auth.signIn({
    email: 'test@example.com',
    password: 'password'
  });
});
```

## 📦 Bundle Size

### Size Analysis

| Build | Size | Gzipped |
|-------|------|---------|
| Full (UMD) | 45KB | 12KB |
| ESM | 42KB | 11KB |
| Core only | 25KB | 7KB |

### Tree Shaking

```javascript
// Import only what you need
import { signIn, signOut } from '@plinto/sdk-js/auth';
import { getCurrentUser } from '@plinto/sdk-js/users';

// Instead of
import Plinto from '@plinto/sdk-js'; // Imports everything
```

## 🌍 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 60+ |
| Firefox | 55+ |
| Safari | 12+ |
| Edge | 79+ |
| Opera | 47+ |
| IE | Not supported |

### Polyfills

```javascript
// Include polyfills for older browsers
import '@plinto/sdk-js/polyfills';

// Or load from CDN
<script src="https://polyfill.io/v3/polyfill.min.js?features=Promise,fetch"></script>
```

## 🛠️ Development

### Local Development

```bash
# Clone the repo
git clone https://github.com/plinto/plinto.git

# Navigate to SDK-JS package
cd packages/sdk-js

# Install dependencies
yarn install

# Development with watch mode
yarn dev

# Run tests
yarn test

# Build all formats
yarn build

# Size analysis
yarn size
```

### Build Scripts

```json
{
  "scripts": {
    "build": "rollup -c",
    "build:umd": "rollup -c --format umd",
    "build:esm": "rollup -c --format esm",
    "build:cjs": "rollup -c --format cjs",
    "dev": "rollup -c -w",
    "test": "jest",
    "size": "size-limit"
  }
}
```

## 📚 Resources

- [API Documentation](https://docs.plinto.dev/sdk-js)
- [Migration Guide](https://docs.plinto.dev/sdk-js/migration)
- [Examples](https://github.com/plinto/sdk-js-examples)
- [CDN Usage](https://docs.plinto.dev/sdk-js/cdn)

## 🎯 Roadmap

### Current Version (0.1.0)
- ✅ Core authentication
- ✅ Session management
- ✅ WebAuthn support
- ✅ Node.js support

### Next Release (0.2.0)
- [ ] WebSocket support
- [ ] Offline mode
- [ ] Service Worker integration
- [ ] React Native support

## 🤝 Contributing

See [SDK-JS Contributing Guide](../../docs/contributing/sdk-js.md) for development guidelines.

## 📄 License

Part of the Plinto platform. See [LICENSE](../../LICENSE) in the root directory.