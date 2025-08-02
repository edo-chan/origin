use anyhow::{Context, Result};
use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
    ClientSecret, CsrfToken, RedirectUrl, RefreshToken, Scope, TokenResponse as OAuth2TokenResponse,
    TokenUrl,
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{debug, error, info, instrument, warn};

/// Configuration for Google OAuth 2.0 client
#[derive(Debug, Clone)]
pub struct GoogleOAuthConfig {
    /// Google OAuth client ID
    pub client_id: String,
    /// Google OAuth client secret
    pub client_secret: String,
    /// Redirect URI for OAuth callback
    pub redirect_uri: String,
    /// OAuth scopes to request
    pub scopes: Vec<String>,
    /// Request timeout in seconds
    pub timeout_seconds: u64,
    /// Maximum number of retries for failed requests
    pub max_retries: u32,
}

impl Default for GoogleOAuthConfig {
    fn default() -> Self {
        Self {
            client_id: String::new(),
            client_secret: String::new(),
            redirect_uri: "http://localhost:3000/auth/callback".to_string(),
            scopes: vec![
                "openid".to_string(),
                "email".to_string(),
                "profile".to_string(),
            ],
            timeout_seconds: 30,
            max_retries: 3,
        }
    }
}

/// Google user profile information from OAuth
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoogleUser {
    pub id: String,
    pub email: String,
    pub name: String,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub picture: Option<String>,
    pub locale: Option<String>,
    pub verified_email: Option<bool>,
}

/// OAuth authorization URL with state
#[derive(Debug, Clone)]
pub struct AuthorizationUrl {
    pub url: String,
    pub state: String,
}

/// OAuth token response
#[derive(Debug, Clone)]
pub struct TokenResponse {
    pub access_token: String,
    pub refresh_token: Option<String>,
    pub expires_in: Option<u64>,
    pub token_type: String,
    pub scope: Option<String>,
}

/// Google OAuth 2.0 client for handling authentication flows
#[derive(Debug)]
pub struct GoogleOAuthClient {
    config: GoogleOAuthConfig,
    oauth_client: BasicClient,
    http_client: Client,
}

impl GoogleOAuthClient {
    /// Create a new Google OAuth client with the given configuration
    pub fn new(config: GoogleOAuthConfig) -> Result<Self> {
        let oauth_client = BasicClient::new(
            ClientId::new(config.client_id.clone()),
            Some(ClientSecret::new(config.client_secret.clone())),
            AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
                .context("Invalid Google OAuth authorization URL")?,
            Some(
                TokenUrl::new("https://oauth2.googleapis.com/token".to_string())
                    .context("Invalid Google OAuth token URL")?,
            ),
        )
        .set_redirect_uri(
            RedirectUrl::new(config.redirect_uri.clone())
                .context("Invalid redirect URI")?,
        );

        let http_client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .context("Failed to create HTTP client")?;

        Ok(Self {
            config,
            oauth_client,
            http_client,
        })
    }

    /// Create a new Google OAuth client from environment variables
    pub fn from_env() -> Result<Self> {
        let client_id = std::env::var("GOOGLE_OAUTH_CLIENT_ID")
            .context("GOOGLE_OAUTH_CLIENT_ID environment variable not set")?;
        let client_secret = std::env::var("GOOGLE_OAUTH_CLIENT_SECRET")
            .context("GOOGLE_OAUTH_CLIENT_SECRET environment variable not set")?;

        let config = GoogleOAuthConfig {
            client_id,
            client_secret,
            redirect_uri: std::env::var("GOOGLE_OAUTH_REDIRECT_URI")
                .unwrap_or_else(|_| "http://localhost:3000/auth/callback".to_string()),
            scopes: std::env::var("GOOGLE_OAUTH_SCOPES")
                .unwrap_or_else(|_| "openid,email,profile".to_string())
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),
            timeout_seconds: std::env::var("GOOGLE_OAUTH_TIMEOUT_SECONDS")
                .unwrap_or_else(|_| "30".to_string())
                .parse()
                .unwrap_or(30),
            max_retries: std::env::var("GOOGLE_OAUTH_MAX_RETRIES")
                .unwrap_or_else(|_| "3".to_string())
                .parse()
                .unwrap_or(3),
        };

