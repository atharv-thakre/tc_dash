# TC-Auth FastAPI Setup & Architecture

This guide explains how to structure and initialize `tc_auth` in a FastAPI application, configure its database, CORS, email, OAuth, and JWT services, and avoid circular dependencies.

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
│    - Configures JWT, Email, Google, GitHub, Discord OAuth   │
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

# 3. Configure JWT (Optional - default settings apply if omitted)
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=7,
)

# 4. Configure Email Service (Optional - required for email/OTP features)
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
    client_id="your-google-client-id",
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
    client_id="your-discord-client-id",
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
def get_profile(user=Depends(auth.deps.get_current_user)):
    return {
        "account": user["account"],
        "session": user["session"],
    }

@router.get("/admin-settings")
def admin_settings(admin=Depends(auth.role.require("admin"))):
    return {"status": "Access granted to admin"}
```

---

## 3. `run.py` Implementation

> For an in-depth walkthrough of runner logic, route registration, and duplicate prevention, see [run.md](run.md).

```python
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from connect import auth
from routers.profile import router as profile_router

app = FastAPI(title="FastAPI with tc_auth")

# Configure CORS (Important for dashboard and frontend apps)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.totalchaos.online", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Wire all tc_auth routes (Login, Signup, OAuth, Profiles, and Admin Dashboard)
# Note: The prefix parameter defaults to "/tc-auth" and is configurable: auth.include_routes(app, prefix="/tc-auth")
auth.include_routes(app)

# Include your application's feature routers
app.include_router(profile_router)

def run():
    uvicorn.run(
        "run:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )

if __name__ == "__main__":
    run()
```

---

## 4. Alternative: Single-File Setup (`main.py`)

For simple prototypes or single-file scripts where circular dependencies are not an issue:

```python
import uvicorn
from fastapi import FastAPI
from sqlalchemy import create_engine
from tc_auth import Auth

app = FastAPI()
engine = create_engine("sqlite:///./test.db")

# Passing `app` automatically registers routes, session middleware, and exception handlers
auth = Auth(engine=engine, app=app)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

## 5. Available `Auth` Services & Attributes

The `auth` object provides direct access to all components:

| Attribute | Service / Component | Purpose |
|---|---|---|
| `auth.account` | `AccountService` | Manage and update accounts |
| `auth.service` | `AuthService` | Signup, login, password update, and token creation |
| `auth.session` | `SessionService` | Create, destroy, clean up, and query sessions |
| `auth.otp` | `OTPService` | Create, verify, revoke, and clear OTPs |
| `auth.get_user` | `GetUserService` | Query accounts by email, id, uid, handle, or phone |
| `auth.deps` | `AuthDeps` | Dependencies: `get_current`, `get_current_account`, etc. |
| `auth.role` | `RoleDeps` | Authorization guards: `require`, `allow`, `block` |
| `auth.status` | `StatusDeps` | Status guards: `require`, `allow`, `block` |
| `auth.email` | `EmailService` | SMTP configuration, email delivery, OTP emails |
| `auth.jwt` | `jwt_handler` | JWT configuration, token encoding and decoding |
| `auth.google` | `GoogleOAuth` | Google OAuth configuration, login, and callback |
| `auth.github` | `GitHubOAuth` | GitHub OAuth configuration, login, and callback |
| `auth.discord` | `DiscordOAuth` | Discord OAuth configuration, login, and callback |
| `auth.dashboard` | `DashboardService` | Resource counts and system statistics |

---

## 6. Table Lifecycle Management

```python
# Create all tables defined in tc_auth models
auth.init()

# Drop all tc_auth tables from database (useful during automated tests / teardown)
auth.destroy()
```
