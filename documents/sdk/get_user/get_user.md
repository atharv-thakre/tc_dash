## Get User API
The `auth.get_user` module provides methods to retrieve accounts using
different account fields.

## Common Behavior

All `by_*` methods:

-   Return a single account as a `dict`.
-   Raise an exception if the account is not found.
-   Support the optional `include_password` parameter.
-   `include_password` defaults to `False`.

When `include_password=True`, the returned account includes
`password_hash`. When `include_password=False`, `password_hash` is
omitted.

### Account Object

The returned account uses the following structure:

``` python
{
    "id": 8,
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

With `include_password=True`, the following additional field is
included:

``` python
"password_hash": "..."
```

> `password_hash` contains the hashed password, never the original
> plain-text password.

------------------------------------------------------------------------

# Methods

## `by_id()`

Retrieves an account using its numeric database ID.

### Parameters

  Parameter            Type     Required   Default
  -------------------- -------- ---------- ---------
  `account_id`         `int`    Yes        ---
  `include_password`   `bool`   No         `False`

### Returns

`dict` --- The matching account.

### Example

``` python
user = auth.get_user.by_id(
    account_id=1,
)
```

------------------------------------------------------------------------

## `by_uid()`

Retrieves an account using its unique UUID.

### Parameters

  Parameter            Type     Required   Default
  -------------------- -------- ---------- ---------
  `uid`                `str`    Yes        ---
  `include_password`   `bool`   No         `False`

### Returns

`dict` --- The matching account.

### Example

``` python
user = auth.get_user.by_uid(
    uid="1d7d1310-13e5-4769-8511-d3bc837cf55f",
)
```

------------------------------------------------------------------------

## `by_email()`

Retrieves an account using its email address.

### Parameters

  Parameter            Type     Required   Default
  -------------------- -------- ---------- ---------
  `email`              `str`    Yes        ---
  `include_password`   `bool`   No         `False`

### Returns

`dict` --- The matching account.

### Example

``` python
user = auth.get_user.by_email(
    email="testuser@example.com",
)
```

------------------------------------------------------------------------

## `by_handle()`

Retrieves an account using its unique handle.

### Parameters

  Parameter            Type     Required   Default
  -------------------- -------- ---------- ---------
  `handle`             `str`    Yes        ---
  `include_password`   `bool`   No         `False`

### Returns

`dict` --- The matching account.

### Example

``` python
user = auth.get_user.by_handle(
    handle="testuser",
)
```

------------------------------------------------------------------------

## `by_phone()`

Retrieves an account using its phone number.

### Parameters

  Parameter            Type     Required   Default
  -------------------- -------- ---------- ---------
  `phone`              `str`    Yes        ---
  `include_password`   `bool`   No         `False`

### Returns

`dict` --- The matching account.

### Example

``` python
user = auth.get_user.by_phone(
    phone="1234567890",
)
```

------------------------------------------------------------------------

# `find_by_email()`

`find_by_email()` is similar to `by_email()`, but handles a missing
account differently.

  Method              User found   User not found
  ------------------- ------------ ------------------
  `by_email()`        `dict`       Raises exception
  `find_by_email()`   `dict`       `None`

### Parameters

  Parameter            Type     Required   Default
  -------------------- -------- ---------- ---------
  `email`              `str`    Yes        ---
  `include_password`   `bool`   No         `False`

### Returns

`dict | None`

Returns the matching account, or `None` when no account exists.

### Example

``` python
user = auth.get_user.find_by_email(
    email="testuser@example.com",
)
```

If the account does not exist:

``` python
user is None
```

------------------------------------------------------------------------

# Return Behavior

  Method              Found    Not Found
  ------------------- -------- -----------
  `by_id()`           `dict`   Exception
  `by_uid()`          `dict`   Exception
  `by_email()`        `dict`   Exception
  `by_handle()`       `dict`   Exception
  `by_phone()`        `dict`   Exception
  `find_by_email()`   `dict`   `None`
