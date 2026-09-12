# Sign In / Sign Up Routes

Base path: `/tc-auth` (Supports automatic prefix stripping so either `/tc-auth/<path>` or `/<path>` works transparently)

Authentication:

- All routes in this group are public.
- Successful signup and login responses return an `access_token` that must be sent as `Authorization: Bearer <access_token>` to protected routes.
- When `dual_token_mode` is enabled in JWT configuration, authentication responses also include a `refresh_token` for seamless session renewal.

Password Complexity Requirements:

All password fields (during signup, password reset, or updates) require:
- Minimum length of 6 characters
- At least one uppercase letter (`A-Z`)
- At least one lowercase letter (`a-z`)
- At least one numerical digit (`0-9`)

Requests with weak passwords fail with `400 Bad Request`.

Common responses:

- `200 OK` on success.
- `400 Bad Request` / `422 Unprocessable Entity` for validation failures or weak passwords.
- `401 Unauthorized` for invalid credentials, invalid OTP values, or expired refresh tokens.
- `404 Not Found` when the target account does not exist.

Common login response:

```json
{
  "access_token": "tc_jwt_token_1_1741766400000",
  "refresh_token": "tc_jwt_ref_1_1741766400000",
  "token_type": "Bearer",
  "account": {
    "id": 1,
    "uid": "tc_usr_01",
    "name": "Jane Doe",
    "handle": "jane",
    "email": "jane@example.com",
    "phone": null,
    "avatar_url": null,
    "role": "user",
    "status": "active",
    "created_at": "2026-08-07T12:00:00Z",
    "updated_at": "2026-08-07T12:00:00Z"
  }
}
```

---

## POST `/send/email/otp/{purpose}`

Sends an email OTP for the supplied purpose.

Path parameter:

- `purpose` - OTP purpose key. Restricted strictly to: `signup`, `login`, `reset`, or `verify`. Attempting to use any other purpose returns `400 Bad Request`.

Body:

```json
{
  "email": "jane@example.com"
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
// Note: If baseUrl already includes /tc-auth, do not double-prefix
await fetch(`${baseUrl}/tc-auth/send/email/otp/signup`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "jane@example.com" }),
});
```

---

## POST `/signup/otp`

Verifies a signup OTP and creates a new account.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "otp": "123456",
  "handle": "jane"
}
```

Response:

Standard authentication response with `access_token` (and `refresh_token` if dual token mode is active).

---

## POST `/signup/password`

Direct password signup without OTP verification when open registration is permitted.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "handle": "jane"
}
```

Response:

Standard authentication response.

---

## POST `/login/otp`

Verifies an email OTP and authenticates the user.

Body:

```json
{
  "email": "jane@example.com",
  "otp": "123456"
}
```

Response:

Standard authentication response.

---

## POST `/login/password`

Authenticates a user via email or handle and password.

Body:

```json
{
  "identifier": "jane@example.com",
  "password": "SecurePassword123!"
}
```

Response:

Standard authentication response.

---

## POST `/forgot/password`

Resets the account password after verifying a reset OTP, returning a fresh authentication token. Password complexity rules apply.

Body:

```json
{
  "email": "jane@example.com",
  "otp": "123456",
  "password": "NewSecurePassword123!"
}
```

Response:

Standard authentication response.

---

## POST `/token/refresh`

Exchanges a valid refresh token for a newly signed access token and rotated refresh token (Dual-Token Flow).

Headers:

- `Content-Type: application/json`

Body:

```json
{
  "refresh_token": "tc_jwt_ref_1_1741766400000"
}
```

Response (`200 OK`):

```json
{
  "access_token": "tc_jwt_token_1741766430000",
  "refresh_token": "tc_jwt_ref_1741766430000",
  "token_type": "Bearer"
}
```

Error Response (`401 Unauthorized`):

```json
{
  "success": false,
  "message": "Invalid or expired refresh token",
  "detail": "Invalid or expired refresh token"
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/token/refresh`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ refresh_token: storedRefreshToken }),
});
const data = await res.json();
```
