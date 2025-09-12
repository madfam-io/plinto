# Root Directory Structure

This document describes the proper organization of files in the Plinto project root directory.

## ✅ Files That Belong in Root

### Configuration Files
- **README.md** - Main project documentation
- **package.json** - Node.js dependencies and scripts
- **package-lock.json** / **yarn.lock** - Dependency lock files
- **tsconfig.json** - TypeScript configuration
- **.gitignore** - Git ignore patterns
- **turbo.json** - Turborepo configuration
- **Makefile** - Build and development commands

### Environment Files
- **.env.example** - Example environment variables
- **.env.production.example** - Production environment example

### Build Configuration
- **jest.config.js** - Jest testing configuration
- **playwright.config.ts** - Playwright E2E testing configuration
- **.babelrc** - Babel transpiler configuration

### Deployment Configuration
- **vercel.json** - Vercel deployment configuration
- **railway.json** - Railway deployment configuration

## 📁 Directory Structure

```
plinto/
├── apps/                 # Application packages (monorepo)
│   ├── api/             # Python FastAPI backend
│   ├── marketing/       # Marketing website
│   ├── dashboard/       # User dashboard
│   ├── admin/          # Admin interface
│   └── ...
├── packages/            # Shared packages and SDKs
│   ├── nextjs-sdk/     # Next.js SDK
│   ├── react-sdk/      # React SDK
│   ├── ui/             # Shared UI components
│   └── ...
├── docs/                # All documentation
│   ├── production/     # Production readiness reports
│   ├── technical/      # Technical documentation
│   ├── deployment/     # Deployment guides
│   ├── architecture/   # Architecture documents
│   └── ...
├── claudedocs/          # Claude-generated documentation
│   ├── gap analysis reports
│   ├── implementation reports
│   └── ...
├── tests/               # Test files and configurations
├── scripts/             # Utility scripts
├── deployment/          # Deployment configurations
├── infrastructure/      # Infrastructure as code
├── monitoring/          # Monitoring configurations
├── config/              # Additional configurations
├── assets/              # Static assets
├── .github/             # GitHub configurations
├── .claude/             # Claude configuration
└── .serena/            # Serena project configuration
```

## 🚫 Files That Should NOT Be in Root

### Documentation Reports
These have been moved to `docs/production/`:
- ~~ALPHA_LAUNCH_READINESS_REPORT.md~~
- ~~BETA_LAUNCH_READINESS_REPORT.md~~
- ~~COMPREHENSIVE_BETA_READINESS_REPORT.md~~
- ~~PRODUCTION_STATUS_REPORT.md~~
- ~~PRODUCTION_BETA_READINESS_ASSESSMENT.md~~

### Temporary Files
Should be automatically cleaned:
- *.tmp
- *.log (except intentional log files)
- .DS_Store (macOS)
- Thumbs.db (Windows)
- *.swp (Vim swap files)

### Build Artifacts
Should be in .gitignore:
- node_modules/
- dist/
- build/
- .next/
- *.pyc
- __pycache__/

## Cleanup Complete

The root directory has been organized with all documentation reports moved to their proper location in `docs/production/`. The root now contains only essential configuration files and standard project structure directories.