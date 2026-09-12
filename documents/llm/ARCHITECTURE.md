# Architecture & Core Concepts

This document explains the architectural principles, lifecycle patterns, and database design powering `tc_auth`.

---

## 1. Decoupled Architecture (`connect.py` + `run.py`)

In traditional monolithic FastAPI apps, developers often instantiate both the database, authentication instance, and the FastAPI `app` object in a single `main.py` file. When modular feature routers (`routers/items.py`, `routers/posts.py`) import auth dependencies, this results in **circular import errors**.

`tc_auth` solves this with a clean **2-file decoupled pattern**:

```text
my_fastapi_app/
├── connect.py            # 1. Database engine & Auth instantiation & configs
├── run.py                # 2. FastAPI app assembly, CORS, route mounting, & server execution
├── routers/
│   ├── items.py          # Imports `auth` from `connect` safely
│   └── users.py
```

### `connect.py` (Database & Auth Config)
```python
from sqlalchemy import create_engine
from tc_auth import Auth

# Initialize DB Engine
engine = create_engine("postgresql://postgres:password@localhost:5432/mydb")

# Instantiate Auth (without passing app)
auth = Auth(engine=engine)

# Configure JWT, SMTP, and OAuth services
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=7,
    dual_token_mode=True,            # Set True for Access (15m) + Refresh (7d)
    access_token_expire_minutes=15,
    refresh_token_expire_days=7,
)

auth.email.config(
    host="smtp.example.com",
    port=587,
    username="mailer@example.com",
    password="smtp-password",
    sender="noreply@example.com",
    sender_name="My App",
    use_tls=True,
)

auth.google.config(
    client_id="GOOGLE_CLIENT_ID",
    client_secret="GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/google/callback",
)
```

### `run.py` (FastAPI App & Route Mounting)
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from connect import auth
from routers.items import router as items_router

app = FastAPI(title="Production Service")

# 1. CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Wire tc_auth routes (auto-adds ExceptionHandler & SessionMiddleware)
auth.include_routes(app, prefix="/tc-auth")

# 3. Include domain routers
app.include_router(items_router)
```

---

## 2. Database Schema & Models

`tc_auth` uses SQLAlchemy with four core models:

### `Account` (`accounts` table)
| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `Integer` | Primary Key, Autoincrement | Internal numeric ID for foreign keys |
| `uid` | `UUID` | Unique, Non-nullable, Indexed, Default: `uuid4` | Public UUID for API exposure |
| `name` | `String(100)` | Nullable | User display name |
| `handle` | `String(30)` | Unique, Nullable, Indexed | Public @username handle |
| `email` | `String(255)` | Unique, Nullable, Indexed | User email address |
| `phone` | `String(20)` | Unique, Nullable, Indexed | User phone number |
| `password_hash` | `Text` | Nullable | Argon2/Bcrypt hashed password |
| `avatar_url` | `Text` | Nullable | Profile avatar image URL |
| `role` | `String(50)` | Non-nullable, Default: `"user"` | User role (e.g. `"user"`, `"admin"`, `"superadmin"`) |
| `status` | `String(100)` | Nullable, Default: `"active"` | Account status (e.g. `"active"`, `"pending"`, `"suspended"`) |
| `created_at` | `TIMESTAMP` | Server Default: `now()` | Timestamp of account creation |
| `updated_at` | `TIMESTAMP` | Server Default: `now()`, onupdate: `now()` | Timestamp of last account update |

### `Session` (`sessions` table)
| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `Integer` | Primary Key, Autoincrement | Numeric session ID |
| `account_id` | `Integer` | Foreign Key (`accounts.id`, ondelete: CASCADE), Indexed | Associated user account |
| `token_hash` | `Text` | Unique, Non-nullable | SHA-256 hash of the random session token secret |
| `ip_address` | `String(45)` | Nullable | Client IPv4 / IPv6 address |
| `user_agent` | `Text` | Nullable | Client browser / device user-agent string |
| `expires_at` | `TIMESTAMP` | Non-nullable | Session expiration timestamp |
| `created_at` | `TIMESTAMP` | Server Default: `now()` | Session creation timestamp |

### `OTP` (`otps` table)
| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `Integer` | Primary Key, Autoincrement | Numeric OTP record ID |
| `identifier` | `String(255)` | Non-nullable, Indexed | Email address or phone number target |
| `purpose` | `String(100)` | Non-nullable | `"signup"`, `"login"`, `"reset"`, `"verify"` |
| `code_hash` | `Text` | Non-nullable | Cryptographic hash of the 6-digit OTP code |
| `attempts` | `Integer` | Non-nullable, Default: `0` | Number of failed verification attempts |
| `expires_at` | `TIMESTAMP` | Non-nullable | OTP expiration timestamp (typically 5-10 minutes) |
| `created_at` | `TIMESTAMP` | Server Default: `now()` | Creation timestamp |

### `OAuthAccount` (`oauth_accounts` table)
| Column | Type | Constraints / Defaults | Description |
|---|---|---|---|
| `id` | `Integer` | Primary Key, Autoincrement | Numeric OAuth link ID |
| `account_id` | `Integer` | Foreign Key (`accounts.id`, ondelete: CASCADE), Indexed | Linked user account |
| `provider` | `String(30)` | Non-nullable, Indexed | `"google"`, `"github"`, `"discord"` |
| `provider_user_id` | `String(255)` | Non-nullable, Indexed | External provider unique user identifier (sub/id) |
| `created_at` | `TIMESTAMP` | Server Default: `now()` | Link creation timestamp |

*Unique constraints: `(provider, provider_user_id)` and `(account_id, provider)`.*

---

## 3. Cryptographic Session Hashing & Dual-Layer Verification

`tc_auth` does not rely solely on stateless JWTs or stateful session cookies; it employs **Dual-Layer Verification**:

```
[ Incoming Request with Bearer Token ]
                 │
                 ▼
     1. Verify JWT Signature & Expiry
                 │ (Extract aid, sid, token secret)
                 ▼
     2. Lookup Session in DB by sid
                 │
                 ▼
     3. Verify SHA-256(token secret) == session.token_hash
                 │
                 ▼
     4. Check session.expires_at > now()
                 │
                 ▼
     5. Lookup Account by aid
                 │
                 ▼
   [ Grant Access & Inject Dependencies ]
