use anyhow::{Context, Result};
use chrono::{DateTime, Duration, Utc};
use deadpool_redis::Pool;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use tracing::{debug, error, info, instrument, warn};
use uuid::Uuid;

/// JWT claims for authentication tokens
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenClaims {
    /// Subject (user ID)
    pub sub: String,
    /// Issued at (timestamp)
    pub iat: i64,
    /// Expiration time (timestamp)
    pub exp: i64,
    /// Not before (timestamp)
    pub nbf: i64,
    /// Issuer
    pub iss: String,
    /// Audience
    pub aud: String,
    /// JWT ID (unique token identifier)
    pub jti: String,
    /// Token type ("access" or "refresh")
    pub token_type: String,
    /// User email
    pub email: String,
    /// User Google ID
    pub google_id: String,
}

/// JWT token pair (access + refresh)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenPair {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
    pub token_type: String,
}

/// Session information stored in Redis (simplified for Redis-only sessions)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionInfo {
    pub user_id: Uuid,
    pub google_id: String,
    pub email: String,
    pub refresh_token_jti: String,
    pub created_at: DateTime<Utc>,
    pub last_activity: DateTime<Utc>,
}

/// Configuration for JWT token management
#[derive(Debug, Clone)]
pub struct JwtConfig {
    /// Secret key for signing JWT tokens
    pub secret_key: String,
    /// Issuer name
    pub issuer: String,
    /// Audience name
    pub audience: String,
    /// Access token expiration time in minutes
    pub access_token_expires_minutes: i64,
    /// Refresh token expiration time in days
    pub refresh_token_expires_days: i64,
}

impl Default for JwtConfig {
    fn default() -> Self {
        Self {
            secret_key: "default-secret-change-in-production".to_string(),
            issuer: "auth-service".to_string(),
            audience: "api".to_string(),
            access_token_expires_minutes: 15, // 15 minutes
            refresh_token_expires_days: 30,   // 30 days
        }
    }
}

