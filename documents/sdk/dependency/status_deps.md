# Status Dependencies API

``` python
from fastapi import Depends
```

The status dependency service provides FastAPI dependencies for
restricting endpoints based on the authenticated user's account status.

Status checks use `auth.deps.get_current_account()` internally, so the
request must first pass the normal authentication checks.

------------------------------------------------------------------------

# Available Methods

  Method        Behavior
  ------------- ----------------------------------------
  `require()`   Allows exactly one specified status.
  `allow()`     Allows one or more specified statuses.
  `block()`     Blocks one or more specified statuses.

Each method returns a FastAPI dependency that can be used with
`Depends()`.

------------------------------------------------------------------------

# `require()`

Allows access only when the authenticated user's status exactly matches
the specified status.

``` python
auth.status.require("active")
```

## Parameters

  Parameter   Type    Description
  ----------- ------- -------------------------------------------------
  `status`    `str`   The only status allowed to access the endpoint.

## Example

``` python
@app.get("/active")
def active_route(
    user=Depends(auth.status.require("active"))
):
    return user
```

If the user's status is:

``` text
active
```

the request is allowed.

If the user's status is:

``` text
inactive
```

`PermissionDeniedError` is raised.

------------------------------------------------------------------------

# `allow()`

Allows access when the authenticated user's status matches **any** of
the specified statuses.

``` python
auth.status.allow(...)
```

## Parameters

``` text
*statuses: str
```

One or more statuses that are allowed to access the endpoint.

## Example

``` python
@app.get("/account-area")
def account_area(
    user=Depends(
        auth.status.allow("active", "pending")
    )
):
    return user
```

With:

``` python
auth.status.allow("active", "pending")
```

  User Status   Result
  ------------- -------------------------
  `active`      Allowed
  `pending`     Allowed
  `inactive`    `PermissionDeniedError`

------------------------------------------------------------------------

# `block()`

Blocks access when the authenticated user's status matches **any** of
the specified statuses.

All other statuses are allowed.

``` python
auth.status.block(...)
```

## Parameters

``` text
*statuses: str
```

One or more statuses that are blocked.

## Example

``` python
@app.get("/user-area")
def user_area(
    user=Depends(
        auth.status.block("inactive")
    )
):
    return user
```

With:

``` python
auth.status.block("inactive")
```

  User Status   Result
  ------------- -------------------------
  `inactive`    `PermissionDeniedError`
  `active`      Allowed
  `pending`     Allowed

Multiple statuses can also be blocked:

``` python
@app.get("/restricted")
def restricted_route(
    user=Depends(
        auth.status.block("inactive", "suspended")
    )
):
    return user
```

------------------------------------------------------------------------

# How Status Dependencies Work

Status dependencies build on top of the authentication dependency.

``` text
Request
   |
   v
JWT + Session Verification
   |
   v
auth.deps.get_current_account()
   |
   v
Authenticated Account
   |
   v
Check account["status"]
   |
   +---- Allowed ----> FastAPI route executes
   |
   +---- Denied -----> PermissionDeniedError
```

Status dependencies therefore **do not replace authentication**.

They add an access-control check after the user has been authenticated.

------------------------------------------------------------------------

# Returned Value

When the status check succeeds, the dependency returns the authenticated
account object.

For example:

``` python
@app.get("/profile")
def profile(
    user=Depends(auth.status.require("active"))
):
    return {
        "id": user["id"],
        "name": user["name"],
        "status": user["status"],
    }
```

The `user` variable contains the authenticated account.

------------------------------------------------------------------------

# Common Examples

## Only Active Accounts

``` python
@app.get("/dashboard")
def dashboard(
    user=Depends(auth.status.require("active"))
):
    return user
```

Only accounts with the `active` status can access the endpoint.

------------------------------------------------------------------------

## Active or Pending Accounts

``` python
@app.get("/account")
def account(
    user=Depends(
        auth.status.allow("active", "pending")
    )
):
    return user
```

Accounts with either `active` or `pending` status are allowed.

------------------------------------------------------------------------

## Everyone Except Inactive Accounts

``` python
@app.get("/content")
def content(
    user=Depends(
        auth.status.block("inactive")
    )
):
    return user
```

Inactive accounts are denied while other statuses are allowed.

------------------------------------------------------------------------

## Block Multiple Statuses

``` python
@app.get("/protected")
def protected(
    user=Depends(
        auth.status.block("inactive", "suspended")
    )
):
    return user
```

Both `inactive` and `suspended` accounts are denied.

------------------------------------------------------------------------

# Status Check Summary

  -----------------------------------------------------------------------
  Dependency                          Behavior
  ----------------------------------- -----------------------------------
  `require("active")`                 Only `active` is allowed.

  `allow("active", "pending")`        `active` OR `pending` is allowed.

  `block("inactive", "suspended")`    `inactive` and `suspended` are
                                      blocked.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Authentication vs Status Control

Status dependencies are an **access-control/authorization** layer.

Authentication determines:

> "Is this request associated with a valid authenticated account?"

Status control determines:

> "Is this authenticated account currently allowed to access this
> endpoint?"

The authentication flow is handled by `auth.deps`, while status
dependencies use the authenticated account's `status` to enforce access
rules.

``` text
Authentication
    |
    v
auth.deps
    |
    v
Authenticated Account
    |
    v
Status Dependency
    |
    v
Status Check
    |
    +---- Allowed ----> Endpoint
    |
    +---- Denied -----> PermissionDeniedError
```
