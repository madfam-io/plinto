"""
Custom exception classes for the Janua API

DEPRECATED: This module is maintained for backward compatibility only.
New code should import from app.core.exceptions instead.

All exceptions now inherit from the unified exception system in app.core.exceptions.
"""

# Import from unified exception system
from app.core.exceptions import (
    JanuaAPIException,
    AuthenticationError,
    TokenError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    ExternalServiceError,
)

# Re-export for backward compatibility
__all__ = [
    "JanuaAPIException",
    "AuthenticationError",
    "TokenError",
    "AuthorizationError",
    "ValidationError",
    "NotFoundError",
    "ConflictError",
    "RateLimitError",
    "ExternalServiceError",
]
