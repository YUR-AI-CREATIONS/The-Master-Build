# Trinity AI Quick Reference

## Server Status
```pwsh
# Current running instance
# Port: 8092
# Process: python uvicorn (check Task Manager or: Get-Process python)
```

## Quick Start Commands

```pwsh
# Start server
cd C:\TrinityAI
python -m uvicorn app:app --host 0.0.0.0 --port 8092

# Or use the script
.\start-local.ps1 -Port 8092

# Stop all Python processes (careful in dev!)
Stop-Process -Name python -Force
```

## Core Endpoints (Working & Tested)

### Health Checks
```pwsh
# Basic liveness
Invoke-RestMethod http://127.0.0.1:8092/health/live

# Engine status
Invoke-RestMethod http://127.0.0.1:8092/health/ai | ConvertTo-Json

# API v1 ping
Invoke-RestMethod http://127.0.0.1:8092/api/v1/ping | ConvertTo-Json
```

### Admin (v1 Router - Recommended)
```pwsh
# System stats (CPU, memory, disk, projects)
Invoke-RestMethod http://127.0.0.1:8092/api/v1/admin/stats | ConvertTo-Json -Depth 5

# Request logs (last 100)
Invoke-RestMethod http://127.0.0.1:8092/api/v1/admin/logs/requests | ConvertTo-Json -Depth 6

# Telemetry logs (AI engine calls)
Invoke-RestMethod http://127.0.0.1:8092/api/v1/admin/logs/telemetry | ConvertTo-Json -Depth 6

# Delete a project
Invoke-RestMethod -Method Delete http://127.0.0.1:8092/api/v1/admin/projects/old-project
```

### Background Tasks (v1 Router - Recommended)
```pwsh
# Start a background scan
$task = Invoke-RestMethod -Method Post http://127.0.0.1:8092/api/v1/tasks/my-project/scan
$task.task_id

# Check task status
Invoke-RestMethod http://127.0.0.1:8092/api/v1/tasks/$($task.task_id) | ConvertTo-Json -Depth 6
```

### Chat
```pwsh
# Send a chat message
$body = @{
    prompt = "Analyze the uploaded documents"
    system = "You are Trinity, an analytical AI."
} | ConvertTo-Json

Invoke-RestMethod -Method Post `
    -Uri http://127.0.0.1:8092/chat/my-project `
    -ContentType 'application/json' `
    -Body $body | ConvertTo-Json
```

### Projects
```pwsh
# List all projects
Invoke-RestMethod http://127.0.0.1:8092/projects | ConvertTo-Json

# Get project data (config, memory, documents)
Invoke-RestMethod http://127.0.0.1:8092/project_data/my-project | ConvertTo-Json -Depth 5

# Create new project
$form = @{ name = 'new-project' }
Invoke-RestMethod -Method Post `
    -Uri http://127.0.0.1:8092/create_project `
    -ContentType 'application/x-www-form-urlencoded' `
    -Body $form
```

### File Upload
```pwsh
# Upload files to a project
$file = Get-Item "C:\path\to\document.pdf"
$form = @{
    files = $file
}
Invoke-RestMethod -Method Post `
    -Uri http://127.0.0.1:8092/upload/my-project `
    -Form $form | ConvertTo-Json
```

## Legacy Endpoints (Backward Compatibility)

```pwsh
# These work but are deprecated - use /api/v1/* instead

# Admin via /ops (working)
Invoke-RestMethod http://127.0.0.1:8092/ops/stats | ConvertTo-Json -Depth 5
Invoke-RestMethod http://127.0.0.1:8092/ops/logs/requests | ConvertTo-Json -Depth 6

# Tasks via /ops (working)
$task = Invoke-RestMethod -Method Post http://127.0.0.1:8092/ops/tasks/my-project/scan
Invoke-RestMethod http://127.0.0.1:8092/ops/tasks/$($task.task_id) | ConvertTo-Json -Depth 6
```

## WebSocket (Real-Time Chat)

```javascript
// Browser JavaScript
const ws = new WebSocket('ws://127.0.0.1:8092/ws/chat/my-project/client123');

