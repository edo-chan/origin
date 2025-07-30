#!/bin/bash

# Database Migration Script
# This script runs database migrations for the template project

set -e

echo "🔄 Running database migrations..."

# Check if postgres container is running
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ PostgreSQL container is not running. Please start it with 'docker-compose up postgres'"
    exit 1
fi

# Create greetings table
echo "📝 Creating greetings table..."
docker-compose exec -T postgres psql -U postgres -d template -c "
CREATE TABLE IF NOT EXISTS greetings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
"

# Verify table was created
echo "✅ Verifying table creation..."
docker-compose exec -T postgres psql -U postgres -d template -c "\dt greetings"

echo "🎉 Database migration completed successfully!"