        Self::new(config)
    }

    /// Generate authorization URL for OAuth flow
    #[instrument(skip(self))]
    pub fn get_authorization_url(&self, _use_pkce: bool) -> AuthorizationUrl {
        debug!("Generating OAuth authorization URL");

        let mut auth_request = self.oauth_client.authorize_url(CsrfToken::new_random);

        // Add requested scopes
        for scope in &self.config.scopes {
            auth_request = auth_request.add_scope(Scope::new(scope.clone()));
        }

        let (auth_url, csrf_state) = auth_request.url();

        let result = AuthorizationUrl {
            url: auth_url.to_string(),
            state: csrf_state.secret().clone(),
        };

        info!(
            url = %result.url,
            state = %result.state,
            "Generated OAuth authorization URL"
        );

        result
    }

    /// Exchange authorization code for access token
    #[instrument(skip(self), fields(code_prefix = %code[..std::cmp::min(8, code.len())]))]
    pub async fn exchange_code(
        &self,
        code: &str,
        _pkce_verifier: Option<String>,
    ) -> Result<TokenResponse> {
        debug!("Exchanging authorization code for access token");

        let mut attempt = 0;
        let mut last_error = None;

        while attempt < self.config.max_retries {
            debug!(
                attempt = attempt + 1,
                max_retries = self.config.max_retries,
                "Attempting token exchange"
            );

            // Create a new token request for each attempt to avoid ownership issues
            let token_request = self
                .oauth_client
                .exchange_code(AuthorizationCode::new(code.to_string()));

            match token_request.request_async(async_http_client).await {
                Ok(token_response) => {
                    let result = TokenResponse {
                        access_token: token_response.access_token().secret().clone(),
                        refresh_token: token_response.refresh_token().map(|t| t.secret().clone()),
                        expires_in: token_response.expires_in().map(|d| d.as_secs()),
                        token_type: token_response.token_type().as_ref().to_string(),
                        scope: token_response.scopes().map(|scopes| {
                            scopes
                                .iter()
                                .map(|s| s.as_ref())
                                .collect::<Vec<_>>()
                                .join(" ")
                        }),
                    };

                    info!(
                        token_type = %result.token_type,
                        has_refresh_token = result.refresh_token.is_some(),
                        expires_in = result.expires_in,
                        "Successfully exchanged code for token"
                    );

                    return Ok(result);
                }
                Err(e) => {
                    let error = anyhow::anyhow!("Token exchange failed: {}", e);
                    error!(
                        error = %e,
                        attempt = attempt + 1,
                        "Failed to exchange authorization code"
                    );
                    last_error = Some(error);
                }
            }

            attempt += 1;

            if attempt < self.config.max_retries {
                let delay = std::time::Duration::from_millis(1000 * 2_u64.pow(attempt - 1));
                debug!(
                    delay_ms = delay.as_millis(),
                    "Retrying token exchange after delay"
                );
                tokio::time::sleep(delay).await;
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("All token exchange attempts failed")))
    }

    /// Refresh an access token using a refresh token
    #[instrument(skip(self, refresh_token))]
    pub async fn refresh_token(&self, refresh_token: &str) -> Result<TokenResponse> {
        debug!("Refreshing access token");

        let mut attempt = 0;
        let mut last_error = None;

        while attempt < self.config.max_retries {
            debug!(
                attempt = attempt + 1,
                max_retries = self.config.max_retries,
                "Attempting token refresh"
            );

            // Create a new refresh token and request for each attempt to avoid ownership issues
            let refresh_token_obj = RefreshToken::new(refresh_token.to_string());
            let token_request = self
                .oauth_client
                .exchange_refresh_token(&refresh_token_obj);

            match token_request.request_async(async_http_client).await {
                Ok(token_response) => {
                    let result = TokenResponse {
                        access_token: token_response.access_token().secret().clone(),
                        refresh_token: token_response.refresh_token().map(|t| t.secret().clone()),
                        expires_in: token_response.expires_in().map(|d| d.as_secs()),
                        token_type: token_response.token_type().as_ref().to_string(),
                        scope: token_response.scopes().map(|scopes| {
                            scopes
                                .iter()
                                .map(|s| s.as_ref())
                                .collect::<Vec<_>>()
                                .join(" ")
                        }),
                    };

                    info!(
                        token_type = %result.token_type,
                        expires_in = result.expires_in,
                        "Successfully refreshed access token"
                    );

                    return Ok(result);
                }
                Err(e) => {
                    let error = anyhow::anyhow!("Token refresh failed: {}", e);
                    error!(
                        error = %e,
                        attempt = attempt + 1,
                        "Failed to refresh token"
                    );
                    last_error = Some(error);
                }
            }

            attempt += 1;

            if attempt < self.config.max_retries {
                let delay = std::time::Duration::from_millis(1000 * 2_u64.pow(attempt - 1));
                debug!(
                    delay_ms = delay.as_millis(),
                    "Retrying token refresh after delay"
                );
                tokio::time::sleep(delay).await;
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("All token refresh attempts failed")))
    }

    /// Get user profile information from Google using access token
    #[instrument(skip(self, access_token))]
    pub async fn get_user_profile(&self, access_token: &str) -> Result<GoogleUser> {
        debug!("Fetching user profile from Google");

        let url = "https://www.googleapis.com/oauth2/v2/userinfo";
        let mut attempt = 0;
        let mut last_error = None;

        while attempt < self.config.max_retries {
            debug!(
                attempt = attempt + 1,
                max_retries = self.config.max_retries,
                "Attempting to fetch user profile"
            );

            let response = self
                .http_client
                .get(url)
                .bearer_auth(access_token)
                .send()
                .await;

            match response {
                Ok(resp) if resp.status().is_success() => {
                    match resp.json::<GoogleUser>().await {
                        Ok(user) => {
                            info!(
                                user_id = %user.id,
                                email = %user.email,
                                name = %user.name,
                                verified_email = user.verified_email,
                                "Successfully fetched user profile from Google"
                            );
                            return Ok(user);
                        }
                        Err(e) => {
                            let error = anyhow::anyhow!("Failed to parse user profile: {}", e);
                            error!(
                                error = %e,
                                attempt = attempt + 1,
                                "Failed to parse Google user profile response"
                            );
                            last_error = Some(error);
                        }
                    }
                }
                Ok(resp) => {
                    let status = resp.status();
                    let error_text = resp
                        .text()
                        .await
                        .unwrap_or_else(|_| "Unknown error".to_string());

                    let error = anyhow::anyhow!(
                        "Google API error: {} - {}",
                        status,
                        error_text
                    );

                    error!(
                        status = %status,
                        error = %error_text,
                        attempt = attempt + 1,
                        "Google userinfo API returned error"
                    );

                    last_error = Some(error);
                }
                Err(e) => {
                    let error = anyhow::anyhow!("Request failed: {}", e);
                    error!(
                        error = %e,
                        attempt = attempt + 1,
                        "Failed to send request to Google userinfo API"
                    );
                    last_error = Some(error);
                }
            }

            attempt += 1;

            if attempt < self.config.max_retries {
                let delay = std::time::Duration::from_millis(1000 * 2_u64.pow(attempt - 1));
                debug!(
                    delay_ms = delay.as_millis(),
                    "Retrying user profile fetch after delay"
                );
                tokio::time::sleep(delay).await;
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("All user profile fetch attempts failed")))
    }

    /// Validate an access token by making a request to Google's tokeninfo endpoint
    #[instrument(skip(self, access_token))]
    pub async fn validate_token(&self, access_token: &str) -> Result<HashMap<String, serde_json::Value>> {
        debug!("Validating access token with Google");

        let url = format!("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token={}", access_token);
        
        let response = self
            .http_client
            .get(&url)
            .send()
            .await
            .context("Failed to send token validation request")?;

        if response.status().is_success() {
            let token_info: HashMap<String, serde_json::Value> = response
                .json()
                .await
                .context("Failed to parse token validation response")?;

            info!(
                audience = token_info.get("audience").and_then(|v| v.as_str()),
                scope = token_info.get("scope").and_then(|v| v.as_str()),
                expires_in = token_info.get("expires_in").and_then(|v| v.as_u64()),
                "Successfully validated access token"
            );

            Ok(token_info)
        } else {
            let status = response.status();
            let error_text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());

            error!(
                status = %status,
                error = %error_text,
                "Token validation failed"
            );

            Err(anyhow::anyhow!(
                "Token validation failed: {} - {}",
                status,
                error_text
            ))
        }
    }

    /// Get the current configuration
    pub fn config(&self) -> &GoogleOAuthConfig {
        &self.config
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_google_oauth_config_default() {
        let config = GoogleOAuthConfig::default();
        assert_eq!(config.redirect_uri, "http://localhost:3000/auth/callback");
        assert!(config.scopes.contains(&"openid".to_string()));
        assert!(config.scopes.contains(&"email".to_string()));
        assert!(config.scopes.contains(&"profile".to_string()));
        assert_eq!(config.timeout_seconds, 30);
        assert_eq!(config.max_retries, 3);
    }

    #[tokio::test]
    async fn test_client_creation() {
        let config = GoogleOAuthConfig {
            client_id: "test-client-id".to_string(),
            client_secret: "test-client-secret".to_string(),
            ..Default::default()
        };

        let client = GoogleOAuthClient::new(config);
        assert!(client.is_ok());
    }

    #[test]
    fn test_authorization_url_generation() {
        let config = GoogleOAuthConfig {
            client_id: "test-client-id".to_string(),
            client_secret: "test-client-secret".to_string(),
            ..Default::default()
        };

        let client = GoogleOAuthClient::new(config).unwrap();
        
        let auth_url = client.get_authorization_url(false);
        assert!(auth_url.url.contains("accounts.google.com"));
        assert!(auth_url.url.contains("client_id=test-client-id"));
        assert!(!auth_url.state.is_empty());
    }
}