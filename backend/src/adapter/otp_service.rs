use super::otp::{OtpManager, OtpConfig};
use super::ses::SESClient;
use anyhow::Result;
use tracing::{info, instrument};

/// High-level OTP service that combines OTP generation with email sending
pub struct OtpService {
    otp_manager: OtpManager,
    ses_client: SESClient,
}

impl OtpService {
    /// Create a new OTP service
    pub fn new(otp_manager: OtpManager, ses_client: SESClient) -> Self {
        Self {
            otp_manager,
            ses_client,
        }
    }

    /// Send an OTP login email to a user
    #[instrument(skip(self))]
    pub async fn send_otp_login(
        &self,
        email: &str,
        user_name: Option<String>,
        user_id: Option<String>,
    ) -> Result<String> {
        // Generate OTP
        let otp_entry = self.otp_manager
            .generate_otp(email, user_id)
            .map_err(|e| anyhow::anyhow!("Failed to generate OTP: {}", e))?;

        // Send email
        let email_response = self.ses_client
            .send_otp_login_email(
                email,
                &otp_entry.code,
                user_name,
                Some(self.otp_manager.config().expires_minutes),
            )
            .await?;

        info!(
            email = %email,
            message_id = %email_response.message_id,
            code_length = otp_entry.code.len(),
            expires_minutes = self.otp_manager.config().expires_minutes,
            "OTP login email sent successfully"
        );

        Ok(email_response.message_id)
    }

    /// Verify an OTP code
    #[instrument(skip(self))]
    pub fn verify_otp(&self, email: &str, submitted_code: &str) -> Result<bool> {
        self.otp_manager
            .verify_otp(email, submitted_code)
            .map_err(|e| anyhow::anyhow!("OTP verification failed: {}", e))
    }

    /// Get OTP status for debugging/monitoring
    #[instrument(skip(self))]
    pub fn get_otp_status(&self, email: &str) -> Option<super::otp::OtpStatus> {
        self.otp_manager.get_otp_status(email)
    }

    /// Clean up expired OTPs
    #[instrument(skip(self))]
    pub fn cleanup_expired(&self) -> usize {
        self.otp_manager.cleanup_expired()
    }
}

/// Example usage function showing how to set up and use the OTP service
#[allow(dead_code)]
pub async fn example_otp_usage() -> Result<()> {
    use super::ses::SESConfig;

    // Set up SES client
    let ses_config = SESConfig {
        region: "us-east-1".to_string(),
        default_sender: "noreply@yourdomain.com".to_string(),
        default_sender_name: Some("Origin Security Team".to_string()),
        reply_to: Some("support@yourdomain.com".to_string()),
        configuration_set: Some("origin-email-tracking".to_string()),
    };
    let ses_client = SESClient::new(ses_config).await?;

    // Set up OTP manager
    let otp_config = OtpConfig {
        code_length: 6,
        expires_minutes: 5,
        max_attempts: 3,
    };
    let otp_manager = OtpManager::with_config(otp_config);

    // Create OTP service
    let otp_service = OtpService::new(otp_manager, ses_client);

    // Example: Send OTP login email
    let message_id = otp_service
        .send_otp_login(
            "user@example.com",
            Some("John Doe".to_string()),
            Some("user_123".to_string()),
        )
        .await?;

    info!(message_id = %message_id, "OTP email sent");

    // Example: Verify OTP (this would typically happen when user submits the form)
    let is_valid = otp_service.verify_otp("user@example.com", "123456")?;
    
    if is_valid {
        info!("OTP verification successful - user can proceed with login");
    } else {
        info!("OTP verification failed - show error to user");
    }

    // Example: Check OTP status
    if let Some(status) = otp_service.get_otp_status("user@example.com") {
        info!(
            attempts = status.attempts,
            max_attempts = status.max_attempts,
            used = status.used,
            expired = status.expired,
            time_remaining = ?status.time_remaining_seconds,
            "OTP status"
        );
    }

    // Example: Cleanup expired OTPs (run this periodically)
    let removed_count = otp_service.cleanup_expired();
    info!(removed_count = removed_count, "Cleaned up expired OTPs");

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::adapter::ses::SESConfig;

    // Note: These tests require AWS credentials and SES setup
    // They are integration tests and should be run with proper AWS configuration
    
    #[tokio::test]
    #[ignore] // Ignore by default to avoid requiring AWS setup in CI
    async fn test_otp_service_integration() {
        let ses_config = SESConfig {
            region: "us-east-1".to_string(),
            default_sender: "test@example.com".to_string(),
            default_sender_name: Some("Test Sender".to_string()),
            reply_to: None,
            configuration_set: None,
        };

        let ses_client = SESClient::new(ses_config).await.unwrap();
        let otp_manager = OtpManager::new();
        let otp_service = OtpService::new(otp_manager, ses_client);

        // This would send an actual email if AWS is configured
        // let _message_id = otp_service
        //     .send_otp_login("test@example.com", Some("Test User".to_string()), None)
        //     .await
        //     .unwrap();
        
        // Test OTP verification logic
        let is_valid = otp_service.verify_otp("nonexistent@example.com", "123456");
        assert!(is_valid.is_err()); // Should fail for non-existent email
    }
}