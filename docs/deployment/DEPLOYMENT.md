# Janua Deployment Guide

## 🚀 Quick Deploy to Vercel

This project is configured for easy deployment to Vercel with our mock API for demo purposes.

### Prerequisites

1. [Vercel Account](https://vercel.com/signup)
2. [GitHub Account](https://github.com)
3. Node.js 18+ installed locally

### Deployment Steps

#### 1. Fork & Clone Repository

```bash
git clone https://github.com/aureolabs/janua.git
cd janua
yarn install
```

#### 2. Deploy Marketing Site

```bash
# From project root
cd apps/marketing
vercel --prod
```

When prompted:
- Set up and deploy: Y
- Which scope: Select your Vercel account
- Link to existing project: N
- Project name: `janua-marketing`
- Directory: `./`
- Override settings: N

#### 3. Deploy Auth App

```bash
# From project root
cd apps/auth
vercel --prod
```

When prompted:
- Project name: `janua-auth`
- Follow same steps as marketing

#### 4. Deploy Mock API (Vercel Functions)

Create `api/` directory in `apps/auth`:

```bash
mkdir -p apps/auth/api
cp packages/mock-api/src/server.ts apps/auth/api/index.ts
```

Then redeploy auth app:
```bash
cd apps/auth
vercel --prod
```

#### 5. Configure Custom Domains

In Vercel Dashboard:

1. **Marketing Site** (`janua-marketing`):
   - Add domain: `janua.dev`
   - Add domain: `www.janua.dev` (redirect to janua.dev)

2. **Auth App** (`janua-auth`):
   - Add domain: `app.janua.dev`

#### 6. Set Environment Variables

In Vercel Dashboard for both projects:

```env
NEXT_PUBLIC_API_URL=https://app.janua.dev/api
NEXT_PUBLIC_APP_URL=https://app.janua.dev
```

### Local Development

#### Start All Services

```bash
# Terminal 1: Marketing site
cd apps/marketing
yarn dev
# Runs on http://localhost:3001

# Terminal 2: Auth app
cd apps/auth
yarn dev
# Runs on http://localhost:3002

# Terminal 3: Mock API
cd packages/mock-api
yarn dev
# Runs on http://localhost:4000
```

#### Test Credentials

```
Email: demo@janua.dev
Password: DemoPassword123!
```

### Project Structure

```
janua/
├── apps/
│   ├── marketing/        # Public website (janua.dev)
│   └── auth/            # Auth app (app.janua.dev)
├── packages/
│   ├── sdk/             # JavaScript SDK
│   ├── ui/              # Shared UI components
│   └── mock-api/        # Mock API server
└── vercel.json          # Vercel configuration
```

### Available URLs

After deployment:

- **Marketing**: https://janua.dev
- **Auth App**: https://app.janua.dev
  - Sign In: https://app.janua.dev/signin
  - Sign Up: https://app.janua.dev/signup
  - Dashboard: https://app.janua.dev/dashboard
- **API**: https://app.janua.dev/api

### Features Included

✅ **Authentication Pages**
- Sign In with email/password
- Sign Up with validation
- User Dashboard

✅ **Marketing Site**
- Landing page with all sections
- Pricing page
- About page
- Responsive design

✅ **Mock API**
- JWT token generation
- Session management
- User CRUD operations
- In-memory database

### Next Steps

1. **Production API**: Replace mock API with Railway deployment
2. **Database**: Connect PostgreSQL and Redis
3. **Email**: Configure SendGrid for email verification
4. **Monitoring**: Add Sentry and PostHog
5. **CDN**: Configure Cloudflare

### Troubleshooting

#### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
yarn install
yarn build
```

#### Port Conflicts

```bash
# Kill processes on ports
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:4000 | xargs kill -9
```

#### Environment Variables

Ensure `.env.local` exists in both apps:

```bash
cp .env.example apps/marketing/.env.local
cp .env.example apps/auth/.env.local
```

### Support

- Documentation: https://docs.janua.dev
- GitHub Issues: https://github.com/aureolabs/janua/issues
- Email: support@janua.dev

---

**Note**: This is a demo deployment using mock data. For production, you'll need to:
1. Set up Railway for the API
2. Configure PostgreSQL and Redis
3. Implement real authentication logic
4. Add proper security headers and CORS