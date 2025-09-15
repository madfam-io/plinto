"""
Authentication service for handling JWT tokens and authentication
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import secrets
import hashlib
import bcrypt
import jwt
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..models import User, Session as UserSession, SessionStatus, UserStatus
from app.config import settings


class AuthService:
    """Service for handling authentication operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed: str) -> bool:
        """Verify a password against a hash"""
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
        except Exception:
            return False
    
    @staticmethod
    def validate_password(password: str) -> tuple[bool, str]:
        """Validate password meets requirements"""
        if len(password) < settings.PASSWORD_MIN_LENGTH:
            return False, f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters"
        
        if settings.PASSWORD_REQUIRE_UPPERCASE and not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"
        
        if settings.PASSWORD_REQUIRE_LOWERCASE and not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"
        
        if settings.PASSWORD_REQUIRE_NUMBERS and not any(c.isdigit() for c in password):
            return False, "Password must contain at least one number"
        
        if settings.PASSWORD_REQUIRE_SPECIAL:
            special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
            if not any(c in special_chars for c in password):
                return False, "Password must contain at least one special character"
        
        return True, "Password is valid"
    
    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def generate_jti() -> str:
        """Generate a unique JWT ID"""
        return secrets.token_hex(16)
    
    @staticmethod
    def create_access_token(user_id: str, jti: str, additional_claims: Optional[Dict] = None) -> str:
        """Create a JWT access token"""
        now = datetime.utcnow()
        expires = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        payload = {
            'sub': user_id,
            'jti': jti,
            'iat': now,
            'exp': expires,
            'type': 'access',
            'iss': settings.JWT_ISSUER,
            'aud': settings.JWT_AUDIENCE
        }
        
        if additional_claims:
            payload.update(additional_claims)
        
        return jwt.encode(payload, settings.JWT_SECRET_KEY or settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def create_refresh_token(user_id: str, jti: str) -> str:
        """Create a JWT refresh token"""
        now = datetime.utcnow()
        expires = now + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        
        payload = {
            'sub': user_id,
            'jti': jti,
            'iat': now,
            'exp': expires,
            'type': 'refresh',
            'iss': settings.JWT_ISSUER,
            'aud': settings.JWT_AUDIENCE
        }
        
        return jwt.encode(payload, settings.JWT_SECRET_KEY or settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    @staticmethod
    def decode_token(token: str, token_type: str = 'access') -> Optional[Dict[str, Any]]:
        """Decode and validate a JWT token"""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY or settings.SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM],
                issuer=settings.JWT_ISSUER,
                audience=settings.JWT_AUDIENCE
            )
            
            # Verify token type
            if payload.get('type') != token_type:
                return None
            
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def create_user_session(
        db: Session,
        user: User,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        device_name: Optional[str] = None
    ) -> tuple[str, str, UserSession]:
        """Create a new user session with tokens"""
        # Generate JTIs for tokens
        access_jti = AuthService.generate_jti()
        refresh_jti = AuthService.generate_jti()
        
        # Create tokens
        access_token = AuthService.create_access_token(str(user.id), access_jti)
        refresh_token = AuthService.create_refresh_token(str(user.id), refresh_jti)
        
        # Calculate session expiry (same as refresh token)
        expires_at = datetime.utcnow() + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Create session record
        session = UserSession(
            user_id=user.id,
            access_token_jti=access_jti,
            refresh_token_jti=refresh_jti,
            ip_address=ip_address,
            user_agent=user_agent,
            device_name=device_name,
            expires_at=expires_at,
            status=SessionStatus.ACTIVE
        )
        
        db.add(session)
        
        # Update user last sign in
        user.last_sign_in_at = datetime.utcnow()
        
        db.commit()
        
        return access_token, refresh_token, session
    
    @staticmethod
    def validate_session(db: Session, access_jti: str) -> Optional[UserSession]:
        """Validate a session by access token JTI"""
        session = db.query(UserSession).filter(
            UserSession.access_token_jti == access_jti,
            UserSession.status == SessionStatus.ACTIVE,
            UserSession.expires_at > datetime.utcnow()
        ).first()
        
        if session:
            # Update last active time
            session.last_active_at = datetime.utcnow()
            db.commit()
        
        return session
    
    @staticmethod
    def revoke_session(db: Session, session_id: str) -> bool:
        """Revoke a user session"""
        session = db.query(UserSession).filter(
            UserSession.id == session_id
        ).first()
        
        if session:
            session.status = SessionStatus.REVOKED
            session.revoked_at = datetime.utcnow()
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> Optional[tuple[str, str]]:
        """Refresh an access token using a refresh token"""
        # Decode refresh token
        payload = AuthService.decode_token(refresh_token, token_type='refresh')
        if not payload:
            return None
        
        # Find session by refresh token JTI
        session = db.query(UserSession).filter(
            UserSession.refresh_token_jti == payload['jti'],
            UserSession.status == SessionStatus.ACTIVE,
            UserSession.expires_at > datetime.utcnow()
        ).first()
        
        if not session:
            return None
        
        # Generate new access token with new JTI
        new_access_jti = AuthService.generate_jti()
        new_access_token = AuthService.create_access_token(str(session.user_id), new_access_jti)
        
        # Update session with new access token JTI
        session.access_token_jti = new_access_jti
        session.last_active_at = datetime.utcnow()
        db.commit()
        
        return new_access_token, refresh_token
    
    @staticmethod
    def get_user_by_email_or_username(db: Session, email_or_username: str) -> Optional[User]:
        """Get user by email or username"""
        return db.query(User).filter(
            or_(
                User.email == email_or_username,
                User.username == email_or_username
            ),
            User.status == UserStatus.ACTIVE
        ).first()
    
    @staticmethod
    def cleanup_expired_sessions(db: Session):
        """Clean up expired sessions"""
        expired_sessions = db.query(UserSession).filter(
            UserSession.expires_at < datetime.utcnow(),
            UserSession.status == SessionStatus.ACTIVE
        ).all()
        
        for session in expired_sessions:
            session.status = SessionStatus.EXPIRED
        
        db.commit()