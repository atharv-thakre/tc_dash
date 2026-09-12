# OAuth Frontend Integration Guide

This guide explains how to integrate the `tc_auth` OAuth endpoints with a browser-based frontend.

Prerequisites:

- Configure the provider credentials with `POST /tc-auth/config/github`, `POST /tc-auth/config/google`, or `POST /tc-auth/config/discord`.
- Register the exact `redirect_uri` in the provider developer portal.

Typical sign-in flow:

1. The user clicks a sign-in button in the frontend.
2. The frontend navigates the browser to `GET /tc-auth/google/login`, `GET /tc-auth/github/login`, or `GET /tc-auth/discord/login`.
3. The backend redirects to the provider authorization page.
4. The provider redirects back to the backend callback route.
5. The backend exchanges the code, creates or links the local account, creates a session, and redirects to the frontend callback URL with `access_token` in the query string.

Example sign-in:

```js
window.location.href = `${backendUrl}/tc-auth/google/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

Account Linking Flow (Already Authenticated User):

1. The logged-in user initiates linking in the frontend via `POST /tc-auth/account/oauth/link/{provider}` (e.g. `google`, `github`, `discord`) with `frontend_url`:
```js
const res = await fetch(`${backendUrl}/tc-auth/account/oauth/link/discord`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ frontend_url: "https://app.example.com/settings/security" })
});
const data = await res.json();
window.location.href = data.redirect_url;
```
2. The user authorizes with the provider and is redirected back to the backend callback, which links the provider to the existing account and redirects back to `frontend_url/oauth/callback?linked=true&provider=discord`.

Unlinking a Provider:
```js
await fetch(`${backendUrl}/tc-auth/account/oauth/discord`, {
  method: "DELETE",
  headers: { Authorization: `Bearer ${accessToken}` }
});
```
*Note: Unlinking is safely rejected (HTTP 400) if the account does not have a password or another linked OAuth provider.*

---

## Profile & Email Overwrite Policy

When an OAuth user authenticates or links their profile:

