"""
Comprehensive test suite to achieve 100% coverage for Plinto API
"""

import pytest
import pytest_asyncio
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime, timedelta
import jwt
import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from httpx import AsyncClient
from fastapi import HTTPException

# Import all modules to test
from app.config import settings
from app.exceptions import (
    PlintoAPIException,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    ExternalServiceError
)
from app.models.user import User
from app.models.token import Token
from app.models.subscription import Subscription
from app.services.auth_service import AuthService
from app.services.jwt_service import JWTService
from app.services.billing_service import BillingService
from app.services.monitoring import MonitoringService
from app.services.audit_logger import AuditLogger
from app.middleware.rate_limit import RateLimitMiddleware
from app.core.database import get_db, AsyncSessionLocal
from app.core.redis import get_redis
from app.main import app


class TestCompleteAuthService:
    """100% coverage tests for AuthService"""
    
    @pytest.fixture
    def mock_db(self):
        db = AsyncMock(spec=AsyncSession)
        db.execute = AsyncMock()
        db.add = Mock()
        db.commit = AsyncMock()
        db.refresh = AsyncMock()
        db.rollback = AsyncMock()
        return db
    
    @pytest.fixture
    def mock_redis(self):
        redis = AsyncMock()
        redis.get = AsyncMock(return_value=None)
        redis.set = AsyncMock()
        redis.setex = AsyncMock()
        redis.delete = AsyncMock()
        redis.exists = AsyncMock(return_value=False)
        return redis
    
    @pytest.fixture
    def auth_service(self, mock_db, mock_redis):
        service = AuthService(db=mock_db, redis=mock_redis)
        service.jwt_service = Mock()
        service.jwt_service.create_access_token = Mock(return_value="access_token")
        service.jwt_service.create_refresh_token = Mock(return_value="refresh_token")
        return service
    
    @pytest.mark.asyncio
    async def test_create_user_success(self, auth_service, mock_db):
        """Test successful user creation"""
        mock_db.execute.return_value.scalar_one_or_none.return_value = None
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.email = "test@example.com"
        mock_db.execute.return_value.scalar_one.return_value = mock_user
        
        result = await auth_service.create_user(
            email="test@example.com",
            password="SecurePass123!",
            name="Test User",
            db=mock_db
        )
        
        assert result.id == "user123"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_user_email_exists(self, auth_service, mock_db):
        """Test user creation with existing email"""
        mock_db.execute.return_value.scalar_one_or_none.return_value = Mock()
        
        with pytest.raises(ConflictError):
            await auth_service.create_user(
                email="existing@example.com",
                password="SecurePass123!",
                name="Test User",
                db=mock_db
            )
    
    @pytest.mark.asyncio
    async def test_authenticate_user_success(self, auth_service, mock_db):
        """Test successful authentication"""
        mock_user = Mock(spec=User)
        mock_user.id = "user123"
        mock_user.email = "test@example.com"
        mock_user.password_hash = bcrypt.hashpw(b"SecurePass123!", bcrypt.gensalt())
        mock_user.is_active = True
        mock_user.email_verified = True
        
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
        
        result = await auth_service.authenticate_user(
            email="test@example.com",
            password="SecurePass123!",
            db=mock_db
        )
        
        assert result.id == "user123"
    
    @pytest.mark.asyncio
    async def test_authenticate_user_invalid_password(self, auth_service, mock_db):
        """Test authentication with wrong password"""
        mock_user = Mock(spec=User)
        mock_user.password_hash = bcrypt.hashpw(b"SecurePass123!", bcrypt.gensalt())
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
        
        with pytest.raises(AuthenticationError):
            await auth_service.authenticate_user(
                email="test@example.com",
                password="WrongPassword",
                db=mock_db
            )
    
    @pytest.mark.asyncio
    async def test_create_session(self, auth_service, mock_db, mock_redis):
        """Test session creation"""
        result = await auth_service.create_session(
            user_id="user123",
            db=mock_db
        )
        
        assert result["access_token"] == "access_token"
        assert result["refresh_token"] == "refresh_token"
        assert result["token_type"] == "bearer"
    
    @pytest.mark.asyncio
    async def test_refresh_session(self, auth_service, mock_redis):
        """Test session refresh"""
        auth_service.jwt_service.verify_token = Mock(return_value={
            "sub": "user123",
            "type": "refresh"
        })
        
        result = await auth_service.refresh_session("refresh_token")
        
        assert result["access_token"] == "access_token"
    
    @pytest.mark.asyncio
    async def test_revoke_session(self, auth_service, mock_redis):
        """Test session revocation"""
        auth_service.jwt_service.revoke_token = AsyncMock()
        
        await auth_service.revoke_session("access_token", "jti123")
        
        auth_service.jwt_service.revoke_token.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_verify_email(self, auth_service, mock_db):
        """Test email verification"""
        mock_user = Mock(spec=User)
        mock_user.email_verified = False
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
        
        await auth_service.verify_email(
            token="verification_token",
            db=mock_db
        )
        
        assert mock_user.email_verified == True
        mock_db.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_reset_password(self, auth_service, mock_db, mock_redis):
        """Test password reset"""
        mock_user = Mock(spec=User)
        mock_db.execute.return_value.scalar_one_or_none.return_value = mock_user
        mock_redis.get.return_value = b"user123"
        
        await auth_service.reset_password(
            token="reset_token",
            new_password="NewSecurePass123!",
            db=mock_db
        )
        
        assert mock_user.password_hash is not None
        mock_db.commit.assert_called_once()
        mock_redis.delete.assert_called_once()


