use std::env;
use tonic::transport::Server;
use dotenv::dotenv;
use tower_http::cors::{CorsLayer, Any};
use tower::ServiceBuilder;

// Import the generated proto code
pub mod service {
    tonic::include_proto!("service");
}

// Import our modules
pub mod handler;
pub mod model;

use model::Database;
use crate::handler::greeter::GreeterService;
use crate::service::greeter_server::GreeterServer;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Load environment variables from .env file if it exists
    dotenv().ok();

    // Get database connection string from environment variable or use default
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@postgres:5432/template".to_string());

    // Get server address from environment variable or use default
    let addr = env::var("SERVER_ADDR")
        .unwrap_or_else(|_| "[::0]:50051".to_string())
        .parse()?;

    println!("Connecting to database...");
    let db = Database::new(&database_url).await?;
    println!("Database connection established");

    // Create the greeter service with database access
    let greeter = GreeterService::new(db);

    println!("gRPC server listening on {}", addr);

    // Configure CORS middleware
    let cors = CorsLayer::new()
        // Allow requests from any origin
        .allow_origin(Any)
        // Allow common HTTP methods
        .allow_methods(Any)
        // Allow common HTTP headers
        .allow_headers(Any);
        // Allow credentials (cookies, authorization headers, etc.)

    // Build the server with CORS middleware
    Server::builder()
        .layer(ServiceBuilder::new().layer(cors))
        .add_service(GreeterServer::new(greeter))
        .serve(addr)
        .await?;

    Ok(())
}
