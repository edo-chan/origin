use sqlx::PgPool;
use std::error::Error;

#[derive(Debug, Clone)]
pub struct GreetingRepository {
    pool: PgPool,
}

impl GreetingRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    pub async fn save_greeting(&self, name: &str, message: &str) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            "INSERT INTO greetings (name, message, created_at) VALUES ($1, $2, NOW())"
        )
        .bind(name)
        .bind(message)
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}