# Admin Account Routes

Base path: `/tc-auth/account`

Authentication:

- All routes in this group require `Authorization: Bearer <access_token>`.
- The authenticated account must have the `superadmin` role.

## GET `/`

Returns a paginated list of accounts.

Query parameters:

- `page` - page number, default `1`, minimum `1`
- `limit` - page size, default `10`, minimum `1`, maximum `100`

Response:

An array of account records.

Example:

```json
[
  {
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
  }
]
```

## GET `/query`

Looks up accounts by a supported field.

Query parameters:

- `field` - supported fields include `id`, `uid`, `phone`, `email`, `name`, `handle`
- `value` - value to match

Response:

- An array of matching account records.

## POST `/`

Creates a new account.

Body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "handle": "jane",
  "avatar_url": "https://example.com/avatar.png",
  "phone": "+15555550100",
  "role": "user",
  "status": "active",
  "password": "Password123"
}
```

Response:

- The created account record.

## PATCH `/`

Performs a super update on an account.

Body:

```json
{
  "account_id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "handle": "jane",
  "avatar_url": "https://example.com/avatar.png",
  "phone": "+15555550100",
  "role": "admin",
  "status": "active",
  "password": "NewPassword123"
}
```

Response:

- The updated account record.

## DELETE `/`

Deletes an account.

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
  "message": "Account deleted successfully"
}
```
