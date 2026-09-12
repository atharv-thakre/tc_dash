## Account API
The `auth.account` module provides methods to retrieve accounts using
different account fields.

Methods that return account data use the following structure:

``` json
{
  "id": 1,
  "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
  "name": "Test User",
  "handle": "testuser",
  "email": "testuser@example.com",
  "phone": "1234567890",
  "avatar_url": "https://example.com/avatar.jpg",
  "role": "user",
  "status": "active",
  "created_at": "2026-08-11T18:11:00.001639",
  "updated_at": "2026-08-11T18:11:00.001639"
}
```

### Field Description

  -----------------------------------------------------------------------
  Field                   Type                    Description
  ----------------------- ----------------------- -----------------------
  `id`                    `int`                   Numeric database ID of
                                                  the account.

  `uid`                   `str`                   Unique UUID assigned to
                                                  the account.

  `name`                  `str`                   User's display name.

  `handle`                `str`                   Unique username/handle.

  `email`                 `str`                   Unique email address.

  `phone`                 `str`                   Unique phone number.

  `avatar_url`            `str`                   URL of the user's
                                                  avatar.

  `role`                  `str`                   Account role. Defaults
                                                  to `user` when creating
                                                  an account.

  `status`                `str` or `None`         Account status.
                                                  Defaults to `None` when
                                                  creating an account.

  `created_at`            `str`                   Account creation
                                                  timestamp.

  `updated_at`            `str`                   Last account update
                                                  timestamp.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 1. Create User

Creates a new user account.

``` python
auth.account.create_user(...)
```

## Parameters

All parameters are optional.

  ------------------------------------------------------------------------
  Parameter         Type              Default           Description
  ----------------- ----------------- ----------------- ------------------
  `name`            `str`             `None`            User's display
                                                        name.

  `password`        `str`             `None`            Raw password.
                                                        Automatically
                                                        hashed before
                                                        being stored.

  `email`           `str`             `None`            User's email
                                                        address. Must be
                                                        unique.

  `handle`          `str`             `None`            Username/handle.
                                                        Must be unique.

  `avatar_url`      `str`             `None`            URL of the user's
                                                        avatar.

  `phone`           `str`             `None`            User's phone
                                                        number. Must be
                                                        unique.

  `role`            `str`             `"user"`          Account role.

  `status`          `str`             `None`            Account status.
  ------------------------------------------------------------------------

### Password Handling

Passwords should always be passed as raw/plain text to the SDK:

``` python
password="123456"
```

The SDK automatically hashes the password before storing it in the
database.

### Unique Fields

The following fields must be unique:

-   `email`
-   `handle`
-   `phone`

## Example

``` python
result = auth.account.create_user(
    name="Test User",
    password="123456",
    email="testuser@example.com",
    handle="testuser",
    avatar_url="https://example.com/avatar.jpg",
    phone="+651234567890",
    role="user",
    status="active",
)
```

## Return Value

Returns a `dict` containing the newly created account.

``` python
{
    "id": 1,
    "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
    "name": "Test User",
    "handle": "testuser",
    "email": "testuser@example.com",
    "phone": "1234567890",
    "avatar_url": "https://example.com/avatar.jpg",
    "role": "user",
    "status": "active",
    "created_at": "2026-08-11T18:11:00.001639",
    "updated_at": "2026-08-11T18:11:00.001639"
}
```

------------------------------------------------------------------------

# 2. Delete User

Permanently deletes an existing account.

``` python
auth.account.delete_user(...)
```

## Parameters

  -----------------------------------------------------------------------
  Parameter         Type              Required          Description
  ----------------- ----------------- ----------------- -----------------
  `account_id`      `int`             Yes               Numeric database
                                                        ID of the account
                                                        to delete.

  -----------------------------------------------------------------------

## Example

``` python
auth.account.delete_user(
    account_id=1,
)
```

## Return Value

``` python
{
    "success": True,
    "message": "Account deleted successfully"
}
```

------------------------------------------------------------------------

# 3. Update User

Updates one or more standard fields of an existing account.

``` python
auth.account.update_user(...)
```

## Required Parameter

  Parameter      Type    Description
  -------------- ------- -------------------------------------
  `account_id`   `int`   Numeric database ID of the account.

## Optional Parameters

  Parameter      Type    Description
  -------------- ------- ----------------------------------------
  `name`         `str`   Updated display name.
  `email`        `str`   Updated email address. Must be unique.
  `handle`       `str`   Updated handle. Must be unique.
  `avatar_url`   `str`   Updated avatar URL.
  `phone`        `str`   Updated phone number. Must be unique.

## Update Behavior

Only values supplied to the function are updated.

If a field is:

