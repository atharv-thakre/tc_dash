from fastapi import Depends, FastAPI
from connect import auth

app = FastAPI()

# ==========================================================
# STATUS DEPENDENCIES
# ==========================================================
#
# Status dependencies restrict FastAPI endpoints based on
# the authenticated user's account status.
#
# They use auth.deps.get_current_account internally.
#

# ==========================================================
# 1. REQUIRE SPECIFIC STATUS (auth.status.require)
# ==========================================================
#
# Only accounts with exact status match are allowed.
#
@app.get("/active")
def active_route(
    user=Depends(auth.status.require("active"))
):
    return user


# ==========================================================
# 2. ALLOW ANY OF SPECIFIED STATUSES (auth.status.allow)
# ==========================================================
#
# Both active and pending accounts can access the route.
#
@app.get("/account-area")
def account_area(
    user=Depends(
        auth.status.allow("active", "pending")
    )
):
    return user


# ==========================================================
# 3. BLOCK SPECIFIED STATUSES (auth.status.block)
# ==========================================================
#
# Prevent inactive accounts from accessing the endpoint.
#
@app.get("/user-area")
def user_area(
    user=Depends(
        auth.status.block("inactive")
    )
):
    return user


# Block multiple statuses:
@app.get("/restricted")
def restricted_route(
    user=Depends(
        auth.status.block("inactive", "suspended")
    )
):
    return user