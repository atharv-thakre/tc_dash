# GitHub OAuth API

``` python
from fastapi import Request
```

The `GitHubOAuth` service provides a complete GitHub OAuth flow for
FastAPI applications.

It handles:

1.  GitHub OAuth configuration
2.  Redirecting users to GitHub
3.  Processing the OAuth callback
4.  Retrieving the GitHub user profile
5.  Retrieving the user's primary verified email
6.  Creating or retrieving the linked account
7.  Creating the authentication session
8.  Redirecting the user back to the frontend

------------------------------------------------------------------------

# OAuth Flow

``` text
Frontend
   |
   v
/oauth/github/login
   |
   v
GitHub
   |
   v
User authenticates
   |
   v
/oauth/github/callback
   |
   v
GitHubOAuth.callback()
   |
   v
GitHub User Profile
   |
   +---- Email available
   |         -> Use profile email
   |
   +---- Email unavailable
             -> Request /user/emails
             -> Find primary + verified email
   |
   v
auth.oauth.login()
   |
   +---- Existing OAuth account
   |         -> Use linked account
   |
   +---- New OAuth account
             -> Create account
             -> Link GitHub account
   |
   v
Login response
   |
   v
Frontend /oauth/callback
```

------------------------------------------------------------------------

# `config()`

Configures the GitHub OAuth client.

Call this during application setup before using `login()` or
`callback()`.

``` python
auth.github.config(...)
```

## Parameters

  -----------------------------------------------------------------------
  Parameter         Type              Required          Description
  ----------------- ----------------- ----------------- -----------------
  `client_id`       `str`             Yes               GitHub OAuth
                                                        application
                                                        client ID.

  `client_secret`   `str`             Yes               GitHub OAuth
                                                        application
                                                        client secret.

  `redirect_uri`    `str`             Yes               OAuth callback
                                                        URL registered
                                                        with GitHub.
  -----------------------------------------------------------------------

## Example

``` python
auth.github.config(
    client_id="YOUR_GITHUB_CLIENT_ID",
    client_secret="YOUR_GITHUB_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/github/callback",
)
```

## Returns

``` python
{
    "success": True,
    "message": "GitHub OAuth configured successfully"
}
```

> The `redirect_uri` must exactly match the callback URL configured in
> the GitHub OAuth application.

------------------------------------------------------------------------

# `load()`

Returns the currently configured GitHub OAuth settings.

``` python
config = auth.github.load()
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

Starts the GitHub OAuth login flow.

The user is redirected to GitHub's authorization page.

``` python
await auth.github.login(...)
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

The `frontend_url` is temporarily stored in the session and used by
`callback()` after authentication completes.

## Example

``` python
@app.get("/oauth/github/login")
async def github_login(request: Request):
    return await auth.github.login(
        request=request,
        frontend_url="https://app.example.com",
    )
```

## Returns

A redirect response to GitHub's OAuth authorization page.

> `login()` is asynchronous and must be awaited.

------------------------------------------------------------------------

# `callback()`

Handles the callback sent by GitHub after authentication.

``` python
await auth.github.callback(...)
```

## Parameters

  Parameter      Type        Required   Default
  -------------- ----------- ---------- ---------
  `request`      `Request`   Yes        ---
  `ip_address`   `str`       No         `None`
  `user_agent`   `str`       No         `None`

`ip_address` and `user_agent` are passed to `auth.oauth.login()` and can
be used for the authentication session.

## What the Callback Does

The callback:

1.  Retrieves the frontend URL from the session.
2.  Exchanges the authorization code for an access token.
3.  Retrieves the GitHub user profile.
4.  Attempts to get the email from the profile.
5.  If unavailable, requests the user's GitHub email list.
6.  Finds the primary and verified email.
7.  Calls `auth.oauth.login()`.
8.  Creates or retrieves the linked account.
9.  Creates the authentication session.
10. Redirects the user to the frontend.

## Example

``` python
@app.get("/oauth/github/callback")
async def github_callback(request: Request):
    return await auth.github.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```

------------------------------------------------------------------------

# GitHub User Data

The callback retrieves the GitHub user profile from:

``` text
GET /user
```

The following fields are used:

  GitHub Field   Used As
  -------------- --------------------
  `id`           `provider_user_id`
  `name`         `name`
  `email`        `email`
  `avatar_url`   `avatar_url`

