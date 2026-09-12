# Session API

The `auth.session` module provides methods for creating, retrieving,
deleting, cleaning up, and querying authentication sessions.

## Available Methods

  Method                Purpose
  --------------------- -----------------------------------------------
  `create_session()`    Creates a new authentication session.
  `by_id()`             Retrieves a session by its ID.
  `by_account()`        Retrieves sessions belonging to an account.
  `destroy_session()`   Deletes a specific session.
  `destroy_all()`       Deletes all sessions belonging to an account.
  `cleanup_expired()`   Deletes expired sessions.
  `clear_all()`         Deletes all sessions.
  `get_all()`           Returns a paginated list of sessions.
  `query()`             Searches sessions using a supported field.

------------------------------------------------------------------------

# Session Object

Session retrieval methods return objects with this structure:

``` python
{
    "id": 1,
    "account_id": 1,
    "token_hash": "da4c0342fb73e2b5f7e03bf6adaa02b9bd2a45b8d535b1cee9f675e75e40df7d",
    "ip_address": "2405:201:301a:1a0b:90a:b200:b160:f17e",
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "expires_at": "2026-08-12 00:11:03.646932",
    "created_at": "2026-08-12 00:11:03.646932"
}
```

  Field          Type              Description
  -------------- ----------------- --------------------------------------
  `id`           `int`             Session ID.
  `account_id`   `int`             Account associated with the session.
  `token_hash`   `str`             Hash of the session token.
  `ip_address`   `str` or `None`   Client IP address.
  `user_agent`   `str` or `None`   Client User-Agent.
  `expires_at`   `str`             Session expiration timestamp.
  `created_at`   `str`             Session creation timestamp.

> The raw session token is not stored in the database. Its hash is
> stored as `token_hash`.

------------------------------------------------------------------------

# `create_session()`

Creates a new authentication session.

## Parameters

  Parameter      Type    Required   Default   Description
  -------------- ------- ---------- --------- ----------------------------------------
  `account_id`   `int`   Yes        ---       Account associated with the session.
  `ip_address`   `str`   Yes        ---       Client IP address.
  `user_agent`   `str`   Yes        ---       Client User-Agent header.
  `days`         `int`   No         `7`       Validity period of the session in days.

## Example

``` python
result = auth.session.create_session(
    account_id=1,
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    days=7,
)
```

## Returns

``` python
{
    "session_id": session.id,
    "token": token
}
```

The returned `token` is the raw session token. Only its hash is stored
in the database.

------------------------------------------------------------------------

# `by_id()`

Retrieves a session using its numeric session ID.

## Parameters

  Parameter      Type    Required
  -------------- ------- ----------
  `session_id`   `int`   Yes

## Example

``` python
session = auth.session.by_id(
    session_id=1,
)
```

## Returns

`dict` --- Session object.

------------------------------------------------------------------------

# `by_account()`

Retrieves sessions belonging to an account.

## Parameters

  Parameter      Type    Required
  -------------- ------- ----------
  `account_id`   `int`   Yes

## Example

``` python
sessions = auth.session.by_account(
    account_id=1,
)
```

## Returns

`list[dict]` --- Session objects belonging to the account.

------------------------------------------------------------------------

# `destroy_session()`

Deletes a specific session.

## Parameters

  Parameter      Type    Required
  -------------- ------- ----------
  `session_id`   `int`   Yes

## Example

``` python
result = auth.session.destroy_session(
    session_id=1,
)
```

## Returns

``` python
{
    "success": True,
    "message": "Session destroyed successfully"
}
```

------------------------------------------------------------------------

# `destroy_all()`

Deletes all sessions belonging to an account.

## Parameters

  Parameter      Type    Required
  -------------- ------- ----------
  `account_id`   `int`   Yes

## Example

``` python
result = auth.session.destroy_all(
    account_id=1,
)
```

## Returns

``` python
{
    "success": True,
    "message": "All sessions destroyed for account",
    "count": 2
}
```

------------------------------------------------------------------------

# `cleanup_expired()`

Deletes all expired sessions from the database.

Takes no arguments.

## Example

``` python
result = auth.session.cleanup_expired()
```

## Returns

``` python
{
    "success": True,
    "message": "Expired sessions cleaned up successfully",
    "count": 5
}
```

------------------------------------------------------------------------

# `clear_all()`

Immediately deletes all session records from the database.

Takes no arguments.

> **Warning:** This removes every session, including active sessions.

## Example

``` python
result = auth.session.clear_all()
```

## Returns

``` python
{
    "success": True,
    "message": "All sessions cleared successfully",
    "count": 10
}
```

------------------------------------------------------------------------

# `get_all()`

Returns a paginated list of all session records.

## Parameters

  Parameter   Type    Default
  ----------- ------- ---------
  `page`      `int`   `1`
  `limit`     `int`   `10`

## Pagination

Pagination divides session records into smaller pages.

With `limit=10`:

  Request    Records
  ---------- ---------
  `page=1`   1--10
  `page=2`   11--20
  `page=3`   21--30

Increase the `page` value to retrieve the next set of records.

## Example

``` python
sessions = auth.session.get_all(
    page=1,
    limit=10,
)
```

## Returns

`list[dict]` --- List of session objects.

------------------------------------------------------------------------

# `query()`

Searches session records using a supported field.

## Supported Fields

-   `id`
-   `sid`
-   `ip`
-   `token`

## Parameters

  Parameter   Type    Required
  ----------- ------- ----------
  `field`     `str`   Yes
  `value`     `str`   Yes

`value` should be provided as a string. Typecasting is handled
internally.

## Matching

Partial matching is supported for:

-   `token`
-   `ip`

## Example

``` python
sessions = auth.session.query(
    field="id",
    value="1",
)
```

## Returns

`list[dict]` --- List of matching session objects.

------------------------------------------------------------------------

# Return Summary

  Method                Return
  --------------------- -------------------------------------
  `create_session()`    `dict` --- Session ID and raw token
  `by_id()`             `dict` --- Session object
  `by_account()`        `list[dict]` --- Account sessions
  `destroy_session()`   `dict` --- `{"success": True, "message": "..."}`
  `destroy_all()`       `dict` --- `{"success": True, "count": N}`
  `cleanup_expired()`   `dict` --- `{"success": True, "count": N}`
  `clear_all()`         `dict` --- `{"success": True, "count": N}`
  `get_all()`           `list[dict]`
  `query()`             `list[dict]`

------------------------------------------------------------------------

# Quick Usage

``` python
from connect import auth

session = auth.session.create_session(
    account_id=1,
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0",
)

session = auth.session.by_id(
    session_id=1,
)

sessions = auth.session.by_account(
    account_id=1,
)

auth.session.destroy_session(
    session_id=1,
)

auth.session.destroy_all(
    account_id=1,
)

auth.session.cleanup_expired()

auth.session.clear_all()

sessions = auth.session.get_all(
    page=1,
    limit=10,
)

sessions = auth.session.query(
    field="id",
    value="1",
)
```
