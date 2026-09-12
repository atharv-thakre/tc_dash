# FastAPI Application Runner (`run.py`)

This document explains the role of `run.py` in the decoupled architecture, how it mounts `tc_auth` routes, and why this design pattern is critical for production FastAPI applications.

---

## 1. Why the `connect.py` + `run.py` Structure is Used

In modular FastAPI projects, feature router files (e.g. `routers/items.py`, `routers/users.py`, `routers/dashboard.py`) often need to import `auth` to access authentication dependencies and services:

```python
from fastapi import APIRouter, Depends
from connect import auth  # Safe import — no FastAPI app initialized here!
```

### Key Architectural Benefits

1. **Eliminates Circular Dependencies**:
   - If `app = FastAPI()` and `auth = Auth(engine, app)` are initialized in the same file alongside route imports, importing `auth` into feature routers forces Python to load the main file before routes finish loading. This creates a classic circular import error.
   - Decoupling database/auth setup into `connect.py` and application mounting into `run.py` ensures that router modules only import the `auth` object without prematurely instantiating the FastAPI `app`.

2. **Prevents Duplicate Registration**:
   - Having a single `connect.py` guarantees that only **one `Auth` instance** and **one database connection pool** are created.
   - Having a single `run.py` guarantees that all routers, CORS middleware, session middleware, and global exception handlers are registered onto the FastAPI application **exactly once**, preventing duplicate route bindings or middleware collisions.

3. **Separation of Concerns**:
   - **`connect.py`**: Database engine creation, `Auth` instantiation, service configurations (JWT, Email, OAuth), and table lifecycle management (`init()`, `destroy()`).
   - **`run.py`**: FastAPI application instance, CORS configuration, route inclusion (`auth.include_routes()`), custom feature router mounting, and Uvicorn server execution.

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. connect.py (Database & Auth Definition)                  │
│    - Creates SQLAlchemy database engine                     │
│    - Initializes `auth = Auth(engine=engine)`               │
│    - Configures JWT, Email, Google OAuth, GitHub OAuth      │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│ 2. Feature Routers           │ │ 3. run.py (Application Host) │
│    - Imports `auth`          │ │    - Imports `auth`          │
│    - Uses `auth.deps`        │ │    - Creates `app = FastAPI()`
│    - Uses `auth.role`        │ │    - Configures CORS         │
│    - Zero circular imports!  │ │    - `auth.include_routes()` │
└──────────────┬───────────────┘ │    - `app.include_router()`  │
               │                 └─────────────┬────────────────┘
               │                               │
               └───────────────────────────────┘
                               │
                               ▼
                   Uvicorn Server Launcher
```

---

## 3. Complete `run.py` Implementation

```python
import uvicorn
from fastapi import FastAPI, APIRouter, Depends
from fastapi.middleware.cors import CORSMiddleware

# Import the configured Auth instance from connect.py
from connect import auth

# ==========================================================
# 1. CREATE FASTAPI APPLICATION
# ==========================================================
app = FastAPI(
    title="Modular FastAPI App with tc-auth",
    version="1.0.0",
)

# ==========================================================
# 2. CONFIGURE APPLICATION MIDDLEWARE
# ==========================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# 3. MOUNT TC-AUTH LIBRARY ROUTES
# ==========================================================
# Mounts login, signup, oauth, profile, and admin dashboard routes,
# plus SessionMiddleware and global AuthError exception handlers.
#
# Note: The prefix defaults to "/tc-auth" and is configurable:
#   auth.include_routes(app, prefix="/tc-auth")
auth.include_routes(app)

# ==========================================================
# 4. REGISTER CUSTOM APPLICATION ROUTERS
# ==========================================================
items_router = APIRouter(prefix="/items", tags=["Items"])

@items_router.get("/")
def list_items(current_user: dict = Depends(auth.deps.get_current)):
    """Protected endpoint requiring a valid authenticated session."""
    return {
        "message": "Authenticated items access",
        "user_id": current_user["account"]["id"],
        "items": ["Item A", "Item B", "Item C"],
    }

@items_router.get("/admin-only")
def admin_items(admin: dict = Depends(auth.role.require("admin", "superadmin"))):
    """Admin-only endpoint requiring admin or superadmin role."""
    return {
        "message": "Admin authorized",
        "admin_id": admin["id"],
    }

app.include_router(items_router)

# ==========================================================
# 5. SERVER LAUNCHER
# ==========================================================
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

## 4. Summary

| Aspect | `connect.py` | `run.py` |
|---|---|---|
| **Primary Role** | Data layer & Auth SDK initialization | Application runner & Route registry |
| **FastAPI App** | ❌ Does NOT create `app` | ✅ Creates `app = FastAPI()` |
| **Route Mounting** | ❌ No route registration | ✅ Calls `auth.include_routes(app)` |
| **Imported By** | Feature routers, background tasks, tests | Uvicorn CLI or direct execution |
| **Avoids** | Duplicate engine/auth instantiation | Circular imports and duplicate router registrations |
