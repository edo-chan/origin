use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Duration, Utc};
use deadpool_redis::{Config, Pool, Runtime};
use redis::AsyncCommands;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{debug, error, info, instrument, warn};
use uuid::Uuid;

/// Redis cache configuration
#[derive(Debug, Clone)]
pub struct RedisCacheConfig {
    pub url: String,
    pub pool_size: u32,
    pub connection_timeout_seconds: u64,
    pub command_timeout_seconds: u64,
    pub max_retries: u32,
}

impl RedisCacheConfig {
    /// Create configuration from environment variables
    pub fn from_env() -> Result<Self> {
        let url = std::env::var("REDIS_URL")
            .unwrap_or_else(|_| "redis://localhost:6379".to_string());

        let pool_size = std::env::var("REDIS_POOL_SIZE")
            .unwrap_or_else(|_| "10".to_string())
            .parse()
            .context("Invalid REDIS_POOL_SIZE value")?;

        let connection_timeout_seconds = std::env::var("REDIS_CONNECTION_TIMEOUT_SECONDS")
            .unwrap_or_else(|_| "5".to_string())
            .parse()
            .context("Invalid REDIS_CONNECTION_TIMEOUT_SECONDS value")?;

        let command_timeout_seconds = std::env::var("REDIS_COMMAND_TIMEOUT_SECONDS")
            .unwrap_or_else(|_| "3".to_string())
            .parse()
            .context("Invalid REDIS_COMMAND_TIMEOUT_SECONDS value")?;

        let max_retries = std::env::var("REDIS_MAX_RETRIES")
            .unwrap_or_else(|_| "3".to_string())
            .parse()
            .context("Invalid REDIS_MAX_RETRIES value")?;

        Ok(Self {
            url,
            pool_size,
            connection_timeout_seconds,
            command_timeout_seconds,
            max_retries,
        })
    }
}

/// OAuth state stored in Redis during authentication flow
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedOAuthState {
    pub state_token: String,
    pub csrf_token: String,
    pub pkce_verifier: String,
    pub pkce_challenge: String,
    pub redirect_uri: Option<String>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}

/// Session data stored in Redis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedSessionData {
    pub session_id: Uuid,
    pub user_id: Uuid,
    pub google_id: String,
    pub email: String,
    pub name: String,
    pub refresh_token_hash: Option<String>,
    pub google_access_token: Option<String>,  // Google's access token for API calls
    pub google_refresh_token: Option<String>, // Google's refresh token
    pub google_token_expires_at: Option<DateTime<Utc>>,
    pub device_info: serde_json::Value,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTime<Utc>,
    pub last_activity_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
    pub is_active: bool,
}

/// Rate limiting data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitData {
    pub count: u32,
    pub window_start: DateTime<Utc>,
    pub blocked_until: Option<DateTime<Utc>>,
}

/// Redis cache service for OAuth and session management
#[derive(Debug, Clone)]
pub struct RedisCacheService {
    pool: Pool,
    config: RedisCacheConfig,
}

impl RedisCacheService {
    /// Create a new Redis cache service
    pub fn new(config: RedisCacheConfig) -> Result<Self> {
        let cfg = Config::from_url(&config.url);
        let pool = cfg.create_pool(Some(Runtime::Tokio1))
            .context("Failed to create Redis connection pool")?;

        Ok(Self { pool, config })
    }

    /// Create Redis cache service from environment variables
    pub fn from_env() -> Result<Self> {
        let config = RedisCacheConfig::from_env()?;
        Self::new(config)
    }

    /// Get Redis connection with error handling
    async fn get_connection(&self) -> Result<deadpool_redis::Connection> {
        self.pool
            .get()
            .await
            .context("Failed to get Redis connection from pool")
    }

