use std::env;
use tonic::transport::Server;
use dotenv::dotenv;
use tower_http::cors::{CorsLayer, Any};
use tower::ServiceBuilder;
use tracing::{info, error, instrument};

// Import our modules
pub mod gen {
    include!(concat!(env!("CARGO_MANIFEST_DIR"), "/../proto/rust/gen/service.rs"));
}
pub mod handler;
pub mod model;
pub mod logging;

use sqlx::PgPool;
use crate::handler::greeter::GreeterHandler;
use crate::model::greeting::GreetingRepository;
use crate::gen::greeter_server::GreeterServer;

#[tokio::main]
#[instrument]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    logging::init_tracing();

    // Load environment variables from .env file if it exists
    dotenv().ok();

    // Get database connection string from environment variable or use default
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@postgres:5432/template".to_string());

    // Get server address from environment variable or use default
    let grpc_addr = env::var("GRPC_ADDR")
        .unwrap_or_else(|_| "[::0]:50051".to_string())
        .parse()?;

    info!("Connecting to database...");
    let pool = PgPool::connect(&database_url).await?;
    info!("Database connection established");

    // Create the greeter handler with repository access
    let greeting_repo = GreetingRepository::new(pool);
    let greeter = GreeterHandler::new(greeting_repo);

    // Configure CORS middleware
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build and run the gRPC server
    let grpc_server = Server::builder()
        .layer(ServiceBuilder::new().layer(cors))
        .add_service(GreeterServer::new(greeter))
        .serve(grpc_addr);

    info!("gRPC server listening on {}", grpc_addr);

    // Run the gRPC server
    if let Err(e) = grpc_server.await {
        error!("gRPC server error: {}", e);
    }

    Ok(())
}
