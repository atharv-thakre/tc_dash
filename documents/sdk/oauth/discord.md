# Discord OAuth API

``` python
from fastapi import Request
```

The `DiscordOAuth` service provides a complete Discord OAuth flow for
FastAPI applications.

It handles:

1.  Discord OAuth configuration
2.  Redirecting users to Discord authorization
3.  Processing the OAuth callback
4.  Retrieving the Discord user profile
5.  Validating verified email addresses
6.  Handling animated (`.gif`) and static (`.png`) avatars with default avatar fallback
7.  Creating or retrieving the linked account
8.  Creating the authentication session
9.  Redirecting the user back to the frontend with access tokens (and refresh tokens in dual-token mode)

------------------------------------------------------------------------

# OAuth Flow

``` text
Frontend
   |
   v
/oauth/discord/login
   |
   v
Discord
   |
   v
User authorizes (scopes: identify, email)
   |
   v
/oauth/discord/callback
   |
   v
DiscordOAuth.callback()
   |
   v
Discord User Profile (GET /users/@me)
   |
   +---- Email verification check (user.verified is not False)
   |         -> If verified: use email
   |         -> If unverified: ignore email to protect against account takeover
   |
   +---- Avatar processing
   |         -> "a_" prefix: generate .gif CDN link
   |         -> static hash: generate .png CDN link
   |         -> None: calculate default embed avatar
   |
   v
auth.oauth.login()
   |
   +---- Existing OAuth account
   |         -> Use linked account
   |
   +---- New OAuth account (matches email case-insensitively)
   |         -> Auto-link to existing account or create new account
   |
   v
Login response
   |
   v
Frontend /oauth/callback?access_token=...(&refresh_token=...)
```

------------------------------------------------------------------------

# `config()`

Configures the Discord OAuth client.

Call this during application setup before using `login()` or
`callback()`.

``` python
auth.discord.config(...)
```

## Parameters

  -----------------------------------------------------------------------
  Parameter         Type              Required          Description
  ----------------- ----------------- ----------------- -----------------
  `client_id`       `str`             Yes               Discord Application
                                                        Client ID.

  `client_secret`   `str`             Yes               Discord Application
                                                        Client Secret.

  `redirect_uri`    `str`             Yes               OAuth redirect URL
                                                        registered in the
                                                        Discord Developer Portal.
  -----------------------------------------------------------------------

## Example

``` python
auth.discord.config(
    client_id="YOUR_DISCORD_CLIENT_ID",
    client_secret="YOUR_DISCORD_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/discord/callback",
)
```

## Returns

``` python
{
    "success": True,
    "message": "Discord OAuth configured successfully"
}
```

> The `redirect_uri` must match one of the Redirects configured in the Discord Developer Portal under OAuth2.

------------------------------------------------------------------------

# `load()`

Returns the currently configured Discord OAuth settings.

``` python
config = auth.discord.load()
```

## Returns

``` python
{
    "client_id": client_id,
    "client_secret": client_secret,
    "redirect_uri": redirect_uri
}
```

> **Security:** Do not expose the result of `load()` through a public
> API because it contains the OAuth client secret.

------------------------------------------------------------------------

# `login()`

Starts the Discord OAuth login flow.

The user is redirected to Discord's authorization page.

``` python
await auth.discord.login(...)
```

## Parameters

  -------------------------------------------------------------------------
  Parameter         Type              Required          Description
  ----------------- ----------------- ----------------- -------------------
  `request`         `Request`         Yes               FastAPI/Starlette
                                                        request object.

  `frontend_url`    `str`             Yes               Frontend URL to
                                                        redirect to after
                                                        authentication.
  -------------------------------------------------------------------------

The `frontend_url` is stored in the session and used by `callback()` after authentication completes.

## Example

``` python
@app.get("/oauth/discord/login")
async def discord_login(request: Request):
    return await auth.discord.login(
        request=request,
        frontend_url="https://app.example.com",
    )
```

## Returns

A redirect response (`HTTP 307`) to Discord's OAuth authorization page.

------------------------------------------------------------------------

# `callback()`

Handles the callback sent by Discord after authorization.

``` python
await auth.discord.callback(...)
```

## Parameters

  Parameter      Type        Required   Default
  -------------- ----------- ---------- ---------
  `request`      `Request`   Yes        ---
  `ip_address`   `str`       No         `None`
  `user_agent`   `str`       No         `None`

`ip_address` and `user_agent` are passed to the authentication session.

## What the Callback Does

1. Retrieves `frontend_url` and optional `link_account_id` from the session.
2. Exchanges the authorization code for an access token.
3. Retrieves the Discord user profile from `https://discord.com/api/users/@me`.
4. Validates email verification (ensures `verified` is not `False`).
5. Generates the appropriate Discord CDN avatar link (handling animated `.gif` or default avatar fallback).
6. If in linking mode (`link_account_id`), links Discord to the existing logged-in account.
7. If in login mode, calls `auth.oauth.login()`, matching accounts by verified email case-insensitively or creating a new account.
8. Redirects to `{frontend_url}/oauth/callback` with `access_token` (and `refresh_token` in dual-token mode).

## Example

``` python
@app.get("/oauth/discord/callback")
async def discord_callback(request: Request):
    return await auth.discord.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```

------------------------------------------------------------------------

# Discord User Data & Edge Cases

The callback retrieves the Discord user profile from `GET /users/@me`:

  Discord Field               Used As               Notes
  --------------------------- --------------------- ----------------------------------------------------
  `id`                        `provider_user_id`    Converted to `str`.
  `global_name` / `username`  `name`                Falls back to `username` if `global_name` is empty.
  `email`                     `email`               Only used if `verified` is not `False`.
  `avatar`                    `avatar_url`          Supports animated GIFs and default avatars.

### Unverified Email Security Guard
Discord allows accounts with unverified email addresses. To prevent malicious account takeover (e.g. an attacker registering an unverified Discord account with a victim's email), `tc_auth` verifies `user.get("verified") is not False` before trusting the email for automatic account linking.

### Avatar Fallback Logic
- If `avatar` starts with `a_`: `https://cdn.discordapp.com/avatars/{user_id}/{avatar}.gif`
- If standard hash: `https://cdn.discordapp.com/avatars/{user_id}/{avatar}.png`
- If `None`: Uses Discord's default embed CDN avatars `https://cdn.discordapp.com/embed/avatars/{index}.png` based on `(user_id >> 22) % 6`.

------------------------------------------------------------------------

# Complete FastAPI Example

``` python
from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()

# Configure Discord OAuth once during application setup
auth.discord.config(
    client_id="YOUR_DISCORD_CLIENT_ID",
    client_secret="YOUR_DISCORD_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/discord/callback",
)

# Start Discord OAuth
@app.get("/oauth/discord/login")
async def discord_login(request: Request):
    return await auth.discord.login(
        request=request,
        frontend_url="https://app.example.com",
    )

# Handle Discord OAuth callback
@app.get("/oauth/discord/callback")
async def discord_callback(request: Request):
    return await auth.discord.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```

------------------------------------------------------------------------

# Quick Reference

  Method         Purpose                          Return
  -------------- -------------------------------- -------------------
  `config()`     Configure Discord OAuth          `dict`
  `load()`       Get current configuration        `dict`
  `login()`      Start Discord authentication     Redirect response
  `callback()`   Complete Discord authentication  Redirect response