    /// Store OAuth state in Redis with expiration
    #[instrument(skip(self, oauth_state), fields(state_token = %oauth_state.state_token))]
    pub async fn store_oauth_state(&self, oauth_state: CachedOAuthState) -> Result<()> {
        debug!("Storing OAuth state in Redis");

        let mut conn = self.get_connection().await?;
        let key = format!("oauth_state:{}", oauth_state.state_token);
        let value = serde_json::to_string(&oauth_state)
            .context("Failed to serialize OAuth state")?;

        let ttl_seconds = (oauth_state.expires_at - Utc::now()).num_seconds().max(1);

        conn.set_ex(&key, value, ttl_seconds as u64)
            .await
            .context("Failed to store OAuth state in Redis")?;

        info!(
            state_token = %oauth_state.state_token,
            ttl_seconds = ttl_seconds,
            "Successfully stored OAuth state in Redis"
        );

        Ok(())
    }

    /// Retrieve and delete OAuth state from Redis
    #[instrument(skip(self))]
    pub async fn get_and_delete_oauth_state(&self, state_token: &str) -> Result<Option<CachedOAuthState>> {
        debug!(state_token = %state_token, "Retrieving OAuth state from Redis");

        let mut conn = self.get_connection().await?;
        let key = format!("oauth_state:{}", state_token);

        // Use GETDEL to atomically get and delete
        let value: Option<String> = conn.get_del(&key)
            .await
            .context("Failed to retrieve OAuth state from Redis")?;

        match value {
            Some(json_str) => {
                let oauth_state: CachedOAuthState = serde_json::from_str(&json_str)
                    .context("Failed to deserialize OAuth state")?;

                // Check if state has expired
                if oauth_state.expires_at < Utc::now() {
                    warn!(
                        state_token = %state_token,
                        expired_at = %oauth_state.expires_at,
                        "OAuth state has expired"
                    );
                    return Ok(None);
                }

                info!(
                    state_token = %state_token,
                    "Successfully retrieved and deleted OAuth state"
                );

                Ok(Some(oauth_state))
            }
            None => {
                debug!(state_token = %state_token, "OAuth state not found in Redis");
                Ok(None)
            }
        }
    }

    /// Store session data in Redis
    #[instrument(skip(self, session_data), fields(session_id = %session_data.session_id, user_id = %session_data.user_id))]
    pub async fn store_session_data(&self, session_data: CachedSessionData) -> Result<()> {
        debug!("Storing session data in Redis");

        let mut conn = self.get_connection().await?;
        
        // Store by session ID
        let session_key = format!("session:{}", session_data.session_id);
        let session_value = serde_json::to_string(&session_data)
            .context("Failed to serialize session data")?;

        let ttl_seconds = (session_data.expires_at - Utc::now()).num_seconds().max(1);

        conn.set_ex(&session_key, &session_value, ttl_seconds as u64)
            .await
            .context("Failed to store session data in Redis")?;

        // Also store a mapping from user ID to session IDs (for multi-session support)
        let user_sessions_key = format!("user_sessions:{}", session_data.user_id);
        conn.sadd(&user_sessions_key, session_data.session_id.to_string())
            .await
            .context("Failed to add session to user sessions set")?;

        // Set expiration on user sessions set
        conn.expire(&user_sessions_key, ttl_seconds as u64)
            .await
            .context("Failed to set expiration on user sessions set")?;

        info!(
            session_id = %session_data.session_id,
            user_id = %session_data.user_id,
            ttl_seconds = ttl_seconds,
            "Successfully stored session data in Redis"
        );

        Ok(())
    }

    /// Retrieve session data by session ID
    #[instrument(skip(self))]
    pub async fn get_session_data(&self, session_id: Uuid) -> Result<Option<CachedSessionData>> {
        debug!(session_id = %session_id, "Retrieving session data from Redis");

        let mut conn = self.get_connection().await?;
        let key = format!("session:{}", session_id);

        let value: Option<String> = conn.get(&key)
            .await
            .context("Failed to retrieve session data from Redis")?;

        match value {
            Some(json_str) => {
                let mut session_data: CachedSessionData = serde_json::from_str(&json_str)
                    .context("Failed to deserialize session data")?;

                // Check if session has expired
                if session_data.expires_at < Utc::now() {
                    warn!(
                        session_id = %session_id,
                        expired_at = %session_data.expires_at,
                        "Session has expired"
                    );
                    
                    // Clean up expired session
                    let _ = self.delete_session_data(session_id).await;
                    return Ok(None);
                }

                // Update last activity timestamp
                session_data.last_activity_at = Utc::now();
                let updated_value = serde_json::to_string(&session_data)
                    .context("Failed to serialize updated session data")?;

                // Update in Redis asynchronously (fire and forget)
                let ttl_seconds = (session_data.expires_at - Utc::now()).num_seconds().max(1);
                let _ = conn.set_ex(&key, updated_value, ttl_seconds as u64).await;

                debug!(
                    session_id = %session_id,
                    user_id = %session_data.user_id,
                    "Successfully retrieved session data"
                );

                Ok(Some(session_data))
            }
            None => {
                debug!(session_id = %session_id, "Session data not found in Redis");
                Ok(None)
            }
        }
    }

