# Plinto Python SDK

Official Python SDK for Plinto - Modern authentication and user management platform.

## Installation

```bash
pip install plinto
```

For specific framework integrations:

```bash
# Django integration
pip install plinto[django]

# FastAPI integration
pip install plinto[fastapi]

# Flask integration
pip install plinto[flask]
```

## Quick Start

```python
import asyncio
from plinto import PlintoClient

async def main():
    # Initialize the client
    client = PlintoClient(
        app_id="your-app-id",
        api_key="your-api-key"  # Optional for server-side usage
    )
    
    # Sign up a new user
    response = await client.auth.sign_up(
        email="user@example.com",
        password="secure-password",
        first_name="John",
        last_name="Doe"
    )
    
    print(f"User created: {response.user.email}")
    
    # Sign in
    signin_response = await client.auth.sign_in(
        email="user@example.com",
        password="secure-password"
    )
    
    # Check authentication status
    if client.is_authenticated():
        user = client.get_user()
        print(f"Logged in as: {user.email}")
    
    # Update user profile
    updated_user = await client.users.update_current_user(
        first_name="Jane",
        metadata={"theme": "dark"}
    )
    
    # Sign out
    await client.sign_out()
    
    # Clean up
    await client.close()

# Run the async function
asyncio.run(main())
```

## Features

- 🔐 **Complete Authentication**: Email/password, magic links, OAuth, passkeys
- 👤 **User Management**: Profiles, metadata, sessions
- 🏢 **Organizations**: Multi-tenant support with RBAC
- 🔑 **Passkeys/WebAuthn**: Passwordless authentication
- 🔒 **MFA Support**: TOTP and SMS-based 2FA
- 🌐 **OAuth Providers**: Google, GitHub, Microsoft, and more
- 📧 **Magic Links**: Passwordless email authentication
- 🔄 **Token Management**: Automatic refresh with JWT
- 🚀 **Async/Await**: Modern Python async support
- 📝 **Type Hints**: Full type annotations with Pydantic

## Documentation

For full documentation, visit [docs.plinto.dev](https://docs.plinto.dev)

## API Reference

### Client Initialization

```python
from plinto import PlintoClient

client = PlintoClient(
    app_id="required-app-id",
    api_key="optional-api-key",
    api_url="https://api.plinto.dev",  # Optional custom URL
    debug=False  # Enable debug logging
)
```

### Authentication

```python
# Sign up
response = await client.auth.sign_up(
    email="user@example.com",
    password="password",
    first_name="John",
    last_name="Doe"
)

# Sign in
response = await client.auth.sign_in(
    email="user@example.com",
    password="password"
)

# Sign out
await client.auth.sign_out()

# Magic link
await client.auth.send_magic_link("user@example.com")
response = await client.auth.sign_in_with_magic_link(token)

# OAuth
oauth_url = await client.auth.get_oauth_url(
    provider="google",
    redirect_url="https://app.example.com/callback"
)

# Passkeys
options = await client.auth.begin_passkey_registration()
await client.auth.complete_passkey_registration(credential)

# MFA
result = await client.auth.enable_mfa("totp")
await client.auth.confirm_mfa(code)
```

### User Management

```python
# Get current user
user = await client.users.get_current_user()

# Update user
updated_user = await client.users.update_current_user(
    first_name="Jane",
    metadata={"theme": "dark"}
)

# Upload profile image
with open("profile.jpg", "rb") as f:
    result = await client.users.upload_profile_image(f, "profile.jpg")

# User sessions
sessions = await client.users.get_user_sessions()
await client.users.revoke_session(session_id)
```

### Organizations

```python
# Create organization
org = await client.organizations.create_organization(
    name="Acme Inc",
    slug="acme"
)

# Invite members
await client.organizations.invite_member(
    org_id=org.id,
    email="member@example.com",
    role="member"
)

# Manage roles
roles = await client.organizations.get_organization_roles(org.id)
await client.organizations.update_member(
    org_id=org.id,
    user_id=user_id,
    role="admin"
)
```

## Framework Integrations

### Django

```python
# settings.py
PLINTO_APP_ID = "your-app-id"
PLINTO_API_KEY = "your-api-key"

# views.py
from plinto.django import plinto_client

async def signup_view(request):
    async with plinto_client() as client:
        response = await client.auth.sign_up(
            email=request.POST["email"],
            password=request.POST["password"]
        )
    return JsonResponse({"user_id": response.user.id})
```

### FastAPI

```python
from fastapi import FastAPI, Depends
from plinto.fastapi import get_plinto_client, require_auth

app = FastAPI()

@app.post("/signup")
async def signup(
    email: str,
    password: str,
    client = Depends(get_plinto_client)
):
    response = await client.auth.sign_up(email=email, password=password)
    return {"user_id": response.user.id}

@app.get("/protected")
async def protected_route(user = Depends(require_auth)):
    return {"user": user}
```

### Flask

```python
from flask import Flask, request
from plinto.flask import plinto_client

app = Flask(__name__)

@app.route("/signup", methods=["POST"])
async def signup():
    async with plinto_client() as client:
        response = await client.auth.sign_up(
            email=request.json["email"],
            password=request.json["password"]
        )
    return {"user_id": response.user.id}
```

## Error Handling

```python
from plinto.exceptions import (
    AuthenticationError,
    ValidationError,
    NotFoundError,
    RateLimitError
)

try:
    await client.auth.sign_in(email="user@example.com", password="wrong")
except AuthenticationError as e:
    print(f"Authentication failed: {e.message}")
except ValidationError as e:
    print(f"Invalid input: {e.details}")
except RateLimitError as e:
    print(f"Too many requests: {e.message}")
```

## Async Context Manager

```python
async with PlintoClient(app_id="your-app-id") as client:
    user = await client.users.get_current_user()
    # Client automatically closes when exiting context
```

## Type Safety

The SDK uses Pydantic for full type safety:

```python
from plinto.types import User, Session, SignUpRequest

# All types are validated
request = SignUpRequest(
    email="invalid-email",  # Will raise validation error
    password="pass"
)

# IDE autocomplete and type checking
user: User = await client.users.get_current_user()
print(user.email_verified)  # Type-safe attribute access
```

## Requirements

- Python 3.7+
- httpx
- pydantic >= 2.0
- python-jose[cryptography]

## License

MIT

## Support

- Documentation: [docs.plinto.dev](https://docs.plinto.dev)
- Issues: [GitHub Issues](https://github.com/plinto/plinto/issues)
- Discord: [Join our community](https://discord.gg/plinto)