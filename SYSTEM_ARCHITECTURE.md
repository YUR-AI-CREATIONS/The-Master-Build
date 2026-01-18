# Trinity AI - Complete System Architecture

## System Hierarchy Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     TRINITY AI PLATFORM                          │
│                  Multi-Modal AI Orchestration                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├── Level 1: Entry Points
                              ├── Level 2: Core Orchestration
                              ├── Level 3: API & Routing
                              ├── Level 4: Middleware & Processing
                              ├── Level 5: AI Engine Integration
                              ├── Level 6: Storage & Persistence
                              └── Level 7: Monitoring & Observability
```

---

## Level 1: Entry Points (User Interface Layer)

### 1.1 Web Interface
**File**: `index.html`
- **Purpose**: Single-page frontend application
- **Functions**:
  - Project selection and management
  - File upload interface
  - Real-time chat interface
  - Document summary viewer
  - Memory/history browser
- **Dependencies**: FastAPI static file server
- **Communication**: REST API + WebSocket

### 1.2 CLI Entry Point
**File**: `trinity_mothership.py`
- **Purpose**: Command-line orchestrator and launcher
- **Functions**:
  - `--register`: Register Gemini handlers
  - `--run-smoke`: Execute smoke tests
  - `--start-api [port]`: Launch FastAPI server
- **Dispatches to**: `trinity_orchestrator_unified.py`
- **Handler Registry**: Routes to specialized Gemini functions

### 1.3 PowerShell Scripts
**Files**: `start-local.ps1`, `TrinityGen.ps1`
- **Purpose**: Windows automation and quick start
- **Functions**:
  - Server startup with port configuration
  - Environment variable management
  - Process management

---

## Level 2: Core Orchestration (Intelligence Layer)

### 2.1 Unified Orchestrator
**File**: `trinity_orchestrator_unified.py`

#### Master Function: `trinity_engine(prompt, max_tokens, log_file)`
**Hierarchy**:
```
trinity_engine()
├── classify_prompt() → Determines engine selection
├── _make_clients() → Creates API clients lazily
├── Engine Execution Chain:
│   ├── run_gemini() [Primary for: image, video, render, visualize]
│   ├── run_openai() [Primary for: analyze, summarize, calculate, data]
│   └── run_anthropic() [Primary for: philosophy, ethics, law, meaning]
└── Telemetry Recording:
    ├── record_request()
    ├── record_success() / record_failure()
    └── Log to trinity_log.json
