"""
Authentication and Authorization for Trinity AI
Supports JWT tokens and API keys for secure access.
Database integration for production use.
"""
import os
import secrets
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel


# Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme
security = HTTPBearer(auto_error=False)


class TokenData(BaseModel):
    """JWT token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> TokenData:
    """Decode and verify a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return TokenData(user_id=user_id, email=email)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
):
    """
    Dependency to get the current authenticated user.
    Supports both JWT tokens and API keys.
    """
    from database import get_db, get_user_by_id, get_api_key
    
    # Check if authentication is disabled (dev mode)
    if os.getenv("DISABLE_AUTH", "false").lower() == "true":
        # Return a simple dict for dev user
        class DevUser:
            id = "dev"
            email = "dev@localhost"
            is_active = True
            is_admin = True
        return DevUser()
    
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Get database session
    async for db in get_db():
        # Try API key first (starts with "tk_")
        if token.startswith("tk_"):
            api_key = await get_api_key(db, token)
            if api_key and api_key.is_active:
                # Update last used timestamp
                api_key.last_used_at = datetime.utcnow()
                await db.commit()
                
                user = await get_user_by_id(db, api_key.user_id)
                if user and user.is_active:
                    return user
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or inactive API key",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Try JWT token
        token_data = decode_access_token(token)
        if token_data.user_id:
            user = await get_user_by_id(db, token_data.user_id)
            if user and user.is_active:
                return user
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_admin_user(
    current_user = Depends(get_current_user)
):
    """Dependency to require admin privileges."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user
