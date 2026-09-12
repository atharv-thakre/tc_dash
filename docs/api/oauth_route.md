# OAuth Login Routes

Base path: `/tc-auth` (Supports automatic prefix stripping so either `/tc-auth/<path>` or `/<path>` works transparently)

Authentication:

- These routes are part of the browser OAuth flow and are public.
- The callback endpoints preserve session or redirect parameters so the browser returns cleanly to the frontend application.
- Supported Providers: **Google**, **GitHub**, and **Discord**.

Flow notes:

- `/google/login`, `/github/login`, and `/discord/login` redirect the browser to the respective provider authorization page.
- The callback endpoints exchange the provider code, create or retrieve the linked account, and redirect to the frontend callback URL with `access_token` (and `refresh_token` when enabled) in the query string.
- `frontend_url` is passed as a query parameter during the login step and preserved through the OAuth `state` parameter.

Common response:

- Login endpoints return an HTTP `307 Temporary Redirect` (or `302 Found`).
- Callback endpoints also return an HTTP `307 Temporary Redirect` to the frontend application callback handler.

---

## GET `/google/login`

Starts the Google OAuth login flow.

Query parameters:

- `frontend_url` - Frontend callback base URL to return to after the OAuth exchange.

Response:

- Redirect to Google authorization consent screen.

Example:

```js
window.location.href = `${baseUrl}/tc-auth/google/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

## GET `/google/callback`

Google OAuth callback endpoint.

Response:

- Redirects to `${frontend_url}/oauth/callback?access_token=...&provider=google`.

---

## GET `/github/login`

Starts the GitHub OAuth login flow.

Query parameters:

- `frontend_url` - Frontend callback base URL to return to after the OAuth exchange.

Response:

- Redirect to GitHub authorization consent screen.

Example:

```js
window.location.href = `${baseUrl}/tc-auth/github/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

## GET `/github/callback`

GitHub OAuth callback endpoint.

Response:

- Redirects to `${frontend_url}/oauth/callback?access_token=...&provider=github`.

---

## GET `/discord/login`

Starts the Discord OAuth login flow.

Query parameters:

- `frontend_url` - Frontend callback base URL to return to after the OAuth exchange.

Response:

- Redirect to Discord OAuth2 authorization URL (`https://discord.com/api/oauth2/authorize?client_id=...&scope=identify%20email`).

Example:

```js
window.location.href = `${baseUrl}/tc-auth/discord/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

## GET `/discord/callback`

Discord OAuth callback endpoint.

Request parameters:

- Query parameters such as `code`, `state` supplied by Discord upon user consent.

Response:

- Redirects to `${frontend_url}/oauth/callback?access_token=...&provider=discord`.
