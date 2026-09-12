from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()

# ==========================================================
# GITHUB OAUTH
# ==========================================================
#
# The GitHub OAuth service provides a complete GitHub
# authentication flow for FastAPI applications.
#
# It handles:
#     1. GitHub OAuth configuration
#     2. Redirecting users to GitHub
#     3. Processing the OAuth callback
#     4. Retrieving the GitHub user profile
#     5. Retrieving the user's verified primary email
#     6. Creating or retrieving the linked account
#     7. Creating the authentication session
#     8. Redirecting the user back to the frontend
#

# Configure GitHub OAuth client
auth.github.config(
    client_id="YOUR_GITHUB_CLIENT_ID",
    client_secret="YOUR_GITHUB_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/github/callback",
)


# ==========================================================
# GITHUB LOGIN
# ==========================================================
#
# Starts the GitHub OAuth login flow.
# Redirects the user to GitHub's authorization page.
#
@app.get("/oauth/github/login")
async def github_login(request: Request):
    return await auth.github.login(
        request=request,
        frontend_url="https://app.example.com",
    )


# ==========================================================
# GITHUB OAUTH CALLBACK
# ==========================================================
#
# Handles callback from GitHub, exchanges code for user profile,
# creates/links account & session, and redirects to frontend.
#
@app.get("/oauth/github/callback")
async def github_callback(request: Request):
    return await auth.github.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )