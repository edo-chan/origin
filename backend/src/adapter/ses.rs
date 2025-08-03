use aws_config::BehaviorVersion;
use aws_sdk_ses::Client;
use aws_sdk_ses::types::{Body, Content, Destination, Message};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use anyhow::{Result, Context};
use tracing::{info, debug, instrument};

/// Configuration for Amazon SES client
#[derive(Debug, Clone)]
pub struct SESConfig {
    /// AWS region for SES (e.g., "us-east-1", "eu-west-1")
    pub region: String,
    /// Default sender email address
    pub default_sender: String,
    /// Default sender name (optional)
    pub default_sender_name: Option<String>,
    /// Reply-to email address (optional)
    pub reply_to: Option<String>,
    /// Configuration set name (optional, for tracking)
    pub configuration_set: Option<String>,
}

impl Default for SESConfig {
    fn default() -> Self {
        Self {
            region: "us-east-1".to_string(),
            default_sender: String::new(),
            default_sender_name: None,
            reply_to: None,
            configuration_set: None,
        }
    }
}

/// Email template data for dynamic content replacement
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TemplateData {
    data: HashMap<String, String>,
}

impl TemplateData {
    pub fn new() -> Self {
        Self {
            data: HashMap::new(),
        }
    }

    pub fn insert<K: Into<String>, V: Into<String>>(&mut self, key: K, value: V) {
        self.data.insert(key.into(), value.into());
    }

    pub fn get(&self, key: &str) -> Option<&String> {
        self.data.get(key)
    }

    /// Replace template variables in text with actual values
    /// Variables in format {{variable_name}} will be replaced
    pub fn render_template(&self, template: &str) -> String {
        let mut result = template.to_string();
        for (key, value) in &self.data {
            let placeholder = format!("{{{{{}}}}}", key);
            result = result.replace(&placeholder, value);
        }
        result
    }
}

/// Email priority levels
#[derive(Debug, Clone, Copy)]
pub enum EmailPriority {
    Low,
    Normal,
    High,
}

impl EmailPriority {
    fn as_str(&self) -> &'static str {
        match self {
            EmailPriority::Low => "low",
            EmailPriority::Normal => "normal",
            EmailPriority::High => "high",
        }
    }
}

/// Structured email request
#[derive(Debug, Clone)]
pub struct EmailRequest {
    /// Recipient email addresses
    pub to: Vec<String>,
    /// CC recipients (optional)
    pub cc: Option<Vec<String>>,
    /// BCC recipients (optional)
    pub bcc: Option<Vec<String>>,
    /// Email subject
    pub subject: String,
    /// Plain text body
    pub text_body: Option<String>,
    /// HTML body
    pub html_body: Option<String>,
    /// Sender email (overrides default if provided)
    pub sender: Option<String>,
    /// Sender name (overrides default if provided)
    pub sender_name: Option<String>,
    /// Reply-to address (overrides default if provided)
    pub reply_to: Option<String>,
    /// Email priority
    pub priority: EmailPriority,
    /// Template data for dynamic content
    pub template_data: Option<TemplateData>,
    /// Email tags for tracking (key-value pairs)
    pub tags: HashMap<String, String>,
}

impl EmailRequest {
    pub fn new<T: Into<String>, S: Into<String>>(to: Vec<T>, subject: S) -> Self {
        Self {
            to: to.into_iter().map(|t| t.into()).collect(),
            cc: None,
            bcc: None,
            subject: subject.into(),
            text_body: None,
            html_body: None,
            sender: None,
            sender_name: None,
            reply_to: None,
            priority: EmailPriority::Normal,
            template_data: None,
            tags: HashMap::new(),
        }
    }

    pub fn with_text_body<T: Into<String>>(mut self, body: T) -> Self {
        self.text_body = Some(body.into());
        self
    }

    pub fn with_html_body<T: Into<String>>(mut self, body: T) -> Self {
        self.html_body = Some(body.into());
        self
    }

    pub fn with_cc(mut self, cc: Vec<String>) -> Self {
        self.cc = Some(cc);
        self
    }

    pub fn with_bcc(mut self, bcc: Vec<String>) -> Self {
        self.bcc = Some(bcc);
        self
    }

    pub fn with_sender<T: Into<String>>(mut self, sender: T) -> Self {
        self.sender = Some(sender.into());
        self
    }

