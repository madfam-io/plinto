# Plinto API

> **Core authentication and identity API** for the Plinto platform

**Status:** Active Development · **Stack:** FastAPI + PostgreSQL + Redis · **Port:** 8000

## 📋 Overview

The Plinto API is the core backend service providing authentication, session management, and identity services for the Plinto platform. Built with FastAPI for high performance and modern async Python capabilities.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 14+
- Redis 6+
- Docker (optional, for containerized deployment)

### Installation

```bash
# Navigate to API directory
cd apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# For development with testing
pip install -r requirements-test.txt
```

### Environment Setup

Create a `.env` file in the API directory:

```env
# Application
ENVIRONMENT=development
DEBUG=True
BASE_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/plinto

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-development-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Running the API

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🏗️ Architecture

### Project Structure

```
apps/api/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Settings and configuration
│   ├── exceptions.py        # Custom exception classes
│   ├── auth/               # Authentication module
│   │   ├── router.py       # Auth endpoints
│   │   └── dependencies.py # Auth dependencies
│   ├── core/               # Core utilities
│   │   ├── database.py    # Database configuration
│   │   ├── redis.py       # Redis configuration
│   │   └── errors.py      # Error handlers
│   ├── models/             # SQLAlchemy models
│   │   ├── user.py        # User model
│   │   ├── token.py       # Token model
│   │   └── subscription.py # Subscription model
│   ├── services/           # Business logic
│   │   ├── auth_service.py     # Authentication service
│   │   ├── jwt_service.py      # JWT handling
│   │   ├── billing_service.py  # Billing integration
│   │   └── monitoring.py       # Metrics and monitoring
│   └── middleware/         # Custom middleware
│       └── rate_limit.py  # Rate limiting middleware
├── tests/                  # Test suite
│   ├── unit/              # Unit tests
│   └── integration/       # Integration tests
├── requirements.txt        # Production dependencies
├── requirements-test.txt   # Testing dependencies
├── Dockerfile             # Container configuration
└── pytest.ini            # Pytest configuration
```

### Technology Stack

- **Framework:** FastAPI 0.104.1
- **Database:** PostgreSQL with SQLAlchemy 2.0 (async)
- **Cache:** Redis 6.4
- **Authentication:** JWT (RS256), WebAuthn/Passkeys
- **Validation:** Pydantic 2.11
- **Testing:** Pytest with async support

## 📡 API Endpoints

### Health & Status

- `GET /health` - Health check endpoint
- `GET /ready` - Readiness check (database & Redis)
- `GET /test` - Test endpoint (development only)

### Authentication

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/signin` - User login
- `POST /api/v1/auth/signout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### WebAuthn/Passkeys

- `POST /api/v1/auth/passkeys/register/options` - Get registration options
- `POST /api/v1/auth/passkeys/register` - Register passkey
- `POST /api/v1/auth/passkeys/authenticate/options` - Get authentication options
- `POST /api/v1/auth/passkeys/authenticate` - Authenticate with passkey

### OpenID Connect

- `GET /.well-known/openid-configuration` - OpenID discovery
- `GET /.well-known/jwks.json` - JSON Web Key Set

## 🧪 Testing

### Running Tests

```bash
# Run all tests with coverage
pytest --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/unit/test_config.py

# Run with verbose output
pytest -v --tb=short

# Run integration tests only
pytest tests/integration/

# Generate HTML coverage report
pytest --cov=app --cov-report=html
```

### Test Coverage

Current coverage: **22%** (Target: 100%)

Key test areas:
- Unit tests for configuration, exceptions, models
- Integration tests for auth flows, API endpoints
- Database and Redis operation tests
- Mock support for external dependencies

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t plinto-api .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e REDIS_URL="redis://..." \
  plinto-api
```

### Railway

The API is deployed on Railway with:
- Automatic deployments from main branch
- Health checks on `/health` endpoint
- Environment-specific configurations
- PostgreSQL and Redis addons

### Environment Variables

Required environment variables for production:

```env
ENVIRONMENT=production
BASE_URL=https://api.plinto.dev
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=<secure-random-key>
JWT_SECRET_KEY=<secure-jwt-key>
CORS_ORIGINS=https://plinto.dev,https://app.plinto.dev
```

## 🔒 Security

### Authentication Flow

1. **User Registration:** Email/password with validation
2. **Email Verification:** Token-based email confirmation
3. **Login:** Returns JWT access & refresh tokens
4. **Token Refresh:** Automatic rotation with replay detection
5. **Passkeys:** WebAuthn for passwordless authentication

### Security Features

- **Rate Limiting:** Per-endpoint rate limits via Redis
- **CORS:** Configurable origin validation
- **JWT:** RS256 signing with rotating keys
- **Password Security:** Bcrypt hashing with salt
- **Session Management:** Redis-backed sessions
- **Audit Logging:** Comprehensive activity tracking

## 📊 Monitoring

### Health Checks

- `/health` - Application health
- `/ready` - Database and Redis connectivity
- Prometheus metrics (coming soon)

### Logging

Structured logging with:
- Request/response logging
- Error tracking
- Performance metrics
- Security events

## 🛠️ Development

### Code Quality

```bash
# Format code
black app/ tests/

# Lint code
ruff check app/ tests/

# Type checking
mypy app/
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 📚 Additional Resources

- [API Documentation](../../docs/api/)
- [Architecture Overview](../../docs/architecture/)
- [Security Model](../../docs/security/)
- [Contributing Guide](../../CONTRIBUTING.md)

## 🤝 Contributing

See the [Contributing Guide](../../CONTRIBUTING.md) for development setup and guidelines.

## 📄 License

See [LICENSE](../../LICENSE) file in the root directory.