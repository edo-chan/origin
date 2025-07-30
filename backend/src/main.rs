use std::env;
use tonic::transport::Server;
use dotenv::dotenv;
use tower_http::cors::{CorsLayer, Any};
use tower::ServiceBuilder;
use axum::{
    routing::post,
    Router,
};
use tokio::join;
use tracing::{info, error, instrument};

// Import our modules
pub mod gen {
    include!(concat!(env!("CARGO_MANIFEST_DIR"), "/../proto/rust/gen/service.rs"));
}
pub mod handler;
pub mod model;
pub mod service;
pub mod repository;
pub mod domains;
pub mod logging;

use model::Database;
use crate::handler::greeter::GreeterService;
use crate::handler::echo::echo_handler;
use crate::service::GreeterServer;

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

    // Get server addresses from environment variables or use defaults
    let grpc_addr = env::var("GRPC_ADDR")
        .unwrap_or_else(|_| "[::0]:50051".to_string())
        .parse()?;
    let http_addr = env::var("HTTP_ADDR")
        .unwrap_or_else(|_| "[::0]:8081".to_string())
        .parse()?;

    info!("Connecting to database...");
    let db = Database::new(&database_url).await?;
    info!("Database connection established");

    // Create the greeter service with database access
    let greeter = GreeterService::new(db);

    // Configure CORS middleware
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the gRPC server
    let grpc_server = Server::builder()
        .layer(ServiceBuilder::new().layer(cors.clone()))
        .add_service(GreeterServer::new(greeter))
        .serve(grpc_addr);

    // Build the HTTP server with echo endpoint
    let http_app = Router::new()
        .route("/api/echo", post(echo_handler))
        .layer(cors);

    let http_server = axum::Server::bind(&http_addr)
        .serve(http_app.into_make_service());

    info!("gRPC server listening on {}", grpc_addr);
    info!("HTTP server listening on {}", http_addr);

    // Run both servers concurrently
    let (grpc_result, http_result) = join!(grpc_server, http_server);
    
    if let Err(e) = grpc_result {
        error!("gRPC server error: {}", e);
    }
    if let Err(e) = http_result {
        error!("HTTP server error: {}", e);
    }

    Ok(())
}
