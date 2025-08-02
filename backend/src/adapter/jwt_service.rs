use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashSet;
use tracing::{debug, error, info, instrument, warn};
use uuid::Uuid;

/// JWT configuration for token management
#[derive(Debug, Clone)]
pub struct JwtConfig {
    pub secret: String,
    pub algorithm: Algorithm,
    pub access_token_expiry: Duration,
    pub refresh_token_expiry: Duration,
    pub issuer: String,
    pub audience: String,
}

impl JwtConfig {
    /// Create JWT configuration from environment variables
    pub fn from_env() -> Result<Self> {
        let secret = std::env::var("JWT_SECRET")
            .context("JWT_SECRET environment variable is required")?;
        
        if secret.len() < 32 {
            return Err(anyhow!("JWT_SECRET must be at least 32 characters long"));
        }

        let algorithm = std::env::var("JWT_ALGORITHM")
            .unwrap_or_else(|_| "HS256".to_string())
            .parse::<Algorithm>()
            .context("Invalid JWT_ALGORITHM value")?;

        let access_token_hours = std::env::var("JWT_ACCESS_TOKEN_EXPIRY_HOURS")
            .unwrap_or_else(|_| "1".to_string())
            .parse::<i64>()
            .context("Invalid JWT_ACCESS_TOKEN_EXPIRY_HOURS value")?;

        let refresh_token_days = std::env::var("JWT_REFRESH_TOKEN_EXPIRY_DAYS")
            .unwrap_or_else(|_| "30".to_string())
            .parse::<i64>()
            .context("Invalid JWT_REFRESH_TOKEN_EXPIRY_DAYS value")?;

        let issuer = std::env::var("JWT_ISSUER")
            .unwrap_or_else(|_| "origin-backend".to_string());

        let audience = std::env::var("JWT_AUDIENCE")
            .unwrap_or_else(|_| "origin-frontend".to_string());

        Ok(Self {
            secret,
            algorithm,
            access_token_expiry: Duration::hours(access_token_hours),
            refresh_token_expiry: Duration::days(refresh_token_days),
            issuer,
            audience,
        })
    }
}

/// JWT claims for access tokens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessTokenClaims {
    pub sub: String,        // Subject (user ID)
    pub email: String,      // User email
    pub name: String,       // User display name
    pub google_id: String,  // Google OAuth ID
    pub session_id: String, // Session ID for revocation
    pub iss: String,        // Issuer
    pub aud: String,        // Audience
    pub iat: i64,           // Issued at
    pub exp: i64,           // Expires at
    pub jti: String,        // JWT ID (unique identifier)
    pub token_type: String, // "access"
}

/// JWT claims for refresh tokens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RefreshTokenClaims {
    pub sub: String,        // Subject (user ID)
    pub session_id: String, // Session ID for revocation
    pub iss: String,        // Issuer
    pub aud: String,        // Audience
    pub iat: i64,           // Issued at
    pub exp: i64,           // Expires at
    pub jti: String,        // JWT ID (unique identifier)
    pub token_type: String, // "refresh"
}

/// Token pair containing access and refresh tokens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub access_token_expires_at: DateTime<Utc>,
    pub refresh_token_expires_at: DateTime<Utc>,
    pub token_type: String, // "Bearer"
}

/// JWT service for token generation and validation
#[derive(Debug, Clone)]
pub struct JwtService {
    config: JwtConfig,
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    validation: Validation,
}

impl JwtService {
    /// Create a new JWT service
    pub fn new(config: JwtConfig) -> Result<Self> {
        let encoding_key = EncodingKey::from_secret(config.secret.as_bytes());
        let decoding_key = DecodingKey::from_secret(config.secret.as_bytes());
        
        let mut validation = Validation::new(config.algorithm);
        validation.set_issuer(&[config.issuer.clone()]);
        validation.set_audience(&[config.audience.clone()]);
        validation.validate_exp = true;
        validation.validate_nbf = false; // We don't use nbf
        validation.leeway = 60; // 1 minute leeway for clock skew

        Ok(Self {
            config,
            encoding_key,
            decoding_key,
            validation,
        })
    }

    /// Create JWT service from environment variables
    pub fn from_env() -> Result<Self> {
        let config = JwtConfig::from_env()?;
        Self::new(config)
    }

