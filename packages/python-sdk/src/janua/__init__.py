"""
Janua Python SDK
Official Python SDK for Janua - Modern authentication and user management platform
"""

from .client import JanuaClient
from .auth import AuthClient
from .users import UserClient
from .organizations import OrganizationClient
from .types import (
    User,
    Session,
    AuthTokens,
    SignUpRequest,
    SignInRequest,
    SignInResponse,
    SignUpResponse,
    UpdateUserRequest,
    OrganizationInfo,
    OrganizationMembership,
    JanuaError,
)
from .exceptions import (
    JanuaAPIError,
    AuthenticationError,
    ValidationError,
    NotFoundError,
    RateLimitError,
)

__version__ = "0.1.0"

__all__ = [
    "JanuaClient",
    "AuthClient",
    "UserClient",
    "OrganizationClient",
    "User",
    "Session",
    "AuthTokens",
    "SignUpRequest",
    "SignInRequest",
    "SignInResponse",
    "SignUpResponse",
    "UpdateUserRequest",
    "OrganizationInfo",
    "OrganizationMembership",
    "JanuaError",
    "JanuaAPIError",
    "AuthenticationError",
    "ValidationError",
    "NotFoundError",
    "RateLimitError",
]