# Vercel Project Configuration

## Critical Settings Required

Your deploy hook is working (HTTP 201), but Vercel isn't deploying. You need to update these settings in your Vercel project:

### 1. Project Settings → General
- **Root Directory**: `apps/marketing` (NOT blank/root)
- **Framework Preset**: `Next.js`
- **Build and Development Settings**: Override enabled

### 2. Build & Development Settings
- **Build Command**: `npm run build` (will use apps/marketing/vercel.json)
- **Output Directory**: `.next` (relative to apps/marketing)
- **Install Command**: `cd ../.. && yarn install --frozen-lockfile` (install from monorepo root)

### 3. Environment Variables
Add these if needed:
- `NEXT_PUBLIC_APP_URL`: `https://plinto.dev`
- `NEXT_PUBLIC_API_URL`: `https://api.plinto.dev`

## Why Deploy Hook Works But No Deployment

1. **Deploy Hook Success**: ✅ HTTP 201 means Vercel received the trigger
2. **Vercel Tries to Build**: ❌ Fails because it's looking at wrong directory
3. **No Deployment**: ❌ Build fails = no deployment

## Fix Steps

1. Go to your Vercel project dashboard
2. Settings → General → Root Directory → `apps/marketing`
3. Save changes
4. Trigger another deployment (push to main)

The deploy hook will then work correctly!