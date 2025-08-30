terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  # Terraform Cloud backend for state storage
  cloud {
    organization = "your-org-name" # Update this with your Terraform Cloud organization
    
    workspaces {
      name = "bookkeeper-production"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "bookkeeper"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}