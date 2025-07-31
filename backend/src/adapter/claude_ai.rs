use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use reqwest::Client;
use anyhow::{Result, Context};

/// Configuration for Claude AI API client
#[derive(Debug, Clone)]
pub struct ClaudeAIConfig {
    /// API key for authentication
    pub api_key: String,
    /// Base URL for Claude API (defaults to https://api.anthropic.com)
    pub base_url: String,
    /// Default model to use (e.g., "claude-3-sonnet-20240229")
    pub default_model: String,
    /// Request timeout in seconds
    pub timeout_seconds: u64,
    /// Maximum number of retries for failed requests
    pub max_retries: u32,
}

impl Default for ClaudeAIConfig {
    fn default() -> Self {
        Self {
            api_key: String::new(),
            base_url: "https://api.anthropic.com".to_string(),
            default_model: "claude-3-sonnet-20240229".to_string(),
            timeout_seconds: 60,
            max_retries: 3,
        }
    }
}

/// Request payload for Claude AI messages API
#[derive(Debug, Serialize)]
pub struct ClaudeRequest {
    pub model: String,
    pub max_tokens: u32,
    pub temperature: Option<f32>,
    pub messages: Vec<ClaudeMessage>,
    pub system: Option<String>,
    pub stop_sequences: Option<Vec<String>>,
    pub stream: Option<bool>,
}

/// Individual message in a Claude conversation
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClaudeMessage {
    pub role: String, // "user" or "assistant"
    pub content: String,
}

/// Response from Claude AI API
#[derive(Debug, Deserialize)]
pub struct ClaudeResponse {
    pub id: String,
    pub r#type: String,
    pub role: String,
    pub content: Vec<ClaudeContent>,
    pub model: String,
    pub stop_reason: Option<String>,
    pub stop_sequence: Option<String>,
    pub usage: ClaudeUsage,
}

/// Content block in Claude response
#[derive(Debug, Deserialize)]
pub struct ClaudeContent {
    pub r#type: String,
    pub text: String,
}

/// Usage statistics from Claude API
#[derive(Debug, Deserialize)]
pub struct ClaudeUsage {
    pub input_tokens: u32,
    pub output_tokens: u32,
}

/// Error response from Claude AI API
#[derive(Debug, Deserialize)]
pub struct ClaudeError {
    pub r#type: String,
    pub message: String,
}

/// Client for interacting with Claude AI API
#[derive(Debug)]
pub struct ClaudeAIClient {
    config: ClaudeAIConfig,
    client: Client,
}

impl ClaudeAIClient {
    /// Create a new Claude AI client with the given configuration
    pub fn new(config: ClaudeAIConfig) -> Result<Self> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .context("Failed to create HTTP client")?;

