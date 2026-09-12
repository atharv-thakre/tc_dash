# HTTP REST API Reference

All endpoints documented here are mounted under the base prefix `/tc-auth` by default (e.g. `auth.include_routes(app, prefix="/tc-auth")`).

---

## 1. Authentication & Credentials Endpoints

### `POST /tc-auth/signup/password`
Registers a new user account with a password and immediately creates an active session.

- **Request Headers**: `Content-Type: application/json`
- **Request Body Schema**:
  ```json
  {
    "name": "string (Required)",
    "email": "string (Required, valid email format)",
    "password": "string (Required, min 6 chars, >=1 uppercase, >=1 lowercase, >=1 number)",
    "handle": "string (Optional, max 30 chars)"
  }
  ```
- **Example Request**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123",
    "handle": "jane_doe"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "account": {
      "id": 1,
      "uid": "e7b0d912-32a1-43e8-b7cf-12e09341b5a2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "handle": "jane_doe",
      "role": "user",
      "status": "active"
    }
  }
  ```
- **Error Responses**:
  - `400 WeakPasswordError`: Password does not meet complexity requirements.
  - `409 EmailAlreadyExistsError`: An account with this email already exists.
  - `409 HandleAlreadyExistsError`: The specified handle is already taken.

---

### `POST /tc-auth/signup/otp`
Registers a new user account by verifying a pre-sent 6-digit email OTP and setting their password simultaneously.

- **Request Body Schema**:
  ```json
  {
    "name": "string (Required)",
    "email": "string (Required, valid email format)",
    "password": "string (Required, validated for strength)",
    "otp": "string (Required, exact 6 digits)",
    "handle": "string (Optional)"
  }
  ```
- **Success Response (`200 OK`)**: Standard Auth Token Response (`access_token`, `refresh_token`, `account`).
- **Error Responses**:
  - `401 OTPInvalidError`: Code does not match.
  - `401 OTPExpiredError`: Code has expired (standard 10 min).
  - `404 OTPNotFoundError`: No active OTP found for this email.
  - `409 EmailAlreadyExistsError`: Email is already registered.

---

### `POST /tc-auth/login/password`
Authenticates an existing user via identifier (email, handle, or phone) and password.

- **Request Body Schema**:
  ```json
  {
    "identifier": "string (Required: email, handle, or phone number)",
    "password": "string (Required)"
  }
  ```
- **Success Response (`200 OK`)**: Standard Auth Token Response.
- **Error Responses**:
  - `401 InvalidCredentialsError`: Incorrect password or credentials.
  - `404 UserNotFoundError`: No account matches the provided identifier.

---

### `POST /tc-auth/login/otp`
Passwordless login for existing users by verifying a 6-digit email OTP.

- **Request Body Schema**:
  ```json
  {
    "email": "string (Required, valid email format)",
    "otp": "string (Required, exact 6 digits)",
    "password": "string (Optional)"
  }
  ```
- **Success Response (`200 OK`)**: Standard Auth Token Response.
- **Error Responses**:
  - `401 OTPInvalidError`, `401 OTPExpiredError`, `404 OTPNotFoundError`, `404 UserNotFoundError`.

---

### `POST /tc-auth/forgot/password`
Resets an account's password using a verified OTP.

- **Request Body Schema**:
  ```json
  {
    "email": "string (Required, valid email format)",
    "otp": "string (Required, exact 6 digits)",
    "password": "string (Required, new password meeting strength policy)"
  }
  ```
- **Success Response (`200 OK`)**: Standard Auth Token Response with freshly issued tokens.
- **Error Responses**:
  - `400 WeakPasswordError`, `401 OTPInvalidError`, `404 UserNotFoundError`.

---

### `POST /tc-auth/token/refresh`
Exchanges a valid refresh token for a newly issued access token (and rotates refresh token if configured).

- **Request Body Schema**:
  ```json
  {
    "refresh_token": "string (Required, valid JWT refresh token)"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```
- **Error Responses**:
  - `401 InvalidTokenError`: Refresh token is expired, tampered with, or revoked.

---

## 2. Email OTP & Magic Link Endpoints

### `POST /tc-auth/send/email/otp/{purpose}`
Sends a 6-digit numeric OTP email to the user. Also includes a one-click Magic Link button if `frontend_url` is provided or detected from the `Origin` header.

- **Path Parameters**:
  - `purpose`: `"signup"` | `"login"` | `"reset"` | `"verify"`
- **Query Parameters (Optional)**:
  - `frontend_url`: Base URL of the frontend app (e.g. `https://app.example.com`).
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "frontend_url": "https://app.example.com"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "expires_at": 1735689600
  }
  ```

---

### `POST /tc-auth/send/email/link/{purpose}`
Explicitly requests a Magic Link email for passwordless verification.

- **Path Parameters**: `purpose`: `"signup"` | `"login"` | `"reset"` | `"verify"`
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "frontend_url": "https://app.example.com"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "expires_at": 1735689600
  }
  ```

