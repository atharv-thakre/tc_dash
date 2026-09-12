from connect import auth


# ==========================================================
# GET ACCOUNT
# ==========================================================
#
# Retrieve the account that will be used to create a login
# response.
#
# include_password:
#     Optional boolean value.
#
#     False (default):
#         Recommended. The returned account does not include
#         password_hash.
#
#     True:
#         The returned account includes password_hash.
#
# NOTE:
#     The account object is included in the login response,
#     so using include_password=True may expose password_hash
#     in the response.
#
# RECOMMENDED:
#     Keep include_password=False unless password_hash is
#     specifically required.
#
account: dict = auth.get_user.by_email(
    email="testuser@example.com",
    include_password=False,
)


# ==========================================================
# CREATE LOGIN RESPONSE
# ==========================================================
#
# Creates a login response for an existing account.
#
# This method also creates a session record in the database.
#
# Parameters:
#
#     account (dict):
#         Account object returned by one of the get_user
#         methods.
#
#     ip_address (str, optional):
#         IP address of the client.
#         Defaults to None if not provided.
#
#     user_agent (str, optional):
#         User-Agent of the client.
#         Defaults to None if not provided.
#
# NOTE:
#     When using this method inside a web application,
#     ip_address and user_agent should be obtained from the
#     incoming request headers.
#
# Returns:
#
#     dict:
#     {
#         "access_token": access_token,
#         "token_type": "Bearer",
#         "account": account
#     }
#
# The account object may contain password_hash if the account
# was retrieved with include_password=True.
#
auth.service.create_login_response(
    account=account,
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
)


# ==========================================================
# SIGNUP
# ==========================================================
#
# Creates a new account and returns a login response.
#
# Required:
#
#     name
#     email
#     password
#
# Optional:
#
#     handle
#     phone
#     role
#     status
#     ip_address
#     user_agent
#
# Defaults:
#
#     role   -> "user"
#     status -> None
#
# Password:
#     Pass the password as plain text. Must satisfy password policy:
#     minimum 6 characters, at least 1 uppercase letter, 1 lowercase letter,
#     and 1 digit (e.g. "Password123").
#     The authentication system handles password hashing.
#
# Session:
#     Signup creates the login response and therefore creates
#     a session record in the database.
#
# ip_address / user_agent:
#     Optional. If not provided, None will be used.
#
# Returns:
#
#     dict (Single-token mode):
#     {
#         "access_token": access_token,
#         "token_type": "Bearer",
#         "account": account
#     }
#
#     dict (Dual-token mode):
#     {
#         "access_token": access_token,
#         "refresh_token": refresh_token,
#         "token_type": "Bearer",
#         "account": account
#     }
#
auth.service.signup(
    name="Test User",
    email="testuser@example.com",
    password="Password123",
    handle="testuser",
    phone="1234567890",
    role="user",
    status="active",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
)


# ==========================================================
# LOGIN
# ==========================================================
#
# Authenticates an existing account and returns a login
# response.
#
# identifier:
#     Can be either the account's email address or handle.
#
# Required:
#
#     identifier
#     password (e.g. "Password123")
#
# Optional:
#
#     ip_address
#     user_agent
#
# ip_address / user_agent:
#     If not provided, None will be used.
#
# Session:
#     Successful login creates a session record in the
#     database.
#
# Returns:
#
#     dict:
#     {
#         "access_token": access_token,
#         "token_type": "Bearer",
#         "account": account
#     }
#
auth.service.login(
    identifier="testuser@example.com",
    password="Password123",
    ip_address="127.0.0.1",
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
)