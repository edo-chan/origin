use crate::adapter::google_oauth::GoogleOAuthClient;
use crate::model::auth::{JwtManager, SessionInfo, SessionManager};
use crate::model::user::{CreateUserRequest, UpdateUserRequest, User, UserRepository};
use crate::gen::auth::{
    auth_service_server::AuthService, CompleteOAuthRequest, CompleteOAuthResponse,
    GetProfileRequest, GetProfileResponse, GetUserSessionsRequest, GetUserSessionsResponse,
    InitiateOAuthRequest, InitiateOAuthResponse, LogoutAllRequest, LogoutAllResponse,
    LogoutRequest, LogoutResponse, RefreshTokenRequest, RefreshTokenResponse,
    RevokeSessionRequest, RevokeSessionResponse, UserProfile, UserSession,
    ValidateTokenRequest, ValidateTokenResponse,
};
use anyhow::Result;
use chrono::Utc;
use prost_types::Timestamp;
use std::collections::HashMap;
use std::sync::Arc;
use tonic::{Request, Response, Status};
use tracing::{debug, error, info, instrument, warn};
use uuid::Uuid;

/// gRPC Authentication Service implementation
#[derive(Debug)]
pub struct AuthServiceImpl {
    oauth_client: GoogleOAuthClient,
    jwt_manager: JwtManager,
    session_manager: SessionManager,
    user_repository: UserRepository,
    state_storage: Arc<tokio::sync::RwLock<HashMap<String, String>>>, // In production, use Redis
}

impl AuthServiceImpl {
    /// Create a new authentication service
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

    /// Convert domain User to protobuf User
    fn user_to_proto(&self, user: &User) -> crate::gen::auth::User {
        crate::gen::auth::User {
            id: user.id.to_string(),
            google_id: user.google_id.clone(),
            email: user.email.clone(),
            name: user.name.clone(),
            given_name: user.given_name.clone().unwrap_or_default(),
            family_name: user.family_name.clone().unwrap_or_default(),
            picture_url: user.picture_url.clone().unwrap_or_default(),
            locale: user.locale.clone().unwrap_or_default(),
            is_active: user.is_active,
            is_verified: user.is_verified,
            created_at: Some(Timestamp {
                seconds: user.created_at.timestamp(),
                nanos: user.created_at.timestamp_subsec_nanos() as i32,
            }),
            updated_at: Some(Timestamp {
                seconds: user.updated_at.timestamp(),
                nanos: user.updated_at.timestamp_subsec_nanos() as i32,
            }),
            last_login_at: user.last_login_at.map(|dt| Timestamp {
                seconds: dt.timestamp(),
                nanos: dt.timestamp_subsec_nanos() as i32,
            }),
            preferences: user.preferences.to_string(),
        }
    }

    /// Create error response
    fn create_error(code: AuthErrorCode, message: &str, details: &str) -> Status {
        let auth_error = AuthError {
            code: code as i32,
            message: message.to_string(),
            details: details.to_string(),
        };

        let error_json = serde_json::to_string(&auth_error).unwrap_or_default();
        
        match code {
            AuthErrorCode::AuthErrorInvalidToken 
            | AuthErrorCode::AuthErrorInvalidCode 
            | AuthErrorCode::AuthErrorInvalidState => Status::unauthenticated(error_json),
            AuthErrorCode::AuthErrorUserNotFound 
            | AuthErrorCode::AuthErrorAccountInactive => Status::not_found(error_json),
            AuthErrorCode::AuthErrorInsufficientPermissions => Status::permission_denied(error_json),
            AuthErrorCode::AuthErrorRateLimited => Status::resource_exhausted(error_json),
            AuthErrorCode::AuthErrorOauthProvider => Status::external(error_json),
            _ => Status::internal(error_json),
        }
    }

