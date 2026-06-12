from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from app.database import get_db
from app.models.user import User
from app.services.auth import (
    hash_password, verify_password, create_access_token,
    create_refresh_token, rotate_refresh_token, generate_verification_token,
    get_current_user
)
from app.services import email as email_svc
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class ResetRequest(BaseModel):
    email: str


class ResetConfirmRequest(BaseModel):
    token: str
    new_password: str


def _user_response(user: User, db: Session) -> dict:
    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id, db)
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.name, "is_verified": user.is_verified},
    }


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    token = generate_verification_token()
    user = User(
        email=payload.email, name=payload.name,
        hashed_password=hash_password(payload.password),
        verification_token=token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    # Send emails (non-blocking — failures don't break registration)
    email_svc.send_welcome(user.email, user.name)
    email_svc.send_verification(user.email, user.name, token)
    return _user_response(user, db)


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username, User.is_active == True).first()
    if not user or not user.hashed_password or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user.last_login = datetime.utcnow()
    db.commit()
    return _user_response(user, db)


@router.post("/refresh")
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    access, refresh = rotate_refresh_token(payload.refresh_token, db)
    return {"access_token": access, "refresh_token": refresh, "token_type": "bearer"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"id": current_user.id, "email": current_user.email, "name": current_user.name, "is_verified": current_user.is_verified}


@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(payload: ResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        token = generate_verification_token()
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        email_svc.send_password_reset(user.email, user.name, token)
    # Always return 200 to prevent email enumeration
    return {"message": "If that email exists, a reset link was sent"}


@router.post("/reset-password")
def reset_password(payload: ResetConfirmRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.reset_token == payload.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password reset successfully"}


# ── Google OAuth ──────────────────────────────────────────────────────────────
@router.get("/google")
def google_login():
    if not settings.google_client_id:
        raise HTTPException(status_code=501, detail="Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env")
    from authlib.integrations.starlette_client import OAuth
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": f"{settings.oauth_redirect_base}/auth/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
    }
    from urllib.parse import urlencode
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}")


@router.get("/google/callback")
async def google_callback(code: str, db: Session = Depends(get_db)):
    if not settings.google_client_id:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    import httpx
    # Exchange code for token
    token_resp = httpx.post("https://oauth2.googleapis.com/token", data={
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": f"{settings.oauth_redirect_base}/auth/google/callback",
        "grant_type": "authorization_code",
    })
    tokens = token_resp.json()
    # Get user info
    user_resp = httpx.get("https://www.googleapis.com/oauth2/v3/userinfo",
                          headers={"Authorization": f"Bearer {tokens['access_token']}"})
    info = user_resp.json()
    # Upsert user
    user = db.query(User).filter(User.google_id == info["sub"]).first()
    if not user:
        user = db.query(User).filter(User.email == info["email"]).first()
    if not user:
        user = User(email=info["email"], name=info.get("name", ""), google_id=info["sub"], is_verified=True)
        db.add(user)
        db.commit()
        db.refresh(user)
        email_svc.send_welcome(user.email, user.name)
    elif not user.google_id:
        user.google_id = info["sub"]
        user.is_verified = True
        db.commit()
    access = create_access_token(user.id)
    refresh = create_refresh_token(user.id, db)
    return RedirectResponse(f"{settings.oauth_redirect_base}?access_token={access}&refresh_token={refresh}")
