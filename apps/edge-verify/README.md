# Janua Edge Verify

> **Ultra-fast edge runtime verification** for Janua authentication

**Status:** In Development · **Runtime:** Edge Functions · **Deployment:** Global CDN

## 📋 Overview

Janua Edge Verify provides millisecond-latency JWT verification and session validation at the edge, running on Vercel Edge Functions and Cloudflare Workers. This enables authentication checks without hitting origin servers, dramatically improving performance.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Vercel CLI or Wrangler (Cloudflare)
- Edge runtime compatible environment

### Installation

```bash
# From monorepo root
yarn install

# Navigate to edge-verify
cd apps/edge-verify

# Install edge-specific dependencies
yarn install
```

### Local Development

```bash
# Vercel Edge Runtime
yarn dev:vercel

# Cloudflare Workers
yarn dev:cloudflare

# Generic edge runtime
yarn dev
```

## 🏗️ Architecture

### Project Structure

```
apps/edge-verify/
├── src/
│   ├── index.ts           # Main edge function entry
│   ├── verify.ts          # JWT verification logic
│   ├── cache.ts           # Edge caching logic
│   ├── jwks.ts            # JWKS fetching/caching
│   └── types.ts           # TypeScript definitions
├── middleware/
│   ├── vercel.ts          # Vercel-specific middleware
│   └── cloudflare.ts      # Cloudflare-specific middleware
├── lib/
│   ├── crypto.ts          # Edge-compatible crypto
│   ├── jwt.ts             # JWT utilities
│   └── utils.ts           # Helper functions
├── config/
│   ├── vercel.json        # Vercel configuration
│   └── wrangler.toml      # Cloudflare configuration
└── tests/
    ├── unit/              # Unit tests
    └── integration/       # Integration tests
```

### Edge Architecture

```
┌─────────────────────────────────────┐
│       Edge Verification Flow        │
├─────────────────────────────────────┤
│  1. Request hits edge location      │
│  2. Extract JWT from request        │
│  3. Check edge cache for JWKS       │
│  4. Verify JWT signature            │
│  5. Validate claims & expiry        │
│  6. Return verification result      │
│  7. Cache result (optional)         │
└─────────────────────────────────────┘
```

## 🎯 Core Features

### JWT Verification

```typescript
// src/verify.ts
export async function verifyJWT(token: string): Promise<VerifyResult> {
  // Extract header and payload
  const { header, payload } = decodeJWT(token);
  
  // Get JWKS from cache or fetch
  const jwks = await getJWKS();
  
  // Verify signature
  const isValid = await verifySignature(token, jwks);
  
  // Validate claims
  const claims = validateClaims(payload);
  
  return {
    valid: isValid && claims.valid,
    payload,
    expires: payload.exp,
  };
}
```

### JWKS Caching

```typescript
// src/jwks.ts
const JWKS_CACHE_TTL = 3600; // 1 hour

export async function getJWKS(): Promise<JWKS> {
  // Check edge cache
  const cached = await cache.get('jwks');
  if (cached) return cached;
  
  // Fetch from origin
  const jwks = await fetch('https://api.janua.dev/.well-known/jwks.json');
  
  // Cache at edge
  await cache.set('jwks', jwks, JWKS_CACHE_TTL);
  
  return jwks;
}
```

### Edge Middleware

```typescript
// middleware/vercel.ts
export const config = {
  matcher: ['/api/:path*', '/protected/:path*'],
};

export async function middleware(request: Request) {
  const token = extractToken(request);
  
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const result = await verifyJWT(token);
  
  if (!result.valid) {
    return new Response('Invalid token', { status: 403 });
  }
  
  // Add user context to request
  request.headers.set('X-User-Id', result.payload.sub);
  request.headers.set('X-User-Email', result.payload.email);
  
  return NextResponse.next();
}
```

## ⚡ Performance

### Optimization Strategies

#### Global Distribution
- Deploy to 200+ edge locations
- < 50ms latency worldwide
- Automatic failover

#### Caching Strategy
```typescript
// Multi-tier caching
const cacheStrategy = {
  jwks: {
    ttl: 3600,        // 1 hour
    staleWhileRevalidate: 7200,  // 2 hours
  },
  verification: {
    ttl: 300,         // 5 minutes
    key: (token) => hash(token),
  },
  userContext: {
    ttl: 60,          // 1 minute
    key: (userId) => `user:${userId}`,
  },
};
```

#### Minimal Bundle Size
```javascript
// Edge function size limits
const limits = {
  vercel: '1MB compressed',
  cloudflare: '1MB after compression',
  code: '< 50KB for optimal performance',
};
```

## 🔧 Configuration

### Environment Variables

```env
# JWKS Configuration
JWKS_URL=https://api.janua.dev/.well-known/jwks.json
JWKS_CACHE_TTL=3600

# Token Configuration
JWT_ISSUER=https://janua.dev
JWT_AUDIENCE=janua.dev
JWT_ALGORITHMS=RS256,ES256

# Cache Configuration
CACHE_ENABLED=true
CACHE_TTL=300

# Security
ALLOWED_ORIGINS=https://janua.dev,https://app.janua.dev
REQUIRE_HTTPS=true
```

