from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()

# ==========================================================
# GOOGLE OAUTH
# ==========================================================
#
# The Google OAuth service provides a complete Google
# OpenID Connect authentication flow for FastAPI applications.
#

# Configure Google OAuth client
auth.google.config(
    client_id="YOUR_GOOGLE_CLIENT_ID",
    client_secret="YOUR_GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/google/callback",
)


# ==========================================================
# GOOGLE LOGIN
# ==========================================================
#
# Starts Google OAuth login flow and redirects to Google.
#
@app.get("/oauth/google/login")
async def google_login(request: Request):
    return await auth.google.login(
        request=request,
        frontend_url="https://app.example.com",
    )


# ==========================================================
# GOOGLE OAUTH CALLBACK
# ==========================================================
#
# Handles callback from Google, retrieves user info,
# creates/links account & session, and redirects to frontend.
#
@app.get("/oauth/google/callback")
async def google_callback(request: Request):
    return await auth.google.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