    /// Extract user ID from JWT token in request headers
    async fn extract_user_from_request(&self, request: &Request<()>) -> Result<User, Status> {
        let auth_header = request
            .metadata()
            .get("authorization")
            .and_then(|h| h.to_str().ok())
            .ok_or_else(|| {
                Self::create_error(
                    AuthErrorCode::AuthErrorInvalidToken,
                    "Missing authorization header",
                    "Authorization header is required for this endpoint",
                )
            })?;

        let token = JwtManager::extract_token_from_header(auth_header).map_err(|e| {
            Self::create_error(
                AuthErrorCode::AuthErrorInvalidToken,
                "Invalid authorization header",
                &e.to_string(),
            )
        })?;

        let claims = self.jwt_manager.validate_token(token).map_err(|e| {
            Self::create_error(
                AuthErrorCode::AuthErrorInvalidToken,
                "Invalid or expired token",
                &e.to_string(),
            )
        })?;

        let user_id = Uuid::parse_str(&claims.sub).map_err(|e| {
            Self::create_error(
                AuthErrorCode::AuthErrorInvalidToken,
                "Invalid user ID in token",
                &e.to_string(),
            )
        })?;

        let user = self
            .user_repository
            .find_by_id(user_id)
            .await
            .map_err(|e| {
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Database error",
                    &e.to_string(),
                )
            })?
            .ok_or_else(|| {
                Self::create_error(
                    AuthErrorCode::AuthErrorUserNotFound,
                    "User not found",
                    "The user associated with this token no longer exists",
                )
            })?;

        if !user.is_active {
            return Err(Self::create_error(
                AuthErrorCode::AuthErrorAccountInactive,
                "Account inactive",
                "This account has been deactivated",
            ));
        }

        Ok(user)
    }
}

#[tonic::async_trait]
impl AuthService for AuthServiceImpl {
    /// Get OAuth authorization URL for frontend to redirect users
    #[instrument(skip(self), fields(use_pkce = request.get_ref().use_pkce))]
    async fn get_authorization_url(
        &self,
        request: Request<GetAuthorizationUrlRequest>,
    ) -> Result<Response<GetAuthorizationUrlResponse>, Status> {
        debug!("Generating OAuth authorization URL");

        let req = request.into_inner();
        let auth_url = self.oauth_client.get_authorization_url(req.use_pkce);

        // Store state for CSRF protection (in production, use Redis with TTL)
        {
            let mut state_storage = self.state_storage.write().await;
            state_storage.insert(auth_url.state.clone(), "valid".to_string());
        }

        let response = GetAuthorizationUrlResponse {
            authorization_url: auth_url.url,
            state: auth_url.state,
            pkce_verifier: auth_url.pkce_verifier.unwrap_or_default(),
        };

        info!("Successfully generated OAuth authorization URL");
        Ok(Response::new(response))
    }

