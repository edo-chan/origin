use std::env;
use tonic::transport::Server;
use dotenv::dotenv;
use tower_http::cors::{CorsLayer, Any};
use tower::ServiceBuilder;
use tracing::{info, error, instrument};

use sqlx::PgPool;
use template::handler::greeter::GreeterHandler;
use template::handler::auth::AuthServiceImpl;
use template::model::greeting::GreetingRepository;
use template::model::user::UserRepository;
use template::model::auth::{JwtManager, SessionManager};
use template::model::otp::OtpRepository;
use template::adapter::google_oauth::GoogleOAuthClient;
use template::adapter::AppConfig;
use template::gen::greeter::greeter_service_server::GreeterServiceServer;
use template::gen::auth::auth_service_server::AuthServiceServer;
use template::logging;

#[tokio::main]
#[instrument]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    logging::init_tracing();

    // Load environment variables from .env file if it exists (for local development)
    dotenv().ok();

    // Load configuration from Parameter Store (falls back to env vars for local dev)
    info!("Loading application configuration...");
    let config = AppConfig::load().await;
    info!("Configuration loaded successfully");

    // Get server address from environment variable or use default
    let grpc_addr = env::var("GRPC_ADDR")
        .unwrap_or_else(|_| "[::0]:50051".to_string())
        .parse()?;

    info!("Connecting to database...");
    let pool = PgPool::connect(&config.database_url).await?;
    info!("Database connection established");

    // Create the greeter handler with repository access
    let greeting_repo = GreetingRepository::new(pool.clone());
    let greeter = GreeterHandler::new(greeting_repo);

    // Create auth service dependencies
    let oauth_client = GoogleOAuthClient::from_env()
        .map_err(|e| {
            error!("Failed to create OAuth client: {}", e);
            e
        })?;
    
    // Create JWT manager with config from Parameter Store
    let jwt_config = template::model::auth::JwtConfig {
        secret_key: config.jwt_secret.clone(),
        issuer: env::var("JWT_ISSUER").unwrap_or_else(|_| "auth-service".to_string()),
        audience: env::var("JWT_AUDIENCE").unwrap_or_else(|_| "api".to_string()),
        access_token_expires_minutes: env::var("JWT_ACCESS_TOKEN_EXPIRES_MINUTES")
            .unwrap_or_else(|_| "15".to_string())
            .parse()
            .unwrap_or(15),
        refresh_token_expires_days: env::var("JWT_REFRESH_TOKEN_EXPIRES_DAYS")
            .unwrap_or_else(|_| "30".to_string())
            .parse()
            .unwrap_or(30),
    };
    let jwt_manager = JwtManager::new(jwt_config);
    
    // Create session manager with Redis URL from Parameter Store
    let session_ttl_hours = env::var("SESSION_TTL_HOURS")
        .unwrap_or_else(|_| "24".to_string())
        .parse()
        .unwrap_or(24);
    let session_manager = SessionManager::new(&config.redis_url, session_ttl_hours)
        .map_err(|e| {
            error!("Failed to create session manager: {}", e);
            e
        })?;
    
    let user_repository = UserRepository::new(pool.clone());
    let otp_repository = OtpRepository::new(pool.clone());
    
    // Create the auth service handler
    let auth_service = AuthServiceImpl::new(
        oauth_client,
        jwt_manager,
        session_manager,
        user_repository,
        otp_repository,
    );

    // Configure CORS middleware
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build and run the gRPC server
    let grpc_server = Server::builder()
        .layer(ServiceBuilder::new().layer(cors))
        .add_service(GreeterServiceServer::new(greeter))
        .add_service(AuthServiceServer::new(auth_service))
        .serve(grpc_addr);

    info!("gRPC server listening on {}", grpc_addr);

    // Run the gRPC server
    if let Err(e) = grpc_server.await {
        error!("gRPC server error: {}", e);
    }

    Ok(())
}