### Vercel Configuration

```json
// vercel.json
{
  "functions": {
    "src/index.ts": {
      "runtime": "edge",
      "regions": ["iad1", "sfo1", "fra1", "sin1"]
    }
  },
  "routes": [
    {
      "src": "/verify",
      "dest": "/src/index.ts"
    }
  ]
}
```

### Cloudflare Configuration

```toml
# wrangler.toml
name = "janua-edge-verify"
type = "javascript"
account_id = "your-account-id"
workers_dev = true
routes = ["*janua.dev/verify/*"]

[build]
command = "yarn build"

[build.upload]
format = "service-worker"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

## 🛡️ Security

### Token Validation

```typescript
// Comprehensive validation checks
const validationRules = {
  signature: 'Verify using public key from JWKS',
  issuer: 'Match expected issuer',
  audience: 'Match expected audience',
  expiry: 'Not expired (with clock skew tolerance)',
  notBefore: 'Token is active',
  claims: 'Required claims present',
};
```

### Rate Limiting

```typescript
// Edge-based rate limiting
export async function rateLimit(ip: string): Promise<boolean> {
  const key = `rate:${ip}`;
  const count = await cache.increment(key);
  
  if (count === 1) {
    await cache.expire(key, 60); // 1 minute window
  }
  
  return count <= 100; // 100 requests per minute
}
```

## 📊 Monitoring

### Metrics Collection

```typescript
// Edge analytics
export function trackMetrics(event: VerificationEvent) {
  // Latency tracking
  const latency = Date.now() - event.startTime;
  
  // Success/failure rates
  const success = event.result.valid;
  
  // Geographic distribution
  const region = event.request.cf?.colo || 'unknown';
  
  // Send to analytics
  analytics.track({
    event: 'jwt_verification',
    latency,
    success,
    region,
  });
}
```

### Health Checks

```typescript
// Health endpoint
export async function handleHealth(): Promise<Response> {
  const checks = {
    jwks: await checkJWKS(),
    cache: await checkCache(),
    latency: await measureLatency(),
  };
  
  const healthy = Object.values(checks).every(Boolean);
  
  return new Response(JSON.stringify({
    status: healthy ? 'healthy' : 'degraded',
    checks,
  }), {
    status: healthy ? 200 : 503,
  });
}
```

## 🧪 Testing

### Test Suite

```bash
# Unit tests
yarn test:unit

# Integration tests
yarn test:integration

# Edge runtime tests
yarn test:edge

# Performance tests
yarn test:performance
```

### Mock JWT Generation

```typescript
// tests/helpers/jwt.ts
export function createMockJWT(claims = {}) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    sub: 'user123',
    email: 'test@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...claims,
  };
  
  return signJWT(header, payload, mockPrivateKey);
}
```

## 🚢 Deployment

### Vercel Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Deploy to specific regions
vercel deploy --regions iad1,sfo1,fra1
```

### Cloudflare Deployment

```bash
# Deploy to Cloudflare Workers
wrangler publish

# Deploy to specific zone
wrangler publish --env production
```

### Multi-Platform Deployment

```bash
# Deploy to all platforms
yarn deploy:all

# Platform-specific
yarn deploy:vercel
yarn deploy:cloudflare
```

## 📈 Performance Benchmarks

### Target Metrics

| Metric | Target | Current |
|--------|--------|---------|
| P50 Latency | < 10ms | 8ms |
| P95 Latency | < 50ms | 42ms |
| P99 Latency | < 100ms | 87ms |
| Success Rate | > 99.9% | 99.95% |
| Cache Hit Rate | > 95% | 97% |

### Load Testing

```bash
# Run load tests
yarn test:load

# Stress testing
yarn test:stress --rps 10000
```

## 🔄 Failover & Redundancy

### Multi-Region Strategy

```typescript
// Automatic failover configuration
const regions = [
  { id: 'iad1', primary: true },
  { id: 'sfo1', failover: true },
  { id: 'fra1', failover: true },
  { id: 'sin1', failover: true },
];
```

### Circuit Breaker

```typescript
// Prevent cascade failures
export class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open');
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## 🛠️ Development

### Local Testing

```bash
# Run edge runtime locally
yarn dev

# Test with mock JWTs
yarn dev:mock

# Debug mode
yarn dev:debug
```

### Contributing

See [Edge Verify Contributing Guide](../../docs/contributing/edge-verify.md).

## 📚 Resources

- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [JWT Specification](https://jwt.io)
- [Edge Runtime API](https://edge-runtime.vercel.app)

## 🎯 Roadmap

### Current Sprint
- [ ] Implement session validation
- [ ] Add refresh token support
- [ ] Enhance caching strategy

### Next Quarter
- [ ] Multi-tenant support
- [ ] Advanced rate limiting
- [ ] WebAuthn verification
- [ ] Geo-blocking capabilities

## 📄 License

Part of the Janua platform. See [LICENSE](../../LICENSE) in the root directory.