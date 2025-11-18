#!/bin/bash

# Plinto Local Demo Startup Script
# Starts all services needed for local testing and demonstration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║          PLINTO LOCAL DEMO - STARTUP SCRIPT                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    local attempt=0

    echo -e "${YELLOW}Waiting for $name to be ready...${NC}"

    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✓ $name is ready${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done

    echo -e "${RED}✗ $name failed to start${NC}"
    return 1
}

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠ Docker not found. Will try to start services without Docker.${NC}"
    USE_DOCKER=false
else
    echo -e "${GREEN}✓ Docker found${NC}"
    USE_DOCKER=true
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Node.js found ($(node --version))${NC}"
fi

if ! command -v python &> /dev/null; then
    echo -e "${RED}✗ Python not found. Please install Python 3.11+${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Python found ($(python --version))${NC}"
fi

# Step 1: Start PostgreSQL and Redis
echo ""
echo -e "${BLUE}Step 1: Starting PostgreSQL and Redis...${NC}"

if [ "$USE_DOCKER" = true ]; then
    cd "$PROJECT_ROOT/apps/api"

    # Check if containers are already running
    if docker-compose ps | grep -q "Up"; then
        echo -e "${YELLOW}Docker containers already running${NC}"
    else
        echo "Starting Docker containers..."
        docker-compose up -d postgres redis

        # Wait for PostgreSQL
        echo "Waiting for PostgreSQL..."
        sleep 5

        # Wait for Redis
        echo "Waiting for Redis..."
        sleep 2
    fi

    echo -e "${GREEN}✓ PostgreSQL running on port 5432${NC}"
    echo -e "${GREEN}✓ Redis running on port 6379${NC}"
else
    echo -e "${YELLOW}⚠ Skipping Docker setup. Ensure PostgreSQL and Redis are running manually.${NC}"
fi

# Step 2: Run database migrations
echo ""
echo -e "${BLUE}Step 2: Running database migrations...${NC}"

cd "$PROJECT_ROOT/apps/api"

# Check if alembic is installed
if ! command -v alembic &> /dev/null; then
    echo "Installing Python dependencies..."
    pip install -r requirements.txt > /dev/null 2>&1
fi

# Run migrations
echo "Applying database migrations..."
alembic upgrade head

echo -e "${GREEN}✓ Database migrations complete${NC}"

# Step 3: Start API server in background
echo ""
echo -e "${BLUE}Step 3: Starting FastAPI backend...${NC}"

cd "$PROJECT_ROOT/apps/api"

# Kill existing API process if running
if check_port 8000; then
    echo "Stopping existing API server on port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start API server in background
echo "Starting API server on http://localhost:8000..."
nohup uvicorn main:app --host 0.0.0.0 --port 8000 --reload > "$PROJECT_ROOT/logs/api.log" 2>&1 &
API_PID=$!

# Wait for API to be ready
wait_for_service "http://localhost:8000/health" "API server" || {
    echo -e "${RED}Failed to start API server. Check logs/api.log${NC}"
    exit 1
}

echo -e "${GREEN}✓ API server running (PID: $API_PID)${NC}"

# Step 4: Start demo app in background
echo ""
echo -e "${BLUE}Step 4: Starting demo application...${NC}"

cd "$PROJECT_ROOT/apps/demo"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install > /dev/null 2>&1
fi

# Kill existing demo process if running
if check_port 3002; then
    echo "Stopping existing demo app on port 3002..."
    lsof -ti:3002 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start demo app in background
echo "Starting demo app on http://localhost:3002..."
nohup npm run dev > "$PROJECT_ROOT/logs/demo.log" 2>&1 &
DEMO_PID=$!

# Wait for demo app to be ready
wait_for_service "http://localhost:3002" "Demo app" || {
    echo -e "${RED}Failed to start demo app. Check logs/demo.log${NC}"
    exit 1
}

echo -e "${GREEN}✓ Demo app running (PID: $DEMO_PID)${NC}"

# Final summary
echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              ALL SERVICES STARTED SUCCESSFULLY             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Available Services:${NC}"
echo ""
echo -e "  ${GREEN}✓${NC} Demo Application:  ${BLUE}http://localhost:3002${NC}"
echo -e "  ${GREEN}✓${NC} API Backend:       ${BLUE}http://localhost:8000${NC}"
echo -e "  ${GREEN}✓${NC} API Documentation: ${BLUE}http://localhost:8000/docs${NC}"
echo -e "  ${GREEN}✓${NC} Health Check:      ${BLUE}http://localhost:8000/health${NC}"
echo ""
echo -e "${BLUE}Logs:${NC}"
echo -e "  API:   tail -f $PROJECT_ROOT/logs/api.log"
echo -e "  Demo:  tail -f $PROJECT_ROOT/logs/demo.log"
echo ""
echo -e "${BLUE}To stop all services:${NC}"
echo -e "  cd $PROJECT_ROOT && ./scripts/stop-demo.sh"
echo ""
echo -e "${YELLOW}Press Ctrl+C to view logs (services will continue running in background)${NC}"
echo ""

# Save PIDs for cleanup
mkdir -p "$PROJECT_ROOT/logs"
echo "$API_PID" > "$PROJECT_ROOT/logs/api.pid"
echo "$DEMO_PID" > "$PROJECT_ROOT/logs/demo.pid"

# Follow logs
tail -f "$PROJECT_ROOT/logs/api.log" "$PROJECT_ROOT/logs/demo.log"
