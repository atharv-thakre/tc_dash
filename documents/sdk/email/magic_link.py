from connect import auth


# ==========================================================
# MAGIC LINK AUTHENTICATION
# ==========================================================
#
# The Magic Link feature is built directly on top of tc_auth's
# email OTP infrastructure.
#
# When a magic link email is sent, the email contains BOTH:
# 1. A one-click CTA button ("Click to Proceed")
# 2. A fallback manual 6-digit OTP code (for cross-device use)
#
# Available methods on auth.email:
#
#     send_magic_link()
#         Send a magic link email with OTP for a specific purpose.
#
#     send_otp()
#         Send an OTP email with optional frontend_url to include
#         the magic link button.
#
#     send_login_otp(), send_verify_email(), send_reset_otp(), send_signup_otp()
#         Purpose helpers supporting optional frontend_url.
#
# Available HTTP endpoints:
#
#     POST /tc-auth/send/email/link/{purpose}
#         Directly request a magic link email.
#         NOTE: Use this route ONLY when the user explicitly clicks on a
#         "Send me Magic Link" / "Sign In with Magic Link" button in your UI!
#
#     POST /tc-auth/send/email/otp/{purpose}
#         Existing standard OTP endpoint. Also automatically sends the magic link
#         button when frontend_url is provided (in body, query param, or Origin header).
#
#     GET /tc-auth/link/{purpose}?email=...&otp=...&frontend_url=...
#         Direct browser verification link clicked from email.
#         Redirects HTTP 307 to frontend with session tokens.
#         - Single-token mode: {frontend_url}/oauth/callback?access_token=...
#         - Dual-token mode:   {frontend_url}/oauth/callback?access_token=...&refresh_token=...
#
#     POST /tc-auth/link/{purpose}
#         Bot-safe programmatic verification API for Single-Page Apps (SPA).
#
#
# ==========================================================
# 1. SENDING A MAGIC LINK (PYTHON SERVICE)
# ==========================================================
#
# Call send_magic_link() when the user explicitly requests a Magic Link:
result = auth.email.send_magic_link(
    email="jane@example.com",
    purpose="login",                      # "login", "verify", "reset", "signup"
    frontend_url="https://app.example.com",
    expiry=300,                           # 5 minutes
)
# Returns: {"expires_at": 1735689600}


# ==========================================================
# 2. SENDING OTP WITH MAGIC LINK BUTTON (ENHANCED OTP)
# ==========================================================

# Existing send_otp also accepts frontend_url:
result = auth.email.send_otp(
    email="jane@example.com",
    purpose="login",
    frontend_url="https://app.example.com",
)


# ==========================================================
# 3. PURPOSE-SPECIFIC BEHAVIOR
# ==========================================================
#
# [login]
#   GET /tc-auth/link/login?email=...&otp=...&frontend_url=...
#       Verifies OTP, logs user in, creates session.
#       Redirects (307) to:
#           Single-token: {frontend_url}/oauth/callback?access_token=...
#           Dual-token:   {frontend_url}/oauth/callback?access_token=...&refresh_token=...
#       NOTE: This reuses your existing frontend OAuth callback route!
#
#   POST /tc-auth/link/login
#       Body: {"email": "jane@example.com", "otp": "123456"}
#       Returns JSON:
#           {
#               "access_token": "...",
#               "refresh_token": "...",  # if dual-token mode
#               "token_type": "Bearer",
#               "account": { ... }
#           }
#
# [verify]
#   GET /tc-auth/link/verify?email=...&otp=...&frontend_url=...
#       Verifies OTP, activates user account (status = "active").
#       Redirects (307) to:
#           {frontend_url}/magic-link/callback?verified=true&email=...
#
#   POST /tc-auth/link/verify
#       Body: {"email": "jane@example.com", "otp": "123456"}
#       Returns JSON:
#           {"success": True, "message": "Email verified successfully", "email": "..."}
#
# [reset]
#   GET /tc-auth/link/reset?email=...&otp=...&frontend_url=...
#       Validates OTP without consuming, redirects (307) to:
#           {frontend_url}/reset-password?email=...&otp=...
#       User enters new password and submits POST /tc-auth/forgot/password.
#
# [signup]
#   GET /tc-auth/link/signup?email=...&otp=...&frontend_url=...
#       Validates OTP without consuming, redirects (307) to:
#           {frontend_url}/signup?email=...&otp=...&verified=true
#       User completes signup by submitting POST /tc-auth/signup/otp.
#
#
# ==========================================================
# 4. ERROR HANDLING & BOT PROTECTION
# ==========================================================
#
# On verification error (expired link, invalid code, or replay attack):
#   GET /tc-auth/link/{purpose} redirects (307) to:
#       {frontend_url}/magic-link/callback?error={url_encoded_error}
#
# Anti-Virus Scanner Bot Safe:
#   Corporate email filters often scan and click links in incoming emails.
#   To prevent bots from consuming single-use OTPs before the user clicks:
#   You can configure your frontend to load a confirmation page (e.g.
#   "Click to confirm sign-in") which sends POST /tc-auth/link/login.
