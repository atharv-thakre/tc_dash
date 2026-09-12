# Sign In / Sign Up Routes

Base path: `/tc-auth`

Authentication:

- All routes in this group are public.
- Successful signup and login responses return an `access_token` that must be sent as `Authorization: Bearer <access_token>` to protected routes.

Common responses:

- `200 OK` on success.
- `400` / `422` for validation failures.
- `401` for invalid credentials or invalid OTP values.
- `404` when the target account does not exist.

Common login response (Default / Single-Token Mode):

```json
{
  "access_token": "jwt-token",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
    "name": "Jane Doe",
    "handle": "jane",
    "email": "jane@example.com",
    "phone": null,
    "avatar_url": null,
    "role": "user",
    "status": "active",
    "created_at": "2026-08-07T12:00:00",
    "updated_at": "2026-08-07T12:00:00"
  }
}
```

Common login response (When Dual-Token Mode is enabled):

```json
{
  "access_token": "short-lived-jwt-access-token",
  "refresh_token": "long-lived-jwt-refresh-token",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
}
```

Password Policy:
All passwords set or updated must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number. Failing this returns `400 Bad Request` (`WeakPasswordError`).

## POST `/send/email/otp/{purpose}`

Sends an email OTP for the supplied purpose. If `frontend_url` is provided, the email also includes a one-click Magic Link button alongside the OTP code.

Path parameter:

- `purpose` - OTP purpose key: `signup`, `login`, `reset`, or `verify`.

Body:

```json
{
  "email": "jane@example.com",
  "frontend_url": "https://app.example.com" // optional
}
```

Response:

```json
{
  "expires_at": 1735689600
}
```

Example:

```js
await fetch(`${baseUrl}/tc-auth/send/email/otp/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "jane@example.com",
    frontend_url: "https://app.example.com"
  }),
});
```

## POST `/send/email/link/{purpose}`

Explicitly requests a Magic Link email for the supplied purpose. The dispatched email contains both a prominent one-click action button and a manual 6-digit verification code.

> [!TIP]
> **Best Practice**: Use this route **ONLY when the user explicitly clicks a "Send me Magic Link" / "Sign in with Magic Link" button** on your frontend UI. For default email OTP screens, use `POST /send/email/otp/{purpose}` instead.

Path parameter:

- `purpose` - `signup`, `login`, `reset`, or `verify`.

Body:

```json
{
  "email": "jane@example.com",
  "frontend_url": "https://app.example.com"
}
```

Response:

```json
{
  "expires_at": 1735689600
}
```

## GET `/link/{purpose}`

Direct browser verification endpoint triggered when the user clicks the magic link in their email inbox.

Query parameters:

- `email` (string, required) - User's email address
- `otp` (string, required) - Single-use OTP code
- `frontend_url` (string, optional) - Base URL of your frontend application (e.g. `https://app.example.com`). If omitted, falls back to `Origin` header or backend server URL.

### Token Modes Support:
- **Single-Token Mode (Default)**: Redirects to `{frontend_url}/oauth/callback?access_token=...`
- **Dual-Token Mode**: Redirects to `{frontend_url}/oauth/callback?access_token=...&refresh_token=...`

### Behavior by Purpose:

- `login`: Verifies single-use OTP, logs user in, creates session, and **redirects (HTTP 307)** to `{frontend_url}/oauth/callback?access_token=...(&refresh_token=...)`.
  *(Reuses your existing frontend OAuth callback handler with zero additional code needed).*
- `verify`: Verifies single-use OTP, activates account status to `"active"`, and **redirects (HTTP 307)** to `{frontend_url}/magic-link/callback?verified=true&email=...`.
- `reset`: Validates OTP **without burning it**, and **redirects (HTTP 307)** to `{frontend_url}/reset-password?email=...&otp=...`.
- `signup`: Validates OTP **without burning it**, and **redirects (HTTP 307)** to `{frontend_url}/signup?email=...&otp=...&verified=true`.

### Failure / Replay Behavior:
If the link is invalid, expired, or was already used (replay attack), redirects (HTTP 307) to:
`{frontend_url}/magic-link/callback?error={url_encoded_error}`.

---

### Required Frontend Routers:

To fully support all Magic Link flows, your frontend application requires the following routers:

#### 1. OAuth Callback Router: `{frontend_url}/oauth/callback` (Reused!)
> [!TIP]
> **No new router needed for Magic Link login!**
> `GET /tc-auth/link/login` uses the identical redirect format as Google, GitHub, and Discord OAuth. Your existing OAuth callback page handles Magic Link logins automatically.

