use tonic::{Request, Response, Status};
use tracing::{info, instrument};
use crate::gen::accounts::accounts_service_server::AccountsService;
use crate::gen::accounts::{
    CreatePlaidLinkTokenRequest, CreatePlaidLinkTokenResponse,
    ExchangePlaidPublicTokenRequest, ExchangePlaidPublicTokenResponse,
    PlaidAccount, PlaidAccountType, PlaidAccountSubtype, PlaidBalance,
};

#[derive(Debug)]
pub struct AccountsHandler {
}

impl Default for AccountsHandler {
    fn default() -> Self {
        Self::new()
    }
}

impl AccountsHandler {
    pub fn new() -> Self {
        Self {}
    }
}

#[tonic::async_trait]
impl AccountsService for AccountsHandler {
    #[instrument(skip(self))]
    async fn create_plaid_link_token(
        &self,
        request: Request<CreatePlaidLinkTokenRequest>,
    ) -> Result<Response<CreatePlaidLinkTokenResponse>, Status> {
        let req = request.into_inner();
        info!(user_id = %req.user_id, "Creating Plaid link token");

        // TODO: Integrate with Plaid API to create actual link token
        // For now, returning a mock response
        let link_token = format!("link-sandbox-{}", uuid::Uuid::new_v4());
        let expires_at = chrono::Utc::now().timestamp() + 3600; // 1 hour from now

        let response = CreatePlaidLinkTokenResponse {
            link_token,
            expires_at,
        };

        info!("Plaid link token created successfully");
        Ok(Response::new(response))
    }

    #[instrument(skip(self))]
    async fn exchange_plaid_public_token(
        &self,
        request: Request<ExchangePlaidPublicTokenRequest>,
    ) -> Result<Response<ExchangePlaidPublicTokenResponse>, Status> {
        let req = request.into_inner();
        info!(
            user_id = %req.user_id, 
            public_token = %req.public_token,
            "Exchanging Plaid public token"
        );

        // TODO: Integrate with Plaid API to exchange public token for access token
        // For now, returning a mock response with sample accounts
        let item_id = format!("item-sandbox-{}", uuid::Uuid::new_v4());
        
        let mock_accounts = vec![
            PlaidAccount {
                account_id: "account-1".to_string(),
                name: "Checking Account".to_string(),
                official_name: "Chase Total Checking".to_string(),
                r#type: PlaidAccountType::Depository.into(),
                subtype: PlaidAccountSubtype::Checking.into(),
                balance: Some(PlaidBalance {
                    available: Some(1250.75),
                    current: Some(1250.75),
                    limit: None,
                    iso_currency_code: "USD".to_string(),
                }),
                mask: "0000".to_string(),
            },
            PlaidAccount {
                account_id: "account-2".to_string(),
                name: "Savings Account".to_string(),
                official_name: "Chase Savings".to_string(),
                r#type: PlaidAccountType::Depository.into(),
                subtype: PlaidAccountSubtype::Savings.into(),
                balance: Some(PlaidBalance {
                    available: Some(5000.00),
                    current: Some(5000.00),
                    limit: None,
                    iso_currency_code: "USD".to_string(),
                }),
                mask: "1111".to_string(),
            },
        ];

        let response = ExchangePlaidPublicTokenResponse {
            item_id,
            accounts: mock_accounts,
            success: true,
            message: "Successfully connected accounts".to_string(),
        };

        info!("Plaid public token exchanged successfully");
        Ok(Response::new(response))
    }
}