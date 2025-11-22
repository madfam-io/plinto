#!/bin/bash

# Janua Local Demo Shutdown Script
# Stops all services started by start-demo.sh

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
echo "║          JANUA LOCAL DEMO - SHUTDOWN SCRIPT               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Stop API server
if [ -f "$PROJECT_ROOT/logs/api.pid" ]; then
    API_PID=$(cat "$PROJECT_ROOT/logs/api.pid")
    if ps -p $API_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping API server (PID: $API_PID)...${NC}"
        kill $API_PID 2>/dev/null || true
        echo -e "${GREEN}✓ API server stopped${NC}"
    else
        echo -e "${YELLOW}API server not running${NC}"
    fi
    rm -f "$PROJECT_ROOT/logs/api.pid"
else
    echo -e "${YELLOW}No API PID file found${NC}"
fi

# Stop demo app
if [ -f "$PROJECT_ROOT/logs/demo.pid" ]; then
    DEMO_PID=$(cat "$PROJECT_ROOT/logs/demo.pid")
    if ps -p $DEMO_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Stopping demo app (PID: $DEMO_PID)...${NC}"
        kill $DEMO_PID 2>/dev/null || true
        echo -e "${GREEN}✓ Demo app stopped${NC}"
    else
        echo -e "${YELLOW}Demo app not running${NC}"
    fi
    rm -f "$PROJECT_ROOT/logs/demo.pid"
else
    echo -e "${YELLOW}No demo PID file found${NC}"
fi

# Stop Docker containers (optional)
echo ""
read -p "Stop Docker containers (PostgreSQL, Redis)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd "$PROJECT_ROOT/apps/api"
    docker-compose down
    echo -e "${GREEN}✓ Docker containers stopped${NC}"
fi

echo ""
echo -e "${GREEN}All services stopped successfully${NC}"