    /// Generate a token pair (access + refresh) for a user
    #[instrument(skip(self), fields(user_id = %user_id, session_id = %session_id))]
    pub fn generate_token_pair(
        &self,
        user_id: Uuid,
        email: &str,
        name: &str,
        google_id: &str,
        session_id: Uuid,
    ) -> Result<TokenPair> {
        debug!("Generating JWT token pair");

        let now = Utc::now();
        let access_expires_at = now + self.config.access_token_expiry;
        let refresh_expires_at = now + self.config.refresh_token_expiry;

        // Generate access token
        let access_claims = AccessTokenClaims {
            sub: user_id.to_string(),
            email: email.to_string(),
            name: name.to_string(),
            google_id: google_id.to_string(),
            session_id: session_id.to_string(),
            iss: self.config.issuer.clone(),
            aud: self.config.audience.clone(),
            iat: now.timestamp(),
            exp: access_expires_at.timestamp(),
            jti: Uuid::new_v4().to_string(),
            token_type: "access".to_string(),
        };

        let access_token = encode(
            &Header::new(self.config.algorithm),
            &access_claims,
            &self.encoding_key,
        )
        .context("Failed to encode access token")?;

        // Generate refresh token
        let refresh_claims = RefreshTokenClaims {
            sub: user_id.to_string(),
            session_id: session_id.to_string(),
            iss: self.config.issuer.clone(),
            aud: self.config.audience.clone(),
            iat: now.timestamp(),
            exp: refresh_expires_at.timestamp(),
            jti: Uuid::new_v4().to_string(),
            token_type: "refresh".to_string(),
        };

        let refresh_token = encode(
            &Header::new(self.config.algorithm),
            &refresh_claims,
            &self.encoding_key,
        )
        .context("Failed to encode refresh token")?;

        let token_pair = TokenPair {
            access_token,
            refresh_token,
            access_token_expires_at,
            refresh_token_expires_at,
            token_type: "Bearer".to_string(),
        };

        info!(
            user_id = %user_id,
            session_id = %session_id,
            access_expires_at = %access_expires_at,
            refresh_expires_at = %refresh_expires_at,
            "Successfully generated token pair"
        );

        Ok(token_pair)
    }

    /// Validate and decode an access token
    #[instrument(skip(self, token))]
    pub fn validate_access_token(&self, token: &str) -> Result<AccessTokenClaims> {
        debug!("Validating access token");

        let token_data = decode::<AccessTokenClaims>(token, &self.decoding_key, &self.validation)
            .context("Failed to decode access token")?;

        let claims = token_data.claims;

        // Verify token type
        if claims.token_type != "access" {
            return Err(anyhow!("Invalid token type: expected 'access', got '{}'", claims.token_type));
        }

        debug!(
            user_id = %claims.sub,
            session_id = %claims.session_id,
            expires_at = %DateTime::<Utc>::from_timestamp(claims.exp, 0).unwrap_or_default(),
            "Successfully validated access token"
        );

        Ok(claims)
    }

    /// Validate and decode a refresh token
    #[instrument(skip(self, token))]
    pub fn validate_refresh_token(&self, token: &str) -> Result<RefreshTokenClaims> {
        debug!("Validating refresh token");

        let token_data = decode::<RefreshTokenClaims>(token, &self.decoding_key, &self.validation)
            .context("Failed to decode refresh token")?;

        let claims = token_data.claims;

        // Verify token type
        if claims.token_type != "refresh" {
            return Err(anyhow!("Invalid token type: expected 'refresh', got '{}'", claims.token_type));
        }

        debug!(
            user_id = %claims.sub,
            session_id = %claims.session_id,
            expires_at = %DateTime::<Utc>::from_timestamp(claims.exp, 0).unwrap_or_default(),
            "Successfully validated refresh token"
        );

        Ok(claims)
    }

