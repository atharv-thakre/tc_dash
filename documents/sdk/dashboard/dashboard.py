from connect import auth

# ==========================================================
# GET DASHBOARD COUNTS
# ==========================================================
#
# Returns summary counts for the main authentication resources.
#
# Parameters:
#     None
#
# Returns:
#     dict:
#     {
#         "accounts": 1,
#         "oauth": 2,
#         "sessions": 5,
#         "otp": 3
#     }
#
# The returned counts represent:
#     accounts -> Total number of accounts
#     oauth    -> Total number of OAuth records
#     sessions -> Total number of sessions
#     otp      -> Total number of OTP records
#
# Example:
#
result = auth.dashboard.get_counts()