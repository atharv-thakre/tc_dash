# JWT API

The `auth.jwt` module provides JWT configuration and utilities for
creating and verifying access tokens.

## Available Methods

  Method                    Purpose
  ------------------------- ------------------------------------------
  `config()`                Configures JWT settings.
  `load()`                  Returns the current JWT configuration.
  `create_access_token()`   Creates a signed JWT access token.
  `verify_token()`          Verifies and decodes a JWT access token.

------------------------------------------------------------------------

# JWT Configuration

The JWT module uses three configuration values:

  -----------------------------------------------------------------------
  Setting                             Description
  ----------------------------------- -----------------------------------
  `secret_key`                        Secret key used to sign and verify
                                      tokens.

  `algorithm`                         JWT signing algorithm.

  `session_duration_days`             Number of days newly created tokens
                                      remain valid.
  -----------------------------------------------------------------------

The default configuration is equivalent to:

``` python
SECRET_KEY = "this-is-my-super-secret-key-for-jwt-auth"
ALGORITHM = "HS256"
SESSION_DURATION_DAYS = 7
```

> **Security:** Replace the default secret key with a strong private key
> in real applications.

------------------------------------------------------------------------

# `config()`

Updates the JWT configuration.

``` python
auth.jwt.config(...)
```

## Parameters

  -------------------------------------------------------------------------------
  Parameter                 Type              Required          Description
  ------------------------- ----------------- ----------------- -----------------
  `secret_key`              `str`             Yes               Secret used to
                                                                sign and verify
                                                                JWTs.

  `algorithm`               `str`             Yes               JWT signing
                                                                algorithm.

  `session_duration_days`   `int`             Yes               Token validity
                                                                period in days.

  `dual_token_mode`         `bool`            No                Enable access + refresh
                                                                tokens (default False).

  `access_token_expire_minutes` `int`         No                Access token duration
                                                                in minutes (default 15).

  `refresh_token_expire_days` `int`           No                Refresh token duration
                                                                in days (default 7).
  -------------------------------------------------------------------------------

## Example

``` python
# Default (Single-token mode)
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=7,
)

# Optional Dual-token mode
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=7,
    dual_token_mode=True,
    access_token_expire_minutes=15,
    refresh_token_expire_days=7,
)
```

## Returns

``` python
{
    "success": True,
    "message": "JWT configured successfully"
}
```

> Keep the secret key private and never commit it to source control.

------------------------------------------------------------------------

# `load()`

Returns the currently configured JWT settings.

``` python
config = auth.jwt.load()
```

## Returns

``` python
{
    "secret_key": "...",
    "algorithm": "HS256",
    "session_duration_days": 7
}
```

> Do not expose this result through a public API endpoint because it
> contains the JWT secret key.

------------------------------------------------------------------------

# `create_access_token()`

Creates a signed JWT access token from the supplied payload.

``` python
auth.jwt.create_access_token(...)
```

## Parameters

  Parameter   Type     Required   Description
  ----------- -------- ---------- -------------------------------------
  `data`      `dict`   Yes        Data to include in the JWT payload.

The method automatically adds an `exp` claim containing the token
expiration timestamp.

The expiration is calculated using:

``` text
session_duration_days × 24 × 60 × 60
```

## Example

``` python
access_token = auth.jwt.create_access_token(
    data={
        "aid": 1,
        "sid": 60,
    },
)
```

## Returns

``` text
str
```

A signed and encoded JWT access token.

The resulting payload will contain the supplied data plus `exp`:

``` python
{
    "aid": 1,
    "sid": 60,
    "exp": 1787129867
}
```

------------------------------------------------------------------------

# `verify_token()`

Verifies and decodes a JWT access token.

``` python
auth.jwt.verify_token(...)
```

## Parameters

  Parameter   Type    Required   Description
  ----------- ------- ---------- -----------------------------
  `token`     `str`   Yes        JWT access token to verify.

The token is verified using the configured:

-   Secret key
-   Signing algorithm
-   Expiration

## Example

``` python
payload = auth.jwt.verify_token(
    token=access_token,
)
```

## Returns

``` text
dict
```

Example:

``` python
{
    "aid": 1,
    "sid": 60,
    "exp": 1787129867
}
```

## Invalid Tokens

If the token cannot be verified or is invalid, `InvalidTokenError` is
raised.

``` python
try:
    payload = auth.jwt.verify_token(token)
except InvalidTokenError:
    # Handle invalid authentication
    ...
```

------------------------------------------------------------------------

# Typical JWT Flow

``` text
Configure JWT
     |
     v
auth.jwt.config()
     |
     v
Create Payload
     |
     v
auth.jwt.create_access_token()
     |
     v
JWT Access Token
     |
     v
Client Sends Token
     |
     v
auth.jwt.verify_token()
     |
     v
Verified Payload
```

------------------------------------------------------------------------

# Complete Example

``` python
from connect import auth


# Configure JWT during application startup
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=7,
)


# Create an access token
token = auth.jwt.create_access_token(
    data={
        "aid": 1,
        "sid": 60,
    },
)


# Verify the access token
payload = auth.jwt.verify_token(
    token=token,
)


# Read current configuration
config = auth.jwt.load()
```

------------------------------------------------------------------------

# Return Summary

  Method                    Return
  ------------------------- --------
  `config()`                `dict` --- `{"success": True, "message": "..."}`
  `load()`                  `dict`
  `create_access_token()`   `str`
  `verify_token()`          `dict`

------------------------------------------------------------------------

# Security Notes

-   Keep the JWT secret key private.
-   Use a strong, randomly generated secret key.
-   Never commit the secret key to Git.
-   Do not expose the result of `load()` through a public API.
-   Use HTTPS when transmitting access tokens.
-   Treat verified JWT payloads as trusted only after successful
    `verify_token()`.
-   Do not manually modify a JWT after it has been created.
