from connect import auth


# ==========================================================
# JWT CONFIGURATION
# ==========================================================
#
# The auth.jwt module provides JWT configuration and utilities
# for creating and verifying access tokens.
#
# Available methods:
#
#     config()
#         Configure JWT settings.
#
#     load()
#         Get the current JWT configuration.
#
#     create_access_token()
#         Create a signed JWT access token.
#
#     verify_token()
#         Verify and decode a JWT access token.
#
#
# ==========================================================
# LOAD JWT CONFIGURATION
# ==========================================================
#
# Returns the currently configured JWT settings.
#
# Returns:
#
#     dict:
#     {
#         "secret_key": "...",
#         "algorithm": "HS256",
#         "session_duration_days": 1
#     }
#
# Example:
#
config = auth.jwt.load()


# ==========================================================
# CONFIGURE JWT
# ==========================================================
#
# Updates the global JWT configuration.
#
# Required parameters:
#
#     secret_key (str):
#         Secret key used to sign and verify JWT tokens.
#
#     algorithm (str):
#         JWT signing algorithm.
#
#     session_duration_days (int):
#         Number of days for which newly created access tokens
#         remain valid.
#
# Example:
#
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=1,
)
#
# WARNING:
#     Keep the secret key private.
#     Do not expose it through an API or commit it to source
#     control.
#
#
# ==========================================================
# CREATE ACCESS TOKEN
# ==========================================================
#
# Creates a signed JWT access token from the supplied payload.
#
# Parameters:
#
#     data (dict):
#         Data to include in the JWT payload.
#
# The SDK automatically adds:
#
#     exp:
#         Token expiration timestamp.
#
# The expiration is calculated using the configured
# session_duration_days value.
#
# Returns:
#
#     str:
#         Encoded JWT access token.
#
# Example:
#
access_token = auth.jwt.create_access_token(
    data={
        "aid": 1,
        "sid": 60,
    },
)
#
# Example payload before encoding:
#
# {
#     "aid": 1,
#     "sid": 60,
#     "exp": 1787129867
# }
#
# The returned value is a signed JWT string.
#
#
# ==========================================================
# VERIFY ACCESS TOKEN
# ==========================================================
#
# Verifies and decodes a JWT access token.
#
# Parameters:
#
#     token (str):
#         JWT access token to verify.
#
# Verification includes the configured:
#
#     - secret key
#     - signing algorithm
#     - token expiration
#
# Returns:
#
#     dict:
#         Decoded JWT payload.
#
# Example:
#
payload = auth.jwt.verify_token(
    token=access_token,
)
#
# Example result:
#
# {
#     "aid": 1,
#     "sid": 60,
#     "exp": 1787129867
# }
#
#
# If the token cannot be verified or is invalid,
# InvalidTokenError is raised.
#
#
# ==========================================================
# TYPICAL JWT FLOW
# ==========================================================
#
#     Configure JWT
#          |
#          v
#     auth.jwt.config()
#          |
#          v
#     Create payload
#          |
#          v
#     auth.jwt.create_access_token()
#          |
#          v
#     JWT access token
#          |
#          v
#     Client sends token
#          |
#          v
#     auth.jwt.verify_token()
#          |
#          v
#     Verified payload
#
#
# ==========================================================
# COMPLETE EXAMPLE
# ==========================================================
#
# Configure JWT during application startup:
#
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=1,
)
#
#
# Create a token:
#
token = auth.jwt.create_access_token(
    data={
        "aid": 1,
        "sid": 60,
    },
)
#
#
# Verify the token:
#
payload = auth.jwt.verify_token(
    token=token,
)
#
#
# Read the current configuration:
#
config = auth.jwt.load()
#
#
# ==========================================================
# RETURN SUMMARY
# ==========================================================
#
# load()
#     -> dict
#
# config()
#     -> dict
#
# create_access_token()
#     -> str
#
# verify_token()
#     -> dict
#
#
# ==========================================================
# SECURITY NOTES
# ==========================================================
#
# - Keep the JWT secret key private.
# - Use a strong, randomly generated secret key.
# - Do not commit the secret key to Git.
# - Do not expose the secret key through load() in a public
#   API endpoint.
# - Use HTTPS when transmitting access tokens.
# - Do not modify the JWT payload after the token is created.
# - verify_token() should be used whenever a token needs to
#   be trusted.
