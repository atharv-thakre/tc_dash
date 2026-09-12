# JWT API

The `auth.jwt` module provides JWT configuration and utilities for creating, validating, and refreshing access and refresh tokens.

## Available Methods

| Method | Purpose |
| :--- | :--- |
| `config()` | Configures JWT settings including dual-token mode and expiration times. |
| `load()` | Returns the current JWT configuration. |
| `create_access_token()` | Creates a signed JWT access token. |
| `create_refresh_token()` | Creates a signed long-lived refresh token. |
| `verify_token()` | Verifies and decodes a JWT access or refresh token. |
| `refresh_tokens()` | Exchanges an existing valid refresh token for a fresh access token and rotated refresh token. |

---

# JWT Configuration

The JWT module supports both standard single-token mode and production dual-token (Access + Refresh) mode:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `secret_key` | `str` | `"supersecret-key..."` | Secret key used to sign and verify HMAC tokens. |
| `algorithm` | `str` | `"HS256"` | JWT signing algorithm. |
| `session_duration_days` | `int` | `7` | Fallback session lifetime when dual token mode is disabled. |
| `dual_token_mode` | `bool` | `False` | When `True`, login issues short-lived access tokens and durable refresh tokens. |
| `access_token_expire_minutes` | `int` | `15` | Lifetime of access tokens in minutes. |
| `refresh_token_expire_days` | `int` | `7` | Lifetime of refresh tokens in days before re-authentication is required. |

---

# `config()`

Updates the JWT configuration.

```python
auth.jwt.config(...)
```

## Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `secret_key` | `str` | Yes | Secret used to sign and verify JWTs. |
| `algorithm` | `str` | No | JWT signing algorithm (default `"HS256"`). |
| `session_duration_days` | `int` | No | Fallback session validity in days. |
| `dual_token_mode` | `bool` | No | Enables dual-token issuance and rotation. |
| `access_token_expire_minutes`| `int` | No | Access token expiration window in minutes. |
| `refresh_token_expire_days` | `int` | No | Refresh token expiration window in days. |

## Example

```python
auth.jwt.config(
    secret_key="your-super-secret-production-key",
    algorithm="HS256",
    dual_token_mode=True,
    access_token_expire_minutes=15,
    refresh_token_expire_days=7,
)
```

## Returns

```python
{
    "success": True,
    "message": "JWT configured successfully"
}
```

---

# `load()`

Returns the currently configured JWT settings:

```python
config = auth.jwt.load()
```

---

# `refresh_tokens()`

Exchanges a valid refresh token for a new access token and rotated refresh token:

```python
tokens = auth.jwt.refresh_tokens(refresh_token="tc_jwt_ref_...")
```

Returns:

```python
{
    "access_token": "tc_jwt_token_...",
    "refresh_token": "tc_jwt_ref_...",
    "token_type": "Bearer"
}
```
