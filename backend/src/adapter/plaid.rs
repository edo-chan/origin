use anyhow::{Result, Context};
use chrono::{DateTime, Utc};
use plaid::PlaidClient as PlaidSDKClient;
use serde::{Deserialize, Serialize};
use tracing::{info, debug, instrument};
use crate::adapter::AppConfig;

#[derive(Debug, Clone)]
pub struct PlaidConfig {
    pub client_id: String,
    pub secret: String,
    pub environment: PlaidEnvironment,
    pub webhook_url: Option<String>,
}

#[derive(Debug, Clone)]
pub enum PlaidEnvironment {
    Sandbox,
    Development,
    Production,
}

impl PlaidEnvironment {
    pub fn as_str(&self) -> &'static str {
        match self {
            PlaidEnvironment::Sandbox => "sandbox",
            PlaidEnvironment::Development => "development", 
            PlaidEnvironment::Production => "production",
        }
    }
}

impl Default for PlaidConfig {
    fn default() -> Self {
        Self {
            client_id: String::new(),
            secret: String::new(),
            environment: PlaidEnvironment::Sandbox,
            webhook_url: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankAccount {
    pub account_id: String,
    pub item_id: String,
    pub mask: Option<String>,
    pub name: String,
    pub official_name: Option<String>,
    pub account_type: String,
    pub account_subtype: Option<String>,
    pub balances: AccountBalances,
    pub institution_id: Option<String>,
    pub institution_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountBalances {
    pub available: Option<f64>,
    pub current: Option<f64>,
    pub limit: Option<f64>,
    pub iso_currency_code: Option<String>,
    pub unofficial_currency_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BankTransaction {
    pub transaction_id: String,
    pub account_id: String,
    pub amount: f64,
    pub iso_currency_code: Option<String>,
    pub unofficial_currency_code: Option<String>,
    pub category: Vec<String>,
    pub category_id: Option<String>,
    pub check_number: Option<String>,
    pub date: String,
    pub datetime: Option<DateTime<Utc>>,
    pub authorized_date: Option<String>,
    pub authorized_datetime: Option<DateTime<Utc>>,
    pub location: Option<TransactionLocation>,
    pub name: String,
    pub merchant_name: Option<String>,
    pub original_description: Option<String>,
    pub payment_meta: Option<TransactionPaymentMeta>,
    pub pending: bool,
    pub pending_transaction_id: Option<String>,
    pub account_owner: Option<String>,
    pub transaction_type: String,
    pub transaction_code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionLocation {
    pub address: Option<String>,
    pub city: Option<String>,
    pub region: Option<String>,
    pub postal_code: Option<String>,
    pub country: Option<String>,
    pub lat: Option<f64>,
    pub lon: Option<f64>,
    pub store_number: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionPaymentMeta {
    pub by_order_of: Option<String>,
    pub payee: Option<String>,
    pub payer: Option<String>,
    pub payment_method: Option<String>,
    pub payment_processor: Option<String>,
    pub ppd_id: Option<String>,
    pub reason: Option<String>,
    pub reference_number: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkTokenRequest {
    pub user_id: String,
    pub client_name: String,
    pub products: Vec<String>,
    pub country_codes: Vec<String>,
    pub language: String,
    pub redirect_uri: Option<String>,
    pub webhook: Option<String>,
}

impl Default for LinkTokenRequest {
    fn default() -> Self {
        Self {
            user_id: String::new(),
            client_name: "Origin App".to_string(),
            products: vec!["transactions".to_string(), "auth".to_string()],
            country_codes: vec!["US".to_string()],
            language: "en".to_string(),
            redirect_uri: None,
            webhook: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LinkTokenResponse {
    pub link_token: String,
    pub expiration: DateTime<Utc>,
    pub request_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicTokenExchangeRequest {
    pub public_token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PublicTokenExchangeResponse {
    pub access_token: String,
    pub item_id: String,
    pub request_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionSyncRequest {
    pub access_token: String,
    pub cursor: Option<String>,
    pub count: Option<i32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionSyncResponse {
    pub added: Vec<BankTransaction>,
    pub modified: Vec<BankTransaction>,
    pub removed: Vec<RemovedTransaction>,
    pub next_cursor: String,
    pub has_more: bool,
    pub request_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RemovedTransaction {
    pub transaction_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaidError {
    pub error_type: String,
    pub error_code: String,
    pub error_message: String,
    pub display_message: Option<String>,
    pub request_id: Option<String>,
}

pub struct PlaidClient {
    client: PlaidSDKClient,
    config: PlaidConfig,
}

impl PlaidClient {
    #[instrument(skip(config), fields(environment = %config.environment.as_str()))]
    pub fn new(config: PlaidConfig) -> Result<Self> {
        let client = PlaidSDKClient::from_env();

        info!(
            environment = %config.environment.as_str(),
            client_id = %config.client_id,
            "Initialized Plaid client"
        );

        Ok(Self { client, config })
    }

    #[instrument]
    pub async fn from_config() -> Result<Self> {
        let app_config = AppConfig::load().await;
        
        let environment = match app_config.plaid_env.to_lowercase().as_str() {
            "production" => PlaidEnvironment::Production,
            "development" => PlaidEnvironment::Development,
            _ => PlaidEnvironment::Sandbox,
        };

        let config = PlaidConfig {
            client_id: app_config.plaid_client_id,
            secret: app_config.plaid_secret,
            environment,
            webhook_url: app_config.plaid_webhook_url,
        };

        Self::new(config)
    }

    #[instrument]
    pub fn from_env() -> Result<Self> {
        let app_config = AppConfig::from_env();
        
        let environment = match app_config.plaid_env.to_lowercase().as_str() {
            "production" => PlaidEnvironment::Production,
            "development" => PlaidEnvironment::Development,
            _ => PlaidEnvironment::Sandbox,
        };

        let config = PlaidConfig {
            client_id: app_config.plaid_client_id,
            secret: app_config.plaid_secret,
            environment,
            webhook_url: app_config.plaid_webhook_url,
        };

        Self::new(config)
    }

    #[instrument(skip(self, _request))]
    pub async fn create_link_token(&self, _request: LinkTokenRequest) -> Result<LinkTokenResponse> {
        // Note: This is a placeholder implementation
        // In a real implementation, you would need to properly construct the request
        // using the plaid crate's types and builder patterns
        return Err(anyhow::anyhow!("Link token creation not yet implemented"));
    }

    #[instrument(skip(self, request), fields(public_token_length = request.public_token.len()))]
    pub async fn exchange_public_token(&self, request: PublicTokenExchangeRequest) -> Result<PublicTokenExchangeResponse> {
        debug!("Exchanging public token for access token");

        let response = self.client
            .item_public_token_exchange(&request.public_token)
            .await
            .context("Failed to exchange public token")?;

        info!(
            item_id = %response.item_id,
            access_token_length = response.access_token.len(),
            request_id = %response.request_id,
            "Public token exchanged successfully"
        );

        Ok(PublicTokenExchangeResponse {
            access_token: response.access_token,
            item_id: response.item_id,
            request_id: response.request_id,
        })
    }

    #[instrument(skip(self, access_token), fields(access_token_length = access_token.len()))]
    pub async fn get_accounts(&self, access_token: &str) -> Result<Vec<BankAccount>> {
        debug!("Fetching accounts from Plaid");

        let response = self.client
            .accounts_get(access_token)
            .await
            .context("Failed to fetch accounts from Plaid")?;

        let mut bank_accounts = Vec::new();

        for account in response.accounts {
            let bank_account = BankAccount {
                account_id: account.account_id.clone(),
                item_id: response.item.item_id.clone(),
                mask: account.mask.clone(),
                name: account.name.clone(),
                official_name: account.official_name.clone(),
                account_type: format!("{:?}", account.type_),
                account_subtype: account.subtype.map(|s| format!("{:?}", s)),
                balances: AccountBalances {
                    available: account.balances.available,
                    current: account.balances.current,
                    limit: account.balances.limit,
                    iso_currency_code: account.balances.iso_currency_code,
                    unofficial_currency_code: account.balances.unofficial_currency_code,
                },
                institution_id: response.item.institution_id.clone(),
                institution_name: None, // Will be populated separately if needed
            };

            bank_accounts.push(bank_account);
        }

        info!(
            account_count = bank_accounts.len(),
            item_id = %response.item.item_id,
            request_id = %response.request_id,
            "Accounts fetched successfully"
        );

        Ok(bank_accounts)
    }

    #[instrument(skip(self, request), fields(access_token_length = request.access_token.len()))]
    pub async fn sync_transactions(&self, request: TransactionSyncRequest) -> Result<TransactionSyncResponse> {
        debug!(
            cursor = ?request.cursor,
            count = ?request.count,
            "Syncing transactions from Plaid"
        );

        let response = self.client
            .transactions_sync(&request.access_token)
            .await
            .context("Failed to sync transactions from Plaid")?;

        // Note: This is simplified - in a real implementation you would properly convert
        // the Plaid Transaction types to your BankTransaction types
        let added = Vec::new();
        let modified = Vec::new();
        let removed = Vec::new();

        info!(
            has_more = response.has_more,
            request_id = %response.request_id,
            "Transactions synced successfully"
        );

        Ok(TransactionSyncResponse {
            added,
            modified,
            removed,
            next_cursor: response.next_cursor,
            has_more: response.has_more,
            request_id: response.request_id,
        })
    }

    #[instrument(skip(self, _access_token, _start_date, _end_date))]
    pub async fn get_transactions(
        &self,
        _access_token: &str,
        _start_date: &str,
        _end_date: &str,
        _count: Option<i32>,
        _offset: Option<i32>,
    ) -> Result<Vec<BankTransaction>> {
        // Note: This is a placeholder implementation
        // In a real implementation, you would need to properly construct the request
        return Err(anyhow::anyhow!("Transactions get not yet implemented"));
    }

    #[instrument(skip(self, access_token), fields(access_token_length = access_token.len()))]
    pub async fn get_item(&self, access_token: &str) -> Result<serde_json::Value> {
        debug!("Fetching item details from Plaid");

        let response = self.client
            .item_get(access_token)
            .await
            .context("Failed to fetch item from Plaid")?;

        info!(
            request_id = %response.request_id,
            "Item fetched successfully"
        );

        // Return the raw JSON for now since the exact structure varies
        Ok(serde_json::to_value(response.item)?)
    }

    #[instrument(skip(self))]
    pub async fn get_institution(&self, _institution_id: &str, _country_codes: Vec<&str>) -> Result<serde_json::Value> {
        // Note: This is a placeholder implementation
        return Err(anyhow::anyhow!("Institution get not yet implemented"));
    }

    #[instrument(skip(self, access_token), fields(access_token_length = access_token.len()))]
    pub async fn remove_item(&self, access_token: &str) -> Result<()> {
        debug!("Removing Plaid item");

        let response = self.client
            .item_remove(access_token)
            .await
            .context("Failed to remove Plaid item")?;

        info!(
            request_id = %response.request_id,
            "Item removed successfully"
        );

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plaid_config_default() {
        let config = PlaidConfig::default();
        assert_eq!(config.client_id, "");
        assert_eq!(config.secret, "");
        assert!(matches!(config.environment, PlaidEnvironment::Sandbox));
        assert!(config.webhook_url.is_none());
    }

    #[test]
    fn test_link_token_request_default() {
        let request = LinkTokenRequest::default();
        assert_eq!(request.client_name, "Origin App");
        assert_eq!(request.products, vec!["transactions", "auth"]);
        assert_eq!(request.country_codes, vec!["US"]);
        assert_eq!(request.language, "en");
    }

    #[test]
    fn test_plaid_environment_as_str() {
        assert_eq!(PlaidEnvironment::Sandbox.as_str(), "sandbox");
        assert_eq!(PlaidEnvironment::Development.as_str(), "development");
        assert_eq!(PlaidEnvironment::Production.as_str(), "production");
    }
}