# Plinto - Suggested Development Commands

## Essential Development Commands

### Starting Development
- `yarn dev` or `npm run dev` - Start all development servers (turbo)
- `yarn dev:all` - Start frontend and backend concurrently
- `yarn dev:frontend` - Start only frontend services
- `yarn dev:backend` - Start backend with Docker
- `make dev` - Alternative: Start development servers

### Building
- `yarn build` or `npm run build` - Build all packages
- `yarn build:frontend` - Build only frontend apps
- `yarn build:packages` - Build only packages
- `make build` - Alternative: Build all packages

### Testing
- `yarn test` - Run tests with coverage
- `yarn test:all` - Run all test suites (unit, integration, E2E)
- `yarn test:unit` - Run unit tests only
- `yarn test:integration` - Run integration tests
- `yarn test:e2e` - Run Playwright E2E tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run with coverage reporting
- `make test` - Alternative: Run all tests

### Code Quality
- `yarn lint` or `npm run lint` - Run linters (turbo)
- `yarn typecheck` or `npm run typecheck` - Run TypeScript type checking
- `yarn format:all` - Format code
- `make lint` - Alternative: Run linters
- `make typecheck` - Alternative: Run type checking

### Database
- `yarn db:migrate` - Run database migrations
- `yarn db:reset` - Reset database
- `make db-migrate` - Alternative: Run migrations
- `make db-reset` - Alternative: Reset database

### Docker
- `yarn docker:up` - Start Docker services
- `yarn docker:down` - Stop Docker services
- `yarn docker:logs` - View Docker logs
- `make docker-up` - Alternative: Start Docker
- `make docker-down` - Alternative: Stop Docker

### Installation & Cleanup
- `yarn install` or `npm install` - Install dependencies
- `yarn clean` - Clean build artifacts
- `make install` - Install all dependencies (including Python)
- `make clean` - Clean all build artifacts

### Health Checks
- `yarn health:all` - Check health of all services

### System Commands (macOS/Darwin)
- `ls -la` - List files with details
- `grep -r "pattern" .` - Search recursively
- `find . -name "*.ts"` - Find files by pattern
- `git status` - Check git status
- `git diff` - View changes
- `git log --oneline -10` - View recent commits