```

#### Components:
- **Prompt Classifier**: Keyword-based routing logic
- **Client Factory**: Lazy initialization of SDK clients
- **Failover Logic**: Cascading engine attempts
- **Handler Registry**: Plugin system for specialized handlers

### 2.2 Gemini Master Controller
**File**: `gemini_master.py`

```
gemini_master (Specialized Gemini Operations)
├── generate_text() → Gemini 2.5 Pro text generation
├── generate_image() → Imagen 3 image synthesis
├── generate_video() → Veo 2 video generation
├── generate_audio() → Text-to-speech with GCP
└── generate_embedding() → Text embedding vectors
```

### 2.3 Configuration Manager
**File**: `config.py`

```
TrinityConfig
├── load_env_vars()
│   ├── GEMINI_API_KEY
│   ├── OPENAI_API_KEY
│   └── ANTHROPIC_API_KEY
├── validate_keys()
├── missing_keys() → Reports unavailable engines
└── Singleton Pattern → Single config instance
```

---

## Level 3: API & Routing Layer

### 3.1 Main FastAPI Application
**File**: `app.py`

```
FastAPI Application
├── Initialization
│   ├── Title: "Trinity Intelligence Console"
│   ├── Version: 1.0.0
│   ├── Docs: /api/docs (Swagger)
│   └── ReDoc: /api/redoc
│
├── Router Mounting
│   ├── v1_router → /api/v1/*
│   └── ops_router → /ops/*
│
├── Middleware Stack (Execution Order: Last Added → First Executed)
│   ├── SecurityHeadersMiddleware
│   ├── RequestLoggingMiddleware
│   ├── CORSMiddleware
│   └── RateLimiterMiddleware (selective paths)
│
├── Exception Handlers
│   ├── RequestValidationError → 422 responses
│   ├── HTTPException → Structured errors
│   └── General Exception → 500 responses
│
├── Lifecycle Events
│   ├── startup → Redis connection
│   └── shutdown → Redis disconnection
│
└── Core Endpoints (Non-Router)
    ├── Health: /health/live, /health/ready, /health/ai
    ├── Metrics: /metrics (Prometheus)
    ├── Projects: /projects, /create_project, /project_data
    ├── Files: /upload, /delete_file, /view_summary, /reanalyze
    ├── Chat: /chat/{project}
    ├── WebSocket: /ws/chat/{project}/{client_id}
    ├── Operations: /scan_project, /save_snapshot
    └── Static: / (serves index.html)
```

### 3.2 v1 API Router
**File**: `routers/v1.py`

```
v1_router (/api/v1/*)
│
├── Health
│   └── GET /ping → API health check
│
├── Admin Operations (Tag: "admin")
│   ├── GET /admin/stats → System metrics (CPU, memory, disk)
│   ├── GET /admin/logs/requests → HTTP request logs
│   ├── GET /admin/logs/telemetry → AI engine logs
│   └── DELETE /admin/projects/{project} → Project deletion
│
└── Task Management (Tag: "tasks")
    ├── POST /tasks/{project}/scan → Start background scan
    └── GET /tasks/{task_id} → Task status polling
```

### 3.3 Ops Router (Legacy Compatibility)
**File**: `app.py` (inline router)

```
ops_router (/ops/*)
│
├── GET /stats → System statistics (full)
├── GET /stats3 → Simple probe
├── GET /logs/requests → Request logs
├── GET /logs/telemetry → Telemetry logs
├── DELETE /projects/{project} → Project deletion
├── POST /delete_project2 → Alternate delete
├── POST /tasks/{project}/scan → Background scan
└── GET /tasks/{task_id} → Task status
```

---

## Level 4: Middleware & Processing Layer

### 4.1 Security Middleware
**File**: `middleware/security.py`

```
SecurityHeadersMiddleware
│
└── Response Headers Applied
    ├── X-Content-Type-Options: nosniff
    ├── X-Frame-Options: DENY
    ├── X-XSS-Protection: 1; mode=block
    ├── Strict-Transport-Security: max-age=31536000
    ├── Referrer-Policy: strict-origin-when-cross-origin
    ├── Permissions-Policy: geolocation=(), microphone=(), camera=()
    └── Content-Security-Policy: [Restrictive policy]
```

### 4.2 Request Logging Middleware
**File**: `middleware/logging.py`

```
RequestLoggingMiddleware
│
├── Request Processing
│   ├── Generate UUID request_id
│   ├── Store in request.state
│   ├── Timestamp start_time
│   └── Extract metadata (method, path, client IP, user-agent)
│
├── Response Processing
│   ├── Calculate duration_ms
│   ├── Add X-Request-ID header
│   └── Log status code
│
└── Output
    └── Append to trinity_requests.log (JSONL format)
```

### 4.3 Error Handling Middleware
**File**: `middleware/errors.py`

```
Exception Handlers
│
├── validation_exception_handler
│   ├── Input: RequestValidationError
│   ├── Status: 422 Unprocessable Entity
│   └── Response: Detailed validation errors + request_id
│
├── http_exception_handler
│   ├── Input: StarletteHTTPException
│   ├── Status: [From exception]
│   └── Response: Error message + status_code + request_id
│
└── general_exception_handler
    ├── Input: Any Exception
    ├── Status: 500 Internal Server Error
    └── Response: Generic error + request_id
```

### 4.4 File Validation Middleware
**File**: `middleware/validation.py`

```
File Validation System
│
├── Constants
│   ├── MAX_FILE_SIZE = 50 MB
│   ├── MAX_FILES_PER_REQUEST = 10
│   └── ALLOWED_EXTENSIONS = [.pdf, .docx, .txt, .csv, .json, .png, .jpg, .xlsx, etc.]
│
├── validate_files(files: List[UploadFile])
│   ├── Check file count ≤ 10
│   ├── Check each extension in whitelist
│   └── Raise 400 if violations
│
├── check_file_size(file: UploadFile)
│   ├── Read file content
│   ├── Check size ≤ 50 MB
│   └── Reset stream position
│
└── validate_file(file: UploadFile)
    ├── Check extension
    ├── Check MIME type
    └── Combined validation
```

### 4.5 Background Task Queue
**File**: `middleware/tasks.py`

```
BackgroundTaskQueue
│
├── Task Storage
│   ├── _tasks: Dict[task_id, task_metadata]
│   └── Task Metadata:
│       ├── status: pending | running | completed | failed
│       ├── created_at, started_at, completed_at
│       ├── func: Callable
│       ├── args: Any
│       └── result: Any | error: str
│
├── Methods
│   ├── add_task(task_id, func, *args)
│   ├── execute_task(task_id) → Async execution wrapper
│   ├── get_task_status(task_id) → Status response
│   └── _log_event(task_id, event_type) → Background task log
│
└── Logging
    └── trinity_background_tasks.log (JSONL)
```

### 4.6 WebSocket Manager
**File**: `middleware/websocket.py`

```
ConnectionManager
│
├── Connection Storage
│   └── active_connections: Dict[client_id, WebSocket]
│
├── Connection Lifecycle
│   ├── connect(websocket, client_id) → Accept & store
│   └── disconnect(client_id) → Remove from pool
│
└── Messaging
    ├── send_message(data, client_id) → Send JSON
    ├── send_stream_chunk(chunk, client_id) → Streaming response
    ├── send_complete(client_id) → End-of-stream marker
    └── send_error(error, client_id) → Error notification
```

### 4.7 Redis Client
**File**: `middleware/redis_client.py`

```
RedisClient (Optional Distributed Storage)
│
├── Initialization
│   ├── Check redis package availability
│   ├── Read REDIS_URL from environment
│   └── Default: redis://localhost:6379/0
│
├── Connection Management
│   ├── connect() → Async connection with 2s timeout
│   ├── ping() → Test connection
│   ├── disconnect() → Graceful shutdown
│   └── Graceful Fallback: If unavailable, enabled=False
│
├── Operations
│   ├── get(key) → Retrieve value
│   ├── set(key, value, ex) → Store with expiration
│   ├── incr(key) → Increment counter
│   ├── expire(key, seconds) → Set TTL
│   └── delete(key) → Remove key
│
└── Use Cases
    ├── Distributed rate limiting
    ├── Response caching (future)
    └── Session storage (future)
```

### 4.8 Rate Limiting Middleware
**File**: `app.py` (inline)

```
RateLimiterMiddleware
│
├── Configuration
│   ├── limit: 60 requests
│   ├── window: 60 seconds
│   └── include_paths: [/chat/, /upload/, /reanalyze/, /scan_project/]
│
├── Storage (In-Memory)
│   └── _hits: Dict[(ip, path), List[timestamps]]
│
├── Algorithm
│   ├── Extract client IP + path
│   ├── Filter timestamps > (now - window)
│   ├── Count requests in window
│   ├── If ≥ limit: Return 429 with Retry-After
│   └── Else: Add timestamp & proceed
│
└── Enhancement: With Redis
    └── Distributed rate limiting across instances
```

---

## Level 5: AI Engine Integration

### 5.1 Engine Routing Logic
**Location**: `trinity_orchestrator_unified.py`

```
AI Engine Selection Matrix
│
├── Gemini (Google Generative AI)
│   ├── Primary for: image, video, render, design, visualize, scene, photo
│   ├── Model: gemini-2.5-pro
│   ├── Features: Multimodal (text, image, video)
│   ├── Specialized Handlers:
│   │   ├── Imagen 3 for images
│   │   ├── Veo 2 for videos
│   │   ├── Text embeddings
│   │   └── Audio TTS
│   └── Fallback: If key missing, skip
│
├── OpenAI (GPT Models)
│   ├── Primary for: analyze, summarize, compare, calculate, data
│   ├── Model: gpt-4o-mini
│   ├── Features: Fast, cost-effective text processing
│   └── Fallback: If key missing, skip
│
└── Anthropic (Claude)
    ├── Primary for: philosophy, ethics, meaning, law, spiritual, reasoning
    ├── Model: claude-sonnet-4-5-20250929
    ├── Features: Long context, nuanced reasoning
    └── Fallback: If key missing, skip
```

### 5.2 Client Initialization
**Pattern**: Lazy Loading

```
Client Factory (_make_clients)
│
├── Environment Check
│   ├── Read config.get_config() or os.getenv()
│   └── Report missing keys
│
├── Client Creation (Only if SDK + Key Available)
│   ├── genai.Client(api_key=gemini_key)
│   ├── OpenAI(api_key=openai_key)
│   └── anthropic.Anthropic(api_key=anthropic_key)
│
└── Return: Dict[engine_name, client_instance]
```

### 5.3 Execution Flow
```
Prompt → classify_prompt() → Determine primary engine
         ↓
    Ordered Engine List: [primary, ...others]
         ↓
    For each engine:
         ├── Try execution
         ├── If success → Log & return
         └── If failure → Log & try next
         ↓
    All failed? → Raise RuntimeError
```

---

## Level 6: Storage & Persistence Layer

### 6.1 File System Structure
```
C:\TrinityAI\
│
├── uploads/ (BASE_DIR)
│   └── {project_name}/
│       ├── config.json
│       │   └── { "identity": "You are Trinity..." }
│       │
│       ├── memory.json
│       │   └── [ {"time": "...", "actor": "...", "text": "..."}, ... ]
│       │
│       ├── documents/
│       │   ├── uploaded_file1.pdf
│       │   ├── uploaded_file2.docx
│       │   └── ...
│       │
│       └── snapshots/
│           └── YYYY-MM-DD.json
│               └── { "timestamp": "...", "config": {...}, "memory": [...] }
│
├── Logs
│   ├── trinity_log.json → Request/response history (append-only)
│   ├── trinity_telemetry.log → AI engine calls (JSONL)
│   ├── trinity_requests.log → HTTP requests (JSONL)
│   └── trinity_background_tasks.log → Background task events (JSONL)
│
└── Configuration
    ├── .env → Environment variables
    └── requirements.txt → Python dependencies
```

### 6.2 Project Management Functions
**Location**: `app.py`

```
Project Management
│
├── ensure_project(name: str) → Path
│   ├── Create BASE_DIR/name/
│   ├── Create documents/ subdirectory
│   ├── Create snapshots/ subdirectory
│   ├── Initialize config.json with default identity
│   ├── Initialize memory.json as empty array
│   └── Return project path
│
├── load_json(path: Path, default: Any) → Any
│   ├── Try: Read and parse JSON
│   └── Except: Return default value
│
└── save_json(path: Path, data: Any)
    └── Write JSON with indent=2, ensure_ascii=False
```

### 6.3 Document Processing
**Location**: `app.py`

```
Text Extraction Pipeline
│
├── extract_text(path: Path) → str
│   │
│   ├── Plain Text (.txt, .csv, .json)
│   │   └── Read directly, limit 25,000 chars
│   │
│   ├── PDF (.pdf)
│   │   ├── Try: PyPDF2 text extraction
│   │   ├── Fallback: PyMuPDF + Tesseract OCR
│   │   └── Limit: First 20 pages, 25,000 chars
│   │
│   ├── Word Documents (.docx, .doc)
│   │   ├── python-docx library
│   │   └── Extract paragraph text, limit 25,000 chars
│   │
│   ├── Images (.png, .jpg, .jpeg, .bmp, .gif)
│   │   ├── Tesseract OCR
│   │   └── Fallback: Image metadata (format, size)
│   │
│   ├── Excel (.xlsx)
│   │   ├── openpyxl library
│   │   └── First 2 rows of each sheet, limit 25,000 chars
│   │
│   └── Binary Files (.mp3, .wav, .mp4, .mov, .avi, .zip)
│       └── Return metadata: filename, size in MB
│
└── Error Handling
    └── Catch all exceptions, return error message
```

---

## Level 7: Monitoring & Observability

### 7.1 Telemetry System
**File**: `telemetry.py`

```
Telemetry Recording
│
├── Constants
│   └── LOG_PATH = "trinity_telemetry.log"
│
├── Counters (Prometheus)
│   ├── ai_requests_total{engine, status}
│   └── ai_request_duration_seconds{engine}
│
├── Functions
│   ├── record_request(prompt)
│   │   └── Increment total counter
│   │
│   ├── record_success(engine, latency)
│   │   ├── Increment success counter
│   │   ├── Record duration histogram
│   │   └── Append to telemetry log
│   │
│   └── record_failure(engine, error)
│       ├── Increment failure counter
│       └── Append to telemetry log
│
└── Log Format (JSONL)
    └── {"timestamp": "...", "engine": "...", "status": "...", "latency": ..., "error": "..."}
```

### 7.2 Metrics Endpoint
**Location**: `app.py` - `/metrics`

```
Prometheus Metrics Exporter
│
├── Metrics Collected
│   ├── HTTP Requests (via prometheus_client auto-instrumentation)
│   ├── AI Engine Requests (ai_requests_total)
│   ├── AI Request Duration (ai_request_duration_seconds)
│   └── Custom application metrics (if added)
│
├── Output Format
│   └── Prometheus text exposition format
│
└── Consumption
    ├── Prometheus scraping
    └── Grafana dashboards
```

### 7.3 Health Check System
**Location**: `app.py`

```
Health Endpoints
│
├── GET /health/live (Kubernetes Liveness)
│   ├── Purpose: Is process alive?
│   ├── Response: {"status": "ok"}
│   └── Status: Always 200 (unless server down)
│
├── GET /health/ready (Kubernetes Readiness)
│   ├── Purpose: Can handle requests?
│   ├── Checks: File system (uploads directory accessible)
│   ├── Response: {"status": "ready"} | {"status": "degraded", "error": "..."}
│   └── Status: 200 if ready, 200 with degraded status if issues
│
└── GET /health/ai (Engine Availability)
    ├── Purpose: Which AI engines are configured?
    ├── Checks: API key presence for each engine
    ├── Response: {"engines": {"gemini": bool, "openai": bool, "anthropic": bool}, "missing": [...]}
    └── Status: Always 200, reports availability
```

### 7.4 Logging Architecture
```
Multi-Tier Logging System
│
├── HTTP Request Logs (trinity_requests.log)
│   ├── Format: JSONL
│   ├── Fields: request_id, method, path, query, client, user_agent, status, duration_ms, timestamp
│   ├── Source: RequestLoggingMiddleware
│   └── Use: Request tracing, performance analysis, audit trail
│
├── AI Engine Telemetry (trinity_telemetry.log)
│   ├── Format: JSONL
│   ├── Fields: timestamp, engine, status, latency, prompt, response, error
│   ├── Source: telemetry.py (record_success/record_failure)
│   └── Use: AI performance monitoring, failover analysis, cost tracking
│
├── Background Task Logs (trinity_background_tasks.log)
│   ├── Format: JSONL
│   ├── Fields: timestamp, task_id, event, status, duration
│   ├── Source: BackgroundTaskQueue._log_event
│   └── Use: Async operation tracking, task debugging
│
└── Legacy Request/Response Log (trinity_log.json)
    ├── Format: JSON array (append-only)
    ├── Fields: prompt, results, timestamp
    ├── Source: trinity_orchestrator_unified.trinity_engine
    └── Use: Historical query archive, response caching (future)
```

---

## Data Flow Examples

### Example 1: User Uploads Document
```
1. User selects file in index.html
   ↓
2. POST /upload/{project} with multipart/form-data
   ↓
3. Middleware Stack:
   SecurityHeaders → RequestLogging → CORS → RateLimiter
   ↓
4. Validation:
   validate_files() → check_file_size() → Ensure within limits
   ↓
5. File Storage:
   Save to uploads/{project}/documents/{filename}
   ↓
6. Text Extraction:
   extract_text() → Parse based on extension
   ↓
7. AI Summarization:
   trinity(prompt) → classify_prompt() → route to engine
   ↓
8. Engine Execution:
   Try Gemini → If fail, try OpenAI → If fail, try Anthropic
   ↓
9. Response Storage:
   Append summary to uploads/{project}/memory.json
   ↓
10. Response Logging:
    - trinity_requests.log (HTTP details)
    - trinity_telemetry.log (AI call details)
    - trinity_log.json (full request/response)
   ↓
11. Return JSON:
    {"results": [{"filename": "...", "summary": "..."}]}
```

### Example 2: Real-Time Chat via WebSocket
```
1. User opens WebSocket connection
   ws://localhost:8092/ws/chat/{project}/{client_id}
   ↓
2. ConnectionManager.connect()
   Store WebSocket in active_connections dict
   ↓
3. Client sends message:
   {"prompt": "Analyze documents", "system": "You are Trinity"}
   ↓
4. Server receives via websocket.receive_json()
   ↓
5. Load Project Context:
   - config.json (identity)
   - memory.json (last 10 messages)
   ↓
6. Build Full Prompt:
   identity + context + user prompt
   ↓
7. AI Processing:
   trinity(full_prompt) → Engine selection → Response generation
   ↓
8. Streaming Response:
   For each 50-char chunk:
      ws_manager.send_stream_chunk(chunk, client_id)
      await asyncio.sleep(0.05)
   ↓
9. Completion Signal:
   ws_manager.send_complete(client_id)
   ↓
10. Update Memory:
    Append user message and AI response to memory.json
    ↓
11. Disconnect:
    On WebSocketDisconnect → ConnectionManager.disconnect()
```

### Example 3: Background Task Execution
```
1. POST /api/v1/tasks/{project}/scan
   ↓
2. Generate task_id (UUID)
   ↓
3. Create task_queue entry:
   {
     "task_id": "...",
     "status": "pending",
     "created_at": "...",
     "func": scan_project_sync,
     "args": [project]
   }
   ↓
4. Add to FastAPI BackgroundTasks:
   background_tasks.add_task(task_queue.execute_task, task_id)
   ↓
5. Return immediately:
   {"task_id": "...", "status": "pending", "message": "Scan started"}
   ↓
6. Background Execution (Async):
   ├── Update status: "running"
   ├── Execute scan_project_sync(project)
   │   ├── For each document in project:
   │   │   ├── Extract text
   │   │   └── Call trinity() for summary
   │   └── Collect results
   ├── Update status: "completed"
   └── Store result
   ↓
7. Status Polling:
   GET /api/v1/tasks/{task_id}
   Returns current status + result (if completed)
   ↓
8. Logging:
   All events logged to trinity_background_tasks.log
```

---

## Dependency Hierarchy

### Core Dependencies
```
Python 3.10+ (Runtime)
│
├── FastAPI 1.0.0+ (Web Framework)
│   ├── Starlette (ASGI framework)
│   ├── Pydantic (Data validation)
│   └── Uvicorn (ASGI server)
│
├── AI SDKs
│   ├── google-generativeai (Gemini API)
│   ├── openai (OpenAI API)
│   └── anthropic (Claude API)
│
├── Document Processing
│   ├── PyPDF2 (PDF parsing)
│   ├── python-docx (Word documents)
│   ├── openpyxl (Excel files)
│   ├── Pillow (Image processing)
│   ├── pytesseract (OCR)
│   └── PyMuPDF (fitz - PDF rendering)
│
├── Monitoring
│   ├── prometheus_client (Metrics)
│   └── psutil (System stats)
│
└── Optional
    ├── redis (Distributed caching)
    └── websockets (WebSocket support)
```

### Service Dependencies
```
External Services
│
├── Required for Full Functionality
│   ├── Gemini API (Google Cloud)
│   ├── OpenAI API (OpenAI Platform)
│   └── Anthropic API (Anthropic Platform)
│
├── Optional (Graceful Degradation)
│   └── Redis (localhost:6379 or cloud)
│
└── Monitoring Stack (Optional)
    ├── Prometheus (Metrics collection)
    └── Grafana (Visualization)
```

---

## Scaling & Distribution

### Horizontal Scaling Strategy
```
Load Balancer (Nginx/HAProxy)
│
├── Trinity Instance 1 (Port 8090)
├── Trinity Instance 2 (Port 8091)
└── Trinity Instance N (Port 809X)
     │
     ├── Shared Redis (Distributed rate limiting)
     ├── Shared File Storage (NFS/S3)
     └── Independent Processing (Stateless)
```

### Vertical Scaling Considerations
```
Single Instance Resource Allocation
│
├── CPU
│   ├── Main thread: API request handling
│   ├── Background threads: AsyncIO tasks
│   └── OCR/Document processing: CPU-intensive
│
├── Memory
│   ├── Document caching: ~100MB per large PDF
│   ├── In-memory rate limiting: ~1KB per IP
│   └── WebSocket connections: ~10KB each
│
└── Disk I/O
    ├── Document storage: uploads/
    ├── Log writes: Append-only, async
    └── Snapshot saves: Infrequent
```

---

## Security Architecture

### Defense in Depth
```
Security Layer 1: Network
├── Firewall rules (external)
└── Port restrictions (only 8090/8092 exposed)

Security Layer 2: Transport
├── HTTPS/TLS (via reverse proxy)
└── WebSocket Secure (WSS)

Security Layer 3: Application (Middleware)
├── SecurityHeadersMiddleware (CSP, HSTS, etc.)
├── CORS policy (configurable origins)
├── Rate limiting (60 req/60s per IP)
└── File validation (size, type, extension)

Security Layer 4: Data
├── No sensitive data in logs (PII redaction TODO)
├── Project isolation (separate directories)
└── Environment variable protection (.env not in repo)

Security Layer 5: API Keys
├── External API keys in environment only
├── No hardcoded credentials
└── Key rotation supported (restart required)
```

---

## Testing Hierarchy

### Test Levels
```
Smoke Tests (trinity_mothership.py --run-smoke)
├── Environment validation
├── API key checks
└── Basic engine connectivity

Unit Tests (pytest)
├── Document extraction tests
├── Validation logic tests
└── Helper function tests

Integration Tests (pytest)
├── API endpoint tests
├── Multi-engine failover tests
└── File upload/processing tests

End-to-End Tests (Manual/Postman)
├── Full user workflows
├── WebSocket communication
└── Background task execution

Performance Tests (Future)
├── Load testing (concurrent requests)
├── Stress testing (resource limits)
└── Endurance testing (memory leaks)
```

---

## Failure Modes & Recovery

### Engine Failure Handling
```
Engine Failure Cascade
│
├── Primary Engine Fails
│   ├── Log failure to trinity_telemetry.log
│   ├── Increment failure counter (Prometheus)
│   └── Proceed to next engine
│
├── All Engines Fail
│   ├── Raise RuntimeError("All engines failed")
│   ├── general_exception_handler catches
│   └── Return 500 to client
│
└── Partial API Key Missing
    └── Skip engine, continue with available engines
```

### Storage Failure Handling
```
File System Issues
│
├── uploads/ Directory Unavailable
│   ├── /health/ready returns "degraded"
│   ├── File operations fail gracefully
│   └── Return 500 with error message
│
├── Disk Full
│   ├── File write operations fail
│   ├── Log to stderr (if logging disk full)
│   └── Alert via monitoring (Prometheus alert)
│
└── Corrupted JSON Files
    └── load_json() returns default value, continues
```

### Network Failure Handling
```
External Service Unavailable
│
├── Redis Connection Failure
│   ├── Log: "[Redis] Connection failed: ..."
│   ├── Set enabled=False
│   └── Fall back to in-memory storage
│
├── AI API Timeout
│   ├── SDK handles timeout (default: 60s)
│   ├── Caught as exception
│   └── Try next engine in cascade
│
└── WebSocket Disconnect
    └── ConnectionManager.disconnect() cleans up
```

---

## Monitoring & Alerting

### Key Metrics to Monitor
```
Application Health
├── Request rate (requests/sec)
├── Error rate (4xx, 5xx responses)
├── Response time (p50, p95, p99)
└── Active WebSocket connections

AI Engine Performance
├── Engine-specific request counts
├── Engine-specific failure rates
├── Average latency per engine
└── Failover frequency

System Resources
├── CPU utilization (via /api/v1/admin/stats)
├── Memory usage (via /api/v1/admin/stats)
├── Disk usage (via /api/v1/admin/stats)
└── Open file descriptors

Background Tasks
├── Pending task count
├── Task completion rate
├── Task failure rate
└── Average task duration
```

### Alert Conditions (Recommended)
```
Critical Alerts
├── All AI engines failing (5+ failures in 1 minute)
├── API error rate > 10% (over 5 minutes)
├── Disk usage > 95%
└── Memory usage > 90%

Warning Alerts
├── Single engine failing (3+ failures in 5 minutes)
├── Response time p95 > 5 seconds
├── Background task queue > 100 pending
└── Redis connection lost
```

---

## Configuration Management

### Environment Variables
```
Required (For Engine Availability)
├── GEMINI_API_KEY
├── OPENAI_API_KEY
└── ANTHROPIC_API_KEY

Optional
├── REDIS_URL (default: redis://localhost:6379/0)
└── PORT (default: 8080, override in start command)

Implicit (System)
├── PATH (for Tesseract OCR)
└── TESSDATA_PREFIX (for Tesseract language data)
```

### Runtime Configuration
```
Dynamic Configuration (No Restart)
├── Project-level config.json
│   └── identity: Custom AI persona per project
└── Memory persistence (memory.json)
    └── Automatically updated on each interaction

Static Configuration (Restart Required)
├── API keys (environment variables)
├── Middleware settings (security policies)
├── Rate limiting thresholds
└── File validation rules (size, extensions)
```

---

## Deployment Topology

### Development (Single Machine)
```
Developer Workstation
├── Trinity API (localhost:8092)
├── Redis (optional, localhost:6379)
└── Browser (index.html via static files)
```

### Production (Docker Compose)
```
Docker Host
├── trinity-api container (port 8090)
├── trinity-redis container (port 6379)
├── prometheus container (port 9090)
└── grafana container (port 3000)
     │
     └── Mounted Volumes
         ├── ./uploads → /app/uploads
         ├── ./logs → /app/logs
         └── ./prometheus.yml → /etc/prometheus/prometheus.yml
```

### Production (Kubernetes) - Future
```
Kubernetes Cluster
│
├── Trinity Deployment (3 replicas)
│   ├── Pod 1: trinity-api + sidecar (fluentd)
│   ├── Pod 2: trinity-api + sidecar (fluentd)
│   └── Pod 3: trinity-api + sidecar (fluentd)
│
├── Redis StatefulSet (1 replica, persistent volume)
├── Prometheus Deployment (metrics scraping)
├── Grafana Deployment (dashboards)
│
├── Services
│   ├── trinity-api-service (ClusterIP)
│   ├── redis-service (ClusterIP)
│   └── ingress (external access)
│
└── Persistent Volumes
    ├── uploads-pv (shared, ReadWriteMany)
    └── redis-data-pv (single, ReadWriteOnce)
```

---

## Extension Points

### Adding New AI Engines
```
Steps to Add Engine (e.g., Cohere, Mistral)
│
1. Update trinity_orchestrator_unified.py
   ├── Import SDK
   ├── Add to _make_clients()
   └── Create run_cohere() function
   
2. Update classification logic
   └── Add keywords to classify_prompt()
   
3. Update config.py
   ├── Add COHERE_API_KEY to environment variables
   └── Add to missing_keys() check
   
4. Update telemetry
   └── Add engine name to Prometheus labels
   
5. Test & Deploy
   ├── Add to smoke_test.py
   └── Update documentation
```

### Adding Custom Middleware
```
Steps to Add Middleware (e.g., JWT Auth)
│
1. Create middleware/auth.py
   └── Implement BaseHTTPMiddleware
   
2. Update app.py
   ├── Import middleware
   └── app.add_middleware(JWTAuthMiddleware)
   
3. Add configuration
   └── JWT_SECRET_KEY in environment variables
   
4. Handle exceptions
   └── 401 Unauthorized responses
   
5. Update documentation
   └── Document protected endpoints
```

### Adding New Router
```
Steps to Add Router (e.g., /api/v2)
│
1. Create routers/v2.py
   ├── Define APIRouter(prefix="/api/v2")
   └── Add endpoints with @router decorators
   
2. Update app.py
   ├── from routers.v2 import router as v2_router
   └── app.include_router(v2_router)
   
3. Version endpoints
   └── Use tags=["v2"] for OpenAPI grouping
   
4. Deprecation strategy
   └── Add deprecation warnings to v1 endpoints
```

---

## Master Control Hierarchy Summary

```
                         TRINITY AI MASTER SYSTEM
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              ENTRY POINTS                 ORCHESTRATION
                    │                           │
        ┌───────────┼───────────┐         trinity_engine()
        │           │           │               │
    index.html  CLI Tool   PowerShell      ┌────┴────┐
                                           │         │
                                      classify   route_to
                                                    │
                    ┌───────────────────────────────┼───────────────┐
                    │                               │               │
                 Gemini                         OpenAI         Anthropic
                    │                               │               │
            ┌───────┴───────┐                      │               │
         Text  Image  Video  Audio                Text            Text
                                                     │               │
                                              gpt-4o-mini    claude-sonnet
                                                     
                    ┌────────────────────────────────────────────┐
                    │              API LAYER                     │
                    │                                            │
          ┌─────────┴─────────┐                    ┌────────────┴──────────┐
    FastAPI Core            v1 Router           ops Router (Legacy)
          │                    │                                │
    Health/Chat/Upload    Admin/Tasks                    Compatibility
          
                    ┌────────────────────────────────────────────┐
                    │         MIDDLEWARE STACK                   │
                    │                                            │
      Security → Logging → CORS → Rate Limiting → Error Handling
          │          │                    │              │
       Headers   Request IDs          Redis/Memory   Structured
                 Timing                 Storage       Responses
                 
                    ┌────────────────────────────────────────────┐
                    │       PROCESSING LAYER                     │
                    │                                            │
    ┌───────────────┼────────────┬──────────────┬───────────────┐
    │               │            │              │               │
Validation    Background     WebSocket    Document         Redis
    │             Tasks         Manager     Processing       Client
50MB limit    Task Queue    Connections   Extract Text    Optional
Extensions    Status Track  Streaming     PDF/Word/OCR    Distributed
    
                    ┌────────────────────────────────────────────┐
                    │        STORAGE LAYER                       │
                    │                                            │
          ┌─────────┴─────────┬───────────────┬────────────────┐
    Projects/              Logs/           Snapshots/      Config/
    ├─ config.json        ├─ requests      ├─ YYYY-MM-DD   ├─ .env
    ├─ memory.json        ├─ telemetry     └─ backups      └─ requirements
    └─ documents/         └─ background
    
                    ┌────────────────────────────────────────────┐
                    │      OBSERVABILITY LAYER                   │
                    │                                            │
          ┌─────────┴─────────┬───────────────┬────────────────┐
    Telemetry           Prometheus           Health         Logging
    └─ Engine calls    └─ Metrics           └─ Probes      └─ JSONL
       Success/Fail       Counters              Live/Ready      4 files
       Latency           Histograms            Engine Check
```

---

## Summary of Control Flow

1. **User Input** → Web UI / CLI / API Call
2. **Entry Point** → FastAPI endpoint or CLI command
3. **Middleware** → Security, logging, validation, rate limiting
4. **Routing** → v1 router / ops router / core endpoints
5. **Business Logic** → Project management, file handling, chat processing
6. **AI Orchestration** → trinity_engine() → classify → route → execute
7. **Engine Execution** → Gemini / OpenAI / Anthropic with failover
8. **Response Processing** → Format, log, stream (if WebSocket)
9. **Storage** → Persist to files, update memory, save snapshots
10. **Monitoring** → Log to telemetry, update metrics, health checks
11. **Response** → Return JSON / stream chunks / WebSocket messages

Every component has a defined role, clear hierarchy, and graceful failure handling.
