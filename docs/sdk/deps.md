# Authentication Dependencies API

``` python
from fastapi import Depends
```

The `auth.deps` module provides FastAPI dependencies for authenticating
requests and accessing the current authenticated account, session, and
JWT payload.

It handles both **JWT verification** and **session verification**.

------------------------------------------------------------------------

# Why Use `auth.deps`?

Without authentication dependencies, every protected endpoint would need
to manually:

1.  Extract the authentication token.
2.  Decode and verify the JWT.
3.  Validate the authentication session.
4.  Retrieve the associated account.
5.  Check the authentication state.
6.  Pass the authenticated data to the endpoint.

`auth.deps` centralizes this process.

The dependency performs the authentication checks before the route
executes and provides the verified authentication context to the route.

This makes it especially useful for protected FastAPI endpoints.

------------------------------------------------------------------------

# Authentication Context

`auth.deps.get_current()` returns the complete authentication context:

``` python
{
    "account": account,
    "session": session,
    "payload": payload
}
```

The three components are:

  Field       Description
  ----------- -------------------------------
  `account`   Authenticated account object.
  `session`   Authenticated session object.
  `payload`   Verified JWT payload.

Example structure:

``` python
{
    "account": {
        "id": 1,
        "uid": "ec5acc89-42b7-4056-9dec-d924f2d08201",
        "name": "Atharv Thakre",
        "handle": "atharv",
        "email": "atharvthakre37@gmail.com",
        "phone": "+918839575167",
        "avatar_url": "https://example.com/avatar.jpg",
        "role": "superadmin",
        "status": "active",
        "created_at": "2026-08-07T10:40:06.636360",
        "updated_at": "2026-08-08T00:20:35.380732"
    },
    "session": {
        "id": 60,
        "account_id": 1,
        "token_hash": "...",
        "ip_address": "2405:201:301a:1a0b:2402:59e4:eb47:5276",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "expires_at": "2026-08-13T14:27:47.431684",
        "created_at": "2026-08-12T14:27:47.435027"
    },
    "payload": {
        "aid": 1,
        "sid": 60,
        "token": "...",
        "exp": 1787129867
    }
}
```

------------------------------------------------------------------------

# JWT and Session Verification

`auth.deps` handles authentication using both the JWT and its associated
session.

### JWT

The JWT provides the authentication token and claims such as:

-   Account ID (`aid`)
-   Session ID (`sid`)
-   Expiration (`exp`)
-   Token information

### Session

The server-side session provides additional authentication state and
allows the system to validate the session independently of the JWT.

This means authentication is not based only on whether a JWT can be
decoded.

The dependency verifies the authentication context and then provides the
associated account, session, and payload.

------------------------------------------------------------------------

# `get_current()`

Returns the complete authentication context.

``` python
auth.deps.get_current()
```

## Returns

``` python
{
    "account": account,
    "session": session,
    "payload": payload
}
```

Use this when the endpoint needs all authentication information.

## Example

``` python
@app.get("/me")
def fetch_me(user=Depends(auth.deps.get_current)):
    return user
```

The dependency runs before the endpoint body.

If authentication succeeds, the route receives the verified
authentication context.

If authentication fails, the request is stopped before the route logic
continues.

------------------------------------------------------------------------

# `get_current_account()`

Returns only the authenticated account.

``` python
auth.deps.get_current_account
```

## Returns

``` text
dict
```

Returns the current authenticated account object.

## When to Use

Use this when the endpoint only needs account information and does not
need the session or JWT payload.

## Example

``` python
@app.get("/me/account")
def fetch_account(
    account=Depends(auth.deps.get_current_account)
):
    return account
```

------------------------------------------------------------------------

# `get_current_session()`

Returns only the current authenticated session.

``` python
auth.deps.get_current_session
```

## Returns

``` text
dict
```

Returns the current session object.

The session can contain information such as:

-   Session ID
-   Account ID
-   IP address
-   User-Agent
-   Expiration time
-   Creation time

## When to Use

Use this when the endpoint needs information about the current session.

## Example

``` python
@app.get("/me/session")
def fetch_session(
    session=Depends(auth.deps.get_current_session)
):
    return session
```

------------------------------------------------------------------------

# `get_current_payload()`

Returns only the verified JWT payload.

``` python
auth.deps.get_current_payload
```

## Returns

``` text
dict
```

Example payload:

``` python
{
    "aid": 1,
    "sid": 60,
    "token": "...",
    "exp": 1787129867
}
```

## When to Use

Use this when the endpoint only needs verified JWT claims.

## Example

``` python
@app.get("/me/payload")
def fetch_payload(
    payload=Depends(auth.deps.get_current_payload)
):
    return payload
```

------------------------------------------------------------------------

# Choosing a Dependency

  -------------------------------------------------------------------------
  Dependency                Returns                 Use When
  ------------------------- ----------------------- -----------------------
  `get_current`             Account + session +     Complete authentication
                            payload                 context is needed.

  `get_current_account`     Account                 Only account
                                                    information is
                                                    required.

  `get_current_session`     Session                 Only session
                                                    information is
                                                    required.

  `get_current_payload`     JWT payload             Only verified JWT
                                                    claims are required.
  -------------------------------------------------------------------------

------------------------------------------------------------------------

# FastAPI Usage

`auth.deps` is designed to work with FastAPI's `Depends()`.

A protected endpoint can declare the required authentication dependency:

``` python
@app.get("/me")
def fetch_me(
    user=Depends(auth.deps.get_current)
):
    return user
```

The dependency handles authentication before the endpoint executes.

This keeps authentication logic separate from application logic and
avoids duplicating JWT and session verification across protected routes.

------------------------------------------------------------------------

# Quick Usage

``` python
from fastapi import Depends
from connect import auth


# Complete authentication context
@app.get("/me")
def fetch_me(
    user=Depends(auth.deps.get_current)
):
    return user


# Current account only
@app.get("/me/account")
def fetch_account(
    account=Depends(auth.deps.get_current_account)
):
    return account


# Current session only
@app.get("/me/session")
def fetch_session(
    session=Depends(auth.deps.get_current_session)
):
    return session


# Current JWT payload only
@app.get("/me/payload")
def fetch_payload(
    payload=Depends(auth.deps.get_current_payload)
):
    return payload
```
