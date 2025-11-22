# Janua Demo

> **Live demonstration application** showcasing Janua authentication integration

**Status:** Feature Complete · **Domain:** `demo.janua.dev` · **Port:** 3002

## 📋 Overview

The Janua Demo application provides a fully functional demonstration of Janua's authentication and identity management capabilities. It serves as both a live demo for potential customers and a reference implementation for developers.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn workspace management
- Janua API access (local or remote)

### Installation

```bash
# From monorepo root
yarn install

# Navigate to demo app
cd apps/demo

# Start development server
yarn dev
```

Demo app will be available at [http://localhost:3002](http://localhost:3002)

### Environment Setup

Create a `.env.local` file:

```env
# Environment Mode
NEXT_PUBLIC_DEMO_MODE=development  # development | staging | production

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SDK_URL=http://localhost:3002

# Janua SDK Configuration
NEXT_PUBLIC_JANUA_APP_ID=demo-app
NEXT_PUBLIC_JANUA_PUBLIC_KEY=your-public-key

# Demo Features
NEXT_PUBLIC_ENABLE_PASSKEYS=true
NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN=true
NEXT_PUBLIC_ENABLE_MFA=true
NEXT_PUBLIC_ENABLE_MOCK_DATA=true

# Analytics (Optional)
NEXT_PUBLIC_ANALYTICS_KEY=your-analytics-key
```

## 🏗️ Architecture

### Project Structure

```
apps/demo/
├── app/                    # Next.js 14 App Router
│   ├── page.tsx           # Landing/demo selector
│   ├── auth/              # Authentication demos
│   │   ├── login/         # Login flow demo
│   │   ├── signup/        # Registration demo
│   │   ├── passkey/       # Passkey demo
│   │   ├── mfa/           # MFA setup demo
│   │   └── social/        # Social login demo
│   ├── dashboard/         # Post-auth experience
│   │   ├── profile/       # User profile demo
│   │   ├── sessions/      # Session management
│   │   ├── security/      # Security settings
│   │   └── api-keys/      # API key management
│   ├── flows/             # Complete user flows
│   │   ├── onboarding/    # Onboarding flow
│   │   ├── recovery/      # Account recovery
│   │   └── migration/     # User migration demo
│   ├── api/              # API routes
│   └── layout.tsx        # Root layout
├── components/           # React components
│   ├── demo/            # Demo-specific components
│   ├── auth/            # Auth components
│   ├── code-viewer/     # Code examples
│   └── playground/      # Interactive playground
├── lib/                 # Utilities
│   ├── demo-data/      # Mock data generators
│   ├── scenarios/      # Demo scenarios
│   └── sdk-wrapper/    # SDK integration
├── public/             # Static assets
│   └── demo-assets/    # Demo images/videos
└── styles/            # Styles
```

### Demo Architecture

```
┌─────────────────────────────────────┐
│         Demo Application            │
├─────────────────────────────────────┤
│  1. Feature Showcase                │
│  2. Interactive Playground          │
│  3. Code Examples                   │
│  4. SDK Integration Demo            │
│  5. Environment Switching           │
└─────────────────────────────────────┘
```

## 🎭 Demo Features

### Authentication Showcases

#### 📧 Email/Password Authentication
- Registration with validation
- Email verification flow
- Password strength meter
- Login with remember me
- Password reset flow

#### 🔑 Passkey/WebAuthn Demo
```tsx
// Demonstrate passkey registration
<PasskeyDemo>
  <RegisterPasskey />
  <AuthenticateWithPasskey />
  <ManagePasskeys />
</PasskeyDemo>
```

#### 🌐 Social Authentication
- Google OAuth
- GitHub OAuth
- Microsoft OAuth
- Account linking
- Social profile import

#### 🔐 Multi-Factor Authentication
- TOTP setup (Google Authenticator)
- SMS verification
- Backup codes
- Recovery flows

### Interactive Features

#### 🎮 Live Playground
```tsx
// Interactive SDK playground
<SDKPlayground>
  <CodeEditor />
  <LivePreview />
  <ConsoleOutput />
</SDKPlayground>
```

#### 📊 Analytics Dashboard
- Login attempts visualization
- Session analytics
- Security events
- User journey tracking

#### 🔄 Environment Switcher
```tsx
// Switch between different configurations
<EnvironmentSwitcher>
  <option value="local">Local Development</option>
  <option value="staging">Staging Environment</option>
  <option value="production">Production</option>
</EnvironmentSwitcher>
```

## 🎯 Demo Scenarios

### Pre-configured User Journeys

#### New User Onboarding
```tsx
const onboardingFlow = [
  'landing',
  'signup',
  'email-verification',
  'profile-setup',
  'dashboard'
];
```

#### Returning User Flow
```tsx
const returningUserFlow = [
  'login',
  'mfa-challenge',
  'dashboard',
  'profile-update'
];
```

#### Security Enhancement Flow
```tsx
const securityFlow = [
  'login',
  'security-prompt',
  'passkey-setup',
  'mfa-enable',
  'backup-codes'
];
```

## 🧪 Testing Features

### Test Accounts

```typescript
// Pre-configured test accounts
const testAccounts = {
  basic: {
    email: 'demo@janua.dev',
    password: 'DemoPass123!'
  },
  mfa: {
    email: 'mfa@janua.dev',
    password: 'MFADemo123!',
    totpSecret: 'DEMO2FASECRET'
  },
  passkey: {
    email: 'passkey@janua.dev',
    // Passkey pre-registered
  }
};
```

### Mock Data Generation

```tsx
// lib/demo-data/generator.ts
export function generateMockUser() {
  return {
    id: faker.uuid(),
    email: faker.internet.email(),
    name: faker.name.fullName(),
    avatar: faker.image.avatar(),
    createdAt: faker.date.past()
  };
}
```

## 📱 Responsive Design

### Device Support
- Desktop (1920x1080+)
- Tablet (768x1024)
- Mobile (375x667)
- Foldable devices

### Touch Interactions
- Swipe gestures for navigation
- Touch-friendly buttons
- Mobile-optimized forms
- Native app feel

## 🎨 UI/UX Features

### Interactive Elements
- Smooth animations (Framer Motion)
- Loading states
- Error handling
- Success feedback
- Progress indicators

### Code Examples
```tsx
// Real-time code examples with syntax highlighting
<CodeViewer language="typescript">
  {`
    const janua = new JanuaClient({
      appId: 'your-app-id',
      publicKey: 'your-public-key'
    });
    
    await janua.auth.signIn({
      email: 'user@example.com',
      password: 'secure-password'
    });
  `}
</CodeViewer>
```

## 🔧 Configuration

### Feature Flags

```tsx
// lib/features.ts
export const features = {
  passkeys: process.env.NEXT_PUBLIC_ENABLE_PASSKEYS === 'true',
  socialLogin: process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === 'true',
  mfa: process.env.NEXT_PUBLIC_ENABLE_MFA === 'true',
  mockData: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true'
};
```

### Demo Modes

```typescript
type DemoMode = 'guided' | 'sandbox' | 'presentation';

// Guided: Step-by-step walkthrough
// Sandbox: Free exploration
// Presentation: Auto-play for demos
```

## 📊 Analytics

### Demo Metrics Tracking

- Feature usage statistics
- User flow completion rates
- Error occurrences
- Performance metrics
- Conversion tracking

### Feedback Collection

```tsx
<FeedbackWidget>
  <RatingScale />
  <CommentBox />
  <FeatureRequest />
</FeedbackWidget>
```

## 🧪 Testing

### Test Coverage

```bash
# Run tests
yarn test

# Coverage report
yarn test:coverage

# E2E tests
yarn test:e2e

# Visual regression
yarn test:visual
```

Current coverage: **100%** (comprehensive test suite)

## 🚢 Deployment

### Build Configuration

```bash
# Build for production
yarn build

# Environment-specific builds
yarn build:staging
yarn build:production
```

### Deployment Environments

#### Development
- URL: http://localhost:3002
- Mock data enabled
- Debug mode active

#### Staging
- URL: https://demo-staging.janua.dev
- Real API integration
- Limited test accounts

#### Production
- URL: https://demo.janua.dev
- Full features enabled
- Analytics active

## 🔒 Security

### Demo Security Measures

- Sandboxed environment
- Rate limiting on demo actions
- Automatic session cleanup
- No real user data
- Isolated from production

### Data Privacy

```tsx
// All demo data is ephemeral
const SESSION_LIFETIME = 30 * 60 * 1000; // 30 minutes
const AUTO_CLEANUP = true;
```

## 🛠️ Development

### Local Development

```bash
# Start dev server
yarn dev

# Run with mock API
yarn dev:mock

# Debug mode
yarn dev:debug
```

### Adding New Demos

1. Create demo component in `components/demo/`
2. Add route in `app/flows/`
3. Update navigation
4. Add test coverage
5. Document feature

## 📚 Resources

### Documentation
- [Janua SDK Docs](https://docs.janua.dev/sdk)
- [Authentication Guide](https://docs.janua.dev/auth)
- [API Reference](https://docs.janua.dev/api)

### Support
- [GitHub Issues](https://github.com/janua/demo/issues)
- [Discord Community](https://discord.gg/janua)
- [Support Email](mailto:support@janua.dev)

## 🎯 Roadmap

### Current Sprint
- [ ] Add biometric authentication demo
- [ ] Implement organization switching
- [ ] Add webhook integration examples

### Next Quarter
- [ ] Mobile app demo (React Native)
- [ ] Backend integration examples
- [ ] Advanced security scenarios
- [ ] Performance benchmarks

## 🤝 Contributing

See [Contributing Guide](../../CONTRIBUTING.md) for guidelines.

## 📄 License

Part of the Janua platform. See [LICENSE](../../LICENSE) in the root directory.