"""
Invitation models for organization member management.
"""

from typing import Optional, List
from datetime import datetime, timedelta
from enum import Enum
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
import secrets

from app.database import Base


class InvitationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    REVOKED = "revoked"


class Invitation(Base):
    """
    Model for organization invitations.
    """
    __tablename__ = "invitations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    
    # Invitation details
    email = Column(String(255), nullable=False)
    token = Column(String(255), unique=True, nullable=False, default=lambda: secrets.token_urlsafe(32))
    
    # Role to assign upon acceptance
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=True)
    role_name = Column(String(100))  # Fallback if role doesn't exist
    
    # Invitation metadata
    status = Column(String(20), default=InvitationStatus.PENDING.value)
    invited_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    message = Column(String(500))  # Optional message to invitee
    
    # Acceptance tracking
    accepted_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    
    # Expiration
    expires_at = Column(DateTime, nullable=False, default=lambda: datetime.utcnow() + timedelta(days=7))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Email tracking
    email_sent = Column(Boolean, default=False)
    email_sent_at = Column(DateTime, nullable=True)
    email_send_attempts = Column(Integer, default=0)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="invitations")
    organization = relationship("Organization", back_populates="invitations")
    inviter = relationship("User", foreign_keys=[invited_by], back_populates="sent_invitations")
    accepter = relationship("User", foreign_keys=[accepted_by], back_populates="accepted_invitations")
    role = relationship("Role", back_populates="invitations")
    
    @property
    def is_expired(self) -> bool:
        """Check if invitation has expired."""
        return datetime.utcnow() > self.expires_at
    
    @property
    def is_valid(self) -> bool:
        """Check if invitation is still valid for acceptance."""
        return (
            self.status == InvitationStatus.PENDING.value and
            not self.is_expired
        )
    
    def generate_invite_url(self, base_url: str) -> str:
        """Generate the invitation acceptance URL."""
        return f"{base_url}/invitations/accept?token={self.token}"


# Pydantic models for API

class InvitationCreate(BaseModel):
    """Request model for creating an invitation."""
    organization_id: str
    email: EmailStr
    role: Optional[str] = Field(None, description="Role name or ID to assign")
    message: Optional[str] = Field(None, max_length=500, description="Optional message to invitee")
    expires_in: Optional[int] = Field(None, ge=1, le=30, description="Days until expiration (default: 7)")


class InvitationUpdate(BaseModel):
    """Request model for updating an invitation."""
    role: Optional[str] = None
    message: Optional[str] = Field(None, max_length=500)
    expires_at: Optional[datetime] = None


class InvitationResponse(BaseModel):
    """Response model for invitation details."""
    id: str
    organization_id: str
    email: str
    role: Optional[str]
    status: str
    invited_by: str
    message: Optional[str]
    expires_at: datetime
    created_at: datetime
    invite_url: str
    email_sent: bool
    
    class Config:
        from_attributes = True


class InvitationAcceptRequest(BaseModel):
    """Request model for accepting an invitation."""
    token: str
    user_id: Optional[str] = Field(None, description="Existing user ID if already registered")
    password: Optional[str] = Field(None, min_length=8, description="Password for new user registration")
    name: Optional[str] = Field(None, description="Name for new user registration")


class InvitationAcceptResponse(BaseModel):
    """Response model for invitation acceptance."""
    success: bool
    message: str
    user_id: str
    organization_id: str
    role: Optional[str]
    redirect_url: Optional[str]


class InvitationListResponse(BaseModel):
    """Response model for listing invitations."""
    invitations: List[InvitationResponse]
    total: int
    pending_count: int
    accepted_count: int
    expired_count: int


class BulkInvitationCreate(BaseModel):
    """Request model for bulk invitations."""
    organization_id: str
    emails: List[EmailStr]
    role: Optional[str] = None
    message: Optional[str] = Field(None, max_length=500)
    expires_in: Optional[int] = Field(None, ge=1, le=30)


class BulkInvitationResponse(BaseModel):
    """Response model for bulk invitation creation."""
    successful: List[InvitationResponse]
    failed: List[dict]  # {"email": str, "error": str}
    total_sent: int
    total_failed: int