# Discord OAuth API

```python
from connect import auth
```

The `DiscordOAuth` service provides a complete Discord OAuth2 flow for FastAPI applications.

It handles:

1. Discord OAuth2 configuration
2. Redirecting users to Discord authorization consent screen
3. Processing the OAuth callback
4. Reading Discord user profile and email information (`identify`, `email` scopes)
5. Creating or retrieving the linked account
6. Creating the authentication session
7. Redirecting the user back to the frontend with token credentials

---

# OAuth Flow

```text
Frontend
   |
   v
/oauth/discord/login
   |
   v
Discord Authorization (scope: identify email)
   |
   v
User authenticates
   |
   v
/oauth/discord/callback
   |
   v
DiscordOAuth.callback()
   |
   v
auth.oauth.login()
   |
   +---- Existing OAuth account
   |         -> Use linked account
   |
   +---- New OAuth account
             -> Create account
             -> Link Discord account
   |
   v
Login response
   |
   v
Frontend /oauth/callback?access_token=...&provider=discord
```

---

# Configuration: `config()`

Configures Discord client credentials:

```python
auth.discord.config(
    client_id="your-discord-application-id",
    client_secret="your-discord-client-secret",
    redirect_uri="https://app.example.com/tc-auth/discord/callback",
)
```

## Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `client_id` | `str` | Yes | Discord Application Client ID. |
| `client_secret` | `str` | Yes | Discord Application Client Secret. |
| `redirect_uri` | `str` | Yes | Authorized redirect URI configured in Discord Developer Portal. |

---

# `login()`

Redirects the browser to Discord's OAuth2 authorization URL:

```python
@app.get("/tc-auth/discord/login")
async def discord_login(frontend_url: str = "http://localhost:3000"):
    return await auth.discord.login(frontend_url=frontend_url)
```

---

# `callback()`

Processes the authorization code returned by Discord:

```python
@app.get("/tc-auth/discord/callback")
async def discord_callback(code: str, state: str):
    return await auth.discord.callback(code=code, state=state)
```
