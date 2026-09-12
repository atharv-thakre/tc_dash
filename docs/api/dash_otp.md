# Admin OTP Routes

Base path: `/tc-auth/otp`

Authentication:

- All routes in this group require `Authorization: Bearer <access_token>`.
- The authenticated account must have the `superadmin` role.

Security notes:

- OTPs are sensitive. The create endpoint returns the raw OTP value and should only be used in trusted environments.

## GET `/`

Returns a paginated list of OTP records.

Query parameters:

- `page` - page number, default `1`, minimum `1`
- `limit` - page size, default `10`, minimum `1`, maximum `100`

Response:

An array of OTP records.

Example:

```json
[
  {
    "id": 1,
    "identifier": "jane@example.com",
    "purpose": "login",
    "code_hash": "...",
    "attempts": 0,
    "expires_at": "2026-08-07T12:05:00",
    "created_at": "2026-08-07T12:00:00"
  }
]
```

## GET `/query`

Looks up OTP records by identifier.

Query parameters:

- `identifier` - the OTP identifier, usually an email address

Response:

- An array of matching OTP records.

## POST `/`

Creates an OTP for an identifier and purpose.

Body:

```json
{
  "identifier": "jane@example.com",
  "purpose": "login",
  "expiry": 300
}
```

Response:

```json
{
  "otp": "123456",
  "expires_at": 1735689600
}
```

## DELETE `/`

Revokes an OTP for an identifier and purpose.

Body:

```json
{
  "identifier": "jane@example.com",
  "purpose": "login"
}
```

Response:

```json
{
  "success": true,
  "message": "OTP revoked successfully",
  "count": 1
}
```

## DELETE `/cleanup`

Deletes expired OTP records.

Response:

```json
{
  "success": true,
  "message": "Expired OTPs cleaned successfully",
  "count": 5
}
```

## DELETE `/clear`

Deletes all OTP records.

Response:

```json
{
  "success": true,
  "message": "All OTPs cleared successfully",
  "count": 12
}
```
