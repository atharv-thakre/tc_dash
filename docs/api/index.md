# API Routes Index

This folder documents the route modules in `tc_auth/api`.

- [Sign In / Sign Up Routes](login_route.md) (Includes Email OTP, Dual-Token Refresh, and Password Complexity)
- [OAuth Login Routes](oauth_route.md) (Google, GitHub, and Discord OAuth)
- [OAuth Frontend Integration Guide](oauth_integration.md)
- [Profile & Account Linking Routes](account_route.md) (Profile management and Multi-Provider Safe Unlinking)
- [Dashboard / Config Routes](dashboard_route.md) (Email, GitHub, Google, Discord, and Dual-Token JWT Configuration)
- [Admin Account Routes](dash_account.md)
- [Admin OAuth Link Routes](dash_oauth.md)
- [Admin OTP Routes](dash_otp.md)
- [Admin Session Routes](dash_session.md)
- [Standardized API Responses & Change Matrix](../tc_auth/API_RESPONSES.md)
- [System Route Placeholder](system_route.md)

## Route Mounting & `/tc-auth` Prefix Policy

- All endpoints are mounted under `/tc-auth` by default.
- **Prefix Stripping**: The backend and client SDKs automatically handle the `/tc-auth` prefix. If a request arrives with `/tc-auth` in the sub-path (e.g., `/tc-auth/tc-auth/...` or `/tc-auth/...` on a router mounted at root or `/tc-auth`), the router strips redundant prefixes to normalize the request path to the canonical route.
- Clients can safely call either `/tc-auth/<endpoint>` or `/<endpoint>` against the base URL.