ws.onopen = () => {
    ws.send(JSON.stringify({
        prompt: "Hello Trinity!",
        system: "You are Trinity."
    }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Message:', data);
};
```

## Metrics & Monitoring

```pwsh
# Prometheus metrics
Invoke-WebRequest http://127.0.0.1:8092/metrics | Select-Object -ExpandProperty Content

# Access Swagger UI
Start-Process http://127.0.0.1:8092/api/docs

# Access ReDoc
Start-Process http://127.0.0.1:8092/api/redoc
```

## Redis Setup (Optional)

```pwsh
# Start Redis (requires Docker Desktop running)
docker run -d --name trinity-redis -p 6379:6379 --restart unless-stopped redis:7-alpine

# Configure Trinity
$env:REDIS_URL = "redis://localhost:6379/0"

# Restart Trinity
python -m uvicorn app:app --host 0.0.0.0 --port 8092

# Should see on startup:
# [Redis] Connected to redis://localhost:6379/0
```

See `REDIS_SETUP.md` for detailed instructions and manual install options.

## Troubleshooting

### Port Already in Use
```pwsh
# Find process using port 8092
Get-NetTCPConnection -LocalPort 8092 | Select-Object OwningProcess

# Kill it
$pid = (Get-NetTCPConnection -LocalPort 8092).OwningProcess
Stop-Process -Id $pid -Force

# Or kill all Python processes
Stop-Process -Name python -Force
```

### Check Server Logs
```pwsh
# Request logs (JSONL format)
Get-Content C:\TrinityAI\trinity_requests.log -Tail 20 | ConvertFrom-Json | Format-Table

# Telemetry logs (AI engine calls)
Get-Content C:\TrinityAI\trinity_telemetry.log -Tail 20 | ConvertFrom-Json | Format-Table

# Background task logs
Get-Content C:\TrinityAI\trinity_background_tasks.log -Tail 20 | ConvertFrom-Json | Format-Table
```

### Test AI Engines
```pwsh
# Check which engines are available
Invoke-RestMethod http://127.0.0.1:8092/health/ai | ConvertTo-Json

# Expected output:
# {
#   "engines": {
#     "gemini": true,
#     "openai": true,
#     "anthropic": true
#   },
#   "missing": []
# }
```

### Run Tests
```pwsh
cd C:\TrinityAI
python -m pytest -q

# Should see: 6 passed, 1 skipped
```

## Environment Variables

```pwsh
# AI Engine Keys (optional - engines without keys are skipped)
$env:GEMINI_API_KEY = "your-key"
$env:OPENAI_API_KEY = "your-key"
$env:ANTHROPIC_API_KEY = "your-key"

# Redis (optional - falls back to in-memory)
$env:REDIS_URL = "redis://localhost:6379/0"

# Server Port
$env:PORT = "8092"
```

## File Locations

```
C:\TrinityAI\
├── app.py                          # Main FastAPI application
├── routers/
│   └── v1.py                       # v1 API router (admin, tasks)
├── middleware/
│   ├── security.py                 # Security headers
│   ├── logging.py                  # Request logging
│   ├── errors.py                   # Error handlers
│   ├── validation.py               # File validation
│   ├── tasks.py                    # Background task queue
│   ├── websocket.py                # WebSocket manager
│   └── redis_client.py             # Redis client wrapper
├── uploads/                        # Project storage
│   └── {project}/
│       ├── config.json             # Project config
│       ├── memory.json             # Chat history
│       ├── documents/              # Uploaded files
│       └── snapshots/              # Project snapshots
├── trinity_requests.log            # HTTP request logs (JSONL)
├── trinity_telemetry.log           # AI engine logs (JSONL)
└── trinity_background_tasks.log    # Background task logs (JSONL)
```

## Documentation

- `README.md` - Project overview and setup
- `OPERATIONS.md` - Deployment and operations guide
- `ENHANCEMENTS.md` - Production features documentation
- `REDIS_SETUP.md` - Redis installation and configuration
- `SECURITY_CONSOLIDATION.md` - Security audit results
- `QUICKREF.md` - This file

## API Documentation

- Swagger UI: http://127.0.0.1:8092/api/docs
- ReDoc: http://127.0.0.1:8092/api/redoc
- OpenAPI JSON: http://127.0.0.1:8092/openapi.json

## Support

For issues or questions:
1. Check logs in `trinity_*.log` files
2. Review `/health/ai` endpoint for engine status
3. Verify environment variables are set
4. Run smoke tests: `python trinity_mothership.py --run-smoke`
5. Check `OPERATIONS.md` for common scenarios
