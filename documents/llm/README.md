# `tc_auth` — AI & LLM Documentation Reference

> **Quick AI Context**: `tc_auth` is a modular, zero-null, production-ready authentication and authorization library for **FastAPI** applications backed by **SQLAlchemy**. It features a decoupled architecture (`connect.py` / `run.py`), dual-token JWT + hashed session management, password policy enforcement, Google/GitHub/Discord OAuth with safe linking, SMTP OTPs & Magic Links, and role/status-based dependency injection guards.

---

## 🌐 Static Hosted Documentation Mounts

All documentation files and code samples are publicly hosted and statically mounted under `https://auth.codesena.me/documents`:

- **REST API Documentation (`/api/`)**: `https://auth.codesena.me/documents/api/`
- **Python SDK Documentation (`/sdk/`)**: `https://auth.codesena.me/documents/sdk/`
- **AI & LLM-Optimized Docs (`/llm/`)**: `https://auth.codesena.me/documents/llm/`

---

## 📚 Master Documentation Index & Links Matrix

### 1. AI & LLM Optimized Docs (`/documents/llm/`)
Designed specifically for AI coding agents and LLM system prompt injection with zero ambiguity, explicit type signatures, and exact schemas.

| Hosted URL | Local File | What It Contains | Why & When to Use It |
|---|---|---|---|
| [`/llm/README.md`](https://auth.codesena.me/documents/llm/README.md) | [`llm-docs/README.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/README.md) | Navigation index, quick prompt cheat sheet, security guarantees. | Starting point for understanding the system and fast reference. |
| [`/llm/llms.txt`](https://auth.codesena.me/documents/llm/llms.txt) | [`llm-docs/llms.txt`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/llms.txt) | LLMs.txt standard manifest file for AI tooling. | Used by LLM scrapers, Cursor, and IDE AI tools for project discovery. |
| [`/llm/llms-full.txt`](https://auth.codesena.me/documents/llm/llms-full.txt) | [`llm-docs/llms-full.txt`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/llms-full.txt) | Dense, all-in-one consolidated context file. | Perfect for copying directly into LLM system prompts or large context windows. |
| [`/llm/ARCHITECTURE.md`](https://auth.codesena.me/documents/llm/ARCHITECTURE.md) | [`llm-docs/ARCHITECTURE.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/ARCHITECTURE.md) | Decoupled pattern, token lifecycle, DB models, session hashing. | Explains the structural foundation and dual-layer verification logic. |
| [`/llm/SDK_REFERENCE.md`](https://auth.codesena.me/documents/llm/SDK_REFERENCE.md) | [`llm-docs/SDK_REFERENCE.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/SDK_REFERENCE.md) | Comprehensive Python SDK method signatures and parameters. | Essential when writing Python backend code interacting with `Auth` services. |
| [`/llm/API_REFERENCE.md`](https://auth.codesena.me/documents/llm/API_REFERENCE.md) | [`llm-docs/API_REFERENCE.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/API_REFERENCE.md) | Complete HTTP REST API endpoint reference and payloads. | Essential when building or testing client applications and API routes. |
| [`/llm/DEPENDENCIES_AND_RBAC.md`](https://auth.codesena.me/documents/llm/DEPENDENCIES_AND_RBAC.md) | [`llm-docs/DEPENDENCIES_AND_RBAC.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/DEPENDENCIES_AND_RBAC.md) | FastAPI dependency injection (`auth.deps`, `auth.role`, `auth.status`). | Used when securing FastAPI route handlers with RBAC and status guards. |
| [`/llm/OAUTH_INTEGRATION.md`](https://auth.codesena.me/documents/llm/OAUTH_INTEGRATION.md) | [`llm-docs/OAUTH_INTEGRATION.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/OAUTH_INTEGRATION.md) | Google, GitHub, and Discord OAuth 2.0 / OIDC setup & linking. | Reference for social login integration and lockout prevention. |
| [`/llm/ERRORS_AND_TROUBLESHOOTING.md`](https://auth.codesena.me/documents/llm/ERRORS_AND_TROUBLESHOOTING.md) | [`llm-docs/ERRORS_AND_TROUBLESHOOTING.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/ERRORS_AND_TROUBLESHOOTING.md) | Exception catalog, HTTP status mappings, debugging guide. | Used for handling API error responses and troubleshooting integration issues. |
| [`/llm/COOKBOOK_AND_EXAMPLES.md`](https://auth.codesena.me/documents/llm/COOKBOOK_AND_EXAMPLES.md) | [`llm-docs/COOKBOOK_AND_EXAMPLES.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/llm-docs/COOKBOOK_AND_EXAMPLES.md) | Copy-pasteable backend setup and frontend Axios client. | Ready-made boilerplates for rapid, error-free implementation. |

---

### 2. HTTP REST API Documentation (`/documents/api/`)
Detailed endpoint documentation for frontend developers, mobile teams, and QA testers.

| Hosted URL | Local File | Endpoints / Topics Covered | Why & When to Use It |
|---|---|---|---|
| [`/api/ROUTES_INDEX.md`](https://auth.codesena.me/documents/api/ROUTES_INDEX.md) | [`api_docs/ROUTES_INDEX.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/ROUTES_INDEX.md) | Master API index. | Quick routing map of all HTTP endpoints mounted under `/tc-auth`. |
| [`/api/login_route.md`](https://auth.codesena.me/documents/api/login_route.md) | [`api_docs/login_route.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/login_route.md) | Signup, Password Login, OTP Login, Magic Link, Forgot Password, Refresh Token. | Core authentication routes for user registration and sign-in. |
| [`/api/account_route.md`](https://auth.codesena.me/documents/api/account_route.md) | [`api_docs/account_route.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/account_route.md) | `/me`, Update Profile, Password Update, Logout, Logout-all, OAuth Link/Unlink. | Managing logged-in user profile, security settings, and sessions. |
| [`/api/oauth_route.md`](https://auth.codesena.me/documents/api/oauth_route.md) | [`api_docs/oauth_route.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/oauth_route.md) | Google, GitHub, and Discord `/login` and `/callback` redirect endpoints. | Implementing social login button redirects on frontend clients. |
| [`/api/oauth_integration.md`](https://auth.codesena.me/documents/api/oauth_integration.md) | [`api_docs/oauth_integration.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/oauth_integration.md) | Frontend OAuth integration guide (redirects, popup windows, callbacks). | Detailed client-side guide for handling OAuth redirect query parameters. |
| [`/api/token_usage_guide.md`](https://auth.codesena.me/documents/api/token_usage_guide.md) | [`api_docs/token_usage_guide.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/token_usage_guide.md) | Single-Token vs Dual-Token guide with Axios interceptor. | Best practices for storing tokens and managing automatic refreshes. |
| [`/api/dashboard_route.md`](https://auth.codesena.me/documents/api/dashboard_route.md) | [`api_docs/dashboard_route.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/dashboard_route.md) | `/config/pulse`, `/config/load/`, `/config/counts`, runtime configs. | Administrative endpoints for inspecting and configuring the live system. |
| [`/api/dash_account.md`](https://auth.codesena.me/documents/api/dash_account.md) | [`api_docs/dash_account.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/dash_account.md) | Superadmin Account CRUD (`GET /`, `GET /query`, `POST /`, `PATCH /`, `DELETE /`). | Building administrative panels for managing user accounts. |
| [`/api/dash_session.md`](https://auth.codesena.me/documents/api/dash_session.md) | [`api_docs/dash_session.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/dash_session.md) | Superadmin Session ops (`GET /`, `DELETE /`, `DELETE /all`, `DELETE /cleanup`, `DELETE /clear`). | Monitoring active user sessions and purging expired tokens. |
| [`/api/dash_otp.md`](https://auth.codesena.me/documents/api/dash_otp.md) | [`api_docs/dash_otp.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/dash_otp.md) | Superadmin OTP ops (`GET /`, `GET /query`, `POST /`, `DELETE /`, `DELETE /cleanup`). | Inspecting and managing OTP verification codes. |
| [`/api/dash_oauth.md`](https://auth.codesena.me/documents/api/dash_oauth.md) | [`api_docs/dash_oauth.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/dash_oauth.md) | Superadmin OAuth ops (`GET /`, `GET /query`, `POST /`, `DELETE /`). | Inspecting connected third-party OAuth links. |
| [`/api/system_route.md`](https://auth.codesena.me/documents/api/system_route.md) | [`api_docs/system_route.md`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/api_docs/system_route.md) | System route placeholder. | Internal routing documentation. |

---

### 3. Python SDK Documentation & Code (`/documents/sdk/`)
Guides and runnable Python files for each backend service module.

| Hosted Markdown / Code | Local Directory | Service / Feature | Why & When to Use It |
|---|---|---|---|
| [`/sdk/connect/connect.md`](https://auth.codesena.me/documents/sdk/connect/connect.md)<br>[`/sdk/connect/connect.py`](https://auth.codesena.me/documents/sdk/connect/connect.py) | [`usage/connect/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/connect/) | Database Engine & `Auth` Setup | Setting up database connection and configuring JWT/SMTP/OAuth. |
| [`/sdk/connect/run.md`](https://auth.codesena.me/documents/sdk/connect/run.md)<br>[`/sdk/connect/run.py`](https://auth.codesena.me/documents/sdk/connect/run.py) | [`usage/connect/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/connect/) | FastAPI App Assembly & Runners | Wiring routes (`auth.include_routes`), CORS, and Uvicorn server. |
| [`/sdk/account/account.md`](https://auth.codesena.me/documents/sdk/account/account.md)<br>[`/sdk/account/account.py`](https://auth.codesena.me/documents/sdk/account/account.py) | [`usage/account/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/account/) | `auth.account` (`AccountService`) | Direct programmatic account management, password hashing, updates. |
| [`/sdk/auth/auth.md`](https://auth.codesena.me/documents/sdk/auth/auth.md)<br>[`/sdk/auth/auth.py`](https://auth.codesena.me/documents/sdk/auth/auth.py) | [`usage/auth/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/auth/) | `auth.service` (`AuthService`) | Performing server-side signup, credential login, and token refresh. |
| [`/sdk/dependency/auth_deps.md`](https://auth.codesena.me/documents/sdk/dependency/auth_deps.md)<br>[`/sdk/dependency/auth_deps.py`](https://auth.codesena.me/documents/sdk/dependency/auth_deps.py) | [`usage/dependency/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/dependency/) | `auth.deps` (`AuthDeps`) | Injecting `get_current_user`, `get_current_account` into FastAPI routes. |
| [`/sdk/dependency/role_deps.md`](https://auth.codesena.me/documents/sdk/dependency/role_deps.md)<br>[`/sdk/dependency/role_deps.py`](https://auth.codesena.me/documents/sdk/dependency/role_deps.py) | [`usage/dependency/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/dependency/) | `auth.role` (`RoleDeps`) | Enforcing Role-Based Access Control (`require`, `allow`, `block`). |
| [`/sdk/dependency/status_deps.md`](https://auth.codesena.me/documents/sdk/dependency/status_deps.md)<br>[`/sdk/dependency/status_deps.py`](https://auth.codesena.me/documents/sdk/dependency/status_deps.py) | [`usage/dependency/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/dependency/) | `auth.status` (`StatusDeps`) | Enforcing account lifecycle status (`active`, `pending`, `suspended`). |
| [`/sdk/email/email.md`](https://auth.codesena.me/documents/sdk/email/email.md)<br>[`/sdk/email/email.py`](https://auth.codesena.me/documents/sdk/email/email.py) | [`usage/email/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/email/) | `auth.email` (`EmailService`) | Dispatching SMTP HTML emails and OTP codes. |
| [`/sdk/email/magic_link.md`](https://auth.codesena.me/documents/sdk/email/magic_link.md)<br>[`/sdk/email/magic_link.py`](https://auth.codesena.me/documents/sdk/email/magic_link.py) | [`usage/email/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/email/) | Magic Link Email Delivery | Sending and verifying passwordless Magic Links programmatically. |
| [`/sdk/get_user/get_user.md`](https://auth.codesena.me/documents/sdk/get_user/get_user.md)<br>[`/sdk/get_user/get_user.py`](https://auth.codesena.me/documents/sdk/get_user/get_user.py) | [`usage/get_user/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/get_user/) | `auth.get_user` (`GetUserService`) | Querying accounts by ID, UID, email, handle, or phone number. |
| [`/sdk/jwt/jwt.md`](https://auth.codesena.me/documents/sdk/jwt/jwt.md)<br>[`/sdk/jwt/jwt.py`](https://auth.codesena.me/documents/sdk/jwt/jwt.py) | [`usage/jwt/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/jwt/) | `auth.jwt` (`jwt_handler`) | Creating, signing, and verifying access/refresh JWT tokens. |
| [`/sdk/oauth/oauth.md`](https://auth.codesena.me/documents/sdk/oauth/oauth.md)<br>[`/sdk/oauth/oauth.py`](https://auth.codesena.me/documents/sdk/oauth/oauth.py) | [`usage/oauth/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/oauth/) | `auth.oauth` (`OAuthService`) | Managing social provider authentication and account linking. |
| [`/sdk/oauth/google.md`](https://auth.codesena.me/documents/sdk/oauth/google.md)<br>[`/sdk/oauth/google.py`](https://auth.codesena.me/documents/sdk/oauth/google.py) | [`usage/oauth/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/oauth/) | `auth.google` (`GoogleOAuth`) | Configuring and handling Google OAuth 2.0 / OpenID Connect. |
| [`/sdk/oauth/github.md`](https://auth.codesena.me/documents/sdk/oauth/github.md)<br>[`/sdk/oauth/github.py`](https://auth.codesena.me/documents/sdk/oauth/github.py) | [`usage/oauth/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/oauth/) | `auth.github` (`GitHubOAuth`) | Configuring and handling GitHub OAuth 2.0 authorization. |
| [`/sdk/oauth/discord.md`](https://auth.codesena.me/documents/sdk/oauth/discord.md)<br>[`/sdk/oauth/discord.py`](https://auth.codesena.me/documents/sdk/oauth/discord.py) | [`usage/oauth/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/oauth/) | `auth.discord` (`DiscordOAuth`) | Configuring and handling Discord OAuth 2.0 authorization. |
| [`/sdk/otp/otp.md`](https://auth.codesena.me/documents/sdk/otp/otp.md)<br>[`/sdk/otp/otp.py`](https://auth.codesena.me/documents/sdk/otp/otp.py) | [`usage/otp/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/otp/) | `auth.otp` (`OTPService`) | Generating, verifying, burning, and revoking numeric OTPs. |
| [`/sdk/session/session.md`](https://auth.codesena.me/documents/sdk/session/session.md)<br>[`/sdk/session/session.py`](https://auth.codesena.me/documents/sdk/session/session.py) | [`usage/session/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/session/) | `auth.session` (`SessionService`) | Managing hashed sessions and single-device/all-device logout. |
| [`/sdk/dashboard/dashboard.md`](https://auth.codesena.me/documents/sdk/dashboard/dashboard.md)<br>[`/sdk/dashboard/dashboard.py`](https://auth.codesena.me/documents/sdk/dashboard/dashboard.py) | [`usage/dashboard/`](file:///d:/Code%20PlayGround/PROJECTS/AUTH_MODULE/usage/dashboard/) | `auth.dashboard` (`DashboardService`) | Retrieving database system metrics and statistics. |

---

## ⚡ AI Prompt Cheat Sheet

When generating or refactoring code using `tc_auth`, adhere to these fundamental rules:

```python
# 1. ALWAYS decouple database/Auth creation (connect.py) from FastAPI app initialization (run.py)
# connect.py:
from sqlalchemy import create_engine
from tc_auth import Auth

engine = create_engine("postgresql://user:pass@localhost:5432/mydb")
auth = Auth(engine=engine)

# 2. Configure services on the auth instance
auth.jwt.config(secret_key="secret", algorithm="HS256", session_duration_days=7, dual_token_mode=True)
auth.email.config(host="smtp.example.com", port=587, username="u", password="p", sender="noreply@app.com")
auth.google.config(client_id="ID", client_secret="SECRET", redirect_uri="https://api.app.com/tc-auth/google/callback")

# 3. Use dependencies in feature routers WITHOUT importing app
from fastapi import APIRouter, Depends
from connect import auth

router = APIRouter(prefix="/items")

@router.get("/")
def get_items(current_user=Depends(auth.deps.get_current_user)):
    account = current_user["account"]
    session = current_user["session"]
    return {"user_id": account["id"], "name": account["name"]}

@router.post("/admin-only")
def admin_action(admin=Depends(auth.role.require("admin"))):
    return {"message": "Admin granted", "account_id": admin["id"]}

# 4. Mount routes in run.py
from fastapi import FastAPI
from connect import auth
from routers.items import router as items_router

app = FastAPI()
auth.include_routes(app, prefix="/tc-auth")
app.include_router(items_router)
```

---

## 🔒 Security Guarantees

1. **Session Hashing**: Raw session secret tokens are never stored in plaintext in the database. Only `sha256(session_token)` is persisted.
2. **Dual-Layer Validation**: Every authenticated request validates both the cryptographically signed JWT claim AND the active session in the database.
3. **Safe OAuth Unlinking**: Users cannot unlink their last authentication method (e.g. unlinking Google when no password or other OAuth provider exists) to prevent account lockouts.
4. **Password Strength Validation**: Enforces minimum 6 characters with at least 1 uppercase letter, 1 lowercase letter, and 1 numeric digit.
5. **Hierarchical Custom Exceptions**: Zero unhandled generic tracebacks; all domain errors inherit from `AuthError` with predictable HTTP status codes and JSON responses.
