"""
Working tests for AuthService
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from app.services.auth_service import AuthService
import bcrypt


class TestAuthServiceWorking:
    """Working auth service tests"""
    
    @pytest.fixture
    def auth_service(self):
        """Create auth service instance"""
        service = AuthService()
        service.db = AsyncMock()
        service.redis = AsyncMock()
        service.jwt_service = Mock()
        return service
    
    def test_password_hashing(self, auth_service):
        """Test password hashing works"""
        password = "TestPassword123!"
        hashed = auth_service.hash_password(password)
        assert hashed != password
        assert auth_service.verify_password(password, hashed)
    
    def test_password_validation(self, auth_service):
        """Test password strength validation"""
        # Valid password
        assert auth_service.validate_password_strength("ValidPass123!") == True
        
        # Invalid passwords
        assert auth_service.validate_password_strength("short") == False
        assert auth_service.validate_password_strength("nouppercase123!") == False
        assert auth_service.validate_password_strength("NOLOWERCASE123!") == False
        assert auth_service.validate_password_strength("NoNumbers!") == False
        assert auth_service.validate_password_strength("NoSpecial123") == False
    
    @pytest.mark.asyncio
    async def test_create_user_mock(self, auth_service):
        """Test user creation with mocks"""
        # Mock database response
        auth_service.db.execute.return_value.scalar_one_or_none.return_value = None
        auth_service.db.execute.return_value.scalar_one.return_value = Mock(id="user123")
        
        # Call create user
        result = await auth_service.create_user(
            email="test@example.com",
            password="ValidPass123!",
            name="Test User"
        )
        
        assert result is not None
        assert auth_service.db.execute.called
    
    @pytest.mark.asyncio
    async def test_authenticate_user_mock(self, auth_service):
        """Test user authentication with mocks"""
        # Mock user data
        mock_user = Mock()
        mock_user.id = "user123"
        mock_user.email = "test@example.com"
        mock_user.password_hash = bcrypt.hashpw(b"ValidPass123!", bcrypt.gensalt())
        mock_user.is_active = True
        
        auth_service.db.execute.return_value.scalar_one_or_none.return_value = mock_user
        
        # Authenticate
        result = await auth_service.authenticate_user("test@example.com", "ValidPass123!")
        
        assert result is not None
        assert result.id == "user123"
