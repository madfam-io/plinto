# Playwright E2E Test Failures - Connection Refused

**Date**: November 14, 2025
**Status**: ❌ ALL E2E TESTS FAILING
**Issue**: Services not running when tests execute
**Root Cause**: Tests run directly without starting required services

---

## Problem Summary

All 16 Playwright E2E tests failed with connection refused errors:

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:8000
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3003
```

**Services Expected But Not Running**:
- ❌ API Backend (localhost:8000)
- ❌ Landing Page (localhost:3000)
- ❌ Marketing Site (localhost:3003)
- ❌ PostgreSQL (localhost:5432)
- ❌ Redis (localhost:6379)

---

## Root Cause Analysis

### Issue 1: Command Executed Without Service Setup

**What Happened**:
```bash
npx playwright test  # ❌ Run tests directly
```

**What Should Happen**:
```bash
npm run test:journeys:setup  # Start services
npm run test:journeys         # Run tests WITH services
# OR
docker-compose -f docker-compose.test.yml up -d
```

### Issue 2: Test File Location Mismatch

**Current Test Location**: `tests-e2e/`
```
tests-e2e/
├── api-integration.spec.ts
├── auth-flows.spec.ts
└── simple-functionality-test.spec.ts
```

**Docker Compose Expects**: `tests/e2e/`
```yaml
# docker-compose.test.yml:156
volumes:
  - ./tests/e2e:/tests/e2e  # ← Looks for tests/e2e directory
```

**Package.json Scripts Expect**: `tests/e2e/journeys`
```json
"test:journeys": "npm run test:journeys:setup && npx playwright test tests/e2e/journeys && npm run test:journeys:teardown"
```

**Playwright Config Expects**: `tests-e2e/`
```typescript
// playwright.config.ts:4
testDir: './tests-e2e'
```

### Issue 3: Missing CI/CD Workflow

**No GitHub Actions E2E Workflow Found**:
- No `.github/workflows/e2e-tests.yml`
- No `.github/workflows/playwright.yml`
- No integration with CI/CD pipeline

**Result**: E2E tests never run in CI/CD, failures go undetected

---

## Test Failure Breakdown

### API Integration Tests (11 failures)

**File**: `tests-e2e/api-integration.spec.ts`
**Error**: `connect ECONNREFUSED ::1:8000`

**Failed Tests**:
1. ❌ Health endpoint returns success
2. ❌ Ready endpoint shows all services healthy
3. ❌ OpenID configuration endpoint is accessible
4. ❌ JWKS endpoint returns valid key set
5. ❌ API documentation is accessible
6. ❌ API redoc documentation is accessible
7. ❌ Security headers are present
8. ❌ Returns 404 for non-existent endpoint
9. ❌ Handles malformed requests gracefully
10. ❌ Health endpoint responds quickly
11. ❌ Concurrent requests are handled properly

**Root Cause**: API server not running on localhost:8000

### Authentication Flow Tests (2 failures)

**File**: `tests-e2e/auth-flows.spec.ts`
**Error**: `net::ERR_CONNECTION_REFUSED at http://localhost:3000`

**Failed Tests**:
1. ❌ User registration and email verification flow
2. ❌ Login flow with valid credentials

**Root Cause**: Landing page app not running on localhost:3000

### Marketing Site Tests (3 failures)

**File**: `tests-e2e/simple-functionality-test.spec.ts`
**Error**: `net::ERR_CONNECTION_REFUSED at http://localhost:3003`

**Failed Tests**:
1. ❌ Core functionality works
2. ❌ Interactive components work
3. ❌ Navigation structure exists

**Root Cause**: Marketing site app not running on localhost:3003 (port mismatch)

---

## Configuration Analysis

### Docker Compose Test Services