    pub fn with_sender_name<T: Into<String>>(mut self, name: T) -> Self {
        self.sender_name = Some(name.into());
        self
    }

    pub fn with_priority(mut self, priority: EmailPriority) -> Self {
        self.priority = priority;
        self
    }

    pub fn with_template_data(mut self, data: TemplateData) -> Self {
        self.template_data = Some(data);
        self
    }

    pub fn with_tag<K: Into<String>, V: Into<String>>(mut self, key: K, value: V) -> Self {
        self.tags.insert(key.into(), value.into());
        self
    }
}

/// Email sending response
#[derive(Debug, Clone)]
pub struct EmailResponse {
    /// SES message ID
    pub message_id: String,
    /// Whether the email was accepted for delivery
    pub accepted: bool,
    /// Processing time in milliseconds
    pub processing_time_ms: u64,
}

/// Amazon SES client for sending emails
pub struct SESClient {
    client: Client,
    config: SESConfig,
}

impl SESClient {
    /// Create a new SES client with configuration
    #[instrument(skip(config), fields(region = %config.region))]
    pub async fn new(config: SESConfig) -> Result<Self> {
        let aws_config = aws_config::defaults(BehaviorVersion::latest())
            .region(aws_config::Region::new(config.region.clone()))
            .load()
            .await;

        let client = Client::new(&aws_config);

        info!(
            region = %config.region,
            default_sender = %config.default_sender,
            "Initialized SES client"
        );

        Ok(Self { client, config })
    }

    /// Create SES client from environment variables
    /// Expected environment variables:
    /// - AWS_SES_REGION: AWS region (default: us-east-1)
    /// - AWS_SES_DEFAULT_SENDER: Default sender email
    /// - AWS_SES_DEFAULT_SENDER_NAME: Default sender name (optional)
    /// - AWS_SES_REPLY_TO: Default reply-to address (optional)
    /// - AWS_SES_CONFIGURATION_SET: Configuration set name (optional)
    #[instrument]
    pub async fn from_env() -> Result<Self> {
        let config = SESConfig {
            region: std::env::var("AWS_SES_REGION")
                .unwrap_or_else(|_| "us-east-1".to_string()),
            default_sender: std::env::var("AWS_SES_DEFAULT_SENDER")
                .context("AWS_SES_DEFAULT_SENDER environment variable is required")?,
            default_sender_name: std::env::var("AWS_SES_DEFAULT_SENDER_NAME").ok(),
            reply_to: std::env::var("AWS_SES_REPLY_TO").ok(),
            configuration_set: std::env::var("AWS_SES_CONFIGURATION_SET").ok(),
        };

        Self::new(config).await
    }

