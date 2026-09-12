# Dashboard API

The `auth.dashboard` module provides dashboard-level summary information
for the authentication system.

------------------------------------------------------------------------

# `get_counts()`

Returns the total count of the main authentication resources.

``` python
auth.dashboard.get_counts()
```

## Parameters

This method takes no arguments.

## Example

``` python
result = auth.dashboard.get_counts()
```

## Returns

Returns a `dict` containing the resource counts:

``` python
{
    "accounts": 1,
    "oauth": 2,
    "sessions": 5,
    "otp": 3
}
```

  Field        Description
  ------------ ----------------------------------
  `accounts`   Total number of accounts.
  `oauth`      Total number of OAuth records.
  `sessions`   Total number of session records.
  `otp`        Total number of OTP records.
