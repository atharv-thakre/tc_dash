from connect import auth

# ==========================================================
# SESSION SERVICE USAGE
# ==========================================================

# 1. Create a new session
session = auth.session.create_session(
    account_id=1,
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0",
)

# 2. Get session by ID
session_data = auth.session.by_id(
    session_id=1,
)

# 3. Get sessions by account ID
account_sessions = auth.session.by_account(
    account_id=1,
)

# 4. Destroy a single session
destroy_res = auth.session.destroy_session(
    session_id=1,
)

# 5. Destroy all sessions for an account
destroy_all_res = auth.session.destroy_all(
    account_id=1,
)

# 6. Cleanup expired sessions
cleanup_res = auth.session.cleanup_expired()

# 7. Clear all sessions immediately
clear_res = auth.session.clear_all()

# 8. Get all sessions (paginated)
all_sessions = auth.session.get_all(
    page=1,
    limit=10,
)

# 9. Query sessions by field (id, sid, ip, token)
queried_sessions = auth.session.query(
    field="id",
    value="1",
)