class TestCompleteJWTService:
    """100% coverage tests for JWTService"""
    
    @pytest.fixture
    def jwt_service(self):
        with patch('app.services.jwt_service.settings') as mock_settings:
            mock_settings.JWT_SECRET_KEY = "test-secret"
            mock_settings.JWT_ALGORITHM = "HS256"
            mock_settings.ACCESS_TOKEN_EXPIRE_MINUTES = 30
            mock_settings.REFRESH_TOKEN_EXPIRE_DAYS = 30
            
            service = JWTService(db=Mock(), redis=Mock())
            return service
    
    def test_create_access_token(self, jwt_service):
        """Test access token creation"""
        token = jwt_service.create_access_token(
            subject="user123",
            claims={"role": "user"}
        )
        
        assert isinstance(token, str)
        decoded = jwt.decode(token, "test-secret", algorithms=["HS256"])
        assert decoded["sub"] == "user123"
        assert decoded["type"] == "access"
    
    def test_create_refresh_token(self, jwt_service):
        """Test refresh token creation"""
        token = jwt_service.create_refresh_token(
            subject="user123"
        )
        
        assert isinstance(token, str)
        decoded = jwt.decode(token, "test-secret", algorithms=["HS256"])
        assert decoded["sub"] == "user123"
        assert decoded["type"] == "refresh"
    
    def test_verify_token_valid(self, jwt_service):
        """Test valid token verification"""
        token = jwt_service.create_access_token("user123")
        payload = jwt_service.verify_token(token)
        
        assert payload["sub"] == "user123"
    
    def test_verify_token_invalid(self, jwt_service):
        """Test invalid token verification"""
        with pytest.raises(AuthenticationError):
            jwt_service.verify_token("invalid.token.here")
    
    def test_verify_token_expired(self, jwt_service):
        """Test expired token verification"""
        past_time = datetime.utcnow() - timedelta(hours=1)
        token = jwt.encode(
            {"sub": "user123", "exp": past_time},
            "test-secret",
            algorithm="HS256"
        )
        
        with pytest.raises(AuthenticationError):
            jwt_service.verify_token(token)
    
    @pytest.mark.asyncio
    async def test_revoke_token(self, jwt_service):
        """Test token revocation"""
        jwt_service.redis = AsyncMock()
        
        await jwt_service.revoke_token("token", "jti123")
        
        jwt_service.redis.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_is_token_blacklisted(self, jwt_service):
        """Test token blacklist check"""
        jwt_service.redis = AsyncMock()
        jwt_service.redis.exists.return_value = True
        
        result = await jwt_service.is_token_blacklisted("jti123")
        
        assert result == True
    
    def test_get_jwks(self, jwt_service):
        """Test JWKS endpoint"""
        jwks = jwt_service.get_jwks()
        
        assert "keys" in jwks
        assert len(jwks["keys"]) > 0


