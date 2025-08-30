use std::env;
use std::sync::Arc;
use tonic::transport::Server;
use dotenv::dotenv;
use tower_http::cors::{CorsLayer, Any};
use tower::ServiceBuilder;
use tracing::{info, error, instrument};
use sqlx::postgres::PgPoolOptions;

use template::adapter::{jwt_service::JwtService, otp::OtpManager, otp_service::OtpService, ses::SESClient, ses::SESConfig, parameter_store::ParameterStore};
use template::handler::accounts::AccountsHandler;
use template::handler::auth::AuthHandler;
use template::gen::accounts::accounts_service_server::AccountsServiceServer;
use template::gen::auth::auth_service_server::AuthServiceServer;
use template::logging;

#[tokio::main]
#[instrument]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    logging::init_tracing();

    // Load environment variables from .env file if it exists (for local development)
    dotenv().ok();

    // Get environment
    let environment = env::var("ENVIRONMENT").unwrap_or_else(|_| "local".to_string());
    let aws_region = env::var("AWS_REGION").unwrap_or_else(|_| "us-east-1".to_string());

    info!("Starting server in {} environment", environment);

    // Initialize Parameter Store
    let parameter_store = Arc::new(ParameterStore::new(&aws_region).await?);

    // Get configuration from Parameter Store
    let database_url = if environment == "local" {
        env::var("DATABASE_URL").unwrap_or_else(|_| "postgresql://postgres:postgres@localhost:5432/origin".to_string())
    } else {
        parameter_store.get(&format!("/origin/{}/database-url", environment)).await?
    };

    let jwt_secret = if environment == "local" {
        env::var("JWT_SECRET").unwrap_or_else(|_| "local-development-secret-key-change-in-production".to_string())
    } else {
        parameter_store.get(&format!("/origin/{}/jwt-secret", environment)).await?
    };

    // Initialize database pool
    let pool = Arc::new(
        PgPoolOptions::new()
            .max_connections(5)
            .connect(&database_url)
            .await?
    );

    info!("Database connection established");

    // Run migrations
    sqlx::migrate!("./migrations")
        .run(&*pool)
        .await?;

    info!("Database migrations completed");

    // Initialize services
    let jwt_service = Arc::new(JwtService::new(jwt_secret));
    
    // Initialize SES client
    let ses_config = SESConfig {
        region: aws_region.clone(),
        default_sender: env::var("SES_SENDER").unwrap_or_else(|_| "noreply@example.com".to_string()),
        default_sender_name: Some("Origin".to_string()),
        reply_to: None,
        configuration_set: None,
    };
    let ses_client = SESClient::new(ses_config).await?;
    
    // Initialize OTP service
    let otp_manager = OtpManager::new();
    let otp_service = Arc::new(OtpService::new(otp_manager, ses_client));

    // Get server address from environment variable or use default
    let grpc_addr = env::var("GRPC_ADDR")
        .unwrap_or_else(|_| "[::0]:50051".to_string())
        .parse()?;

    // Create handlers
    let accounts_handler = AccountsHandler::new();
    let auth_handler = AuthHandler::new(pool.clone(), otp_service, jwt_service);

    // Configure CORS middleware
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build and run the gRPC server
    let grpc_server = Server::builder()
        .layer(ServiceBuilder::new().layer(cors))
        .add_service(AccountsServiceServer::new(accounts_handler))
        .add_service(AuthServiceServer::new(auth_handler))
        .serve(grpc_addr);

    info!("gRPC server listening on {}", grpc_addr);

    // Run the gRPC server
    if let Err(e) = grpc_server.await {
        error!("gRPC server error: {}", e);
    }

    Ok(())
}
