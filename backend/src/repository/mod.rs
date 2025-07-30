// Re-export repositories from domains
pub use crate::domains::user::{UserFetchRepository, UserActionRepository};

// Legacy compatibility - combine both fetch and action into one
use sqlx::PgPool;
use std::error::Error;
use uuid::Uuid;
use crate::model::data::User;

#[derive(Debug, Clone)]
pub struct UserRepository {
    fetch: UserFetchRepository,
    action: UserActionRepository,
}

impl UserRepository {
    pub fn new(pool: PgPool) -> Self {
        Self {
            fetch: UserFetchRepository::new(pool.clone()),
            action: UserActionRepository::new(pool),
        }
    }

    // Delegate fetch operations
    pub async fn find_user_by_email(&self, email: &str) -> Result<Option<User>, Box<dyn Error>> {
        self.fetch.find_user_by_email(email).await
    }

    pub async fn find_user_by_google_id(&self, google_id: &str) -> Result<Option<User>, Box<dyn Error>> {
        self.fetch.find_user_by_google_id(google_id).await
    }

    pub async fn find_user_by_id(&self, id: &Uuid) -> Result<Option<User>, Box<dyn Error>> {
        self.fetch.find_user_by_id(id).await
    }

    // Delegate action operations
    pub async fn create_user(&self, user: &User) -> Result<(), Box<dyn Error>> {
        self.action.create_user(user).await
    }
}