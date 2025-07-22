use tonic::{Request, Response, Status};
use crate::model::Database;
use crate::service::greeter_server::Greeter;
use crate::service::{HelloRequest, HelloResponse};

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
    async fn say_hello(
        &self,
        request: Request<HelloRequest>,
    ) -> Result<Response<HelloResponse>, Status> {
        println!("Got a request: {:?}", request);

        let name = request.into_inner().name;
        let message = format!("Hello {}!", name);

        // Save the greeting to the database
        if let Err(e) = self.db.save_greeting(&name, &message).await {
            eprintln!("Error saving greeting: {}", e);
            return Err(Status::internal("Failed to save greeting"));
        }

        let reply = HelloResponse { message };
        Ok(Response::new(reply))
    }
}
