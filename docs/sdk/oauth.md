# OAuth API

The `auth.oauth` module provides methods for OAuth authentication and management of OAuth provider links. Supported providers include **Google**, **GitHub**, and **Discord**.

## Available Methods

| Method | Purpose |
| :--- | :--- |
| `login()` | Authenticate through an OAuth provider and return a login response. |
| `find_oauth()` | Find an existing OAuth account link. |
| `link_account()` | Link an OAuth provider account to an existing account. |
| `unlink_account()` | Remove an OAuth provider link. |
| `unlink_account_safe()` | Remove an OAuth link with **Lockout Prevention** validation. |
| `get_all()` | Get a paginated list of OAuth accounts. |
| `query()` | Search OAuth accounts using exact or partial matching. |

---

# `login()`

Authenticates a user through an OAuth provider.

```python
auth.oauth.login(...)
```

## Required Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `provider` | `str` | OAuth provider name: `"google"`, `"github"`, or `"discord"`. |
| `provider_user_id` | `str` | User ID provided by the OAuth provider. |

## Optional Parameters

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `name` | `str` | `None` | User's display name. |
| `email` | `str` | `None` | User's email address. |
| `avatar_url` | `str` | `None` | User's avatar URL. |
| `ip_address` | `str` | `None` | Client IP address for the session. |
| `user_agent` | `str` | `None` | Client User-Agent for the session. |

## Behavior

When an OAuth login is performed:

1. If the OAuth account is already linked, the linked account is used.
2. If the OAuth account is not linked to an account, a new account is created.
3. The new account is automatically linked to the OAuth provider account using the user's email.
4. A login response is returned with `access_token` (and `refresh_token` when dual-token mode is enabled).
5. A session record is created.

---

# Safe Unlinking & Lockout Prevention: `unlink_account_safe()`

Unlinks an OAuth provider from an account while guaranteeing the user will not be locked out of their account:

```python
result = auth.oauth.unlink_account_safe(
    account_id="tc_usr_01",
    provider="github"
)
```

## Lockout Prevention Enforcement

An account cannot unlink an OAuth provider if:
1. The account does **not** have a password configured, **AND**
2. The provider being removed is the **only** linked authentication method.

If this condition occurs, an `AccountLockoutError` is raised (HTTP `400 Bad Request` in API routes):

```python
{
    "success": False,
    "message": "Cannot unlink provider: account must have a password or at least one other active authentication method"
}
```
