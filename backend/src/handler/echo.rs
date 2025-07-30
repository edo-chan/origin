use axum::{extract::Json, response::Json as ResponseJson};
use serde::{Deserialize, Serialize};
use tracing::{info, instrument};

#[derive(Debug, Deserialize)]
pub struct EchoRequest {
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct EchoResponse {
    pub message: String,
}

#[instrument]
pub async fn echo_handler(Json(payload): Json<EchoRequest>) -> ResponseJson<EchoResponse> {
    info!(message = %payload.message, "Processing echo request");
    
    let response = EchoResponse {
        message: payload.message,
    };
    
    info!(response_message = %response.message, "Echo request processed successfully");
    ResponseJson(response)
}