    /// Generate a new access token from a refresh token
    #[instrument(skip(self, refresh_token), fields(refresh_jti = %refresh_claims.jti))]
    pub fn refresh_access_token(
        &self,
        refresh_claims: &RefreshTokenClaims,
        email: &str,
        name: &str,
        google_id: &str,
    ) -> Result<String> {
        debug!("Generating new access token from refresh token");

        let now = Utc::now();
        let expires_at = now + self.config.access_token_expiry;

        let access_claims = AccessTokenClaims {
            sub: refresh_claims.sub.clone(),
            email: email.to_string(),
            name: name.to_string(),
            google_id: google_id.to_string(),
            session_id: refresh_claims.session_id.clone(),
            iss: self.config.issuer.clone(),
            aud: self.config.audience.clone(),
            iat: now.timestamp(),
            exp: expires_at.timestamp(),
            jti: Uuid::new_v4().to_string(),
            token_type: "access".to_string(),
        };

        let access_token = encode(
            &Header::new(self.config.algorithm),
            &access_claims,
            &self.encoding_key,
        )
        .context("Failed to encode refreshed access token")?;

        info!(
            user_id = %refresh_claims.sub,
            session_id = %refresh_claims.session_id,
            new_expires_at = %expires_at,
            "Successfully generated new access token from refresh"
        );

        Ok(access_token)
    }

    /// Generate token hash for secure storage
    #[instrument(skip(self, token))]
    pub fn hash_token(&self, token: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(token.as_bytes());
        hasher.update(self.config.secret.as_bytes()); // Salt with secret
        let result = hasher.finalize();
        format!("{:x}", result)
    }

    /// Extract user ID from token without full validation (for logging)
    pub fn extract_user_id_unsafe(&self, token: &str) -> Option<String> {
        // This is unsafe and should only be used for logging/debugging
        let parts: Vec<&str> = token.split('.').collect();
        if parts.len() != 3 {
            return None;
        }

        let payload = parts[1];
        if let Ok(decoded) = base64::decode_config(payload, base64::URL_SAFE_NO_PAD) {
            if let Ok(claims) = serde_json::from_slice::<serde_json::Value>(&decoded) {
                return claims.get("sub").and_then(|v| v.as_str()).map(|s| s.to_string());
            }
        }

        None
    }

    /// Check if token is expired without full validation
    pub fn is_token_expired(&self, token: &str) -> bool {
        let parts: Vec<&str> = token.split('.').collect();
        if parts.len() != 3 {
            return true;
        }

        let payload = parts[1];
        if let Ok(decoded) = base64::decode_config(payload, base64::URL_SAFE_NO_PAD) {
            if let Ok(claims) = serde_json::from_slice::<serde_json::Value>(&decoded) {
                if let Some(exp) = claims.get("exp").and_then(|v| v.as_i64()) {
                    return Utc::now().timestamp() > exp;
                }
            }
        }

        true // If we can't parse it, consider it expired
    }

    /// Get token expiration time
    pub fn get_token_expiry(&self, token: &str) -> Option<DateTime<Utc>> {
        let parts: Vec<&str> = token.split('.').collect();
        if parts.len() != 3 {
            return None;
        }

        let payload = parts[1];
        if let Ok(decoded) = base64::decode_config(payload, base64::URL_SAFE_NO_PAD) {
            if let Ok(claims) = serde_json::from_slice::<serde_json::Value>(&decoded) {
                if let Some(exp) = claims.get("exp").and_then(|v| v.as_i64()) {
                    return DateTime::from_timestamp(exp, 0);
                }
            }
        }

        None
    }

