# Frontend Token Usage Guide: Single-Token & Dual-Token Modes

This guide provides a comprehensive, production-ready integration pattern for frontend applications (React, Next.js, Vue, Vanilla JS, Axios, Fetch) to seamlessly handle **both Single-Token Mode and Dual-Token Mode** with `tc_auth`.

---

## 1. Overview: Single-Token vs. Dual-Token Mode

| Feature | Single-Token Mode (Default) | Dual-Token Mode (Enabled via `dual_token_mode=True`) |
| :--- | :--- | :--- |
| **Access Token** | Long-lived (default 7 days) | Short-lived (default 15 minutes) |
| **Refresh Token** | *None* | Long-lived (default 7 days) |
| **Protected Requests** | `Authorization: Bearer <access_token>` | `Authorization: Bearer <access_token>` |
| **Token Expiry Behavior** | Redirect to `/login` when token expires (HTTP 401) | Auto-refresh access token via `POST /tc-auth/token/refresh` without logging user out |
| **OAuth Callback URL** | `?access_token=...` | `?access_token=...&refresh_token=...` |
| **Login/Signup Response** | `{ "access_token": "...", "account": {...} }` | `{ "access_token": "...", "refresh_token": "...", "account": {...} }` |

---

## 2. Universal Frontend Strategy

A robust frontend application should be **adaptive** — automatically utilizing refresh tokens when provided by the backend, while gracefully falling back to standard single-token behavior when refresh tokens are absent.

```
                  ┌─────────────────────────────────┐
                  │ User Logs In / OAuth Callback   │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                   Does response have `refresh_token`?
                                   │
                   ┌───────────────┴───────────────┐
                   ▼ YES                           ▼ NO
        ┌──────────────────────┐        ┌──────────────────────┐
        │ Dual-Token Active    │        │ Single-Token Active  │
        │ - Store access_token │        │ - Store access_token │
        │ - Store refresh_token│        │ - No refresh needed  │
        └──────────┬───────────┘        └──────────┬───────────┘
                   │                               │
                   ▼                               ▼
        ┌──────────────────────────────────────────────────────┐
        │ Outgoing API Requests: `Authorization: Bearer token` │
        └──────────────────────────┬───────────────────────────┘
                                   │
                                   ▼
                       API Returns HTTP 401?
                                   │
                   ┌───────────────┴───────────────┐
                   ▼ YES                           ▼ NO
          Is `refresh_token` available?         Request Succeeded (200 OK)
                   │
         ┌─────────┴─────────┐
         ▼ YES               ▼ NO
  ┌───────────────┐   ┌──────────────────────┐
  │ Call /refresh │   │ Clear tokens         │
  │ Replay Request│   │ Redirect to `/login` │
  └───────────────┘   └──────────────────────┘
```

---

## 3. Universal Axios Implementation (Recommended)

This client handles:
1. Automatic token attachment on all outgoing requests.
2. Intercepting `401 Unauthorized` errors.
3. **Queue / Mutex Lock**: If multiple API requests fail with 401 at the same time, only **one** refresh request is sent; all other pending requests wait and replay automatically once the new token arrives.
4. Automatic fallback if in Single-Token Mode or if the refresh token expires.

```typescript
// src/api/client.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com/tc-auth";

// Token storage helpers
export const tokenStorage = {
  getAccessToken: () => localStorage.getItem("access_token"),
  getRefreshToken: () => localStorage.getItem("refresh_token"),
  setTokens: (accessToken: string, refreshToken?: string | null) => {
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
  },
  clearTokens: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
  hasRefreshToken: () => Boolean(localStorage.getItem("refresh_token")),
};

// Create Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. Request Interceptor: Attach Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle 401 & Concurrent Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStorage.getRefreshToken();

      // Case A: Single-Token Mode (No refresh token exists) OR Refresh Endpoint itself failed
      if (!refreshToken || originalRequest.url?.includes("/token/refresh")) {
        tokenStorage.clearTokens();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(error);
      }

      // Case B: Dual-Token Mode (Refresh token exists)
      if (isRefreshing) {
        // Queue concurrent requests while token is refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call token refresh endpoint
        const response = await axios.post(`${API_BASE_URL}/token/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data;

        // Store refreshed tokens
        tokenStorage.setTokens(access_token, newRefreshToken);

        // Update default header and original request header
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        processQueue(null, access_token);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        tokenStorage.clearTokens();
        if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
          window.location.href = "/login?expired=true";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 4. Universal Native Fetch Implementation

If you prefer lightweight `fetch` without third-party dependencies:

