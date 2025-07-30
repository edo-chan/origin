use std::error::Error;
use sqlx::PgPool;
use uuid::Uuid;
use crate::model::data::User;

#[derive(Debug, Clone)]
pub struct UserFetchRepository {
    pool: PgPool,
}

impl UserFetchRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Find a user by email
    pub async fn find_user_by_email(&self, email: &str) -> Result<Option<User>, Box<dyn Error>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, name, google_id, password_hash, created_at, updated_at 
             FROM users WHERE email = $1",
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    /// Find a user by Google ID
    pub async fn find_user_by_google_id(&self, google_id: &str) -> Result<Option<User>, Box<dyn Error>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, name, google_id, password_hash, created_at, updated_at 
             FROM users WHERE google_id = $1",
        )
        .bind(google_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }

    /// Find a user by ID
    pub async fn find_user_by_id(&self, id: &Uuid) -> Result<Option<User>, Box<dyn Error>> {
        let user = sqlx::query_as::<_, User>(
            "SELECT id, email, name, google_id, password_hash, created_at, updated_at 
             FROM users WHERE id = $1",
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(user)
    }
}