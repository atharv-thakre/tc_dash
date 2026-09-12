from fastapi import FastAPI, Request
from connect import auth

app = FastAPI()

# ==========================================================
# DISCORD OAUTH
# ==========================================================
#
# The Discord OAuth service provides a complete Discord
# authentication flow for FastAPI applications.
#
# It handles:
#     1. Discord OAuth configuration
#     2. Redirecting users to Discord
#     3. Processing the OAuth callback
#     4. Retrieving the Discord user profile
#     5. Validating verified email & animated/default avatars
#     6. Creating or retrieving the linked account
#     7. Creating the authentication session
#     8. Redirecting the user back to the frontend
#

# Configure Discord OAuth client
auth.discord.config(
    client_id="YOUR_DISCORD_CLIENT_ID",
    client_secret="YOUR_DISCORD_CLIENT_SECRET",
    redirect_uri="https://api.example.com/tc-auth/discord/callback",
)


# ==========================================================
# DISCORD LOGIN
# ==========================================================
#
# Starts the Discord OAuth login flow.
# Redirects the user to Discord's authorization page.
#
@app.get("/oauth/discord/login")
async def discord_login(request: Request):
    return await auth.discord.login(
        request=request,
        frontend_url="https://app.example.com",
    )


# ==========================================================
# DISCORD OAUTH CALLBACK
# ==========================================================
#
# Handles callback from Discord, exchanges code for user profile,
# creates/links account & session, and redirects to frontend.
#
@app.get("/oauth/discord/callback")
async def discord_callback(request: Request):
    return await auth.discord.callback(
        request=request,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )
