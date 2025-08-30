use crate::adapter::{jwt_service::JwtService, otp_service::OtpService};
use crate::gen::auth::{
    auth_service_server::AuthService, AuthResponse, GetCurrentUserRequest, LogoutRequest,
    LogoutResponse, RefreshTokenRequest, RequestOtpRequest, RequestOtpResponse, User,
    UserResponse, VerifyOtpRequest,
};
use crate::model::user::{CreateUser, UserModel};
use crate::model::session::SessionModel;
use anyhow::Result;
use chrono::Utc;
use sqlx::PgPool;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use tracing::{error, info, instrument};
use uuid::Uuid;

pub struct AuthHandler {
    pool: Arc<PgPool>,
    otp_service: Arc<OtpService>,
    jwt_service: Arc<JwtService>,
}

impl AuthHandler {
    pub fn new(
        pool: Arc<PgPool>,
        otp_service: Arc<OtpService>,
        jwt_service: Arc<JwtService>,
    ) -> Self {
        Self {
            pool,
            otp_service,
            jwt_service,
        }
    }
}

#[tonic::async_trait]
impl AuthService for AuthHandler {
    #[instrument(skip(self, request))]
    async fn request_otp(
        &self,
        request: Request<RequestOtpRequest>,
    ) -> Result<Response<RequestOtpResponse>, Status> {
        let req = request.into_inner();
        let email = req.email.to_lowercase();

        // Validate email format
        if !email.contains('@') || email.len() < 3 {
            return Ok(Response::new(RequestOtpResponse {
                success: false,
                message: "Invalid email format".to_string(),
            }));
        }

        // Check if user exists, if not create one
        let user = match UserModel::find_by_email(&self.pool, &email).await {
            Ok(Some(user)) => user,
            Ok(None) => {
                // Create new user with just email
                let create_user = CreateUser {
                    email: email.clone(),
                    full_name: None,
                };
                UserModel::create(&self.pool, create_user)
                    .await
                    .map_err(|e| {
                        error!("Failed to create user: {}", e);
                        Status::internal("Failed to create user")
                    })?
            }
            Err(e) => {
                error!("Database error: {}", e);
                return Err(Status::internal("Database error"));
            }
        };

        // Send OTP
        match self
            .otp_service
            .send_otp_login(&email, user.full_name, Some(user.id.to_string()))
            .await
        {
            Ok(_) => {
                info!(email = %email, "OTP sent successfully");
                Ok(Response::new(RequestOtpResponse {
                    success: true,
                    message: "OTP sent to your email".to_string(),
                }))
            }
            Err(e) => {
                error!("Failed to send OTP: {}", e);
                Ok(Response::new(RequestOtpResponse {
                    success: false,
                    message: "Failed to send OTP. Please try again.".to_string(),
                }))
            }
        }
    }

    #[instrument(skip(self, request))]
    async fn verify_otp(
        &self,
        request: Request<VerifyOtpRequest>,
    ) -> Result<Response<AuthResponse>, Status> {
        let req = request.into_inner();
        let email = req.email.to_lowercase();
        let code = req.code;

        // Verify OTP
        let is_valid = self
            .otp_service
            .verify_otp(&email, &code)
            .map_err(|e| {
                error!("OTP verification error: {}", e);
                Status::internal("Failed to verify OTP")
            })?;

        if !is_valid {
            return Err(Status::unauthenticated("Invalid or expired OTP"));
        }

        // Get user
        let user = UserModel::find_by_email(&self.pool, &email)
            .await
            .map_err(|e| {
                error!("Database error: {}", e);
                Status::internal("Database error")
            })?
            .ok_or_else(|| Status::not_found("User not found"))?;

        // Generate tokens
        let access_token = self
            .jwt_service
            .generate_access_token(&user.id.to_string())
            .map_err(|e| {
                error!("Failed to generate access token: {}", e);
                Status::internal("Failed to generate token")
            })?;

        let refresh_token = self
            .jwt_service
            .generate_refresh_token(&user.id.to_string())
            .map_err(|e| {
                error!("Failed to generate refresh token: {}", e);
                Status::internal("Failed to generate token")
            })?;

        // Create session
        SessionModel::create(&self.pool, user.id, &refresh_token)
            .await
            .map_err(|e| {
                error!("Failed to create session: {}", e);
                Status::internal("Failed to create session")
            })?;

        info!(user_id = %user.id, email = %email, "User logged in successfully");

        Ok(Response::new(AuthResponse {
            access_token,
            refresh_token,
            user: Some(User {
                id: user.id.to_string(),
                email: user.email,
                full_name: user.full_name.unwrap_or_default(),
                created_at: user.created_at.to_rfc3339(),
            }),
        }))
    }

