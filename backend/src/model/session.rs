use anyhow::Result;
use chrono::{DateTime, Duration, Utc};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct SessionModel {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token_hash: String,
    pub expires_at: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

impl SessionModel {
    /// Create a new session
    pub async fn create(pool: &PgPool, user_id: Uuid, token: &str) -> Result<Self> {
        // Hash the token for storage
        let token_hash = Self::hash_token(token);
        
        // Set expiration to 30 days from now
        let expires_at = Utc::now() + Duration::days(30);

        let session = sqlx::query_as!(
            SessionModel,
            r#"
            INSERT INTO sessions (user_id, token_hash, expires_at)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, token_hash, expires_at, created_at
            "#,
            user_id,
            token_hash,
            expires_at
        )
        .fetch_one(pool)
        .await?;

        Ok(session)
    }

    /// Find session by token
    pub async fn find_by_token(pool: &PgPool, token: &str) -> Result<Option<Self>> {
        let token_hash = Self::hash_token(token);

        let session = sqlx::query_as!(
            SessionModel,
            r#"
            SELECT id, user_id, token_hash, expires_at, created_at
            FROM sessions
            WHERE token_hash = $1 AND expires_at > NOW()
            "#,
            token_hash
        )
        .fetch_optional(pool)
        .await?;

        Ok(session)
    }

    /// Find active sessions by user ID
    pub async fn find_by_user_id(pool: &PgPool, user_id: Uuid) -> Result<Vec<Self>> {
        let sessions = sqlx::query_as!(
            SessionModel,
            r#"
            SELECT id, user_id, token_hash, expires_at, created_at
            FROM sessions
            WHERE user_id = $1 AND expires_at > NOW()
            ORDER BY created_at DESC
            "#,
            user_id
        )
        .fetch_all(pool)
        .await?;

        Ok(sessions)
    }

    /// Update session token
    pub async fn update_token(pool: &PgPool, id: Uuid, new_token: &str) -> Result<Self> {
        let token_hash = Self::hash_token(new_token);
        let expires_at = Utc::now() + Duration::days(30);

        let session = sqlx::query_as!(
            SessionModel,
            r#"
            UPDATE sessions
            SET token_hash = $2, expires_at = $3
            WHERE id = $1
            RETURNING id, user_id, token_hash, expires_at, created_at
            "#,
            id,
            token_hash,
            expires_at
        )
        .fetch_one(pool)
        .await?;

        Ok(session)
    }

    /// Delete session by ID
    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<bool> {
        let result = sqlx::query!(
            r#"
            DELETE FROM sessions
            WHERE id = $1
            "#,
            id
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    /// Delete all sessions for a user
    pub async fn delete_by_user_id(pool: &PgPool, user_id: Uuid) -> Result<u64> {
        let result = sqlx::query!(
            r#"
            DELETE FROM sessions
            WHERE user_id = $1
            "#,
            user_id
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Clean up expired sessions
    pub async fn cleanup_expired(pool: &PgPool) -> Result<u64> {
        let result = sqlx::query!(
            r#"
            DELETE FROM sessions
            WHERE expires_at <= NOW()
            "#
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected())
    }

    /// Hash a token for secure storage
    fn hash_token(token: &str) -> String {
        use sha2::{Digest, Sha256};
        let mut hasher = Sha256::new();
        hasher.update(token.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}