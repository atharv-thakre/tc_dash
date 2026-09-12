from connect import auth


# ==========================================================
# EMAIL SERVICE
# ==========================================================
#
# The auth.email service provides SMTP-based email sending
# functionality and built-in OTP email helpers.
#
# Available methods:
#
#     config()
#         Configure the SMTP server and sender details.
#
#     load()
#         Get the current email configuration.
#
#     send()
#         Send a normal email.
#
#     send_otp()
#         Generate and send an OTP email for a custom purpose.
#
#     send_login_otp()
#         Generate and send a login OTP.
#
#     send_signup_otp()
#         Generate and send a signup OTP.
#
#     send_verify_email()
#         Generate and send an email verification OTP.
#
#
# ==========================================================
# CONFIGURE EMAIL
# ==========================================================
#
# Configures the SMTP server used to send emails.
#
# Required:
#
#     host:
#         SMTP server hostname.
#
#     port:
#         SMTP server port.
#
#     username:
#         SMTP authentication username.
#
#     password:
#         SMTP authentication password.
#
#     sender:
#         Email address used as the sender.
#
# Optional:
#
#     sender_name:
#         Display name shown alongside the sender address.
#         Defaults to None.
#
#     use_tls:
#         Whether to use STARTTLS.
#         Defaults to True.
#
# Example:
#
auth.email.config(
    host="smtp.example.com",
    port=587,
    username="your-email@example.com",
    password="your-email-password",
    sender="your-email@example.com",
    sender_name="My Application",
    use_tls=True,
)


# ==========================================================
# LOAD EMAIL CONFIGURATION
# ==========================================================
#
# Returns the currently configured email settings.
#
# Returns:
#
#     dict:
#     {
#         "host": "...",
#         "port": 587,
#         "username": "...",
#         "password": "...",
#         "sender": "...",
#         "sender_name": "...",
#         "use_tls": True
#     }
#
# WARNING:
#     The returned object contains the SMTP password.
#     Do not expose this through a public API endpoint.
#
config = auth.email.load()


# ==========================================================
# SEND EMAIL
# ==========================================================
#
# Sends a normal email using the configured SMTP server.
#
# Required:
#
#     to:
#         Recipient email address.
#
#     subject:
#         Email subject.
#
#     body:
#         Email body.
#
# Optional:
#
#     html:
#         If True, the body is sent as HTML.
#         If False, the body is sent as plain text.
#         Defaults to False.
#
# Returns:
#
#     dict:
#     {
#         "success": True,
#         "message": "Email sent successfully"
#     }
#
# Example - plain text:
#
auth.email.send(
    to="user@example.com",
    subject="Welcome",
    body="Welcome to our application!",
)
#
#
# Example - HTML:
#
auth.email.send(
    to="user@example.com",
    subject="Welcome",
    body="<h1>Welcome!</h1><p>Thanks for joining.</p>",
    html=True,
)


# ==========================================================
# SEND OTP
# ==========================================================
#
# Creates an OTP using the OTP service and sends it to the
# specified email address.
#
# The OTP template is selected automatically based on the
# supplied purpose.
#
# Required:
#
#     email:
#         Recipient email address.
#
#     purpose:
#         Purpose of the OTP.
#
# Optional:
#
#     expiry:
#         OTP validity period in seconds.
#         Defaults to 300 seconds.
#
# The generated OTP itself is NOT returned.
#
# Returns:
#
#     dict:
#     {
#         "expires_at": ...
#     }
#
# Example:
#
auth.email.send_otp(
    email="user@example.com",
    purpose="login",
    expiry=300,
)


# ==========================================================
# SEND LOGIN OTP
# ==========================================================
#
# Generates and sends an OTP specifically for login.
#
# Required:
#
#     email:
#         Recipient email address.
#
# The OTP expiry uses the default value configured by
# send_otp(), which is 300 seconds.
#
# Returns:
#
#     dict:
#     {
#         "expires_at": ...
#     }
#
# Example:
#
auth.email.send_login_otp(
    email="user@example.com",
)


# ==========================================================
# SEND SIGNUP OTP
# ==========================================================
#
# Generates and sends an OTP specifically for signup.
#
# Required:
#
#     email:
#         Recipient email address.
#
# The OTP expiry uses the default value configured by
# send_otp(), which is 300 seconds.
#
# Returns:
#
#     dict:
#     {
#         "expires_at": ...
#     }
#
# Example:
#
auth.email.send_signup_otp(
    email="user@example.com",
)


# ==========================================================
# SEND EMAIL VERIFICATION OTP
# ==========================================================
#
# Generates and sends an OTP for email verification.
#
# Required:
#
#     email:
#         Email address that needs to be verified.
#
# The OTP expiry uses the default value configured by
# send_otp(), which is 300 seconds.
#
# Returns:
#
#     dict:
#     {
#         "expires_at": ...
#     }
#
# Example:
#
auth.email.send_verify_email(
    email="user@example.com",
)


# ==========================================================
# EMAIL / OTP FLOW
# ==========================================================
#
# send_otp() internally:
#
#     1. Creates an OTP using auth.otp.
#     2. Gets the email template for the purpose.
#     3. Generates the email body.
#     4. Sends the email using SMTP.
#     5. Returns only the OTP expiration time.
#
#
# Example:
#
#     auth.email.send_login_otp()
#              |
#              v
#         auth.otp.create()
#              |
#              v
#         Generate OTP
#              |
#              v
#         Select login template
#              |
#              v
#         Send HTML email
#              |
#              v
#         Return expires_at
#
#
# ==========================================================
# RETURN SUMMARY
# ==========================================================
#
# config()
#     -> dict containing success and message
#
# load()
#     -> dict
#
# send()
#     -> dict containing success and message
#
# send_otp()
#     -> dict containing expires_at
#
# send_login_otp()
#     -> dict containing expires_at
#
# send_signup_otp()
#     -> dict containing expires_at
#
# send_verify_email()
#     -> dict containing expires_at
#
#
# ==========================================================
# SMTP MODES
# ==========================================================
#
# use_tls=True:
#
#     Uses SMTP with STARTTLS.
#
#     Common example:
#
#         host = "smtp.example.com"
#         port = 587
#
#
# use_tls=False:
#
#     Uses SMTP over SSL.
#
#     Common example:
#
#         host = "smtp.example.com"
#         port = 465
#
#
# ==========================================================
# COMPLETE EXAMPLE
# ==========================================================
#
auth.email.config(
    host="smtp.example.com",
    port=587,
    username="your-email@example.com",
    password="your-email-password",
    sender="your-email@example.com",
    sender_name="My Application",
    use_tls=True,
)


# Send a normal email.
auth.email.send(
    to="user@example.com",
    subject="Welcome",
    body="<h1>Welcome to our application!</h1>",
    html=True,
)


# Send login OTP.
result = auth.email.send_login_otp(
    email="user@example.com",
)


# Send signup OTP.
result = auth.email.send_signup_otp(
    email="user@example.com",
)


# Send email verification OTP.
result = auth.email.send_verify_email(
    email="user@example.com",
)


# ==========================================================
# SECURITY NOTES
# ==========================================================
#
# - Keep the SMTP password private.
# - Do not expose auth.email.load() through a public endpoint.
# - Do not commit SMTP credentials to Git.
# - Prefer environment variables or a secure configuration
#   system for SMTP credentials.
# - Use TLS/SSL when connecting to the SMTP server.
# - OTP values are generated by the OTP service and should not
#   be logged or exposed unnecessarily.