/// JWT token manager for creating and validating tokens
#[derive(Clone)]
pub struct JwtManager {
    config: JwtConfig,
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl JwtManager {
    /// Create a new JWT manager with the given configuration
    pub fn new(config: JwtConfig) -> Self {
        let encoding_key = EncodingKey::from_secret(config.secret_key.as_bytes());
        let decoding_key = DecodingKey::from_secret(config.secret_key.as_bytes());

        Self {
            config,
            encoding_key,
            decoding_key,
        }
    }

    /// Create JWT manager from environment variables
    pub fn from_env() -> Result<Self> {
        let config = JwtConfig {
            secret_key: std::env::var("JWT_SECRET_KEY")
                .context("JWT_SECRET_KEY environment variable not set")?,
            issuer: std::env::var("JWT_ISSUER")
                .unwrap_or_else(|_| "auth-service".to_string()),
            audience: std::env::var("JWT_AUDIENCE")
                .unwrap_or_else(|_| "api".to_string()),
            access_token_expires_minutes: std::env::var("JWT_ACCESS_TOKEN_EXPIRES_MINUTES")
                .unwrap_or_else(|_| "15".to_string())
                .parse()
                .unwrap_or(15),
            refresh_token_expires_days: std::env::var("JWT_REFRESH_TOKEN_EXPIRES_DAYS")
                .unwrap_or_else(|_| "30".to_string())
                .parse()
                .unwrap_or(30),
        };

        Ok(Self::new(config))
    }

    /// Generate a new token pair (access + refresh tokens)
    #[instrument(skip(self), fields(user_id = %user_id, email = %email))]
    pub fn generate_token_pair(
        &self,
        user_id: Uuid,
        email: &str,
        google_id: &str,
    ) -> Result<TokenPair> {
        debug!("Generating JWT token pair for user");

        let now = Utc::now();
        let access_token_exp = now + Duration::minutes(self.config.access_token_expires_minutes);
        let refresh_token_exp = now + Duration::days(self.config.refresh_token_expires_days);

        // Generate unique JTIs for both tokens
        let access_jti = Uuid::new_v4().to_string();
        let refresh_jti = Uuid::new_v4().to_string();

        // Create access token claims
        let access_claims = TokenClaims {
            sub: user_id.to_string(),
            iat: now.timestamp(),
            exp: access_token_exp.timestamp(),
            nbf: now.timestamp(),
            iss: self.config.issuer.clone(),
            aud: self.config.audience.clone(),
            jti: access_jti,
            token_type: "access".to_string(),
            email: email.to_string(),
            google_id: google_id.to_string(),
        };

        // Create refresh token claims
        let refresh_claims = TokenClaims {
            sub: user_id.to_string(),
            iat: now.timestamp(),
            exp: refresh_token_exp.timestamp(),
            nbf: now.timestamp(),
            iss: self.config.issuer.clone(),
            aud: self.config.audience.clone(),
            jti: refresh_jti,
            token_type: "refresh".to_string(),
            email: email.to_string(),
            google_id: google_id.to_string(),
        };

        // Encode tokens
        let header = Header::new(Algorithm::HS256);
        let access_token = encode(&header, &access_claims, &self.encoding_key)
            .context("Failed to encode access token")?;
        let refresh_token = encode(&header, &refresh_claims, &self.encoding_key)
            .context("Failed to encode refresh token")?;

        let token_pair = TokenPair {
            access_token,
            refresh_token,
            expires_in: self.config.access_token_expires_minutes * 60, // Convert to seconds
            token_type: "Bearer".to_string(),
        };

        info!(
            access_token_exp = %access_token_exp,
            refresh_token_exp = %refresh_token_exp,
            "Successfully generated JWT token pair"
        );

        Ok(token_pair)
    }

    /// Validate and decode a JWT token
    #[instrument(skip(self, token))]
    pub fn validate_token(&self, token: &str) -> Result<TokenClaims> {
        debug!("Validating JWT token");

        let mut validation = Validation::new(Algorithm::HS256);
        validation.set_issuer(&[self.config.issuer.clone()]);
        validation.set_audience(&[self.config.audience.clone()]);

        let token_data = decode::<TokenClaims>(token, &self.decoding_key, &validation)
            .context("Failed to decode JWT token")?;

        let claims = token_data.claims;

        // Check if token is expired
        let now = Utc::now().timestamp();
        if claims.exp < now {
            return Err(anyhow::anyhow!("Token has expired"));
        }

        // Check if token is not yet valid
        if claims.nbf > now {
            return Err(anyhow::anyhow!("Token is not yet valid"));
        }

        debug!(
            user_id = %claims.sub,
            token_type = %claims.token_type,
            jti = %claims.jti,
            "Successfully validated JWT token"
        );

        Ok(claims)
    }

    /// Extract token from Authorization header
    pub fn extract_token_from_header(auth_header: &str) -> Result<&str> {
        if !auth_header.starts_with("Bearer ") {
            return Err(anyhow::anyhow!("Invalid authorization header format"));
        }

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or_else(|| anyhow::anyhow!("Missing Bearer token"))?;

        if token.is_empty() {
            return Err(anyhow::anyhow!("Empty Bearer token"));
        }

        Ok(token)
    }

    /// Get the current configuration
    pub fn config(&self) -> &JwtConfig {
        &self.config
    }
}

/// Session manager for Redis-backed session storage using deadpool_redis
#[derive(Clone)]
pub struct SessionManager {
    redis_pool: Pool,
    session_ttl_seconds: u64,
}

impl SessionManager {
    /// Create a new session manager
    pub fn new(redis_url: &str, session_ttl_hours: u64) -> Result<Self> {
        let cfg = deadpool_redis::Config::from_url(redis_url);
        let redis_pool = cfg.create_pool(Some(deadpool_redis::Runtime::Tokio1))
            .context("Failed to create Redis connection pool")?;

        Ok(Self {
            redis_pool,
            session_ttl_seconds: session_ttl_hours * 3600,
        })
    }

    /// Create session manager from environment variables
    pub fn from_env() -> Result<Self> {
        let redis_url = std::env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://localhost:6379".to_string());
        let session_ttl_hours = std::env::var("SESSION_TTL_HOURS")
            .unwrap_or_else(|_| "24".to_string())
            .parse()
            .unwrap_or(24);

        Self::new(&redis_url, session_ttl_hours)
    }

