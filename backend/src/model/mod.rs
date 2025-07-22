pub mod data;
mod database;

use std::error::Error;
use redis::{Client as RedisClient, AsyncCommands};
use uuid::Uuid;

pub use data::User;
pub use database::Database;

/// Redis connection wrapper
pub struct Redis {
    client: RedisClient,
}

impl Redis {
    /// Create a new Redis connection
    pub async fn new(connection_string: &str) -> Result<Self, Box<dyn Error>> {
        let client = redis::Client::open(connection_string)?;

        // Test connection
        let mut conn = client.get_async_connection().await?;
        redis::cmd("PING").query_async::<_, ()>(&mut conn).await?;

        Ok(Self { client })
    }

    /// Store a JWT token with expiration
    pub async fn store_token(&self, user_id: &Uuid, token: &str, expiry_seconds: usize) -> Result<(), Box<dyn Error>> {
        let mut conn = self.client.get_async_connection().await?;
        conn.set_ex::<_, _, ()>(format!("token:{}", user_id), token, expiry_seconds).await?;
        Ok(())
    }

    /// Get a JWT token
    pub async fn get_token(&self, user_id: &Uuid) -> Result<Option<String>, Box<dyn Error>> {
        let mut conn = self.client.get_async_connection().await?;
        let token: Option<String> = conn.get(format!("token:{}", user_id)).await?;
        Ok(token)
    }

    /// Delete a JWT token
    pub async fn delete_token(&self, user_id: &Uuid) -> Result<(), Box<dyn Error>> {
        let mut conn = self.client.get_async_connection().await?;
        conn.del::<_, ()>(format!("token:{}", user_id)).await?;
        Ok(())
    }
}
