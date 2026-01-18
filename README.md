# Trinity AI Platform

Multi-Modal AI Orchestration Platform with FastAPI backend and React frontend.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker and Docker Compose (for containerized deployment)
- At least one AI API key (Gemini, OpenAI, or Anthropic)

### Local Development

#### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run backend
python -m uvicorn app:app --reload --port 8090
```

#### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8090
- API Docs: http://localhost:8090/api/docs

### Docker Deployment

Complete stack deployment with one command:

```bash
# Linux/Mac
./deploy.sh

# Windows
.\deploy.ps1
```

Or manually:

```bash
# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d
```

Services:
- Frontend: http://localhost:80
- Backend API: http://localhost:8090
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

## 📦 What's Included

### Backend (FastAPI)
- Multi-modal AI orchestration (Gemini, OpenAI, Anthropic)
- Health check endpoints
- Chat API
- File upload and processing
- Project management
- Prometheus metrics
- Security middleware

### Frontend (React + Vite)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Hot Module Replacement

### Infrastructure
- Docker containerization
- Multi-service orchestration
- Redis caching
- PostgreSQL database
- Monitoring (Prometheus + Grafana)
- CI/CD pipelines

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test
pytest tests/test_app.py -v
```

## 📖 Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- [OPERATIONS.md](OPERATIONS.md) - Operations guide
- [API Docs](http://localhost:8090/api/docs) - Interactive API documentation

## 🏗️ Project Structure

```
.
├── app.py                  # FastAPI application
├── config.py               # Configuration management
├── middleware/             # Security and rate limiting
├── routers/                # API route handlers
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   └── main.tsx           # Frontend entry point
├── tests/                  # Test suite
├── docker-compose.yml      # Multi-service orchestration
├── Dockerfile             # Backend container
├── Dockerfile.frontend    # Frontend container
└── index.html             # Vite entry point
```

## 🔒 Security

- Security headers middleware
- Rate limiting
- CORS configuration
- JWT authentication ready
- File upload validation
- Environment-based secrets

## 🌐 Deployment Options

- **Docker Compose** - Recommended for quick start
- **AWS** - ECS, Fargate, App Runner
- **Azure** - Container Instances, App Service
- **Google Cloud** - Cloud Run, GKE
- **DigitalOcean** - App Platform
- **Heroku** - Container Registry
- **Kubernetes** - Any cluster

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📊 Monitoring

- Health checks: `/health/live`, `/health/ready`, `/health/ai`
- Metrics: `/metrics` (Prometheus format)
- Grafana dashboards at http://localhost:3000
- Request/response logging
- AI engine telemetry

## 🛠️ Development

### Build Frontend

```bash
npm run build
```

### Lint

```bash
# Python
flake8 .

# JavaScript
npm run lint
```

### Environment Variables

All configuration via environment variables. See `.env.example` for available options.

Required:
- At least one AI API key (`GEMINI_API_KEY`, `OPENAI_API_KEY`, or `ANTHROPIC_API_KEY`)

Optional:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET_KEY` - Authentication secret

## 📝 License

See [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check [DEPLOYMENT.md](DEPLOYMENT.md) for troubleshooting
- View logs: `docker-compose logs -f backend`
- Health check: `curl http://localhost:8090/health/ai`

## ✨ Features

- ✅ Multi-modal AI orchestration
- ✅ Automatic engine selection and failover
- ✅ Document processing (PDF, DOCX, images, spreadsheets)
- ✅ Real-time chat interface
- ✅ Project workspace isolation
- ✅ Background task processing
- ✅ WebSocket support
- ✅ Comprehensive monitoring
- ✅ Production-ready deployment
