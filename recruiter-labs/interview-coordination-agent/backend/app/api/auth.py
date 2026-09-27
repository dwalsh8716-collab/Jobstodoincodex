from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.config import get_settings
from app.schemas import LoginRequest, LoginResponse
from app.security import (
    SESSION_COOKIE_NAME,
    authenticate_login,
    clear_rate_limit,
    client_key,
    create_session_token,
    enforce_rate_limit,
    require_user,
)


router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, request: Request, response: Response) -> LoginResponse:
    settings = get_settings()
    if not settings.auth_configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Login is not configured. Set APP_LOGIN_EMAIL, APP_LOGIN_PASSWORD and SESSION_SECRET.",
        )

    rate_key = client_key(request, "login")
    enforce_rate_limit(rate_key, settings.login_rate_limit_attempts, 15 * 60)
    if not authenticate_login(payload.email, payload.password, settings):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid login.")

    token, expires_at = create_session_token(payload.email, settings)
    clear_rate_limit(rate_key)
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        max_age=12 * 60 * 60,
        path="/",
    )
    return LoginResponse(token=token, email=payload.email, expires_at=expires_at)


@router.get("/me")
def me(user_email: str = Depends(require_user)) -> dict:
    return {"email": user_email}


@router.post("/logout")
def logout(response: Response) -> dict:
    response.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return {"ok": True}