class TestCompleteBillingService:
    """100% coverage tests for BillingService"""
    
    @pytest.fixture
    def billing_service(self):
        service = BillingService(db=Mock(), redis=Mock())
        service.stripe = Mock()
        return service
    
    @pytest.mark.asyncio
    async def test_create_subscription(self, billing_service):
        """Test subscription creation"""
        billing_service.stripe.Subscription.create = Mock(return_value={
            "id": "sub_123",
            "status": "active"
        })
        
        result = await billing_service.create_subscription(
            user_id="user123",
            plan_id="plan_pro"
        )
        
        assert result["id"] == "sub_123"
        assert result["status"] == "active"
    
    @pytest.mark.asyncio
    async def test_cancel_subscription(self, billing_service):
        """Test subscription cancellation"""
        billing_service.stripe.Subscription.delete = Mock(return_value={
            "id": "sub_123",
            "status": "canceled"
        })
        
        result = await billing_service.cancel_subscription("sub_123")
        
        assert result["status"] == "canceled"
    
    @pytest.mark.asyncio
    async def test_update_subscription(self, billing_service):
        """Test subscription update"""
        billing_service.stripe.Subscription.modify = Mock(return_value={
            "id": "sub_123",
            "items": [{"price": "price_new"}]
        })
        
        result = await billing_service.update_subscription(
            subscription_id="sub_123",
            new_plan_id="plan_enterprise"
        )
        
        assert result["id"] == "sub_123"
    
    @pytest.mark.asyncio
    async def test_get_subscription_status(self, billing_service):
        """Test getting subscription status"""
        billing_service.db = AsyncMock()
        mock_sub = Mock(spec=Subscription)
        mock_sub.status = "active"
        billing_service.db.execute.return_value.scalar_one_or_none.return_value = mock_sub
        
        status = await billing_service.get_subscription_status("user123")
        
        assert status == "active"


class TestCompleteMonitoring:
    """100% coverage tests for MonitoringService"""
    
    @pytest.fixture
    def monitoring_service(self):
        service = MonitoringService()
        service.metrics = Mock()
        service.logger = Mock()
        return service
    
    def test_track_request(self, monitoring_service):
        """Test request tracking"""
        monitoring_service.track_request(
            path="/api/users",
            method="GET",
            duration=0.125,
            status_code=200
        )
        
        monitoring_service.metrics.histogram.assert_called_once()
    
    def test_track_error(self, monitoring_service):
        """Test error tracking"""
        monitoring_service.track_error(
            error_type="ValidationError",
            message="Invalid input",
            path="/api/users"
        )
        
        monitoring_service.metrics.counter.assert_called_once()
        monitoring_service.logger.error.assert_called_once()
    
    def test_track_business_event(self, monitoring_service):
        """Test business event tracking"""
        monitoring_service.track_business_event(
            event_type="user_signup",
            user_id="user123",
            metadata={"plan": "pro"}
        )
        
        monitoring_service.metrics.counter.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_health_check(self, monitoring_service):
        """Test health check"""
        monitoring_service.check_database = AsyncMock(return_value=True)
        monitoring_service.check_redis = AsyncMock(return_value=True)
        monitoring_service.check_external_services = AsyncMock(return_value=True)
        
        health = await monitoring_service.health_check()
        
        assert health["status"] == "healthy"
        assert health["database"] == "healthy"
        assert health["redis"] == "healthy"


class TestCompleteRateLimiting:
    """100% coverage tests for RateLimitMiddleware"""
    
    @pytest.fixture
    def middleware(self):
        app = Mock()
        middleware = RateLimitMiddleware(app)
        middleware.redis = AsyncMock()
        return middleware
    
    @pytest.mark.asyncio
    async def test_rate_limit_allows(self, middleware):
        """Test allowing requests under limit"""
        request = Mock()
        request.client.host = "127.0.0.1"
        request.url.path = "/api/users"
        
        middleware.redis.get.return_value = b"5"
        middleware.redis.incr.return_value = 6
        middleware.redis.expire.return_value = True
        
        call_next = AsyncMock()
        response = Mock()
        call_next.return_value = response
        
        result = await middleware.dispatch(request, call_next)
        
        assert result == response
    
    @pytest.mark.asyncio
    async def test_rate_limit_blocks(self, middleware):
        """Test blocking excessive requests"""
        request = Mock()
        request.client.host = "127.0.0.1"
        request.url.path = "/api/users"
        
        middleware.redis.get.return_value = b"100"
        
        call_next = AsyncMock()
        
        with pytest.raises(HTTPException) as exc:
            await middleware.dispatch(request, call_next)
        
        assert exc.value.status_code == 429
    
    @pytest.mark.asyncio
    async def test_rate_limit_redis_failure(self, middleware):
        """Test graceful degradation when Redis fails"""
        request = Mock()
        request.client.host = "127.0.0.1"
        request.url.path = "/api/users"
        
        middleware.redis.get.side_effect = Exception("Redis connection failed")
        
        call_next = AsyncMock()
        response = Mock()
        call_next.return_value = response
        
        result = await middleware.dispatch(request, call_next)
        
        assert result == response  # Should allow request when Redis fails


