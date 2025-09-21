"""
External Dependencies Mock Fixtures
Centralized mocking for all external services to eliminate duplication across test files.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch


@pytest.fixture(autouse=True, scope="session")
def mock_all_external_dependencies():
    """Mock all external dependencies comprehensively"""
    mocked_modules = {
        'aioredis': Mock(),
        'aioredis.client': Mock(),
        'aioredis.connection': Mock(),
        'aioredis.exceptions': Mock(),
        'redis': Mock(),
        'redis.asyncio': Mock(),
        'redis.client': Mock(),
        'celery': Mock(),
        'celery.result': Mock(),
        'celery.exceptions': Mock(),
        'boto3': Mock(),
        'botocore': Mock(),
        'botocore.exceptions': Mock(),
        'stripe': Mock(),
        'stripe.error': Mock(),
        'twilio': Mock(),
        'twilio.rest': Mock(),
        'sendgrid': Mock(),
        'sendgrid.helpers': Mock(),
        'slack_sdk': Mock(),
        'slack_sdk.webhook': Mock(),
        'requests': Mock(),
        'httpx': Mock(),
        'psycopg2': Mock(),
        'psycopg2.extras': Mock(),
        'psycopg2.pool': Mock(),
        'sqlalchemy': Mock(),
        'sqlalchemy.ext': Mock(),
        'sqlalchemy.ext.asyncio': Mock(),
        'sqlalchemy.orm': Mock(),
        'passlib': Mock(),
        'passlib.context': Mock(),
        'jwt': Mock(),
        'cryptography': Mock()
    }

    with patch.dict('sys.modules', mocked_modules):
        yield


@pytest.fixture
def mock_db_session():
    """Mock database session for testing"""
    return AsyncMock()


@pytest.fixture
def mock_redis_client():
    """Mock Redis client for testing"""
    mock_redis = AsyncMock()
    mock_redis.get.return_value = None
    mock_redis.set.return_value = True
    mock_redis.delete.return_value = 1
    mock_redis.exists.return_value = False
    return mock_redis


@pytest.fixture
def mock_email_service():
    """Mock email service for notification testing"""
    mock_service = AsyncMock()
    mock_service.send_email.return_value = {"message_id": "test-123", "status": "sent"}
    return mock_service


@pytest.fixture
def mock_webhook_service():
    """Mock webhook service for notification testing"""
    mock_service = AsyncMock()
    mock_service.send_webhook.return_value = {"status": "delivered", "response_code": 200}
    return mock_service


@pytest.fixture
def mock_slack_client():
    """Mock Slack client for notification testing"""
    mock_client = AsyncMock()
    mock_client.chat_postMessage.return_value = {"ok": True, "ts": "1234567890.123"}
    return mock_client


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "id": "test-user-123",
        "email": "test@example.com",
        "name": "Test User",
        "role": "user",
        "organization_id": "test-org-123",
        "created_at": "2023-01-01T00:00:00Z",
        "is_active": True
    }


@pytest.fixture
def sample_organization_data():
    """Sample organization data for testing"""
    return {
        "id": "test-org-123",
        "name": "Test Organization",
        "domain": "test.example.com",
        "plan": "enterprise",
        "created_at": "2023-01-01T00:00:00Z",
        "settings": {
            "sso_enabled": True,
            "mfa_required": True
        }
    }


@pytest.fixture
def sample_alert_data():
    """Sample alert data for testing"""
    return {
        "id": "alert-123",
        "title": "Test Alert",
        "description": "Test alert description",
        "severity": "high",
        "status": "active",
        "created_at": "2023-01-01T00:00:00Z",
        "conditions": {
            "metric": "error_rate",
            "threshold": 0.05,
            "operator": ">"
        }
    }


@pytest.fixture
def sample_compliance_data():
    """Sample compliance data for testing"""
    return {
        "control_id": "SOC2-CC1.1",
        "title": "Control Environment",
        "description": "Entity demonstrates commitment to integrity and ethical values",
        "status": "implemented",
        "evidence": ["policy_doc.pdf", "training_records.xlsx"],
        "last_tested": "2023-01-01T00:00:00Z",
        "next_review": "2023-07-01T00:00:00Z"
    }