"""
Working tests for JWT Service
"""

import pytest
import jwt
from unittest.mock import Mock, patch
from datetime import datetime, timedelta
from app.services.jwt_service import JWTService


class TestJWTServiceWorking:
    """Working JWT service tests"""
    
    @pytest.fixture
    def jwt_service(self):
        """Create JWT service instance"""
        with patch('app.services.jwt_service.settings') as mock_settings:
            mock_settings.JWT_SECRET_KEY = "test-secret-key"
            mock_settings.JWT_ALGORITHM = "HS256"
            mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 30
            mock_settings.REFRESH_TOKEN_EXPIRE_DAYS = 30
            
            service = JWTService()
            service.redis = Mock()
            return service
    
    def test_create_token(self, jwt_service):
        """Test token creation"""
        token = jwt_service.create_access_token(
            subject="user123",
            claims={"role": "user"}
        )
        
        assert token is not None
        assert isinstance(token, str)
        
        # Decode and verify
        decoded = jwt.decode(
            token,
            "test-secret-key",
            algorithms=["HS256"]
        )
        assert decoded["sub"] == "user123"
        assert decoded["role"] == "user"
    
    def test_verify_token(self, jwt_service):
        """Test token verification"""
        # Create a token
        token = jwt_service.create_access_token(
            subject="user123",
            claims={"role": "user"}
        )
        
        # Verify it
        payload = jwt_service.verify_token(token)
        assert payload is not None
        assert payload["sub"] == "user123"
    
    @pytest.mark.asyncio
    async def test_revoke_token(self, jwt_service):
        """Test token revocation"""
        token = "test-token-123"
        jti = "jti-123"
        
        jwt_service.redis.setex = Mock()
        
        await jwt_service.revoke_token(token, jti)
        
        jwt_service.redis.setex.assert_called_once()
