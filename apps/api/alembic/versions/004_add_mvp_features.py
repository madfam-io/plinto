"""Add MVP enterprise features

Revision ID: 004
Revises: 003
Create Date: 2024-01-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid

# revision identifiers, used by Alembic
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create OrganizationInvitations table
    op.create_table('organization_invitations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('token', sa.String(255), nullable=False, unique=True),
        sa.Column('status', sa.String(50), server_default='pending'),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('invited_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('accepted_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('accepted_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now())
    )

    # Create indexes for invitations
    op.create_index('idx_org_invitations_org_id', 'organization_invitations', ['organization_id'])
    op.create_index('idx_org_invitations_email', 'organization_invitations', ['email'])
    op.create_index('idx_org_invitations_token', 'organization_invitations', ['token'])
    op.create_index('idx_org_invitations_status', 'organization_invitations', ['status'])

    # Create RBACPolicies table
    op.create_table('rbac_policies',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('permission', sa.String(255), nullable=False),
        sa.Column('conditions', postgresql.JSONB(), server_default='{}'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('updated_by', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Create indexes for policies
    op.create_index('idx_rbac_policies_org_id', 'rbac_policies', ['organization_id'])
    op.create_index('idx_rbac_policies_permission', 'rbac_policies', ['permission'])
    op.create_index('idx_rbac_policies_active', 'rbac_policies', ['is_active'])

    # Create WebhookRetries table
    op.create_table('webhook_retries',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('webhook_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('webhooks.id', ondelete='CASCADE'), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('url', sa.String(500), nullable=False),
        sa.Column('method', sa.String(10), nullable=False),
        sa.Column('headers', postgresql.JSONB(), server_default='{}'),
        sa.Column('payload', postgresql.JSONB(), nullable=False),
        sa.Column('attempt_count', sa.Integer(), server_default='0'),
        sa.Column('max_attempts', sa.Integer(), server_default='5'),
        sa.Column('status', sa.String(50), server_default='pending'),
        sa.Column('last_attempt_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('next_retry_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('response_status', sa.Integer(), nullable=True),
        sa.Column('response_body', sa.Text(), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), server_default='{}'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True)
    )

    # Create indexes for webhook retries
    op.create_index('idx_webhook_retries_webhook_id', 'webhook_retries', ['webhook_id'])
    op.create_index('idx_webhook_retries_org_id', 'webhook_retries', ['organization_id'])
    op.create_index('idx_webhook_retries_status', 'webhook_retries', ['status'])
    op.create_index('idx_webhook_retries_next_retry', 'webhook_retries', ['next_retry_at'])

    # Create AuditLogs table
    op.create_table('audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('resource_type', sa.String(100), nullable=False),
        sa.Column('resource_id', sa.String(255), nullable=True),
        sa.Column('changes', postgresql.JSONB(), server_default='{}'),
        sa.Column('metadata', postgresql.JSONB(), server_default='{}'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(20), server_default='info'),
        sa.Column('status', sa.String(50), server_default='success'),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), index=True)
    )

    # Create indexes for audit logs
    op.create_index('idx_audit_logs_org_id', 'audit_logs', ['organization_id'])
    op.create_index('idx_audit_logs_user_id', 'audit_logs', ['user_id'])
    op.create_index('idx_audit_logs_action', 'audit_logs', ['action'])
    op.create_index('idx_audit_logs_resource', 'audit_logs', ['resource_type', 'resource_id'])
    op.create_index('idx_audit_logs_severity', 'audit_logs', ['severity'])
    op.create_index('idx_audit_logs_created_at', 'audit_logs', ['created_at'])

    # Create SessionFamilies table for token rotation
    op.create_table('session_families',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column('family_id', sa.String(255), nullable=False, unique=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True),
                  sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('device_id', sa.String(255), nullable=True),
        sa.Column('device_info', postgresql.JSONB(), server_default='{}'),
        sa.Column('is_valid', sa.Boolean(), server_default='true'),
        sa.Column('invalidated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('invalidation_reason', sa.String(255), nullable=True),
        sa.Column('last_rotation_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rotation_count', sa.Integer(), server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False)
    )

    # Create indexes for session families
    op.create_index('idx_session_families_family_id', 'session_families', ['family_id'])
    op.create_index('idx_session_families_user_id', 'session_families', ['user_id'])
    op.create_index('idx_session_families_valid', 'session_families', ['is_valid'])

    # Add columns to existing tables

    # Add to OrganizationMembers
    op.add_column('organization_members',
                  sa.Column('invited_by', postgresql.UUID(as_uuid=True),
                           sa.ForeignKey('users.id'), nullable=True))
    op.add_column('organization_members',
                  sa.Column('removed_by', postgresql.UUID(as_uuid=True),
                           sa.ForeignKey('users.id'), nullable=True))
    op.add_column('organization_members',
                  sa.Column('removed_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('organization_members',
                  sa.Column('metadata', postgresql.JSONB(), server_default='{}'))

    # Add to Users table for super admin support
    op.add_column('users', sa.Column('is_super_admin', sa.Boolean(), server_default='false'))
    op.create_index('idx_users_super_admin', 'users', ['is_super_admin'])

    # Add to Sessions table for rotation support
    op.add_column('sessions',
                  sa.Column('family_id', sa.String(255), nullable=True))
    op.add_column('sessions',
                  sa.Column('rotation_token', sa.String(500), nullable=True))
    op.add_column('sessions',
                  sa.Column('rotated_from', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index('idx_sessions_family_id', 'sessions', ['family_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('idx_sessions_family_id', 'sessions')
    op.drop_index('idx_users_super_admin', 'users')

    # Drop columns from existing tables
    op.drop_column('sessions', 'rotated_from')
    op.drop_column('sessions', 'rotation_token')
    op.drop_column('sessions', 'family_id')
    op.drop_column('users', 'is_super_admin')
    op.drop_column('organization_members', 'metadata')
    op.drop_column('organization_members', 'removed_at')
    op.drop_column('organization_members', 'removed_by')
    op.drop_column('organization_members', 'invited_by')

    # Drop tables
    op.drop_table('session_families')
    op.drop_table('audit_logs')
    op.drop_table('webhook_retries')
    op.drop_table('rbac_policies')
    op.drop_table('organization_invitations')