```tsx
// app/oauth/callback/page.tsx or src/pages/OAuthCallback.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return <p>Authenticating, please wait...</p>;
}
```

#### 2. Magic Link Callback Router: `{frontend_url}/magic-link/callback` (Required for Verification & Errors)
Handles email verification notifications (`GET /tc-auth/link/verify`) and error alerts:

```tsx
// app/magic-link/callback/page.tsx or src/pages/MagicLinkCallback.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function MagicLinkCallbackPage() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const email = searchParams.get("email");
  const error = searchParams.get("error");

  if (error) {
    return (
      <div className="card error">
        <h2>Link Expired or Invalid</h2>
        <p>{error}</p>
        <a href="/login">Request New Link</a>
      </div>
    );
  }

  if (verified === "true") {
    return (
      <div className="card success">
        <h2>Email Verified!</h2>
        <p>Your email ({email}) has been successfully activated.</p>
        <a href="/login">Proceed to Sign In</a>
      </div>
    );
  }

  return <p>Verifying, please wait...</p>;
}
```

#### 3. Password Reset Router: `{frontend_url}/reset-password`
Receives `?email=...&otp=...` from `GET /tc-auth/link/reset`. The user fills out a new password and submits `POST /tc-auth/forgot/password`.

#### 4. Signup Completion Router: `{frontend_url}/signup`
Receives `?email=...&otp=...&verified=true` from `GET /tc-auth/link/signup`. The user completes registration by submitting `POST /tc-auth/signup/otp`.

---

## POST `/link/{purpose}`

Programmatic verification endpoint designed for SPAs, mobile applications, or confirmation intermediate pages (defending against corporate email antivirus scanner bots that pre-fetch and burn links).

Path parameter:

- `purpose` - `login`, `verify`, `reset`, or `signup`.

Body:

```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

Response for `login` (Single-Token Mode):

```json
{
  "access_token": "jwt-token",
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

Response for `login` (Dual-Token Mode):

```json
{
  "access_token": "jwt-token",
  "refresh_token": "refresh-jwt-token",
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

Response for `verify`:

```json
{
  "success": true,
  "message": "Email verified successfully",
  "email": "jane@example.com"
}
```

### Bot Protection SPA Implementation:
To prevent enterprise email scanner bots from pre-fetching the link and burning the single-use OTP, configure your magic link emails to open `{frontend_url}/confirm-login?email=...&otp=...` with a user button that submits `POST /tc-auth/link/login`:

```typescript
async function handleConfirmLogin(email: string, otp: string) {
  const res = await fetch("https://api.example.com/tc-auth/link/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    window.location.href = "/dashboard";
  } else {
    const err = await res.json();
    alert(err.message || "Invalid or expired link");
  }
}
```

## POST `/signup/otp`

Verifies a signup OTP and creates a new account.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "otp": "123456",
  "handle": "jane"
}
```

Response:

Same login payload shown above.

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/signup/otp`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
    otp: "123456",
    handle: "jane",
  }),
});

const data = await res.json();
```

## POST `/signup/password`

Creates a new account without an OTP step.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "handle": "jane",
  "password": "password123"
}
```

Response:

Same login payload shown above.

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/signup/password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Jane Doe",
    email: "jane@example.com",
    handle: "jane",
    password: "password123",
  }),
});

const data = await res.json();
```

## POST `/login/otp`

Verifies a login OTP and returns a session token.

Body:

```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

Response:

Same login payload shown above.

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/login/otp`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "jane@example.com",
    otp: "123456",
  }),
});

const data = await res.json();
```

## POST `/login/password`

Logs a user in with email or handle plus password.

Body:

```json
{
  "identifier": "jane@example.com",
  "password": "password123"
}
```

`identifier` can be an email address or a handle.

Response:

Same login payload shown above.

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/login/password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    identifier: "jane@example.com",
    password: "password123",
  }),
});

const data = await res.json();
```

## POST `/forgot/password`

Resets the password after verifying a reset OTP, then returns a fresh login token.

The request requires a valid reset OTP along with the new password (minimum 6 characters, at least one uppercase letter, one lowercase letter, and one number).

Body:

```json
{
  "email": "jane@example.com",
  "otp": "123456",
  "password": "new-password123"
}
```

Response:

Same login payload shown above.

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/forgot/password`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "jane@example.com",
    otp: "123456",
    password: "NewPassword123",
  }),
});

const data = await res.json();
```

## POST `/token/refresh`

Exchanges a valid refresh token for a newly issued access token and rotated refresh token.

Body:

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/token/refresh`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    refresh_token: localStorage.getItem("refresh_token"),
  }),
});

const data = await res.json();
```

