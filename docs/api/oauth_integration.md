# OAuth Frontend Integration Guide

This guide explains how to integrate the `tc_auth` OAuth endpoints with a browser-based frontend.

Prerequisites:

- Configure the provider credentials with `POST /tc-auth/config/github` or `POST /tc-auth/config/google`.
- Register the exact `redirect_uri` in the provider dashboard.

Typical flow:

1. The user clicks a sign-in button in the frontend.
2. The frontend navigates the browser to `GET /tc-auth/google/login` or `GET /tc-auth/github/login`.
3. The backend redirects to the provider authorization page.
4. The provider redirects back to the backend callback route.
5. The backend exchanges the code, creates or links the local account, creates a session, and redirects to the frontend callback URL with `access_token` in the query string.

Example:

```js
window.location.href = `${backendUrl}/tc-auth/google/login?frontend_url=${encodeURIComponent(frontendUrl)}`;
```

Important notes:

- Never expose `client_secret` in frontend code.
- Preserve cookies during the OAuth flow because the backend uses session state.
- Use the returned `access_token` with protected routes as a Bearer token.
