#!/bin/bash
# Trinity AI - Quick Deployment Script

set -e

echo "🚀 Trinity AI Deployment Script"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your API keys and configuration"
    echo "   Required: At least one AI API key (GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY)"
    echo ""
    read -p "Press Enter once you've configured .env file..." 
fi

# Create required directories
echo "📁 Creating required directories..."
mkdir -p uploads logs

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo ""
echo "✅ Trinity AI is starting!"
echo "================================"
echo ""
echo "Services:"
echo "  - Backend API:  http://localhost:8090"
echo "  - Frontend:     http://localhost:80"
echo "  - Prometheus:   http://localhost:9090"
echo "  - Grafana:      http://localhost:3000 (admin/admin)"
echo ""
echo "Health checks:"
echo "  - API Health:   curl http://localhost:8090/health/ai"
echo "  - API Docs:     http://localhost:8090/api/docs"
echo ""
echo "View logs:"
echo "  docker-compose logs -f backend"
echo ""
echo "Stop services:"
echo "  docker-compose down"
echo ""
