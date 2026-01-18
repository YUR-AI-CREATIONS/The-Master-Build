# Trinity AI Operations

## Environment Variables
- `GEMINI_API_KEY` (optional)
- `OPENAI_API_KEY` (optional)
- `ANTHROPIC_API_KEY` (optional)
- `REDIS_URL` (optional) - Default: `redis://localhost:6379/0`

The app starts without keys; engines without keys are skipped and reported by `/health/ai`.

## Run Locally (Windows)
```pwsh
cd C:\TrinityAI
pip install -r requirements.txt
python trinity_mothership.py --run-smoke   # optional validation
./start-local.ps1 -Port 8092
```

Check endpoints:
```pwsh
# Health checks
Invoke-RestMethod http://127.0.0.1:8092/health/ai | ConvertTo-Json -Depth 5
Invoke-RestMethod http://127.0.0.1:8092/api/v1/ping | ConvertTo-Json

# Admin stats
Invoke-RestMethod http://127.0.0.1:8092/api/v1/admin/stats | ConvertTo-Json -Depth 5
Invoke-RestMethod http://127.0.0.1:8092/ops/stats | ConvertTo-Json -Depth 5  # legacy

# Metrics
Invoke-WebRequest http://127.0.0.1:8092/metrics | Select-Object -ExpandProperty Content | Out-String
```

## API Endpoints

### Health & Status
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe  
- `GET /health/ai` - Engine availability
- `GET /api/v1/ping` - v1 API health
- `GET /metrics` - Prometheus metrics

### Admin (v1)
- `GET /api/v1/admin/stats` - System statistics (CPU, memory, disk, projects)
- `GET /api/v1/admin/logs/requests?limit=100` - Request logs
- `GET /api/v1/admin/logs/telemetry?limit=100` - AI engine logs
- `DELETE /api/v1/admin/projects/{project}` - Delete project

### Background Tasks (v1)
- `POST /api/v1/tasks/{project}/scan` - Start background scan
- `GET /api/v1/tasks/{task_id}` - Get task status

### Legacy Endpoints
- `/ops/*` - Alternate admin/task endpoints (backward compatibility)
- `/tasks/*`, `/admin/*` - Deprecated, use `/api/v1/*` instead

## Docker
Build and run with Prometheus + Grafana:
```pwsh
cd C:\TrinityAI
# Export any API keys if desired (PowerShell):
$env:GEMINI_API_KEY = "<key>"
$env:OPENAI_API_KEY = "<key>"
$env:ANTHROPIC_API_KEY = "<key>"

docker compose up --build -d
```

Services:
- Trinity API: http://localhost:8090
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (default admin/admin)
	- Preloaded dashboard: Trinity Overview (folder "Trinity")

## Redis Setup (Optional)

Redis enables distributed rate limiting and caching. The app works without Redis (falls back to in-memory).

### Docker (Recommended)
```pwsh
# Start Redis
docker run -d --name trinity-redis -p 6379:6379 --restart unless-stopped redis:7-alpine

# Configure Trinity to use it
$env:REDIS_URL = "redis://localhost:6379/0"

# Restart Trinity
./start-local.ps1 -Port 8092
```

### Manual Install (Windows)
1. Download Redis for Windows: https://github.com/tporadowski/redis/releases
2. Extract and run `redis-server.exe`
3. Set `$env:REDIS_URL = "redis://localhost:6379/0"`
4. Restart Trinity

### Verify Connection
```pwsh
# Check logs on startup - should see:
# [Redis] Connected to redis://localhost:6379/0

# If Redis is unavailable:
# [Redis] Connection failed: ... Using in-memory storage.
```

## Tests
```pwsh
cd C:\TrinityAI
python -m pytest -q
```

## Logs & Telemetry
- JSONL telemetry: `trinity_telemetry.log`
- Prometheus metrics: `/metrics` (counters and histograms)

## Notes
- Port 8080 may be in use by other projects; this stack defaults to 8090.
- File uploads and snapshots are stored under `uploads/` (mounted as a volume in Docker).
