"""
Compliance and regulatory API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, Dict, Any, List
from pydantic import BaseModel
from datetime import datetime, timedelta
import logging

from ...database import get_db
from app.dependencies import get_current_user, require_admin
from ...models import User, Organization
from ...models.compliance import (
    ComplianceConfiguration, ConsentRecord, DataRequest,
    DataRequestType, DataRequestStatus, ConsentType
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/compliance",
    tags=["Compliance"],
    responses={404: {"description": "Not found"}},
)

class ConsentRequest(BaseModel):
    consent_type: ConsentType
    version: str
    is_granted: bool
    lawful_basis: Optional[str] = None
    purpose: Optional[str] = None

class DataRequestCreate(BaseModel):
    request_type: DataRequestType
    request_details: Optional[Dict[str, Any]] = None

@router.post("/consent")
async def record_consent(
    consent: ConsentRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Record user consent"""
    try:
        consent_record = ConsentRecord(
            user_id=current_user.id,
            consent_type=consent.consent_type,
            version=consent.version,
            is_granted=consent.is_granted,
            granted_at=datetime.utcnow() if consent.is_granted else None,
            lawful_basis=consent.lawful_basis,
            purpose=consent.purpose
        )
        
        db.add(consent_record)
        await db.commit()
        
        return {"message": "Consent recorded successfully"}
        
    except Exception as e:
        logger.error(f"Failed to record consent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/data-requests")
async def create_data_request(
    request: DataRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create data subject request (GDPR Article 15-20)"""
    try:
        # Calculate due date (30 days for most requests)
        due_date = datetime.utcnow() + timedelta(days=30)
        
        data_request = DataRequest(
            user_id=current_user.id,
            request_type=request.request_type,
            request_details=request.request_details,
            due_date=due_date
        )
        
        db.add(data_request)
        await db.commit()
        
        return {
            "request_id": str(data_request.id),
            "status": data_request.status.value,
            "due_date": due_date.isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to create data request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/data-requests")
async def list_data_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List user's data requests"""
    try:
        result = await db.execute(
            select(DataRequest).where(
                DataRequest.user_id == current_user.id
            ).order_by(DataRequest.created_at.desc())
        )
        requests = result.scalars().all()
        
        return [
            {
                "id": str(req.id),
                "request_type": req.request_type.value,
                "status": req.status.value,
                "requested_at": req.requested_at.isoformat(),
                "due_date": req.due_date.isoformat(),
                "processed_at": req.processed_at.isoformat() if req.processed_at else None
            }
            for req in requests
        ]
        
    except Exception as e:
        logger.error(f"Failed to list data requests: {e}")
        raise HTTPException(status_code=500, detail=str(e))