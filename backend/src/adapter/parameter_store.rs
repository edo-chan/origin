use aws_config::{BehaviorVersion, Region};
use aws_sdk_ssm::Client;
use serde::{Deserialize, Serialize};
use tracing::{error, info, instrument};

#[derive(Debug)]
pub struct ParameterStore {
    client: Client,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub database_url: String,
    pub redis_url: String,
    pub jwt_secret: String,
    pub claude_api_key: String,
    pub plaid_client_id: String,
    pub plaid_secret: String,
    pub plaid_env: String,
    pub plaid_webhook_url: Option<String>,
}

impl ParameterStore {
    #[instrument(skip_all)]
    pub async fn new() -> Self {
        let config = aws_config::defaults(BehaviorVersion::latest())
            .region(Region::new("us-east-1"))
            .load()
            .await;
        
        let client = Client::new(&config);
        info!("Initialized Parameter Store client");
        
        Self { client }
    }

    #[instrument(skip(self))]
    pub async fn get_parameter(&self, name: String, namespace: Option<String>) -> Option<Option<String>> {
        let full_name = match namespace {
            Some(ns) => format!("/{}/{}", ns, name),
            None => name,
        };
        
        info!(parameter = %full_name, "Fetching from Parameter Store");
        
        match self
            .client
            .get_parameter()
            .name(&full_name)
            .with_decryption(true)
            .send()
            .await
        {
            Ok(response) => {
                let value = response
                    .parameter()
                    .and_then(|p| p.value())
                    .map(|v| v.to_string());
                
                if value.is_some() {
                    info!(parameter = %full_name, "Successfully retrieved parameter");
                } else {
                    error!(parameter = %full_name, "Parameter not found or empty");
                }
                
                Some(value)
            }
            Err(e) => {
                error!(parameter = %full_name, error = %e, "Failed to get parameter");
                None
            }
        }
    }
}

// For local development, fall back to environment variables
impl AppConfig {
    #[instrument]
    pub fn from_env() -> Self {
        info!("Loading configuration from environment variables (local development)");
        
        Self {
            database_url: std::env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://postgres:password@localhost:5432/origin".to_string()),
            redis_url: std::env::var("REDIS_URL")
                .unwrap_or_else(|_| "redis://localhost:6379".to_string()),
            jwt_secret: std::env::var("JWT_SECRET")
                .unwrap_or_else(|_| "local-development-secret".to_string()),
            claude_api_key: std::env::var("CLAUDE_API_KEY")
                .unwrap_or_else(|_| "sk-local-development-key".to_string()),
            plaid_client_id: std::env::var("PLAID_CLIENT_ID")
                .unwrap_or_else(|_| "sandbox-client-id".to_string()),
            plaid_secret: std::env::var("PLAID_SECRET")
                .unwrap_or_else(|_| "sandbox-secret".to_string()),
            plaid_env: std::env::var("PLAID_ENV")
                .unwrap_or_else(|_| "sandbox".to_string()),
            plaid_webhook_url: std::env::var("PLAID_WEBHOOK_URL").ok(),
        }
    }

    #[instrument(skip_all)]
    pub async fn load() -> Self {
        let parameter_store = ParameterStore::new().await;
        let environment = std::env::var("ENVIRONMENT").unwrap_or_else(|_| "dev".to_string());
        let namespace = format!("origin/{}", environment);

        // Try to get all parameters from Parameter Store
        let database_url = parameter_store
            .get_parameter("database-url".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        let redis_url = parameter_store
            .get_parameter("redis-url".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        let jwt_secret = parameter_store
            .get_parameter("jwt-secret".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        let claude_api_key = parameter_store
            .get_parameter("claude-api-key".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        let plaid_client_id = parameter_store
            .get_parameter("plaid-client-id".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        let plaid_secret = parameter_store
            .get_parameter("plaid-secret".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        let plaid_env = parameter_store
            .get_parameter("plaid-env".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        let plaid_webhook_url = parameter_store
            .get_parameter("plaid-webhook-url".to_string(), Some(namespace.clone()))
            .await
            .flatten();

        // Use Parameter Store values if available, otherwise fall back to env vars
        let fallback = Self::from_env();
        
        Self {
            database_url: database_url.unwrap_or(fallback.database_url),
            redis_url: redis_url.unwrap_or(fallback.redis_url),
            jwt_secret: jwt_secret.unwrap_or(fallback.jwt_secret),
            claude_api_key: claude_api_key.unwrap_or(fallback.claude_api_key),
            plaid_client_id: plaid_client_id.unwrap_or(fallback.plaid_client_id),
            plaid_secret: plaid_secret.unwrap_or(fallback.plaid_secret),
            plaid_env: plaid_env.unwrap_or(fallback.plaid_env),
            plaid_webhook_url: plaid_webhook_url.or(fallback.plaid_webhook_url),
        }
    }
}