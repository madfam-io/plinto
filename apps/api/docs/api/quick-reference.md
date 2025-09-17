# API Quick Reference

> **Essential endpoints and examples for rapid development**

This quick reference provides the most commonly used API endpoints with working examples for rapid integration.

## 🔐 Authentication

### User Registration
```bash
curl -X POST "https://api.plinto.dev/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2025-01-16T10:30:00Z"
    },
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 900
  }
}
```

### User Login
```bash
curl -X POST "https://api.plinto.dev/api/v1/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### Token Refresh
```bash
curl -X POST "https://api.plinto.dev/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <refresh_token>"
```

### Get Current User
```bash
curl -H "Authorization: Bearer <access_token>" \
     "https://api.plinto.dev/api/v1/auth/me"
```

## 👥 User Management

### Update User Profile
```bash
curl -X PUT "https://api.plinto.dev/api/v1/users/me" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "phone": "+1234567890"
  }'
```

### Change Password
```bash
curl -X POST "https://api.plinto.dev/api/v1/users/me/password" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPassword123!",
    "new_password": "NewPassword123!"
  }'
```

## 🏢 Organizations

### Create Organization
```bash
curl -X POST "https://api.plinto.dev/api/v1/organizations" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "domain": "acme.com"
  }'
```

### List Organizations
```bash
curl -H "Authorization: Bearer <access_token>" \
     "https://api.plinto.dev/api/v1/organizations"
```

### Invite User to Organization
```bash
curl -X POST "https://api.plinto.dev/api/v1/organizations/123/invitations" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "role": "member"
  }'
```

## 🔑 WebAuthn/Passkeys

### Register Passkey - Get Options
```bash
curl -X POST "https://api.plinto.dev/api/v1/passkeys/register/options" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"
```

### Register Passkey - Complete Registration
```bash
curl -X POST "https://api.plinto.dev/api/v1/passkeys/register" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "credential_id",
      "response": {
        "attestationObject": "...",
        "clientDataJSON": "..."
      }
    },
    "name": "My iPhone Touch ID"
  }'
```

### Authenticate with Passkey - Get Options
```bash
curl -X POST "https://api.plinto.dev/api/v1/passkeys/authenticate/options" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Authenticate with Passkey - Complete Authentication
```bash
curl -X POST "https://api.plinto.dev/api/v1/passkeys/authenticate" \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "id": "credential_id",
      "response": {
        "authenticatorData": "...",
        "clientDataJSON": "...",
        "signature": "..."
      }
    }
  }'
```

## 🔐 Multi-Factor Authentication

### Setup MFA
```bash
curl -X POST "https://api.plinto.dev/api/v1/mfa/setup" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json"
```

**Response includes QR code and backup codes:**
```json
{
  "success": true,
  "data": {
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret": "JBSWY3DPEHPK3PXP",
    "backup_codes": [
      "123456789",
      "987654321"
    ]
  }
}
```

### Verify MFA Setup
```bash
curl -X POST "https://api.plinto.dev/api/v1/mfa/verify" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456"
  }'
```

## 🔗 Sessions

### List Active Sessions
```bash
curl -H "Authorization: Bearer <access_token>" \
     "https://api.plinto.dev/api/v1/sessions"
```

### Terminate Session
```bash
curl -X DELETE "https://api.plinto.dev/api/v1/sessions/session_id" \
  -H "Authorization: Bearer <access_token>"
```

### Terminate All Sessions
```bash
curl -X POST "https://api.plinto.dev/api/v1/sessions/terminate-all" \
  -H "Authorization: Bearer <access_token>"
```

## 🔔 Webhooks

### Create Webhook
```bash
curl -X POST "https://api.plinto.dev/api/v1/webhooks" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-app.com/webhooks/plinto",
    "events": ["user.created", "user.updated", "user.deleted"],
    "secret": "your_webhook_secret"
  }'
```

### Test Webhook
```bash
curl -X POST "https://api.plinto.dev/api/v1/webhooks/123/test" \
  -H "Authorization: Bearer <access_token>"
```

## 💼 Enterprise SSO

### List SSO Providers
```bash
curl -H "Authorization: Bearer <access_token>" \
     "https://api.plinto.dev/api/v1/sso/providers"
```

### SAML Authentication Initiation
```bash
curl -X POST "https://api.plinto.dev/api/v1/sso/saml/initiate" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": "provider_123",
    "relay_state": "optional_state"
  }'
```

## 👨‍💼 SCIM Provisioning

### List SCIM Users
```bash
curl -H "Authorization: Bearer <scim_token>" \
     -H "Content-Type: application/scim+json" \
     "https://api.plinto.dev/api/v1/scim/Users"
```

### Create SCIM User
```bash
curl -X POST "https://api.plinto.dev/api/v1/scim/Users" \
  -H "Authorization: Bearer <scim_token>" \
  -H "Content-Type: application/scim+json" \
  -d '{
    "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
    "userName": "user@example.com",
    "name": {
      "givenName": "John",
      "familyName": "Doe"
    },
    "emails": [{
      "value": "user@example.com",
      "primary": true
    }],
    "active": true
  }'
```