The GitHub provider ID is converted to a string before being passed to
`auth.oauth.login()`.

Internally:

``` python
auth.oauth.login(
    provider="github",
    provider_user_id=str(user["id"]),
    name=user.get("name"),
    email=email,
    avatar_url=user.get("avatar_url"),
    ip_address=ip_address,
    user_agent=user_agent,
)
```

------------------------------------------------------------------------

# GitHub Email Handling

GitHub may not return the user's email in the main profile.

If:

``` python
user.get("email") is None
```

the callback requests:

``` text
GET /user/emails
```

It then searches for an email where:

``` python
item["primary"] is True
item["verified"] is True
```

The first matching primary and verified email is used.

This allows the OAuth flow to obtain a verified primary GitHub email
even when the email is not publicly visible on the user's GitHub
profile.

------------------------------------------------------------------------

# Profile & Data Overwrite Policy

When a user authenticates with GitHub:

> [!IMPORTANT]
> - **Existing Data Preservation**: GitHub **never overwrites** existing non-empty profile data (`email`, `name`, or `avatar_url`).
> - **Empty Fields Rule**: If an account has empty or null fields (`name`, `email`, `avatar_url`), GitHub is permitted to populate all of them.
> - **Auto-Linking by Email**: If an existing account matches the user's primary verified GitHub email (case-insensitively), GitHub is automatically linked without creating a duplicate account.

------------------------------------------------------------------------

# Callback Redirect

After successful authentication, the callback redirects the user back to the frontend:

``` text
# Single-Token Mode (Default):
{frontend_url}/oauth/callback?access_token=YOUR_ACCESS_TOKEN

# Dual-Token Mode:
{frontend_url}/oauth/callback?access_token=YOUR_ACCESS_TOKEN&refresh_token=YOUR_REFRESH_TOKEN

# When Linking a Logged-In Account:
{frontend_url}/oauth/callback?linked=true&provider=github
```

The frontend can then process the tokens from the callback URL and continue the authenticated session.

------------------------------------------------------------------------

# Complete FastAPI Example

``` python
from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()


# Configure GitHub OAuth once during application setup.
auth.github.config(
    client_id="YOUR_GITHUB_CLIENT_ID",
    client_secret="YOUR_GITHUB_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/github/callback",
)


# Start GitHub OAuth.
@app.get("/oauth/github/login")
async def github_login(request: Request):
    return await auth.github.login(
        request=request,
        frontend_url="https://app.example.com",
    )


# Handle GitHub OAuth callback.
@app.get("/oauth/github/callback")
async def github_callback(request: Request):
    return await auth.github.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```

------------------------------------------------------------------------

# Configuration Requirements

The GitHub OAuth callback URL must be registered in the GitHub OAuth
application.

For example:

``` text
GitHub OAuth application:
https://api.example.com/tc-auth/github/callback

Application:
redirect_uri="https://api.example.com/tc-auth/github/callback"
```

A mismatch between these URLs will cause the OAuth flow to fail.

------------------------------------------------------------------------

# Security Considerations

-   Keep `client_secret` private.
-   Do not expose `load()` through a public API endpoint.
-   Register the exact callback URL with GitHub.
-   Use HTTPS in production.
-   Only allow trusted frontend redirect destinations.
-   Do not accept arbitrary `frontend_url` values from untrusted users.
-   Handle the returned access token securely on the frontend.
-   Do not log GitHub access tokens or client secrets.

------------------------------------------------------------------------

# Quick Reference

  Method         Purpose                          Return
  -------------- -------------------------------- -------------------
  `config()`     Configure GitHub OAuth           `dict`
  `load()`       Get current configuration        `dict`
  `login()`      Start GitHub authentication      Redirect response
  `callback()`   Complete GitHub authentication   Redirect response

------------------------------------------------------------------------

# Quick Usage

``` python
from fastapi import Request
from connect import auth


# Configure
auth.github.config(
    client_id="YOUR_GITHUB_CLIENT_ID",
    client_secret="YOUR_GITHUB_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/github/callback",
)


# Start OAuth
@app.get("/oauth/github/login")
async def github_login(request: Request):
    return await auth.github.login(
        request=request,
        frontend_url="https://app.example.com",
    )


# Handle callback
@app.get("/oauth/github/callback")
async def github_callback(request: Request):
    return await auth.github.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```
