"""
Subscription Model
"""

from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Integer, Float, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class SubscriptionStatus(str, enum.Enum):
    """Subscription status enum"""
    ACTIVE = "active"
    PAUSED = "paused"
    CANCELED = "canceled"
    EXPIRED = "expired"
    TRIALING = "trialing"
    PAST_DUE = "past_due"


class SubscriptionProvider(str, enum.Enum):
    """Payment provider enum"""
    CONEKTA = "conekta"
    FUNGIES = "fungies"
    STRIPE = "stripe"  # For future use


class Subscription(Base):
    """Subscription model for tracking tenant subscriptions"""
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id'), nullable=False, index=True)
    
    # Provider information
    provider = Column(Enum(SubscriptionProvider), nullable=False)
    provider_subscription_id = Column(String, unique=True, index=True)
    provider_customer_id = Column(String, index=True)
    
    # Plan details
    plan_id = Column(String, nullable=False)  # pro, scale, enterprise
    plan_name = Column(String)
    price_amount = Column(Float)
    price_currency = Column(String, default="USD")
    billing_interval = Column(String)  # monthly, yearly
    
    # Status
    status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False, index=True)
    
    # Dates
    trial_start_at = Column(DateTime(timezone=True))
    trial_end_at = Column(DateTime(timezone=True))
    current_period_start = Column(DateTime(timezone=True))
    current_period_end = Column(DateTime(timezone=True))
    canceled_at = Column(DateTime(timezone=True))
    expired_at = Column(DateTime(timezone=True))
    
    # Usage limits based on plan
    max_mau = Column(Integer)  # Maximum monthly active users
    max_organizations = Column(Integer)
    max_api_calls = Column(Integer)  # Per month
    
    # Features (stored as JSON for flexibility)
    features = Column(JSON, default={})
    
    # Metadata
    metadata = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    tenant = relationship("Tenant", back_populates="subscription")
    
    def is_active(self) -> bool:
        """Check if subscription is active"""
        return self.status in [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]
    
    def has_feature(self, feature: str) -> bool:
        """Check if subscription has a specific feature"""
        return self.features.get(feature, False) if self.features else False
    
    def can_add_users(self, current_mau: int) -> bool:
        """Check if more users can be added based on MAU limit"""
        if not self.max_mau:
            return True  # No limit
        return current_mau < self.max_mau