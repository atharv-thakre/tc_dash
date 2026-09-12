# OAuth API

The `auth.oauth` module provides methods for OAuth authentication and
management of OAuth provider links.

## Available Methods

  -----------------------------------------------------------------------
  Method                              Purpose
  ----------------------------------- -----------------------------------
  `login()`                           Authenticate through an OAuth
                                      provider and return a login
                                      response.

  `find_oauth()`                      Find an existing OAuth account
                                      link.

  `link_account()`                    Link an OAuth provider account to
                                      an existing account.

  `unlink_account()`                  Remove an OAuth provider link
                                      (supports lockout prevention).

  `get_account_links()`               Get all active OAuth provider
                                      links for a specific account.

  `get_all()`                         Get a paginated list of OAuth
                                      accounts.

  `query()`                           Search OAuth accounts using exact
                                      matching.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# `login()`

Authenticates a user through an OAuth provider.

``` python
auth.oauth.login(...)
```

## Required Parameters

  Parameter            Type    Description
  -------------------- ------- -----------------------------------------
  `provider`           `str`   OAuth provider name (`google`, `github`, `discord`).
  `provider_user_id`   `str`   User ID provided by the OAuth provider.

## Optional Parameters

  Parameter      Type    Default   Description
  -------------- ------- --------- ------------------------------------
  `name`         `str`   `None`    User's name.
  `email`        `str`   `None`    User's email address.
  `avatar_url`   `str`   `None`    User's avatar URL.
  `ip_address`   `str`   `None`    Client IP address for the session.
  `user_agent`   `str`   `None`    Client User-Agent for the session.

## Behavior

When an OAuth login is performed:

1.  If the OAuth provider account is already linked, the linked account is used.
2.  If not linked yet, the system checks for an existing account matching the provider's verified email (case-insensitively).
3.  If an existing account is found, it automatically links the OAuth provider to that account.
4.  If no matching account exists, a new user account is created and linked.
5.  **Empty fields rule:** If the account has empty/missing fields (`name`, `email`, `avatar_url`), all 3 providers can populate them.
6.  **Overwrite rule:** Non-empty existing data is preserved, except that Google OAuth is permitted to overwrite the email address.
7.  A login response and an active session are created and returned.

------------------------------------------------------------------------

# `find_oauth()`

Finds an OAuth account link using the provider and provider-specific
user ID.

``` python
auth.oauth.find_oauth(...)
```

## Parameters

  Parameter            Type    Required
  -------------------- ------- ----------
  `provider`           `str`   Yes
  `provider_user_id`   `str`   Yes

Both parameters are mandatory.

## Example

``` python
oauth_account = auth.oauth.find_oauth(
    provider="github",
    provider_user_id="1234567890",
)
```

## Returns

Returns an OAuth account object:

``` python
{
    "id": 1,
    "account_id": 1,
    "provider": "github",
    "provider_user_id": "1234567890",
    "created_at": "2026-08-11T18:11:00.001639"
}
```

------------------------------------------------------------------------

# `link_account()`

Links an OAuth provider account to an existing account.

``` python
auth.oauth.link_account(...)
```

## Parameters

  Parameter            Type    Required
  -------------------- ------- ----------
  `account_id`         `int`   Yes
  `provider`           `str`   Yes
  `provider_user_id`   `str`   Yes

All parameters are mandatory.

## Example

``` python
oauth_account = auth.oauth.link_account(
    account_id=1,
    provider="github",
    provider_user_id="1234567890",
)
```

## Returns

Returns the OAuth account object using the same structure as
`find_oauth()`.

------------------------------------------------------------------------

# `unlink_account()`

Removes an OAuth provider link from an existing account.

``` python
auth.oauth.unlink_account(...)
```

## Parameters

  Parameter               Type    Required   Default   Description
  ----------------------- ------- ---------- --------- ---------------------------------------------
  `account_id`            `int`   Yes        ---       The ID of the local account.
  `provider`              `str`   Yes        ---       The provider to unlink (`google`, `github`, `discord`).
  `enforce_active_auth`   `bool`  No         `False`   When `True`, prevents unlinking if the account has no password and no other active OAuth links.

## Lockout Prevention (`enforce_active_auth=True`)

When `enforce_active_auth=True`, the method checks whether the account has an active password (`password_hash`) or at least one other active OAuth provider. If unlinking would leave the account with no authentication method, an `AuthError` (HTTP 400) is raised.

## Example

``` python
response = auth.oauth.unlink_account(
    account_id=1,
    provider="github",
    enforce_active_auth=True,
)
```

## Returns

``` python
{
    "success": True,
    "message": "OAuth link for 'github' removed successfully"
}
```

------------------------------------------------------------------------

# `get_account_links()`

Returns all active OAuth providers linked to a specific user account.

``` python
links = auth.oauth.get_account_links(account_id=1)
```

