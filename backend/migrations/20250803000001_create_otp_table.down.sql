-- Drop OTP table and related objects
DROP FUNCTION IF EXISTS cleanup_expired_otp_codes();
DROP INDEX IF EXISTS idx_otp_codes_user_id;
DROP INDEX IF EXISTS idx_otp_codes_expires_at;
DROP INDEX IF EXISTS idx_otp_codes_email;
DROP TABLE IF EXISTS otp_codes;