    /// Validate token format without signature verification (for basic checks)
    pub fn validate_token_format(&self, token: &str) -> bool {
        let parts: Vec<&str> = token.split('.').collect();
        parts.len() == 3 && 
        parts.iter().all(|part| !part.is_empty()) &&
        parts.iter().all(|part| base64::decode_config(part, base64::URL_SAFE_NO_PAD).is_ok())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_config() -> JwtConfig {
        JwtConfig {
            secret: "test_secret_that_is_at_least_32_characters_long_for_security".to_string(),
            algorithm: Algorithm::HS256,
            access_token_expiry: Duration::hours(1),
            refresh_token_expiry: Duration::days(30),
            issuer: "test_issuer".to_string(),
            audience: "test_audience".to_string(),
        }
    }

    #[test]
    fn test_generate_and_validate_token_pair() {
        let config = test_config();
        let jwt_service = JwtService::new(config).unwrap();

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let email = "test@example.com";
        let name = "Test User";
        let google_id = "google123";

        // Generate token pair
        let token_pair = jwt_service
            .generate_token_pair(user_id, email, name, google_id, session_id)
            .unwrap();

        assert!(!token_pair.access_token.is_empty());
        assert!(!token_pair.refresh_token.is_empty());
        assert_eq!(token_pair.token_type, "Bearer");

        // Validate access token
        let access_claims = jwt_service.validate_access_token(&token_pair.access_token).unwrap();
        assert_eq!(access_claims.sub, user_id.to_string());
        assert_eq!(access_claims.email, email);
        assert_eq!(access_claims.name, name);
        assert_eq!(access_claims.google_id, google_id);
        assert_eq!(access_claims.session_id, session_id.to_string());
        assert_eq!(access_claims.token_type, "access");

        // Validate refresh token
        let refresh_claims = jwt_service.validate_refresh_token(&token_pair.refresh_token).unwrap();
        assert_eq!(refresh_claims.sub, user_id.to_string());
        assert_eq!(refresh_claims.session_id, session_id.to_string());
        assert_eq!(refresh_claims.token_type, "refresh");
    }

    #[test]
    fn test_refresh_access_token() {
        let config = test_config();
        let jwt_service = JwtService::new(config).unwrap();

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let email = "test@example.com";
        let name = "Test User";
        let google_id = "google123";

        // Generate initial token pair
        let token_pair = jwt_service
            .generate_token_pair(user_id, email, name, google_id, session_id)
            .unwrap();

        // Validate refresh token
        let refresh_claims = jwt_service.validate_refresh_token(&token_pair.refresh_token).unwrap();

        // Generate new access token
        let new_access_token = jwt_service
            .refresh_access_token(&refresh_claims, email, name, google_id)
            .unwrap();

        // Validate new access token
        let new_access_claims = jwt_service.validate_access_token(&new_access_token).unwrap();
        assert_eq!(new_access_claims.sub, user_id.to_string());
        assert_eq!(new_access_claims.email, email);
        assert_eq!(new_access_claims.session_id, session_id.to_string());

        // JTI should be different
        let original_access_claims = jwt_service.validate_access_token(&token_pair.access_token).unwrap();
        assert_ne!(new_access_claims.jti, original_access_claims.jti);
    }

    #[test]
    fn test_token_hashing() {
        let config = test_config();
        let jwt_service = JwtService::new(config).unwrap();

        let token = "test.token.here";
        let hash1 = jwt_service.hash_token(token);
        let hash2 = jwt_service.hash_token(token);

        // Same token should produce same hash
        assert_eq!(hash1, hash2);

        // Different tokens should produce different hashes
        let different_token = "different.token.here";
        let hash3 = jwt_service.hash_token(different_token);
        assert_ne!(hash1, hash3);

        // Hash should be fixed length (SHA-256 = 64 hex chars)
        assert_eq!(hash1.len(), 64);
    }

    #[test]
    fn test_token_format_validation() {
        let config = test_config();
        let jwt_service = JwtService::new(config).unwrap();

        // Valid format
        let valid_token = "header.payload.signature";
        assert!(jwt_service.validate_token_format(valid_token));

        // Invalid formats
        assert!(!jwt_service.validate_token_format(""));
        assert!(!jwt_service.validate_token_format("just.two.parts"));
        assert!(!jwt_service.validate_token_format("too.many.parts.here"));
        assert!(!jwt_service.validate_token_format("invalid..signature"));
    }

    #[test]
    fn test_invalid_token_validation() {
        let config = test_config();
        let jwt_service = JwtService::new(config).unwrap();

        // Invalid token should fail validation
        let invalid_token = "invalid.token.here";
        assert!(jwt_service.validate_access_token(invalid_token).is_err());
        assert!(jwt_service.validate_refresh_token(invalid_token).is_err());
    }

    #[test]
    fn test_wrong_token_type_validation() {
        let config = test_config();
        let jwt_service = JwtService::new(config).unwrap();

        let user_id = Uuid::new_v4();
        let session_id = Uuid::new_v4();
        let email = "test@example.com";
        let name = "Test User";
        let google_id = "google123";

        let token_pair = jwt_service
            .generate_token_pair(user_id, email, name, google_id, session_id)
            .unwrap();

        // Try to validate access token as refresh token (should fail)
        assert!(jwt_service.validate_refresh_token(&token_pair.access_token).is_err());

        // Try to validate refresh token as access token (should fail)
        assert!(jwt_service.validate_access_token(&token_pair.refresh_token).is_err());
    }
}