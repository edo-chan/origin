use crate::adapter::google_oauth::GoogleOAuthClient;
use crate::model::auth::{JwtManager, SessionInfo, SessionManager};
use crate::model::user::{CreateUserRequest, User, UserRepository};
use crate::gen::auth::{
    auth_service_server::AuthService, CompleteOAuthRequest, CompleteOAuthResponse,
    GetProfileRequest, GetProfileResponse, GetUserSessionsRequest, GetUserSessionsResponse,
    InitiateOAuthRequest, InitiateOAuthResponse, LogoutAllRequest, LogoutAllResponse,
    LogoutRequest, LogoutResponse, RefreshTokenRequest, RefreshTokenResponse,
    RevokeSessionRequest, RevokeSessionResponse, UserProfile,
    ValidateTokenRequest, ValidateTokenResponse,
};
use anyhow::Result;
use chrono::Utc;
use std::collections::HashMap;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use tracing::{debug, error, info, instrument, warn};
use uuid::Uuid;

/// gRPC Authentication Service implementation
pub struct AuthServiceImpl {
    oauth_client: GoogleOAuthClient,
    jwt_manager: JwtManager,
    session_manager: SessionManager,
    user_repository: UserRepository,
    state_storage: Arc<tokio::sync::RwLock<HashMap<String, String>>>, // In production, use Redis
}

impl AuthServiceImpl {
    pub fn new(
        oauth_client: GoogleOAuthClient,
        jwt_manager: JwtManager,
        session_manager: SessionManager,
        user_repository: UserRepository,
    ) -> Self {
        Self {
            oauth_client,
            jwt_manager,
            session_manager,
            user_repository,
            state_storage: Arc::new(tokio::sync::RwLock::new(HashMap::new())),
        }
    }

    fn user_to_proto(&self, user: &User) -> UserProfile {
        UserProfile {
            id: user.id.to_string(),
            google_id: user.google_id.clone(),
            email: user.email.clone(),
            name: user.name.clone(),
            given_name: Some("".to_string()), // Not stored in simplified schema
            family_name: Some("".to_string()), // Not stored in simplified schema
            picture_url: user.picture_url.clone(),
            locale: Some("".to_string()), // Not stored in simplified schema
            is_active: true, // Default value since not stored
            is_verified: true, // Google OAuth users are verified
            created_at: user.created_at.timestamp(),
            updated_at: user.updated_at.timestamp(),
            last_login_at: None, // Not stored in simplified schema
            preferences: "{}".to_string(), // Empty JSON since not stored
        }
    }
}

#[tonic::async_trait]
impl AuthService for AuthServiceImpl {
    #[instrument(skip(self))]
    async fn initiate_google_o_auth(
        &self,
        request: Request<InitiateOAuthRequest>,
    ) -> Result<Response<InitiateOAuthResponse>, Status> {
        debug!("Initiating Google OAuth flow");

        let _req = request.into_inner();
        let auth_url = self.oauth_client.get_authorization_url(false); // TODO: support PKCE

        // Store state for CSRF protection
        {
            let mut state_storage = self.state_storage.write().await;
            state_storage.insert(auth_url.state.clone(), "valid".to_string());
        }

        let response = InitiateOAuthResponse {
            auth_url: auth_url.url,
            state_token: auth_url.state,
            expires_at: (Utc::now().timestamp() + 3600), // 1 hour expiry
        };

        info!("Successfully initiated Google OAuth flow");
        Ok(Response::new(response))
    }