    /// Exchange OAuth authorization code for JWT tokens
    #[instrument(skip(self, request), fields(code_prefix = %request.get_ref().code[..std::cmp::min(8, request.get_ref().code.len())]))]
    async fn exchange_code(
        &self,
        request: Request<ExchangeCodeRequest>,
    ) -> Result<Response<ExchangeCodeResponse>, Status> {
        debug!("Exchanging OAuth authorization code for tokens");

        let req = request.into_inner();

        // Validate CSRF state
        {
            let state_storage = self.state_storage.read().await;
            if !state_storage.contains_key(&req.state) {
                warn!(state = %req.state, "Invalid or expired state parameter");
                return Err(Self::create_error(
                    AuthErrorCode::AuthErrorInvalidState,
                    "Invalid state parameter",
                    "The state parameter is invalid or has expired",
                ));
            }
        }

        // Exchange code for OAuth token
        let oauth_token = self
            .oauth_client
            .exchange_code(&req.code, if req.pkce_verifier.is_empty() { None } else { Some(req.pkce_verifier) })
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to exchange OAuth code");
                Self::create_error(
                    AuthErrorCode::AuthErrorOauthProvider,
                    "OAuth exchange failed",
                    &e.to_string(),
                )
            })?;

        // Get user profile from Google
        let google_user = self
            .oauth_client
            .get_user_profile(&oauth_token.access_token)
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to get user profile from Google");
                Self::create_error(
                    AuthErrorCode::AuthErrorOauthProvider,
                    "Failed to get user profile",
                    &e.to_string(),
                )
            })?;

        // Create or update user in database
        let create_request = CreateUserRequest {
            google_id: google_user.id,
            email: google_user.email,
            name: google_user.name,
            given_name: google_user.given_name,
            family_name: google_user.family_name,
            picture_url: google_user.picture,
            locale: google_user.locale,
        };

        let (user, is_new_user) = self
            .user_repository
            .upsert_from_google(create_request)
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to create/update user in database");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Database error",
                    &e.to_string(),
                )
            })?;

        // Update last login timestamp
        if let Err(e) = self.user_repository.update_last_login(user.id).await {
            warn!(user_id = %user.id, error = %e, "Failed to update last login timestamp");
        }

        // Generate JWT tokens
        let token_pair = self
            .jwt_manager
            .generate_token_pair(user.id, &user.email, &user.google_id)
            .map_err(|e| {
                error!(error = %e, "Failed to generate JWT tokens");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Token generation failed",
                    &e.to_string(),
                )
            })?;

        // Validate refresh token to get JTI for session storage
        let refresh_claims = self
            .jwt_manager
            .validate_token(&token_pair.refresh_token)
            .map_err(|e| {
                error!(error = %e, "Failed to validate generated refresh token");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Token validation failed",
                    &e.to_string(),
                )
            })?;

        // Store session information
        let session = SessionInfo {
            user_id: user.id,
            google_id: user.google_id.clone(),
            email: user.email.clone(),
            refresh_token_jti: refresh_claims.jti,
            created_at: Utc::now(),
            last_activity: Utc::now(),
        };

        if let Err(e) = self.session_manager.store_session(&session).await {
            warn!(error = %e, "Failed to store session information");
        }

        // Clean up state storage
        {
            let mut state_storage = self.state_storage.write().await;
            state_storage.remove(&req.state);
        }

        let response = ExchangeCodeResponse {
            access_token: token_pair.access_token,
            refresh_token: token_pair.refresh_token,
            expires_in: token_pair.expires_in,
            user: Some(self.user_to_proto(&user)),
            is_new_user,
        };

        info!(
            user_id = %user.id,
            is_new_user = is_new_user,
            "Successfully exchanged OAuth code for JWT tokens"
        );

        Ok(Response::new(response))
    }

    /// Refresh JWT tokens using refresh token
    #[instrument(skip(self, request))]
    async fn refresh_token(
        &self,
        request: Request<RefreshTokenRequest>,
    ) -> Result<Response<RefreshTokenResponse>, Status> {
        debug!("Refreshing JWT tokens");

        let req = request.into_inner();

        // Validate refresh token
        let claims = self
            .jwt_manager
            .validate_token(&req.refresh_token)
            .map_err(|e| {
                warn!(error = %e, "Invalid refresh token");
                Self::create_error(
                    AuthErrorCode::AuthErrorInvalidToken,
                    "Invalid or expired refresh token",
                    &e.to_string(),
                )
            })?;

        // Ensure it's actually a refresh token
        if claims.token_type != "refresh" {
            return Err(Self::create_error(
                AuthErrorCode::AuthErrorInvalidToken,
                "Invalid token type",
                "Expected refresh token",
            ));
        }

        // Verify session exists
        let session = self
            .session_manager
            .get_session(&claims.jti)
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to retrieve session");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Session retrieval failed",
                    &e.to_string(),
                )
            })?
            .ok_or_else(|| {
                warn!(refresh_token_jti = %claims.jti, "Session not found");
                Self::create_error(
                    AuthErrorCode::AuthErrorInvalidToken,
                    "Session not found",
                    "The session associated with this token no longer exists",
                )
            })?;

        // Get user to ensure they still exist and are active
        let user = self
            .user_repository
            .find_by_id(session.user_id)
            .await
            .map_err(|e| {
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Database error",
                    &e.to_string(),
                )
            })?
            .ok_or_else(|| {
                Self::create_error(
                    AuthErrorCode::AuthErrorUserNotFound,
                    "User not found",
                    "The user associated with this token no longer exists",
                )
            })?;

        if !user.is_active {
            return Err(Self::create_error(
                AuthErrorCode::AuthErrorAccountInactive,
                "Account inactive",
                "This account has been deactivated",
            ));
        }

        // Generate new token pair
        let token_pair = self
            .jwt_manager
            .generate_token_pair(user.id, &user.email, &user.google_id)
            .map_err(|e| {
                error!(error = %e, "Failed to generate new JWT tokens");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Token generation failed",
                    &e.to_string(),
                )
            })?;

        // Update session activity
        if let Err(e) = self.session_manager.update_session_activity(&claims.jti).await {
            warn!(error = %e, "Failed to update session activity");
        }

        let response = RefreshTokenResponse {
            access_token: token_pair.access_token,
            refresh_token: token_pair.refresh_token,
            expires_in: token_pair.expires_in,
        };

        info!(user_id = %user.id, "Successfully refreshed JWT tokens");
        Ok(Response::new(response))
    }

    /// Validate JWT token and get user information
    #[instrument(skip(self, request))]
    async fn validate_token(
        &self,
        request: Request<ValidateTokenRequest>,
    ) -> Result<Response<ValidateTokenResponse>, Status> {
        debug!("Validating JWT token");

        let req = request.into_inner();

        match self.jwt_manager.validate_token(&req.access_token) {
            Ok(claims) => {
                // Get user information
                let user_id = Uuid::parse_str(&claims.sub).map_err(|e| {
                    Self::create_error(
                        AuthErrorCode::AuthErrorInvalidToken,
                        "Invalid user ID in token",
                        &e.to_string(),
                    )
                })?;

                let user = self
                    .user_repository
                    .find_by_id(user_id)
                    .await
                    .map_err(|e| {
                        Self::create_error(
                            AuthErrorCode::AuthErrorUnknown,
                            "Database error",
                            &e.to_string(),
                        )
                    })?;

                let response = ValidateTokenResponse {
                    is_valid: user.is_some() && user.as_ref().unwrap().is_active,
                    user: user.map(|u| self.user_to_proto(&u)),
                    expires_at: Some(Timestamp {
                        seconds: claims.exp,
                        nanos: 0,
                    }),
                };

                debug!(
                    is_valid = response.is_valid,
                    user_id = %user_id,
                    "Token validation completed"
                );

                Ok(Response::new(response))
            }
            Err(e) => {
                warn!(error = %e, "Token validation failed");
                let response = ValidateTokenResponse {
                    is_valid: false,
                    user: None,
                    expires_at: None,
                };
                Ok(Response::new(response))
            }
        }
    }

    /// Get current user profile information
    #[instrument(skip(self))]
    async fn get_user_profile(
        &self,
        request: Request<GetUserProfileRequest>,
    ) -> Result<Response<GetUserProfileResponse>, Status> {
        debug!("Getting user profile");

        let user = self.extract_user_from_request(&request).await?;

        let response = GetUserProfileResponse {
            user: Some(self.user_to_proto(&user)),
        };

        info!(user_id = %user.id, "Successfully retrieved user profile");
        Ok(Response::new(response))
    }

    /// Update user profile information
    #[instrument(skip(self), fields(user_id))]
    async fn update_user_profile(
        &self,
        request: Request<UpdateUserProfileRequest>,
    ) -> Result<Response<UpdateUserProfileResponse>, Status> {
        debug!("Updating user profile");

        let user = self.extract_user_from_request(&request).await?;
        tracing::Span::current().record("user_id", &user.id.to_string());

        let req = request.into_inner();

        let update_request = UpdateUserRequest {
            name: if req.name.is_empty() { None } else { Some(req.name) },
            given_name: if req.given_name.is_empty() { None } else { Some(req.given_name) },
            family_name: if req.family_name.is_empty() { None } else { Some(req.family_name) },
            picture_url: None, // Don't allow updating picture URL through this endpoint
            locale: None,      // Don't allow updating locale through this endpoint
            preferences: if req.preferences.is_empty() {
                None
            } else {
                match serde_json::from_str(&req.preferences) {
                    Ok(prefs) => Some(prefs),
                    Err(e) => {
                        return Err(Self::create_error(
                            AuthErrorCode::AuthErrorUnknown,
                            "Invalid preferences JSON",
                            &e.to_string(),
                        ));
                    }
                }
            },
        };

        let updated_user = self
            .user_repository
            .update_user(user.id, update_request)
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to update user profile");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Database error",
                    &e.to_string(),
                )
            })?;

        let response = UpdateUserProfileResponse {
            user: Some(self.user_to_proto(&updated_user)),
        };

        info!(user_id = %updated_user.id, "Successfully updated user profile");
        Ok(Response::new(response))
    }

    /// Logout user and invalidate session
    #[instrument(skip(self, request))]
    async fn logout(
        &self,
        request: Request<LogoutRequest>,
    ) -> Result<Response<LogoutResponse>, Status> {
        debug!("Logging out user");

        let req = request.into_inner();

        // Validate token to get JTI
        let claims = self
            .jwt_manager
            .validate_token(&req.access_token)
            .map_err(|e| {
                warn!(error = %e, "Invalid access token for logout");
                Self::create_error(
                    AuthErrorCode::AuthErrorInvalidToken,
                    "Invalid or expired token",
                    &e.to_string(),
                )
            })?;

        // Find corresponding refresh token session and invalidate it
        // This is a simplified approach - in production, you might store access token JTIs too
        let user_id = Uuid::parse_str(&claims.sub).map_err(|e| {
            Self::create_error(
                AuthErrorCode::AuthErrorInvalidToken,
                "Invalid user ID in token",
                &e.to_string(),
            )
        })?;

        // For now, invalidate all user sessions (logout all devices)
        // In production, you might want to track individual sessions more precisely
        let invalidated_count = self
            .session_manager
            .invalidate_all_user_sessions(user_id)
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to invalidate user sessions");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Session invalidation failed",
                    &e.to_string(),
                )
            })?;

        let response = LogoutResponse {
            success: true,
        };

        info!(
            user_id = %user_id,
            invalidated_sessions = invalidated_count,
            "Successfully logged out user"
        );

        Ok(Response::new(response))
    }

    /// Delete user account (GDPR compliance)
    #[instrument(skip(self))]
    async fn delete_account(
        &self,
        request: Request<DeleteAccountRequest>,
    ) -> Result<Response<DeleteAccountResponse>, Status> {
        debug!("Deleting user account");

        let user = self.extract_user_from_request(&request).await?;
        let req = request.into_inner();

        // Require explicit confirmation
        if req.confirmation != "DELETE" {
            return Err(Self::create_error(
                AuthErrorCode::AuthErrorUnknown,
                "Invalid confirmation",
                "You must provide 'DELETE' as confirmation to delete your account",
            ));
        }

        // Invalidate all user sessions first
        if let Err(e) = self.session_manager.invalidate_all_user_sessions(user.id).await {
            error!(error = %e, "Failed to invalidate user sessions during account deletion");
        }

        // Soft delete user account
        self.user_repository
            .delete_user(user.id)
            .await
            .map_err(|e| {
                error!(error = %e, "Failed to delete user account");
                Self::create_error(
                    AuthErrorCode::AuthErrorUnknown,
                    "Account deletion failed",
                    &e.to_string(),
                )
            })?;

        let response = DeleteAccountResponse {
            success: true,
        };

        info!(user_id = %user.id, "Successfully deleted user account");
        Ok(Response::new(response))
    }
}