# SES Domain Identity
resource "aws_ses_domain_identity" "main" {
  domain = var.domain
}

# SES Domain DKIM
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# SES Configuration Set for tracking emails
resource "aws_ses_configuration_set" "main" {
  name = "${var.environment}-bookkeeper-config-set"
}

# SES Event Destination for tracking bounces, complaints, etc.
resource "aws_ses_event_destination" "cloudwatch" {
  name                   = "${var.environment}-bookkeeper-events"
  configuration_set_name = aws_ses_configuration_set.main.name
  enabled                = true

  cloudwatch_destination {
    default_value  = "default"
    dimension_name = "MessageTag"
    value_source   = "messageTag"
  }

  matching_types = [
    "bounce",
    "complaint",
    "delivery",
    "send",
    "reject"
  ]
}

# Email identities for specific sending addresses
resource "aws_ses_email_identity" "noreply" {
  email = "noreply@${var.domain}"
}

resource "aws_ses_email_identity" "invoices" {
  email = "invoices@${var.domain}"
}

resource "aws_ses_email_identity" "support" {
  email = "support@${var.domain}"
}

# Optional: SNS topic for bounce/complaint notifications
resource "aws_sns_topic" "ses_notifications" {
  name = "${var.environment}-ses-notifications"
}

resource "aws_sns_topic_subscription" "ses_notifications_email" {
  count     = var.notification_email != "" ? 1 : 0
  topic_arn = aws_sns_topic.ses_notifications.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

# Configure bounce and complaint notifications
resource "aws_ses_identity_notification_topic" "bounce" {
  topic_arn                = aws_sns_topic.ses_notifications.arn
  notification_type        = "Bounce"
  identity                 = aws_ses_domain_identity.main.domain
  include_original_headers = true
}

resource "aws_ses_identity_notification_topic" "complaint" {
  topic_arn                = aws_sns_topic.ses_notifications.arn
  notification_type        = "Complaint"
  identity                 = aws_ses_domain_identity.main.domain
  include_original_headers = true
}