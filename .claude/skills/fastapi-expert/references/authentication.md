# Authentication

## OAuth2 Password Flow

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/token")

@router.post("/token")
async def login(
    db: DB,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status.HTTP_401_UNAUTHORIZED,
            "Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return Token(
        access_token=create_access_token(sub=str(user.id)),
        token_type="bearer",
    )
```

## JWT Token Creation

```python
from datetime import datetime, timedelta, UTC
import jwt
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()  # Argon2 (pip install "pwdlib[argon2]")

def verify_password(plain: str, hashed: str) -> bool:
    return password_hash.verify(plain, hashed)

def hash_password(password: str) -> str:
    return password_hash.hash(password)

def create_access_token(
    sub: str,
    expires_delta: timedelta | None = None,
) -> str:
    expire = datetime.now(UTC) + (expires_delta or timedelta(minutes=15))
    return jwt.encode(
        {"sub": sub, "exp": expire, "type": "access"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )

def create_refresh_token(sub: str) -> str:
    expire = datetime.now(UTC) + timedelta(days=7)
    return jwt.encode(
        {"sub": sub, "exp": expire, "type": "refresh"},
        settings.SECRET_KEY,
        algorithm="HS256",
    )
```

## Get Current User

```python
async def get_current_user(
    db: DB,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    credentials_exception = HTTPException(
        status.HTTP_401_UNAUTHORIZED,
        "Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user_id = int(payload.get("sub"))
        if payload.get("type") != "access":
            raise credentials_exception
    except (InvalidTokenError, ValueError, TypeError):
        raise credentials_exception

    user = await get_user_db(db, user_id)
    if not user:
        raise credentials_exception
    return user

CurrentUser = Annotated[User, Depends(get_current_user)]
```

## Role-Based Access

```python
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"

def require_roles(*roles: UserRole):
    async def role_checker(current_user: CurrentUser) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"Required roles: {[r.value for r in roles]}",
            )
        return current_user
    return role_checker

# Usage
@router.delete("/{id}")
async def delete_user(
    user_id: int,
    admin: Annotated[User, Depends(require_roles(UserRole.ADMIN))],
) -> None:
    ...
```

## Refresh Token

```python
@router.post("/refresh", response_model=Token)
async def refresh_token(
    db: DB,
    refresh_token: str = Body(..., embed=True),
) -> Token:
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid token type")
        user_id = int(payload.get("sub"))
    except (InvalidTokenError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid refresh token")

    user = await get_user_db(db, user_id)
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")

    return Token(
        access_token=create_access_token(sub=str(user.id)),
        token_type="bearer",
    )
```

## Quick Reference

| Component | Purpose |
|-----------|---------|
| `OAuth2PasswordBearer` | Extract token from header |
| `OAuth2PasswordRequestForm` | Login form data |
| `jwt.encode()` | Create JWT |
| `jwt.decode()` | Verify JWT |
| `password_hash.hash()` | Hash password |
| `password_hash.verify()` | Check password |
| `Depends(get_current_user)` | Require auth |
| `require_roles()` | Role-based access |
