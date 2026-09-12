# Admin OAuth Link Routes

Base path: `/tc-auth/oauth`

Authentication:

- All routes in this group require `Authorization: Bearer <access_token>`.
- The authenticated account must have the `superadmin` role.

## GET `/`

Returns a paginated list of OAuth link records.

Query parameters:

- `page` - page number, default `1`, minimum `1`
- `limit` - page size, default `10`, minimum `1`, maximum `100`

Response:

An array of OAuth link records.

Example:

```json
[
  {
    "id": 1,
    "account_id": 1,
    "provider": "google",
    "provider_user_id": "123456789",
    "created_at": "2026-08-07T12:00:00"
  }
]
```

## GET `/query`

Looks up OAuth link records by field.

Query parameters:

- `field` - supported values include `id`, `provider_id`, `account_id`
- `value` - value to match

Response:

- An array of matching OAuth link records.

## POST `/`

Links an OAuth provider account to a local account.

Body:

```json
{
  "account_id": 1,
  "provider": "google",
  "provider_user_id": "123456789"
}
```

Response:

- The created OAuth link record.

## DELETE `/`

Unlinks an OAuth provider from an account.

Body:

```json
{
  "account_id": 1,
  "provider": "google"
}
```

Response:

```json
{
  "success": true,
  "message": "OAuth link removed successfully"
}
```