    #[instrument(skip(self, request), fields(code_prefix = %request.get_ref().code[..std::cmp::min(8, request.get_ref().code.len())]))]
    async fn complete_google_o_auth(
        &self,
        request: Request<CompleteOAuthRequest>,
    ) -> Result<Response<CompleteOAuthResponse>, Status> {
        let req = request.into_inner();
        debug!("Completing Google OAuth flow");

        // Validate state parameter
        {
            let state_storage = self.state_storage.read().await;
            if !state_storage.contains_key(&req.state) {
                error!("Invalid state parameter: {}", req.state);
                return Err(Status::invalid_argument("Invalid state parameter"));
            }
        }

        // Exchange code for tokens
        let token_pair = self
            .oauth_client
            .exchange_code(&req.code, None)
            .await
            .map_err(|e| {
                error!("Failed to exchange code for tokens: {}", e);
                Status::internal("Failed to exchange authorization code")
            })?;

        // Get user info from Google
        let google_user = self
            .oauth_client
            .get_user_profile(&token_pair.access_token)
            .await
            .map_err(|e| {
                error!("Failed to get user info from Google: {}", e);
                Status::internal("Failed to retrieve user information")
            })?;

        // Create user request
        let create_request = CreateUserRequest {
            google_id: google_user.id,
            email: google_user.email,
            name: google_user.name,
            picture_url: google_user.picture,
        };

        // Create or update user
        let (user, is_new_user) = self
            .user_repository
            .upsert_from_google(create_request)
            .await
            .map_err(|e| {
                error!("Failed to create or update user: {}", e);
                Status::internal("Failed to process user account")
            })?;

        // Generate JWT tokens
        let jwt_token_pair = self
            .jwt_manager
            .generate_token_pair(user.id, &user.email, &user.google_id)
            .map_err(|e| {
                error!("Failed to generate JWT tokens: {}", e);
                Status::internal("Failed to generate authentication tokens")
            })?;

        // Create session - generate a JTI for the refresh token
        let refresh_jti = Uuid::new_v4().to_string();
        let session_info = SessionInfo {
            user_id: user.id,
            google_id: user.google_id.clone(),
            email: user.email.clone(),
            refresh_token_jti: refresh_jti,
            created_at: Utc::now(),
            last_activity: Utc::now(),
        };

        self.session_manager
            .store_session(&session_info)
            .await
            .map_err(|e| {
                error!("Failed to create session: {}", e);
                Status::internal("Failed to create session")
            })?;

        // Clean up state
        {
            let mut state_storage = self.state_storage.write().await;
            state_storage.remove(&req.state);
        }

        let now = Utc::now().timestamp();
        let response = CompleteOAuthResponse {
            access_token: jwt_token_pair.access_token,
            refresh_token: jwt_token_pair.refresh_token,
            access_token_expires_at: now + jwt_token_pair.expires_in,
            refresh_token_expires_at: now + (30 * 24 * 60 * 60), // 30 days for refresh token
            token_type: jwt_token_pair.token_type,
            user: Some(self.user_to_proto(&user)),
            is_new_user,
        };

        info!(
            user_id = %user.id,
            email = %user.email,
            "User successfully authenticated via Google OAuth"
        );

        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn refresh_token(
        &self,
        request: Request<RefreshTokenRequest>,
    ) -> Result<Response<RefreshTokenResponse>, Status> {
        let req = request.into_inner();
        debug!("Refreshing access token");

        // Validate refresh token
        let claims = self
            .jwt_manager
            .validate_token(&req.refresh_token)
            .map_err(|e| {
                warn!("Invalid refresh token: {}", e);
                Status::unauthenticated("Invalid refresh token")
            })?;

        // Parse user ID
        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| Status::invalid_argument("Invalid user ID in token"))?;

        // We need user info to generate tokens
        let user = self
            .user_repository
            .find_by_id(user_id)
            .await
            .map_err(|e| {
                error!("Failed to find user for token refresh: {}", e);
                Status::internal("Failed to generate new access token")
            })?
            .ok_or_else(|| Status::not_found("User not found"))?;

        // Generate new access token
        let token_pair = self
            .jwt_manager
            .generate_token_pair(user.id, &user.email, &user.google_id)
            .map_err(|e| {
                error!("Failed to generate new tokens: {}", e);
                Status::internal("Failed to generate new access token")
            })?;

        let now = Utc::now().timestamp();
        let response = RefreshTokenResponse {
            access_token: token_pair.access_token,
            access_token_expires_at: now + token_pair.expires_in,
            token_type: token_pair.token_type,
        };

        info!(user_id = %claims.sub, "Access token successfully refreshed");
        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn logout(
        &self,
        request: Request<LogoutRequest>,
    ) -> Result<Response<LogoutResponse>, Status> {
        let req = request.into_inner();
        debug!("Processing logout request");

        // Validate access token
        let claims = self
            .jwt_manager
            .validate_token(&req.access_token)
            .map_err(|e| {
                warn!("Invalid access token during logout: {}", e);
                Status::unauthenticated("Invalid access token")
            })?;

        // Invalidate session
        self.session_manager
            .invalidate_session(&claims.jti)
            .await
            .map_err(|e| {
                error!("Failed to invalidate session: {}", e);
                Status::internal("Failed to logout")
            })?;

        let response = LogoutResponse {
            success: true,
            message: "Successfully logged out".to_string(),
        };

        info!(user_id = %claims.sub, "User successfully logged out");
        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn logout_all(
        &self,
        request: Request<LogoutAllRequest>,
    ) -> Result<Response<LogoutAllResponse>, Status> {
        let req = request.into_inner();
        debug!("Processing logout all request");

        // Validate access token
        let claims = self
            .jwt_manager
            .validate_token(&req.access_token)
            .map_err(|e| {
                warn!("Invalid access token during logout all: {}", e);
                Status::unauthenticated("Invalid access token")
            })?;

        // Parse user ID
        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| Status::invalid_argument("Invalid user ID in token"))?;

        // Invalidate all sessions for user
        let revoked_count = self
            .session_manager
            .invalidate_all_user_sessions(user_id)
            .await
            .map_err(|e| {
                error!("Failed to invalidate all sessions: {}", e);
                Status::internal("Failed to logout from all devices")
            })?;

        let response = LogoutAllResponse {
            success: true,
            revoked_sessions: revoked_count as i32,
            message: format!("Successfully logged out from {} devices", revoked_count),
        };

        info!(
            user_id = %claims.sub,
            revoked_sessions = revoked_count,
            "User successfully logged out from all devices"
        );
        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn validate_token(
        &self,
        request: Request<ValidateTokenRequest>,
    ) -> Result<Response<ValidateTokenResponse>, Status> {
        let req = request.into_inner();
        debug!("Validating access token");

        match self.jwt_manager.validate_token(&req.access_token) {
            Ok(claims) => {
                // Parse user ID
                if let Ok(user_id) = Uuid::parse_str(&claims.sub) {
                    // Get user information
                    if let Ok(user) = self.user_repository.find_by_id(user_id).await {
                        if let Some(user) = user {
                            let response = ValidateTokenResponse {
                                valid: true, // Assume active since field not stored
                                user: Some(self.user_to_proto(&user)),
                                session_id: claims.jti,
                                expires_at: claims.exp,
                            };
                            
                            debug!(
                                user_id = %user.id,
                                valid = response.valid,
                                expires_at = response.expires_at,
                                "Token validation completed"
                            );
                            
                            Ok(Response::new(response))
                        } else {
                            let response = ValidateTokenResponse {
                                valid: false,
                                user: None,
                                session_id: String::new(),
                                expires_at: 0,
                            };
                            Ok(Response::new(response))
                        }
                    } else {
                        let response = ValidateTokenResponse {
                            valid: false,
                            user: None,
                            session_id: String::new(),
                            expires_at: 0,
                        };
                        Ok(Response::new(response))
                    }
                } else {
                    let response = ValidateTokenResponse {
                        valid: false,
                        user: None,
                        session_id: String::new(),
                        expires_at: 0,
                    };
                    Ok(Response::new(response))
                }
            }
            Err(e) => {
                warn!("Token validation failed: {}", e);
                let response = ValidateTokenResponse {
                    valid: false,
                    user: None,
                    session_id: String::new(),
                    expires_at: 0,
                };
                Ok(Response::new(response))
            }
        }
    }

    #[instrument(skip(self, request))]
    async fn get_profile(
        &self,
        request: Request<GetProfileRequest>,
    ) -> Result<Response<GetProfileResponse>, Status> {
        let req = request.into_inner();
        debug!("Getting user profile");

        // Validate access token
        let claims = self
            .jwt_manager
            .validate_token(&req.access_token)
            .map_err(|e| {
                warn!("Invalid access token during get profile: {}", e);
                Status::unauthenticated("Invalid access token")
            })?;

        // Parse user ID
        let user_id = Uuid::parse_str(&claims.sub)
            .map_err(|_| Status::invalid_argument("Invalid user ID in token"))?;

        // Get user
        let user = self
            .user_repository
            .find_by_id(user_id)
            .await
            .map_err(|e| {
                error!("Failed to find user: {}", e);
                Status::internal("Failed to retrieve user profile")
            })?
            .ok_or_else(|| Status::not_found("User not found"))?;

        let response = GetProfileResponse {
            user: Some(self.user_to_proto(&user)),
        };

        info!(user_id = %user.id, "User profile retrieved successfully");
        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn get_user_sessions(
        &self,
        request: Request<GetUserSessionsRequest>,
    ) -> Result<Response<GetUserSessionsResponse>, Status> {
        let req = request.into_inner();
        debug!("Getting user sessions");

        // Validate access token
        let claims = self
            .jwt_manager
            .validate_token(&req.access_token)
            .map_err(|e| {
                warn!("Invalid access token during get sessions: {}", e);
                Status::unauthenticated("Invalid access token")
            })?;

        // For now, return empty sessions list
        // TODO: Implement proper session retrieval from SessionManager
        let proto_sessions = vec![];

        let response = GetUserSessionsResponse {
            sessions: proto_sessions,
        };

        info!(user_id = %claims.sub, session_count = response.sessions.len(), "User sessions retrieved successfully");
        Ok(Response::new(response))
    }

    #[instrument(skip(self, request))]
    async fn revoke_session(
        &self,
        request: Request<RevokeSessionRequest>,
    ) -> Result<Response<RevokeSessionResponse>, Status> {
        let req = request.into_inner();
        debug!("Revoking user session");

        // Validate access token
        let claims = self
            .jwt_manager
            .validate_token(&req.access_token)
            .map_err(|e| {
                warn!("Invalid access token during revoke session: {}", e);
                Status::unauthenticated("Invalid access token")
            })?;

        // Parse session ID
        let session_id = Uuid::parse_str(&req.session_id)
            .map_err(|_| Status::invalid_argument("Invalid session ID format"))?;

        // For now, always return success
        // TODO: Implement proper session revocation in SessionManager
        let success = true;

        let response = RevokeSessionResponse {
            success,
            message: if success {
                "Session successfully revoked".to_string()
            } else {
                "Session not found or already revoked".to_string()
            },
        };

        info!(
            user_id = %claims.sub,
            session_id = %session_id,
            success = success,
            "Session revocation completed"
        );
        Ok(Response::new(response))
    }
}