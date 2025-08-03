use rand::Rng;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
use tracing::{debug, info, instrument};

/// Configuration for OTP generation and validation
#[derive(Debug, Clone)]
pub struct OtpConfig {
    /// Length of the OTP code (default: 6)
    pub code_length: usize,
    /// Expiration time in minutes (default: 5)
    pub expires_minutes: u32,
    /// Maximum number of attempts allowed (default: 3)
    pub max_attempts: u32,
}

impl Default for OtpConfig {
    fn default() -> Self {
        Self {
            code_length: 6,
            expires_minutes: 5,
            max_attempts: 3,
        }
    }
}

/// OTP entry stored in cache/database
#[derive(Debug, Clone)]
pub struct OtpEntry {
    /// The OTP code
    pub code: String,
    /// Email address this OTP was sent to
    pub email: String,
    /// When the OTP was created (Unix timestamp)
    pub created_at: u64,
    /// When the OTP expires (Unix timestamp)
    pub expires_at: u64,
    /// Number of failed attempts
    pub attempts: u32,
    /// Whether the OTP has been used
    pub used: bool,
    /// Optional user identifier
    pub user_id: Option<String>,
}

/// In-memory OTP storage (for demonstration - use Redis or database in production)
pub struct OtpManager {
    config: OtpConfig,
    storage: std::sync::RwLock<HashMap<String, OtpEntry>>,
}

impl OtpManager {
    /// Create a new OTP manager with default configuration
    pub fn new() -> Self {
        Self {
            config: OtpConfig::default(),
            storage: std::sync::RwLock::new(HashMap::new()),
        }
    }

    /// Create a new OTP manager with custom configuration
    pub fn with_config(config: OtpConfig) -> Self {
        Self {
            config,
            storage: std::sync::RwLock::new(HashMap::new()),
        }
    }

    /// Generate a new OTP code for an email address
    #[instrument(skip(self))]
    pub fn generate_otp(&self, email: &str, user_id: Option<String>) -> Result<OtpEntry, String> {
        let code = self.generate_numeric_code();
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("System time error: {}", e))?
            .as_secs();

        let expires_at = now + (self.config.expires_minutes as u64 * 60);

        let otp_entry = OtpEntry {
            code: code.clone(),
            email: email.to_string(),
            created_at: now,
            expires_at,
            attempts: 0,
            used: false,
            user_id,
        };

        // Store the OTP (using email as key)
        {
            let mut storage = self.storage.write().unwrap();
            storage.insert(email.to_string(), otp_entry.clone());
        }

        info!(
            email = %email,
            code_length = self.config.code_length,
            expires_minutes = self.config.expires_minutes,
            "Generated new OTP code"
        );

        Ok(otp_entry)
    }

    /// Verify an OTP code for an email address
    #[instrument(skip(self))]
    pub fn verify_otp(&self, email: &str, submitted_code: &str) -> Result<bool, String> {
        let mut storage = self.storage.write().unwrap();
        
        let otp_entry = storage.get_mut(email)
            .ok_or_else(|| "No OTP found for this email address".to_string())?;

        // Check if already used
        if otp_entry.used {
            debug!(email = %email, "OTP already used");
            return Ok(false);
        }

        // Check if expired
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_err(|e| format!("System time error: {}", e))?
            .as_secs();

        if now > otp_entry.expires_at {
            debug!(email = %email, "OTP expired");
            return Ok(false);
        }

        // Check if too many attempts
        if otp_entry.attempts >= self.config.max_attempts {
            debug!(email = %email, attempts = otp_entry.attempts, "Too many OTP attempts");
            return Ok(false);
        }

        // Increment attempts
        otp_entry.attempts += 1;

        // Verify the code
        if otp_entry.code == submitted_code {
            otp_entry.used = true;
            info!(
                email = %email,
                attempts = otp_entry.attempts,
                "OTP verified successfully"
            );
            Ok(true)
        } else {
            debug!(
                email = %email,
                attempts = otp_entry.attempts,
                max_attempts = self.config.max_attempts,
                "Invalid OTP code submitted"
            );
            Ok(false)
        }
    }

    /// Remove expired OTPs from storage (cleanup)
    #[instrument(skip(self))]
    pub fn cleanup_expired(&self) -> usize {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let mut storage = self.storage.write().unwrap();
        let initial_count = storage.len();
        
        storage.retain(|_, otp| now <= otp.expires_at);
        
        let removed_count = initial_count - storage.len();
        
        if removed_count > 0 {
            info!(removed_count = removed_count, "Cleaned up expired OTP codes");
        }
        
        removed_count
    }

    /// Get OTP status for an email (for debugging/admin purposes)
    #[instrument(skip(self))]
    pub fn get_otp_status(&self, email: &str) -> Option<OtpStatus> {
        let storage = self.storage.read().unwrap();
        
        storage.get(email).map(|otp| {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();

            OtpStatus {
                email: otp.email.clone(),
                created_at: otp.created_at,
                expires_at: otp.expires_at,
                attempts: otp.attempts,
                max_attempts: self.config.max_attempts,
                used: otp.used,
                expired: now > otp.expires_at,
                time_remaining_seconds: if now < otp.expires_at { 
                    Some(otp.expires_at - now) 
                } else { 
                    None 
                },
            }
        })
    }

    /// Generate a numeric code of specified length
    fn generate_numeric_code(&self) -> String {
        let mut rng = rand::thread_rng();
        (0..self.config.code_length)
            .map(|_| rng.gen_range(0..10).to_string())
            .collect()
    }

    /// Get configuration
    pub fn config(&self) -> &OtpConfig {
        &self.config
    }
}