    /// Delete session data from Redis
    #[instrument(skip(self))]
    pub async fn delete_session_data(&self, session_id: Uuid) -> Result<()> {
        debug!(session_id = %session_id, "Deleting session data from Redis");

        let mut conn = self.get_connection().await?;
        
        // First get the session to find user ID
        if let Some(session_data) = self.get_session_data(session_id).await? {
            // Remove from user sessions set
            let user_sessions_key = format!("user_sessions:{}", session_data.user_id);
            conn.srem(&user_sessions_key, session_id.to_string())
                .await
                .context("Failed to remove session from user sessions set")?;
        }

        // Delete the session data
        let session_key = format!("session:{}", session_id);
        let deleted: u32 = conn.del(&session_key)
            .await
            .context("Failed to delete session data from Redis")?;

        if deleted > 0 {
            info!(session_id = %session_id, "Successfully deleted session data");
        } else {
            debug!(session_id = %session_id, "Session data was not found (may have been already deleted)");
        }

        Ok(())
    }

    /// Delete all sessions for a user
    #[instrument(skip(self))]
    pub async fn delete_all_user_sessions(&self, user_id: Uuid) -> Result<u32> {
        debug!(user_id = %user_id, "Deleting all sessions for user");

        let mut conn = self.get_connection().await?;
        let user_sessions_key = format!("user_sessions:{}", user_id);

        // Get all session IDs for the user
        let session_ids: Vec<String> = conn.smembers(&user_sessions_key)
            .await
            .context("Failed to get user session IDs")?;

        let mut deleted_count = 0u32;

        // Delete each session
        for session_id_str in session_ids {
            if let Ok(session_id) = session_id_str.parse::<Uuid>() {
                let session_key = format!("session:{}", session_id);
                let deleted: u32 = conn.del(&session_key).await.unwrap_or(0);
                deleted_count += deleted;
            }
        }

        // Delete the user sessions set
        conn.del(&user_sessions_key)
            .await
            .context("Failed to delete user sessions set")?;

        info!(
            user_id = %user_id,
            deleted_count = deleted_count,
            "Successfully deleted all user sessions"
        );

        Ok(deleted_count)
    }

    /// Store rate limiting data
    #[instrument(skip(self, rate_limit_data))]
    pub async fn store_rate_limit(&self, key: &str, rate_limit_data: RateLimitData, ttl_seconds: u64) -> Result<()> {
        debug!(key = %key, "Storing rate limit data");

        let mut conn = self.get_connection().await?;
        let redis_key = format!("rate_limit:{}", key);
        let value = serde_json::to_string(&rate_limit_data)
            .context("Failed to serialize rate limit data")?;

        conn.set_ex(&redis_key, value, ttl_seconds)
            .await
            .context("Failed to store rate limit data in Redis")?;

        debug!(
            key = %key,
            count = rate_limit_data.count,
            ttl_seconds = ttl_seconds,
            "Successfully stored rate limit data"
        );

        Ok(())
    }

    /// Retrieve rate limiting data
    #[instrument(skip(self))]
    pub async fn get_rate_limit(&self, key: &str) -> Result<Option<RateLimitData>> {
        debug!(key = %key, "Retrieving rate limit data");

        let mut conn = self.get_connection().await?;
        let redis_key = format!("rate_limit:{}", key);

        let value: Option<String> = conn.get(&redis_key)
            .await
            .context("Failed to retrieve rate limit data from Redis")?;

        match value {
            Some(json_str) => {
                let rate_limit_data: RateLimitData = serde_json::from_str(&json_str)
                    .context("Failed to deserialize rate limit data")?;

                debug!(
                    key = %key,
                    count = rate_limit_data.count,
                    "Successfully retrieved rate limit data"
                );

                Ok(Some(rate_limit_data))
            }
            None => {
                debug!(key = %key, "Rate limit data not found");
                Ok(None)
            }
        }
    }

