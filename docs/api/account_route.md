# Profile & Account Linking Routes

Base path: `/tc-auth` (Supports automatic prefix stripping so either `/tc-auth/<path>` or `/<path>` works transparently)

Authentication:

- All routes in this group require `Authorization: Bearer <access_token>`.
- The token must belong to a valid, active session and account.

Route overview:

- `GET /me` - Returns current account, active session, and token claims.
- `PATCH /me` - Updates account profile information (name, handle, phone, avatar).
- `PUT /update/password` - Updates account password (enforcing password complexity).
- `POST /logout` - Terminates the current device session.
- `POST /logout-all` - Globally invalidates all active sessions for the user.
- `GET /account/oauth/links` - Retrieves all OAuth providers linked to the authenticated user.
- `POST /account/oauth/link/{provider}` - Links a new OAuth provider to the current user.
- `DELETE /account/oauth/{provider}` - Unlinks an OAuth provider with built-in **Safe Unlinking (Lockout Prevention)**.

---

## Multi-Provider Account Linking & Safe Unlinking

### GET `/account/oauth/links`

Returns an array of all external OAuth provider accounts linked to the authenticated user.

Response (`200 OK`):

```json
[
  {
    "id": 1,
    "account_id": "1",
    "provider": "google",
    "provider_user_id": "google-oauth2|10928374619283",
    "created_at": "2026-01-16T12:00:00.000Z"
  },
  {
    "id": 2,
    "account_id": "1",
    "provider": "github",
    "provider_user_id": "gh_84920194",
    "created_at": "2026-02-02T14:30:00.000Z"
  }
]
```

### POST `/account/oauth/link/{provider}`

Initiates linking of an external OAuth provider (e.g., `google`, `github`, `discord`) to the current account.

Path parameter:
- `provider`: `google` | `github` | `discord`

Body (Optional):
```json
{
  "provider_user_id": "discord_1293847192",
  "frontend_url": "http://localhost:3000"
}
```

Response:
Returns the newly created link object or redirects the user through provider consent.

---

### DELETE `/account/oauth/{provider}` (Safe Unlinking)

Unlinks the specified OAuth provider from the authenticated user's account.

#### Safe Unlinking (Lockout Prevention Rule)

To prevent accidental account abandonment or total lockout:
- An account **CANNOT** unlink an OAuth provider if:
  1. The account does **not** have a password set, AND
  2. The provider being unlinked is the **only** active authentication method.
- When this condition occurs, the server rejects the request with `400 Bad Request`:

```json
{
  "success": false,
  "message": "Cannot unlink provider: account must have a password or at least one other active authentication method",
  "detail": "Cannot unlink provider: account must have a password or at least one other active authentication method"
}
```

Success Response (`200 OK`):

```json
{
  "success": true,
  "message": "OAuth link for 'github' removed successfully"
}
```

---

## GET `/me`

Returns the current authenticated user profile, session, and decoded claims.

Response (`200 OK`):

```json
{
  "account": {
    "id": 1,
    "uid": "tc_usr_01",
    "name": "Super Administrator",
    "email": "admin@tcauth.dev",
    "handle": "superadmin",
    "avatar_url": "https://...",
    "phone": "+1-555-0199",
    "role": "superadmin",
    "status": "active",
    "created_at": "2026-01-15T08:00:00.000Z"
  },
  "session": {
    "id": 1,
    "token": "tc_sess_live_current",
    "account_id": "1",
    "user_agent": "Mozilla/5.0 ...",
    "ip_address": "127.0.0.1",
    "created_at": "2026-03-12T12:00:00.000Z",
    "expires_at": "2026-03-19T12:00:00.000Z"
  },
  "payload": {
    "sub": "tc_usr_01",
    "role": "superadmin",
    "status": "active",
    "session_id": 1
  }
}
```

---

## PATCH `/me`

Updates editable profile fields for the authenticated user.

Body:

```json
{
  "name": "Jane Administrator",
  "handle": "jane_admin",
  "phone": "+1-555-9988",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

Response:

Returns the updated account object.

---

## PUT `/update/password`

Updates the account's password. Requires meeting password complexity requirements (minimum 6 characters, uppercase, lowercase, digit).

Body:

```json
{
  "password": "NewStrongPassword123!"
}
```

Response:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## POST `/logout`

Destroys the current device session.

Response:

```json
{
  "success": true,
  "message": "Session destroyed successfully"
}
```

---

## POST `/logout-all`

Globally invalidates all active sessions for the authenticated account.

Response:

```json
{
  "success": true,
  "message": "All sessions destroyed for account",
  "count": 3
}
```