    /// Store session information in Redis
    #[instrument(skip(self), fields(user_id = %session.user_id, refresh_token_jti = %session.refresh_token_jti))]
    pub async fn store_session(&self, session: &SessionInfo) -> Result<()> {
        debug!("Storing session in Redis");

        let mut conn = self.redis_pool.get().await
            .context("Failed to get Redis connection from pool")?;

        let session_key = format!("session:{}", session.refresh_token_jti);
        let session_data = serde_json::to_string(session)
            .context("Failed to serialize session data")?;

        // Store session with TTL
        redis::AsyncCommands::set_ex(&mut *conn, &session_key, session_data, self.session_ttl_seconds).await
            .context("Failed to store session in Redis")?;

        // Also create a user -> session mapping for easy cleanup
        let user_sessions_key = format!("user_sessions:{}", session.user_id);
        redis::AsyncCommands::sadd(&mut *conn, &user_sessions_key, &session.refresh_token_jti).await
            .context("Failed to add session to user sessions set")?;
        redis::AsyncCommands::expire(&mut *conn, &user_sessions_key, self.session_ttl_seconds as i64).await
            .context("Failed to set TTL on user sessions set")?;

        info!(
            session_key = %session_key,
            ttl_seconds = self.session_ttl_seconds,
            "Successfully stored session"
        );

        Ok(())
    }

    /// Retrieve session information from Redis
    #[instrument(skip(self))]
    pub async fn get_session(&self, refresh_token_jti: &str) -> Result<Option<SessionInfo>> {
        debug!(refresh_token_jti = %refresh_token_jti, "Retrieving session from Redis");

        let mut conn = self.redis_pool.get().await
            .context("Failed to get Redis connection from pool")?;

        let session_key = format!("session:{}", refresh_token_jti);
        let session_data: Option<String> = redis::AsyncCommands::get(&mut *conn, &session_key).await
            .context("Failed to retrieve session from Redis")?;

        match session_data {
            Some(data) => {
                let session: SessionInfo = serde_json::from_str(&data)
                    .context("Failed to deserialize session data")?;

                debug!("Successfully retrieved session from Redis");
                Ok(Some(session))
            }
            None => {
                debug!("No session found in Redis");
                Ok(None)
            }
        }
    }

    /// Update session activity timestamp
    #[instrument(skip(self))]
    pub async fn update_session_activity(&self, refresh_token_jti: &str) -> Result<()> {
        debug!(refresh_token_jti = %refresh_token_jti, "Updating session activity");

        if let Some(mut session) = self.get_session(refresh_token_jti).await? {
            session.last_activity = Utc::now();
            self.store_session(&session).await?;
            debug!("Successfully updated session activity");
        } else {
            warn!(refresh_token_jti = %refresh_token_jti, "Attempted to update non-existent session");
        }

        Ok(())
    }

    /// Invalidate a specific session
    #[instrument(skip(self))]
    pub async fn invalidate_session(&self, refresh_token_jti: &str) -> Result<()> {
        debug!(refresh_token_jti = %refresh_token_jti, "Invalidating session");

        let mut conn = self.redis_pool.get().await
            .context("Failed to get Redis connection from pool")?;

        // Get session to find user ID
        if let Some(session) = self.get_session(refresh_token_jti).await? {
            // Remove from user sessions set
            let user_sessions_key = format!("user_sessions:{}", session.user_id);
            redis::AsyncCommands::srem(&mut *conn, &user_sessions_key, refresh_token_jti).await
                .context("Failed to remove session from user sessions set")?;
        }

        // Remove session
        let session_key = format!("session:{}", refresh_token_jti);
        let removed: u32 = redis::AsyncCommands::del(&mut *conn, &session_key).await
            .context("Failed to delete session from Redis")?;

        if removed > 0 {
            info!(refresh_token_jti = %refresh_token_jti, "Successfully invalidated session");
        } else {
            warn!(refresh_token_jti = %refresh_token_jti, "Attempted to invalidate non-existent session");
        }

        Ok(())
    }