/// OTP status information for monitoring/debugging
#[derive(Debug, Clone)]
pub struct OtpStatus {
    pub email: String,
    pub created_at: u64,
    pub expires_at: u64,
    pub attempts: u32,
    pub max_attempts: u32,
    pub used: bool,
    pub expired: bool,
    pub time_remaining_seconds: Option<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::thread::sleep;
    use std::time::Duration;

    #[test]
    fn test_otp_generation() {
        let manager = OtpManager::new();
        let otp = manager.generate_otp("test@example.com", None).unwrap();
        
        assert_eq!(otp.email, "test@example.com");
        assert_eq!(otp.code.len(), 6);
        assert!(otp.code.chars().all(|c| c.is_ascii_digit()));
        assert!(!otp.used);
        assert_eq!(otp.attempts, 0);
    }

    #[test]
    fn test_otp_verification_success() {
        let manager = OtpManager::new();
        let otp = manager.generate_otp("test@example.com", None).unwrap();
        
        let result = manager.verify_otp("test@example.com", &otp.code).unwrap();
        assert!(result);
    }

    #[test]
    fn test_otp_verification_failure() {
        let manager = OtpManager::new();
        manager.generate_otp("test@example.com", None).unwrap();
        
        let result = manager.verify_otp("test@example.com", "wrong_code").unwrap();
        assert!(!result);
    }

    #[test]
    fn test_otp_expiration() {
        let config = OtpConfig {
            code_length: 6,
            expires_minutes: 0, // Expire immediately
            max_attempts: 3,
        };
        
        let manager = OtpManager::with_config(config);
        let otp = manager.generate_otp("test@example.com", None).unwrap();
        
        // Sleep for a short time to ensure expiration
        sleep(Duration::from_millis(100));
        
        let result = manager.verify_otp("test@example.com", &otp.code).unwrap();
        assert!(!result);
    }

    #[test]
    fn test_max_attempts() {
        let config = OtpConfig {
            code_length: 6,
            expires_minutes: 5,
            max_attempts: 2,
        };
        
        let manager = OtpManager::with_config(config);
        let otp = manager.generate_otp("test@example.com", None).unwrap();
        
        // First wrong attempt
        let result1 = manager.verify_otp("test@example.com", "wrong1").unwrap();
        assert!(!result1);
        
        // Second wrong attempt
        let result2 = manager.verify_otp("test@example.com", "wrong2").unwrap();
        assert!(!result2);
        
        // Third attempt should fail even with correct code (max attempts exceeded)
        let result3 = manager.verify_otp("test@example.com", &otp.code).unwrap();
        assert!(!result3);
    }

    #[test]
    fn test_cleanup_expired() {
        let config = OtpConfig {
            code_length: 6,
            expires_minutes: 0, // Expire immediately
            max_attempts: 3,
        };
        
        let manager = OtpManager::with_config(config);
        manager.generate_otp("test1@example.com", None).unwrap();
        manager.generate_otp("test2@example.com", None).unwrap();
        
        // Sleep to ensure expiration
        sleep(Duration::from_millis(100));
        
        let removed = manager.cleanup_expired();
        assert_eq!(removed, 2);
    }
}