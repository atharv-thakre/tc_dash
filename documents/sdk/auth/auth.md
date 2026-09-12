# Authentication Service API

The `auth.service` module provides the main authentication operations:

-   Creating login responses
-   Signing up new users
-   Logging in existing users
-   Creating session records

------------------------------------------------------------------------

# Login Response

`signup()`, `login()`, and `create_login_response()` return the same
login response structure:

``` python
# Single-token mode (default)
{
    "access_token": access_token,
    "token_type": "Bearer",
    "account": account
}

# Dual-token mode (when dual_token_mode=True in auth.jwt.config)
{
    "access_token": access_token,
    "refresh_token": refresh_token,
    "token_type": "Bearer",
    "account": account
}
```

  -----------------------------------------------------------------------
  Field                   Type                    Description
  ----------------------- ----------------------- -----------------------
  `access_token`          `str`                   Access token generated
                                                  for the authenticated
                                                  session.

  `refresh_token`         `str` (optional)        Long-lived token used
                                                  to refresh access tokens.

  `token_type`            `str`                   Always `"Bearer"`.

  `account`               `dict`                  Account associated with
                                                  the session.
  -----------------------------------------------------------------------

> **Security:** The `account` object may contain `password_hash` if it
> was retrieved with `include_password=True`.

------------------------------------------------------------------------

# Account Object

An account can be retrieved before creating a login response:

``` python
account: dict = auth.get_user.by_email(
    email="testuser@example.com",
    include_password=False,
)
```

## `include_password`

`include_password` is optional and defaults to `False`.

  Value     Behavior
  --------- -------------------------------------------
  `False`   Recommended. `password_hash` is excluded.
  `True`    `password_hash` is included.

Because the account object is included in the login response,
`include_password=False` is recommended.

------------------------------------------------------------------------

# `create_login_response()`

Creates a login response for an existing account and creates a session
record.

``` python
auth.service.create_login_response(...)
```

## Parameters

  Parameter      Type     Required   Default
  -------------- -------- ---------- ---------
  `account`      `dict`   Yes        ---
  `ip_address`   `str`    No         `None`
  `user_agent`   `str`    No         `None`

`ip_address` and `user_agent` should normally be obtained from the
incoming request.

## Example

``` python
account = auth.get_user.by_email(
    email="testuser@example.com",
    include_password=False,
)

response = auth.service.create_login_response(
    account=account,
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
)
```

## Returns

``` python
{
    "access_token": access_token,
    "token_type": "Bearer",
    "account": account
}
```

------------------------------------------------------------------------

# `signup()`

Creates a new account and returns a login response.

A successful signup also creates a session record.

``` python
auth.service.signup(...)
```

## Parameters

  Parameter      Type    Required   Default
  -------------- ------- ---------- ----------
  `name`         `str`   Yes        ---
  `email`        `str`   Yes        ---
  `password`     `str`   Yes        ---
  `handle`       `str`   No         `None`
  `phone`        `str`   No         `None`
  `role`         `str`   No         `"user"`
  `status`       `str`   No         `None`
  `ip_address`   `str`   No         `None`
  `user_agent`   `str`   No         `None`

### Password Policy
Passwords should be provided as plain text. The authentication system validates password strength and handles password hashing.

> [!IMPORTANT]
> **Password Policy**: Passwords must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number (e.g. `Password123`). Failing this policy raises `WeakPasswordError` (HTTP 400).

## Example

``` python
response = auth.service.signup(
    name="Test User",
    email="testuser@example.com",
    password="Password123",
    handle="testuser",
    phone="1234567890",
    role="user",
    status="active",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
)
```

## Returns

``` python
{
    "access_token": access_token,
    "token_type": "Bearer",
    "account": account
}
```

------------------------------------------------------------------------

# `login()`

Authenticates an existing account and returns a login response.

A successful login also creates a session record.

``` python
auth.service.login(...)
```

## Parameters

  Parameter      Type    Required   Default
  -------------- ------- ---------- ---------
  `identifier`   `str`   Yes        ---
  `password`     `str`   Yes        ---
  `ip_address`   `str`   No         `None`
  `user_agent`   `str`   No         `None`

### Identifier

`identifier` can be either the account's email or handle.

``` python
identifier="testuser@example.com"
```

or:

``` python
identifier="testuser"
```

## Example

``` python
response = auth.service.login(
    identifier="testuser@example.com",
    password="Password123",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
)
```

## Returns

``` python
{
    "access_token": access_token,
    "token_type": "Bearer",
    "account": account
}
```

------------------------------------------------------------------------

# Session Creation

All successful authentication flows below create a session record:

  Method                      Creates Session
  --------------------------- -----------------
  `create_login_response()`   Yes
  `signup()`                  Yes
  `login()`                   Yes

`ip_address` and `user_agent` are optional. If omitted, their value is
`None`.

------------------------------------------------------------------------

# Quick Usage

``` python
from connect import auth


# Get account
account = auth.get_user.by_email(
    email="testuser@example.com",
    include_password=False,
)


# Create login response
response = auth.service.create_login_response(
    account=account,
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0",
)


# Signup
response = auth.service.signup(
    name="Test User",
    email="testuser@example.com",
    password="Password123",
    handle="testuser",
)


# Login using email
response = auth.service.login(
    identifier="testuser@example.com",
    password="Password123",
)


# Login using handle
response = auth.service.login(
    identifier="testuser",
    password="Password123",
)
```
