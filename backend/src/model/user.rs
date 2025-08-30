use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::PgPool;
use uuid::Uuid;

#[derive(Debug, Clone, sqlx::FromRow)]
pub struct UserModel {
    pub id: Uuid,
    pub email: String,
    pub full_name: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct CreateUser {
    pub email: String,
    pub full_name: Option<String>,
}

impl UserModel {
    /// Create a new user
    pub async fn create(pool: &PgPool, data: CreateUser) -> Result<Self> {
        let user = sqlx::query_as!(
            UserModel,
            r#"
            INSERT INTO users (email, full_name)
            VALUES ($1, $2)
            RETURNING id, email, full_name, created_at, updated_at
            "#,
            data.email.to_lowercase(),
            data.full_name
        )
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    /// Find user by ID
    pub async fn find_by_id(pool: &PgPool, id: Uuid) -> Result<Option<Self>> {
        let user = sqlx::query_as!(
            UserModel,
            r#"
            SELECT id, email, full_name, created_at, updated_at
            FROM users
            WHERE id = $1
            "#,
            id
        )
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    /// Find user by email
    pub async fn find_by_email(pool: &PgPool, email: &str) -> Result<Option<Self>> {
        let user = sqlx::query_as!(
            UserModel,
            r#"
            SELECT id, email, full_name, created_at, updated_at
            FROM users
            WHERE email = $1
            "#,
            email.to_lowercase()
        )
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    /// Update user's full name
    pub async fn update_full_name(
        pool: &PgPool,
        id: Uuid,
        full_name: Option<String>,
    ) -> Result<Self> {
        let user = sqlx::query_as!(
            UserModel,
            r#"
            UPDATE users
            SET full_name = $2, updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, full_name, created_at, updated_at
            "#,
            id,
            full_name
        )
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    /// Delete user by ID
    pub async fn delete(pool: &PgPool, id: Uuid) -> Result<bool> {
        let result = sqlx::query!(
            r#"
            DELETE FROM users
            WHERE id = $1
            "#,
            id
        )
        .execute(pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }
}