#!/bin/bash

# SQLx Migration Script
# This script runs database migrations using SQLx CLI

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Detect environment and set appropriate DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
    # Use existing DATABASE_URL if set
    DB_URL="$DATABASE_URL"
elif [ -f "/.dockerenv" ] || [ -n "$KUBERNETES_SERVICE_HOST" ]; then
    # Running inside container - use container network
    DB_URL="postgres://postgres:postgres@postgres:5432/template"
else
    # Running on host machine - use localhost with mapped port
    DB_URL="postgres://postgres:postgres@localhost:5433/template"
fi

ACTION=${1:-"run"}

echo -e "${YELLOW}SQLx Migration Script${NC}"
echo -e "Database URL: ${DB_URL}"
echo -e "Action: ${ACTION}"
echo ""

# Function to check if SQLx CLI is installed
check_sqlx_cli() {
    if ! command -v sqlx &> /dev/null; then
        echo -e "${RED}Error: sqlx CLI is not installed${NC}"
        echo "Install with: cargo install sqlx-cli --no-default-features --features rustls,postgres"
        exit 1
    fi
}

# Function to wait for database to be ready
wait_for_db() {
    echo -e "${YELLOW}Waiting for PostgreSQL server to be ready...${NC}"
    max_attempts=30
    attempt=1
    
    # Extract connection parts from DATABASE_URL for pg_isready
    # Format: postgres://user:pass@host:port/dbname
    if [[ "$DB_URL" =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
        PG_HOST="${BASH_REMATCH[3]}"
        PG_PORT="${BASH_REMATCH[4]}"
        PG_USER="${BASH_REMATCH[1]}"
    else
        echo -e "${RED}Error: Invalid DATABASE_URL format${NC}"
        exit 1
    fi
    
    while [ $attempt -le $max_attempts ]; do
        # Try pg_isready first, fall back to sqlx connection test
        if command -v pg_isready &> /dev/null; then
            if pg_isready -h "$PG_HOST" -p "$PG_PORT" -U "$PG_USER" &> /dev/null; then
                echo -e "${GREEN}PostgreSQL server is ready!${NC}"
                return 0
            fi
        else
            # Fallback: try to connect with sqlx
            # Create a test database URL to postgres database (always exists)
            TEST_URL="postgres://${PG_USER}:$(echo "$DB_URL" | sed -n 's/.*:\([^@]*\)@.*/\1/p')@${PG_HOST}:${PG_PORT}/postgres"
            if timeout 5 sqlx database --database-url "$TEST_URL" exists &> /dev/null; then
                echo -e "${GREEN}PostgreSQL server is ready!${NC}"
                return 0
            fi
        fi
        
        echo "Attempt $attempt/$max_attempts: PostgreSQL server not ready, waiting..."
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}Error: PostgreSQL server failed to become ready after $max_attempts attempts${NC}"
    exit 1
}

# Function to run migrations
run_migrations() {
    echo -e "${YELLOW}Running database migrations...${NC}"
    
    # Create database if it doesn't exist
    sqlx database create --database-url "$DB_URL" || true
    
    # Run migrations
    if sqlx migrate run --database-url "$DB_URL" --source ./migrations; then
        echo -e "${GREEN}✓ Migrations completed successfully${NC}"
    else
        echo -e "${RED}✗ Migration failed${NC}"
        exit 1
    fi
}

# Function to revert last migration
revert_migration() {
    echo -e "${YELLOW}Reverting last migration...${NC}"
    
    if sqlx migrate revert --database-url "$DB_URL" --source ./migrations; then
        echo -e "${GREEN}✓ Migration reverted successfully${NC}"
    else
        echo -e "${RED}✗ Migration revert failed${NC}"
        exit 1
    fi
}

# Function to show migration info
show_info() {
    echo -e "${YELLOW}Migration information:${NC}"
    
    echo -e "\n${YELLOW}Applied migrations:${NC}"
    sqlx migrate info --database-url "$DB_URL" --source ./migrations || true
    
    echo -e "\n${YELLOW}Available migration files:${NC}"
    ls -la migrations/ | grep -E '\.(up|down)\.sql$' || echo "No migration files found"
}

# Function to create new migration
create_migration() {
    if [ -z "$2" ]; then
        echo -e "${RED}Error: Migration name required${NC}"
        echo "Usage: $0 add <migration_name>"
        exit 1
    fi
    
    migration_name="$2"
    echo -e "${YELLOW}Creating new migration: $migration_name${NC}"
    
    if sqlx migrate add "$migration_name" --source ./migrations; then
        echo -e "${GREEN}✓ Migration files created successfully${NC}"
        echo "Edit the generated .up.sql and .down.sql files in migrations/ directory"
    else
        echo -e "${RED}✗ Failed to create migration${NC}"
        exit 1
    fi
}

# Main script logic
main() {
    check_sqlx_cli
    
    case "$ACTION" in
        "run")
            wait_for_db
            run_migrations
            ;;
        "revert")
            wait_for_db
            revert_migration
            ;;
        "info")
            wait_for_db
            show_info
            ;;
        "add")
            create_migration "$@"
            ;;
        "reset")
            echo -e "${YELLOW}Resetting database (dropping and recreating)...${NC}"
            sqlx database drop --database-url "$DB_URL" -y || true
            sqlx database create --database-url "$DB_URL"
            run_migrations
            ;;
        *)
            echo -e "${RED}Unknown action: $ACTION${NC}"
            echo ""
            echo "Usage: $0 [action]"
            echo "Actions:"
            echo "  run     - Run pending migrations (default)"
            echo "  revert  - Revert the last migration"
            echo "  info    - Show migration status"
            echo "  add     - Create new migration (requires name)"
            echo "  reset   - Drop and recreate database with all migrations"
            echo ""
            echo "Environment variables:"
            echo "  DATABASE_URL - Database connection string"
            echo "                 Default: postgres://postgres:postgres@localhost:5433/template"
            exit 1
            ;;
    esac
}

# Change to backend directory
cd "$(dirname "$0")"

# Run main function
main "$@"

echo -e "${GREEN}✓ Migration script completed${NC}"