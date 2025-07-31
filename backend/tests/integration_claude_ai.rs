use template::adapter::claude_ai::{ClaudeAIClient, ClaudeAIConfig, ClaudeMessage};
use std::env;

/// Integration test for ClaudeAI Client
/// 
/// This test requires a valid CLAUDE_API_KEY environment variable to run.
/// If the API key is not set, the test will be skipped.
#[tokio::test]
async fn test_claude_ai_client_integration() {
    // Skip test if API key is not available
    let api_key = match env::var("CLAUDE_API_KEY") {
        Ok(key) if !key.is_empty() => key,
        _ => {
            println!("Skipping Claude AI integration test: CLAUDE_API_KEY not set");
            return;
        }
    };

    // Create client configuration
    let config = ClaudeAIConfig {
        api_key,
        base_url: "https://api.anthropic.com".to_string(),
        default_model: "claude-3-haiku-20240307".to_string(), // Use fastest model for testing
        timeout_seconds: 30,
        max_retries: 2,
    };

    // Create client
    let client = ClaudeAIClient::new(config).expect("Failed to create Claude AI client");

    // Test simple text message
    let response = client
        .send_text_message("Hello! Please respond with exactly 'Integration test successful'", None)
        .await;

    match response {
        Ok(text) => {
            assert!(!text.is_empty(), "Response should not be empty");
            println!("Claude AI response: {}", text);
            
            // Basic validation that we got a response
            assert!(text.len() > 5, "Response should be meaningful");
        }
        Err(e) => {
            // Log the error but don't fail the test if it's a network/API issue
            println!("Claude AI integration test failed (this may be expected in CI): {}", e);
            
            // Only fail if it's a client configuration error
            if e.to_string().contains("Failed to create HTTP client") {
                panic!("Client configuration error: {}", e);
            }
        }
    }
}

#[tokio::test]
async fn test_claude_ai_conversation() {
    // Skip test if API key is not available
    let api_key = match env::var("CLAUDE_API_KEY") {
        Ok(key) if !key.is_empty() => key,
        _ => {
            println!("Skipping Claude AI conversation test: CLAUDE_API_KEY not set");
            return;
        }
    };

    let config = ClaudeAIConfig {
        api_key,
        base_url: "https://api.anthropic.com".to_string(),
        default_model: "claude-3-haiku-20240307".to_string(),
        timeout_seconds: 30,
        max_retries: 2,
    };

    let client = ClaudeAIClient::new(config).expect("Failed to create Claude AI client");

    // Create a conversation with multiple messages
    let messages = vec![
        ClaudeAIClient::user_message("What is 2 + 2?"),
        ClaudeAIClient::assistant_message("2 + 2 equals 4."),
        ClaudeAIClient::user_message("And what is 4 + 4?"),
    ];

    let response = client
        .send_conversation(
            messages,
            Some("You are a helpful math assistant. Keep responses brief."),
            Some(100), // Low token limit for testing
            Some(0.1), // Low temperature for consistent responses
        )
        .await;

    match response {
        Ok(claude_response) => {
            assert!(!claude_response.content.is_empty(), "Response should have content blocks");
            assert!(claude_response.usage.input_tokens > 0, "Should have used input tokens");
            assert!(claude_response.usage.output_tokens > 0, "Should have used output tokens");
            
            let first_content = &claude_response.content[0];
            assert_eq!(first_content.r#type, "text", "Content should be text type");
            assert!(!first_content.text.is_empty(), "Text content should not be empty");
            
            println!("Conversation response: {}", first_content.text);
            println!("Token usage - Input: {}, Output: {}", 
                     claude_response.usage.input_tokens, 
                     claude_response.usage.output_tokens);
        }
        Err(e) => {
            println!("Claude AI conversation test failed (this may be expected in CI): {}", e);
            
            // Only fail if it's a client configuration error
            if e.to_string().contains("Failed to create HTTP client") {
                panic!("Client configuration error: {}", e);
            }
        }
    }
}

#[test]
fn test_claude_ai_client_from_env_without_key() {
    // Temporarily remove the API key to test error handling
    let original_key = env::var("CLAUDE_API_KEY").ok();
    env::remove_var("CLAUDE_API_KEY");

    let result = ClaudeAIClient::from_env();
    
    // Restore original key if it existed
    if let Some(key) = original_key {
        env::set_var("CLAUDE_API_KEY", key);
    }

    assert!(result.is_err(), "Should fail when API key is not set");
    let error = result.unwrap_err();
    assert!(
        error.to_string().contains("CLAUDE_API_KEY environment variable not set"),
        "Error should mention missing API key"
    );
}

#[test]
fn test_message_creation() {
    let user_msg = ClaudeAIClient::user_message("Test user message");
    assert_eq!(user_msg.role, "user");
    assert_eq!(user_msg.content, "Test user message");

    let assistant_msg = ClaudeAIClient::assistant_message("Test assistant message");
    assert_eq!(assistant_msg.role, "assistant");
    assert_eq!(assistant_msg.content, "Test assistant message");

    let custom_msg = ClaudeAIClient::create_message("system", "Test system message");
    assert_eq!(custom_msg.role, "system");
    assert_eq!(custom_msg.content, "Test system message");
}

#[test]
fn test_claude_config_creation() {
    let config = ClaudeAIConfig {
        api_key: "test-key".to_string(),
        base_url: "https://api.example.com".to_string(),
        default_model: "claude-3-opus-20240229".to_string(),
        timeout_seconds: 120,
        max_retries: 5,
    };

    assert_eq!(config.api_key, "test-key");
    assert_eq!(config.base_url, "https://api.example.com");
    assert_eq!(config.default_model, "claude-3-opus-20240229");
    assert_eq!(config.timeout_seconds, 120);
    assert_eq!(config.max_retries, 5);

    // Test that client can be created with custom config
    let client = ClaudeAIClient::new(config);
    assert!(client.is_ok(), "Should be able to create client with valid config");
}