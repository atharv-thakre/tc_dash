from connect import auth


# ==========================================================
# GET USER
# ==========================================================
#
# The auth.get_user module provides methods for retrieving
# an account using different account fields.
#
# Available lookup methods:
#
#   by_id()
#   by_uid()
#   by_email()
#   by_handle()
#   by_phone()
#
# All by_* methods:
#   - Return a single account as a dictionary.
#   - Raise an exception if the account is not found.
#   - Support the optional include_password parameter.
#
#
# ==========================================================
# INCLUDE PASSWORD
# ==========================================================
#
# All get_user methods support:
#
#     include_password
#
# Type:
#     bool
#
# Default:
#     False
#
# Behavior:
#     include_password=False
#         The returned account does NOT contain password_hash.
#
#     include_password=True
#         The returned account contains password_hash.
#
# IMPORTANT:
#     password_hash contains the stored password hash.
#     It does NOT contain the user's original/plain-text
#     password.
#
#
# Example return when include_password=True:
#
# {
#     "id": 8,
#     "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
#     "name": "Test User",
#     "handle": "testuser",
#     "email": "testuser@example.com",
#     "phone": "1234567890",
#     "password_hash": "$2b$12$jW/Llfu0QXRCcCtcpaytuueBS6NYULWQtocns6CdM2BfilSTC6P8i",
#     "avatar_url": "https://example.com/avatar.jpg",
#     "role": "user",
#     "status": "active",
#     "created_at": "2026-08-11T18:11:00.001639",
#     "updated_at": "2026-08-11T18:11:00.001639"
# }
#
#
# Example return when include_password=False:
#
# {
#     "id": 8,
#     "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
#     "name": "Test User",
#     "handle": "testuser",
#     "email": "testuser@example.com",
#     "phone": "1234567890",
#     "avatar_url": "https://example.com/avatar.jpg",
#     "role": "user",
#     "status": "active",
#     "created_at": "2026-08-11T18:11:00.001639",
#     "updated_at": "2026-08-11T18:11:00.001639"
# }
#
#
# ==========================================================
# GET USER BY ID
# ==========================================================
#
# Retrieves an account using its numeric database ID.
#
# Parameters:
#
#     account_id (int):
#         Numeric database ID of the account.
#
#     include_password (bool, optional):
#         Whether to include password_hash in the returned
#         account object.
#
#         Defaults to False.
#
# Returns:
#     dict: The matching account.
#
# Raises:
#     Exception: If the account does not exist.
#
# Example:
#
result = auth.get_user.by_id(
    account_id=1,
    include_password=True,
)


# ==========================================================
# GET USER BY UID
# ==========================================================
#
# Retrieves an account using its unique UUID.
#
# Parameters:
#
#     uid (str):
#         Unique UUID of the account.
#
#     include_password (bool, optional):
#         Whether to include password_hash in the returned
#         account object.
#
#         Defaults to False.
#
# Returns:
#     dict: The matching account.
#
# Raises:
#     Exception: If the account does not exist.
#
# Example:
#
result = auth.get_user.by_uid(
    uid="1d7d1310-13e5-4769-8511-d3bc837cf55f",
    include_password=True,
)


# ==========================================================
# GET USER BY EMAIL
# ==========================================================
#
# Retrieves an account using its email address.
#
# Parameters:
#
#     email (str):
#         Email address associated with the account.
#
#     include_password (bool, optional):
#         Whether to include password_hash in the returned
#         account object.
#
#         Defaults to False.
#
# Returns:
#     dict: The matching account.
#
# Raises:
#     Exception: If the account does not exist.
#
# Example:
#
result = auth.get_user.by_email(
    email="testuser@example.com",
    include_password=False,
)


# ==========================================================
# GET USER BY HANDLE
# ==========================================================
#
# Retrieves an account using its unique handle/username.
#
# Parameters:
#
#     handle (str):
#         Unique handle/username of the account.
#
#     include_password (bool, optional):
#         Whether to include password_hash in the returned
#         account object.
#
#         Defaults to False.
#
# Returns:
#     dict: The matching account.
#
# Raises:
#     Exception: If the account does not exist.
#
# Example:
#
result = auth.get_user.by_handle(
    handle="testuser",
    include_password=False,
)


# ==========================================================
# GET USER BY PHONE
# ==========================================================
#
# Retrieves an account using its phone number.
#
# Parameters:
#
#     phone (str):
#         Phone number associated with the account.
#
#     include_password (bool, optional):
#         Whether to include password_hash in the returned
#         account object.
#
#         Defaults to False.
#
# Returns:
#     dict: The matching account.
#
# Raises:
#     Exception: If the account does not exist.
#
# Example:
#
result = auth.get_user.by_phone(
    phone="1234567890",
    include_password=False,
)


# ==========================================================
# FIND USER BY EMAIL
# ==========================================================
#
# Searches for an account using its email address.
#
# This method behaves similarly to by_email(), with one
# important difference:
#
#     by_email()
#         Raises an exception if the account is not found.
#
#     find_by_email()
#         Returns None if the account is not found.
#
# Parameters:
#
#     email (str):
#         Email address to search for.
#
#     include_password (bool, optional):
#         Whether to include password_hash in the returned
#         account object.
#
#         Defaults to False.
#
# Returns:
#     dict:
#         The matching account if it exists.
#
#     None:
#         Returned when no account matches the email.
#
#
# Example:
#
result = auth.get_user.find_by_email(
    email="testuser@example.com",
    include_password=True,
)


# If the account exists:
#
# result = {
#     "id": 8,
#     "uid": "1d7d1310-13e5-4769-8511-d3bc837cf55f",
#     ...
# }
#
# If the account does not exist:
#
# result = None