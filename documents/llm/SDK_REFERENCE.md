# Python SDK Reference

This document provides a comprehensive, type-annotated reference for all classes, services, and helper modules in `tc_auth`.

---

## 1. Main `Auth` Orchestrator

```python
from sqlalchemy import create_engine
from tc_auth import Auth

engine = create_engine("postgresql://user:pass@localhost:5432/mydb")
auth = Auth(engine=engine, app=None)
```

### Constructor: `Auth(engine: Engine, app: FastAPI | None = None)`
- **`engine`** (*Engine*): SQLAlchemy engine instance used to create session factories and database tables.
- **`app`** (*FastAPI | None*, optional): Optional FastAPI application instance. If passed, routes, middleware, and exception handlers are automatically registered.

### Instance Attributes (Attached Services)
| Property | Class | Purpose |
|---|---|---|
| `auth.account` | `AccountService` | Account CRUD, profile updates, super-updates, queries |
| `auth.service` | `AuthService` | User signup, password/OTP login, token refresh, password hashing |
| `auth.session` | `SessionService` | Database session creation, verification, revocation, cleanup |
| `auth.otp` | `OTPService` | 6-digit numeric OTP generation, verification, and revocation |
| `auth.get_user` | `GetUserService` | Fast lookup of accounts by ID, UID, email, handle, or phone |
| `auth.oauth` | `OAuthService` | Provider authentication, auto-linking, manual linking, unlinking |
| `auth.google` | `GoogleOAuth` | Google OAuth 2.0 / OpenID Connect provider adapter |
| `auth.github` | `GitHubOAuth` | GitHub OAuth 2.0 provider adapter |
| `auth.discord` | `DiscordOAuth` | Discord OAuth 2.0 provider adapter |
| `auth.jwt` | `jwt_handler` (module) | JWT encoding, decoding, token verification, expiration configs |
| `auth.email` | `EmailService` | SMTP email dispatcher, OTP and Magic Link emails |
| `auth.deps` | `AuthDeps` | Core FastAPI dependency injection functions (`get_current_user`, etc.) |
| `auth.role` | `RoleDeps` | Role-based access control guards (`require`, `allow`, `block`) |
| `auth.status` | `StatusDeps` | Account status access control guards (`require`, `allow`, `block`) |
| `auth.dashboard` | `DashboardService` | System counts and administrative statistics |

### Core Methods
- **`auth.init() -> None`**
  Creates all database tables (`accounts`, `sessions`, `otps`, `oauth_accounts`) bound to the SQLAlchemy engine.
- **`auth.destroy() -> None`**
  Drops all database tables. Useful for test teardowns.
- **`auth.include_routes(app: FastAPI, prefix: str = "/tc-auth") -> None`**
  Registers exception handlers, session middleware, and mounts all route handlers under `prefix`.

---

## 2. `auth.account` (`AccountService`)

### `create_user(name=None, email=None, handle=None, phone=None, password=None, avatar_url=None, role="user", status="active") -> dict`
Creates an account record directly in the database.
- **Parameters**:
  - `name` (*str | None*): Full display name.
  - `email` (*str | None*): Unique email address.
  - `handle` (*str | None*): Unique @username handle.
  - `phone` (*str | None*): Unique phone number.
  - `password` (*str | None*): Plaintext password (validated and hashed).
  - `avatar_url` (*str | None*): Image URL for avatar.
  - `role` (*str*): User role (default: `"user"`).
  - `status` (*str*): Account status (default: `"active"`).
- **Returns**: Dictionary representing the created `Account`.
- **Raises**: `EmailAlreadyExistsError`, `HandleAlreadyExistsError`, `PhoneAlreadyExistsError`, `WeakPasswordError`.

### `update_user(account_id: int, **kwargs) -> dict`
Updates non-sensitive profile fields for an account (`name`, `email`, `handle`, `phone`, `avatar_url`).
- **Returns**: Updated `Account` dictionary.

