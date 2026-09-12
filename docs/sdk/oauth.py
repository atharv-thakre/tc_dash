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

# 4. Unlink OAuth provider from account
unlink_res = auth.oauth.unlink_account(
    account_id=1,
    provider="github",
)

# 5. Get paginated OAuth account links
oauth_links = auth.oauth.get_all(
    page=1,
    limit=10,
)

# 6. Query OAuth links by field
queried_links = auth.oauth.query(
    field="id",
    value="1",
)
