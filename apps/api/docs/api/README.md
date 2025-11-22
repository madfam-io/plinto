# API Reference Documentation

> **Complete reference for all Janua API endpoints**

This section provides comprehensive documentation for all Janua API endpoints, including request/response schemas, authentication requirements, and practical examples.

## 📋 API Overview

### Base Information
- **Base URL**: `https://api.janua.dev` (production) / `http://localhost:8000` (development)
- **API Version**: v1
- **Authentication**: Bearer Token (JWT)
- **Content Type**: `application/json`
- **Rate Limiting**: 60 requests/minute per IP

### Response Format
All API responses follow a consistent structure:

```json
{
  "success": true,
  "data": { /* Response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-16T10:30:00Z",
  "request_id": "req_123456789"
}
```

Error responses:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": { /* Error details */ }
  },
  "timestamp": "2025-01-16T10:30:00Z",
  "request_id": "req_123456789"
}
```

## 🔗 Endpoint Categories

### Core Authentication
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/auth/signup` | POST | User registration | [Authentication](authentication.md#signup) |
| `/api/v1/auth/signin` | POST | User login | [Authentication](authentication.md#signin) |
| `/api/v1/auth/refresh` | POST | Token refresh | [Authentication](authentication.md#refresh) |
| `/api/v1/auth/signout` | POST | User logout | [Authentication](authentication.md#signout) |
| `/api/v1/auth/me` | GET | Current user profile | [Authentication](authentication.md#profile) |

### User Management
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/users` | GET | List users | [User Management](user-management.md#list) |
| `/api/v1/users/{id}` | GET | Get user details | [User Management](user-management.md#get) |
| `/api/v1/users/{id}` | PUT | Update user | [User Management](user-management.md#update) |
| `/api/v1/users/{id}` | DELETE | Delete user | [User Management](user-management.md#delete) |
| `/api/v1/users/{id}/roles` | GET | Get user roles | [User Management](user-management.md#roles) |

### Organization Management
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/organizations` | GET | List organizations | [Organizations](organizations.md#list) |
| `/api/v1/organizations` | POST | Create organization | [Organizations](organizations.md#create) |
| `/api/v1/organizations/{id}` | GET | Get organization | [Organizations](organizations.md#get) |
| `/api/v1/organizations/{id}` | PUT | Update organization | [Organizations](organizations.md#update) |
| `/api/v1/organizations/{id}/members` | GET | List members | [Organizations](organizations.md#members) |

### Multi-Factor Authentication
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/mfa/setup` | POST | Setup MFA | [MFA](mfa.md#setup) |
| `/api/v1/mfa/verify` | POST | Verify MFA code | [MFA](mfa.md#verify) |
| `/api/v1/mfa/backup-codes` | GET | Get backup codes | [MFA](mfa.md#backup-codes) |
| `/api/v1/mfa/disable` | POST | Disable MFA | [MFA](mfa.md#disable) |

### WebAuthn/Passkeys
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/passkeys/register/options` | POST | Get registration options | [WebAuthn](webauthn.md#register-options) |
| `/api/v1/passkeys/register` | POST | Register passkey | [WebAuthn](webauthn.md#register) |
| `/api/v1/passkeys/authenticate/options` | POST | Get auth options | [WebAuthn](webauthn.md#auth-options) |
| `/api/v1/passkeys/authenticate` | POST | Authenticate with passkey | [WebAuthn](webauthn.md#authenticate) |
| `/api/v1/passkeys` | GET | List user passkeys | [WebAuthn](webauthn.md#list) |

### Enterprise SSO
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/sso/providers` | GET | List SSO providers | [SSO](sso-integration.md#providers) |
| `/api/v1/sso/saml` | POST | SAML authentication | [SSO](sso-integration.md#saml) |
| `/api/v1/sso/oidc` | POST | OIDC authentication | [SSO](sso-integration.md#oidc) |
| `/api/v1/sso/config` | GET | SSO configuration | [SSO](sso-integration.md#config) |

### SCIM Provisioning
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/scim/Users` | GET | List SCIM users | [SCIM](scim-provisioning.md#users-list) |
| `/api/v1/scim/Users` | POST | Create SCIM user | [SCIM](scim-provisioning.md#users-create) |
| `/api/v1/scim/Users/{id}` | GET | Get SCIM user | [SCIM](scim-provisioning.md#users-get) |
| `/api/v1/scim/Users/{id}` | PUT | Update SCIM user | [SCIM](scim-provisioning.md#users-update) |
| `/api/v1/scim/Users/{id}` | DELETE | Delete SCIM user | [SCIM](scim-provisioning.md#users-delete) |

### Session Management
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/sessions` | GET | List user sessions | [Sessions](sessions.md#list) |
| `/api/v1/sessions/{id}` | GET | Get session details | [Sessions](sessions.md#get) |
| `/api/v1/sessions/{id}` | DELETE | Terminate session | [Sessions](sessions.md#terminate) |
| `/api/v1/sessions/terminate-all` | POST | Terminate all sessions | [Sessions](sessions.md#terminate-all) |

### Webhooks
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/webhooks` | GET | List webhooks | [Webhooks](webhooks.md#list) |
| `/api/v1/webhooks` | POST | Create webhook | [Webhooks](webhooks.md#create) |
| `/api/v1/webhooks/{id}` | GET | Get webhook | [Webhooks](webhooks.md#get) |
| `/api/v1/webhooks/{id}` | PUT | Update webhook | [Webhooks](webhooks.md#update) |
| `/api/v1/webhooks/{id}/test` | POST | Test webhook | [Webhooks](webhooks.md#test) |

### Administrative
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/api/v1/admin/users` | GET | Admin user list | [Admin](admin.md#users) |
| `/api/v1/admin/organizations` | GET | Admin org list | [Admin](admin.md#organizations) |
| `/api/v1/admin/analytics` | GET | System analytics | [Admin](admin.md#analytics) |
| `/api/v1/admin/audit-logs` | GET | Audit logs | [Admin](admin.md#audit-logs) |

### Health & Monitoring
| Endpoint | Method | Description | Documentation |
|----------|--------|-------------|---------------|
| `/health` | GET | Application health | [Health](health-monitoring.md#health) |
| `/ready` | GET | Readiness check | [Health](health-monitoring.md#ready) |
| `/metrics` | GET | Prometheus metrics | [Health](health-monitoring.md#metrics) |
| `/api/v1/health/detailed` | GET | Detailed health check | [Health](health-monitoring.md#detailed) |

## 🔐 Authentication

### Bearer Token Authentication
Most endpoints require authentication using a Bearer token:

```bash
curl -H "Authorization: Bearer <your_jwt_token>" \
     -H "Content-Type: application/json" \
     https://api.janua.dev/api/v1/auth/me
```

### API Key Authentication (Enterprise)
Enterprise endpoints may use API key authentication:

```bash
curl -H "X-API-Key: <your_api_key>" \
     -H "Content-Type: application/json" \
     https://api.janua.dev/api/v1/admin/analytics
```

## 📊 Response Codes

### Success Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `202 Accepted` - Request accepted for processing
- `204 No Content` - Request successful, no response body

### Client Error Codes
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded

### Server Error Codes
- `500 Internal Server Error` - Server error
- `502 Bad Gateway` - Upstream service error
- `503 Service Unavailable` - Service temporarily unavailable
- `504 Gateway Timeout` - Request timeout

## 🚀 Quick Start Examples

### Basic Authentication Flow
```bash
# 1. Register user
curl -X POST https://api.janua.dev/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "John Doe"
  }'

# 2. Sign in
curl -X POST https://api.janua.dev/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'

# 3. Use access token
curl -H "Authorization: Bearer <access_token>" \
     https://api.janua.dev/api/v1/auth/me
```

### Organization Management
```bash
# Create organization
curl -X POST https://api.janua.dev/api/v1/organizations \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "domain": "acme.com"
  }'

# List organizations
curl -H "Authorization: Bearer <access_token>" \
     https://api.janua.dev/api/v1/organizations
```

## 📝 Request/Response Examples

All endpoints include comprehensive examples in their respective documentation files. Examples include:

- **Complete Request/Response**: Full HTTP request and response
- **SDK Examples**: Python, JavaScript, and other SDK usage
- **Error Scenarios**: Common error cases and responses
- **Edge Cases**: Handling of special conditions

## 🔄 Pagination

List endpoints support cursor-based pagination:

```json
{
  "data": [/* results */],
  "pagination": {
    "has_next": true,
    "has_previous": false,
    "next_cursor": "eyJpZCI6MTIzfQ==",
    "previous_cursor": null,
    "total_count": 150
  }
}
```

Query parameters:
- `cursor`: Pagination cursor
- `limit`: Results per page (max 100)

## 🏷️ Filtering and Sorting

Many endpoints support filtering and sorting:

```bash
# Filter and sort users
curl "https://api.janua.dev/api/v1/users?status=active&sort=created_at:desc&limit=20" \
  -H "Authorization: Bearer <access_token>"
```

Common parameters:
- `sort`: Field and direction (`field:asc` or `field:desc`)
- `filter`: Field-based filtering
- `search`: Text search across multiple fields

## 🌐 Internationalization

The API supports multiple languages for error messages and responses:

```bash
curl -H "Accept-Language: es-ES" \
     -H "Authorization: Bearer <access_token>" \
     https://api.janua.dev/api/v1/auth/me
```

Supported languages: English (en), Spanish (es), French (fr), German (de)

## 📚 Related Resources

- **[Authentication Guide](authentication.md)** - Complete authentication flow
- **[Error Handling](error-handling.md)** - Error codes and handling
- **[Rate Limiting](rate-limiting.md)** - Rate limit details and handling
- **[Webhooks](webhooks.md)** - Event-driven integrations
- **[SDKs](sdks.md)** - Official client libraries

---

<div align="center">

**[⬅️ Documentation Home](../README.md)** • **[🔐 Authentication](authentication.md)** • **[👥 Users](user-management.md)** • **[🏢 Organizations](organizations.md)**

</div>