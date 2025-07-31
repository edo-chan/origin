use std::env;
use tonic::transport::Server;
use dotenv::dotenv;
use tower_http::cors::{CorsLayer, Any};
use tower::ServiceBuilder;
use tracing::{info, error, instrument};

use sqlx::PgPool;
use template::handler::greeter::GreeterHandler;
use template::model::greeting::GreetingRepository;
use template::gen::greeter_service_server::GreeterServiceServer;
use template::logging;

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
        .add_service(GreeterServiceServer::new(greeter))
        .serve(grpc_addr);

    info!("gRPC server listening on {}", grpc_addr);

    // Run the gRPC server
    if let Err(e) = grpc_server.await {
        error!("gRPC server error: {}", e);
    }

    Ok(())
}
