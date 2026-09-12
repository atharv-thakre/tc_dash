# Profile Routes

Base path: `/tc-auth`

Authentication:

- All routes in this group require `Authorization: Bearer <access_token>`.
- The token must belong to a valid session and account.

Route behavior:

- `GET /me` returns the current account, current session, and token payload.
- `PATCH /me` updates the current account profile fields.
- `PUT /update/password` updates the current account password.
- `POST /logout` deletes the current session.
- `POST /logout-all` deletes every session for the current account.

Common response shapes:

Current user response:

```json
{
  "account": {
    "id": 1,
    "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
    "name": "Jane Doe",
    "handle": "jane",
    "email": "jane@example.com",
    "phone": null,
    "avatar_url": null,
    "role": "user",
    "status": "active",
    "created_at": "2026-08-07T12:00:00",
    "updated_at": "2026-08-07T12:00:00"
  },
  "session": {
    "id": 9,
    "account_id": 1,
    "token_hash": "...",
    "ip_address": "203.0.113.10",
    "user_agent": "Mozilla/5.0",
    "expires_at": "2026-08-08T12:00:00",
    "created_at": "2026-08-07T12:00:00"
  },
  "payload": {
    "aid": 1,
    "sid": 9,
    "token": "..."
  }
}
```

Updated account response:

```json
{
  "id": 1,
  "uid": "2d7b5f8e-8d8a-4cc4-9c3d-2f2c6c4d2e28",
  "name": "Jane Doe",
  "handle": "jane",
  "email": "jane@example.com",
  "phone": "+15555550100",
  "avatar_url": null,
  "role": "user",
  "status": "active",
  "created_at": "2026-08-07T12:00:00",
  "updated_at": "2026-08-07T12:10:00"
}
```

## POST `/logout`

Destroys the current session.

Response:

```json
{
  "success": true,
  "message": "Session destroyed successfully"
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/logout`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
const data = await res.json();
```

## POST `/logout-all`

Destroys every session for the current account.

Response:

```json
{
  "success": true,
  "message": "All sessions destroyed for account",
  "count": 2
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/logout-all`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
const data = await res.json();
```

## GET `/me`

Returns the current account, session, and token payload.

Response:

- The object shown in the current user response example above.

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/me`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

const me = await res.json();
```

## PATCH `/me`

Updates the profile fields on the current account.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "handle": "jane",
  "avatar_url": "https://example.com/avatar.png",
  "phone": "+15555550100"
}
```

Response:

- The updated account object.

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/me`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: "Jane Doe",
    avatar_url: "https://example.com/avatar.png",
  }),
});

const account = await res.json();
```

## PUT `/update/password`

Updates the current account password.

Body:

```json
{
  "password": "new-password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

Example:

```js
const res = await fetch(`${baseUrl}/tc-auth/update/password`, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ password: "NewPassword123" }),
});
const data = await res.json();
```

## POST `/account/oauth/link/{provider}`

Links a secondary OAuth provider (`google`, `github`, or `discord`) to the authenticated user account. Specific route aliases exist:
- `POST /account/oauth/link/google`
- `POST /account/oauth/link/github`
- `POST /account/oauth/link/discord`

Headers:
- `Authorization: Bearer <access_token>`

Request Options:
1. **Redirect Flow**: Pass `?frontend_url=https://app.com` query parameter or `{ "frontend_url": "https://app.com" }` body. Returns a redirect to the provider's authorization page. Upon callback, the provider is linked to this account.
2. **Direct Payload Flow**: Pass `{ "provider_user_id": "provider-id-123" }` in JSON body. Directly links the provider and returns the link object.

Response (Direct Flow):
```json
{
  "id": 2,
  "account_id": 1,
  "provider": "google",
  "provider_user_id": "google-user-123",
  "created_at": "2026-09-12T12:00:00"
}
```

Example (Browser Redirect):
```js
const res = await fetch(`${baseUrl}/tc-auth/account/oauth/link/google?frontend_url=${encodeURIComponent(frontendUrl)}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

## DELETE `/account/oauth/{provider}`

Safely unlinks a connected OAuth provider from the authenticated user account.

Headers:
- `Authorization: Bearer <access_token>`

Path parameter:
- `provider`: `google`, `github`, or `discord`

Lockout Prevention:
The unlinking request will fail with **HTTP 400 Bad Request** if unlinking would leave the account without any authentication method (i.e. if the user has no password and no other connected OAuth providers).

Response:
```json
{
  "success": true,
  "message": "OAuth link for 'google' removed successfully"
}
```

Example:
```js
const res = await fetch(`${baseUrl}/tc-auth/account/oauth/google`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
const data = await res.json();
```

## GET `/account/oauth/links`

Retrieves all connected OAuth providers for the authenticated user account.

Headers:
- `Authorization: Bearer <access_token>`

Response:
```json
[
  {
    "id": 1,
    "account_id": 1,
    "provider": "google",
    "provider_user_id": "1049281048",
    "created_at": "2026-09-12T12:00:00"
  },
  {
    "id": 2,
    "account_id": 1,
    "provider": "github",
    "provider_user_id": "948271",
    "created_at": "2026-09-12T12:05:00"
  }
]
```

