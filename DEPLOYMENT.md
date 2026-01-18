# Trinity AI - Complete Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying Trinity AI in various environments, from local development to production.

## Table of Contents

1. [Quick Start (Docker)](#quick-start-docker)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Cloud Platforms](#cloud-platforms)
5. [Configuration](#configuration)
6. [Monitoring](#monitoring)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start (Docker)

### Prerequisites

- Docker 20.10+ and Docker Compose 2.0+
- At least one AI API key (Gemini, OpenAI, or Anthropic)
- 4GB RAM minimum, 8GB recommended
- 10GB disk space

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/YUR-AI-CREATIONS/YUR-AI-AGENTS-.git
   cd YUR-AI-AGENTS-
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Deploy**
   
   **Linux/Mac:**
   ```bash
   ./deploy.sh
   ```
   
   **Windows:**
   ```powershell
   .\deploy.ps1
   ```

4. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8090
   - API Docs: http://localhost:8090/api/docs
   - Grafana: http://localhost:3000 (admin/admin)
   - Prometheus: http://localhost:9090

### Verify Deployment

```bash
# Check services
docker-compose ps

# Check backend health
curl http://localhost:8090/health/ai

# View logs
docker-compose logs -f backend
```

---

## Local Development

### Backend Development

1. **Install Python 3.11+**
   ```bash
   python --version  # Should be 3.11+
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run validation**
   ```bash
   python setup_validation.py
   ```

5. **Start backend**
   ```bash
   # Linux/Mac
   python -m uvicorn app:app --reload --port 8090
   
   # Windows
   .\start-local.ps1
   ```

### Frontend Development

1. **Install Node.js 18+**
   ```bash
   node --version  # Should be 18+
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

---

## Production Deployment

### Security Checklist

Before deploying to production, ensure:

- [ ] All API keys are set in environment variables
- [ ] `DISABLE_AUTH=false` in .env
- [ ] Strong `JWT_SECRET_KEY` is set
- [ ] Database password is strong
- [ ] HTTPS/SSL is configured
- [ ] Firewall rules are in place
- [ ] Rate limiting is enabled
- [ ] Backups are automated
- [ ] Monitoring is configured

### Docker Production Deployment

1. **Update docker-compose.yml for production**
   ```yaml
   # Set environment to production
   ENVIRONMENT=production
   DISABLE_AUTH=false
   ```

2. **Use Docker secrets for sensitive data**
   ```bash
   # Create secrets
   echo "your-secret-key" | docker secret create jwt_secret -
   echo "your-api-key" | docker secret create gemini_key -
   ```

3. **Deploy with docker-compose**
   ```bash
   docker-compose -f docker-compose.yml up -d
   ```

4. **Set up reverse proxy (nginx)**
   
   Create `/etc/nginx/sites-available/trinity`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:80;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api/ {
           proxy_pass http://localhost:8090;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **Enable SSL with Certbot**
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests (coming soon).

---

## Cloud Platforms

### AWS Deployment

#### Using AWS ECS

1. **Build and push images to ECR**
   ```bash
   aws ecr create-repository --repository-name trinity-backend
   aws ecr create-repository --repository-name trinity-frontend
   
   # Build and push
   docker build -t trinity-backend .
   docker tag trinity-backend:latest <account-id>.dkr.ecr.<region>.amazonaws.com/trinity-backend:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/trinity-backend:latest
   ```

2. **Create ECS task definition**
   ```bash
   aws ecs create-task-definition --cli-input-json file://aws-task-definition.json
   ```

3. **Create ECS service**
   ```bash
   aws ecs create-service --cluster trinity-cluster --service-name trinity --task-definition trinity
   ```

### Azure Deployment

#### Using Azure Container Instances

```bash
# Create resource group
az group create --name trinity-rg --location eastus

# Create container
az container create \
  --resource-group trinity-rg \
  --name trinity-backend \
  --image trinity-backend:latest \
  --dns-name-label trinity-api \
  --ports 8090 \
  --environment-variables \
    ENVIRONMENT=production \
    GEMINI_API_KEY=$GEMINI_API_KEY
```

### DigitalOcean Deployment

#### Using App Platform

1. **Connect GitHub repository**
2. **Configure build settings**
   - Build Command: `docker build -f Dockerfile .`
   - Run Command: `python -m uvicorn app:app --host 0.0.0.0 --port 8090`
3. **Add environment variables in dashboard**
4. **Deploy**

### Heroku Deployment

```bash
# Create app
heroku create trinity-ai

# Add buildpacks
heroku buildpacks:add heroku/python
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set GEMINI_API_KEY=your_key
heroku config:set ENVIRONMENT=production

# Deploy
git push heroku main
```

---

## Configuration

### Environment Variables

All configuration is done through environment variables. See `.env.example` for all available options.

#### Required Variables

```bash
# At least one AI API key
GEMINI_API_KEY=your_gemini_key
# OR
OPENAI_API_KEY=your_openai_key
# OR
ANTHROPIC_API_KEY=your_anthropic_key
```

#### Production Variables

```bash
ENVIRONMENT=production
DISABLE_AUTH=false
JWT_SECRET_KEY=your_very_secure_random_key_here
DATABASE_URL=postgresql://user:pass@host:5432/trinity
REDIS_URL=redis://redis:6379/0
```

#### Security Variables

```bash
# Generate secure key with:
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Database Setup

#### PostgreSQL

```bash
# Create database
createdb trinity

# Run migrations (if applicable)
python -m alembic upgrade head
```

#### Redis

```bash
# Start Redis with Docker
docker run -d --name trinity-redis -p 6379:6379 redis:7-alpine

# Or install locally
# Ubuntu: sudo apt-get install redis-server
# Mac: brew install redis
```

---

## Monitoring

### Prometheus Metrics

Access metrics at: http://localhost:8090/metrics

### Grafana Dashboards

1. Access Grafana: http://localhost:3000
2. Login: admin/admin (change immediately!)
3. Add Prometheus data source: http://prometheus:9090
4. Import dashboards from `grafana/dashboards/`

### Health Checks

```bash
# Liveness probe
curl http://localhost:8090/health/live

# Readiness probe
curl http://localhost:8090/health/ready

# AI engines health
curl http://localhost:8090/health/ai
```

### Logging

Logs are written to:
- `trinity_requests.log` - API request logs
- `trinity_telemetry.log` - AI engine telemetry
- `logs/` directory in Docker

View logs:
```bash
# Docker
docker-compose logs -f backend

# Local
tail -f trinity_requests.log
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port
lsof -i :8090

# Kill process
kill -9 <PID>

# Or use different port
PORT=8091 python -m uvicorn app:app
```

#### Docker Build Fails

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

#### Module Not Found Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt

# Or in Docker
docker-compose build --no-cache backend
```

#### Database Connection Failed

```bash
# Check database is running
docker-compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

#### AI API Errors

```bash
# Check API keys are set
env | grep API_KEY

# Test specific engine
curl -X POST http://localhost:8090/chat/test \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello", "max_tokens": 100}'
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# In .env
DEBUG=true
LOG_LEVEL=DEBUG

# Restart service
docker-compose restart backend
```

### Getting Help

- Check documentation: `/api/docs` when server is running
- View system stats: `GET /api/v1/admin/stats`
- Check logs: `docker-compose logs backend`
- Health check: `GET /health/ai`

---

## Performance Tuning

### Production Recommendations

1. **Use gunicorn with multiple workers**
   ```bash
   gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Enable Redis caching**
   ```bash
   REDIS_ENABLED=true
   REDIS_URL=redis://redis:6379/0
   ```

3. **Adjust rate limits**
   ```bash
   RATE_LIMIT_PER_MINUTE=120
   ```

4. **Configure resource limits in docker-compose**
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 4G
           reservations:
             cpus: '1'
             memory: 2G
   ```

---

## Backup and Recovery

### Database Backups

```bash
# Backup
docker exec trinity-postgres pg_dump -U trinity trinity > backup.sql

# Restore
docker exec -i trinity-postgres psql -U trinity trinity < backup.sql
```

### Volume Backups

```bash
# Backup uploads
tar -czf uploads-backup.tar.gz uploads/

# Restore
tar -xzf uploads-backup.tar.gz
```

### Automated Backups

See `scripts/backup.sh` for automated backup script.

---

## Scaling

### Horizontal Scaling

1. Deploy multiple backend instances
2. Use load balancer (nginx, AWS ALB, etc.)
3. Use Redis for session management
4. Use shared storage (S3, NFS) for uploads

### Vertical Scaling

Increase resources in docker-compose.yml or cloud provider dashboard.

---

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Keep API keys in environment variables, never in code
3. ✅ Use strong JWT secret key
4. ✅ Enable rate limiting
5. ✅ Keep dependencies updated
6. ✅ Use firewall rules
7. ✅ Regular security audits
8. ✅ Monitor for unusual activity
9. ✅ Regular backups
10. ✅ Principle of least privilege

---

## Maintenance

### Update Dependencies

```bash
# Python
pip install -r requirements.txt --upgrade

# Node
npm update

# Docker images
docker-compose pull
docker-compose up -d
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

---

## Support

For issues, questions, or contributions:
- GitHub Issues: https://github.com/YUR-AI-CREATIONS/YUR-AI-AGENTS-/issues
- Documentation: See `/api/docs` when running

---

## License

See LICENSE file for details.
