# Email Service API

The `auth.email` service provides SMTP-based email sending and built-in
OTP email helpers.

## Available Methods

  Method                  Purpose
  ----------------------- -------------------------------------------------
  `config()`              Configures the SMTP server and sender.
  `load()`                Returns the current email configuration.
  `send()`                Sends a normal email.
  `send_otp()`            Generates and sends an OTP email for a purpose.
  `send_login_otp()`      Sends a login OTP.
  `send_signup_otp()`     Sends a signup OTP.
  `send_verify_email()`   Sends an email verification OTP.

------------------------------------------------------------------------

# `config()`

Configures the SMTP server used to send emails.

``` python
auth.email.config(...)
```

## Parameters

  Parameter       Type     Required   Default   Description
  --------------- -------- ---------- --------- -------------------------------
  `host`          `str`    Yes        ---       SMTP server hostname.
  `port`          `int`    Yes        ---       SMTP server port.
  `username`      `str`    Yes        ---       SMTP authentication username.
  `password`      `str`    Yes        ---       SMTP authentication password.
  `sender`        `str`    Yes        ---       Sender email address.
  `sender_name`   `str`    No         `None`    Display name for the sender.
  `use_tls`       `bool`   No         `True`    Whether to use STARTTLS.

## Example

``` python
auth.email.config(
    host="smtp.example.com",
    port=587,
    username="your-email@example.com",
    password="your-email-password",
    sender="your-email@example.com",
    sender_name="My Application",
    use_tls=True,
)
```

## Returns

``` python
{
    "success": True,
    "message": "Email service configured successfully"
}
```

------------------------------------------------------------------------

# `load()`

Returns the currently configured email settings.

``` python
config = auth.email.load()
```

## Returns

``` python
{
    "host": "smtp.example.com",
    "port": 587,
    "username": "your-email@example.com",
    "password": "your-email-password",
    "sender": "your-email@example.com",
    "sender_name": "My Application",
    "use_tls": True
}
```

> **Security:** The returned object contains the SMTP password. Do not
> expose this through a public API endpoint.

------------------------------------------------------------------------

# `send()`

Sends a normal email through the configured SMTP server.

``` python
auth.email.send(...)
```

## Parameters

  Parameter   Type     Required   Default   Description
  ----------- -------- ---------- --------- ------------------------------------
  `to`        `str`    Yes        ---       Recipient email address.
  `subject`   `str`    Yes        ---       Email subject.
  `body`      `str`    Yes        ---       Email content.
  `html`      `bool`   No         `False`   Send the body as HTML when `True`.

## Plain Text Example

``` python
result = auth.email.send(
    to="user@example.com",
    subject="Welcome",
    body="Welcome to our application!",
)
```

## HTML Example

``` python
result = auth.email.send(
    to="user@example.com",
    subject="Welcome",
    body="<h1>Welcome!</h1><p>Thanks for joining.</p>",
    html=True,
)
```

## Returns

``` python
{
    "success": True,
    "message": "Email sent successfully to user@example.com"
}
```

------------------------------------------------------------------------

# `send_otp()`

Creates an OTP using the OTP service and sends it to the specified email
address.

The email template is selected based on the supplied `purpose`.

``` python
auth.email.send_otp(...)
```

## Parameters

  Parameter   Type    Required   Default   Description
  ----------- ------- ---------- --------- ---------------------------------
  `email`     `str`   Yes        ---       Recipient email address.
  `purpose`   `str`   Yes        ---       Purpose of the OTP.
  `expiry`    `int`   No         `300`     OTP validity period in seconds.

## Example

``` python
result = auth.email.send_otp(
    email="user@example.com",
    purpose="login",
    expiry=300,
)
```

## Returns

``` python
{
    "expires_at": ...
}
```

The generated OTP itself is not returned by `send_otp()`.

------------------------------------------------------------------------

# `send_login_otp()`

Generates and sends an OTP for login.

``` python
auth.email.send_login_otp(...)
```

## Parameters

  Parameter   Type    Required
  ----------- ------- ----------
  `email`     `str`   Yes

The OTP uses the default expiry of `300` seconds.

## Example

