from connect import auth

# ==========================================================
# OTP SERVICE USAGE
# ==========================================================

# 1. Create OTP
otp_data = auth.otp.create(
    identifier="testuser@example.com",
    purpose="login",
    expiry=300,
    length=6,
)

# 2. Verify OTP
verify_res = auth.otp.verify(
    identifier="testuser@example.com",
    purpose="login",
    otp="123456",
)

# 3. Revoke OTP
revoke_res = auth.otp.revoke(
    identifier="testuser@example.com",
    purpose="login",
)

# 4. Remove expired OTPs
cleanup_res = auth.otp.cleanup()

# 5. Remove all OTPs immediately
clear_res = auth.otp.clear_all()

# 6. Get paginated OTP records
otp_records = auth.otp.get_all(
    page=1,
    limit=10,
)

# 7. Query OTP records by identifier
queried_otps = auth.otp.query(
    identifier="testuser@example.com",
)