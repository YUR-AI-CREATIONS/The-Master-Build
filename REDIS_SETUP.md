# Redis Setup for Trinity AI

## Overview
Trinity AI supports optional Redis integration for:
- Distributed rate limiting across multiple instances
- Response caching (future enhancement)
- Session storage (future enhancement)

**The app works without Redis** - it falls back to in-memory storage gracefully.

## Quick Start

### Option 1: Docker (Recommended)

**Prerequisites**: Docker Desktop must be running

```pwsh
# Start Redis container
docker run -d `
  --name trinity-redis `
  -p 6379:6379 `
  --restart unless-stopped `
  redis:7-alpine

# Verify it's running
docker ps | Select-String trinity-redis

# Configure Trinity
$env:REDIS_URL = "redis://localhost:6379/0"

# Start Trinity
cd C:\TrinityAI
python -m uvicorn app:app --host 0.0.0.0 --port 8092
```

**Look for this on startup:**
```
[Redis] Connected to redis://localhost:6379/0
🚀 Trinity AI Intelligence Console Started
```

### Option 2: Manual Install (Windows)

If Docker is unavailable:

1. **Download Redis for Windows**
   - https://github.com/tporadowski/redis/releases
   - Get the latest `.zip` (e.g., `Redis-x64-5.0.14.1.zip`)

2. **Extract and run**
   ```pwsh
   # Extract to C:\Redis
   cd C:\Redis
   .\redis-server.exe
   ```

3. **Configure Trinity**
   ```pwsh
   $env:REDIS_URL = "redis://localhost:6379/0"
   cd C:\TrinityAI
   python -m uvicorn app:app --host 0.0.0.0 --port 8092
   ```

### Option 3: Redis Cloud (Production)

For production deployments:

1. Sign up at https://redis.com/try-free/
2. Create a free database (30MB)
3. Get connection string (format: `redis://user:pass@host:port`)
4. Set environment variable:
   ```pwsh
   $env:REDIS_URL = "redis://default:your_password@redis-12345.redis.cloud:12345"
   ```

## Verification

### Check Startup Logs
```pwsh
# Should see Redis connection message
python -m uvicorn app:app --host 0.0.0.0 --port 8092

# Success:
[Redis] Connected to redis://localhost:6379/0

# Fallback (still works):
[Redis] Connection failed: Timeout connecting to server. Using in-memory storage.
```

### Test Redis Connection
```pwsh
# Install redis-py if not already installed
pip install redis

# Quick test
python -c "import redis; r = redis.from_url('redis://localhost:6379/0'); r.ping(); print('Redis OK')"
```

## Usage in Trinity

### Rate Limiting
With Redis enabled, rate limits are enforced across all Trinity instances:
- 60 requests per 60 seconds per IP (default)
- Applied to: `/chat/*`, `/upload/*`, `/reanalyze/*`, `/scan_project/*`

Without Redis, limits are per-process only.

### Future Features
- **Response Caching**: Cache AI responses for identical prompts
- **Session Storage**: Persistent WebSocket sessions
- **Distributed Locks**: Prevent concurrent file processing

## Troubleshooting

### "Connection failed: Timeout connecting to server"
- **Cause**: Redis isn't running or `REDIS_URL` is wrong
- **Fix**: Start Redis (see Quick Start) or unset `REDIS_URL`
- **Impact**: App still works, uses in-memory storage

### "Error 10061: No connection could be made"
- **Cause**: Redis not listening on expected port
- **Fix**: Check Redis is running: `netstat -an | Select-String 6379`

### Docker Desktop Not Running
- **Cause**: Docker daemon not started
- **Fix**: Start Docker Desktop, wait for "Docker Desktop is running"
- **Alternative**: Use manual install (Option 2)

### Port 6379 Already in Use
- **Cause**: Another service using Redis port
- **Fix**: Use alternate port:
  ```pwsh
  docker run -d --name trinity-redis -p 6380:6379 redis:7-alpine
  $env:REDIS_URL = "redis://localhost:6380/0"
  ```

## Configuration Reference

### Environment Variables
```pwsh
# Default (local Docker/manual)
$env:REDIS_URL = "redis://localhost:6379/0"

# With password
$env:REDIS_URL = "redis://:your_password@localhost:6379/0"

# Cloud/remote
$env:REDIS_URL = "redis://user:pass@remote-host:6379/0"

# SSL (Redis Cloud)
$env:REDIS_URL = "rediss://user:pass@remote-host:6380/0"
```

### Redis Client Settings
See `middleware/redis_client.py`:
- Connection timeout: 2 seconds
- Encoding: UTF-8
- Auto-reconnect: Yes
- Graceful degradation: Falls back to in-memory if unavailable

## Monitoring

### Check Redis Status
```pwsh
# Docker
docker logs trinity-redis --tail 50

# Manual install
# Check console where redis-server.exe is running
```

### View Trinity Logs
```pwsh
# Request logs (includes Redis operations)
Get-Content C:\TrinityAI\trinity_requests.log -Tail 20 | ConvertFrom-Json | Format-Table

# Check for Redis errors
Get-Content C:\TrinityAI\trinity_requests.log | Select-String Redis
```

## Best Practices

### Development
- Use Docker Redis with `--restart unless-stopped`
- No password needed for local development
- Single database (db 0) is sufficient

### Production
- Use Redis Cloud or managed Redis service
- Enable SSL (`rediss://`)
- Use strong passwords
- Monitor memory usage
- Set up Redis persistence (RDB or AOF)
- Consider Redis Cluster for high availability

### Docker Compose
For production deployments, add Redis to `docker-compose.yml`:
```yaml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

volumes:
  redis-data:
```

## Performance

### With Redis
- Rate limiting: O(n) where n = requests in window (typically < 60)
- Caching: O(1) lookups
- Supports horizontal scaling

### Without Redis (In-Memory)
- Rate limiting: O(n) per process
- No caching across processes
- Single-server only

## Security

### Local Development
- No password needed (localhost only)
- Bind to 127.0.0.1 (default)

### Production
- Always use passwords: `requirepass your_strong_password`
- Use firewall rules to restrict access
- Enable SSL/TLS for cloud connections
- Rotate passwords regularly
- Monitor failed authentication attempts