**Configured Services** (`docker-compose.test.yml`):
```yaml
api:        # Port 8000 ✅
  ports: ["8000:8000"]
  healthcheck: curl http://localhost:8000/health

landing:    # Port 3000 ✅
  ports: ["3000:3000"]

test-app:   # Port 3001 ✅
  ports: ["3001:3001"]

dashboard:  # Port 3002 ✅ (but tests expect 3003)
  ports: ["3002:3002"]

postgres:   # Port 5432 ✅
  ports: ["5432:5432"]

redis:      # Port 6379 ✅
  ports: ["6379:6379"]
```

### Port Mapping Issues

**Dashboard vs Marketing Site**:
- Docker Compose: `dashboard` on port **3002**
- Tests expect: Marketing site on port **3003**
- **Problem**: No service configured for port 3003

---

## How to Fix

### Solution 1: Use Existing Test Setup (Recommended)

**Correct Command**:
```bash
# Start all services, wait for health checks, run tests, cleanup
npm run test:journeys
```

**What This Does**:
1. `docker-compose -f docker-compose.test.yml up -d` - Start all services
2. `bash scripts/wait-for-services.sh` - Wait for health checks
3. `npx playwright test tests/e2e/journeys` - Run tests
4. `docker-compose -f docker-compose.test.yml down -v` - Cleanup

**Prerequisites**:
- Move test files to `tests/e2e/journeys/` directory
- OR update package.json to use `tests-e2e` directory

### Solution 2: Fix Test Directory Structure

**Option A: Move Tests to Expected Location**
```bash
mkdir -p tests/e2e/journeys
mv tests-e2e/*.spec.ts tests/e2e/journeys/
```

**Option B: Update All Configs to Use `tests-e2e`**
```json
// package.json
"test:journeys": "npm run test:journeys:setup && npx playwright test tests-e2e && npm run test:journeys:teardown"
```

```yaml
# docker-compose.test.yml:156
volumes:
  - ./tests-e2e:/tests-e2e
```

### Solution 3: Fix Port 3003 Issue

**Option A: Update Tests to Use Port 3002 (Dashboard)**
```typescript
// tests-e2e/simple-functionality-test.spec.ts:5
await page.goto('http://localhost:3002');  // Was 3003
```

**Option B: Add Marketing Site Service**
```yaml
# docker-compose.test.yml
marketing:
  build:
    context: ./apps/marketing
    dockerfile: Dockerfile.dev
  ports:
    - "3003:3003"
```

### Solution 4: Create GitHub Actions E2E Workflow

**Create** `.github/workflows/e2e-tests.yml`:
```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e-tests:
    name: Playwright E2E Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Start test services
        run: npm run test:journeys:setup

      - name: Wait for services
        run: npm run test:journeys:wait

      - name: Run Playwright tests
        run: npx playwright test

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/

      - name: Stop test services
        if: always()
        run: npm run test:journeys:teardown
```

---

## Immediate Action Plan

### Step 1: Verify Service Infrastructure
```bash
# Check if docker-compose.test.yml is valid
docker-compose -f docker-compose.test.yml config

# Check if all required Dockerfiles exist
ls -la apps/api/Dockerfile.dev
ls -la apps/landing/Dockerfile.dev
ls -la apps/dashboard/Dockerfile.dev
```

### Step 2: Start Services Manually
```bash
# Start all test services
docker-compose -f docker-compose.test.yml up -d

# Watch logs for errors
docker-compose -f docker-compose.test.yml logs -f

# Check service health
curl http://localhost:8000/health  # API
curl http://localhost:3000         # Landing
curl http://localhost:3002         # Dashboard
```

### Step 3: Run Tests with Services Running
```bash
# With services already running
npx playwright test

# OR use full test suite
npm run test:journeys
```

### Step 4: Fix Test Directory Structure
```bash
# Create correct structure
mkdir -p tests/e2e/journeys

# Move test files
mv tests-e2e/api-integration.spec.ts tests/e2e/journeys/
mv tests-e2e/auth-flows.spec.ts tests/e2e/journeys/
mv tests-e2e/simple-functionality-test.spec.ts tests/e2e/journeys/

# Update playwright config
sed -i '' "s|testDir: './tests-e2e'|testDir: './tests/e2e'|" playwright.config.ts
```