### `super_update(account_id: int, **kwargs) -> dict`
Administrative update allowing modification of `role`, `status`, `password`, and all profile fields.
- **Returns**: Updated `Account` dictionary.

### `update_password(account_id: int, password: str) -> dict`
Validates password strength, hashes it with Argon2/Bcrypt, and updates the account.
- **Returns**: `{"success": True, "message": "Password updated successfully"}`.

### `delete_user(account_id: int) -> dict`
Deletes the account and cascades deletion to all sessions, OAuth links, and OTP records.
- **Returns**: `{"success": True, "message": "Account deleted successfully"}`.

### `get_all(page: int = 1, limit: int = 10) -> dict`
Paginated account listing.
- **Returns**: `{"total": int, "page": int, "limit": int, "accounts": list[dict]}`.

### `query(field: str, value: str) -> dict`
Searches for an account by `field` (`"id"`, `"email"`, `"handle"`, `"phone"`, `"uid"`).

---

## 3. `auth.service` (`AuthService`)

### `signup(name: str, email: str, password: str, handle: str | None = None, ip_address: str | None = None, user_agent: str | None = None) -> dict`
Registers a new account, validates password strength, creates a database session, and generates auth tokens.
- **Returns**:
  ```python
  {
      "access_token": "eyJhbGci...",
      "token_type": "bearer",
      "refresh_token": "eyJhbGci...", # If dual_token_mode=True
      "account": {...}
  }
  ```

### `login(identifier: str, password: str, ip_address: str | None = None, user_agent: str | None = None) -> dict`
Authenticates via email, handle, or phone with password, creating a new session record.
- **Returns**: Standard auth token response dictionary.
- **Raises**: `InvalidCredentialsError`, `UserNotFoundError`.

### `login_magic_link(email: str, otp: str, ip_address: str | None = None, user_agent: str | None = None) -> dict`
Verifies single-use magic link OTP, deletes the OTP record, creates a session, and issues tokens.
- **Returns**: Standard auth token response dictionary.

### `verify_email_magic_link(email: str, otp: str) -> dict`
Verifies OTP code and sets user's account `status = "active"`.
- **Returns**: `{"success": True, "message": "Email verified successfully", "email": email}`.

### `refresh_tokens(refresh_token: str) -> dict`
Validates a refresh token signature and type, looks up the session in the database, and issues a fresh access token.
- **Returns**: `{"access_token": str, "refresh_token": str, "token_type": "bearer"}`.
- **Raises**: `InvalidTokenError`.

---

## 4. `auth.session` (`SessionService`)

### `create_session(account_id: int, ip_address: str | None = None, user_agent: str | None = None, expires_days: int = 7) -> dict`
Generates a random 32-byte secret token, computes `token_hash = sha256(secret)`, persists the session to DB, and returns:
```python
{
    "id": 14,
    "account_id": 1,
    "token": "raw-secret-token", # Embedded in JWT
    "token_hash": "e3b0c44...",  # Stored in DB
    "expires_at": datetime(...),
}
```

### `by_id(session_id: int) -> dict | None`
Retrieves a session record by its numeric ID.

### `destroy_session(session_id: int) -> dict`
Deletes a specific session by ID.
- **Returns**: `{"success": True, "message": "Session destroyed successfully"}`.

### `destroy_all(account_id: int) -> dict`
Deletes all active sessions for the specified `account_id` (force logout everywhere).

### `cleanup_expired() -> dict`
Deletes all expired sessions (`expires_at < now()`).

### `clear_all() -> dict`
Purges all sessions across all users.

---

## 5. `auth.otp` (`OTPService`)

### `create(identifier: str, purpose: str, expires_minutes: int = 10) -> dict`
Generates a cryptographically secure 6-digit numeric OTP code, stores `code_hash = sha256(otp)` in the database, and returns:
```python
{
    "otp": "492810",
    "identifier": "user@example.com",
    "purpose": "signup",
    "expires_at": datetime(...),
}
```

