use std::error::Error;
use sqlx::PgPool;
use crate::model::data::User;

#[derive(Debug, Clone)]
pub struct UserActionRepository {
    pool: PgPool,
}

impl UserActionRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Create a new user
    pub async fn create_user(&self, user: &User) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            "INSERT INTO users (id, email, name, google_id, password_hash, created_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7)",
        )
        .bind(user.id)
        .bind(&user.email)
        .bind(&user.name)
        .bind(&user.google_id)
        .bind(&user.password_hash)
        .bind(user.created_at)
        .bind(user.updated_at)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}