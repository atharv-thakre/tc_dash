# Dashboard / Config Routes

Base path: `/tc-auth/config` (or `/config` via automatic prefix stripping)

Authentication:

- `GET /pulse` is public.
- All other routes in this group require `Authorization: Bearer <access_token>` and the `superadmin` role.

Notes:

- Configuration is stored securely in the running service instance and propagated across OAuth and token generation routines.
- Prefix handling: The server accommodates both `/tc-auth/config/...` and `/config/...` directly.

---

## GET `/pulse`

Health and readiness-style probe.

Response:

```json
{
  "system_time": "2026-03-12T10:00:00.000Z",
  "response": "Hello",
  "status": "healthy",
  "state": "active"
}
```

---

## GET `/load/`

Loads the current email, GitHub, Google, Discord, and JWT configuration.

Response:

```json
{
  "email": {
    "smtp_server": "smtp.sendgrid.net",
    "port": 587,
    "username": "apikey",
    "password": "********************",
    "sender_email": "noreply@tcauth.dev",
    "tls": true
  },
  "github": {
    "client_id": "gh_client_mock_849283",
    "client_secret": "********************",
    "redirect_uri": "http://localhost:3000/tc-auth/github/callback"
  },
  "google": {
    "client_id": "google-mock-client-id.apps.googleusercontent.com",
    "client_secret": "********************",
    "redirect_uri": "http://localhost:3000/tc-auth/google/callback"
  },
  "discord": {
    "client_id": "discord-mock-client-id-12345678",
    "client_secret": "********************",
    "redirect_uri": "http://localhost:3000/tc-auth/discord/callback"
  },
  "jwt": {
    "secret_key": "supersecret-tcauth-jwt-signing-key-production-ready",
    "algorithm": "HS256",
    "session_duration_days": 7,
    "dual_token_mode": true,
    "access_token_expire_minutes": 15,
    "refresh_token_expire_days": 7
  }
}
```

---

## GET `/counts`

Returns counts for the main tables.

Response:

```json
{
  "accounts": 4,
  "oauth": 3,
  "sessions": 2,
  "otp": 2
}
```

---

## POST `/email`

Configures SMTP email transport settings.

Body:

```json
{
  "smtp_server": "smtp.sendgrid.net",
  "port": 587,
  "username": "apikey",
  "password": "SG.secret_key_here",
  "sender_email": "noreply@myapp.com",
  "tls": true
}
```

---

## POST `/github`

Configures GitHub OAuth application credentials.

Body:

```json
{
  "client_id": "your-github-client-id",
  "client_secret": "your-github-client-secret",
  "redirect_uri": "http://localhost:3000/tc-auth/github/callback"
}
```

---

## POST `/google`

Configures Google OAuth 2.0 credentials.

Body:

```json
{
  "client_id": "your-google-client-id.apps.googleusercontent.com",
  "client_secret": "your-google-client-secret",
  "redirect_uri": "http://localhost:3000/tc-auth/google/callback"
}
```

---

## POST `/discord`

Configures Discord OAuth2 credentials.

Body:

```json
{
  "client_id": "your-discord-application-id",
  "client_secret": "your-discord-client-secret",
  "redirect_uri": "http://localhost:3000/tc-auth/discord/callback"
}
```

Response:

```json
{
  "success": true,
  "message": "Discord OAuth configured successfully"
}
```

---

## POST `/jwt`

Configures JSON Web Token signing, session expiration, and dual-token refresh settings.

Body:

```json
{
  "secret_key": "your-strong-production-signing-key",
  "algorithm": "HS256",
  "session_duration_days": 7,
  "dual_token_mode": true,
  "access_token_expire_minutes": 15,
  "refresh_token_expire_days": 7
}
```

Parameters:
- `secret_key` (`string`): Cryptographic key used to sign and verify tokens.
- `algorithm` (`string`): Signature algorithm (`HS256`, `HS384`, `HS512`, etc.).
- `session_duration_days` (`number`): Fallback validity period when dual token mode is disabled.
- `dual_token_mode` (`boolean`): When `true`, returns short-lived access tokens alongside persistent refresh tokens.
- `access_token_expire_minutes` (`number`): Access token lifetime in minutes (default: 15).
- `refresh_token_expire_days` (`number`): Refresh token lifetime in days (default: 7).

Response:

```json
{
  "success": true,
  "message": "JWT configured successfully"
}
```
