# `tc_auth` — AI & LLM Documentation Reference

> **Quick AI Context**: `tc_auth` is a modular, zero-null, production-ready authentication and authorization library for **FastAPI** applications backed by **SQLAlchemy**. It features a decoupled architecture (`connect.py` / `run.py`), dual-token JWT + hashed session management, password policy enforcement, Google/GitHub/Discord OAuth with safe linking, SMTP OTPs & Magic Links, and role/status-based dependency injection guards.

---

## 🌐 Static Hosted Documentation Mounts

All documentation files and code samples are publicly hosted and statically mounted under `https://auth.codesena.me/documents`:

- **REST API Documentation (`/api/`)**: `https://auth.codesena.me/documents/api/`
- **Python SDK Documentation (`/sdk/`)**: `https://auth.codesena.me/documents/sdk/`
- **AI & LLM-Optimized Docs (`/llm/`)**: `https://auth.codesena.me/documents/llm/`
- **Machine-Readable LLMs Index**: `https://auth.codesena.me/llms.txt`
- **Consolidated All-in-One LLM Pack**: `https://auth.codesena.me/llms-full.txt`
- **OpenAPI 3.0 API Specification**: `https://auth.codesena.me/openapi.json`
- **AI Plugin Manifest**: `https://auth.codesena.me/.well-known/ai-plugin.json`
- **XML Sitemap**: `https://auth.codesena.me/sitemap.xml`
- **Robots Policy**: `https://auth.codesena.me/robots.txt`

---

## 📚 Master Documentation Index & Links Matrix

### 1. AI & LLM Optimized Docs (`/documents/llm/`)
Designed specifically for AI coding agents and LLM system prompt injection with zero ambiguity, explicit type signatures, and exact schemas.