class TestCompleteAuditLogger:
    """100% coverage tests for AuditLogger"""
    
    @pytest.fixture
    def audit_logger(self):
        logger = AuditLogger(db=Mock())
        return logger
    
    @pytest.mark.asyncio
    async def test_log_authentication(self, audit_logger):
        """Test authentication logging"""
        audit_logger.db = AsyncMock()
        
        await audit_logger.log_authentication(
            user_id="user123",
            event_type="login",
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0"
        )
        
        audit_logger.db.execute.assert_called_once()
        audit_logger.db.commit.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_log_authorization(self, audit_logger):
        """Test authorization logging"""
        audit_logger.db = AsyncMock()
        
        await audit_logger.log_authorization(
            user_id="user123",
            resource="api:users:read",
            action="grant",
            ip_address="127.0.0.1"
        )
        
        audit_logger.db.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_log_data_access(self, audit_logger):
        """Test data access logging"""
        audit_logger.db = AsyncMock()
        
        await audit_logger.log_data_access(
            user_id="user123",
            resource_type="user_profile",
            resource_id="profile456",
            action="read"
        )
        
        audit_logger.db.execute.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_log_security_event(self, audit_logger):
        """Test security event logging"""
        audit_logger.db = AsyncMock()
        
        await audit_logger.log_security_event(
            event_type="suspicious_activity",
            user_id="user123",
            details={"attempts": 5},
            severity="high"
        )
        
        audit_logger.db.execute.assert_called_once()


class TestCompleteExceptions:
    """100% coverage tests for all exception classes"""
    
    def test_plinto_api_exception(self):
        """Test base exception"""
        exc = PlintoAPIException("Test error", status_code=400)
        assert exc.message == "Test error"
        assert exc.status_code == 400
        assert exc.error_code == "PLINTOAPIEXCEPTION"
    
    def test_authentication_error(self):
        """Test authentication error"""
        exc = AuthenticationError("Invalid credentials")
        assert exc.status_code == 401
        assert exc.error_code == "AUTHENTICATION_ERROR"
    
    def test_authorization_error(self):
        """Test authorization error"""
        exc = AuthorizationError("Access denied")
        assert exc.status_code == 403
        assert exc.error_code == "AUTHORIZATION_ERROR"
    
    def test_validation_error(self):
        """Test validation error"""
        exc = ValidationError("Invalid input")
        assert exc.status_code == 422
        assert exc.error_code == "VALIDATION_ERROR"
    
    def test_not_found_error(self):
        """Test not found error"""
        exc = NotFoundError("Resource not found")
        assert exc.status_code == 404
        assert exc.error_code == "NOT_FOUND"
    
    def test_conflict_error(self):
        """Test conflict error"""
        exc = ConflictError("Resource exists")
        assert exc.status_code == 409
        assert exc.error_code == "CONFLICT"
    
    def test_rate_limit_error(self):
        """Test rate limit error"""
        exc = RateLimitError("Too many requests")
        assert exc.status_code == 429
        assert exc.error_code == "RATE_LIMIT_EXCEEDED"
    
    def test_external_service_error(self):
        """Test external service error"""
        exc = ExternalServiceError("Service unavailable")
        assert exc.status_code == 503
        assert exc.error_code == "EXTERNAL_SERVICE_ERROR"


class TestCompleteIntegration:
    """Integration tests for 100% coverage"""
    
    @pytest.mark.asyncio
    async def test_full_auth_flow(self):
        """Test complete authentication flow"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            # Health check
            response = await client.get("/health")
            assert response.status_code == 200
            
            # OpenID configuration
            response = await client.get("/.well-known/openid-configuration")
            assert response.status_code == 200
            assert "issuer" in response.json()
    
    @pytest.mark.asyncio
    async def test_api_error_handling(self):
        """Test API error handling"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            # Test 404
            response = await client.get("/nonexistent")
            assert response.status_code == 404
            
            # Test validation error
            response = await client.post("/auth/signup", json={})
            assert response.status_code == 422


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--cov=app", "--cov-report=term-missing", "--cov-report=html"])