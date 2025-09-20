"""Main Plinto SDK client for authentication and user management."""

import os
from typing import Optional, Dict, Any, List
from urllib.parse import urljoin

from .http_client import HTTPClient
from .auth import AuthClient
from .users import UsersClient
from .organizations import OrganizationsClient
from .sessions import SessionsClient
from .webhooks import WebhooksClient
from .mfa import MFAClient
from .passkeys import PasskeysClient
from .types import (
    User,
    Session,
    Organization,
    MFASettings,
    Passkey,
    WebhookEndpoint,
    PlintoConfig,
)
from .exceptions import PlintoError, ConfigurationError


class PlintoClient:
    """
    Main client for interacting with the Plinto API.
    
    This client provides access to all Plinto services including authentication,
    user management, organizations, sessions, MFA, passkeys, and webhooks.
    
    Example:
        ```python
        from plinto import PlintoClient
        
        # Initialize with API key
        client = PlintoClient(api_key="your_api_key")
        
        # Or with custom configuration
        client = PlintoClient(
            api_key="your_api_key",
            base_url="https://api.plinto.dev",
            timeout=30.0,
            max_retries=3
        )
        
        # Use the client
        user = client.auth.sign_in(
            email="user@example.com",
            password="secure_password"
        )
        ```
    """
    
    DEFAULT_BASE_URL = "https://api.plinto.dev"
    DEFAULT_TIMEOUT = 30.0
    DEFAULT_MAX_RETRIES = 3
    
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: Optional[float] = None,
        max_retries: Optional[int] = None,
        environment: Optional[str] = None,
        debug: bool = False,
        custom_headers: Optional[Dict[str, str]] = None,
    ):
        """
        Initialize the Plinto client.
        
        Args:
            api_key: Your Plinto API key. Can also be set via PLINTO_API_KEY env var
            base_url: Base URL for the API. Defaults to https://api.plinto.dev
            timeout: Request timeout in seconds. Defaults to 30
            max_retries: Maximum number of retry attempts. Defaults to 3
            environment: Environment name (production, staging, development)
            debug: Enable debug mode for detailed logging
            custom_headers: Additional headers to include in all requests
            
        Raises:
            ConfigurationError: If API key is not provided and not in environment
        """
        # Get API key from parameter or environment
        self.api_key = api_key or os.environ.get('PLINTO_API_KEY')
        if not self.api_key:
            raise ConfigurationError(
                "API key is required. Provide it as a parameter or set PLINTO_API_KEY environment variable"
            )
        
        # Get base URL from parameter, environment, or default
        self.base_url = (
            base_url or 
            os.environ.get('PLINTO_BASE_URL') or 
            self.DEFAULT_BASE_URL
        )
        
        # Configure client settings
        self.timeout = timeout or self.DEFAULT_TIMEOUT
        self.max_retries = max_retries or self.DEFAULT_MAX_RETRIES
        self.environment = environment or os.environ.get('PLINTO_ENVIRONMENT', 'production')
        self.debug = debug
        
        # Create configuration object
        self.config = PlintoConfig(
            api_key=self.api_key,
            base_url=self.base_url,
            timeout=self.timeout,
            max_retries=self.max_retries,
            environment=self.environment,
            debug=self.debug,
        )
        
        # Initialize HTTP client
        self.http = HTTPClient(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=self.timeout,
            max_retries=self.max_retries,
            custom_headers=custom_headers,
        )
        
        # Initialize service clients
        self._init_service_clients()
    
    def _init_service_clients(self) -> None:
        """Initialize all service clients."""
        self.auth = AuthClient(self.http, self.config)
        self.users = UsersClient(self.http, self.config)
        self.organizations = OrganizationsClient(self.http, self.config)
        self.sessions = SessionsClient(self.http, self.config)
        self.webhooks = WebhooksClient(self.http, self.config)
        self.mfa = MFAClient(self.http, self.config)
        self.passkeys = PasskeysClient(self.http, self.config)
    
    def set_api_key(self, api_key: str) -> None:
        """
        Update the API key used for authentication.
        
        Args:
            api_key: The new API key
        """
        self.api_key = api_key
        self.config.api_key = api_key
        self.http.api_key = api_key
        self.http.headers['Authorization'] = f'Bearer {api_key}'
    
    def set_environment(self, environment: str) -> None:
        """
        Set the environment for the client.
        
        Args:
            environment: Environment name (production, staging, development)
        """
        self.environment = environment
        self.config.environment = environment
    
    def enable_debug(self) -> None:
        """Enable debug mode for detailed logging."""
        self.debug = True
        self.config.debug = True
    
    def disable_debug(self) -> None:
        """Disable debug mode."""
        self.debug = False
        self.config.debug = False
    
    def health_check(self) -> Dict[str, Any]:
        """
        Check the health status of the Plinto API.
        
        Returns:
            Dictionary containing health status information
            
        Raises:
            PlintoError: If health check fails
        """
        response = self.http.get('/health')
        return response.json()
    
    def get_api_version(self) -> str:
        """
        Get the current API version.
        
        Returns:
            API version string
            
        Raises:
            PlintoError: If request fails
        """
        response = self.http.get('/version')
        data = response.json()
        return data.get('version', 'unknown')
    
    def close(self) -> None:
        """Close the client and release resources."""
        self.http.close()
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
    
    def __repr__(self) -> str:
        """String representation of the client."""
        return (
            f"PlintoClient("
            f"base_url={self.base_url}, "
            f"environment={self.environment}, "
            f"debug={self.debug}"
            f")"
        )


# Convenience function for quick initialization
def create_client(
    api_key: Optional[str] = None,
    **kwargs
) -> PlintoClient:
    """
    Create a Plinto client instance.
    
    This is a convenience function for quickly creating a client.
    
    Args:
        api_key: Your Plinto API key
        **kwargs: Additional arguments to pass to PlintoClient
        
    Returns:
        Configured PlintoClient instance
        
    Example:
        ```python
        from plinto import create_client
        
        client = create_client("your_api_key")
        ```
    """
    return PlintoClient(api_key=api_key, **kwargs)