### `check(identifier: str, purpose: str, otp: str) -> bool`
Validates the OTP code without deleting/consuming it. (Used during multi-step flows like password reset).
- **Raises**: `OTPNotFoundError`, `OTPExpiredError`, `OTPInvalidError`.

### `verify(identifier: str, purpose: str, otp: str) -> bool`
Validates the OTP code and **permanently burns/deletes** it from the database upon success. Increments `attempts` counter on failure.
- **Raises**: `OTPNotFoundError`, `OTPExpiredError`, `OTPInvalidError`.

### `revoke(identifier: str, purpose: str | None = None) -> dict`
Deletes active OTP records for an identifier.

---

## 6. `auth.get_user` (`GetUserService`)

High-performance account lookup service. All methods raise `UserNotFoundError` if no matching account exists:
- `auth.get_user.by_id(account_id: int) -> dict`
- `auth.get_user.by_uid(uid: str | UUID) -> dict`
- `auth.get_user.by_email(email: str) -> dict`
- `auth.get_user.by_handle(handle: str) -> dict`
- `auth.get_user.by_phone(phone: str) -> dict`
- `auth.get_user.by_identifier(identifier: str) -> dict` (Auto-detects whether `identifier` is an ID, email, handle, or phone)

---

## 7. `auth.oauth` (`OAuthService`)

### `authenticate_or_register(provider: str, provider_user_id: str, email: str | None = None, name: str | None = None, avatar_url: str | None = None, link_account_id: int | None = None) -> dict`
Orchestrates social authentication:
1. If `link_account_id` provided: links provider to active user.
2. If OAuth record exists: returns linked `Account`.
3. If verified email matches existing user: auto-links provider and returns `Account`.
4. Otherwise: creates new `Account` with `status="active"` and links provider.

### `link_account(account_id: int, provider: str, provider_user_id: str) -> dict`
Links an external provider to an existing account.
- **Raises**: `OAuthAlreadyLinkedError`.

### `unlink_account(account_id: int, provider: str, enforce_active_auth: bool = True) -> dict`
Unlinks a provider. If `enforce_active_auth=True`, ensures the user has a password or at least one other OAuth provider before allowing unlinking.

---

## 8. `auth.jwt` (`jwt_handler`)

### `config(secret_key: str, algorithm: str = "HS256", session_duration_days: int = 7, dual_token_mode: bool = False, access_token_expire_minutes: int = 15, refresh_token_expire_days: int = 7) -> dict`
Configures JWT settings. Supported algorithms: `"HS256"`, `"HS384"`, `"HS512"`.

### `create_access_token(data: dict) -> str`
Creates a signed JWT with `type="access"` and expiration timestamp.

### `create_refresh_token(data: dict) -> str`
Creates a signed JWT with `type="refresh"` and long-lived expiration.

### `verify_token(token: str) -> dict`
Decodes and validates JWT signature and expiry.
- **Raises**: `InvalidTokenError`.

---

## 9. `auth.email` (`EmailService`)

### `config(host: str, port: int, username: str, password: str, sender: str, sender_name: str = "Auth", use_tls: bool = True) -> dict`
Configures SMTP credentials.

### `send_otp(email: str, purpose: str, frontend_url: str | None = None, backend_url: str | None = None) -> dict`
Generates an OTP code and dispatches a branded HTML email containing both the 6-digit code and a one-click Magic Link button.

### `send_magic_link(email: str, purpose: str, frontend_url: str, backend_url: str) -> dict`
Explicitly sends an HTML email with a one-click Magic Link button.

### Purpose Shortcut Methods
- `auth.email.send_login_otp(email, frontend_url=None)`
- `auth.email.send_verify_email(email, frontend_url=None)`
- `auth.email.send_reset_otp(email, frontend_url=None)`
- `auth.email.send_signup_otp(email, frontend_url=None)`
