# OTP API

The `auth.otp` module provides methods for creating, verifying,
revoking, cleaning up, clearing, retrieving, and querying OTP records.

## Available Methods

  Method          Purpose
  --------------- -----------------------------------------------
  `create()`      Creates a new OTP.
  `verify()`      Verifies an OTP.
  `revoke()`      Deletes an OTP for an identifier and purpose.
  `cleanup()`     Deletes expired OTPs.
  `clear_all()`   Deletes all OTPs immediately.
  `get_all()`     Returns a paginated list of OTP records.
  `query()`       Searches OTP records by identifier.

------------------------------------------------------------------------

# `create()`

Creates a new OTP for an identifier and purpose.

``` python
auth.otp.create(...)
```

## Parameters

  --------------------------------------------------------------------------
  Parameter      Type           Required       Default        Description
  -------------- -------------- -------------- -------------- --------------
  `identifier`   `str`          Yes            ---            User's email
                                                              address or
                                                              phone number.

  `purpose`      `str`          Yes            ---            Purpose of the
                                                              OTP, such as
                                                              `login`,
                                                              `signup`, or
                                                              `reset`.

  `length`       `int`          No             `6`            Number of
                                                              digits in the
                                                              OTP.

  `expiry`       `int`          No             `300`          OTP validity
                                                              period in
                                                              seconds.
  --------------------------------------------------------------------------

## Example

``` python
result = auth.otp.create(
    identifier="testuser@example.com",
    purpose="login",
    expiry=300,
    length=6,
)
```

## Returns

``` python
{
    "otp": otp,
    "expires_at": expires_at
}
```

`expires_at` contains the expiration time of the generated OTP.

------------------------------------------------------------------------

# `verify()`

Verifies an OTP for an identifier and purpose.

``` python
auth.otp.verify(...)
```

## Parameters

  Parameter      Type    Required
  -------------- ------- ----------
  `identifier`   `str`   Yes
  `purpose`      `str`   Yes
  `otp`          `str`   Yes

All parameters are mandatory.

## Example

``` python
result = auth.otp.verify(
    identifier="testuser@example.com",
    purpose="login",
    otp="123456",
)
```

## Returns

``` python
{
    "success": True,
    "message": "OTP verified successfully"
}
```

## Exceptions

  Exception            When it occurs
  -------------------- -----------------------------------------------
  `OTPNotFoundError`   No OTP exists for the identifier and purpose.
  `OTPExpiredError`    The OTP has expired.
  `OTPInvalidError`    The supplied OTP is invalid.

------------------------------------------------------------------------

# `revoke()`

Deletes the OTP associated with an identifier and purpose.

``` python
auth.otp.revoke(...)
```

## Parameters

  Parameter      Type    Required
  -------------- ------- ----------
  `identifier`   `str`   Yes
  `purpose`      `str`   Yes

Both parameters are mandatory.

If the OTP exists, it is deleted from the database.

## Example

``` python
result = auth.otp.revoke(
    identifier="testuser@example.com",
    purpose="login",
)
```

## Returns

``` python
{
    "success": True,
    "message": "OTP revoked successfully",
    "count": 1
}
```

------------------------------------------------------------------------

# `cleanup()`

Deletes all expired OTP records from the database.

``` python
auth.otp.cleanup()
```

This method takes no arguments.

## Example

``` python
result = auth.otp.cleanup()
```

## Returns

``` python
{
    "success": True,
    "message": "Expired OTPs cleaned successfully",
    "count": 3
}
```

------------------------------------------------------------------------

# `clear_all()`

Immediately deletes **all OTP records** from the database, including
active and expired OTPs.

``` python
auth.otp.clear_all()
```

This method takes no arguments.

> **Warning:** This removes every OTP record immediately.

## Example

``` python
result = auth.otp.clear_all()
```

## Returns

``` python
{
    "success": True,
    "message": "All OTPs cleared successfully",
    "count": 8
}
```

------------------------------------------------------------------------

# `get_all()`

Returns a paginated list of OTP records.

``` python
auth.otp.get_all(...)
```

## Parameters

  Parameter   Type    Default   Description
  ----------- ------- --------- -----------------------------
  `page`      `int`   `1`       Page number.
  `limit`     `int`   `10`      Number of records per page.

`limit` must be between `1` and `100`.

## Pagination

Pagination divides all OTP records into smaller pages.

For example, with:

``` python
limit=10
```

  Request    Records
  ---------- ---------
  `page=1`   1--10
  `page=2`   11--20
  `page=3`   21--30

Increase the page number to retrieve the next set of records.

## Example

``` python
otp_records = auth.otp.get_all(
    page=1,
    limit=10,
)
```

## Returns

Returns:

``` text
list[dict]
```

Each dictionary represents an OTP record.

### OTP Object

``` python
{
    "id": 1,
    "identifier": "testuser@example.com",
    "purpose": "login",
    "code_hash": "sd34bn45yhj4edc7yhn9iwsx6yh0ol3e23er876t2e3rt7y6terty",
    "attempt": 6,
    "expires_at": "2026-08-11T18:11:00.001639",
    "created_at": "2026-08-11T18:11:00.001639"
}
```

  -----------------------------------------------------------------------
  Field                   Type                    Description
  ----------------------- ----------------------- -----------------------
  `id`                    `int`                   OTP record ID.

  `identifier`            `str`                   Email address or phone
                                                  number associated with
                                                  the OTP.

  `purpose`               `str`                   Purpose of the OTP.

  `code_hash`             `str`                   Stored hash of the OTP
                                                  code.

  `attempt`               `int`                   Number of verification
                                                  attempts.

  `expires_at`            `str`                   OTP expiration
                                                  timestamp.

  `created_at`            `str`                   OTP creation timestamp.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# `query()`

Searches OTP records using the user's identifier.

``` python
auth.otp.query(...)
```

## Parameters

  Parameter      Type    Required   Description
  -------------- ------- ---------- ---------------------------------------
  `identifier`   `str`   Yes        User's email address or phone number.

## Matching

Partial matching is supported.

For example:

``` python
result = auth.otp.query(
    identifier="testuser@example.com",
)
```

The query can match records containing the supplied identifier value.

## Pagination

The returned results use the same pagination behavior as `get_all()`.

## Returns

Returns:

``` text
list[dict]
```

Each dictionary uses the same OTP object structure returned by
`get_all()`.

------------------------------------------------------------------------

# Return Summary

  Method          Return
  --------------- ------------------------------------
  `create()`      `dict` --- OTP and expiration time
  `verify()`      `dict` --- `{"success": True, "message": "..."}`
  `revoke()`      `dict` --- `{"success": True, "count": N}`
  `cleanup()`     `dict` --- `{"success": True, "count": N}`
  `clear_all()`   `dict` --- `{"success": True, "count": N}`
  `get_all()`     `list[dict]`
  `query()`       `list[dict]`

------------------------------------------------------------------------

# Quick Usage

``` python
from connect import auth


# Create OTP
otp = auth.otp.create(
    identifier="testuser@example.com",
    purpose="login",
)


# Verify OTP
auth.otp.verify(
    identifier="testuser@example.com",
    purpose="login",
    otp="123456",
)


# Revoke OTP
auth.otp.revoke(
    identifier="testuser@example.com",
    purpose="login",
)


# Remove expired OTPs
auth.otp.cleanup()


# Remove all OTPs
auth.otp.clear_all()


# Get OTP records
otp_records = auth.otp.get_all(
    page=1,
    limit=10,
)


# Query OTP records
otp_records = auth.otp.query(
    identifier="testuser@example.com",
)
```
