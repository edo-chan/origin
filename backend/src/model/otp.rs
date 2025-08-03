use anyhow::{Context, Result};
use argon2::{Argon2, PasswordHash, PasswordHasher, PasswordVerifier};
use argon2::password_hash::{rand_core::OsRng, SaltString};
use chrono::{DateTime, Duration, Utc};
use rand::Rng;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tracing::{debug, info, instrument, warn};
use uuid::Uuid;

/// OTP code model for email-based one-time password authentication
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct OtpCode {
    pub id: Uuid,
    pub email: String,
    pub code: String,
    pub code_hash: String,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub attempts: i32,
    pub max_attempts: i32,
    pub is_used: bool,
    pub user_id: Option<Uuid>,
}

/// Request to send OTP to email
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendOtpRequest {
    pub email: String,
}

/// Request to verify OTP
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VerifyOtpRequest {
    pub email: String,
    pub code: String,
}

/// OTP verification result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OtpVerificationResult {
    pub success: bool,
    pub user_id: Option<Uuid>,
    pub is_new_user: bool,
    pub attempts_remaining: i32,
}

/// Configuration for OTP functionality
#[derive(Debug, Clone)]
pub struct OtpConfig {
    /// OTP code length
    pub code_length: usize,
    /// OTP expiration time in minutes
    pub expires_minutes: i64,
    /// Maximum verification attempts
    pub max_attempts: i32,
    /// Rate limiting: max OTP requests per email per hour
    pub max_requests_per_hour: i32,
}

impl Default for OtpConfig {
    fn default() -> Self {
        Self {
            code_length: 6,
            expires_minutes: 10, // 10 minutes
            max_attempts: 3,
            max_requests_per_hour: 5,
        }
    }
}

/// OTP repository for database operations
#[derive(Debug, Clone)]
pub struct OtpRepository {
    pool: PgPool,
    config: OtpConfig,
    argon2: Argon2<'static>,
}

impl OtpRepository {
    pub fn new(pool: PgPool) -> Self {
        Self {
            pool,
            config: OtpConfig::default(),
            argon2: Argon2::default(),
        }
    }

    pub fn with_config(pool: PgPool, config: OtpConfig) -> Self {
        Self {
            pool,
            config,
            argon2: Argon2::default(),
        }
    }

    /// Generate a random OTP code
    fn generate_code(&self) -> String {
        let mut rng = rand::thread_rng();
        (0..self.config.code_length)
            .map(|_| rng.gen_range(0..10).to_string())
            .collect()
    }

    /// Hash OTP code using Argon2
    fn hash_code(&self, code: &str) -> Result<String> {
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = self.argon2
            .hash_password(code.as_bytes(), &salt)
            .context("Failed to hash OTP code")?;
        Ok(password_hash.to_string())
    }

    /// Verify OTP code against hash
    fn verify_code(&self, code: &str, hash: &str) -> Result<bool> {
        let parsed_hash = PasswordHash::new(hash)
            .context("Failed to parse password hash")?;
        
        match self.argon2.verify_password(code.as_bytes(), &parsed_hash) {
            Ok(()) => Ok(true),
            Err(_) => Ok(false),
        }
    }

    /// Check rate limiting for OTP requests
    #[instrument(skip(self))]
    async fn check_rate_limit(&self, email: &str) -> Result<bool> {
        debug!(email = %email, "Checking OTP rate limit");

        let one_hour_ago = Utc::now() - Duration::hours(1);
        
        let count: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM otp_codes WHERE email = $1 AND created_at > $2"
        )
        .bind(email)
        .bind(one_hour_ago)
        .fetch_one(&self.pool)
        .await?;

        let within_limit = count.0 < self.config.max_requests_per_hour as i64;
        
        if !within_limit {
            warn!(
                email = %email,
                requests_in_hour = count.0,
                max_allowed = self.config.max_requests_per_hour,
                "Rate limit exceeded for OTP requests"
            );
        }

