# Magic Link Authentication Guide

The **Magic Link** authentication system is built directly on top of `tc_auth`'s battle-tested email OTP infrastructure.

Instead of requiring a separate database model, Magic Links leverage the existing `OTP` table and lifecycle (`code_hash`, expiry, single-use invalidation, attempt tracking).

---

## 1. When to Use Which Endpoint (Explicit Intent Guideline)

To ensure the best user experience and clear separation of intent:

| User Action in UI | Endpoint to Call | Rationale |
| :--- | :--- | :--- |
| User explicitly clicks **"Send me Magic Link"** / **"Sign In with Magic Link"** button | **`POST /tc-auth/send/email/link/{purpose}`** | **Use this route ONLY when the user explicitly requests a magic link.** Communicates explicit intent, sets descriptive email subjects (e.g. *"Sign-In Link & Code"*), and requires/resolves the frontend URL destination. |
| User submits standard login/signup or clicks **"Send OTP"** | **`POST /tc-auth/send/email/otp/{purpose}`** | Standard OTP submission. The email will still conveniently provide the one-click Magic Link button if `frontend_url` is provided or automatically detected via the `Origin` header. |

---

## 2. Note: Existing Send OTP Route Also Mails Magic Links!

The existing `POST /tc-auth/send/email/otp/{purpose}` endpoint automatically emails the one-click Magic Link button alongside the 6-digit OTP code whenever a frontend URL is detected via:
1. JSON body: `{"email": "...", "frontend_url": "https://app.example.com"}`
2. Query parameter: `?frontend_url=https://app.example.com`
3. Automatic browser header: `Origin: https://app.example.com`

---

## 3. Dual Authentication Inside Every Email

Every email dispatched through the magic link flow contains:
1. **One-Click CTA Button**: "Click to Proceed" which logs the user in or completes the requested action immediately.
2. **Manual 6-Digit Verification Code**: Displayed below the button for users who access their email on a separate device (e.g. email on smartphone, signing in on desktop).

---

## 4. Single-Token & Dual-Token Mode Compatibility

Magic links dynamically support both single-token mode and dual-token mode:

| Mode | `GET /tc-auth/link/login` (Redirect) | `POST /tc-auth/link/login` (JSON) |
| :--- | :--- | :--- |
| **Single-Token Mode** | Redirects to `{frontend_url}/oauth/callback?access_token=...` | Returns `{ "access_token": "...", "account": {...} }` |
| **Dual-Token Mode** | Redirects to `{frontend_url}/oauth/callback?access_token=...&refresh_token=...` | Returns `{ "access_token": "...", "refresh_token": "...", "account": {...} }` |

---

## 5. Dual Verification Architecture

To support standard browser clicks as well as single-page applications (protecting against enterprise email antivirus scanner bots), two verification pathways are provided:

```
                            User Clicks Link in Email
                                       │
           ┌───────────────────────────┴───────────────────────────┐
           ▼                                                       ▼
Direct Browser Verification                                SPA Bot-Safe Verification
GET /tc-auth/link/login                                   POST /tc-auth/link/login
           │                                                       │
           ▼                                                       ▼
Backend verifies OTP                                      Frontend calls API via fetch
Issues access & refresh tokens                            Returns JSON payload
Redirects HTTP 307 to:                                    Tokens persisted in localStorage
{frontend_url}/oauth/callback                             or cookies
?access_token=...&refresh_token=...                                │
           │                                                       ▼
           ▼                                              User Authenticated!
Reuses Frontend OAuth Handler!
```

---

## 6. Endpoints Reference

### 6.1 Request a Magic Link
#### `POST /tc-auth/send/email/link/{purpose}` (Dedicated)
Call this route when user clicks "Send me Magic Link":
- **Path Parameter**: `purpose` (`signup` | `login` | `reset` | `verify`)
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "frontend_url": "https://app.example.com"
  }
  ```
- **Response (HTTP 200 OK)**:
  ```json
  {
    "expires_at": 1735689600
  }
  ```

#### `POST /tc-auth/send/email/otp/{purpose}` (Enhanced)
Accepts an optional `frontend_url` in body, query param, or via `Origin` header.

---

### 6.2 Direct Browser Verification (GET)
#### `GET /tc-auth/link/{purpose}?email=...&otp=...&frontend_url=...`
Clicked directly from the user's email client.

| Purpose | Action on Success | HTTP Status & Redirect Location |
| :--- | :--- | :--- |
| **`login`** | Verifies OTP, generates session, creates tokens | **HTTP 307 Redirect** to `{frontend_url}/oauth/callback?access_token=...(&refresh_token=...)` |
| **`verify`** | Verifies OTP, sets user account status to `"active"` | **HTTP 307 Redirect** to `{frontend_url}/magic-link/callback?verified=true&email=...` |
| **`reset`** | Validates OTP without consuming, keeps code active | **HTTP 307 Redirect** to `{frontend_url}/reset-password?email=...&otp=...` |
| **`signup`** | Validates OTP without consuming | **HTTP 307 Redirect** to `{frontend_url}/signup?email=...&otp=...&verified=true` |

#### Failure Redirect
If the OTP has expired, was already used, or is invalid:
- **HTTP 307 Redirect** to `{frontend_url}/magic-link/callback?error={url_encoded_error}`.

---

### 6.3 Programmatic API Verification (POST)
#### `POST /tc-auth/link/{purpose}`
Intended for SPAs, mobile apps, or confirmation intermediate pages to defend against automated link-pre-fetching corporate email scanners.

- **Path Parameter**: `purpose` (`signup` | `login` | `reset` | `verify`)
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "otp": "123456"
  }
  ```
- **Response for `login` (HTTP 200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "Bearer",
    "account": {
      "id": 1,
      "email": "jane@example.com",
      "name": "Jane Doe",
      "role": "user",
      "status": "active"
    }
  }
  ```
- **Response for `verify` (HTTP 200 OK)**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully",
    "email": "jane@example.com"
  }
  ```

---

## 7. Python SDK Usage

```python
from tc_auth import Auth

# Send magic link explicitly
auth.email.send_magic_link(
    email="jane@example.com",
    purpose="login",
    frontend_url="https://app.example.com",
    expiry=300,  # 5 minutes
)

# Or send OTP with magic link button
auth.email.send_login_otp(
    email="jane@example.com",
    frontend_url="https://app.example.com",
)

# Verify email directly via service
auth.service.verify_email_magic_link(
    email="jane@example.com",
    otp="123456",
)
```

---

## 8. Security & Edge Cases Handled

1. **Replay Attack Prevention**: Single-use OTP records are immediately invalidated/deleted upon successful login or verification. Repeated clicks are safely rejected with an error redirect.
2. **Timing / Expiry Enforcement**: Expired tokens cannot be used and automatically trigger an error redirect.
3. **No Redundant DB Tables**: Reuses the core OTP engine for full consistency with brute-force protection and rate limits.
4. **Proxy & SSL Support**: Magic Link URLs automatically resolve reverse-proxy forwarded protocols (`X-Forwarded-Proto`, `X-Forwarded-Host`) and respect custom route prefixes.
