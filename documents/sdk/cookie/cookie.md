# Cookie Configuration Subsystem API

The `auth.cookie` module provides a comprehensive configuration and helper subsystem for managing secure, `HttpOnly` session cookies in `tc_auth`.

## Available Methods

| Method | Purpose |
| :--- | :--- |
| `config()` | Configures runtime cookie settings (mode, names, security flags, path, domain, same-site). |
| `load()` | Returns the active cookie subsystem configuration. |
| `is_cookie_mode()` | Returns `True` if cookie mode is enabled, `False` otherwise. |
| `set_cookies()` | Attaches `Set-Cookie` headers for access token and optional refresh token to a FastAPI `Response`. |
| `clear_cookies()` | Sets expired `Set-Cookie` headers (`Max-Age=0`) to destroy session cookies upon logout. |
| `extract_token_from_request()` | Extracts the access token from request cookies. |
| `extract_refresh_token_from_request()` | Extracts the refresh token from request cookies. |

---

# Cookie Configuration

The Cookie subsystem supports the following parameters:

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `cookie_mode` | `bool` | `False` | When `True`, authentication endpoints set `Set-Cookie` headers. |
| `access_cookie_name` | `str` | `"access_token"` | Name of the cookie storing the JWT access token. |
| `refresh_cookie_name` | `str` | `"refresh_token"` | Name of the cookie storing the rotating refresh token. |
| `path` | `str` | `"/"` | URL path scope for the cookie. |
| `domain` | `str \| None` | `None` | Optional host domain (e.g., `".example.com"` for subdomains). |
| `secure` | `bool` | `False` | Enforces transmission over encrypted HTTPS only. Must be `True` in production. |
| `httponly` | `bool` | `True` | Prevents client JavaScript access, mitigating XSS attacks. |
| `samesite` | `str` | `"lax"` | Cross-site policy: `"lax"`, `"strict"`, or `"none"`. |
| `max_age` | `int \| None` | `None` | Explicit cookie lifetime in seconds (defaults to JWT expiry). |

---

# `config()`

Updates runtime cookie settings.

```python
auth.cookie.config(
    cookie_mode=True,
    access_cookie_name="access_token",
    refresh_cookie_name="refresh_token",
    path="/",
    domain=None,
    secure=True,
    httponly=True,
    samesite="lax",
    max_age=None
)
```

## Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cookie_mode` | `bool` | No | Master toggle for Cookie mode (default: `False`). |
| `access_cookie_name` | `str` | No | Access token cookie key (default: `"access_token"`). |
| `refresh_cookie_name` | `str` | No | Refresh token cookie key (default: `"refresh_token"`). |
| `path` | `str` | No | Cookie path restriction (default: `"/"`). |
| `domain` | `str \| None` | No | Domain restriction (default: `None`). |
| `secure` | `bool` | No | HTTPS requirement (default: `False`). |
| `httponly` | `bool` | No | XSS mitigation flag (default: `True`). |
| `samesite` | `str` | No | SameSite policy: `"lax"`, `"strict"`, or `"none"`. |
| `max_age` | `int \| None` | No | Expiration in seconds. |

---

# Usage Example

```python
from fastapi import FastAPI, Response, Depends
from connect import auth

app = FastAPI()

# Configure Cookie Mode
auth.cookie.config(
    cookie_mode=True,
    secure=True,
    httponly=True,
    samesite="lax"
)

# Login endpoint setting cookies
@app.post("/login")
async def login(response: Response):
    token_response = auth.service.login_password(
        email="user@example.com",
        password="securePassword123",
        response=response
    )
    return token_response

# Protected endpoint reading from cookies or Authorization header
@app.get("/me")
async def get_me(account = Depends(auth.deps.get_current_account)):
    return {"account": account}

# Logout clearing cookies
@app.post("/logout")
async def logout(response: Response):
    auth.cookie.clear_cookies(response)
    return {"success": True, "message": "Logged out successfully"}
```
