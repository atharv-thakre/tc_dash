# OAuth 2.0 & OpenID Connect Integration

`tc_auth` provides native integration for **Google**, **GitHub**, and **Discord** OAuth 2.0 / OpenID Connect with automated email auto-linking, secondary provider linking, and safe unlinking guardrails.

---

## 1. Provider Setup in `connect.py`

Register your OAuth apps in the respective developer consoles and configure them on `auth`:

```python
# Google OAuth
auth.google.config(
    client_id="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
    client_secret="GOCSPX-YOUR_GOOGLE_CLIENT_SECRET",
    redirect_uri="https://api.yourdomain.com/tc-auth/google/callback",
)

# GitHub OAuth
auth.github.config(
    client_id="YOUR_GITHUB_CLIENT_ID",
    client_secret="YOUR_GITHUB_CLIENT_SECRET",
    redirect_uri="https://api.yourdomain.com/tc-auth/github/callback",
)

# Discord OAuth
auth.discord.config(
    client_id="YOUR_DISCORD_CLIENT_ID",
    client_secret="YOUR_DISCORD_CLIENT_SECRET",
    redirect_uri="https://api.yourdomain.com/tc-auth/discord/callback",
)
```

---

## 2. Authentication Flow

```
[ User clicks "Sign in with Google" ]
                 │
                 ▼
1. Frontend redirects to GET /tc-auth/google/login?frontend_url=https://app.example.com
                 │
                 ▼
2. tc_auth redirects browser to Google OAuth Consent Screen
                 │
                 ▼
3. User consents -> Google redirects to GET /tc-auth/google/callback?code=...
                 │
                 ▼
4. tc_auth exchanges code for user profile (email, sub, name, avatar)
                 │
                 ├── If account exists for provider_user_id -> Login
                 ├── Else if email matches existing account -> Link provider & Login
                 └── Else -> Create new Account & Link provider & Login
                 │
                 ▼
5. tc_auth redirects to:
   https://app.example.com/oauth/callback?access_token=...&refresh_token=...
```

---

## 3. Account Linking & Lockout Prevention

### Linking an Additional Provider
When a user is already authenticated and wants to link another provider (e.g. connecting GitHub to their existing Google-created account):

1. Frontend initiates POST with user's Bearer token:
   `POST /tc-auth/account/oauth/link/github?frontend_url=https://app.example.com`
2. `tc_auth` stores `link_account_id` in session and redirects to GitHub.
3. Upon callback completion, the new provider is linked to the active `Account`.

### Unlinking a Provider (`DELETE /tc-auth/account/oauth/{provider}`)
`tc_auth` prevents accidental account lockouts by enforcing `enforce_active_auth=True`:
- If an account has **no password set** and only **one OAuth provider linked**, attempting to delete that provider will raise an `AuthError` (`"Cannot unlink provider: Account has no password and this is the only linked OAuth provider"`).
- The user must first set a password via `PUT /tc-auth/update/password` or link another provider before unlinking.

---

## 4. Frontend Integration Examples

### Approach A: Full Page Redirect (Recommended)

```javascript
// 1. Trigger OAuth login
function handleGoogleLogin() {
  const apiBase = "https://api.example.com";
  const frontendUrl = window.location.origin; // e.g. "https://app.example.com"
  window.location.href = `${apiBase}/tc-auth/google/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
}

// 2. In your frontend Callback Router (/oauth/callback):
// URL: https://app.example.com/oauth/callback?access_token=...&refresh_token=...
function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const error = params.get("error");

  if (error) {
    console.error("OAuth Error:", error);
    return;
  }

  if (accessToken) {
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    window.location.href = "/dashboard";
  }
}
```

### Approach B: Popup Window with `postMessage`

```javascript
function loginWithPopup(provider = "google") {
  const apiBase = "https://api.example.com";
  const frontendUrl = window.location.origin;
  const url = `${apiBase}/tc-auth/${provider}/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
  
  const popup = window.open(url, "oauth_popup", "width=600,height=700");

  window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
      const { access_token, refresh_token } = event.data;
      localStorage.setItem("access_token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);
      popup.close();
      window.location.href = "/dashboard";
    }
  });
}
```
