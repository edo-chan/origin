use axum::{extract::Json, response::Json as ResponseJson};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct EchoRequest {
    pub message: String,
}

#[derive(Serialize)]
pub struct EchoResponse {
    pub message: String,
}

pub async fn echo_handler(Json(payload): Json<EchoRequest>) -> ResponseJson<EchoResponse> {
    ResponseJson(EchoResponse {
        message: payload.message,
    })
}