        Ok(within_limit)
    }

    /// Send OTP code (create and store in database)
    #[instrument(skip(self), fields(email = %request.email))]
    pub async fn send_otp(&self, request: SendOtpRequest) -> Result<String> {
        debug!("Sending OTP code to email");

        // Check rate limiting
        if !self.check_rate_limit(&request.email).await? {
            return Err(anyhow::anyhow!("Rate limit exceeded. Too many OTP requests for this email."));
        }

        // Invalidate any existing unused OTP codes for this email
        sqlx::query(
            "UPDATE otp_codes SET is_used = true WHERE email = $1 AND is_used = false AND expires_at > NOW()"
        )
        .bind(&request.email)
        .execute(&self.pool)
        .await?;

        // Generate new OTP code
        let code = self.generate_code();
        let code_hash = self.hash_code(&code)?;
        let expires_at = Utc::now() + Duration::minutes(self.config.expires_minutes);

        // Check if user exists
        let user_id: Option<Uuid> = sqlx::query_scalar(
            "SELECT id FROM users WHERE email = $1"
        )
        .bind(&request.email)
        .fetch_optional(&self.pool)
        .await?;

        // Store OTP in database
        let otp = sqlx::query_as::<_, OtpCode>(
            r#"
            INSERT INTO otp_codes (email, code, code_hash, expires_at, max_attempts, user_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
            "#,
        )
        .bind(&request.email)
        .bind(&code)
        .bind(&code_hash)
        .bind(expires_at)
        .bind(self.config.max_attempts)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        info!(
            otp_id = %otp.id,
            email = %request.email,
            expires_at = %expires_at,
            user_exists = user_id.is_some(),
            "Successfully created OTP code"
        );

        Ok(code)
    }

    /// Verify OTP code
    #[instrument(skip(self), fields(email = %request.email))]
    pub async fn verify_otp(&self, request: VerifyOtpRequest) -> Result<OtpVerificationResult> {
        debug!("Verifying OTP code");

        // Find the most recent unused OTP for this email
        let otp = sqlx::query_as::<_, OtpCode>(
            r#"
            SELECT * FROM otp_codes 
            WHERE email = $1 AND is_used = false AND expires_at > NOW()
            ORDER BY created_at DESC
            LIMIT 1
            "#,
        )
        .bind(&request.email)
        .fetch_optional(&self.pool)
        .await?;

        let mut otp = match otp {
            Some(otp) => otp,
            None => {
                warn!(email = %request.email, "No valid OTP found");
                return Ok(OtpVerificationResult {
                    success: false,
                    user_id: None,
                    is_new_user: false,
                    attempts_remaining: 0,
                });
            }
        };

        // Check if max attempts exceeded
        if otp.attempts >= otp.max_attempts {
            warn!(
                otp_id = %otp.id,
                email = %request.email,
                attempts = otp.attempts,
                "Max OTP verification attempts exceeded"
            );
            
            // Mark as used to prevent further attempts
            sqlx::query("UPDATE otp_codes SET is_used = true WHERE id = $1")
                .bind(otp.id)
                .execute(&self.pool)
                .await?;

            return Ok(OtpVerificationResult {
                success: false,
                user_id: None,
                is_new_user: false,
                attempts_remaining: 0,
            });
        }

        // Increment attempts
        otp.attempts += 1;
        sqlx::query("UPDATE otp_codes SET attempts = $1 WHERE id = $2")
            .bind(otp.attempts)
            .bind(otp.id)
            .execute(&self.pool)
            .await?;

        // Verify the code
        let is_valid = self.verify_code(&request.code, &otp.code_hash)?;

        if !is_valid {
            warn!(
                otp_id = %otp.id,
                email = %request.email,
                attempts = otp.attempts,
                "Invalid OTP code provided"
            );

            return Ok(OtpVerificationResult {
                success: false,
                user_id: otp.user_id,
                is_new_user: false,
                attempts_remaining: otp.max_attempts - otp.attempts,
            });
        }

        // Mark OTP as used
        sqlx::query("UPDATE otp_codes SET is_used = true WHERE id = $1")
            .bind(otp.id)
            .execute(&self.pool)
            .await?;

        // Determine if this is a new user
        let is_new_user = otp.user_id.is_none();

        info!(
            otp_id = %otp.id,
            email = %request.email,
            user_id = ?otp.user_id,
            is_new_user = is_new_user,
            "Successfully verified OTP code"
        );

        Ok(OtpVerificationResult {
            success: true,
            user_id: otp.user_id,
            is_new_user,
            attempts_remaining: otp.max_attempts - otp.attempts,
        })
    }

    /// Clean up expired OTP codes
    #[instrument(skip(self))]
    pub async fn cleanup_expired_codes(&self) -> Result<u64> {
        debug!("Cleaning up expired OTP codes");

        let result = sqlx::query(
            "DELETE FROM otp_codes WHERE expires_at < NOW() - INTERVAL '24 hours'"
        )
        .execute(&self.pool)
        .await?;

        let deleted_count = result.rows_affected();
        
        if deleted_count > 0 {
            info!(deleted_count = deleted_count, "Cleaned up expired OTP codes");
        }

        Ok(deleted_count)
    }

    /// Get OTP statistics for monitoring
    #[instrument(skip(self))]
    pub async fn get_otp_stats(&self) -> Result<serde_json::Value> {
        debug!("Fetching OTP statistics");

        // Total OTPs in last 24 hours
        let total_24h: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM otp_codes WHERE created_at > NOW() - INTERVAL '24 hours'"
        )
        .fetch_one(&self.pool)
        .await?;

        // Successful verifications in last 24 hours
        let successful_24h: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM otp_codes WHERE created_at > NOW() - INTERVAL '24 hours' AND is_used = true"
        )
        .fetch_one(&self.pool)
        .await?;

        // Failed attempts (exceeded max attempts) in last 24 hours
        let failed_24h: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM otp_codes WHERE created_at > NOW() - INTERVAL '24 hours' AND attempts >= max_attempts AND is_used = false"
        )
        .fetch_one(&self.pool)
        .await?;

        let stats = serde_json::json!({
            "total_otps_24h": total_24h.0,
            "successful_verifications_24h": successful_24h.0,
            "failed_attempts_24h": failed_24h.0,
            "success_rate_24h": if total_24h.0 > 0 { 
                (successful_24h.0 as f64 / total_24h.0 as f64) * 100.0 
            } else { 
                0.0 
            }
        });

        debug!(stats = %stats, "Retrieved OTP statistics");
        Ok(stats)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_otp_config_default() {
        let config = OtpConfig::default();
        assert_eq!(config.code_length, 6);
        assert_eq!(config.expires_minutes, 10);
        assert_eq!(config.max_attempts, 3);
        assert_eq!(config.max_requests_per_hour, 5);
    }

    #[test]
    fn test_generate_code_length() {
        // Test code generation without needing database
        let config = OtpConfig::default();
        let argon2 = Argon2::default();
        
        // Test code generation logic
        let mut rng = rand::thread_rng();
        let code: String = (0..config.code_length)
            .map(|_| rng.gen_range(0..10).to_string())
            .collect();
        
        assert_eq!(code.len(), 6);
        assert!(code.chars().all(|c| c.is_ascii_digit()));
    }

    #[test]
    fn test_hash_and_verify_code_logic() {
        use argon2::password_hash::{rand_core::OsRng, SaltString};
        
        let argon2 = Argon2::default();
        let code = "123456";
        
        // Test hashing
        let salt = SaltString::generate(&mut OsRng);
        let password_hash = argon2
            .hash_password(code.as_bytes(), &salt)
            .unwrap();
        let hash = password_hash.to_string();
        
        // Test verification
        let parsed_hash = PasswordHash::new(&hash).unwrap();
        assert!(argon2.verify_password(code.as_bytes(), &parsed_hash).is_ok());
        assert!(argon2.verify_password("654321".as_bytes(), &parsed_hash).is_err());
    }
}