    /// Increment rate limit counter atomically
    #[instrument(skip(self))]
    pub async fn increment_rate_limit(&self, key: &str, window_seconds: u64) -> Result<u32> {
        debug!(key = %key, "Incrementing rate limit counter");

        let mut conn = self.get_connection().await?;
        let redis_key = format!("rate_limit:{}", key);

        // Use INCR with expiration
        let count: u32 = conn.incr(&redis_key, 1)
            .await
            .context("Failed to increment rate limit counter")?;

        // Set expiration only if this is the first increment
        if count == 1 {
            conn.expire(&redis_key, window_seconds)
                .await
                .context("Failed to set expiration on rate limit counter")?;
        }

        debug!(
            key = %key,
            count = count,
            window_seconds = window_seconds,
            "Successfully incremented rate limit counter"
        );

        Ok(count)
    }

    /// Store temporary data with expiration (generic cache)
    #[instrument(skip(self, data))]
    pub async fn store_temp_data<T>(&self, key: &str, data: &T, ttl_seconds: u64) -> Result<()>
    where
        T: Serialize,
    {
        debug!(key = %key, "Storing temporary data");

        let mut conn = self.get_connection().await?;
        let value = serde_json::to_string(data)
            .context("Failed to serialize temporary data")?;

        conn.set_ex(key, value, ttl_seconds)
            .await
            .context("Failed to store temporary data in Redis")?;

        debug!(
            key = %key,
            ttl_seconds = ttl_seconds,
            "Successfully stored temporary data"
        );

        Ok(())
    }

    /// Retrieve temporary data (generic cache)
    #[instrument(skip(self))]
    pub async fn get_temp_data<T>(&self, key: &str) -> Result<Option<T>>
    where
        T: for<'de> Deserialize<'de>,
    {
        debug!(key = %key, "Retrieving temporary data");

        let mut conn = self.get_connection().await?;
        let value: Option<String> = conn.get(key)
            .await
            .context("Failed to retrieve temporary data from Redis")?;

        match value {
            Some(json_str) => {
                let data: T = serde_json::from_str(&json_str)
                    .context("Failed to deserialize temporary data")?;

                debug!(key = %key, "Successfully retrieved temporary data");
                Ok(Some(data))
            }
            None => {
                debug!(key = %key, "Temporary data not found");
                Ok(None)
            }
        }
    }

    /// Health check for Redis connection
    #[instrument(skip(self))]
    pub async fn health_check(&self) -> Result<()> {
        debug!("Performing Redis health check");

        let mut conn = self.get_connection().await?;
        let response: String = conn.ping()
            .await
            .context("Redis ping failed")?;

        if response != "PONG" {
            return Err(anyhow!("Redis health check failed: unexpected response '{}'", response));
        }

        info!("Redis health check passed");
        Ok(())
    }

