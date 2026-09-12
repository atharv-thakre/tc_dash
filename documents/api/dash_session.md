# Admin Session Routes

Base path: `/tc-auth/session`

Authentication:

- All routes in this group require `Authorization: Bearer <access_token>`.
- The authenticated account must have the `superadmin` role.

Security notes:

- Session records contain sensitive token and device metadata.

## GET `/`

Returns a paginated list of session records.

Query parameters:

- `page` - page number, default `1`, minimum `1`
- `limit` - page size, default `10`, minimum `1`, maximum `100`

Response:

An array of session records.

Example:

```json
[
  {
    "id": 9,
    "account_id": 1,
    "token_hash": "...",
    "ip_address": "203.0.113.10",
    "user_agent": "Mozilla/5.0",
    "expires_at": "2026-08-08T12:00:00",
    "created_at": "2026-08-07T12:00:00"
  }
]
```

## GET `/query`

Looks up session records by field.

Query parameters:

- `field` - supported values include `id`, `sid`, `token`, `ip`
- `value` - value to match

Response:

- An array of matching session records.

## DELETE `/`

Destroys a single session.

Body:

```json
{
  "session_id": 9
}
```

Response:

```json
{
  "success": true,
  "message": "Session destroyed successfully"
}
```

## DELETE `/all`

Destroys all sessions for an account.

Body:

```json
{
  "account_id": 1
}
```

Response:

```json
{
  "success": true,
  "message": "All sessions destroyed for account",
  "count": 3
}
```

## DELETE `/cleanup`

Deletes expired sessions.

Response:

```json
{
  "success": true,
  "message": "Expired sessions cleaned up successfully",
  "count": 4
}
```

## DELETE `/clear`

Deletes all sessions.

Response:

```json
{
  "success": true,
  "message": "All sessions cleared successfully",
  "count": 10
}
```
