# Plinto Project Overview

## Purpose
Plinto is a secure identity platform that provides:
- **Core**: Identity management, sessions, organizations/tenants, roles, policies, audits, webhooks
- **Edge**: Ultra-fast verification via Vercel Middleware & Cloudflare Workers with global JWKS caching
- **Admin**: Dashboard for managing users, orgs, keys, webhooks, and compliance
- **SDKs**: Developer-first libraries for Next.js/React/Node (alpha), with Vue/Go/Python planned

**Status**: Private alpha
**Domain**: https://plinto.dev
**Stack**: Vercel + Railway + Cloudflare (R2 + CDN + Turnstile)

## Tech Stack
- **Frontend**: React, Next.js, TypeScript
- **Backend**: Python (FastAPI) for API, Node.js/TypeScript for edge functions
- **Monorepo**: Turborepo with Yarn workspaces
- **Testing**: Jest for unit tests, Playwright for E2E tests
- **Build Tools**: Turbo, Babel, TypeScript
- **Deployment**: Vercel (frontend), Railway (backend), Cloudflare (CDN/R2)

## Project Structure
- **apps/**: Application packages
  - api: Python FastAPI backend
  - marketing: Marketing website
  - dashboard: User dashboard
  - admin: Admin interface
  - demo: Demo application
  - docs: Documentation site
  - edge-verify: Edge verification functions
- **packages/**: Shared packages and SDKs
  - Various SDKs (nextjs-sdk, react-sdk, js-sdk, typescript-sdk, python-sdk, vue-sdk)
  - ui: Shared UI components
  - core: Core functionality
  - database: Database models/utilities
  - config: Shared configuration