### Step 5: Add CI/CD Integration
```bash
# Create workflow file
cat > .github/workflows/e2e-tests.yml << 'EOF'
# [Copy workflow from Solution 4 above]
EOF

# Test workflow locally with act (if installed)
act -j e2e-tests
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to Docker daemon"
```bash
# Start Docker Desktop
open -a Docker

# OR start Docker service (Linux)
sudo systemctl start docker
```

### Issue: "Port already in use"
```bash
# Find what's using the port
lsof -i :8000
lsof -i :3000

# Kill the process
kill -9 <PID>

# OR use different ports in docker-compose.test.yml
```

### Issue: "Service unhealthy" timeouts
```bash
# Check service logs
docker-compose -f docker-compose.test.yml logs api

# Increase healthcheck timeout
# Edit docker-compose.test.yml healthcheck.start_period
start_period: 60s  # Increase from 30s
```

### Issue: Database migrations not applied
```bash
# Run migrations manually
docker-compose -f docker-compose.test.yml exec api alembic upgrade head

# OR add to API startup script
```

---

## Verification Checklist

After implementing fixes, verify:

### Service Health
- [ ] `curl http://localhost:8000/health` returns `{"status": "healthy"}`
- [ ] `curl http://localhost:8000/ready` shows database and Redis healthy
- [ ] `curl http://localhost:3000` returns HTML (landing page)
- [ ] `curl http://localhost:3002` returns HTML (dashboard)

### Test Execution
- [ ] `npx playwright test` completes without connection errors
- [ ] All 27 tests either pass or fail on assertions (not connection)
- [ ] Test artifacts generated: `playwright-report/`, `test-results/`

### CI/CD Integration
- [ ] E2E workflow file created
- [ ] Workflow runs on push to main/develop
- [ ] Test results uploaded as artifacts
- [ ] Services cleaned up after tests

---

## Files to Modify

### Required Changes
1. **Test Directory Structure**:
   - Move `tests-e2e/` to `tests/e2e/journeys/`
   - Update `playwright.config.ts` testDir
   - Update `package.json` test scripts

2. **Port Configuration**:
   - Fix marketing site port (3003 → 3002 in tests)
   - OR add marketing service on port 3003

3. **CI/CD Workflow**:
   - Create `.github/workflows/e2e-tests.yml`
   - Add service startup/teardown

### Optional Enhancements
1. **Test Organization**:
   - Separate API tests, UI tests, integration tests
   - Add test fixtures and helpers
   - Create reusable page objects

2. **Service Configuration**:
   - Add healthcheck wait script
   - Improve startup reliability
   - Add database seed data

3. **Documentation**:
   - Update README with E2E test instructions
   - Document local testing setup
   - Add troubleshooting guide

---

## Summary

**Problem**: Playwright E2E tests fail because required services (API, frontend apps, databases) are not running

**Root Cause**: Tests executed with `npx playwright test` instead of using proper service setup via `npm run test:journeys`

**Solution**:
1. Use `npm run test:journeys` which starts services, runs tests, and cleans up
2. Fix test directory structure to match docker-compose expectations
3. Add CI/CD workflow for automated E2E testing
4. Fix port 3003 mismatch (dashboard is 3002, not 3003)

**Impact**:
- ✅ Once fixed, all 27 E2E tests can run against real services
- ✅ Validates complete user journeys end-to-end
- ✅ CI/CD will catch integration issues before production
- ✅ Automated testing of API, authentication, and UI flows

**Next Steps**:
1. Run `npm run test:journeys:setup` to start services
2. Verify all services healthy with curl commands
3. Run `npx playwright test` to execute tests
4. Create GitHub Actions workflow for CI/CD integration
5. Document E2E testing process for team

This is a **test infrastructure issue**, not a code bug. The application code is likely fine - we just need to run tests against running services, not cold start them.
