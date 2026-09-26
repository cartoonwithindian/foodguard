#!/bin/bash
# FoodGuard AI - Unified Service Manager
# Starts all services for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/tmp/foodguard-logs"

mkdir -p "$LOG_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    FoodGuard AI Platform                    ║"
    echo "║                   Multi-Service Startup                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

check_port() {
    if lsof -Pi :"$1" -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port in use
    fi
    return 1  # Port free
}

start_backend() {
    echo -e "\n${CYAN}Starting Backend API (Hono)...${NC}"
    cd "$SCRIPT_DIR/backend"
    
    if check_port 3001; then
        print_warning "Port 3001 already in use"
        return
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "Installing backend dependencies..."
        npm install --silent
    fi
    
    nohup npm run dev > "$LOG_DIR/backend.log" 2>&1 &
    echo $! > "$LOG_DIR/backend.pid"
    sleep 3
    
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        print_status "Backend API running on http://localhost:3001"
    else
        print_warning "Backend API starting on http://localhost:3001"
    fi
}

start_frontend() {
    echo -e "\n${CYAN}Starting Frontend (Next.js)...${NC}"
    cd "$SCRIPT_DIR/frontend"
    
    if check_port 3000; then
        print_warning "Port 3000 already in use"
        return
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "Installing frontend dependencies..."
        npm install --silent
    fi
    
    nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
    echo $! > "$LOG_DIR/frontend.pid"
    sleep 5
    
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend running on http://localhost:3000"
    else
        print_warning "Frontend starting on http://localhost:3000"
    fi
}

start_fssai_api() {
    echo -e "\n${CYAN}Starting FSSAI Regulatory API...${NC}"
    cd "$SCRIPT_DIR/fssai-api"
    
    if check_port 8002; then
        print_warning "Port 8002 already in use"
        return
    fi
    
    if [ ! -d ".venv" ]; then
        print_warning "Creating Python virtual environment..."
        python3 -m venv .venv
        .venv/bin/pip install -r requirements.txt --quiet
    fi
    
    nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8002 > "$LOG_DIR/fssai-api.log" 2>&1 &
    echo $! > "$LOG_DIR/fssai-api.pid"
    sleep 2
    
    if curl -s http://localhost:8002/ > /dev/null 2>&1; then
        print_status "FSSAI API running on http://localhost:8002"
    else
        print_warning "FSSAI API starting on http://localhost:8002"
    fi
}

start_legal_metrology() {
    echo -e "\n${CYAN}Starting Legal Metrology API...${NC}"
    cd "$SCRIPT_DIR/legal-metrology"
    
    if check_port 8001; then
        print_warning "Port 8001 already in use"
        return
    fi
    
    if [ ! -d ".venv" ]; then
        print_warning "Creating Python virtual environment..."
        python3 -m venv .venv
        .venv/bin/pip install -r requirements.txt --quiet
    fi
    
    nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 > "$LOG_DIR/legal-metrology.log" 2>&1 &
    echo $! > "$LOG_DIR/legal-metrology.pid"
    sleep 2
    
    if curl -s http://localhost:8001/ > /dev/null 2>&1; then
        print_status "Legal Metrology API running on http://localhost:8001"
    else
        print_warning "Legal Metrology API starting on http://localhost:8001"
    fi
}

start_visual_search() {
    echo -e "\n${CYAN}Starting Visual Search API...${NC}"
    cd "$SCRIPT_DIR/visual-search-api"
    
    if check_port 8003; then
        print_warning "Port 8003 already in use"
        return
    fi
    
    if [ ! -d ".venv" ]; then
        print_warning "Creating Python virtual environment..."
        python3 -m venv .venv
        .venv/bin/pip install -r requirements.txt --quiet
    fi
    
    nohup .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8003 > "$LOG_DIR/visual-search.log" 2>&1 &
    echo $! > "$LOG_DIR/visual-search.pid"
    sleep 3
    
    if curl -s http://localhost:8003/health > /dev/null 2>&1; then
        print_status "Visual Search API running on http://localhost:8003"
    else
        print_warning "Visual Search API starting on http://localhost:8003"
    fi
}

start_barcode_benchmark() {
    echo -e "\n${CYAN}Starting Barcode Benchmark...${NC}"
    cd "$SCRIPT_DIR/barcode-benchmark"
    
    if check_port 4200; then
        print_warning "Port 4200 already in use"
        return
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "Installing barcode benchmark dependencies..."
        npm install --silent
    fi
    
    if [ ! -d "dist" ]; then
        print_warning "Building barcode benchmark..."
        npm run build --silent
    fi
    
    PORT=4200 nohup node serve.js > "$LOG_DIR/barcode-benchmark.log" 2>&1 &
    echo $! > "$LOG_DIR/barcode-benchmark.pid"
    sleep 2
    
    if curl -s http://localhost:4200 > /dev/null 2>&1; then
        print_status "Barcode Benchmark running on http://localhost:4200"
    else
        print_warning "Barcode Benchmark starting on http://localhost:4200"
    fi
}

print_summary() {
    echo -e "\n${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}All services started!${NC}"
    echo -e "${CYAN}══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  ${GREEN}Frontend:${NC}          http://localhost:3000"
    echo -e "  ${GREEN}Backend API:${NC}       http://localhost:3001"
    echo -e "  ${GREEN}FSSAI API:${NC}         http://localhost:8002"
    echo -e "  ${GREEN}Legal Metrology:${NC}   http://localhost:8001"
    echo -e "  ${GREEN}Visual Search:${NC}     http://localhost:8003"
    echo -e "  ${GREEN}Barcode Benchmark:${NC} http://localhost:4200"
    echo ""
    echo -e "  ${YELLOW}Logs:${NC} $LOG_DIR/"
    echo ""
    echo -e "  ${CYAN}To stop all services:${NC}"
    echo -e "    $0 stop"
    echo ""
}

stop_services() {
    echo -e "\n${YELLOW}Stopping all services...${NC}"
    
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            service=$(basename "$pid_file" .pid)
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null
                print_status "Stopped $service (PID: $pid)"
            fi
            rm -f "$pid_file"
        fi
    done
    
    echo -e "${GREEN}All services stopped${NC}"
}

# Parse arguments
case "${1:-start}" in
    start)
        print_header
        start_backend
        start_frontend
        start_fssai_api
        start_legal_metrology
        start_visual_search
        start_barcode_benchmark
        print_summary
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        print_header
        start_backend
        start_frontend
        start_fssai_api
        start_legal_metrology
        start_visual_search
        start_barcode_benchmark
        print_summary
        ;;
    status)
        echo -e "\n${CYAN}Service Status:${NC}\n"
        for port in 3000 3001 8002 8001 8003 4200; do
            if check_port $port; then
                echo -e "  ${GREEN}✓${NC} Port $port: Running"
            else
                echo -e "  ${RED}✗${NC} Port $port: Stopped"
            fi
        done
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
