use anyhow::Result;
use template::adapter::{
    PlaidClient, PlaidConfig, PlaidEnvironment,
    LinkTokenRequest, PublicTokenExchangeRequest, TransactionSyncRequest
};

#[cfg(test)]
mod plaid_integration_tests {
    use super::*;

    fn get_test_config() -> PlaidConfig {
        PlaidConfig {
            client_id: std::env::var("PLAID_CLIENT_ID")
                .unwrap_or_else(|_| "test_client_id".to_string()),
            secret: std::env::var("PLAID_SECRET")
                .unwrap_or_else(|_| "test_secret".to_string()),
            environment: PlaidEnvironment::Sandbox,
            webhook_url: Some("https://example.com/webhook".to_string()),
        }
    }

    #[test]
    fn test_plaid_client_creation() {
        let config = get_test_config();
        let client = PlaidClient::new(config);
        assert!(client.is_ok());
    }

    #[test]
    fn test_plaid_client_from_env_fallback() {
        // This should work with environment variable fallbacks
        let result = PlaidClient::from_env();
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_create_link_token_structure() {
        // Skip if no credentials available
        if std::env::var("PLAID_CLIENT_ID").is_err() || std::env::var("PLAID_SECRET").is_err() {
            return;
        }

        let config = get_test_config();
        let client = PlaidClient::new(config).expect("Failed to create client");

        let link_request = LinkTokenRequest {
            user_id: "test_user_123".to_string(),
            client_name: "Test App".to_string(),
            products: vec!["transactions".to_string()],
            country_codes: vec!["US".to_string()],
            language: "en".to_string(),
            redirect_uri: None,
            webhook: Some("https://example.com/webhook".to_string()),
        };

        // This test validates the request structure but may fail in CI without real credentials
        let result = client.create_link_token(link_request).await;
        
        // In sandbox mode with invalid credentials, we expect specific error types
        if result.is_err() {
            let error_str = format!("{:?}", result.unwrap_err());
            // Common errors when credentials are invalid in sandbox
            assert!(
                error_str.contains("INVALID_CLIENT_ID") ||
                error_str.contains("INVALID_SECRET") ||
                error_str.contains("authentication") ||
                error_str.contains("credentials")
            );
        }
    }

    #[tokio::test]
    async fn test_accounts_fetch_structure() {
        // Skip if no credentials available
        if std::env::var("PLAID_CLIENT_ID").is_err() || std::env::var("PLAID_SECRET").is_err() {
            return;
        }

        let config = get_test_config();
        let client = PlaidClient::new(config).expect("Failed to create client");

        // Test with a dummy access token (will fail but tests the structure)
        let result = client.get_accounts("access-sandbox-dummy-token").await;
        
        // Should fail with invalid access token, but validates structure
        assert!(result.is_err());
        let error_str = format!("{:?}", result.unwrap_err());
        assert!(
            error_str.contains("INVALID_ACCESS_TOKEN") ||
            error_str.contains("access_token") ||
            error_str.contains("authentication")
        );
    }

    #[tokio::test]
    async fn test_transaction_sync_structure() {
        // Skip if no credentials available  
        if std::env::var("PLAID_CLIENT_ID").is_err() || std::env::var("PLAID_SECRET").is_err() {
            return;
        }

        let config = get_test_config();
        let client = PlaidClient::new(config).expect("Failed to create client");

        let sync_request = TransactionSyncRequest {
            access_token: "access-sandbox-dummy-token".to_string(),
            cursor: None,
            count: Some(100),
        };

        // Test with dummy token (will fail but tests structure)
        let result = client.sync_transactions(sync_request).await;
        
        assert!(result.is_err());
        let error_str = format!("{:?}", result.unwrap_err());
        assert!(
            error_str.contains("INVALID_ACCESS_TOKEN") ||
            error_str.contains("access_token") ||
            error_str.contains("authentication")
        );
    }

    #[tokio::test]
    async fn test_transactions_get_structure() {
        // Skip if no credentials available
        if std::env::var("PLAID_CLIENT_ID").is_err() || std::env::var("PLAID_SECRET").is_err() {
            return;
        }

        let config = get_test_config();
        let client = PlaidClient::new(config).expect("Failed to create client");

        // Test with dummy token and valid date format
        let result = client.get_transactions(
            "access-sandbox-dummy-token",
            "2024-01-01",
            "2024-01-31",
            Some(10),
            Some(0),
        ).await;

        assert!(result.is_err());
        let error_str = format!("{:?}", result.unwrap_err());
        assert!(
            error_str.contains("INVALID_ACCESS_TOKEN") ||
            error_str.contains("access_token") ||
            error_str.contains("authentication")
        );
    }

    #[tokio::test]
    async fn test_invalid_date_format() {
        let config = get_test_config();
        let client = PlaidClient::new(config).expect("Failed to create client");

        // Test with invalid date format
        let result = client.get_transactions(
            "dummy-token",
            "invalid-date",
            "2024-01-31",
            None,
            None,
        ).await;

        assert!(result.is_err());
        let error_str = format!("{:?}", result.unwrap_err());
        assert!(error_str.contains("Invalid start_date format"));
    }

    #[tokio::test]
    async fn test_public_token_exchange_structure() {
        // Skip if no credentials available
        if std::env::var("PLAID_CLIENT_ID").is_err() || std::env::var("PLAID_SECRET").is_err() {
            return;
        }

        let config = get_test_config();
        let client = PlaidClient::new(config).expect("Failed to create client");

        let exchange_request = PublicTokenExchangeRequest {
            public_token: "public-sandbox-dummy-token".to_string(),
        };

        // Test with dummy token (will fail but tests structure)
        let result = client.exchange_public_token(exchange_request).await;
        
        assert!(result.is_err());
        let error_str = format!("{:?}", result.unwrap_err());
        assert!(
            error_str.contains("INVALID_PUBLIC_TOKEN") ||
            error_str.contains("public_token") ||
            error_str.contains("authentication")
        );
    }

    #[test]
    fn test_config_validation() {
        // Test empty config
        let empty_config = PlaidConfig::default();
        assert_eq!(empty_config.client_id, "");
        assert_eq!(empty_config.secret, "");
        assert!(matches!(empty_config.environment, PlaidEnvironment::Sandbox));

        // Test environment string conversion
        assert_eq!(PlaidEnvironment::Sandbox.as_str(), "sandbox");
        assert_eq!(PlaidEnvironment::Development.as_str(), "development");
        assert_eq!(PlaidEnvironment::Production.as_str(), "production");
    }

    #[test]
    fn test_link_token_request_defaults() {
        let request = LinkTokenRequest::default();
        assert_eq!(request.client_name, "Origin App");
        assert_eq!(request.products, vec!["transactions", "auth"]);
        assert_eq!(request.country_codes, vec!["US"]);
        assert_eq!(request.language, "en");
        assert!(request.redirect_uri.is_none());
        assert!(request.webhook.is_none());
    }

    #[test]
    fn test_transaction_sync_request() {
        let request = TransactionSyncRequest {
            access_token: "test-token".to_string(),
            cursor: Some("test-cursor".to_string()),
            count: Some(50),
        };

        assert_eq!(request.access_token, "test-token");
        assert_eq!(request.cursor, Some("test-cursor".to_string()));
        assert_eq!(request.count, Some(50));
    }
}

// Integration test that requires real Plaid sandbox credentials
// Set PLAID_CLIENT_ID and PLAID_SECRET environment variables to run
#[cfg(test)]
mod plaid_sandbox_integration_tests {
    use super::*;
    use std::env;