``` python
result = auth.email.send_login_otp(
    email="user@example.com",
)
```

## Returns

``` python
{
    "expires_at": ...
}
```

------------------------------------------------------------------------

# `send_signup_otp()`

Generates and sends an OTP for signup.

``` python
auth.email.send_signup_otp(...)
```

## Parameters

  Parameter   Type    Required
  ----------- ------- ----------
  `email`     `str`   Yes

The OTP uses the default expiry of `300` seconds.

## Example

``` python
result = auth.email.send_signup_otp(
    email="user@example.com",
)
```

## Returns

``` python
{
    "expires_at": ...
}
```

------------------------------------------------------------------------

# `send_verify_email()`

Generates and sends an OTP for email verification.

``` python
auth.email.send_verify_email(...)
```

## Parameters

  Parameter   Type    Required
  ----------- ------- ----------
  `email`     `str`   Yes

The OTP uses the default expiry of `300` seconds.

## Example

``` python
result = auth.email.send_verify_email(
    email="user@example.com",
)
```

## Returns

``` python
{
    "expires_at": ...
}
```

------------------------------------------------------------------------

# OTP Email Flow

`send_otp()` internally performs the following operations:

``` text
auth.email.send_otp()
        |
        v
auth.otp.create()
        |
        v
Generate OTP
        |
        v
Select email template
        |
        v
Generate email body
        |
        v
Send HTML email through SMTP
        |
        v
Return expires_at
```

The specialized methods use `send_otp()` internally:

``` text
send_login_otp()
        |
        v
send_otp(purpose="login")


send_signup_otp()
        |
        v
send_otp(purpose="signup")


send_verify_email()
        |
        v
send_otp(purpose="verify")
```

------------------------------------------------------------------------

# SMTP Modes

## STARTTLS

When:

``` python
use_tls=True
```

the service creates a normal SMTP connection and upgrades it using
STARTTLS.

Typical configuration:

``` python
auth.email.config(
    host="smtp.example.com",
    port=587,
    username="your-email@example.com",
    password="your-password",
    sender="your-email@example.com",
    use_tls=True,
)
```

## SMTP over SSL

When:

``` python
use_tls=False
```

the service uses an SSL SMTP connection.

Typical configuration:

``` python
auth.email.config(
    host="smtp.example.com",
    port=465,
    username="your-email@example.com",
    password="your-password",
    sender="your-email@example.com",
    use_tls=False,
)
```

------------------------------------------------------------------------

# Complete Example

``` python
from connect import auth


# Configure SMTP
auth.email.config(
    host="smtp.example.com",
    port=587,
    username="your-email@example.com",
    password="your-email-password",
    sender="your-email@example.com",
    sender_name="My Application",
    use_tls=True,
)


# Send a normal HTML email
auth.email.send(
    to="user@example.com",
    subject="Welcome",
    body="<h1>Welcome to our application!</h1>",
    html=True,
)


# Send login OTP
login_otp = auth.email.send_login_otp(
    email="user@example.com",
)


# Send signup OTP
signup_otp = auth.email.send_signup_otp(
    email="user@example.com",
)


# Send email verification OTP
verification_otp = auth.email.send_verify_email(
    email="user@example.com",
)
```

------------------------------------------------------------------------

# Return Summary

  Method                  Return
  ----------------------- --------------------------------
  `config()`              `dict` --- `{"success": True, "message": "..."}`
  `load()`                `dict`
  `send()`                `dict` --- `{"success": True, "message": "..."}`
  `send_otp()`            `dict` containing `expires_at`
  `send_login_otp()`      `dict` containing `expires_at`
  `send_signup_otp()`     `dict` containing `expires_at`
  `send_verify_email()`   `dict` containing `expires_at`

------------------------------------------------------------------------

# Security Notes

-   Keep SMTP credentials private.
-   Do not expose `auth.email.load()` through a public endpoint.
-   Never commit SMTP passwords to Git.
-   Prefer environment variables or secure configuration for
    credentials.
-   Use TLS or SSL when connecting to the SMTP server.
-   Do not log OTP values unnecessarily.
-   Do not expose generated OTPs to clients.
