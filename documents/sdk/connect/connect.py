# ==========================================================
# TC-AUTH APPLICATION SETUP & DECOUPLED ARCHITECTURE
# ==========================================================
#
# This file demonstrates the recommended decoupled setup for using
# tc-auth with a FastAPI application.
#
# In production FastAPI applications, separating database/auth
# setup (connect.py) from the application runner (run.py)
# PREVENTS CIRCULAR DEPENDENCIES when feature routers in other
# modules import `auth`.
#
# Structure:
#     1. connect.py  -> Creates engine, initializes Auth, configs services
#     2. routers/*   -> Imports `from connect import auth` (no circular imports!)
#     3. run.py      -> Creates FastAPI app, calls `auth.include_routes(app)`, runs uvicorn
#

from sqlalchemy import create_engine
from tc_auth import Auth


# ==========================================================
# 1. DATABASE ENGINE
# ==========================================================
#
# Create the SQLAlchemy database engine used by tc-auth.
# Replace the connection URL with your own database settings.
#
engine = create_engine(
    "postgresql://workspace:admin@localhost:5432/tc_auth"
)


# ==========================================================
# 2. INITIALIZE TC-AUTH
# ==========================================================
#
# Create the main Auth instance with the engine.
#
# The `auth` object exposes all core services & dependencies:
#     auth.account     -> AccountService
#     auth.service     -> AuthService
#     auth.session     -> SessionService
#     auth.otp         -> OTPService
#     auth.get_user    -> GetUserService
#     auth.deps        -> AuthDeps (get_current, get_current_account, etc.)
#     auth.role        -> RoleDeps (require, allow, block)
#     auth.status      -> StatusDeps (require, allow, block)
#     auth.email       -> EmailService
#     auth.jwt         -> jwt_handler
#     auth.google      -> GoogleOAuth
#     auth.github      -> GitHubOAuth
#     auth.discord     -> DiscordOAuth
#     auth.dashboard   -> DashboardService
#
auth = Auth(engine=engine)


# ==========================================================
# 3. JWT CONFIGURATION (OPTIONAL)
# ==========================================================
#
# tc-auth provides default JWT settings (HS256, 7 days validity).
# Call auth.jwt.config() only if custom parameters are required.
#
auth.jwt.config(
    secret_key="your-super-secret-key",
    algorithm="HS256",
    session_duration_days=7,
)


# ==========================================================
# 4. EMAIL SERVICE CONFIGURATION (OPTIONAL)
# ==========================================================
#
# Configure SMTP credentials if you intend to send emails or OTPs.
#
auth.email.config(
    host="smtp.gmail.com",
    port=587,
    username="your-email@gmail.com",
    password="your-app-password",
    sender="your-email@gmail.com",
    sender_name="Total Chaos",
    use_tls=True,
)


# ==========================================================
# 5. GOOGLE OAUTH CONFIGURATION (OPTIONAL)
# ==========================================================
#
auth.google.config(
    client_id="your-google-client-id",
    client_secret="your-google-client-secret",
    redirect_uri="https://app.totalchaos.online/tc-auth/google/callback",
)


# ==========================================================
# 6. GITHUB OAUTH CONFIGURATION (OPTIONAL)
# ==========================================================
#
auth.github.config(
    client_id="your-github-client-id",
    client_secret="your-github-client-secret",
    redirect_uri="https://app.totalchaos.online/tc-auth/github/callback",
)


# ==========================================================
# 7. DISCORD OAUTH CONFIGURATION (OPTIONAL)
# ==========================================================
#
auth.discord.config(
    client_id="your-discord-client-id",
    client_secret="your-discord-client-secret",
    redirect_uri="https://app.totalchaos.online/tc-auth/discord/callback",
)


# ==========================================================
# 8. TABLE CREATION / TEARDOWN HELPERS
# ==========================================================
#
# auth.init()     # Creates all database tables
# auth.destroy()  # Drops all database tables