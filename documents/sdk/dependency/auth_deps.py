from fastapi import Depends, FastAPI
from connect import auth

app = FastAPI()

# ==========================================================
# AUTH DEPENDENCIES
# ==========================================================
#
# The auth.deps module provides FastAPI dependencies for
# authenticating and identifying the current user.
#
# It handles both:
#     1. JWT verification
#     2. Session verification
#
# These dependencies are intended to be used with FastAPI's
# Depends() system to protect routes and access information
# about the currently authenticated account.
#

# ==========================================================
# 1. COMPLETE CONTEXT (auth.deps.get_current_user)
# ==========================================================
#
# Returns:
#     {
#         "account": account,
#         "session": session,
#         "payload": payload
#     }
#
@app.get("/me")
def fetch_me(user=Depends(auth.deps.get_current_user)):
    return user



# ==========================================================
# 2. CURRENT ACCOUNT ONLY (auth.deps.get_current_account)
# ==========================================================
#
# Returns:
#     dict: Account object
#
@app.get("/me/account")
def fetch_account(
    account=Depends(auth.deps.get_current_account)
):
    return account


# ==========================================================
# 3. CURRENT SESSION ONLY (auth.deps.get_current_session)
# ==========================================================
#
# Returns:
#     dict: Session object (id, account_id, ip_address, expires_at, etc.)
#
@app.get("/me/session")
def fetch_session(
    session=Depends(auth.deps.get_current_session)
):
    return session


# ==========================================================
# 4. CURRENT JWT PAYLOAD ONLY (auth.deps.get_current_payload)
# ==========================================================
#
# Returns:
#     dict: {"aid": 1, "sid": 60, "token": "...", "exp": 1787129867}
#
@app.get("/me/payload")
def fetch_payload(
    payload=Depends(auth.deps.get_current_payload)
):
    return payload