from connect import auth

# ==========================================================
# OAUTH SERVICE USAGE
# ==========================================================

# 1. OAuth login (creates or links account + session)
login_response = auth.oauth.login(
    provider="github",
    provider_user_id="1234567890",
    name="testuser",
    email="testuser@example.com",
    avatar_url="https://example.com/avatar.jpg",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0",
)

# 2. Find existing OAuth link
oauth_account = auth.oauth.find_oauth(
    provider="github",
    provider_user_id="1234567890",
)

# 3. Link an OAuth provider account to existing local account
link_res = auth.oauth.link_account(
    account_id=1,
    provider="github",
    provider_user_id="1234567890",
)

# 4. Safe unlink OAuth provider from account (enforces lockout protection)
unlink_res = auth.oauth.unlink_account(
    account_id=1,
    provider="github",
    enforce_active_auth=True,  # Prevents lockout if account has no password or other links
)

# 5. Get all connected OAuth providers for an account
user_links = auth.oauth.get_account_links(
    account_id=1,
)

# 6. Get paginated OAuth account links (admin)
oauth_links = auth.oauth.get_all(
    page=1,
    limit=10,
)

# 7. Query OAuth links by field
queried_links = auth.oauth.query(
    field="id",
    value="1",
)