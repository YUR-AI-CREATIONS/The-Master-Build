# Trinity AI - Production Deployment Guide (Option 2)

## Overview
This guide walks you through deploying Trinity AI for small-scale production use (up to 100 concurrent users) with authentication, PostgreSQL database, and secure configuration.

---

## Pre-Deployment Checklist

### Required
- [x] PostgreSQL 15+ database
- [x] Python 3.11+ installed
- [x] At least 1 AI API key (Gemini, OpenAI, or Anthropic)
- [x] SSL certificate (Let's Encrypt recommended)
- [x] Domain name pointing to your server
- [x] 2GB+ RAM, 20GB+ storage

### Recommended
- [ ] Backup strategy configured
- [ ] Monitoring service (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry)
- [ ] CDN for static assets (Cloudflare)

---

## Step 1: Install Dependencies

```powershell
# Clone or upload your repository
cd C:\TrinityAI

# Install Python dependencies
python -m pip install -r requirements.txt

# Verify installation
python setup_validation.py
```

---

## Step 2: Configure Environment Variables

### Create .env file
```powershell
# Copy example file
Copy-Item .env.example .env

# Edit .env with your values
notepad .env
```

### Critical Configuration

```env
# Generate secure JWT secret
JWT_SECRET_KEY=<run: python -c "import secrets; print(secrets.token_urlsafe(32))">

# Database connection
DATABASE_URL=postgresql+asyncpg://trinity:STRONG_PASSWORD@localhost:5432/trinity

# AI API Keys (at least one)
GEMINI_API_KEY=your_actual_key
OPENAI_API_KEY=your_actual_key
ANTHROPIC_API_KEY=your_actual_key

# NEVER set this to true in production!
DISABLE_AUTH=false
```

---

## Step 3: Set Up PostgreSQL Database

### Option A: Docker (Easiest)

```powershell
# Start PostgreSQL container
docker run -d `
  --name trinity-postgres `
  -e POSTGRES_USER=trinity `
  -e POSTGRES_PASSWORD=STRONG_PASSWORD_HERE `
  -e POSTGRES_DB=trinity `
  -p 5432:5432 `
  --restart unless-stopped `
  postgres:15-alpine

# Verify it's running
docker ps | Select-String trinity-postgres
```

### Option B: Native Install (Windows)

1. Download PostgreSQL 15: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Create database:
   ```sql
   CREATE DATABASE trinity;
   CREATE USER trinity WITH PASSWORD 'STRONG_PASSWORD';
   GRANT ALL PRIVILEGES ON DATABASE trinity TO trinity;
   ```

### Initialize Database

```powershell
# Create tables and default admin user
python init_db.py
```

You'll see output with default admin credentials:
```
Email:    admin@trinity.ai
Password: admin123
API Key:  tk_xxxxx...
```

**⚠️ CRITICAL: Change these credentials immediately!**

---

## Step 4: Test Locally

```powershell
# Start the server
.\start-local.ps1 -Port 8090

# In another terminal, test authentication
$body = @{email="admin@trinity.ai"; password="admin123"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8090/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.access_token

# Test authenticated endpoint
$headers = @{Authorization="Bearer $token"}
Invoke-RestMethod -Uri "http://localhost:8090/api/v1/auth/me" -Headers $headers
```

---

## Step 5: Secure Your Deployment

### Change Default Admin Credentials

```powershell
# Login and create new admin user via API
$body = @{email="youremail@company.com"; password="SecurePassword123!"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8090/api/v1/auth/register" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"}

# Manually update is_admin in database
# Connect to PostgreSQL and run:
# UPDATE users SET is_admin = true WHERE email = 'youremail@company.com';
```

### Configure Firewall

```powershell
# Windows Firewall - allow only necessary ports
New-NetFirewallRule -DisplayName "Trinity API" -Direction Inbound -LocalPort 8090 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "PostgreSQL" -Direction Inbound -LocalPort 5432 -Protocol TCP -Action Block

# Only allow PostgreSQL from localhost
New-NetFirewallRule -DisplayName "PostgreSQL Local" -Direction Inbound -LocalPort 5432 -Protocol TCP -RemoteAddress 127.0.0.1 -Action Allow
```

---

## Step 6: Deploy with Docker (Recommended)

### Build and Run

```powershell
# Set environment variables
$env:GEMINI_API_KEY="your_key"
$env:OPENAI_API_KEY="your_key"
$env:ANTHROPIC_API_KEY="your_key"
$env:JWT_SECRET_KEY="your_secure_random_key"

# Start all services
docker compose up -d --build

# Check logs
docker logs trinity-api -f

# Initialize database (first time only)
docker exec trinity-api python init_db.py
```

### Services Running
- API: http://localhost:8090
- PostgreSQL: localhost:5432 (internal only)
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

---

## Step 7: Configure HTTPS/SSL

### Option A: Using Caddy (Automatic HTTPS)

Create `Caddyfile`:
```
api.yourdomain.com {
    reverse_proxy localhost:8090
    
    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Frame-Options "DENY"
        X-Content-Type-Options "nosniff"
    }
}
```

Add to `docker-compose.yml`:
```yaml
  caddy:
    image: caddy:2-alpine
    container_name: trinity-caddy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    restart: unless-stopped
    depends_on:
      - trinity-api

volumes:
  caddy_data:
  caddy_config:
  postgres_data:
```

Restart:
```powershell
docker compose up -d
```

### Option B: Using nginx + Let's Encrypt

Install certbot and configure nginx reverse proxy. See: https://certbot.eff.org/

---

## Step 8: Set Up Automated Backups

### Database Backup Script

Create `backup-db.ps1`:
```powershell
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "backups/trinity_$timestamp.sql"

# Create backups directory
New-Item -ItemType Directory -Force -Path backups

# Backup database
docker exec trinity-postgres pg_dump -U trinity trinity > $backupFile

# Compress
Compress-Archive -Path $backupFile -DestinationPath "$backupFile.zip"
Remove-Item $backupFile

# Keep only last 7 days
Get-ChildItem backups/*.zip | Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-7)} | Remove-Item

Write-Host "✅ Backup completed: $backupFile.zip"
```

### Schedule Daily Backups

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File C:\TrinityAI\backup-db.ps1"
$trigger = New-ScheduledTaskTrigger -Daily -At 2AM
Register-ScheduledTask -TaskName "TrinityAI-Backup" -Action $action -Trigger $trigger -User "SYSTEM"
```

---

## Step 9: Monitoring & Alerting

### Health Check Endpoint
```powershell
# Add to your monitoring service (UptimeRobot, Pingdom, etc.)
https://api.yourdomain.com/health/live
```

### Prometheus + Grafana

Already included in docker-compose!

1. Open Grafana: http://localhost:3000
2. Login: admin/admin (change immediately!)
3. Add Prometheus data source: http://prometheus:9090
4. Import dashboards from `ops/grafana/dashboards/`

### Optional: Add Sentry for Error Tracking

```powershell
pip install sentry-sdk[fastapi]
```

In `app.py`:
```python
import sentry_sdk
sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=0.1,
)
```

---

## Step 10: Go Live Checklist

### Security
- [ ] Changed default admin password
- [ ] Generated secure JWT_SECRET_KEY
- [ ] DISABLE_AUTH=false
- [ ] Firewall configured
- [ ] HTTPS/SSL enabled
- [ ] Database password is strong

### Infrastructure
- [ ] Database backup automated
- [ ] Monitoring configured
- [ ] Logs rotating properly
- [ ] Disk space monitored
- [ ] Memory limits set

### Testing
- [ ] Can register new user
- [ ] Can login and get JWT token
- [ ] Can create API key
- [ ] Can upload document
- [ ] Can chat with AI
- [ ] All health checks passing

---

## Common Deployment Platforms

### DigitalOcean App Platform

1. Create new app from GitHub repo
2. Set environment variables in dashboard
3. Add PostgreSQL managed database ($15/mo)
4. Deploy!

**Cost:** ~$20/mo (app) + $15/mo (database) = $35/mo

### Azure App Service

```powershell
# Install Azure CLI
# https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Create resource group
az group create --name trinity-rg --location eastus

# Create PostgreSQL
az postgres flexible-server create `
  --resource-group trinity-rg `
  --name trinity-db `
  --admin-user trinity `
  --admin-password STRONG_PASSWORD `
  --sku-name Standard_B1ms

# Create App Service
az webapp create `
  --resource-group trinity-rg `
  --plan trinity-plan `
  --name trinity-api `
  --runtime "PYTHON:3.11"

# Configure environment variables
az webapp config appsettings set `
  --resource-group trinity-rg `
  --name trinity-api `
  --settings `
    DATABASE_URL="..." `
    JWT_SECRET_KEY="..." `
    GEMINI_API_KEY="..."

# Deploy
az webapp up --name trinity-api
```

**Cost:** ~$55/mo (B1 tier) + $20/mo (database) = $75/mo

### AWS ECS (Elastic Container Service)

Use AWS Copilot for easy deployment:
```powershell
# Install Copilot
# https://aws.github.com/copilot-cli/

# Initialize
copilot init

# Deploy
copilot deploy
```

---

## Maintenance

### Daily Tasks
- Check health endpoints
- Review error logs
- Monitor disk space

### Weekly Tasks
- Review user registrations
- Check database backup integrity
- Update dependencies if needed

### Monthly Tasks
- Security audit
- Performance review
- Cost optimization

---

## Scaling Beyond 100 Users

When you hit these limits:
- Response time > 2 seconds
- CPU usage > 80%
- 100+ concurrent users

Consider:
1. **Horizontal scaling** - Multiple API instances with load balancer
2. **Redis caching** - Reduce database load
3. **CDN** - Offload static assets
4. **Managed services** - AWS ECS, Azure App Service with auto-scaling
5. **Database optimization** - Connection pooling, read replicas

---

## Troubleshooting

### "Authentication required" errors
- Check JWT_SECRET_KEY is set
- Verify DISABLE_AUTH=false
- Ensure token is valid and not expired

### Database connection failed
- Verify DATABASE_URL is correct
- Check PostgreSQL is running: `docker ps`
- Test connection: `docker exec trinity-postgres psql -U trinity -d trinity -c "SELECT 1;"`

### "Module not found" errors
- Reinstall dependencies: `pip install -r requirements.txt`
- Check Python version: `python --version` (need 3.11+)

### Port already in use
- Change port: `.\start-local.ps1 -Port 8091`
- Or kill process: `Stop-Process -Name python -Force`

---

## Support & Resources

- **Documentation:** `/api/docs` when server is running
- **Health Check:** `GET /health/ai`
- **Logs:** `trinity_requests.log`, `trinity_telemetry.log`
- **Database:** Direct queries with `docker exec -it trinity-postgres psql -U trinity`

---

## Success Criteria

Your deployment is successful when:
- ✅ Can register and login users
- ✅ API keys work for authentication
- ✅ Can upload documents and get AI summaries
- ✅ Chat functionality works
- ✅ Health checks return 200 OK
- ✅ HTTPS is enabled
- ✅ Backups are automated
- ✅ Monitoring is active

**Congratulations! Trinity AI is now in production! 🎉**