---

### `GET /tc-auth/link/{purpose}` (Direct Browser Click)
The URL clicked by the user inside their email inbox.

- **Path Parameters**: `purpose`: `"signup"` | `"login"` | `"reset"` | `"verify"`
- **Query Parameters**:
  - `email`: User's email address.
  - `otp`: The verification code.
  - `frontend_url` (Optional): Target frontend base URL.
- **Redirect Behaviors (`HTTP 307 Temporary Redirect`)**:
  - **`purpose="login"`**: Creates session, burns OTP, redirects to:
    `{frontend_url}/oauth/callback?access_token=...&refresh_token=...`
  - **`purpose="verify"`**: Verifies email, sets `status="active"`, burns OTP, redirects to:
    `{frontend_url}/magic-link/callback?verified=true&email={email}`
  - **`purpose="reset"`**: Validates OTP without burning, redirects to:
    `{frontend_url}/reset-password?email={email}&otp={otp}`
  - **`purpose="signup"`**: Validates OTP without burning, redirects to:
    `{frontend_url}/signup?email={email}&otp={otp}&verified=true`
  - **On Failure**: Redirects to:
    `{frontend_url}/magic-link/callback?error={url_encoded_error}`

---

### `POST /tc-auth/link/{purpose}` (Headless / Bot-Safe Verification)
Programmatic verification from a frontend landing page to prevent corporate antivirus scanners from consuming single-use links.

- **Path Parameters**: `purpose`: `"signup"` | `"login"` | `"reset"` | `"verify"`
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "otp": "492810"
  }
  ```
- **Success Response (`200 OK`)**:
  - For `login`: Returns standard `{ "access_token": "...", "refresh_token": "...", "token_type": "bearer", "account": {...} }`.
  - For `verify`: Returns `{ "success": true, "message": "Email verified successfully", "email": "..." }`.
  - For `reset`/`signup`: Returns `{ "success": true, "message": "OTP verified successfully for ...", "email": "..." }`.

---

## 3. Account Profile & Session Endpoints

> **All endpoints in this section require**: `Authorization: Bearer <access_token>`

### `GET /tc-auth/me`
Fetches current authenticated user profile, active session metadata, and decoded JWT claims.

- **Success Response (`200 OK`)**:
  ```json
  {
    "account": {
      "id": 1,
      "uid": "e7b0d912-32a1-43e8-b7cf-12e09341b5a2",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "handle": "jane_doe",
      "avatar_url": "https://example.com/avatar.png",
      "phone": "+1234567890",
      "role": "user",
      "status": "active",
      "created_at": "2026-01-01T00:00:00",
      "updated_at": "2026-01-01T00:00:00"
    },
    "session": {
      "id": 14,
      "account_id": 1,
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0...",
      "expires_at": "2026-01-08T00:00:00"
    },
    "payload": {
      "aid": 1,
      "sid": 14,
      "type": "access",
      "exp": 1767278400
    }
  }
  ```

---

### `PATCH /tc-auth/me`
Updates profile information for the authenticated user.

- **Request Body Schema**:
  ```json
  {
    "name": "string (Optional)",
    "email": "string (Optional, valid email)",
    "handle": "string (Optional, max 30 chars)",
    "avatar_url": "string (Optional)",
    "phone": "string (Optional, max 20 chars)"
  }
  ```
- **Success Response (`200 OK`)**: Updated `Account` dictionary.

---

### `PUT /tc-auth/update/password`
Updates password for the currently authenticated user.

- **Request Body Schema**:
  ```json
  {
    "password": "string (Required, validated for strength)"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully"
  }
  ```

---

### `POST /tc-auth/logout`
Terminates the current active session in the database.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Session destroyed successfully"
  }
  ```

