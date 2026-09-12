# TC-Auth FastAPI Setup & Architecture

This guide explains how to structure and initialize `tc_auth` in a FastAPI application, configure its database, CORS, email, OAuth (Google, GitHub, Discord), and JWT dual-token services, and avoid circular dependencies.

---

## Architecture: The `connect.py` + `run.py` Pattern

In production and modular FastAPI projects, feature routes located in different files/packages frequently need to import `auth` (e.g., `from connect import auth`) to use dependencies such as `auth.deps.get_current`, `auth.role.require("admin")`, or services like `auth.account`.

If `app = FastAPI()` and `auth = Auth(engine, app)` are initialized in the same file alongside route imports, importing `auth` from feature modules triggers the creation of `app` before route modules are loaded, resulting in **circular dependency errors**.

### Why Decouple `connect.py` and `run.py`?

```
┌─────────────────────────────────────────────────────────────┐
│ 1. connect.py                                               │
│    - Creates DB engine & session factory                    │
│    - Initializes `auth = Auth(engine=engine)`               │
│    - Configures JWT (Dual-Token), Email, Google, GitHub,    │
│      and Discord OAuth                                      │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ 2. Feature Routers           │ │ 3. run.py                    │
│    - Imports `auth`          │ │    - Creates `app = FastAPI()`
│    - Uses `auth.deps`        │ │    - Configures CORS         │
│    - Uses `auth.role`        │ │    - `auth.include_routes()` │
│    - No circular import!     │ │    - `app.include_router()`  │
└──────────────────────────────┘ └──────────────────────────────┘
```

1. **`connect.py`** is the single source of truth for the database engine, Auth instance, and service configurations.
2. **Feature routers** import `auth` from `connect.py` cleanly without needing the `app` instance.
3. **`run.py`** imports `app`, `auth` from `connect`, attaches middleware, wires routes via `auth.include_routes(app)`, includes feature routers, and launches the server.

---

## 1. `connect.py` Implementation

```python
from sqlalchemy import create_engine
from tc_auth import Auth

# 1. Create the SQLAlchemy Engine
engine = create_engine(
    "postgresql://workspace:admin@localhost:5432/tc_auth"
)

# 2. Instantiate Auth with the engine
auth = Auth(engine=engine)

# 3. Configure JWT with Dual-Token Mode (Access + Refresh Tokens)
auth.jwt.config(
    secret_key="your-super-secret-key-production-ready",
    algorithm="HS256",
    session_duration_days=7,
    dual_token_mode=True,
    access_token_expire_minutes=15,
    refresh_token_expire_days=7,
)

# 4. Configure Email Service (Required for Email OTP features)
auth.email.config(
    host="smtp.gmail.com",
    port=587,
    username="your-email@gmail.com",
    password="your-app-password",
    sender="your-email@gmail.com",
    sender_name="My Application",
    use_tls=True,
)

# 5. Configure Google OAuth (Optional)
auth.google.config(
    client_id="your-google-client-id.apps.googleusercontent.com",
    client_secret="your-google-client-secret",
    redirect_uri="https://app.example.com/tc-auth/google/callback",
)

# 6. Configure GitHub OAuth (Optional)
auth.github.config(
    client_id="your-github-client-id",
    client_secret="your-github-client-secret",
    redirect_uri="https://app.example.com/tc-auth/github/callback",
)

# 7. Configure Discord OAuth (Optional)
auth.discord.config(
    client_id="your-discord-application-id",
    client_secret="your-discord-client-secret",
    redirect_uri="https://app.example.com/tc-auth/discord/callback",
)
```

---

## 2. Feature Module Example (`routers/profile.py`)

Feature routers import `auth` from `connect` safely:

```python
from fastapi import APIRouter, Depends
from connect import auth

router = APIRouter(prefix="/user", tags=["User Profile"])

@router.get("/profile")
def get_profile(user=Depends(auth.deps.get_current)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
    }

@router.delete("/oauth/{provider}")
def unlink_provider(provider: str, user=Depends(auth.deps.get_current)):
    # Safe unlinking with lockout prevention
    return auth.oauth.unlink_account_safe(user.id, provider)
```

---

## 3. Server Initialization (`run.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from connect import auth
from routers import profile

app = FastAPI(title="My Application")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Attach tc-auth endpoints (default prefix /tc-auth with automatic strip handling)
auth.include_routes(app, prefix="/tc-auth")

# Include feature routers
app.include_router(profile.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```