> [!IMPORTANT]
> **Empty Field & Overwrite Rules**:
> - **Empty Fields Rule**: If an account has empty or null fields (`name`, `email`, `avatar_url`), **all 3 providers (Google, GitHub, Discord) are permitted to populate and set all data**.
> - **Email Overwrite Rule**: If an account already exists and has an email, **only Google OAuth is permitted to overwrite the email address** (or set it when Google OAuth sign-up is called).
> - **Existing Data Preservation**:
>   - In the case of **GitHub** and **Discord**, existing non-empty profile data (email, name, avatar) is **never overwritten**.
>   - For **Google**, existing non-empty profile data (name, avatar) is also **never overwritten**, **except for email** (which is always updated/set to Google's verified email address).

| Provider | Overwrites Existing Non-Empty Email? | Overwrites Existing Name / Avatar? | Sets Empty Fields (`null` or `""`)? | Auto-Links by Verified Email? |
| :--- | :--- | :--- | :--- | :--- |
| **Google** | **YES** (always set or overwritten) | **NO** (preserved if already present) | **YES** (sets all empty fields) | **YES** (verified) |
| **GitHub** | **NO** (preserved if already present) | **NO** (preserved if already present) | **YES** (sets all empty fields) | **YES** (verified primary) |
| **Discord** | **NO** (preserved if already present) | **NO** (preserved if already present) | **YES** (sets all empty fields) | **YES** (verified only) |

---

## Direct Account Linking on OAuth Login / Signup

When a user logs in or signs up via OAuth without explicit linking:
1. **Case-Insensitive Email Matching**: The backend checks for an existing account matching the provider's verified email (e.g. `USER@EXAMPLE.COM` matches `user@example.com`).
2. **Discord Security Guard**: If a Discord account's email is unverified (`verified: False`), it is **strictly rejected for automatic linking** to protect existing accounts from unauthorized takeover.
3. **Conflict Detection**:
   - If the existing account is already linked to the same provider user ID, the login succeeds idempotently.
   - If the account is already linked to a *different* ID for that provider, an `OAuthAlreadyLinkedError` (HTTP 409) is returned.
   - If the provider ID is already linked to another profile, an `OAuthAlreadyLinkedError` (HTTP 409) is returned.

---

## Frontend OAuth Callback Router

When the backend completes the OAuth exchange, it redirects the browser to `{frontend_url}/oauth/callback` with query parameters:

1. **Sign-In / Sign-Up Success (Single-Token Mode)**:
   `https://app.example.com/oauth/callback?access_token=eyJhbGci...`
2. **Sign-In / Sign-Up Success (Dual-Token Mode)**:
   `https://app.example.com/oauth/callback?access_token=eyJhbGci...&refresh_token=eyJhbGci...`
3. **Account Linking Success**:
   `https://app.example.com/oauth/callback?linked=true&provider=google`
4. **Account Linking Failure / Conflict**:
   `https://app.example.com/oauth/callback?linked=false&provider=google&error=OAuth+account+is+already+linked`

### 1. Vanilla JavaScript / SPA Implementation

Create an `/oauth/callback` route or page in your frontend:

```html
<!-- /oauth/callback.html -->
<script>
  (function handleOAuthCallback() {
    const params = new URLSearchParams(window.location.search);

    // Case 1: Sign-in / Sign-up with access_token
    const accessToken = params.get("access_token");
    if (accessToken) {
      // 1. Store token securely in localStorage or memory
      localStorage.setItem("access_token", accessToken);

      // 2. Clean URL so token is not leaked in browser history or referrer headers
      window.history.replaceState({}, document.title, window.location.pathname);

      // 3. Redirect user to main application or dashboard
      window.location.href = "/dashboard";
      return;
    }

    // Case 2: Account Linking result
    const linked = params.get("linked");
    const provider = params.get("provider");
    const error = params.get("error");

    if (linked === "true") {
      alert(`Successfully linked ${provider} to your profile!`);
      window.location.href = "/settings/security";
      return;
    }

    if (linked === "false" || error) {
      alert(`Failed to link ${provider}: ${error || "Unknown error"}`);
      window.location.href = "/settings/security";
      return;
    }

    // Fallback: No recognized parameters
    window.location.href = "/login";
  })();
</script>
```

### 2. React Router Example (`OAuthCallback.jsx`)

```jsx
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const linked = searchParams.get("linked");
    const provider = searchParams.get("provider");
    const error = searchParams.get("error");

    if (accessToken) {
      // Store token
      localStorage.setItem("access_token", accessToken);

      // Clean query parameters from URL history
      window.history.replaceState({}, document.title, window.location.pathname);

      // Navigate to dashboard
      navigate("/dashboard", { replace: true });
      return;
    }

    if (linked === "true") {
      navigate(`/settings/security?linked=true&provider=${provider}`, { replace: true });
      return;
    }

    if (error || linked === "false") {
      navigate(`/settings/security?error=${encodeURIComponent(error || "Linking failed")}`, { replace: true });
      return;
    }

    navigate("/login", { replace: true });
  }, [searchParams, navigate]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Completing authentication, please wait...</p>
    </div>
  );
}
```

### 3. Next.js App Router (`app/oauth/callback/page.tsx`)

```tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const linked = searchParams.get("linked");
    const provider = searchParams.get("provider");
    const error = searchParams.get("error");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      router.replace("/dashboard");
      return;
    }

    if (linked === "true") {
      router.replace(`/settings/security?linked=${provider}`);
      return;
    }

    if (error) {
      router.replace(`/settings/security?error=${encodeURIComponent(error)}`);
      return;
    }

    router.replace("/login");
  }, [searchParams, router]);

  return <div>Finishing authentication...</div>;
}
```

---

## Using the Access Token in Authenticated Requests

Once the `access_token` is retrieved by the callback router and stored, supply it in the `Authorization` header with the `Bearer` scheme for all protected API endpoints:

### Standard Fetch Example

```js
async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`https://api.example.com/tc-auth${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Access token expired or invalid - redirect to login
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  return response.json();
}

// Example usage:
const profile = await apiRequest("/account/me");
console.log("Logged in as:", profile.account.email);
```

### Axios Client with Interceptor

```js
import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.example.com/tc-auth",
});

// Attach access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle authentication errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Important Security Notes

- **Never expose client secrets**: `client_secret` must strictly reside on the backend server.
- **Clean the URL**: Always remove `access_token` from `window.location` immediately via `history.replaceState` or client-side navigation to prevent token leakage via referrer headers or browser history.
- **Session Cookies**: Ensure cross-site cookie and session settings (`SameSite=Lax` or `SameSite=None; Secure`) permit cookies on the backend callback endpoints so session state (such as `frontend_url` and `link_account_id`) is preserved.