    /// Get Redis info for monitoring
    #[instrument(skip(self))]
    pub async fn get_info(&self) -> Result<HashMap<String, String>> {
        debug!("Retrieving Redis info");

        let mut conn = self.get_connection().await?;
        let info_str: String = conn.info("server")
            .await
            .context("Failed to get Redis info")?;

        let mut info_map = HashMap::new();
        
        for line in info_str.lines() {
            if line.contains(':') && !line.starts_with('#') {
                let parts: Vec<&str> = line.splitn(2, ':').collect();
                if parts.len() == 2 {
                    info_map.insert(parts[0].to_string(), parts[1].to_string());
                }
            }
        }

        debug!(keys_count = info_map.len(), "Successfully retrieved Redis info");
        Ok(info_map)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::IpAddr;

    // Note: These tests require a running Redis instance
    // You can skip them by running: cargo test --features "integration-tests"

    async fn test_redis_service() -> RedisCacheService {
        let config = RedisCacheConfig {
            url: "redis://localhost:6379".to_string(),
            pool_size: 5,
            connection_timeout_seconds: 5,
            command_timeout_seconds: 3,
            max_retries: 3,
        };
        
        RedisCacheService::new(config).unwrap()
    }

    #[tokio::test]
    #[ignore] // Requires Redis instance
    async fn test_oauth_state_storage() {
        let redis_service = test_redis_service().await;

        let oauth_state = CachedOAuthState {
            state_token: "test_state_token".to_string(),
            csrf_token: "test_csrf_token".to_string(),
            pkce_verifier: "test_verifier".to_string(),
            pkce_challenge: "test_challenge".to_string(),
            redirect_uri: Some("http://localhost:3000/auth/callback".to_string()),
            created_at: Utc::now(),
            expires_at: Utc::now() + Duration::minutes(10),
        };

        // Store OAuth state
        redis_service.store_oauth_state(oauth_state.clone()).await.unwrap();

        // Retrieve OAuth state
        let retrieved_state = redis_service
            .get_and_delete_oauth_state(&oauth_state.state_token)
            .await
            .unwrap()
            .unwrap();

        assert_eq!(retrieved_state.state_token, oauth_state.state_token);
        assert_eq!(retrieved_state.csrf_token, oauth_state.csrf_token);
        assert_eq!(retrieved_state.pkce_verifier, oauth_state.pkce_verifier);

        // Should be deleted after retrieval
        let second_retrieval = redis_service
            .get_and_delete_oauth_state(&oauth_state.state_token)
            .await
            .unwrap();
        assert!(second_retrieval.is_none());
    }

    #[tokio::test]
    #[ignore] // Requires Redis instance
    async fn test_session_data_storage() {
        let redis_service = test_redis_service().await;

        let session_id = Uuid::new_v4();
        let user_id = Uuid::new_v4();

        let session_data = CachedSessionData {
            session_id,
            user_id,
            google_id: "google123".to_string(),
            email: "test@example.com".to_string(),
            name: "Test User".to_string(),
            refresh_token_hash: Some("refresh_hash".to_string()),
            google_access_token: Some("google_access_token".to_string()),
            google_refresh_token: Some("google_refresh_token".to_string()),
            google_token_expires_at: Some(Utc::now() + Duration::hours(1)),
            device_info: serde_json::json!({"browser": "Chrome"}),
            ip_address: Some("127.0.0.1".to_string()),
            user_agent: Some("Mozilla/5.0".to_string()),
            created_at: Utc::now(),
            last_activity_at: Utc::now(),
            expires_at: Utc::now() + Duration::hours(24),
            is_active: true,
        };

        // Store session data
        redis_service.store_session_data(session_data.clone()).await.unwrap();

        // Retrieve session data
        let retrieved_session = redis_service
            .get_session_data(session_id)
            .await
            .unwrap()
            .unwrap();

        assert_eq!(retrieved_session.session_id, session_id);
        assert_eq!(retrieved_session.user_id, user_id);
        assert_eq!(retrieved_session.email, "test@example.com");

        // Delete session data
        redis_service.delete_session_data(session_id).await.unwrap();

        // Should be deleted
        let deleted_session = redis_service
            .get_session_data(session_id)
            .await
            .unwrap();
        assert!(deleted_session.is_none());
    }

    #[tokio::test]
    #[ignore] // Requires Redis instance
    async fn test_rate_limiting() {
        let redis_service = test_redis_service().await;

        let key = "test_ip_127.0.0.1";
        let window_seconds = 60;

        // First increment
        let count1 = redis_service.increment_rate_limit(key, window_seconds).await.unwrap();
        assert_eq!(count1, 1);

        // Second increment
        let count2 = redis_service.increment_rate_limit(key, window_seconds).await.unwrap();
        assert_eq!(count2, 2);

        // Third increment
        let count3 = redis_service.increment_rate_limit(key, window_seconds).await.unwrap();
        assert_eq!(count3, 3);
    }

    #[tokio::test]
    #[ignore] // Requires Redis instance
    async fn test_health_check() {
        let redis_service = test_redis_service().await;
        redis_service.health_check().await.unwrap();
    }
}