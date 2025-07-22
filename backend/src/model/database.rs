use std::error::Error;
use sqlx::{postgres::PgPoolOptions, PgPool};
use crate::model::data::User;
use uuid::Uuid;

/// Database connection wrapper using sqlx
#[derive(Debug)]
pub struct Database {
    pool: PgPool,
}

impl Database {
    /// Create a new database connection pool
    pub async fn new(connection_string: &str) -> Result<Self, Box<dyn Error>> {
        let pool = PgPoolOptions::new()
            .max_connections(5)
            .connect(connection_string)
            .await?;

        // Run migrations
        sqlx::migrate!("./src/model/migrations")
            .run(&pool)
            .await?;

        Ok(Self { pool })
    }

    /// Save a greeting to the database
    pub async fn save_greeting(&self, name: &str, message: &str) -> Result<(), Box<dyn Error>> {
        sqlx::query(
            "INSERT INTO greetings (name, message) VALUES ($1, $2)",
        )
        .bind(name)
        .bind(message)
        .execute(&self.pool)
        .await?;

        Ok(())
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
