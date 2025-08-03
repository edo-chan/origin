#!/bin/bash

# Deploy local development parameters to AWS Parameter Store
echo "Deploying local development parameters..."

# Set environment to local
AWS_PROFILE=personal pulumi config set environment local

# Set a placeholder domain for local development
AWS_PROFILE=personal pulumi config set domain local.example.com

# Deploy the parameters
AWS_PROFILE=personal pulumi up --yes

echo "Local development parameters deployed!"
echo ""
echo "Parameters created:"
echo "- /origin/local/database-url"
echo "- /origin/local/redis-url" 
echo "- /origin/local/jwt-secret"
echo "- /origin/local/claude-api-key"
echo ""
echo "You can now update these values in AWS Parameter Store as needed."