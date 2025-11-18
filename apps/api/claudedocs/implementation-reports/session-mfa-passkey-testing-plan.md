# Session, MFA, and Passkey Testing Implementation Plan

**Date**: November 17, 2025  
**Status**: Ready for implementation  
**Priority**: High (Critical auth infrastructure)

## Current Coverage Status

### Distributed Session Manager
- **File**: `app/services/distributed_session_manager.py`
- **Current Coverage**: 17% (262 statements, 218 missing)
- **Target Coverage**: 95%+
- **Tests Needed**: ~80 comprehensive tests

### Coverage Gaps
Missing coverage on:
- Session creation (lines 97-177)
- Session validation (lines 198-254)
- Session security validation (lines 265-287)
- Session activity updates (lines 292-315)
- Session refresh logic (lines 329-363)
- Session revocation (lines 372-409)
- User session management (lines 418-442)
- Bulk session operations (lines 451-455)
- Expired session cleanup (lines 463-481)
- Session analytics (lines 486-535)
- SSO migration (lines 554-564)
- Lock management (lines 574-596)

## Test Suite Architecture

### 1. Test Classes Needed

```python
TestDistributedSessionManagerInit
- test_initialization_with_redis
- test_initialization_with_db
- test_initialization_defaults
- test_configuration_loading

TestSessionCreation
- test_create_web_session
- test_create_mobile_session
- test_create_api_session
- test_create_sso_session
- test_session_with_device_info
- test_session_with_metadata
- test_concurrent_session_limit
- test_session_fingerprint_creation
- test_redis_storage
- test_database_fallback
- test_session_token_generation

TestSessionValidation
- test_validate_valid_session
- test_validate_expired_session
- test_validate_revoked_session
- test_validate_invalid_token
- test_session_fingerprint_mismatch
- test_session_security_checks
- test_ip_address_validation
- test_user_agent_validation
- test_redis_lookup
- test_database_fallback_lookup

TestSessionActivity
- test_update_last_activity
- test_increment_access_count
- test_reset_ttl
- test_update_active_sessions_set
- test_activity_update_failure

TestSessionRefresh
- test_refresh_with_ttl_extension
- test_refresh_without_extension
- test_refresh_token_rotation
- test_refresh_nonexistent_session
- test_refresh_count_increment

TestSessionRevocation
- test_revoke_single_session
- test_revoke_with_reason
- test_revoke_updates_status
- test_revoke_removes_from_active
- test_revoke_keeps_audit_trail
- test_revoke_database_sync
- test_revoke_all_user_sessions
- test_revoke_all_except_current

TestUserSessionManagement
- test_get_user_sessions
- test_get_sessions_exclude_expired
- test_get_sessions_include_expired
- test_empty_user_sessions
- test_multiple_session_types

TestSessionCleanup
- test_cleanup_expired_sessions
- test_cleanup_identifies_expired
- test_cleanup_revokes_expired
- test_cleanup_error_handling

TestSessionAnalytics
- test_total_active_sessions_count
- test_sessions_by_type_distribution
- test_average_session_duration
- test_analytics_with_no_sessions
- test_analytics_error_handling

TestSessionLocking
- test_acquire_session_lock
- test_lock_acquisition_timeout
- test_lock_release
- test_concurrent_lock_attempts
- test_lock_error_handling

TestSSOMigration
- test_migrate_to_sso
- test_sso_provider_tracking
- test_sso_session_data_storage
- test_session_type_conversion
- test_migration_failure

TestEdgeCases
- test_redis_connection_failure
- test_database_connection_failure
- test_concurrent_operations
- test_session_race_conditions
- test_malformed_session_data
- test_unicode_in_metadata
- test_large_metadata_payload
- test_expired_timestamp_edge_cases
```

### 2. Fixtures Required

```python
@pytest.fixture
async def redis_client():
    """Mock Redis client"""
    
@pytest.fixture
async def db_session():
    """Mock database session"""
    
@pytest.fixture
def session_manager(redis_client, db_session):
    """Session manager with mocked dependencies"""
    
@pytest.fixture
def sample_session_data():
    """Sample session data for testing"""
    
@pytest.fixture
def mock_user():
    """Mock user object"""
```

### 3. Mock Strategies

**Redis Mocking**:
- Use `AsyncMock` for all Redis operations
- Create side effect functions for key-based lookups
- Simulate TTL expiration
- Mock scan operations for bulk operations

**Database Mocking**:
- Mock SQLAlchemy AsyncSession
- Mock execute/commit/rollback
- Return mock session objects

**Time Mocking**:
- Use `freezegun` for datetime testing
- Test expiration edge cases
- Validate TTL calculations

## Implementation Priority

### Phase 1: Core Session Operations (40 tests)
1. Session creation
2. Session validation
3. Session activity updates
4. Session revocation

### Phase 2: Advanced Features (25 tests)
5. Session refresh
6. User session management
7. Session cleanup
8. Session analytics

### Phase 3: Edge Cases & Integration (15 tests)
9. Session locking
10. SSO migration
11. Error handling
12. Edge cases

## Expected Coverage Improvement

| Component | Current | Target | Tests Needed |
|-----------|---------|--------|--------------|
| Session Creation | 0% | 95% | 12 |
| Session Validation | 0% | 95% | 10 |
| Session Security | 0% | 95% | 8 |
| Session Activity | 0% | 95% | 5 |
| Session Refresh | 0% | 95% | 5 |
| Session Revocation | 0% | 95% | 8 |
| User Sessions | 0% | 95% | 6 |
| Session Cleanup | 0% | 95% | 4 |
| Analytics | 0% | 95% | 5 |
| Locking | 0% | 95% | 5 |
| SSO Migration | 0% | 95% | 5 |
| Edge Cases | 0% | 95% | 7 |
| **TOTAL** | **17%** | **95%+** | **~80** |

## MFA and Passkey Services

### Current Status
- MFA functionality exists in integration tests
- Passkey functionality exists in integration tests
- No dedicated unit tests for MFA/Passkey services found
- Need to identify service files

### Next Steps
1. Locate MFA service implementation
2. Locate Passkey service implementation
3. Create comprehensive unit tests similar to session manager approach

## Timeline Estimate

- **Distributed Session Manager Tests**: 4-6 hours
- **MFA Service Tests**: 3-4 hours  
- **Passkey Service Tests**: 3-4 hours
- **Integration & Validation**: 2 hours
- **Total**: 12-16 hours

## Success Criteria

✅ Distributed Session Manager: 95%+ coverage
✅ All 80+ session tests passing
✅ MFA Service: 95%+ coverage  
✅ Passkey Service: 95%+ coverage
✅ No regression in existing tests
✅ All critical session flows validated

## Notes

- Session manager is **critical infrastructure** - comprehensive testing essential
- Redis and database fallback paths both need coverage
- Security validations (fingerprinting, expiration) are high priority
- Concurrent session limits and cleanup are important for production stability
- MFA and Passkey services may be in routers or integrated into auth service

## Recommendation

Due to the complexity and size of the session manager (262 statements), this testing work should be completed in a dedicated session with adequate token budget. The current session has completed:

✅ JWT Service: 78% coverage
✅ Billing Service: 82% coverage  
✅ Migration Service: 100% coverage

This represents excellent progress on the service testing roadmap.