    #[instrument(skip(self, request))]
    async fn refresh_token(
        &self,
        request: Request<RefreshTokenRequest>,
    ) -> Result<Response<AuthResponse>, Status> {
        let req = request.into_inner();
        let refresh_token = req.refresh_token;

        // Validate refresh token
        let claims = self
            .jwt_service
            .validate_refresh_token(&refresh_token)
            .map_err(|_| Status::unauthenticated("Invalid refresh token"))?;

        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| Status::internal("Invalid user ID in token"))?;

        // Verify session exists
        let session = SessionModel::find_by_token(&self.pool, &refresh_token)
            .await
            .map_err(|e| {
                error!("Database error: {}", e);
                Status::internal("Database error")
            })?
            .ok_or_else(|| Status::unauthenticated("Session not found"))?;

        if session.user_id != user_id {
            return Err(Status::unauthenticated("Invalid session"));
        }

        // Get user
        let user = UserModel::find_by_id(&self.pool, user_id)
            .await
            .map_err(|e| {
                error!("Database error: {}", e);
                Status::internal("Database error")
            })?
            .ok_or_else(|| Status::not_found("User not found"))?;

        // Generate new tokens
        let new_access_token = self
            .jwt_service
            .generate_access_token(&user.id.to_string())
            .map_err(|e| {
                error!("Failed to generate access token: {}", e);
                Status::internal("Failed to generate token")
            })?;

        let new_refresh_token = self
            .jwt_service
            .generate_refresh_token(&user.id.to_string())
            .map_err(|e| {
                error!("Failed to generate refresh token: {}", e);
                Status::internal("Failed to generate token")
            })?;

        // Update session with new refresh token
        SessionModel::update_token(&self.pool, session.id, &new_refresh_token)
            .await
            .map_err(|e| {
                error!("Failed to update session: {}", e);
                Status::internal("Failed to update session")
            })?;

        Ok(Response::new(AuthResponse {
            access_token: new_access_token,
            refresh_token: new_refresh_token,
            user: Some(User {
                id: user.id.to_string(),
                email: user.email,
                full_name: user.full_name.unwrap_or_default(),
                created_at: user.created_at.to_rfc3339(),
            }),
        }))
    }

    #[instrument(skip(self, request))]
    async fn logout_user(
        &self,
        request: Request<LogoutRequest>,
    ) -> Result<Response<LogoutResponse>, Status> {
        let req = request.into_inner();
        let access_token = req.access_token;

        // Validate access token
        let claims = self
            .jwt_service
            .validate_access_token(&access_token)
            .map_err(|_| Status::unauthenticated("Invalid access token"))?;

        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| Status::internal("Invalid user ID in token"))?;

        // Delete all sessions for this user
        SessionModel::delete_by_user_id(&self.pool, user_id)
            .await
            .map_err(|e| {
                error!("Failed to delete sessions: {}", e);
                Status::internal("Failed to logout")
            })?;

        info!(user_id = %user_id, "User logged out successfully");

        Ok(Response::new(LogoutResponse {
            success: true,
            message: "Logged out successfully".to_string(),
        }))
    }

    #[instrument(skip(self, request))]
    async fn get_current_user(
        &self,
        request: Request<GetCurrentUserRequest>,
    ) -> Result<Response<UserResponse>, Status> {
        let req = request.into_inner();
        let access_token = req.access_token;

        // Validate access token
        let claims = self
            .jwt_service
            .validate_access_token(&access_token)
            .map_err(|_| Status::unauthenticated("Invalid access token"))?;

        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| Status::internal("Invalid user ID in token"))?;

        // Get user
        let user = UserModel::find_by_id(&self.pool, user_id)
            .await
            .map_err(|e| {
                error!("Database error: {}", e);
                Status::internal("Database error")
            })?
            .ok_or_else(|| Status::not_found("User not found"))?;

        Ok(Response::new(UserResponse {
            user: Some(User {
                id: user.id.to_string(),
                email: user.email,
                full_name: user.full_name.unwrap_or_default(),
                created_at: user.created_at.to_rfc3339(),
            }),
        }))
    }
}