---

### `POST /tc-auth/logout-all`
Terminates ALL active sessions across all devices for the authenticated user.
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "All sessions destroyed successfully"
  }
  ```

---

## 4. OAuth Social Login & Account Linking Endpoints

### `GET /tc-auth/{provider}/login`
Initiates OAuth authorization with provider (`google` | `github` | `discord`).

- **Path Parameters**: `provider`: `"google"` | `"github"` | `"discord"`
- **Query Parameters**:
  - `frontend_url` (Required): Target frontend URL (e.g. `https://app.example.com`).
- **Response**: `HTTP 307 Redirect` to provider's consent page.

---

### `GET /tc-auth/{provider}/callback`
OAuth provider callback endpoint. Exchanges code for token and user profile, handles auto-linking or registration, and redirects to frontend.

- **Response**: `HTTP 307 Redirect` to:
  `{frontend_url}/oauth/callback?access_token=...&refresh_token=...`

---

### `GET /tc-auth/account/oauth/links`
*(Requires Auth Bearer)* Lists all connected OAuth providers for the authenticated user.

- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "provider": "google",
      "created_at": "2026-01-01T00:00:00"
    }
  ]
  ```

---

### `POST /tc-auth/account/oauth/link/{provider}`
*(Requires Auth Bearer)* Initiates linking a new OAuth provider to the currently authenticated account.

- **Path Parameters**: `provider`: `"google"` | `"github"` | `"discord"`
- **Query Parameters**: `frontend_url`: Frontend base URL.
- **Response**: `HTTP 307 Redirect` to provider authorization screen.

---

### `DELETE /tc-auth/account/oauth/{provider}`
*(Requires Auth Bearer)* Unlinks the specified OAuth provider from the user's account.

- **Path Parameters**: `provider`: `"google"` | `"github"` | `"discord"`
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "OAuth account unlinked successfully"
  }
  ```
- **Error Responses**:
  - `400 AuthError`: If the user has no password set and this is their only linked provider (prevents account lockout).

---

## 5. Configuration & Administrative Routes

> **All routes below require**: `Authorization: Bearer <superadmin_token>` (except `/pulse`)

### System Config (`/tc-auth/config`)
- **`GET /tc-auth/config/pulse`** *(Public)*: Healthcheck returning `{ "status": "healthy", "state": "active" }`.
- **`GET /tc-auth/config/load/`**: Inspects runtime configuration for email, OAuth, and JWT.
- **`GET /tc-auth/config/counts`**: Returns total counts for accounts, sessions, OTPs, and OAuth links.
- **`POST /tc-auth/config/email`**: Updates SMTP configuration live.
- **`POST /tc-auth/config/google`**: Updates Google OAuth credentials.
- **`POST /tc-auth/config/github`**: Updates GitHub OAuth credentials.
- **`POST /tc-auth/config/discord`**: Updates Discord OAuth credentials.
- **`POST /tc-auth/config/jwt`**: Updates JWT secret, algorithm, and token durations.

### Admin Account Management (`/tc-auth/account`)
- **`GET /tc-auth/account/?page=1&limit=10`**: Paginated accounts list.
- **`GET /tc-auth/account/query?field={field}&value={value}`**: Query single account by field (`id`, `email`, `handle`, `phone`, `uid`).
- **`POST /tc-auth/account/`**: Super-create account (allows setting `role`, `status`, and `password`).
- **`PATCH /tc-auth/account/`**: Super-update account.
- **`DELETE /tc-auth/account/`**: Delete account with body `{"account_id": 1}`.

### Admin Session & OTP Management (`/tc-auth/session` & `/tc-auth/otp`)
- **`GET /tc-auth/session/?page=1&limit=10`**: Paginated active sessions.
- **`DELETE /tc-auth/session/cleanup`**: Deletes all expired sessions.
- **`DELETE /tc-auth/session/clear`**: Purges all sessions in the system.
- **`GET /tc-auth/otp/?page=1&limit=10`**: Paginated OTP records.
- **`DELETE /tc-auth/otp/cleanup`**: Deletes all expired OTP records.
- **`DELETE /tc-auth/otp/clear`**: Purges all OTP records.