| Hosted URL | File Name | What It Contains | Why & When to Use It |
|---|---|---|---|
| [`/llm/README.md`](https://auth.codesena.me/documents/llm/README.md) | `README.md` | Navigation index, quick prompt cheat sheet, security guarantees. | Starting point for understanding the system and fast reference. |
| [`/llm/llms.txt`](https://auth.codesena.me/documents/llm/llms.txt) | `llms.txt` | LLMs.txt standard manifest file for AI tooling. | Used by LLM scrapers, Cursor, and IDE AI tools for project discovery. |
| [`/llm/llms-full.txt`](https://auth.codesena.me/documents/llm/llms-full.txt) | `llms-full.txt` | Dense, all-in-one consolidated context file. | Perfect for copying directly into LLM system prompts or large context windows. |
| [`/llm/ARCHITECTURE.md`](https://auth.codesena.me/documents/llm/ARCHITECTURE.md) | `ARCHITECTURE.md` | Decoupled pattern, token lifecycle, DB models, session hashing. | Explains the structural foundation and dual-layer verification logic. |
| [`/llm/SDK_REFERENCE.md`](https://auth.codesena.me/documents/llm/SDK_REFERENCE.md) | `SDK_REFERENCE.md` | Comprehensive Python SDK method signatures and parameters. | Essential when writing Python backend code interacting with `Auth` services. |
| [`/llm/API_REFERENCE.md`](https://auth.codesena.me/documents/llm/API_REFERENCE.md) | `API_REFERENCE.md` | Complete HTTP REST API endpoint reference and payloads. | Essential when building or testing client applications and API routes. |
| [`/llm/DEPENDENCIES_AND_RBAC.md`](https://auth.codesena.me/documents/llm/DEPENDENCIES_AND_RBAC.md) | `DEPENDENCIES_AND_RBAC.md` | FastAPI dependency injection (`auth.deps`, `auth.role`, `auth.status`). | Used when securing FastAPI route handlers with RBAC and status guards. |
| [`/llm/OAUTH_INTEGRATION.md`](https://auth.codesena.me/documents/llm/OAUTH_INTEGRATION.md) | `OAUTH_INTEGRATION.md` | Google, GitHub, and Discord OAuth 2.0 / OIDC setup & linking. | Reference for social login integration and lockout prevention. |
| [`/llm/ERRORS_AND_TROUBLESHOOTING.md`](https://auth.codesena.me/documents/llm/ERRORS_AND_TROUBLESHOOTING.md) | `ERRORS_AND_TROUBLESHOOTING.md` | Exception catalog, HTTP status mappings, debugging guide. | Used for handling API error responses and troubleshooting integration issues. |
| [`/llm/COOKBOOK_AND_EXAMPLES.md`](https://auth.codesena.me/documents/llm/COOKBOOK_AND_EXAMPLES.md) | `COOKBOOK_AND_EXAMPLES.md` | Copy-pasteable backend setup and frontend Axios client. | Ready-made boilerplates for rapid, error-free implementation. |

---

### 2. HTTP REST API Documentation (`/documents/api/`)
Detailed endpoint documentation for frontend developers, mobile teams, and QA testers.

| Hosted URL | Endpoints / Topics Covered | Why & When to Use It |
|---|---|---|
| [`/api/ROUTES_INDEX.md`](https://auth.codesena.me/documents/api/ROUTES_INDEX.md) | Master API index. | Quick routing map of all HTTP endpoints mounted under `/tc-auth`. |
| [`/api/login_route.md`](https://auth.codesena.me/documents/api/login_route.md) | Signup, Password Login, OTP Login, Magic Link, Forgot Password, Refresh Token. | Core authentication routes for user registration and sign-in. |
| [`/api/account_route.md`](https://auth.codesena.me/documents/api/account_route.md) | `/me`, Update Profile, Password Update, Logout, Logout-all, OAuth Link/Unlink. | Managing logged-in user profile, security settings, and sessions. |
| [`/api/oauth_route.md`](https://auth.codesena.me/documents/api/oauth_route.md) | Google, GitHub, and Discord `/login` and `/callback` redirect endpoints. | Implementing social login button redirects on frontend clients. |
| [`/api/oauth_integration.md`](https://auth.codesena.me/documents/api/oauth_integration.md) | Frontend OAuth integration guide (redirects, popup windows, callbacks). | Detailed client-side guide for handling OAuth redirect query parameters. |
| [`/api/token_usage_guide.md`](https://auth.codesena.me/documents/api/token_usage_guide.md) | Single-Token vs Dual-Token guide with Axios interceptor. | Best practices for storing tokens and managing automatic refreshes. |
| [`/api/dashboard_route.md`](https://auth.codesena.me/documents/api/dashboard_route.md) | `/config/pulse`, `/config/load/`, `/config/counts`, runtime configs. | Administrative endpoints for inspecting and configuring the live system. |
| [`/api/dash_account.md`](https://auth.codesena.me/documents/api/dash_account.md) | Superadmin Account CRUD (`GET /`, `GET /query`, `POST /`, `PATCH /`, `DELETE /`). | Building administrative panels for managing user accounts. |
| [`/api/dash_session.md`](https://auth.codesena.me/documents/api/dash_session.md) | Superadmin Session ops (`GET /`, `DELETE /`, `DELETE /all`, `DELETE /cleanup`, `DELETE /clear`). | Monitoring active user sessions and purging expired tokens. |
| [`/api/dash_otp.md`](https://auth.codesena.me/documents/api/dash_otp.md) | Superadmin OTP ops (`GET /`, `GET /query`, `POST /`, `DELETE /`, `DELETE /cleanup`). | Inspecting and managing OTP verification codes. |
| [`/api/dash_oauth.md`](https://auth.codesena.me/documents/api/dash_oauth.md) | Superadmin OAuth ops (`GET /`, `GET /query`, `POST /`, `DELETE /`). | Inspecting connected third-party OAuth links. |

---

### 3. Python SDK Documentation & Code (`/documents/sdk/`)
Guides and runnable Python files for each backend service module.

| Hosted Markdown / Code | Service / Feature | Why & When to Use It |
|---|---|---|
| [`/sdk/connect/connect.md`](https://auth.codesena.me/documents/sdk/connect/connect.md) ([Code](https://auth.codesena.me/documents/sdk/connect/connect.py)) | Core Initialization | Setting up the decoupled `Auth` instance with SQLAlchemy engine in `connect.py`. |
| [`/sdk/connect/run.md`](https://auth.codesena.me/documents/sdk/connect/run.md) ([Code](https://auth.codesena.me/documents/sdk/connect/run.py)) | App Mounting | Attaching routes, middlewares, and exception handlers to the FastAPI app in `run.py`. |
| [`/sdk/account/account.md`](https://auth.codesena.me/documents/sdk/account/account.md) ([Code](https://auth.codesena.me/documents/sdk/account/account.py)) | Account Service | Programmatic user creation, password verification, hashing, and status checks. |
| [`/sdk/auth/auth.md`](https://auth.codesena.me/documents/sdk/auth/auth.md) ([Code](https://auth.codesena.me/documents/sdk/auth/auth.py)) | Auth Service | Token creation, dual-token rotation, login/logout, and credential verification. |
| [`/sdk/dependency/auth_deps.md`](https://auth.codesena.me/documents/sdk/dependency/auth_deps.md) ([Code](https://auth.codesena.me/documents/sdk/dependency/auth_deps.py)) | User Injection | Injecting authenticated user, session, or token payload into route handlers. |
| [`/sdk/dependency/role_deps.md`](https://auth.codesena.me/documents/sdk/dependency/role_deps.md) ([Code](https://auth.codesena.me/documents/sdk/dependency/role_deps.py)) | Role RBAC | Protecting endpoints using `auth.role.require()`, `auth.role.allow()`, or `auth.role.block()`. |
| [`/sdk/dependency/status_deps.md`](https://auth.codesena.me/documents/sdk/dependency/status_deps.md) ([Code](https://auth.codesena.me/documents/sdk/dependency/status_deps.py)) | Status RBAC | Ensuring user status is `active`, `pending`, `suspended`, etc. before access. |
| [`/sdk/email/email.md`](https://auth.codesena.me/documents/sdk/email/email.md) ([Code](https://auth.codesena.me/documents/sdk/email/email.py)) | Email & OTP | SMTP configuration, sending OTP verification emails, and custom templates. |
| [`/sdk/email/magic_link.md`](https://auth.codesena.me/documents/sdk/email/magic_link.md) ([Code](https://auth.codesena.me/documents/sdk/email/magic_link.py)) | Magic Links | Generating, dispatching, and verifying passwordless email magic login links. |
| [`/sdk/get_user/get_user.md`](https://auth.codesena.me/documents/sdk/get_user/get_user.md) ([Code](https://auth.codesena.me/documents/sdk/get_user/get_user.py)) | User Lookup | Retrieving user records by ID, UID, email, handle, or phone number. |
| [`/sdk/jwt/jwt.md`](https://auth.codesena.me/documents/sdk/jwt/jwt.md) ([Code](https://auth.codesena.me/documents/sdk/jwt/jwt.py)) | JWT Engine | Low-level JWT signing, verification, expiry handling, and payload encoding. |
| [`/sdk/oauth/oauth.md`](https://auth.codesena.me/documents/sdk/oauth/oauth.md) ([Code](https://auth.codesena.me/documents/sdk/oauth/oauth.py)) | OAuth Providers | Connecting Google, GitHub, and Discord OAuth 2.0 flows and token exchange. |
| [`/sdk/otp/otp.md`](https://auth.codesena.me/documents/sdk/otp/otp.md) ([Code](https://auth.codesena.me/documents/sdk/otp/otp.py)) | OTP Engine | Generating secure 6-digit numeric OTPs, hashing codes, and verifying attempts. |
| [`/sdk/session/session.md`](https://auth.codesena.me/documents/sdk/session/session.md) ([Code](https://auth.codesena.me/documents/sdk/session/session.py)) | Session Management | Server-side session records, SHA-256 token hashing, and multi-device revocation. |
| [`/sdk/dashboard/dashboard.md`](https://auth.codesena.me/documents/sdk/dashboard/dashboard.md) ([Code](https://auth.codesena.me/documents/sdk/dashboard/dashboard.py)) | Dashboard Service | Statistics, account/session/OTP counts, and live system health metrics. |
