from fastapi import Depends, FastAPI
from connect import auth

app = FastAPI()

# ==========================================================
# ROLE DEPENDENCIES
# ==========================================================
#
# Role dependencies restrict access to FastAPI endpoints based
# on the authenticated user's role.
#
# They use auth.deps.get_current internally, so the request
# must first pass JWT + session authentication.
#

# ==========================================================
# 1. REQUIRE SPECIFIC ROLE (auth.role.require)
# ==========================================================
#
# Allows access only when the user's role exactly matches.
#
@app.get("/admin")
def admin_route(
    user=Depends(auth.role.require("admin"))
):
    return user


# ==========================================================
# 2. ALLOW ANY OF SPECIFIED ROLES (auth.role.allow)
# ==========================================================
#
# Allows access when user has any of the listed roles.
#
@app.get("/manage")
def manage_route(
    user=Depends(
        auth.role.allow("admin", "moderator")
    )
):
    return user


# ==========================================================
# 3. BLOCK SPECIFIED ROLES (auth.role.block)
# ==========================================================
#
# Blocks listed roles, allowing all other authenticated roles.
#
@app.get("/user-area")
def user_area(
    user=Depends(
        auth.role.block("admin")
    )
):
    return user


# Block multiple roles:
@app.get("/restricted")
def restricted_route(
    user=Depends(
        auth.role.block("admin", "superadmin")
    )
):
    return user