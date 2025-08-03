pub mod claude_ai;
pub mod google_oauth;
pub mod jwt_service;
pub mod otp;
pub mod otp_service;
pub mod parameter_store;
pub mod plaid;
pub mod ses;

pub use claude_ai::ClaudeAIClient;
pub use google_oauth::{GoogleOAuthClient, GoogleOAuthConfig, AuthorizationUrl, TokenResponse, GoogleUser};
pub use otp::{OtpManager, OtpConfig, OtpEntry, OtpStatus};
pub use otp_service::OtpService;
pub use parameter_store::{ParameterStore, AppConfig};
pub use plaid::{
    PlaidClient, PlaidConfig, PlaidEnvironment, 
    BankAccount, BankTransaction, AccountBalances,
    LinkTokenRequest, LinkTokenResponse,
    PublicTokenExchangeRequest, PublicTokenExchangeResponse,
    TransactionSyncRequest, TransactionSyncResponse,
    TransactionLocation, TransactionPaymentMeta, RemovedTransaction,
    PlaidError
};
pub use ses::{SESClient, SESConfig, EmailRequest, EmailResponse, TemplateData, EmailPriority};