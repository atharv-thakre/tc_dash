from connect import auth

# ==========================================================
# ACCOUNT SERVICE USAGE
# ==========================================================

# 1. Create a new user account
new_user = auth.account.create_user(
    name="Test User",
    password="Password123",
    email="testuser@example.com",
    handle="testuser",
    avatar_url="https://example.com/avatar.jpg",
    phone="+15555550100",
    role="user",
    status="active",
)

# 2. Update standard profile fields
updated_user = auth.account.update_user(
    account_id=new_user["id"],
    name="Updated Name",
    avatar_url="https://example.com/new_avatar.jpg",
)

# 3. Super update (updates any field including password, role, status)
super_updated_user = auth.account.super_update(
    account_id=new_user["id"],
    role="admin",
    status="active",
)

# 4. Update account password
pwd_res = auth.account.update_password(
    account_id=new_user["id"],
    password="NewPassword123",
)

# 5. Update account status
status_res = auth.account.update_status(
    account_id=new_user["id"],
    status="active",
)

# 6. Update account role
role_res = auth.account.update_role(
    account_id=new_user["id"],
    role="admin",
)

# 7. Get paginated list of accounts
accounts = auth.account.get_all(
    page=1,
    limit=10,
)

# 8. Query accounts by field (name, handle, email, phone, uid)
queried_accounts = auth.account.query(
    field="email",
    value="testuser@example.com",
)

# 9. Delete an account
del_res = auth.account.delete_user(
    account_id=new_user["id"],
)
