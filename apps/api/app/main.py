from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, EmailStr
import hashlib
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Optional
import structlog

# Import only the working infrastructure pieces
from app.config import settings
from app.core.database import get_db, AsyncSessionLocal
from app.core.redis import get_redis

# Initialize logger
logger = structlog.get_logger()

# Create minimal FastAPI app that uses your Railway infrastructure
app = FastAPI(
    title="Plinto API",
    description="Beta Authentication with Railway Infrastructure",
    version="0.1.0"
)

# Pydantic models
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

class SignInRequest(BaseModel):
    email: EmailStr  
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600

# Utility functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hashlib.sha256(password.encode()).hexdigest() == hashed

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, "beta-secret-key", algorithm="HS256")

# Root endpoint
@app.get("/")
def root():
    return {"status": "ok", "message": "Beta API with Railway Infrastructure", "infrastructure": "postgresql+redis"}

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "0.1.0", "environment": "production"}

# Infrastructure check using your actual database and Redis
@app.get("/ready")
async def ready_check():
    """Health check endpoint with database and Redis connectivity"""
    from app.core.database import engine
    from sqlalchemy import text
    
    checks = {"status": "ready", "database": False, "redis": False}
    
    # Check database connectivity
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            checks["database"] = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
    
    # Check Redis connectivity
    try:
        redis_client = await get_redis()
        if redis_client:
            await redis_client.ping()
            checks["redis"] = True
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
    
    if not all([checks["database"], checks["redis"]]):
        checks["status"] = "degraded"
    
    return checks

# Beta authentication using Redis for storage (leveraging your Railway infrastructure)
@app.post("/beta/signup")
async def beta_signup(request: SignUpRequest):
    """Beta user registration using Railway Redis storage"""
    try:
        redis_client = await get_redis()
        
        # Check if user exists in Redis
        user_key = f"beta_user:{request.email}"
        if await redis_client.exists(user_key):
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Validate password
        if len(request.password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
        
        # Create user in Redis
        user_id = secrets.token_hex(16)
        user_data = {
            "id": user_id,
            "email": request.email,
            "name": request.name or request.email.split("@")[0],
            "password_hash": hash_password(request.password),
            "created_at": datetime.utcnow().isoformat(),
            "email_verified": True
        }
        
        # Store in Redis with 30-day expiry
        await redis_client.hset(user_key, mapping=user_data)
        await redis_client.expire(user_key, 30 * 24 * 60 * 60)
        
        logger.info(f"Beta user created in Railway Redis: {request.email}")
        
        return {
            "id": user_id,
            "email": request.email,
            "name": user_data["name"],
            "message": "Beta user created successfully using Railway Redis"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Beta signup failed: {e}")
        raise HTTPException(status_code=500, detail="Signup failed")

@app.post("/beta/signin", response_model=TokenResponse)
async def beta_signin(request: SignInRequest):
    """Beta user authentication using Railway Redis storage"""
    try:
        redis_client = await get_redis()
        
        # Get user from Redis
        user_key = f"beta_user:{request.email}"
        user_data = await redis_client.hgetall(user_key)
        
        if not user_data:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(request.password, user_data["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create access token
        token_data = {
            "sub": user_data["id"],
            "email": request.email,
            "name": user_data["name"]
        }
        access_token = create_access_token(token_data)
        
        # Store session in Redis
        session_key = f"beta_session:{user_data['id']}"
        session_data = {
            "user_id": user_data["id"],
            "email": request.email,
            "created_at": datetime.utcnow().isoformat()
        }
        await redis_client.hset(session_key, mapping=session_data)
        await redis_client.expire(session_key, 24 * 60 * 60)  # 24 hours
        
        logger.info(f"Beta user signed in: {request.email}")
        
        return TokenResponse(access_token=access_token)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Beta signin failed: {e}")
        raise HTTPException(status_code=500, detail="Signin failed")

@app.get("/beta/users")
async def beta_list_users():
    """List beta users from Railway Redis"""
    try:
        redis_client = await get_redis()
        
        # Get all beta user keys
        user_keys = await redis_client.keys("beta_user:*")
        users = []
        
        for key in user_keys:
            user_data = await redis_client.hgetall(key)
            if user_data:
                users.append({
                    "id": user_data["id"],
                    "email": user_data["email"], 
                    "name": user_data["name"],
                    "created_at": user_data["created_at"]
                })
        
        return {"users": users, "total": len(users), "storage": "Railway Redis"}
        
    except Exception as e:
        logger.error(f"Failed to list beta users: {e}")
        raise HTTPException(status_code=500, detail="Failed to list users")

# API status endpoint
@app.get("/api/status")
def api_status():
    return {
        "status": "Beta API operational",
        "authentication": "Redis-based beta auth",
        "infrastructure": "Railway PostgreSQL + Redis",
        "version": "0.1.0",
        "environment": "production",
        "endpoints": ["/beta/signup", "/beta/signin", "/beta/users"]
    }

# OpenID Configuration for compatibility
@app.get("/.well-known/openid-configuration")
def get_openid_configuration():
    """Return OpenID Connect configuration"""
    return {
        "issuer": "https://api.plinto.dev",
        "authorization_endpoint": "https://api.plinto.dev/beta/signin",
        "token_endpoint": "https://api.plinto.dev/beta/signin",
        "userinfo_endpoint": "https://api.plinto.dev/beta/users",
        "jwks_uri": "https://api.plinto.dev/.well-known/jwks.json",
        "response_types_supported": ["code", "token"],
        "subject_types_supported": ["public"],
        "scopes_supported": ["openid", "profile", "email"]
    }

@app.get("/.well-known/jwks.json")  
def get_jwks():
    """Return JSON Web Key Set for token verification"""
    return {"keys": []}