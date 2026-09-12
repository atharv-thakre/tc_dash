# ==========================================================
# FASTAPI RUNNER & ROUTE REGISTRATION (run.py)
# ==========================================================
#
# This file contains the FastAPI application runner:
# - Creates the FastAPI app instance
# - Configures CORS and application middleware
# - Registers all tc-auth library routes via auth.include_routes()
# - Includes custom application feature routers
# - Starts the Uvicorn development server
#
# Architectural Note:
# Separating FastAPI creation (run.py) from database engine/auth
# setup (connect.py) avoids circular dependencies across router
# modules that import `auth`.
#

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
# 2. APPLICATION MIDDLEWARE
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
#
# auth.include_routes(app, prefix="/tc-auth") mounts:
#   - Auth routes: /tc-auth/send/email/otp, /tc-auth/signup/*, /tc-auth/login/*, /tc-auth/forgot/password
#   - OAuth routes: /tc-auth/google/*, /tc-auth/github/*
#   - Account routes: /tc-auth/me, /tc-auth/logout, /tc-auth/logout-all, /tc-auth/update/password
#   - Admin Dashboard routes: /tc-auth/account/*, /tc-auth/session/*, /tc-auth/oauth/*, /tc-auth/otp/*, /tc-auth/config/*
#   - Global AuthError exception handlers and SessionMiddleware
#
# Note: The `prefix` parameter defaults to "/tc-auth" and is configurable
# (e.g. auth.include_routes(app, prefix="/api/v1/auth")).
#
auth.include_routes(app, prefix="/tc-auth")


# ==========================================================
# 4. CUSTOM APPLICATION ROUTERS (EXAMPLE)
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