        Ok(Self { config, client })
    }

    /// Create a new Claude AI client from environment variables
    pub fn from_env() -> Result<Self> {
        let api_key = std::env::var("CLAUDE_API_KEY")
            .context("CLAUDE_API_KEY environment variable not set")?;
        
        let config = ClaudeAIConfig {
            api_key,
            base_url: std::env::var("CLAUDE_BASE_URL")
                .unwrap_or_else(|_| "https://api.anthropic.com".to_string()),
            default_model: std::env::var("CLAUDE_DEFAULT_MODEL")
                .unwrap_or_else(|_| "claude-3-sonnet-20240229".to_string()),
            timeout_seconds: std::env::var("CLAUDE_TIMEOUT_SECONDS")
                .unwrap_or_else(|_| "60".to_string())
                .parse()
                .unwrap_or(60),
            max_retries: std::env::var("CLAUDE_MAX_RETRIES")
                .unwrap_or_else(|_| "3".to_string())
                .parse()
                .unwrap_or(3),
        };

        Self::new(config)
    }

    /// Send a message to Claude AI and get a response
    #[tracing::instrument(skip(self), fields(model = %request.model))]
    pub async fn send_message(&self, request: ClaudeRequest) -> Result<ClaudeResponse> {
        let url = format!("{}/v1/messages", self.config.base_url);
        
        let mut headers = HashMap::new();
        headers.insert("x-api-key", self.config.api_key.as_str());
        headers.insert("anthropic-version", "2023-06-01");
        headers.insert("content-type", "application/json");

        let mut attempt = 0;
        let mut last_error = None;

        while attempt < self.config.max_retries {
            tracing::debug!(
                attempt = attempt + 1,
                max_retries = self.config.max_retries,
                "Sending request to Claude AI"
            );

            let response = self
                .client
                .post(&url)
                .header("x-api-key", &self.config.api_key)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .json(&request)
                .send()
                .await;

            match response {
                Ok(resp) if resp.status().is_success() => {
                    let claude_response: ClaudeResponse = resp
                        .json()
                        .await
                        .context("Failed to parse Claude AI response")?;
                    
                    tracing::info!(
                        input_tokens = claude_response.usage.input_tokens,
                        output_tokens = claude_response.usage.output_tokens,
                        model = %claude_response.model,
                        "Successfully received response from Claude AI"
                    );
                    
                    return Ok(claude_response);
                }
                Ok(resp) => {
                    let status = resp.status();
                    let error_text = resp
                        .text()
                        .await
                        .unwrap_or_else(|_| "Unknown error".to_string());
                    
                    let error = anyhow::anyhow!(
                        "Claude AI API error: {} - {}",
                        status,
                        error_text
                    );
                    
                    tracing::error!(
                        status = %status,
                        error = %error_text,
                        attempt = attempt + 1,
                        "Claude AI API returned error"
                    );
                    
                    last_error = Some(error);
                }
                Err(e) => {
                    let error = anyhow::anyhow!("Request failed: {}", e);
                    tracing::error!(
                        error = %e,
                        attempt = attempt + 1,
                        "Failed to send request to Claude AI"
                    );
                    last_error = Some(error);
                }
            }

            attempt += 1;
            
            if attempt < self.config.max_retries {
                let delay = std::time::Duration::from_millis(1000 * 2_u64.pow(attempt - 1));
                tracing::debug!(
                    delay_ms = delay.as_millis(),
                    "Retrying request after delay"
                );
                tokio::time::sleep(delay).await;
            }
        }

        Err(last_error.unwrap_or_else(|| anyhow::anyhow!("All retry attempts failed")))
    }

    /// Send a simple text message to Claude AI
    #[tracing::instrument(skip(self))]
    pub async fn send_text_message(
        &self,
        message: &str,
        system_prompt: Option<&str>,
    ) -> Result<String> {
        let request = ClaudeRequest {
            model: self.config.default_model.clone(),
            max_tokens: 4096,
            temperature: Some(0.7),
            messages: vec![ClaudeMessage {
                role: "user".to_string(),
                content: message.to_string(),
            }],
            system: system_prompt.map(|s| s.to_string()),
            stop_sequences: None,
            stream: Some(false),
        };

        let response = self.send_message(request).await?;
        
        // Extract text from the first content block
        response
            .content
            .first()
            .map(|content| content.text.clone())
            .ok_or_else(|| anyhow::anyhow!("No content in Claude AI response"))
    }

    /// Send a conversation to Claude AI with message history
    #[tracing::instrument(skip(self, messages))]
    pub async fn send_conversation(
        &self,
        messages: Vec<ClaudeMessage>,
        system_prompt: Option<&str>,
        max_tokens: Option<u32>,
        temperature: Option<f32>,
    ) -> Result<ClaudeResponse> {
        let request = ClaudeRequest {
            model: self.config.default_model.clone(),
            max_tokens: max_tokens.unwrap_or(4096),
            temperature,
            messages,
            system: system_prompt.map(|s| s.to_string()),
            stop_sequences: None,
            stream: Some(false),
        };

        self.send_message(request).await
    }

    /// Get the current configuration
    pub fn config(&self) -> &ClaudeAIConfig {
        &self.config
    }

    /// Create a new message for conversation
    pub fn create_message(role: &str, content: &str) -> ClaudeMessage {
        ClaudeMessage {
            role: role.to_string(),
            content: content.to_string(),
        }
    }

    /// Create a user message
    pub fn user_message(content: &str) -> ClaudeMessage {
        Self::create_message("user", content)
    }

    /// Create an assistant message
    pub fn assistant_message(content: &str) -> ClaudeMessage {
        Self::create_message("assistant", content)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_claude_config_default() {
        let config = ClaudeAIConfig::default();
        assert_eq!(config.base_url, "https://api.anthropic.com");
        assert_eq!(config.default_model, "claude-3-sonnet-20240229");
        assert_eq!(config.timeout_seconds, 60);
        assert_eq!(config.max_retries, 3);
    }

    #[test]
    fn test_create_messages() {
        let user_msg = ClaudeAIClient::user_message("Hello, Claude!");
        assert_eq!(user_msg.role, "user");
        assert_eq!(user_msg.content, "Hello, Claude!");

        let assistant_msg = ClaudeAIClient::assistant_message("Hello! How can I help?");
        assert_eq!(assistant_msg.role, "assistant");
        assert_eq!(assistant_msg.content, "Hello! How can I help?");
    }

    #[tokio::test]
    async fn test_client_creation() {
        let config = ClaudeAIConfig {
            api_key: "test-key".to_string(),
            ..Default::default()
        };

        let client = ClaudeAIClient::new(config);
        assert!(client.is_ok());
    }
}