    /// Invalidate all sessions for a user (useful for logout all devices)
    #[instrument(skip(self))]
    pub async fn invalidate_all_user_sessions(&self, user_id: Uuid) -> Result<u32> {
        debug!(user_id = %user_id, "Invalidating all user sessions");

        let mut conn = self.redis_pool.get().await
            .context("Failed to get Redis connection from pool")?;

        let user_sessions_key = format!("user_sessions:{}", user_id);
        let session_jtis: Vec<String> = redis::AsyncCommands::smembers(&mut *conn, &user_sessions_key).await
            .context("Failed to get user sessions from Redis")?;

        let mut invalidated_count = 0;

        for jti in session_jtis {
            if let Err(e) = self.invalidate_session(&jti).await {
                error!(
                    user_id = %user_id,
                    refresh_token_jti = %jti,
                    error = %e,
                    "Failed to invalidate individual session"
                );
            } else {
                invalidated_count += 1;
            }
        }

        // Clean up user sessions set
        redis::AsyncCommands::del(&mut *conn, &user_sessions_key).await
            .context("Failed to delete user sessions set")?;

        info!(
            user_id = %user_id,
            invalidated_count = invalidated_count,
            "Successfully invalidated user sessions"
        );

        Ok(invalidated_count)
    }

    /// Get active session count for a user
    #[instrument(skip(self))]
    pub async fn get_user_session_count(&self, user_id: Uuid) -> Result<u32> {
        debug!(user_id = %user_id, "Getting user session count");

        let mut conn = self.redis_pool.get().await
            .context("Failed to get Redis connection from pool")?;

        let user_sessions_key = format!("user_sessions:{}", user_id);
        let count: u32 = redis::AsyncCommands::scard(&mut *conn, &user_sessions_key).await
            .context("Failed to get user session count from Redis")?;

        debug!(user_id = %user_id, session_count = count, "Retrieved user session count");

        Ok(count)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_jwt_config_default() {
        let config = JwtConfig::default();
        assert_eq!(config.issuer, "auth-service");
        assert_eq!(config.audience, "api");
        assert_eq!(config.access_token_expires_minutes, 15);
        assert_eq!(config.refresh_token_expires_days, 30);
    }

    #[tokio::test]
    async fn test_jwt_token_generation_and_validation() {
        let config = JwtConfig {
            secret_key: "test-secret-key".to_string(),
            ..Default::default()
        };
        let jwt_manager = JwtManager::new(config);

        let user_id = Uuid::new_v4();
        let email = "test@example.com";
        let google_id = "google_123";

        // Generate token pair
        let token_pair = jwt_manager
            .generate_token_pair(user_id, email, google_id)
            .unwrap();

        assert!(!token_pair.access_token.is_empty());
        assert!(!token_pair.refresh_token.is_empty());
        assert_eq!(token_pair.token_type, "Bearer");

        // Validate access token
        let access_claims = jwt_manager
            .validate_token(&token_pair.access_token)
            .unwrap();

        assert_eq!(access_claims.sub, user_id.to_string());
        assert_eq!(access_claims.email, email);
        assert_eq!(access_claims.google_id, google_id);
        assert_eq!(access_claims.token_type, "access");

        // Validate refresh token
        let refresh_claims = jwt_manager
            .validate_token(&token_pair.refresh_token)
            .unwrap();

        assert_eq!(refresh_claims.sub, user_id.to_string());
        assert_eq!(refresh_claims.email, email);
        assert_eq!(refresh_claims.google_id, google_id);
        assert_eq!(refresh_claims.token_type, "refresh");
    }

    #[test]
    fn test_extract_token_from_header() {
        // Valid Bearer token
        let token = JwtManager::extract_token_from_header("Bearer abc123").unwrap();
        assert_eq!(token, "abc123");

        // Invalid format
        assert!(JwtManager::extract_token_from_header("Basic abc123").is_err());
        
        // Empty token
        assert!(JwtManager::extract_token_from_header("Bearer ").is_err());
        
        // Missing Bearer prefix
        assert!(JwtManager::extract_token_from_header("abc123").is_err());
    }
}