## 🏥 Health & Monitoring

### Health Check
```bash
curl "https://api.plinto.dev/health"
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "production"
}
```

### Readiness Check
```bash
curl "https://api.plinto.dev/ready"
```

**Response:**
```json
{
  "status": "ready",
  "database": {
    "healthy": true,
    "response_time_ms": 12
  },
  "redis": true
}
```

### Prometheus Metrics
```bash
curl "https://api.plinto.dev/metrics"
```

## 🚨 Error Handling

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    }
  },
  "timestamp": "2025-01-16T10:30:00Z",
  "request_id": "req_123456789"
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Invalid request data
- `AUTHENTICATION_REQUIRED` - Missing or invalid authentication
- `AUTHORIZATION_FAILED` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

## 📊 Pagination

### Paginated Response
```json
{
  "success": true,
  "data": [
    // ... results
  ],
  "pagination": {
    "has_next": true,
    "has_previous": false,
    "next_cursor": "eyJpZCI6MTIzfQ==",
    "previous_cursor": null,
    "total_count": 150
  }
}
```

### Using Pagination
```bash
# First page
curl "https://api.plinto.dev/api/v1/users?limit=20"

# Next page
curl "https://api.plinto.dev/api/v1/users?cursor=eyJpZCI6MTIzfQ==&limit=20"
```

## 🔍 Filtering & Sorting

### Filter Examples
```bash
# Filter by status
curl "https://api.plinto.dev/api/v1/users?status=active"

# Filter by date range
curl "https://api.plinto.dev/api/v1/users?created_after=2025-01-01&created_before=2025-01-31"

# Multiple filters
curl "https://api.plinto.dev/api/v1/users?status=active&role=admin"
```

### Sorting Examples
```bash
# Sort by creation date (descending)
curl "https://api.plinto.dev/api/v1/users?sort=created_at:desc"

# Sort by name (ascending)
curl "https://api.plinto.dev/api/v1/users?sort=name:asc"

# Multiple sort fields
curl "https://api.plinto.dev/api/v1/users?sort=status:asc,created_at:desc"
```

## 🌐 Internationalization

### Request with Language Preference
```bash
curl -H "Accept-Language: es-ES" \
     -H "Authorization: Bearer <access_token>" \
     "https://api.plinto.dev/api/v1/auth/me"
```

### Supported Languages
- `en-US` - English (US)
- `en-GB` - English (UK)
- `es-ES` - Spanish (Spain)
- `es-MX` - Spanish (Mexico)
- `fr-FR` - French (France)
- `de-DE` - German (Germany)

## 📱 Rate Limiting

### Rate Limit Headers
All responses include rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1642723200
X-RateLimit-Retry-After: 60
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "details": {
      "limit": 60,
      "window": "minute",
      "retry_after": 60
    }
  }
}
```

## 🛡️ Security Headers

### Required Headers
```bash
# Authorization header for authenticated endpoints
Authorization: Bearer <access_token>

# Content type for JSON requests
Content-Type: application/json

# Optional: Request ID for tracking
X-Request-ID: req_123456789
```

### SCIM Authentication
```bash
# SCIM endpoints use different authentication
Authorization: Bearer <scim_token>
Content-Type: application/scim+json
```

## 🧪 Testing Endpoints

### Test Authentication
```bash
# Test signup
curl -X POST "http://localhost:8000/api/v1/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'

# Test signin
curl -X POST "http://localhost:8000/api/v1/auth/signin" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Environment URLs
- **Development**: `http://localhost:8000`
- **Staging**: `https://staging-api.plinto.dev`
- **Production**: `https://api.plinto.dev`

## 📚 SDK Examples

### Python SDK
```python
import asyncio
from plinto_sdk import PlintoClient

async def main():
    client = PlintoClient(
        base_url="https://api.plinto.dev",
        api_key="your_api_key"
    )

    # Create user
    user = await client.auth.signup(
        email="user@example.com",
        password="SecurePassword123!",
        name="John Doe"
    )

    # Get current user
    current_user = await client.auth.me()
    print(f"Logged in as: {current_user.name}")

asyncio.run(main())
```

### JavaScript SDK
```javascript
import { PlintoClient } from '@plinto/sdk';

const client = new PlintoClient({
  baseUrl: 'https://api.plinto.dev',
  apiKey: 'your_api_key'
});

// Create user
const user = await client.auth.signup({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  name: 'John Doe'
});

// Get current user
const currentUser = await client.auth.me();
console.log(`Logged in as: ${currentUser.name}`);
```

## 🔗 Related Resources

- **[Complete API Documentation](README.md)** - Full API reference
- **[Authentication Guide](authentication.md)** - Detailed auth flows
- **[WebAuthn Guide](webauthn.md)** - Passkey implementation
- **[Enterprise Features](enterprise.md)** - SSO and SCIM
- **[Error Handling](error-handling.md)** - Error codes and handling
- **[SDKs](sdks.md)** - Official client libraries

---

<div align="center">

**[⬅️ API Documentation](README.md)** • **[🔐 Authentication](authentication.md)** • **[📚 Complete Reference](README.md#endpoint-categories)**

</div>