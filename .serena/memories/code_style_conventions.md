# Janua - Code Style and Conventions

## TypeScript/JavaScript Conventions

### TypeScript Configuration
- **Target**: ES2020
- **Module**: ESNext with bundler resolution
- **Strict Mode**: Enabled
- **JSX**: react-jsx
- **Key Settings**:
  - strict: true
  - skipLibCheck: true
  - resolveJsonModule: true
  - esModuleInterop: true
  - forceConsistentCasingInFileNames: true
  - noUnusedLocals: false (currently disabled)
  - noUnusedParameters: false (currently disabled)

### Naming Conventions
- **Files**: kebab-case for files (e.g., `user-service.ts`)
- **Components**: PascalCase for React components (e.g., `UserProfile.tsx`)
- **Functions/Variables**: camelCase (e.g., `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces/Types**: PascalCase with 'I' or 'T' prefix optional

### Project Structure Patterns
- Monorepo structure using Turborepo and Yarn workspaces
- Clear separation between apps/ and packages/
- Shared packages for SDKs and common functionality
- Each app/package has its own package.json

## Python Conventions (API)
- FastAPI framework for backend API
- Requirements in requirements.txt and requirements-dev.txt
- Alembic for database migrations
- pytest for testing

## Testing Conventions
- Jest for unit and integration tests
- Playwright for E2E tests
- Test files: `*.test.ts` or `*.test.tsx` pattern
- Tests located in:
  - Unit tests: alongside source files or in __tests__ folders
  - Integration tests: tests/integration/
  - E2E tests: Playwright configuration

## Build and Development
- Turborepo for monorepo build orchestration
- Concurrent development servers for frontend/backend
- Docker Compose for local backend services
- Makefile provides alternative commands

## Git Conventions
- Feature branches for development
- Descriptive commit messages
- No direct commits to main branch

## Documentation
- Comprehensive docs/ folder structure
- README.md files in each package
- Technical documentation in docs/technical/
- API documentation in docs/api/