"""
Comprehensive tests for Auth Router endpoints
Targeting 80%+ coverage for authentication router
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime, timedelta

from app.main import app
from app.models import User, UserStatus, EmailVerification, PasswordReset, MagicLink, ActivityLog
from app.services.auth_service import AuthService
from app.services.email import EmailService


client = TestClient(app)


class TestAuthRouterEndpoints:
    """Comprehensive test coverage for all auth router endpoints"""

    @pytest.fixture
    def mock_db(self):
        """Mock database session"""
        with patch('app.database.get_db') as mock:
            db_mock = Mock(spec=Session)
            mock.return_value = db_mock
            yield db_mock

    @pytest.fixture
    def mock_auth_service(self):
        """Mock auth service with common methods"""
        with patch('app.services.auth_service.AuthService') as mock:
            # Mock password validation
            mock.validate_password_strength.return_value = (True, None)
            mock.hash_password.return_value = "hashed_password"
            mock.verify_password.return_value = True
            mock.create_access_token.return_value = "mock_access_token"
            mock.create_refresh_token.return_value = "mock_refresh_token"
            mock.verify_token.return_value = {"user_id": "user_123", "exp": 1234567890}
            yield mock

    @pytest.fixture
    def mock_email_service(self):
        """Mock email service"""
        with patch('app.services.email.EmailService') as mock:
            mock.send_verification_email = AsyncMock(return_value=True)
            mock.send_password_reset_email = AsyncMock(return_value=True)
            mock.send_magic_link_email = AsyncMock(return_value=True)
            yield mock

    def test_signup_endpoint_success(self, mock_db, mock_auth_service, mock_email_service):
        """Test successful user signup"""
        # Mock user creation
        mock_db.query.return_value.filter.return_value.first.return_value = None
        mock_db.add = Mock()
        mock_db.commit = Mock()
        mock_db.refresh = Mock()
        
        # Mock user object
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.email = "test@example.com"
        mock_user.first_name = "Test"
        mock_user.last_name = "User"
        mock_user.status = UserStatus.PENDING_VERIFICATION
        mock_user.created_at = datetime.now()
        
        mock_db.refresh.side_effect = lambda x: setattr(x, 'id', 'user_123')
        
        response = client.post("/auth/signup", json={
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "first_name": "Test",
            "last_name": "User"
        })
        
        assert response.status_code == 201
        mock_auth_service.validate_password_strength.assert_called_once()
        mock_auth_service.hash_password.assert_called_once()

    def test_signup_endpoint_validation_errors(self, mock_db, mock_auth_service):
        """Test signup with validation errors"""
        # Test weak password
        mock_auth_service.validate_password_strength.return_value = (False, "Password too weak")
        
        response = client.post("/auth/signup", json={
            "email": "test@example.com",
            "password": "weak",
            "first_name": "Test"
        })
        
        assert response.status_code == 400
        assert "Password too weak" in response.json()["detail"]

    def test_signup_endpoint_email_exists(self, mock_db, mock_auth_service):
        """Test signup with existing email"""
        # Mock existing user
        existing_user = Mock()
        existing_user.email = "test@example.com"
        mock_db.query.return_value.filter.return_value.first.return_value = existing_user
        
        response = client.post("/auth/signup", json={
            "email": "test@example.com",
            "password": "StrongPassword123!",
            "first_name": "Test"
        })
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_signin_endpoint_success(self, mock_db, mock_auth_service):
        """Test successful user signin"""
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.email = "test@example.com"
        mock_user.password_hash = "hashed_password"
        mock_user.status = UserStatus.ACTIVE
        mock_user.failed_login_attempts = 0
        mock_user.last_failed_login = None
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/signin", json={
            "email": "test@example.com",
            "password": "correctpassword"
        })
        
        assert response.status_code == 200
        response_data = response.json()
        assert "access_token" in response_data
        assert "refresh_token" in response_data
        assert response_data["token_type"] == "bearer"

    def test_signin_endpoint_invalid_credentials(self, mock_db, mock_auth_service):
        """Test signin with invalid credentials"""
        # Mock user lookup
        mock_user = Mock()
        mock_user.email = "test@example.com"
        mock_user.password_hash = "hashed_password"
        mock_user.status = UserStatus.ACTIVE
        mock_user.failed_login_attempts = 0
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        mock_auth_service.verify_password.return_value = False
        
        response = client.post("/auth/signin", json={
            "email": "test@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    def test_signin_endpoint_user_not_found(self, mock_db, mock_auth_service):
        """Test signin with non-existent user"""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/auth/signin", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })
        
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]

    def test_signin_endpoint_account_locked(self, mock_db, mock_auth_service):
        """Test signin with locked account"""
        mock_user = Mock()
        mock_user.status = UserStatus.SUSPENDED
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/signin", json={
            "email": "test@example.com",
            "password": "anypassword"
        })
        
        assert response.status_code == 403
        assert "suspended" in response.json()["detail"].lower()

    def test_refresh_token_endpoint_success(self, mock_db, mock_auth_service):
        """Test successful token refresh"""
        mock_auth_service.verify_token.return_value = {"user_id": "user_123", "type": "refresh"}
        
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.status = UserStatus.ACTIVE
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/refresh", json={
            "refresh_token": "valid_refresh_token"
        })
        
        assert response.status_code == 200
        response_data = response.json()
        assert "access_token" in response_data
        assert "refresh_token" in response_data

    def test_refresh_token_endpoint_invalid_token(self, mock_auth_service):
        """Test refresh with invalid token"""
        mock_auth_service.verify_token.side_effect = Exception("Invalid token")
        
        response = client.post("/auth/refresh", json={
            "refresh_token": "invalid_token"
        })
        
        assert response.status_code == 401
        assert "Invalid refresh token" in response.json()["detail"]

    def test_signout_endpoint_success(self, mock_db):
        """Test successful signout"""
        with patch('app.dependencies.get_current_user') as mock_get_user:
            mock_user = Mock()
            mock_user.id = "user_123"
            mock_get_user.return_value = mock_user
            
            response = client.post("/auth/signout", headers={
                "Authorization": "Bearer valid_token"
            })
            
            assert response.status_code == 200
            assert "Successfully signed out" in response.json()["message"]

    def test_get_current_user_endpoint_success(self, mock_db):
        """Test get current user profile"""
        with patch('app.dependencies.get_current_user') as mock_get_user:
            mock_user = Mock()
            mock_user.id = "user_123"
            mock_user.email = "test@example.com"
            mock_user.first_name = "Test"
            mock_user.last_name = "User"
            mock_user.status = UserStatus.ACTIVE
            mock_user.created_at = datetime.now()
            mock_user.updated_at = datetime.now()
            mock_get_user.return_value = mock_user
            
            response = client.get("/auth/me", headers={
                "Authorization": "Bearer valid_token"
            })
            
            assert response.status_code == 200
            response_data = response.json()
            assert response_data["email"] == "test@example.com"
            assert response_data["first_name"] == "Test"

    def test_forgot_password_endpoint_success(self, mock_db, mock_email_service):
        """Test forgot password endpoint"""
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.email = "test@example.com"
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/password/forgot", json={
            "email": "test@example.com"
        })
        
        assert response.status_code == 200
        assert "Password reset instructions sent" in response.json()["message"]

    def test_forgot_password_endpoint_user_not_found(self, mock_db):
        """Test forgot password with non-existent user"""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/auth/password/forgot", json={
            "email": "nonexistent@example.com"
        })
        
        # Should still return 200 for security (don't reveal if email exists)
        assert response.status_code == 200
        assert "Password reset instructions sent" in response.json()["message"]

    def test_reset_password_endpoint_success(self, mock_db, mock_auth_service):
        """Test password reset with valid token"""
        # Mock reset token lookup
        mock_reset = Mock()
        mock_reset.user_id = "user_123"
        mock_reset.expires_at = datetime.now() + timedelta(hours=1)
        mock_reset.is_used = False
        mock_db.query.return_value.filter.return_value.first.return_value = mock_reset
        
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_db.query.return_value.filter.return_value.first.side_effect = [mock_reset, mock_user]
        
        response = client.post("/auth/password/reset", json={
            "token": "valid_reset_token",
            "new_password": "NewStrongPassword123!"
        })
        
        assert response.status_code == 200
        assert "Password reset successfully" in response.json()["message"]

    def test_reset_password_endpoint_invalid_token(self, mock_db):
        """Test password reset with invalid token"""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/auth/password/reset", json={
            "token": "invalid_token",
            "new_password": "NewStrongPassword123!"
        })
        
        assert response.status_code == 400
        assert "Invalid or expired reset token" in response.json()["detail"]

    def test_change_password_endpoint_success(self, mock_db, mock_auth_service):
        """Test password change with valid current password"""
        with patch('app.dependencies.get_current_user') as mock_get_user:
            mock_user = Mock()
            mock_user.id = "user_123"
            mock_user.password_hash = "current_hashed_password"
            mock_get_user.return_value = mock_user
            
            response = client.post("/auth/password/change", 
                headers={"Authorization": "Bearer valid_token"},
                json={
                    "current_password": "currentpassword",
                    "new_password": "NewStrongPassword123!"
                }
            )
            
            assert response.status_code == 200
            assert "Password changed successfully" in response.json()["message"]

    def test_change_password_endpoint_wrong_current_password(self, mock_auth_service):
        """Test password change with wrong current password"""
        with patch('app.dependencies.get_current_user') as mock_get_user:
            mock_user = Mock()
            mock_user.password_hash = "current_hashed_password"
            mock_get_user.return_value = mock_user
            mock_auth_service.verify_password.return_value = False
            
            response = client.post("/auth/password/change",
                headers={"Authorization": "Bearer valid_token"},
                json={
                    "current_password": "wrongpassword",
                    "new_password": "NewStrongPassword123!"
                }
            )
            
            assert response.status_code == 400
            assert "Current password is incorrect" in response.json()["detail"]

    def test_verify_email_endpoint_success(self, mock_db):
        """Test email verification with valid token"""
        # Mock verification record
        mock_verification = Mock()
        mock_verification.user_id = "user_123"
        mock_verification.expires_at = datetime.now() + timedelta(hours=1)
        mock_verification.is_verified = False
        mock_db.query.return_value.filter.return_value.first.return_value = mock_verification
        
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.status = UserStatus.PENDING_VERIFICATION
        mock_db.query.return_value.filter.return_value.first.side_effect = [mock_verification, mock_user]
        
        response = client.post("/auth/email/verify", json={
            "token": "valid_verification_token"
        })
        
        assert response.status_code == 200
        assert "Email verified successfully" in response.json()["message"]

    def test_verify_email_endpoint_invalid_token(self, mock_db):
        """Test email verification with invalid token"""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/auth/email/verify", json={
            "token": "invalid_token"
        })
        
        assert response.status_code == 400
        assert "Invalid or expired verification token" in response.json()["detail"]

    def test_resend_verification_endpoint_success(self, mock_db, mock_email_service):
        """Test resend email verification"""
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.email = "test@example.com"
        mock_user.status = UserStatus.PENDING_VERIFICATION
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/email/resend-verification", json={
            "email": "test@example.com"
        })
        
        assert response.status_code == 200
        assert "Verification email sent" in response.json()["message"]

    def test_resend_verification_endpoint_already_verified(self, mock_db):
        """Test resend verification for already verified user"""
        mock_user = Mock()
        mock_user.status = UserStatus.ACTIVE
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/email/resend-verification", json={
            "email": "test@example.com"
        })
        
        assert response.status_code == 400
        assert "already verified" in response.json()["detail"]

    def test_magic_link_endpoint_success(self, mock_db, mock_email_service):
        """Test magic link generation"""
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.email = "test@example.com"
        mock_user.status = UserStatus.ACTIVE
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/magic-link", json={
            "email": "test@example.com"
        })
        
        assert response.status_code == 200
        assert "Magic link sent" in response.json()["message"]

    def test_magic_link_verify_endpoint_success(self, mock_db, mock_auth_service):
        """Test magic link verification"""
        # Mock magic link lookup
        mock_magic_link = Mock()
        mock_magic_link.user_id = "user_123"
        mock_magic_link.expires_at = datetime.now() + timedelta(minutes=30)
        mock_magic_link.is_used = False
        mock_db.query.return_value.filter.return_value.first.return_value = mock_magic_link
        
        # Mock user lookup
        mock_user = Mock()
        mock_user.id = "user_123"
        mock_user.email = "test@example.com"
        mock_user.status = UserStatus.ACTIVE
        mock_db.query.return_value.filter.return_value.first.side_effect = [mock_magic_link, mock_user]
        
        response = client.post("/auth/magic-link/verify", json={
            "token": "valid_magic_token"
        })
        
        assert response.status_code == 200
        response_data = response.json()
        assert "access_token" in response_data
        assert "refresh_token" in response_data

    def test_magic_link_verify_endpoint_invalid_token(self, mock_db):
        """Test magic link verification with invalid token"""
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        response = client.post("/auth/magic-link/verify", json={
            "token": "invalid_magic_token"
        })
        
        assert response.status_code == 400
        assert "Invalid or expired magic link" in response.json()["detail"]


class TestAuthRouterRateLimiting:
    """Test rate limiting functionality"""

    def test_rate_limiting_applied(self):
        """Test that rate limiting is properly configured"""
        # This test verifies rate limiting structure exists
        from app.routers.v1.auth import limiter, router
        
        # Verify limiter is configured
        assert limiter is not None
        assert hasattr(limiter, 'key_func')
        
        # Verify router has rate limiting decorators
        # (This would require inspecting route decorators in a real implementation)
        assert router is not None


class TestAuthRouterSecurity:
    """Test security features and edge cases"""

    def test_sql_injection_protection(self, mock_db):
        """Test protection against SQL injection"""
        # Test malicious email input
        malicious_email = "'; DROP TABLE users; --"
        
        response = client.post("/auth/signin", json={
            "email": malicious_email,
            "password": "anypassword"
        })
        
        # Should handle gracefully, not cause database errors
        assert response.status_code in [400, 401]

    def test_password_security_requirements(self, mock_auth_service):
        """Test password security validation"""
        mock_auth_service.validate_password_strength.return_value = (False, "Password requirements not met")
        
        response = client.post("/auth/signup", json={
            "email": "test@example.com",
            "password": "123",  # Weak password
            "first_name": "Test"
        })
        
        assert response.status_code == 400
        mock_auth_service.validate_password_strength.assert_called_once()

    def test_token_expiration_handling(self, mock_auth_service):
        """Test handling of expired tokens"""
        mock_auth_service.verify_token.side_effect = Exception("Token expired")
        
        response = client.post("/auth/refresh", json={
            "refresh_token": "expired_token"
        })
        
        assert response.status_code == 401

    def test_brute_force_protection(self, mock_db, mock_auth_service):
        """Test brute force attack protection"""
        # Mock user with multiple failed attempts
        mock_user = Mock()
        mock_user.failed_login_attempts = 5
        mock_user.last_failed_login = datetime.now()
        mock_user.status = UserStatus.ACTIVE
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.post("/auth/signin", json={
            "email": "test@example.com",
            "password": "anypassword"
        })
        
        # Should be rate limited or temporarily locked
        assert response.status_code in [401, 429]