-   `None`
-   empty

that field is ignored and its existing database value remains unchanged.

For example:

``` python
auth.account.update_user(
    account_id=1,
    name="Updated User",
)
```

Only the `name` field is changed.

## Important

`update_user()` does **not** update:

-   `password`
-   `role`
-   `status`

Use the dedicated methods or `super_update()` when those fields need to
be changed.

## Example

``` python
updated_user = auth.account.update_user(
    account_id=1,
    name="Updated User",
    email="updateduser@example.com",
    handle="updateduser",
    avatar_url="https://example.com/avatar.jpg",
    phone="+651234567890",
)
```

## Return Value

Returns the updated account object as a `dict`.

------------------------------------------------------------------------

# 4. Super Update

Updates any supported account field, including privileged fields such as
password, role, and status.

``` python
auth.account.super_update(...)
```

## Required Parameter

  Parameter      Type    Description
  -------------- ------- -------------------------------------
  `account_id`   `int`   Numeric database ID of the account.

## Optional Parameters

  -----------------------------------------------------------------------
  Parameter         Type              Default           Description
  ----------------- ----------------- ----------------- -----------------
  `name`            `str`             `None`            Updated display
                                                        name.

  `email`           `str`             `None`            Updated email
                                                        address. Must be
                                                        unique.

  `handle`          `str`             `None`            Updated handle.
                                                        Must be unique.

  `avatar_url`      `str`             `None`            Updated avatar
                                                        URL.

  `phone`           `str`             `None`            Updated phone
                                                        number. Must be
                                                        unique.

  `role`            `str`             `"user"`          Updated account
                                                        role.

  `status`          `str`             `None`            Updated account
                                                        status.

  `password`        `str`             `None`            Raw password.
                                                        Automatically
                                                        hashed before
                                                        storage.
  -----------------------------------------------------------------------

## Update Behavior

Only fields containing a value are updated.

Fields passed as `None` or an empty value are ignored, so their existing
values remain unchanged.

## Password Handling

The password must be supplied as raw/plain text:

``` python
password="updatedpassword"
```

The SDK automatically hashes the password before storing it.

## Example

``` python
updated_user = auth.account.super_update(
    account_id=1,
    name="Updated User",
    email="updateduser@example.com",
    handle="updateduser",
    avatar_url="https://example.com/avatar.jpg",
    phone="+651234567890",
    role="admin",
    status="active",
    password="updatedpassword",
)
```

## Return Value

Returns the updated account object as a `dict`.

------------------------------------------------------------------------

# 5. Update Password

Changes the password of an existing account.

``` python
auth.account.update_password(...)
```

## Parameters

  Parameter      Type    Required   Description
  -------------- ------- ---------- -------------------------------------
  `account_id`   `int`   Yes        Numeric database ID of the account.
  `password`     `str`   Yes        New raw/plain-text password.

## Password Handling

The password is automatically hashed before being stored.

``` python
result = auth.account.update_password(
    account_id=1,
    password="updatedpassword",
)
```

## Return Value

``` python
{
    "success": True,
    "message": "Password updated successfully"
}
```

------------------------------------------------------------------------

# 6. Update Status

Changes the status of an existing account.

``` python
auth.account.update_status(...)
```

## Parameters

  Parameter      Type    Required   Description
  -------------- ------- ---------- -------------------------------------
  `account_id`   `int`   Yes        Numeric database ID of the account.
  `status`       `str`   Yes        New account status.

The `status` field may default to `None` when an account is created, but
this method requires an explicit status value.

## Example

``` python
updated_user = auth.account.update_status(
    account_id=1,
    status="active",
)
```

## Return Value

Returns `{"success": True, "message": "Status updated successfully"}`.

------------------------------------------------------------------------

# 7. Update Role

Changes the role of an existing account.

``` python
auth.account.update_role(...)
```

## Parameters

  Parameter      Type    Required   Description
  -------------- ------- ---------- -------------------------------------
  `account_id`   `int`   Yes        Numeric database ID of the account.
  `role`         `str`   Yes        New account role.

The default role when creating an account is `user`, but this method
requires an explicit role.

## Example

``` python
result = auth.account.update_role(
    account_id=1,
    role="admin",
)
```

## Return Value

Returns `{"success": True, "message": "Role updated successfully"}`.

------------------------------------------------------------------------

# 8. Get All Accounts

Returns a paginated list of all accounts.

``` python
auth.account.get_all(...)
```

## Parameters

  -----------------------------------------------------------------------
  Parameter         Type              Default           Description
  ----------------- ----------------- ----------------- -----------------
  `page`            `int`             `1`               Page number to
                                                        retrieve.

  `limit`           `int`             `10`              Number of
                                                        accounts to
                                                        return per page.
                                                        Must be between
                                                        `1` and `100`.
  -----------------------------------------------------------------------

