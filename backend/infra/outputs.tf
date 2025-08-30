# SES Outputs
output "ses_domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = aws_ses_domain_identity.main.arn
}

output "ses_domain_verification_token" {
  description = "Domain verification token - add as TXT record"
  value       = aws_ses_domain_identity.main.verification_token
}

output "ses_dkim_tokens" {
  description = "DKIM tokens for DNS CNAME records"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "ses_configuration_set_name" {
  description = "Name of the SES configuration set"
  value       = aws_ses_configuration_set.main.name
}

# DNS Configuration Instructions
output "dns_configuration" {
  description = "DNS records to add in Namecheap"
  value = {
    txt_verification = {
      type  = "TXT"
      host  = "_amazonses"
      value = aws_ses_domain_identity.main.verification_token
    }
    
    dkim_records = [
      for token in aws_ses_domain_dkim.main.dkim_tokens : {
        type  = "CNAME"
        host  = "${token}._domainkey"
        value = "${token}.dkim.amazonses.com"
      }
    ]
    
    spf_record = {
      type  = "TXT"
      host  = "@"
      value = "v=spf1 include:amazonses.com ~all"
    }
    
    dmarc_record = {
      type  = "TXT"
      host  = "_dmarc"
      value = "v=DMARC1; p=none; rua=mailto:dmarc@${var.domain}; pct=100; sp=none; aspf=r;"
    }
  }
}

# Parameter Store Outputs
output "parameter_names" {
  description = "SSM Parameter Store parameter names"
  value = {
    database_url         = aws_ssm_parameter.database_url.name
    redis_url           = aws_ssm_parameter.redis_url.name
    jwt_secret          = aws_ssm_parameter.jwt_secret.name
    plaid_client_id     = aws_ssm_parameter.plaid_client_id.name
    plaid_secret        = aws_ssm_parameter.plaid_secret.name
    plaid_environment   = aws_ssm_parameter.plaid_environment.name
    stripe_secret_key   = aws_ssm_parameter.stripe_secret_key.name
    stripe_webhook_secret = aws_ssm_parameter.stripe_webhook_secret.name
    ai_api_key          = aws_ssm_parameter.ai_api_key.name
    app_url             = aws_ssm_parameter.app_url.name
    ses_from_email      = aws_ssm_parameter.ses_from_email.name
    ses_invoice_email   = aws_ssm_parameter.ses_invoice_email.name
    ses_support_email   = aws_ssm_parameter.ses_support_email.name
    encryption_key      = aws_ssm_parameter.encryption_key.name
    feature_flags       = aws_ssm_parameter.feature_flags.name
  }
}

output "parameters_requiring_update" {
  description = "Parameters that need manual update after deployment"
  value = [
    aws_ssm_parameter.database_url.name,
    aws_ssm_parameter.redis_url.name,
    aws_ssm_parameter.jwt_secret.name,
    aws_ssm_parameter.plaid_client_id.name,
    aws_ssm_parameter.plaid_secret.name,
    aws_ssm_parameter.stripe_secret_key.name,
    aws_ssm_parameter.stripe_webhook_secret.name,
    aws_ssm_parameter.ai_api_key.name,
    aws_ssm_parameter.encryption_key.name,
  ]
}

output "next_steps" {
  description = "Next steps after deployment"
  value = <<-EOT
    Next Steps:
    1. Add DNS records in Namecheap (see dns_configuration output)
    2. Wait 15-30 minutes for DNS propagation
    3. Verify domain in AWS SES Console
    4. Update Parameter Store values listed in parameters_requiring_update
    5. Request SES production access (currently in sandbox)
    6. Test email sending with: aws ses send-email --from noreply@${var.domain} --to your-email@example.com --subject "Test" --text "Test email"
  EOT
}