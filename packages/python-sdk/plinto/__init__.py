"""
Plinto Python SDK

A comprehensive Python SDK for the Plinto authentication and user management platform.
"""

__version__ = "1.0.0"
__author__ = "Plinto Team"
__email__ = "support@plinto.dev"

# Main client
from .client import PlintoClient, create_client

# Service clients
from .auth import AuthClient
from .users import UsersClient
from .organizations import OrganizationsClient
from .sessions import SessionsClient
from .webhooks import WebhooksClient
from .mfa import MFAClient
from .passkeys import PasskeysClient

# Types and models
from .types import (
    # User types
    User,
    UserProfile,
    UserPreferences,
    UserRole,
    UserStatus,
    
    # Auth types
    Session,
    AuthTokens,
    SignInRequest,
    SignUpRequest,
    PasswordResetRequest,
    EmailVerificationRequest,
    OAuthProvider,
    
    # Organization types
    Organization,
    OrganizationMember,
    OrganizationRole,
    OrganizationInvite,
    OrganizationSettings,
    
    # MFA types
    MFASettings,
    MFAMethod,
    MFAChallenge,
    TOTPSetup,
    SMSSetup,
    BackupCodes,
    
    # Passkey types
    Passkey,
    PasskeyChallenge,
    PasskeyCredential,
    
    # Webhook types
    WebhookEndpoint,
    WebhookEvent,
    WebhookDelivery,
    WebhookEventType,
    
    # Session types
    SessionDevice,
    SessionActivity,
    
    # Common types
    ListResponse,
    BaseResponse,
    PlintoConfig,
)

# Exceptions
from .exceptions import (
    PlintoError,
    APIError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ValidationError,
    RateLimitError,
    ServerError,
    ConfigurationError,
    NetworkConnectionError,
)

# Utilities
from .utils import (
    validate_webhook_signature,
    decode_jwt_claims,
    generate_code_verifier,
    generate_code_challenge,
)

__all__ = [
    # Version info
    "__version__",
    
    # Main client
    "PlintoClient",
    "create_client",
    
    # Service clients
    "AuthClient",
    "UsersClient",
    "OrganizationsClient",
    "SessionsClient",
    "WebhooksClient",
    "MFAClient",
    "PasskeysClient",
    
    # User types
    "User",
    "UserProfile",
    "UserPreferences",
    "UserRole",
    "UserStatus",
    
    # Auth types
    "Session",
    "AuthTokens",
    "SignInRequest",
    "SignUpRequest",
    "PasswordResetRequest",
    "EmailVerificationRequest",
    "OAuthProvider",
    
    # Organization types
    "Organization",
    "OrganizationMember",
    "OrganizationRole",
    "OrganizationInvite",
    "OrganizationSettings",
    
    # MFA types
    "MFASettings",
    "MFAMethod",
    "MFAChallenge",
    "TOTPSetup",
    "SMSSetup",
    "BackupCodes",
    
    # Passkey types
    "Passkey",
    "PasskeyChallenge",
    "PasskeyCredential",
    
    # Webhook types
    "WebhookEndpoint",
    "WebhookEvent",
    "WebhookDelivery",
    "WebhookEventType",
    
    # Session types
    "SessionDevice",
    "SessionActivity",
    
    # Common types
    "ListResponse",
    "BaseResponse",
    "PlintoConfig",
    
    # Exceptions
    "PlintoError",
    "APIError",
    "AuthenticationError",
    "AuthorizationError",
    "NotFoundError",
    "ValidationError",
    "RateLimitError",
    "ServerError",
    "ConfigurationError",
    "NetworkConnectionError",
    
    # Utilities
    "validate_webhook_signature",
    "decode_jwt_claims",
    "generate_code_verifier",
    "generate_code_challenge",
]