use tonic::{Request, Response, Status};
use tracing::{info, error, instrument};
use crate::model::Database;
use crate::service::{Greeter, HelloRequest, HelloResponse};

#[derive(Debug)]
pub struct GreeterService {
    db: Database,
}

impl GreeterService {
    pub fn new(db: Database) -> Self {
        Self { db }
    }
}

#[tonic::async_trait]
impl Greeter for GreeterService {
    #[instrument(skip(self))]
    async fn say_hello(
        &self,
        request: Request<HelloRequest>,
    ) -> Result<Response<HelloResponse>, Status> {
        let name = request.into_inner().name;
        info!(name = %name, "Processing greeting request");

        let message = format!("Hello {}!", name);

        // Save the greeting to the database
        if let Err(e) = self.db.save_greeting(&name, &message).await {
            error!(error = %e, name = %name, "Failed to save greeting to database");
            return Err(Status::internal("Failed to save greeting"));
        }

        info!(name = %name, message = %message, "Greeting processed successfully");
        let reply = HelloResponse { message };
        Ok(Response::new(reply))
    }
}
