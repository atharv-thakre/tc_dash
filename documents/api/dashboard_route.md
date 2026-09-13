# Dashboard / Config Routes

Base path: `/tc-auth/config`

Authentication:

- `GET /pulse` is public.
- All other routes in this group require `Authorization: Bearer <access_token>` and the `superadmin` role.

Notes:

- The current code exposes `GET /load/`; there is no separate `/redirect` route in the route module anymore.
- Configuration is stored in memory on the running service instance.

## GET `/pulse`

Health and readiness-style probe.

Response:

```json
{
  "system_time": "2026-08-12T10:00:00.000000",
  "response": "Hello",
  "status": "healthy",
  "state": "active"
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/config/pulse`);
const data = await res.json();
```

## GET `/load/`

Loads the current email, GitHub, Google, Discord, and JWT configuration.

Response:

```json
{
  "email": {
    "host": "smtp.example.com",
    "port": 587,
    "username": "mailer@example.com",
    "password": "***",
    "sender": "noreply@example.com",
    "sender_name": "Auth Module",
    "use_tls": true
  },
  "github": {
    "client_id": "...",
    "client_secret": "...",
    "redirect_uri": "https://app.example.com/tc-auth/github/callback"
  },
  "google": {
    "client_id": "...",
    "client_secret": "...",
    "redirect_uri": "https://app.example.com/tc-auth/google/callback"
  },
  "discord": {
    "client_id": "...",
    "client_secret": "...",
    "redirect_uri": "https://app.example.com/tc-auth/discord/callback"
  },
  "jwt": {
    "secret_key": "...",
    "algorithm": "HS256",
    "session_duration_days": 7
  },
  "cookie": {
    "cookie_mode": false,
    "access_cookie_name": "access_token",
    "refresh_cookie_name": "refresh_token",
    "path": "/",
    "domain": null,
    "secure": false,
    "httponly": true,
    "samesite": "lax",
    "max_age": null
  }
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/config/load/`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const config = await res.json();
```

## GET `/counts`

Returns counts for the main tables.

Response:

```json
{
  "accounts": 123,
  "oauth": 7,
  "sessions": 42,
  "otp": 3
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/config/counts`, {
  method: "GET",
  headers: { Authorization: `Bearer ${accessToken}` },
});

const counts = await res.json();
```

## POST `/email`

Configures the email service.

Body:

```json
{
  "host": "smtp.example.com",
  "port": 587,
  "username": "mailer@example.com",
  "password": "secret",
  "sender": "noreply@example.com",
  "sender_name": "Auth Module",
  "use_tls": true
}
```

Response:

```json
{
  "success": true,
  "message": "Email service configured successfully"
}
```

## POST `/github`

Configures GitHub OAuth.

Body:

```json
{
  "client_id": "...",
  "client_secret": "...",
  "redirect_uri": "https://app.example.com/tc-auth/github/callback"
}
```

Response:

```json
{
  "success": true,
  "message": "GitHub OAuth configured successfully"
}
```

## POST `/google`

Configures Google OAuth.

Body:

```json
{
  "client_id": "...",
  "client_secret": "...",
  "redirect_uri": "https://app.example.com/tc-auth/google/callback"
}
```

Response:

```json
{
  "success": true,
  "message": "Google OAuth configured successfully"
}
```

## POST `/discord`

Configures Discord OAuth.

Body:

```json
{
  "client_id": "...",
  "client_secret": "...",
  "redirect_uri": "https://app.example.com/tc-auth/discord/callback"
}
```

Response:

```json
{
  "success": true,
  "message": "Discord OAuth configured successfully"
}
```

## POST `/jwt`

Configures JWT signing, session lifetime, and optional dual-token architecture.

Body:

```json
{
  "secret_key": "super-secret",
  "algorithm": "HS256",
  "session_duration_days": 7,
  "dual_token_mode": false,
  "access_token_expire_minutes": 15,
  "refresh_token_expire_days": 7
}
```

- `session_duration_days` (required): Integer $\ge 1$. Controls single-token access expiration and database session lifetime. Default is `7`.
- `dual_token_mode` (optional): Boolean. When `true`, login and signup issue both a short-lived `access_token` and a long-lived `refresh_token`.
- `access_token_expire_minutes` (optional): Integer $\ge 1$. Lifespan of access tokens when dual-token mode is enabled (default `15`).
- `refresh_token_expire_days` (optional): Integer $\ge 1$. Lifespan of refresh tokens when dual-token mode is enabled (defaults to `session_duration_days`).

Response:

```json
{
  "success": true,
  "message": "JWT configured successfully"
}
```

## POST `/cookie`

Configures the Cookie Subsystem parameters. Requires superadmin access.

Body:

```json
{
  "cookie_mode": true,
  "access_cookie_name": "access_token",
  "refresh_cookie_name": "refresh_token",
  "path": "/",
  "domain": null,
  "secure": true,
  "httponly": true,
  "samesite": "lax",
  "max_age": null
}
```

- `cookie_mode` (optional): Boolean. Toggle Cookie Mode on or off (default: `false`).
- `access_cookie_name` (optional): String. Name of access token cookie (default: `"access_token"`).
- `refresh_cookie_name` (optional): String. Name of refresh token cookie (default: `"refresh_token"`).
- `path` (optional): String. Cookie path (default: `"/"`).
- `domain` (optional): String or `null`. Cookie domain scope.
- `secure` (optional): Boolean. HTTPS requirement flag (default: `false`).
- `httponly` (optional): Boolean. XSS mitigation flag (default: `true`).
- `samesite` (optional): String. SameSite policy (`"lax"`, `"strict"`, `"none"`).
- `max_age` (optional): Integer or `null`. Custom cookie lifetime in seconds.

Response:

```json
{
  "success": true,
  "message": "Cookie configured successfully"
}
```


