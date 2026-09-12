# Errors & Troubleshooting Guide

`tc_auth` uses a standardized, hierarchical exception system where every domain error inherits from `AuthError`.

---

## 1. Exception Catalog & HTTP Status Codes

| Exception Class | HTTP Status | Description / Common Cause |
|---|---|---|
| `AuthError` | `400` | Base exception for all auth module errors. |
| `InvalidFieldError` | `400` | An invalid payload field or parameter was provided. |
| `InvalidEmailPurposeError` | `400` | Purpose is not one of `"signup"`, `"login"`, `"reset"`, `"verify"`. |
| `WeakPasswordError` | `400` | Password fails complexity (needs 6+ chars, 1 uppercase, 1 lowercase, 1 digit). |
| `InvalidConfigError` | `400` | Misconfigured service parameter (e.g. invalid JWT algorithm). |
| `OAuthCallbackError` | `400` | Provider callback returned error or missing code/state. |
| `InvalidCredentialsError` | `401` | Incorrect password or invalid identifier during login. |
| `InvalidTokenError` | `401` | Missing, malformed, expired, or invalid JWT access/refresh token. |
| `OTPInvalidError` | `401` | Supplied OTP code does not match stored hash. |
| `OTPExpiredError` | `401` | OTP code has expired. |
| `PermissionDeniedError` | `403` | User does not possess the required role (`auth.role`). |
| `AccountStatusError` | `403` | User account status is prohibited (`auth.status`). |
| `UserNotFoundError` | `404` | No account matches the provided ID, UID, email, handle, or phone. |
| `SessionNotFoundError` | `404` | Session ID does not exist in the database. |
| `OTPNotFoundError` | `404` | No active OTP found for the given identifier and purpose. |
| `OAuthLinkNotFoundError` | `404` | Attempted to query or delete a non-existent OAuth connection. |
| `EmailAlreadyExistsError` | `409` | Email is already registered to another account. |
| `HandleAlreadyExistsError` | `409` | Handle (`@username`) is already taken. |
| `PhoneAlreadyExistsError` | `409` | Phone number is already registered. |
| `OAuthAlreadyLinkedError` | `409` | The OAuth provider account is already linked to another user. |
| `EmailSendError` | `502` | SMTP server connection failed or rejected email delivery. |
| `EmailNotConfiguredError` | `500` | Email action called without configuring `auth.email.config()`. |
| `OAuthNotConfiguredError` | `500` | OAuth route called without configuring provider credentials. |
| `DatabaseError` | `500` | Unexpected database exception occurred. |

---

## 2. Standard Error Response JSON Format

When any `AuthError` is raised in FastAPI, the registered `auth_exception_handler` intercepts it and formats the response as:

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

---

## 3. Common Troubleshooting Scenarios

### 1. `InvalidTokenError: Refresh token cannot be used as an access token`
- **Cause**: The client sent a refresh token in the `Authorization: Bearer <token>` header of a protected API route.
- **Solution**: Refresh tokens should only be sent in the request body to `POST /tc-auth/token/refresh`. Protected routes require the short-lived `access_token`.

### 2. `InvalidTokenError: Session has expired` or `Session not found`
- **Cause**: The server-side session was deleted (user logged out, admin revoked session) or expired, even though the JWT signature was valid.
- **Solution**: Prompt the user to re-authenticate or refresh their token.

### 3. `PermissionDeniedError: Role 'user' is not permitted. Required: admin`
- **Cause**: Route guarded by `auth.role.require("admin")` was accessed by a standard user.
- **Solution**: Upgrade the user's role via `auth.account.super_update(account_id, role="admin")` or check permissions before dispatching frontend request.

### 4. `WeakPasswordError` on Signup
- **Cause**: Password did not satisfy complexity rules.
- **Policy**: Must contain:
  1. Minimum 6 characters.
  2. At least 1 uppercase letter (`A-Z`).
  3. At least 1 lowercase letter (`a-z`).
  4. At least 1 numeric digit (`0-9`).

### 5. Circular Import Errors on App Startup
- **Cause**: Importing `app` inside a router that also imports `auth`.
- **Solution**: Follow the Decoupled Pattern. Define `auth` and `engine` in `connect.py`, import `auth` in your routers, and import everything in `run.py`.
