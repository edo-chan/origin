# Core Application Parameters

resource "aws_ssm_parameter" "database_url" {
  name        = "/bookkeeper/${var.environment}/database-url"
  type        = "SecureString"
  value       = "PLACEHOLDER_UPDATE_WITH_RDS_ENDPOINT"
  description = "PostgreSQL database connection URL"

  tags = {
    Service  = "bookkeeper"
    Critical = "true"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "redis_url" {
  name        = "/bookkeeper/${var.environment}/redis-url"
  type        = "String"
  value       = "PLACEHOLDER_UPDATE_WITH_REDIS_ENDPOINT"
  description = "Redis cache connection URL"

  tags = {
    Service = "bookkeeper"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/bookkeeper/${var.environment}/jwt-secret"
  type        = "SecureString"
  value       = "PLACEHOLDER_GENERATE_SECURE_SECRET"
  description = "JWT signing secret - MUST BE UPDATED MANUALLY"

  tags = {
    Service  = "bookkeeper"
    Critical = "true"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

# Plaid Configuration

resource "aws_ssm_parameter" "plaid_client_id" {
  name        = "/bookkeeper/${var.environment}/plaid-client-id"
  type        = "String"
  value       = "PLACEHOLDER_ADD_PLAID_CLIENT_ID"
  description = "Plaid API client ID"

  tags = {
    Service  = "bookkeeper"
    Provider = "plaid"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "plaid_secret" {
  name        = "/bookkeeper/${var.environment}/plaid-secret"
  type        = "SecureString"
  value       = "PLACEHOLDER_ADD_PLAID_SECRET"
  description = "Plaid API secret key"

  tags = {
    Service  = "bookkeeper"
    Provider = "plaid"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "plaid_environment" {
  name        = "/bookkeeper/${var.environment}/plaid-environment"
  type        = "String"
  value       = var.environment == "production" ? "production" : var.environment == "staging" ? "development" : "sandbox"
  description = "Plaid environment (sandbox/development/production)"

  tags = {
    Service  = "bookkeeper"
    Provider = "plaid"
  }
}

# Stripe Configuration

resource "aws_ssm_parameter" "stripe_secret_key" {
  name        = "/bookkeeper/${var.environment}/stripe-secret-key"
  type        = "SecureString"
  value       = "PLACEHOLDER_ADD_STRIPE_SECRET_KEY"
  description = "Stripe API secret key"

  tags = {
    Service  = "bookkeeper"
    Provider = "stripe"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name        = "/bookkeeper/${var.environment}/stripe-webhook-secret"
  type        = "SecureString"
  value       = "PLACEHOLDER_ADD_STRIPE_WEBHOOK_SECRET"
  description = "Stripe webhook endpoint secret"

  tags = {
    Service  = "bookkeeper"
    Provider = "stripe"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

# AI Configuration

resource "aws_ssm_parameter" "ai_api_key" {
  name        = "/bookkeeper/${var.environment}/ai-api-key"
  type        = "SecureString"
  value       = "PLACEHOLDER_ADD_AI_API_KEY"
  description = "AI service API key (OpenAI/Claude)"

  tags = {
    Service  = "bookkeeper"
    Provider = "ai"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

# Application Configuration

resource "aws_ssm_parameter" "app_url" {
  name        = "/bookkeeper/${var.environment}/app-url"
  type        = "String"
  value       = var.environment == "production" ? "https://app.${var.domain}" : var.environment == "staging" ? "https://staging.${var.domain}" : "http://localhost:3000"
  description = "Application base URL"

  tags = {
    Service = "bookkeeper"
  }
}

# SES Email Configuration

resource "aws_ssm_parameter" "ses_from_email" {
  name        = "/bookkeeper/${var.environment}/ses-from-email"
  type        = "String"
  value       = "noreply@${var.domain}"
  description = "Default from email address for SES"

  tags = {
    Service  = "bookkeeper"
    Provider = "ses"
  }
}

resource "aws_ssm_parameter" "ses_invoice_email" {
  name        = "/bookkeeper/${var.environment}/ses-invoice-email"
  type        = "String"
  value       = "invoices@${var.domain}"
  description = "Email address for sending invoices"

  tags = {
    Service  = "bookkeeper"
    Provider = "ses"
  }
}

resource "aws_ssm_parameter" "ses_support_email" {
  name        = "/bookkeeper/${var.environment}/ses-support-email"
  type        = "String"
  value       = "support@${var.domain}"
  description = "Support email address"

  tags = {
    Service  = "bookkeeper"
    Provider = "ses"
  }
}

# Security

resource "aws_ssm_parameter" "encryption_key" {
  name        = "/bookkeeper/${var.environment}/encryption-key"
  type        = "SecureString"
  value       = "PLACEHOLDER_GENERATE_ENCRYPTION_KEY"
  description = "AES-256 encryption key for sensitive data"

  tags = {
    Service  = "bookkeeper"
    Critical = "true"
  }

  lifecycle {
    ignore_changes = [value]
  }
}

# Feature Flags

resource "aws_ssm_parameter" "feature_flags" {
  name        = "/bookkeeper/${var.environment}/feature-flags"
  type        = "String"
  value       = jsonencode({
    ai_categorization   = true
    multi_currency      = false
    advanced_reporting  = false
    bank_sync          = true
    invoice_automation = true
  })
  description = "Feature flags configuration (JSON)"

  tags = {
    Service = "bookkeeper"
  }
}