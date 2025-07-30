use tonic::{Request, Response, Status};
use tracing::{info, error, instrument};
use crate::model::greeting::GreetingRepository;
use crate::gen::{greeter_server::Greeter, HelloRequest, HelloResponse};

#[derive(Debug)]
pub struct GreeterHandler {
    greeting_repo: GreetingRepository,
}

impl GreeterHandler {
    pub fn new(greeting_repo: GreetingRepository) -> Self {
        Self { greeting_repo }
    }
}

#[tonic::async_trait]
impl Greeter for GreeterHandler {
    #[instrument(skip(self))]
    async fn say_hello(
        &self,
        request: Request<HelloRequest>,
    ) -> Result<Response<HelloResponse>, Status> {
        let name = request.into_inner().name;
        info!(name = %name, "Processing greeting request");

        let message = format!("Hello {}!", name);

        // Save the greeting to the database
        if let Err(e) = self.greeting_repo.save_greeting(&name, &message).await {
            error!(error = %e, name = %name, "Failed to save greeting to database");
            return Err(Status::internal("Failed to save greeting"));
        }

        info!(name = %name, message = %message, "Greeting processed successfully");
        let reply = HelloResponse { message };
        Ok(Response::new(reply))
    }
}
