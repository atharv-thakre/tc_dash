# OAuth Login Routes

Base path: `/tc-auth`

Authentication:

- These routes are part of the browser OAuth flow and are public.
- The callback endpoints use the session cookie set by the OAuth client, so the browser must preserve cookies during the flow.

Flow notes:

- `/google/login`, `/github/login`, and `/discord/login` redirect the browser to the provider authorization page.
- The callback endpoints exchange the provider code, create or link the local account, and then redirect to the frontend callback URL with `access_token` (and `refresh_token` in dual-token mode, or `linked=true` for account linking).
- `frontend_url` is stored in the session during the login step and reused during the callback.

Common response:

- Login endpoints return a redirect response (`HTTP 307`) rather than JSON.
- Callback endpoints also return a redirect response (`HTTP 307`) rather than JSON.

## GET `/google/login`

Starts the Google OAuth login flow.

Query parameters:

- `frontend_url` - frontend callback base URL to return to after the OAuth exchange.

Response:

- Redirect to Google authorization.

Example:

```js
window.location.href = `${baseUrl}/tc-auth/google/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

## GET `/google/callback`

Google OAuth callback endpoint.

Request parameters:

- Provider query parameters such as `code`, `state`, or error fields are supplied by Google.

Response:

- Redirect to `${frontend_url}/oauth/callback?access_token=...` (plus `&refresh_token=...` in dual-token mode, or `?linked=true&provider=google` for linking).

Example:

```js
// Handled by the browser redirect to frontend callback router.
```

## GET `/github/login`

Starts the GitHub OAuth login flow.

Query parameters:

- `frontend_url` - frontend callback base URL to return to after the OAuth exchange.

Response:

- Redirect to GitHub authorization.

Example:

```js
window.location.href = `${baseUrl}/tc-auth/github/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

## GET `/github/callback`

GitHub OAuth callback endpoint.

Request parameters:

- Provider query parameters such as `code`, `state`, or error fields are supplied by GitHub.

Response:

- Redirect to `${frontend_url}/oauth/callback?access_token=...` (plus `&refresh_token=...` in dual-token mode, or `?linked=true&provider=github` for linking).

Example:

```js
// Handled by the browser redirect to frontend callback router.
```

## GET `/discord/login`

Starts the Discord OAuth login flow.

Query parameters:

- `frontend_url` - frontend callback base URL to return to after the OAuth exchange.

Response:

- Redirect to Discord authorization.

Example:

```js
window.location.href = `${baseUrl}/tc-auth/discord/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

## GET `/discord/callback`

Discord OAuth callback endpoint.

Request parameters:

- Provider query parameters such as `code`, `state`, or error fields are supplied by Discord.

Response:

- Redirect to `${frontend_url}/oauth/callback?access_token=...` (plus `&refresh_token=...` in dual-token mode, or `?linked=true&provider=discord` for linking).

Example:

```js
// Handled by the browser redirect to frontend callback router.
```

