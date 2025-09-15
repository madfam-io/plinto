"""
Shared dependencies for FastAPI routes and services
"""

from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserStatus
from app.services.auth import AuthService

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security), 
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    
    # Decode token
    payload = AuthService.decode_token(token, token_type='access')
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Validate session
    session = AuthService.validate_session(db, payload['jti'])
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Get user
    user = db.query(User).filter(
        User.id == payload['sub'],
        User.status == UserStatus.ACTIVE
    ).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user