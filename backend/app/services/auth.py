from datetime import datetime, timedelta
from typing import Optional
import secrets
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.token import RefreshToken

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    return jwt.encode({"sub": str(user_id), "exp": exp, "type": "access"}, settings.secret_key, algorithm=ALGORITHM)


def create_refresh_token(user_id: int, db: Session) -> str:
    token = secrets.token_urlsafe(64)
    exp = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    db_token = RefreshToken(user_id=user_id, token=token, expires_at=exp)
    db.add(db_token)
    db.commit()
    return token


def rotate_refresh_token(old_token: str, db: Session) -> tuple[str, str]:
    """Revoke old refresh token, issue new access + refresh tokens."""
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == old_token,
        RefreshToken.is_revoked == False
    ).first()
    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    db_token.is_revoked = True
    db.commit()
    access = create_access_token(db_token.user_id)
    refresh = create_refresh_token(db_token.user_id, db)
    return access, refresh


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            return None
        return db.query(User).filter(User.id == int(payload["sub"]), User.is_active == True).first()
    except (JWTError, TypeError, ValueError):
        return None


def require_user(current_user: Optional[User] = Depends(get_current_user)) -> User:
    if not current_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return current_user


def generate_verification_token() -> str:
    return secrets.token_urlsafe(32)