## Pagination

Pagination divides a large set of accounts into smaller groups called
pages.

For example, with:

``` python
limit=10
```

the results are divided as follows:

  Request              Accounts
  -------------------- ----------
  `page=1, limit=10`   1--10
  `page=2, limit=10`   11--20
  `page=3, limit=10`   21--30

To retrieve the next page, increase the `page` value.

### Example

``` python
result = auth.account.get_all(
    page=1,
    limit=10,
)
```

## Return Value

Returns a `list[dict]`.

Each dictionary represents an account and has the same structure as the
object returned by `create_user()`.

Example:

``` python
[
    {
        "id": 1,
        "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
        "name": "Test User",
        "handle": "testuser",
        "email": "testuser@example.com",
        "phone": "1234567890",
        "avatar_url": "https://example.com/avatar.jpg",
        "role": "user",
        "status": "active",
        "created_at": "2026-08-11T18:11:00.001639",
        "updated_at": "2026-08-11T18:11:00.001639"
    }
]
```

------------------------------------------------------------------------

# 9. Query Accounts

Searches for accounts using a specific account field.

``` python
auth.account.query(...)
```

## Parameters

  -----------------------------------------------------------------------
  Parameter               Type                    Description
  ----------------------- ----------------------- -----------------------
  `field`                 `str`                   Account field to
                                                  search.

  `value`                 `str`                   Value to search for.
                                                  The SDK automatically
                                                  typecasts it when
                                                  required.
  -----------------------------------------------------------------------

## Supported Fields

The following fields can be queried:

-   `name`
-   `handle`
-   `email`
-   `phone`
-   `uid`

## Matching Behavior

### `name`

Searches using the supplied name value.

``` python
auth.account.query(
    field="name",
    value="Test User",
)
```

### `handle`

Supports partial matching.

### `email`

Supports partial matching.

### `phone`

Supports partial matching.

### `uid`

Searches using the account UUID.

## Automatic Typecasting

The `value` parameter should be supplied as a string.

The SDK automatically typecasts the value when necessary based on the
selected field.

For example:

``` python
auth.account.query(
    field="uid",
    value="1d7d1310-13e5-4769-8511-d3bc837cf55f",
)
```

## Return Value

Returns a `list[dict]` containing all matching accounts.

Each dictionary has the same structure as the object returned by
`create_user()`.

If no account matches the query, an empty list is returned:

``` python
[]
```

## Example

``` python
result = auth.account.query(
    field="name",
    value="Test User",
)
```

Example output:

``` python
[
    {
        "id": 1,
        "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
        "name": "Test User",
        "handle": "testuser",
        "email": "testuser@example.com",
        "phone": "1234567890",
        "avatar_url": "https://example.com/avatar.jpg",
        "role": "user",
        "status": "active",
        "created_at": "2026-08-11T18:11:00.001639",
        "updated_at": "2026-08-11T18:11:00.001639"
    }
]
```

------------------------------------------------------------------------

# Return Value Summary

  Method                Returns        Description
  --------------------- -------------- -----------------------------------------
  `create_user()`       `dict`         Newly created account.
  `delete_user()`       `dict`         Deletes an account (`success`, `message`).
  `update_user()`       `dict`         Updates standard account fields.
  `super_update()`      `dict`         Updates standard and privileged fields.
  `update_password()`   `dict`         Updates account password (`success`, `message`).
  `update_status()`     `dict`         Updates account status (`success`, `message`).
  `update_role()`       `dict`         Updates account role (`success`, `message`).
  `get_all()`           `list[dict]`   Paginated list of accounts.
  `query()`             `list[dict]`   List of matching accounts.

## Quick Usage Reference

``` python
from connect import auth

# Create
account = auth.account.create_user(
    name="Test User",
    password="123456",
    email="testuser@example.com",
    handle="testuser",
)

# Delete
auth.account.delete_user(account_id=1)

# Update standard fields
auth.account.update_user(
    account_id=1,
    name="Updated User",
)

# Update any supported field
auth.account.super_update(
    account_id=1,
    role="admin",
    status="active",
)

# Update password
auth.account.update_password(
    account_id=1,
    password="updatedpassword",
)

# Update status
auth.account.update_status(
    account_id=1,
    status="active",
)

# Update role
auth.account.update_role(
    account_id=1,
    role="admin",
)

# Get accounts
accounts = auth.account.get_all(
    page=1,
    limit=10,
)

# Search accounts
accounts = auth.account.query(
    field="name",
    value="Test User",
)
```
