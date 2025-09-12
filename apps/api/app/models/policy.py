"""
Policy models for OPA-compatible authorization system.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, JSON, DateTime, Boolean, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.database import Base


class PolicyEffect(str, Enum):
    ALLOW = "allow"
    DENY = "deny"


class PolicyTarget(str, Enum):
    USER = "user"
    ROLE = "role"
    ORGANIZATION = "organization"
    RESOURCE = "resource"


class Policy(Base):
    """
    OPA-compatible policy model for fine-grained authorization.
    """
    __tablename__ = "policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    version = Column(Integer, default=1)
    
    # Policy rules in OPA Rego format or JSON
    rules = Column(JSON, nullable=False)
    
    # Policy metadata
    effect = Column(String(10), default=PolicyEffect.ALLOW.value)
    priority = Column(Integer, default=0)  # Higher priority policies override lower
    enabled = Column(Boolean, default=True)
    
    # Target specification
    target_type = Column(String(50))
    target_id = Column(String(255))  # Can be user_id, role_id, org_id, etc.
    
    # Resource specification
    resource_type = Column(String(100))  # e.g., "api", "dashboard", "document"
    resource_pattern = Column(String(500))  # e.g., "/api/v1/users/*"
    
    # Actions allowed/denied
    actions = Column(JSON)  # ["read", "write", "delete", etc.]
    
    # Conditions (additional context for evaluation)
    conditions = Column(JSON)  # {"ip_range": "192.168.1.0/24", "time_window": {...}}
    
    # Compiled WASM for edge evaluation (optional)
    compiled_wasm = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="policies")
    evaluations = relationship("PolicyEvaluation", back_populates="policy")


class PolicyEvaluation(Base):
    """
    Audit log of policy evaluations for compliance and debugging.
    """
    __tablename__ = "policy_evaluations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id"), nullable=False)
    
    # Evaluation context
    subject = Column(String(255), nullable=False)  # User or service making request
    action = Column(String(100), nullable=False)  # Action attempted
    resource = Column(String(500), nullable=False)  # Resource accessed
    context = Column(JSON)  # Additional context data
    
    # Evaluation result
    allowed = Column(Boolean, nullable=False)
    reasons = Column(JSON)  # Explanation of decision
    applied_policies = Column(JSON)  # List of policy IDs that were evaluated
    
    # Performance metrics
    evaluation_time_ms = Column(Integer)  # Time taken to evaluate
    
    # Timestamp
    evaluated_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    policy = relationship("Policy", back_populates="evaluations")


class Role(Base):
    """
    Role model for RBAC (Role-Based Access Control).
    """
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Permissions granted by this role
    permissions = Column(JSON, nullable=False, default=list)
    
    # Whether this is a system role (cannot be deleted)
    is_system = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="roles")
    organization = relationship("Organization", back_populates="roles")
    user_roles = relationship("UserRole", back_populates="role")
    role_policies = relationship("RolePolicy", back_populates="role")


class UserRole(Base):
    """
    Many-to-many relationship between users and roles.
    """
    __tablename__ = "user_roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=True)
    
    # Scope of the role assignment
    scope = Column(String(50), default="organization")  # organization, tenant, global
    
    # Timestamps
    assigned_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")
    organization = relationship("Organization", back_populates="user_roles")


class RolePolicy(Base):
    """
    Many-to-many relationship between roles and policies.
    """
    __tablename__ = "role_policies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    policy_id = Column(UUID(as_uuid=True), ForeignKey("policies.id"), nullable=False)
    
    # Priority for this specific binding
    priority = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    role = relationship("Role", back_populates="role_policies")
    policy = relationship("Policy", back_populates="role_policies")


# Pydantic models for API

class PolicyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    rules: Dict[str, Any]
    effect: PolicyEffect = PolicyEffect.ALLOW
    priority: int = 0
    target_type: Optional[PolicyTarget] = None
    target_id: Optional[str] = None
    resource_type: Optional[str] = None
    resource_pattern: Optional[str] = None
    actions: Optional[List[str]] = None
    conditions: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None


class PolicyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    rules: Optional[Dict[str, Any]] = None
    effect: Optional[PolicyEffect] = None
    priority: Optional[int] = None
    enabled: Optional[bool] = None
    conditions: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None


class PolicyResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    description: Optional[str]
    version: int
    rules: Dict[str, Any]
    effect: str
    priority: int
    enabled: bool
    target_type: Optional[str]
    target_id: Optional[str]
    resource_type: Optional[str]
    resource_pattern: Optional[str]
    actions: Optional[List[str]]
    conditions: Optional[Dict[str, Any]]
    compiled_wasm: Optional[str]
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime]

    class Config:
        from_attributes = True


class PolicyEvaluateRequest(BaseModel):
    subject: str
    action: str
    resource: str
    context: Optional[Dict[str, Any]] = None


class PolicyEvaluateResponse(BaseModel):
    allowed: bool
    reasons: List[str]
    applied_policies: List[str]
    evaluation_time_ms: int


class RoleCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    permissions: List[str]
    organization_id: Optional[str] = None


class RoleResponse(BaseModel):
    id: str
    tenant_id: str
    organization_id: Optional[str]
    name: str
    description: Optional[str]
    permissions: List[str]
    is_system: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True