variable "environment" {
  description = "Environment name (production, staging, dev)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["production", "staging", "dev"], var.environment)
    error_message = "Environment must be production, staging, or dev."
  }
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "domain" {
  description = "Domain name for SES email sending"
  type        = string
  default     = "chanbros.xyz"
}

variable "notification_email" {
  description = "Email address for bounce/complaint notifications (optional)"
  type        = string
  default     = ""
}