## Parameters

  Parameter      Type    Required   Description
  -------------- ------- ---------- -----------------------------
  `account_id`   `int`   Yes        The ID of the user account.

## Returns

``` python
[
    {
        "id": 1,
        "account_id": 1,
        "provider": "google",
        "provider_user_id": "1092837192",
        "created_at": "2026-09-12T12:00:00"
    },
    {
        "id": 2,
        "account_id": 1,
        "provider": "github",
        "provider_user_id": "84729104",
        "created_at": "2026-09-12T12:05:00"
    }
]
```

------------------------------------------------------------------------

# `get_all()`

Returns a paginated list of OAuth account records.

``` python
auth.oauth.get_all(...)
```

## Parameters

  Parameter     Type    Default   Description
  ------------- ------- --------- --------------------------------------
  `page`        `int`   `1`       Page number.
  `limit`       `int`   `10`      Number of records returned per page.

Both parameters are optional.

## Pagination

Results are returned from the latest OAuth account record.

For example, with:

``` python
limit=10
```

the results are divided as follows:

  Request    Records
  ---------- -------------------
  `page=1`   Latest 10 records
  `page=2`   Next 10 records
  `page=3`   Next 10 records

Increase the page number to retrieve the next set of records.

## Example

``` python
oauth_accounts = auth.oauth.get_all(
    page=1,
    limit=10,
)
```

## Returns

Returns:

``` text
list[dict]
```

Each dictionary uses the same OAuth account structure returned by
`find_oauth()`.

------------------------------------------------------------------------

# `query()`

Searches OAuth account records using an exact field value.

``` python
auth.oauth.query(...)
```

## Parameters

  Parameter   Type    Required
  ----------- ------- ----------
  `field`     `str`   Yes
  `value`     `str`   Yes

Both parameters are mandatory.

## Supported Fields

The following fields can be queried:

-   `id`
-   `account_id`
-   `provider_id`

## Matching Behavior

Queries use **exact/absolute matching**.

Partial matching is **not supported**.

For example:

``` python
field="id"
value="1"
```

matches the record with ID `1`, but does not perform a partial search.

## Value Type

`value` should be provided as a string.

The SDK automatically handles typecasting internally when required.

## Example

``` python
oauth_accounts = auth.oauth.query(
    field="id",
    value="1",
)
```

## Returns

Returns:

``` text
list[dict]
```

Each dictionary uses the same OAuth account structure returned by
`find_oauth()`.

If no records match the query, an empty list is returned:

``` python
[]
```

------------------------------------------------------------------------

# OAuth Account Object

The OAuth account object returned by:

-   `find_oauth()`
-   `link_account()`
-   `get_all()`
-   `query()`

uses the following structure:

``` python
{
    "id": 1,
    "account_id": 1,
    "provider": "github",
    "provider_user_id": "1234567890",
    "created_at": "2026-08-11T18:11:00.001639"
}
```

  Field                Type    Description
  -------------------- ------- -----------------------------------------
  `id`                 `int`   OAuth link record ID.
  `account_id`         `int`   ID of the linked account.
  `provider`           `str`   OAuth provider name.
  `provider_user_id`   `str`   User ID assigned by the OAuth provider.
  `created_at`         `str`   Time when the OAuth link was created.

------------------------------------------------------------------------

# Return Summary

  Method                 Return
  ---------------------- ------------------------------------------
  `login()`              `dict` --- Login response
  `find_oauth()`         `dict` --- OAuth account
  `link_account()`       `dict` --- OAuth account
  `unlink_account()`     `dict` --- `{"success": True, "message": "..."}`
  `get_account_links()`  `list[dict]` --- Connected OAuth accounts for account
  `get_all()`            `list[dict]` --- OAuth accounts
  `query()`              `list[dict]` --- Matching OAuth accounts

------------------------------------------------------------------------

# Quick Usage

``` python
from connect import auth


# OAuth login
response = auth.oauth.login(
    provider="github",
    provider_user_id="1234567890",
    name="testuser",
    email="testuser@example.com",
)


# Find OAuth link
oauth_account = auth.oauth.find_oauth(
    provider="github",
    provider_user_id="1234567890",
)


# Link OAuth account
oauth_account = auth.oauth.link_account(
    account_id=1,
    provider="github",
    provider_user_id="1234567890",
)


# Unlink OAuth account (with lockout prevention)
result = auth.oauth.unlink_account(
    account_id=1,
    provider="github",
    enforce_active_auth=True,
)


# Get user's linked OAuth providers
user_links = auth.oauth.get_account_links(
    account_id=1,
)


# Get all OAuth accounts (admin)
oauth_accounts = auth.oauth.get_all(
    page=1,
    limit=10,
)


# Query OAuth accounts
oauth_accounts = auth.oauth.query(
    field="id",
    value="1",
)
```
