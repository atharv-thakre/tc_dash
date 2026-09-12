# FastAPI Dependencies & RBAC

`tc_auth` provides a comprehensive suite of FastAPI dependencies for authentication, role-based access control (RBAC), and account status enforcement.

---

## 1. Core Authentication Dependencies (`auth.deps`)

Import `auth` from your `connect.py` module and inject these dependencies into router functions using `fastapi.Depends`:

```python
from fastapi import APIRouter, Depends
from connect import auth

router = APIRouter(prefix="/items", tags=["Items"])
```

### Dependency Reference

| Dependency | Return Type | Description |
|---|---|---|
| `auth.deps.get_current_user` | `dict` | Returns a composite dictionary with `{"account": dict, "session": dict, "payload": dict}`. |
| `auth.deps.get_current_account` | `dict` | Returns the user's `Account` dictionary directly. |
| `auth.deps.get_current_session` | `dict` | Returns the active `Session` database record dictionary. |
| `auth.deps.get_current_payload` | `dict` | Returns the raw decoded JWT payload dictionary (`aid`, `sid`, `type`, `exp`). |

### Code Example: Using Core Dependencies

```python
@router.get("/profile")
def get_user_profile(account=Depends(auth.deps.get_current_account)):
    # account: {"id": 1, "uid": "...", "name": "Alex", "email": "...", "role": "user", ...}
    return {"message": f"Hello {account['name']}", "email": account["email"]}

@router.get("/session-info")
def get_session_info(session=Depends(auth.deps.get_current_session)):
    return {
        "session_id": session["id"],
        "ip": session["ip_address"],
        "expires_at": session["expires_at"],
    }
```

---

## 2. Role-Based Access Control (`auth.role`)

`auth.role` allows fine-grained role authorization gates.

### 1. `auth.role.require(role: str)`
Requires the user to have **exactly** the specified role. Raises `PermissionDeniedError` (HTTP 403) otherwise.

```python
@router.post("/admin/settings")
def update_admin_settings(admin=Depends(auth.role.require("admin"))):
    return {"status": "success", "admin_id": admin["id"]}
```

### 2. `auth.role.allow(*roles: str)`
Allows any user matching **at least one** of the listed roles.

```python
@router.get("/dashboard/analytics")
def view_analytics(
    user=Depends(auth.role.allow("admin", "manager", "superadmin"))
):
    return {"analytics": [10, 20, 30], "accessed_by": user["role"]}
```

### 3. `auth.role.block(*roles: str)`
Permits all authenticated users **except** those with the blacklisted roles.

```python
@router.post("/comments")
def post_comment(
    user=Depends(auth.role.block("banned", "restricted"))
):
    return {"status": "comment published"}
```

---

## 3. Account Status Guards (`auth.status`)

`auth.status` provides lifecycle guards to verify whether an account is active, verified, or un-suspended.

### 1. `auth.status.require(status: str)`
Ensures the user account has a specific status (e.g. `"active"` or `"verified"`). Raises `AccountStatusError` (HTTP 403) on mismatch.

```python
@router.post("/transact")
def make_payment(
    account=Depends(auth.status.require("active"))
):
    return {"message": "Transaction initiated"}
```

### 2. `auth.status.allow(*statuses: str)`
Allows accounts with any of the permitted statuses.

```python
@router.get("/read-only-content")
def get_content(
    account=Depends(auth.status.allow("active", "trial", "pending_verification"))
):
    return {"content": "Available for trial and active users"}
```

### 3. `auth.status.block(*statuses: str)`
Blocks accounts matching specific forbidden statuses.

```python
@router.get("/feed")
def get_feed(
    account=Depends(auth.status.block("suspended", "banned", "deactivated"))
):
    return {"feed": ["post 1", "post 2"]}
```

---

## 4. Combining Multiple Dependencies

You can compose multiple dependencies in FastAPI to enforce combined constraints (e.g. user must be an active admin):

```python
@router.delete("/sensitive-resource/{item_id}")
def delete_resource(
    item_id: int,
    admin=Depends(auth.role.require("admin")),
    active_account=Depends(auth.status.require("active")),
):
    # Both conditions are strictly validated before handler execution
    return {"deleted": item_id, "by": admin["email"]}
```
