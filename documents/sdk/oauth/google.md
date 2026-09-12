# Google OAuth API

``` python
from connect import auth
```

The `GoogleOAuth` service provides a complete Google OAuth flow for
FastAPI applications.

It handles:

1.  Google OAuth configuration
2.  Redirecting users to Google
3.  Processing the OAuth callback
4.  Reading Google user information
5.  Creating or retrieving the linked account
6.  Creating the authentication session
7.  Redirecting the user back to the frontend

------------------------------------------------------------------------

# OAuth Flow

``` text
Frontend
   |
   v
/oauth/google/login
   |
   v
Google
   |
   v
User authenticates
   |
   v
/oauth/google/callback
   |
   v
GoogleOAuth.callback()
   |
   v
auth.oauth.login()
   |
   +---- Existing OAuth account
   |         -> Use linked account
   |
   +---- New OAuth account
             -> Create account
             -> Link Google account
   |
   v
Login response
   |
   v
Frontend /oauth/callback
```

------------------------------------------------------------------------

# `config()`

Configures the Google OAuth client.

This should be called during application setup before using `login()` or
`callback()`.

``` python
auth.google.config(...)
```

## Parameters

  -----------------------------------------------------------------------
  Parameter         Type              Required          Description
  ----------------- ----------------- ----------------- -----------------
  `client_id`       `str`             Yes               Google OAuth
                                                        client ID.

  `client_secret`   `str`             Yes               Google OAuth
                                                        client secret.

  `redirect_uri`    `str`             Yes               OAuth callback
                                                        URL registered
                                                        with Google.
  -----------------------------------------------------------------------

## Example

``` python
auth.google.config(
    client_id="YOUR_GOOGLE_CLIENT_ID",
    client_secret="YOUR_GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/google/callback",
)
```

## Returns

``` python
{
    "success": True,
    "message": "Google OAuth configured successfully"
}
```

> The `redirect_uri` must exactly match the callback URL configured in
> Google Cloud.

------------------------------------------------------------------------

# `load()`

Returns the currently configured Google OAuth settings.

``` python
config = auth.google.load()
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

Starts the Google OAuth login flow.

The user is redirected to Google's authorization page.

``` python
await auth.google.login(...)
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
`callback()` after Google authentication completes.

## Example

``` python
@app.get("/oauth/google/login")
async def google_login(request: Request):
    return await auth.google.login(
        request=request,
        frontend_url="https://app.example.com",
    )
```

## Returns

A redirect response to Google's OAuth authorization page.

> `login()` is asynchronous and must be awaited.

------------------------------------------------------------------------

# `callback()`

Handles the callback sent by Google after authentication.

``` python
await auth.google.callback(...)
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
2.  Exchanges the authorization code for an OAuth token.
3.  Retrieves Google's user information.
4.  Extracts the user's Google provider ID, name, email, and avatar.
5.  Calls `auth.oauth.login()`.
6.  Creates or retrieves the linked account.
7.  Creates the authentication session.
8.  Redirects the user to the frontend OAuth callback.

## Example

``` python
@app.get("/oauth/google/callback")
async def google_callback(request: Request):
    return await auth.google.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```

## Google User Information

The callback uses Google's OpenID Connect user information:

  Google Field   Used As
  -------------- --------------------
  `sub`          `provider_user_id`
  `name`         `name`
  `email`        `email`
  `picture`      `avatar_url`

Internally, the information is passed to:

``` python
auth.oauth.login(
    provider="google",
    provider_user_id=user["sub"],
    name=user.get("name"),
    email=user.get("email"),
    avatar_url=user.get("picture"),
    ip_address=ip_address,
    user_agent=user_agent,
)
```

------------------------------------------------------------------------

# Profile & Email Overwrite Policy

When a user authenticates with Google:

> [!IMPORTANT]
> - **Email Overwrite**: If an existing account is matched, **Google OAuth is explicitly permitted to overwrite the existing email** with Google's verified email address (or set it during sign-up).
> - **Empty Fields Rule**: If an account has empty or null fields (`name`, `email`, `avatar_url`), Google is permitted to populate all of them.
> - **Data Preservation**: Non-empty existing `name` and `avatar_url` are preserved and **never overwritten**.

------------------------------------------------------------------------

# Callback Redirect

After successful authentication, the callback redirects the user back to the frontend:

``` text
# Single-Token Mode (Default):
{frontend_url}/oauth/callback?access_token=YOUR_ACCESS_TOKEN

# Dual-Token Mode:
{frontend_url}/oauth/callback?access_token=YOUR_ACCESS_TOKEN&refresh_token=YOUR_REFRESH_TOKEN

# When Linking a Logged-In Account:
{frontend_url}/oauth/callback?linked=true&provider=google
```

The frontend callback router reads the parameters, stores the token, and continues the authenticated session.

------------------------------------------------------------------------

# Complete FastAPI Example

``` python
from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()


# Configure Google OAuth once during application setup.
auth.google.config(
    client_id="YOUR_GOOGLE_CLIENT_ID",
    client_secret="YOUR_GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/google/callback",
)


# Start Google OAuth
@app.get("/oauth/google/login")
async def google_login(request: Request):
    return await auth.google.login(
        request=request,
        frontend_url="https://app.example.com",
    )


# Handle Google OAuth callback
@app.get("/oauth/google/callback")
async def google_callback(request: Request):
    return await auth.google.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```

------------------------------------------------------------------------

# Configuration Requirements

The Google OAuth callback URL must be registered with Google and must
match the application's `redirect_uri`.

For example:

``` text
Google OAuth configuration:
https://api.example.com/tc-auth/google/callback

Application:
redirect_uri="https://api.example.com/tc-auth/google/callback"
```

A mismatch between these URLs causes the OAuth flow to fail.

------------------------------------------------------------------------

# Security Considerations

-   Keep `client_secret` private.
-   Do not expose `load()` through a public API endpoint.
-   Register the exact callback URL with Google.
-   Use HTTPS in production.
-   Only allow trusted frontend redirect destinations.
-   Do not allow arbitrary user-supplied `frontend_url` values.
-   Handle the returned access token securely on the frontend.
-   Avoid logging OAuth tokens or client secrets.

------------------------------------------------------------------------

# Quick Reference

  Method         Purpose                          Return
  -------------- -------------------------------- -------------------
  `config()`     Configure Google OAuth           `dict`
  `load()`       Get current configuration        `dict`
  `login()`      Start Google authentication      Redirect response
  `callback()`   Complete Google authentication   Redirect response

------------------------------------------------------------------------

# Quick Usage

``` python
# Configure
auth.google.config(
    client_id="YOUR_GOOGLE_CLIENT_ID",
    client_secret="YOUR_GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/google/callback",
)


# Start OAuth
@app.get("/oauth/google/login")
async def google_login(request: Request):
    return await auth.google.login(
        request=request,
        frontend_url="https://app.example.com",
    )


# Handle callback
@app.get("/oauth/google/callback")
async def google_callback(request: Request):
    return await auth.google.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
```