    /// Send an email using the SES client
    #[instrument(skip(self, request), fields(
        to_count = request.to.len(),
        subject = %request.subject,
        priority = %request.priority.as_str(),
        has_html = request.html_body.is_some(),
        has_text = request.text_body.is_some()
    ))]
    pub async fn send_email(&self, mut request: EmailRequest) -> Result<EmailResponse> {
        let start_time = std::time::Instant::now();
        
        // Apply template data if provided
        if let Some(template_data) = &request.template_data {
            request.subject = template_data.render_template(&request.subject);
            if let Some(ref body) = request.text_body {
                request.text_body = Some(template_data.render_template(body));
            }
            if let Some(ref body) = request.html_body {
                request.html_body = Some(template_data.render_template(body));
            }
        }

        // Validate request
        if request.to.is_empty() {
            return Err(anyhow::anyhow!("At least one recipient is required"));
        }

        if request.text_body.is_none() && request.html_body.is_none() {
            return Err(anyhow::anyhow!("Either text_body or html_body must be provided"));
        }

        // Build destination
        let mut destination_builder = Destination::builder();
        for to in &request.to {
            destination_builder = destination_builder.to_addresses(to);
        }
        
        if let Some(cc) = &request.cc {
            for cc_addr in cc {
                destination_builder = destination_builder.cc_addresses(cc_addr);
            }
        }
        
        if let Some(bcc) = &request.bcc {
            for bcc_addr in bcc {
                destination_builder = destination_builder.bcc_addresses(bcc_addr);
            }
        }
        
        let destination = destination_builder.build();

        // Build message body
        let mut body_builder = Body::builder();
        
        if let Some(text) = &request.text_body {
            body_builder = body_builder.text(
                Content::builder()
                    .data(text)
                    .charset("UTF-8")
                    .build()
                    .context("Failed to build text content")?
            );
        }
        
        if let Some(html) = &request.html_body {
            body_builder = body_builder.html(
                Content::builder()
                    .data(html)
                    .charset("UTF-8")
                    .build()
                    .context("Failed to build HTML content")?
            );
        }

        let body = body_builder.build();

        // Build message
        let message = Message::builder()
            .subject(
                Content::builder()
                    .data(&request.subject)
                    .charset("UTF-8")
                    .build()
                    .context("Failed to build subject content")?
            )
            .body(body)
            .build();

        // Determine sender
        let sender = match (&request.sender, &request.sender_name) {
            (Some(email), Some(name)) => format!("{} <{}>", name, email),
            (Some(email), None) => email.clone(),
            (None, Some(name)) => format!("{} <{}>", name, &self.config.default_sender),
            (None, None) => match &self.config.default_sender_name {
                Some(name) => format!("{} <{}>", name, &self.config.default_sender),
                None => self.config.default_sender.clone(),
            },
        };

        // Build send email request
        let mut send_request = self.client
            .send_email()
            .source(&sender)
            .destination(destination)
            .message(message);

        // Add reply-to if specified
        let reply_to_addr = request.reply_to
            .as_ref()
            .or(self.config.reply_to.as_ref());
        
        if let Some(reply_to) = reply_to_addr {
            send_request = send_request.reply_to_addresses(reply_to);
        }

        // Add configuration set if specified
        if let Some(config_set) = &self.config.configuration_set {
            send_request = send_request.configuration_set_name(config_set);
        }

        // Send the email
        debug!(
            sender = %sender,
            to_addresses = ?request.to,
            "Sending email via SES"
        );

        let response = send_request
            .send()
            .await
            .context("Failed to send email via SES")?;

        let processing_time = start_time.elapsed().as_millis() as u64;
        let message_id = response.message_id().to_string();

        info!(
            message_id = %message_id,
            processing_time_ms = processing_time,
            to_count = request.to.len(),
            sender = %sender,
            subject = %request.subject,
            "Email sent successfully"
        );

        Ok(EmailResponse {
            message_id,
            accepted: true,
            processing_time_ms: processing_time,
        })
    }

    /// Send a simple text email
    #[instrument(skip(self, body))]
    pub async fn send_text_email<T, S, B>(
        &self,
        to: Vec<T>,
        subject: S,
        body: B,
    ) -> Result<EmailResponse>
    where
        T: Into<String> + std::fmt::Debug,
        S: Into<String> + std::fmt::Display + std::fmt::Debug,
        B: Into<String>,
    {
        let request = EmailRequest::new(to, subject)
            .with_text_body(body);
        
        self.send_email(request).await
    }

    /// Send an HTML email
    #[instrument(skip(self, html_body, text_body))]
    pub async fn send_html_email<T, S, H>(
        &self,
        to: Vec<T>,
        subject: S,
        html_body: H,
        text_body: Option<String>,
    ) -> Result<EmailResponse>
    where
        T: Into<String> + std::fmt::Debug,
        S: Into<String> + std::fmt::Display + std::fmt::Debug,
        H: Into<String>,
    {
        let mut request = EmailRequest::new(to, subject)
            .with_html_body(html_body);
        
        if let Some(text) = text_body {
            request = request.with_text_body(text);
        }
        
        self.send_email(request).await
    }

    /// Send an OTP login email with one-time password
    #[instrument(skip(self))]
    pub async fn send_otp_login_email<T, C>(
        &self,
        to_email: T,
        otp_code: C,
        user_name: Option<String>,
        expires_minutes: Option<u32>,
    ) -> Result<EmailResponse>
    where
        T: Into<String> + std::fmt::Debug,
        C: Into<String> + std::fmt::Display + std::fmt::Debug,
    {
        let mut template_data = TemplateData::new();
        template_data.insert("otp_code", otp_code.to_string());
        template_data.insert("user_name", user_name.unwrap_or_else(|| "User".to_string()));
        template_data.insert("expires_minutes", expires_minutes.unwrap_or(5).to_string());

        let html_body = r#"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Verification</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        .email-container {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            border-radius: 12px 12px 0 0;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            background: #ffffff;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #374151;
        }
        .otp-section {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px solid #e2e8f0;
            border-radius: 16px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .otp-label {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 10px;
            font-weight: 500;
        }
        .otp-code {
            font-size: 42px;
            font-weight: 600;
            color: #1e40af;
            letter-spacing: 8px;
            margin: 15px 0;
            padding: 15px;
            background: #ffffff;
            border-radius: 12px;
            border: 2px solid #dbeafe;
            display: inline-block;
            min-width: 200px;
        }
        .security-notice {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .security-notice h3 {
            color: #92400e;
            margin: 0 0 10px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .security-notice p {
            color: #a16207;
            margin: 0;
            font-size: 14px;
        }
        .footer {
            padding: 30px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            border-radius: 0 0 12px 12px;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
            margin: 5px 0;
        }
        .expires {
            color: #ef4444;
            font-weight: 500;
            font-size: 16px;
        }
        .steps {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .steps h3 {
            color: #0369a1;
            margin: 0 0 15px 0;
            font-size: 16px;
        }
        .steps ol {
            margin: 0;
            padding-left: 20px;
            color: #0f172a;
        }
        .steps li {
            margin: 8px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🔐 Login Verification</h1>
        </div>
        
        <div class="content">
            <p class="greeting">Hello {{user_name}},</p>
            
            <p>We received a request to sign in to your account. To complete your login, please use the one-time password below:</p>
            
            <div class="otp-section">
                <div class="otp-label">Your Login Code</div>
                <div class="otp-code">{{otp_code}}</div>
                <p class="expires">⏱️ Expires in {{expires_minutes}} minutes</p>
            </div>
            
            <div class="steps">
                <h3>How to use this code:</h3>
                <ol>
                    <li>Return to the login page where you requested this code</li>
                    <li>Enter the 6-digit code exactly as shown above</li>
                    <li>Click "Verify" to complete your login</li>
                </ol>
            </div>
            
            <div class="security-notice">
                <h3>🛡️ Security Notice</h3>
                <p>If you didn't request this login code, please ignore this email and consider changing your password. This code can only be used once and will expire automatically.</p>
            </div>
            
            <p>For your security, this code will only work for the next {{expires_minutes}} minutes. If you need a new code, please request one from the login page.</p>
        </div>
        
        <div class="footer">
            <p><strong>The Origin Team</strong></p>
            <p>This is an automated security message. Please do not reply to this email.</p>
            <p>Need help? Contact our support team.</p>
        </div>
    </div>
</body>
</html>
        "#;

        let text_body = r#"
🔐 LOGIN VERIFICATION

Hello {{user_name}},

We received a request to sign in to your account. To complete your login, please use the one-time password below:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    YOUR LOGIN CODE: {{otp_code}}
    ⏱️ Expires in {{expires_minutes}} minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HOW TO USE THIS CODE:
1. Return to the login page where you requested this code
2. Enter the 6-digit code exactly as shown above
3. Click "Verify" to complete your login

🛡️ SECURITY NOTICE
If you didn't request this login code, please ignore this email and consider changing your password. This code can only be used once and will expire automatically.

For your security, this code will only work for the next {{expires_minutes}} minutes. If you need a new code, please request one from the login page.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Origin Team
This is an automated security message. Please do not reply to this email.
Need help? Contact our support team.
        "#;

        let request = EmailRequest::new(vec![to_email], "🔐 Your Login Code - {{otp_code}}")
            .with_html_body(html_body)
            .with_text_body(text_body)
            .with_template_data(template_data)
            .with_priority(EmailPriority::High)
            .with_tag("email_type", "otp_login")
            .with_tag("template", "otp_verification")
            .with_tag("security_level", "high");

        self.send_email(request).await
    }

    /// Send a verification email with a verification code
    #[instrument(skip(self))]
    pub async fn send_verification_email<T, C>(
        &self,
        to_email: T,
        verification_code: C,
        user_name: Option<String>,
    ) -> Result<EmailResponse>
    where
        T: Into<String> + std::fmt::Debug,
        C: Into<String> + std::fmt::Display + std::fmt::Debug,
    {
        let mut template_data = TemplateData::new();
        template_data.insert("verification_code", verification_code.to_string());
        template_data.insert("user_name", user_name.unwrap_or_else(|| "User".to_string()));

        let html_body = r#"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Email Verification Required</h2>
        <p>Hello {{user_name}},</p>
        <p>Thank you for registering with our service. To complete your registration, please verify your email address using the verification code below:</p>
        
        <div style="background-color: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="margin: 0; color: #495057;">Verification Code</h3>
            <h1 style="margin: 10px 0; color: #007bff; font-size: 32px; letter-spacing: 4px;">{{verification_code}}</h1>
        </div>
        
        <p>This verification code will expire in 24 hours. If you didn't request this verification, please ignore this email.</p>
        
        <p>Best regards,<br>The Support Team</p>
        
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
        "#;

        let text_body = r#"
Email Verification Required

Hello {{user_name}},

Thank you for registering with our service. To complete your registration, please verify your email address using the verification code below:

Verification Code: {{verification_code}}

This verification code will expire in 24 hours. If you didn't request this verification, please ignore this email.

Best regards,
The Support Team

---
This is an automated message. Please do not reply to this email.
        "#;

        let request = EmailRequest::new(vec![to_email], "Email Verification Required")
            .with_html_body(html_body)
            .with_text_body(text_body)
            .with_template_data(template_data)
            .with_priority(EmailPriority::High)
            .with_tag("email_type", "verification")
            .with_tag("template", "verification_code");

        self.send_email(request).await
    }

    /// Send a notification email
    #[instrument(skip(self, message))]
    pub async fn send_notification_email<T, S, M>(
        &self,
        to_email: T,
        subject: S,
        message: M,
        priority: EmailPriority,
    ) -> Result<EmailResponse>
    where
        T: Into<String> + std::fmt::Debug,
        S: Into<String> + std::fmt::Display + std::fmt::Debug,
        M: Into<String>,
    {
        let message_text = message.into();
        
        let html_body = format!(r#"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Notification</h2>
        <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;">{}</p>
        </div>
        <p>Best regards,<br>The Support Team</p>
        <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
        <p style="font-size: 12px; color: #6c757d;">
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
        "#, message_text);

        let text_body = format!(r#"
Notification

{}

Best regards,
The Support Team

---
This is an automated message. Please do not reply to this email.
        "#, message_text);

        let request = EmailRequest::new(vec![to_email], subject)
            .with_html_body(html_body)
            .with_text_body(text_body)
            .with_priority(priority)
            .with_tag("email_type", "notification");

        self.send_email(request).await
    }

    /// Verify SES sending statistics and quota
    #[instrument(skip(self))]
    pub async fn get_send_statistics(&self) -> Result<aws_sdk_ses::operation::get_send_statistics::GetSendStatisticsOutput> {
        self.client
            .get_send_statistics()
            .send()
            .await
            .context("Failed to get SES send statistics")
    }

    /// Check if an email address is verified in SES
    #[instrument(skip(self))]
    pub async fn is_email_verified(&self, email: &str) -> Result<bool> {
        let response = self.client
            .get_identity_verification_attributes()
            .identities(email)
            .send()
            .await
            .context("Failed to check email verification status")?;

        let verified = response
            .verification_attributes()
            .get(email)
            .map(|attr| attr.verification_status().as_str() == "Success")
            .unwrap_or(false);

        debug!(
            email = %email,
            verified = verified,
            "Checked email verification status"
        );

        Ok(verified)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_template_data_rendering() {
        let mut template_data = TemplateData::new();
        template_data.insert("name", "John Doe");
        template_data.insert("code", "123456");

        let template = "Hello {{name}}, your verification code is {{code}}.";
        let rendered = template_data.render_template(template);
        
        assert_eq!(rendered, "Hello John Doe, your verification code is 123456.");
    }

    #[test]
    fn test_email_request_builder() {
        let request = EmailRequest::new(vec!["test@example.com"], "Test Subject")
            .with_text_body("Test body")
            .with_priority(EmailPriority::High)
            .with_tag("test", "value");

        assert_eq!(request.to, vec!["test@example.com"]);
        assert_eq!(request.subject, "Test Subject");
        assert_eq!(request.text_body, Some("Test body".to_string()));
        assert!(matches!(request.priority, EmailPriority::High));
        assert_eq!(request.tags.get("test"), Some(&"value".to_string()));
    }
}