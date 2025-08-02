use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::collections::HashMap;
use tracing::{debug, info, instrument, warn};
use uuid::Uuid;

/// User model representing Google OAuth authenticated users
/// Simplified to match the minimal database schema
#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: Uuid,
    pub google_id: String,
    pub email: String,
    pub name: String,
    pub picture_url: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

/// Request structure for creating a new user from Google OAuth data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub google_id: String,
    pub email: String,
    pub name: String,
    pub picture_url: Option<String>,
}

/// Request structure for updating user profile
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub name: Option<String>,
    pub picture_url: Option<String>,
}

/// User repository for database operations
#[derive(Debug, Clone)]
pub struct UserRepository {
    pool: PgPool,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Create a new user from Google OAuth data
    #[instrument(skip(self), fields(google_id = %request.google_id, email = %request.email))]
    pub async fn create_user(&self, request: CreateUserRequest) -> Result<User, sqlx::Error> {
        debug!("Creating new user from Google OAuth data");

        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (google_id, email, name, picture_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            "#,
        )
        .bind(&request.google_id)
        .bind(&request.email)
        .bind(&request.name)
        .bind(&request.picture_url)
        .fetch_one(&self.pool)
        .await?;

        info!(
            user_id = %user.id,
            google_id = %user.google_id,
            email = %user.email,
            "Successfully created new user"
        );

        Ok(user)
    }

    /// Find user by Google ID (most common OAuth lookup)
    #[instrument(skip(self))]
    pub async fn find_by_google_id(&self, google_id: &str) -> Result<Option<User>, sqlx::Error> {
        debug!(google_id = %google_id, "Looking up user by Google ID");

        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE google_id = $1"
        )
        .bind(google_id)
        .fetch_optional(&self.pool)
        .await?;

        match &user {
            Some(u) => debug!(user_id = %u.id, "Found user by Google ID"),
            None => debug!("No user found with this Google ID"),
        }

        Ok(user)
    }

    /// Find user by email
    #[instrument(skip(self))]
    pub async fn find_by_email(&self, email: &str) -> Result<Option<User>, sqlx::Error> {
        debug!(email = %email, "Looking up user by email");

        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE email = $1"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;

        match &user {
            Some(u) => debug!(user_id = %u.id, "Found user by email"),
            None => debug!("No user found with this email"),
        }

        Ok(user)
    }

    /// Find user by ID
    #[instrument(skip(self))]
    pub async fn find_by_id(&self, user_id: Uuid) -> Result<Option<User>, sqlx::Error> {
        debug!(user_id = %user_id, "Looking up user by ID");

        let user = sqlx::query_as::<_, User>(
            "SELECT * FROM users WHERE id = $1"
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await?;

        match &user {
            Some(_) => debug!("Found user by ID"),
            None => debug!("No user found with this ID"),
        }

        Ok(user)
    }


    /// Update user profile information (typically from updated Google profile)
    #[instrument(skip(self), fields(user_id = %user_id))]
    pub async fn update_user(&self, user_id: Uuid, request: UpdateUserRequest) -> Result<User, sqlx::Error> {
        debug!("Updating user profile information");

        let user = sqlx::query_as::<_, User>(
            r#"
            UPDATE users SET
                name = COALESCE($2, name),
                picture_url = COALESCE($3, picture_url),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            "#,
        )
        .bind(user_id)
        .bind(&request.name)
        .bind(&request.picture_url)
        .fetch_one(&self.pool)
        .await?;

        info!(user_id = %user.id, "Successfully updated user profile");

        Ok(user)
    }

    /// Delete a user (for GDPR compliance)
    #[instrument(skip(self))]
    pub async fn delete_user(&self, user_id: Uuid) -> Result<(), sqlx::Error> {
        debug!(user_id = %user_id, "Deleting user");

        let result = sqlx::query(
            "DELETE FROM users WHERE id = $1"
        )
        .bind(user_id)
        .execute(&self.pool)
        .await?;

        if result.rows_affected() == 0 {
            warn!(user_id = %user_id, "No user found to delete");
        } else {
            info!(user_id = %user_id, "Successfully deleted user");
        }

        Ok(())
    }

    /// Create or update user from Google OAuth (upsert operation)
    #[instrument(skip(self), fields(google_id = %request.google_id, email = %request.email))]
    pub async fn upsert_from_google(&self, request: CreateUserRequest) -> Result<(User, bool), sqlx::Error> {
        debug!("Upserting user from Google OAuth data");

        // First try to find existing user
        if let Some(existing_user) = self.find_by_google_id(&request.google_id).await? {
            // Update existing user with fresh Google data
            let update_request = UpdateUserRequest {
                name: Some(request.name),
                picture_url: request.picture_url,
            };

            let updated_user = self.update_user(existing_user.id, update_request).await?;
            info!(user_id = %updated_user.id, "Updated existing user from Google OAuth");
            
            return Ok((updated_user, false)); // false = not newly created
        }

        // User doesn't exist, create new one
        let new_user = self.create_user(request).await?;
        Ok((new_user, true)) // true = newly created
    }

    /// Get user statistics for admin dashboard
    #[instrument(skip(self))]
    pub async fn get_user_stats(&self) -> Result<HashMap<String, i64>, sqlx::Error> {
        debug!("Fetching user statistics");

        let mut stats = HashMap::new();

        // Total users
        let total_users: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users"
        )
        .fetch_one(&self.pool)
        .await?;
        stats.insert("total_users".to_string(), total_users.0);

        // Users created in last 24 hours
        let new_users_24h: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '24 hours'"
        )
        .fetch_one(&self.pool)
        .await?;
        stats.insert("new_users_24h".to_string(), new_users_24h.0);

        // Users created in last 7 days
        let new_users_7d: (i64,) = sqlx::query_as(
            "SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'"
        )
        .fetch_one(&self.pool)
        .await?;
        stats.insert("new_users_7d".to_string(), new_users_7d.0);

        debug!(
            total_users = stats["total_users"],
            new_users_24h = stats["new_users_24h"],
            new_users_7d = stats["new_users_7d"],
            "Retrieved user statistics"
        );

        Ok(stats)
    }

}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::PgPool;

    // Note: These tests require a test database
    // You would typically run them with: cargo test --features "test-db"
    
    async fn setup_test_db() -> PgPool {
        // This would connect to your test database
        // Implementation would depend on your test setup
        todo!("Implement test database setup")
    }

    #[tokio::test]
    async fn test_create_user() {
        let pool = setup_test_db().await;
        let repo = UserRepository::new(pool);

        let request = CreateUserRequest {
            google_id: "test_google_id".to_string(),
            email: "test@example.com".to_string(),
            name: "Test User".to_string(),
            picture_url: Some("https://example.com/picture.jpg".to_string()),
        };

        let user = repo.create_user(request).await.unwrap();
        assert_eq!(user.email, "test@example.com");
        assert_eq!(user.name, "Test User");
        assert_eq!(user.google_id, "test_google_id");
        assert_eq!(user.picture_url, Some("https://example.com/picture.jpg".to_string()));
    }
}