```

### Why this is superior:
1. **Instant Session Revocation**: If an admin blocks a user or the user clicks "Logout from all devices", deleting the session records in the DB invalidates the JWT immediately on the next request.
2. **Database Leak Protection**: If the `sessions` table is leaked, the attacker only gets SHA-256 hashes (`token_hash`), which cannot be used to forge tokens.

---

## 4. Single-Token vs. Dual-Token Architecture

`tc_auth` supports two token operation modes configured via `auth.jwt.config()`:

### Single-Token Mode (`dual_token_mode=False`, Default)
- Generates a single long-lived **Access Token** (e.g. 7 days).
- Token contains: `{"aid": account_id, "sid": session_id, "token": raw_secret, "type": "access", "exp": ...}`.
- Best for prototypes, mobile apps with permanent tokens, or simple internal tools.

### Dual-Token Mode (`dual_token_mode=True`)
- Generates two tokens on login/signup:
  1. **Short-lived Access Token**: 15 minutes validity. Used for authenticating API requests.
  2. **Long-lived Refresh Token**: 7 days validity. Used strictly with `POST /tc-auth/token/refresh` to obtain a fresh access token without re-authenticating.
- `POST /tc-auth/token/refresh` payload: `{"refresh_token": "..."}`.
- If a refresh token is passed to a protected API route as a Bearer token, it is rejected with an `InvalidTokenError`.

---

## 5. Password Policy Engine

All password creation and update flows (`signup`, `forgot_password`, `update_password`, `super_create`, `super_update`) enforce password strength validation:

- **Minimum Length**: 6 characters.
- **Uppercase**: At least 1 uppercase ASCII letter (`A-Z`).
- **Lowercase**: At least 1 lowercase ASCII letter (`a-z`).
- **Digit**: At least 1 numeric digit (`0-9`).

If the password fails these criteria, a `WeakPasswordError` (HTTP 400) is raised.

---

## 6. Zero Null & Standardized Responses

Every API endpoint and service response adheres to predictable JSON envelopes:

### Standard Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

### Standard Auth Token Response (Login/Signup)
```json
{
  "access_token": "eyJhbGciOi...",
  "token_type": "bearer",
  "refresh_token": "eyJhbGciOi...",
  "account": {
    "id": 1,
    "uid": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Alex Doe",
    "email": "alex@example.com",
    "handle": "alex",
    "role": "user",
    "status": "active"
  }
}
```

### Standard Error Response
```json
{
  "status": false,
  "error": {
    "code": "InvalidCredentialsError",
    "message": "Invalid credentials",
    "details": null
  }
}
```