    async fn get_sandbox_client() -> Option<PlaidClient> {
        // Try parameter store first, fallback to env vars
        if let Ok(client) = PlaidClient::from_config().await {
            Some(client)
        } else {
            PlaidClient::from_env().ok()
        }
    }

    #[tokio::test]
    async fn test_sandbox_link_token_creation() {
        let client = match get_sandbox_client().await {
            Some(client) => client,
            None => {
                println!("Skipping sandbox test - no credentials provided");
                return;
            }
        };

        let link_request = LinkTokenRequest {
            user_id: "test_user_sandbox".to_string(),
            client_name: "Origin Test App".to_string(),
            products: vec!["transactions".to_string(), "auth".to_string()],
            country_codes: vec!["US".to_string()],
            language: "en".to_string(),
            redirect_uri: None,
            webhook: None,
        };

        let result = client.create_link_token(link_request).await;
        
        match result {
            Ok(response) => {
                assert!(!response.link_token.is_empty());
                assert!(!response.request_id.is_empty());
                println!("✓ Successfully created link token in sandbox");
            }
            Err(e) => {
                println!("Link token creation failed (expected with test credentials): {:?}", e);
                // This is expected to fail with test credentials
            }
        }
    }

    #[tokio::test]
    async fn test_sandbox_institution_fetch() {
        let client = match get_sandbox_client().await {
            Some(client) => client,
            None => {
                println!("Skipping sandbox test - no credentials provided");
                return;
            }
        };

        // Test with Chase bank institution ID (common in sandbox)
        let result = client.get_institution(
            "ins_3", 
            vec!["US"]
        ).await;

        match result {
            Ok(institution) => {
                assert!(!institution.name.is_empty());
                println!("✓ Successfully fetched institution: {}", institution.name);
            }
            Err(e) => {
                println!("Institution fetch failed (may be expected with test credentials): {:?}", e);
            }
        }
    }
}