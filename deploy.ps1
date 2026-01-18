# Trinity AI - Windows Deployment Script
# PowerShell Script

Write-Host "🚀 Trinity AI Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if Docker is installed
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "❌ Docker not found. Please install Docker Desktop first."
    exit 1
}

# Check if docker-compose is available
$composeCmd = $null
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $composeCmd = "docker-compose"
} elseif (docker compose version 2>$null) {
    $composeCmd = "docker compose"
} else {
    Write-Error "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
}

# Check for .env file
if (!(Test-Path .env)) {
    Write-Warning "⚠️  No .env file found. Creating from template..."
    Copy-Item .env.example .env
    Write-Host "📝 Please edit .env file with your API keys and configuration" -ForegroundColor Yellow
    Write-Host "   Required: At least one AI API key (GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY)" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter once you've configured .env file..."
}

# Create required directories
Write-Host "📁 Creating required directories..." -ForegroundColor Green
New-Item -ItemType Directory -Force -Path uploads, logs | Out-Null

# Build and start services
Write-Host "🔨 Building Docker images..." -ForegroundColor Green
if ($composeCmd -eq "docker compose") {
    docker compose build
} else {
    docker-compose build
}

Write-Host "🚀 Starting services..." -ForegroundColor Green
if ($composeCmd -eq "docker compose") {
    docker compose up -d
} else {
    docker-compose up -d
}

Write-Host ""
Write-Host "✅ Trinity AI is starting!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "  - Backend API:  http://localhost:8090"
Write-Host "  - Frontend:     http://localhost:80"
Write-Host "  - Prometheus:   http://localhost:9090"
Write-Host "  - Grafana:      http://localhost:3000 (admin/admin)"
Write-Host ""
Write-Host "Health checks:" -ForegroundColor Yellow
Write-Host "  - API Health:   Invoke-RestMethod http://localhost:8090/health/ai"
Write-Host "  - API Docs:     http://localhost:8090/api/docs"
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
if ($composeCmd -eq "docker compose") {
    Write-Host "  docker compose logs -f backend"
} else {
    Write-Host "  docker-compose logs -f backend"
}
Write-Host ""
Write-Host "Stop services:" -ForegroundColor Yellow
if ($composeCmd -eq "docker compose") {
    Write-Host "  docker compose down"
} else {
    Write-Host "  docker-compose down"
}
Write-Host ""
