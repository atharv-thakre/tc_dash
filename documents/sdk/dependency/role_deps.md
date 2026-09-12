# Role Dependencies API

``` python
from fastapi import Depends
```

The role dependency service provides FastAPI dependencies for
restricting endpoints based on the authenticated user's role.

Role checks run **after authentication**. They use
`auth.deps.get_current` internally, so JWT and session verification is
performed before the role is checked.

------------------------------------------------------------------------

# Available Methods

  Method        Behavior
  ------------- -------------------------------------
  `require()`   Allows exactly one specified role.
  `allow()`     Allows one or more specified roles.
  `block()`     Blocks one or more specified roles.

Each method returns a FastAPI dependency that can be used with
`Depends()`.

------------------------------------------------------------------------

# `require()`

Allows access only when the authenticated user's role exactly matches
the specified role.

``` python
auth.role.require("admin")
```

## Parameters

  Parameter   Type    Description
  ----------- ------- -----------------------------------------------
  `role`      `str`   The only role allowed to access the endpoint.

## Example

``` python
@app.get("/admin")
def admin_route(
    user=Depends(auth.role.require("admin"))
):
    return user
```

If the authenticated user's role is:

``` text
admin
```

the request is allowed.

If the user's role is:

``` text
user
```

`PermissionDeniedError` is raised.

------------------------------------------------------------------------

# `allow()`

Allows access when the authenticated user's role matches **any** of the
specified roles.

``` python
auth.role.allow(...)
```

## Parameters

``` text
*roles: str
```

One or more roles that are allowed to access the endpoint.

## Example

``` python
@app.get("/manage")
def manage_route(
    user=Depends(
        auth.role.allow("admin", "moderator")
    )
):
    return user
```

With:

``` python
auth.role.allow("admin", "moderator")
```

  User Role     Result
  ------------- -------------------------
  `admin`       Allowed
  `moderator`   Allowed
  `user`        `PermissionDeniedError`

------------------------------------------------------------------------

# `block()`

Blocks access when the authenticated user's role matches **any** of the
specified roles.

All other roles are allowed.

``` python
auth.role.block(...)
```

## Parameters

``` text
*roles: str
```

One or more roles that are blocked.

## Example

``` python
@app.get("/user-area")
def user_area(
    user=Depends(
        auth.role.block("admin")
    )
):
    return user
```

With:

``` python
auth.role.block("admin")
```

  User Role     Result
  ------------- -------------------------
  `admin`       `PermissionDeniedError`
  `user`        Allowed
  `moderator`   Allowed

Multiple roles can also be blocked:

``` python
@app.get("/restricted")
def restricted_route(
    user=Depends(
        auth.role.block("admin", "superadmin")
    )
):
    return user
```

------------------------------------------------------------------------

# How Role Dependencies Work

Role dependencies build on top of the authentication dependency.

``` text
Request
   |
   v
JWT + Session Verification
   |
   v
auth.deps.get_current
   |
   v
Authenticated Account
   |
   v
Check account["role"]
   |
   +---- Allowed ----> FastAPI route executes
   |
   +---- Denied -----> PermissionDeniedError
```

Role dependencies therefore **do not replace authentication**.

They add authorization checks after the user has been authenticated.

------------------------------------------------------------------------

# Returned Value

When the role check succeeds, the dependency returns the authenticated
account object.

For example:

``` python
@app.get("/admin/profile")
def admin_profile(
    user=Depends(auth.role.require("admin"))
):
    return {
        "id": user["id"],
        "name": user["name"],
        "role": user["role"],
    }
```

The `user` variable contains the authenticated account.

------------------------------------------------------------------------

# Common Examples

## Only Administrators

``` python
@app.get("/admin/dashboard")
def admin_dashboard(
    user=Depends(auth.role.require("admin"))
):
    return user
```

Only users with the `admin` role can access the endpoint.

------------------------------------------------------------------------

## Administrators or Moderators

``` python
@app.get("/moderation")
def moderation(
    user=Depends(
        auth.role.allow("admin", "moderator")
    )
):
    return user
```

Users with either `admin` or `moderator` roles are allowed.

------------------------------------------------------------------------

## Everyone Except Administrators

``` python
@app.get("/user-content")
def user_content(
    user=Depends(
        auth.role.block("admin")
    )
):
    return user
```

Administrators are denied while other roles are allowed.

------------------------------------------------------------------------

## Block Multiple Roles

``` python
@app.get("/normal-users")
def normal_users(
    user=Depends(
        auth.role.block("admin", "superadmin")
    )
):
    return user
```

Both `admin` and `superadmin` users are denied.

------------------------------------------------------------------------

# Role Check Summary

  -----------------------------------------------------------------------
  Dependency                          Behavior
  ----------------------------------- -----------------------------------
  `require("admin")`                  Only `admin` is allowed.

  `allow("admin", "moderator")`       `admin` OR `moderator` is allowed.

  `block("admin", "superadmin")`      `admin` and `superadmin` are
                                      blocked.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# Authentication vs Authorization

The role dependency service is an **authorization** layer.

Authentication determines:

> "Who is this user?"

Authorization determines:

> "Is this user allowed to access this endpoint?"

The authentication flow is handled by `auth.deps`, while role
dependencies use the authenticated account to enforce authorization
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
Role Dependency
    |
    v
Authorization
    |
    +---- Allowed ----> Endpoint
    |
    +---- Denied -----> PermissionDeniedError
```