```typescript
// src/api/fetchClient.ts
const API_BASE_URL = "https://api.example.com/tc-auth";

interface RequestOptions extends RequestInit {
  _retry?: boolean;
}

export async function customFetch(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  let accessToken = localStorage.getItem("access_token");
  const refreshToken = localStorage.getItem("refresh_token");

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401 && !options._retry) {
    // If dual-token mode is active and we have a refresh token:
    if (refreshToken && !endpoint.includes("/token/refresh")) {
      options._retry = true;

      try {
        const refreshRes = await fetch(`${API_BASE_URL}/token/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("access_token", data.access_token);
          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
          }

          // Retry original request with newly issued token
          headers.set("Authorization", `Bearer ${data.access_token}`);
          return fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        }
      } catch (e) {
        console.error("Token refresh failed:", e);
      }
    }

    // Single-token mode OR refresh failed -> clear & redirect
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  return response;
}
```

---

## 5. Handling Logins & Signups

Store tokens dynamically regardless of single or dual-token mode:

```typescript
// Handle Password Login, OTP Login, or Signup
async function handleLoginResponse(responsePayload: {
  access_token: string;
  refresh_token?: string;
  account: any;
}) {
  // 1. Always store access_token
  localStorage.setItem("access_token", responsePayload.access_token);

  // 2. If dual-token mode is active, store refresh_token; otherwise clear any old refresh_token
  if (responsePayload.refresh_token) {
    localStorage.setItem("refresh_token", responsePayload.refresh_token);
  } else {
    localStorage.removeItem("refresh_token");
  }

  // 3. Navigate to app dashboard
  window.location.href = "/dashboard";
}
```

---

## 6. Handling OAuth & Magic Link Callbacks (Google, GitHub, Discord, Magic Link)

When the user completes an OAuth login OR clicks a Magic Link (`GET /tc-auth/link/login`), the backend redirects the browser back to `{frontend_url}/oauth/callback` with query parameters.

### Query Parameter Shapes:
- **Single-Token Mode**: `https://app.example.com/oauth/callback?access_token=eyJhbGci...`
- **Dual-Token Mode**: `https://app.example.com/oauth/callback?access_token=eyJhbGci...&refresh_token=eyJhbGci...`
- **Account Linking**: `https://app.example.com/oauth/callback?linked=true&provider=google`

> [!TIP]
> Notice that Magic Link login uses the identical redirect format as OAuth. This means your frontend does **not** need a separate login callback handler — the existing OAuth callback page handles Magic Link logins automatically!

### React Router / Next.js Callback Router:

```tsx
// src/pages/OAuthCallback.tsx or app/oauth/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    const linked = searchParams.get("linked");
    const provider = searchParams.get("provider");
    const error = searchParams.get("error");

    // Case 1: Successful Login or Signup (OAuth or Magic Link)
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }

      // Clean query parameters from URL history for security
      window.history.replaceState({}, document.title, window.location.pathname);
      router.replace("/dashboard");
      return;
    }

    // Case 2: Successful Secondary Account Linking
    if (linked === "true") {
      router.replace(`/settings/security?linked=true&provider=${provider}`);
      return;
    }

    // Case 3: Linking or Auth Error
    if (error || linked === "false") {
      router.replace(`/settings/security?error=${encodeURIComponent(error || "Linking failed")}`);
      return;
    }

    router.replace("/login");
  }, [searchParams, router]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p>Authenticating, please wait...</p>
    </div>
  );
}
```

---

## 7. Handling Magic Links & Bot-Safe Confirmation

### 7.1 Email Verification & Error Callback Router (`/magic-link/callback`)

When verifying an email address (`GET /tc-auth/link/verify`) or encountering an error (expired/replayed link), the backend redirects to `{frontend_url}/magic-link/callback`:

```tsx
// app/magic-link/callback/page.tsx
"use client";

import { useSearchParams } from "next/navigation";

export default function MagicLinkCallbackPage() {
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const email = searchParams.get("email");
  const error = searchParams.get("error");

  if (error) {
    return (
      <div className="error-card">
        <h2>Authentication Failed</h2>
        <p>{error}</p>
        <a href="/login">Return to Sign In</a>
      </div>
    );
  }

  if (verified === "true") {
    return (
      <div className="success-card">
        <h2>Email Verified!</h2>
        <p>Your account ({email}) has been successfully activated.</p>
        <a href="/login">Sign In Now</a>
      </div>
    );
  }

  return <p>Processing verification...</p>;
}
```

### 7.2 Bot-Safe SPA Verification (`POST /tc-auth/link/login`)

Corporate email scanners often pre-fetch links in incoming emails, which could consume single-use OTPs prematurely. To protect against this, you can direct magic links to a frontend confirmation page (e.g. `{frontend_url}/confirm-login?email=...&otp=...`) with a "Click to Confirm Sign-In" button that sends `POST /tc-auth/link/login`:

```typescript
async function confirmMagicLinkLogin(email: string, otp: string) {
  const res = await fetch("https://api.example.com/tc-auth/link/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    if (data.refresh_token) {
      localStorage.setItem("refresh_token", data.refresh_token);
    }
    window.location.href = "/dashboard";
  } else {
    const err = await res.json();
    alert(`Login failed: ${err.message || "Invalid or expired link"}`);
  }
}
```

---

## 8. Logout Strategy

When logging out, destroy the server session and clear all local tokens:

```typescript
async function logout() {
  const accessToken = localStorage.getItem("access_token");

  try {
    if (accessToken) {
      await fetch("https://api.example.com/tc-auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    }
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    // Clear both tokens
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  }
}
```

---

## 9. Summary Checklist for Frontend Teams

1. **Always send `Authorization: Bearer <access_token>`**: Never send the `refresh_token` in `Authorization` headers (doing so triggers a `401 Unauthorized` security rejection).
2. **Dynamically check for `refresh_token`**: If present, persist it and enable auto-refresh on 401; if absent, treat as Single-Token Mode.
3. **Queue simultaneous requests**: Use the Axios response interceptor with request queuing to prevent multiple parallel `/token/refresh` calls when several components fetch on mount.
4. **Clean OAuth & Magic Link callback URLs**: Use `window.history.replaceState` or client-side navigation (`router.replace`) immediately after reading tokens to prevent tokens leaking in browser history or referrer headers.
5. **Handle Refresh Token Rotation**: Whenever `/token/refresh` returns a new `refresh_token`, update `localStorage` with the new value.
6. **Reuse Callback Route**: Both OAuth providers (Google, GitHub, Discord) and Magic Links (`GET /link/login`) redirect to `{frontend_url}/oauth/callback` with tokens, avoiding duplicate frontend callback logic.
