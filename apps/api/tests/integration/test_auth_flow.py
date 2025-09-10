"""
Integration tests for authentication flow
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient
from unittest.mock import AsyncMock, patch

from app.main import app


class TestAuthenticationFlow:
    """Test complete authentication workflows."""
    
    @pytest.mark.asyncio
    async def test_complete_signup_signin_flow(self, test_client: AsyncClient, mock_redis):
        """Test complete user signup and signin flow."""
        # Mock rate limiting
        mock_redis.get.return_value = None
        mock_redis.incr.return_value = 1
        mock_redis.expire.return_value = True
        
        # Step 1: User signup
        signup_data = {
            "email": "integration@example.com",
            "password": "SecurePassword123!",
            "name": "Integration User"
        }
        
        signup_response = await test_client.post("/api/v1/auth/signup", json=signup_data)
        assert signup_response.status_code == 200
        
        signup_result = signup_response.json()
        assert signup_result["email"] == "integration@example.com"
        assert signup_result["name"] == "Integration User"
        assert signup_result["email_verified"] is False
        user_id = signup_result["id"]
        
        # Step 2: User signin
        signin_data = {
            "email": "integration@example.com",
            "password": "SecurePassword123!"
        }
        
        signin_response = await test_client.post("/api/v1/auth/signin", json=signin_data)
        assert signin_response.status_code == 200
        
        signin_result = signin_response.json()
        assert "access_token" in signin_result
        assert "refresh_token" in signin_result
        assert signin_result["token_type"] == "bearer"
        
        access_token = signin_result["access_token"]
        auth_headers = {"Authorization": f"Bearer {access_token}"}
        
        # Step 3: Access protected resource
        me_response = await test_client.get("/api/v1/auth/me", headers=auth_headers)
        assert me_response.status_code == 200
        
        me_result = me_response.json()
        assert me_result["id"] == user_id
        assert me_result["email"] == "integration@example.com"
        assert me_result["name"] == "Integration User"
        
        # Step 4: Signout
        signout_response = await test_client.post("/api/v1/auth/signout", headers=auth_headers)
        assert signout_response.status_code == 200
        
        signout_result = signout_response.json()
        assert "Successfully signed out" in signout_result["message"]
    
    @pytest.mark.asyncio
    async def test_password_reset_flow(self, test_client: AsyncClient, mock_redis):
        """Test complete password reset flow."""
        # Mock rate limiting
        mock_redis.get.return_value = None
        mock_redis.incr.return_value = 1
        mock_redis.expire.return_value = True
        
        # Step 1: Request password reset
        forgot_data = {"email": "user@example.com"}
        
        forgot_response = await test_client.post("/api/v1/auth/forgot-password", json=forgot_data)
        assert forgot_response.status_code == 200
        
        forgot_result = forgot_response.json()
        assert "Password reset email sent" in forgot_result["message"]
        
        # Step 2: Reset password with token
        reset_data = {
            "token": "reset_token_123",
            "new_password": "NewSecurePassword456!"
        }
        
        reset_response = await test_client.post("/api/v1/auth/reset-password", json=reset_data)
        assert reset_response.status_code == 200
        
        reset_result = reset_response.json()
        assert "Password reset successfully" in reset_result["message"]
    
    @pytest.mark.asyncio
    async def test_email_verification_flow(self, test_client: AsyncClient):
        """Test email verification flow."""
        verify_data = {"token": "verification_token_123"}
        
        verify_response = await test_client.post("/api/v1/auth/verify-email", json=verify_data)
        assert verify_response.status_code == 200
        
        verify_result = verify_response.json()
        assert "Email verified successfully" in verify_result["message"]
    
    @pytest.mark.asyncio
    async def test_token_refresh_flow(self, test_client: AsyncClient):
        """Test token refresh flow."""
        refresh_data = {"refresh_token": "mock_refresh_token"}
        
        refresh_response = await test_client.post("/api/v1/auth/refresh", json=refresh_data)
        assert refresh_response.status_code == 200
        
        refresh_result = refresh_response.json()
        assert "access_token" in refresh_result
        assert "refresh_token" in refresh_result
        assert refresh_result["token_type"] == "bearer"


class TestPasskeyFlow:
    """Test WebAuthn/Passkey authentication flows."""
    
    @pytest.mark.asyncio
    async def test_passkey_registration_flow(self, test_client: AsyncClient, auth_headers):
        """Test complete passkey registration flow."""
        # Step 1: Get registration options
        options_response = await test_client.post(
            "/api/v1/auth/passkeys/register/options",
            headers=auth_headers
        )
        assert options_response.status_code == 200
        
        options_result = options_response.json()
        assert "challenge" in options_result
        assert "rp" in options_result
        assert "user" in options_result
        assert "timeout" in options_result
        
        # Step 2: Register passkey
        credential_data = {
            "id": "credential_id_integration",
            "type": "public-key",
            "response": {
                "clientDataJSON": "mock_client_data_integration",
                "attestationObject": "mock_attestation_integration"
            }
        }
        
        register_response = await test_client.post(
            "/api/v1/auth/passkeys/register",
            json=credential_data,
            headers=auth_headers
        )
        assert register_response.status_code == 200
        
        register_result = register_response.json()
        assert "Passkey registered successfully" in register_result["message"]


class TestRateLimitingIntegration:
    """Test rate limiting across authentication endpoints."""
    
    @pytest.mark.asyncio
    async def test_signup_rate_limiting_integration(self, test_client: AsyncClient, mock_redis):
        """Test signup rate limiting with actual request patterns."""
        # First request - should succeed
        mock_redis.get.return_value = None
        mock_redis.incr.return_value = 1
        mock_redis.expire.return_value = True
        
        signup_data = {"email": "test1@example.com", "password": "SecurePassword123!"}
        response1 = await test_client.post("/api/v1/auth/signup", json=signup_data)
        assert response1.status_code == 200
        
        # Simulate rate limit reached
        mock_redis.get.return_value = "10"  # At limit
        
        signup_data = {"email": "test2@example.com", "password": "SecurePassword123!"}
        response2 = await test_client.post("/api/v1/auth/signup", json=signup_data)
        assert response2.status_code == 429
        
        result = response2.json()
        assert "Too many signup attempts" in result["detail"]
    
    @pytest.mark.asyncio
    async def test_signin_rate_limiting_integration(self, test_client: AsyncClient, mock_redis):
        """Test signin rate limiting with actual request patterns."""
        # First request - should succeed
        mock_redis.get.return_value = None
        mock_redis.incr.return_value = 1
        mock_redis.expire.return_value = True
        
        signin_data = {"email": "test@example.com", "password": "admin123"}
        response1 = await test_client.post("/api/v1/auth/signin", json=signin_data)
        assert response1.status_code == 200
        
        # Simulate rate limit exceeded
        mock_redis.get.return_value = "15"  # Over limit
        
        response2 = await test_client.post("/api/v1/auth/signin", json=signin_data)
        assert response2.status_code == 429
        
        result = response2.json()
        assert "Too many signin attempts" in result["detail"]


class TestErrorHandlingIntegration:
    """Test error handling across authentication flows."""
    
    @pytest.mark.asyncio
    async def test_invalid_token_handling(self, test_client: AsyncClient):
        """Test handling of invalid authentication tokens."""
        invalid_headers = {"Authorization": "Bearer invalid_token_123"}
        
        response = await test_client.get("/api/v1/auth/me", headers=invalid_headers)
        assert response.status_code == 403
        
        result = response.json()
        assert "Not authenticated" in result["detail"]
    
    @pytest.mark.asyncio
    async def test_malformed_request_handling(self, test_client: AsyncClient):
        """Test handling of malformed requests."""
        # Invalid JSON
        response = await test_client.post(
            "/api/v1/auth/signup",
            content="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
        
        # Missing required fields
        incomplete_data = {"email": "test@example.com"}  # Missing password
        response = await test_client.post("/api/v1/auth/signup", json=incomplete_data)
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_cross_endpoint_error_consistency(self, test_client: AsyncClient):
        """Test that error responses are consistent across endpoints."""
        endpoints_to_test = [
            "/api/v1/auth/signup",
            "/api/v1/auth/signin",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password"
        ]
        
        for endpoint in endpoints_to_test:
            # Test with invalid JSON
            response = await test_client.post(
                endpoint,
                content="invalid json",
                headers={"Content-Type": "application/json"}
            )
            assert response.status_code == 422
            
            # All should return JSON error responses
            assert response.headers["content-type"] == "application/json"


class TestMultiTenantIntegration:
    """Test multi-tenant functionality integration."""
    
    @pytest.mark.asyncio
    async def test_tenant_isolated_signup_signin(self, test_client: AsyncClient, mock_redis):
        """Test that tenant isolation works across signup/signin."""
        # Mock rate limiting
        mock_redis.get.return_value = None
        mock_redis.incr.return_value = 1
        mock_redis.expire.return_value = True
        
        # Signup with tenant A
        signup_data_a = {
            "email": "user@example.com",
            "password": "SecurePassword123!",
            "name": "Tenant A User",
            "tenant_id": "tenant_a"
        }
        
        response_a = await test_client.post("/api/v1/auth/signup", json=signup_data_a)
        assert response_a.status_code == 200
        
        # Signup same email with tenant B
        signup_data_b = {
            "email": "user@example.com",
            "password": "SecurePassword456!",
            "name": "Tenant B User", 
            "tenant_id": "tenant_b"
        }
        
        response_b = await test_client.post("/api/v1/auth/signup", json=signup_data_b)
        assert response_b.status_code == 200
        
        # Signin with tenant A credentials
        signin_data_a = {
            "email": "user@example.com",
            "password": "SecurePassword123!",
            "tenant_id": "tenant_a"
        }
        
        signin_response_a = await test_client.post("/api/v1/auth/signin", json=signin_data_a)
        assert signin_response_a.status_code == 200
        
        # Signin with tenant B credentials
        signin_data_b = {
            "email": "user@example.com", 
            "password": "SecurePassword456!",
            "tenant_id": "tenant_b"
        }
        
        signin_response_b = await test_client.post("/api/v1/auth/signin", json=signin_data_b)
        assert signin_response_b.status_code == 200
        
        # Verify different tokens for different tenants
        token_a = signin_response_a.json()["access_token"]
        token_b = signin_response_b.json()["access_token"]
        assert token_a != token_b