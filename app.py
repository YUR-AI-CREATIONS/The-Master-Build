"""
Trinity AI - Main FastAPI Application
Multi-Modal AI Orchestration Platform
"""
import os
import time
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import psutil

from config import settings, get_available_engines
from telemetry import record_request, record_success, record_failure

# Import routers (they'll be created next)
try:
    from middleware.security import SecurityHeadersMiddleware
    from middleware.rate_limit import RateLimitMiddleware
except ImportError:
    SecurityHeadersMiddleware = None
    RateLimitMiddleware = None


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown"""
    # Startup
    print(f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"📊 Available AI Engines: {get_available_engines()}")
    print(f"🌍 Environment: {settings.ENVIRONMENT}")
    print(f"🔒 Auth Disabled: {settings.DISABLE_AUTH}")
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    yield
    
    # Shutdown
    print("👋 Shutting down Trinity AI")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Multi-Modal AI Orchestration Platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add custom middleware if available
if SecurityHeadersMiddleware:
    app.add_middleware(SecurityHeadersMiddleware)
if RateLimitMiddleware and settings.RATE_LIMIT_ENABLED:
    app.add_middleware(RateLimitMiddleware)


# Pydantic models
class ChatRequest(BaseModel):
    prompt: str
    system: str = ""
    max_tokens: int = 4096
    temperature: float = 0.7


class ChatResponse(BaseModel):
    text: str
    engine: str
    latency: float
    confidence: float = 1.0


# Health check endpoints
@app.get("/health/live")
async def health_live():
    """Kubernetes liveness probe"""
    return {"status": "alive", "timestamp": time.time()}


@app.get("/health/ready")
async def health_ready():
    """Kubernetes readiness probe"""
    engines = get_available_engines()
    return {
        "status": "ready",
        "engines": engines,
        "engines_count": len(engines),
        "timestamp": time.time()
    }


@app.get("/health/ai")
async def health_ai():
    """AI engines availability check"""
    engines = get_available_engines()
    return {
        "status": "operational",
        "available_engines": engines,
        "gemini": bool(settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY),
        "openai": bool(settings.OPENAI_API_KEY),
        "anthropic": bool(settings.ANTHROPIC_API_KEY),
        "grok": bool(settings.XAI_API_KEY),
    }


# API v1 endpoints
@app.get("/api/v1/ping")
async def api_ping():
    """API health check"""
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "timestamp": time.time()
    }


@app.get("/api/v1/admin/stats")
async def admin_stats():
    """System statistics"""
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    return {
        "cpu_percent": cpu,
        "memory": {
            "total": memory.total,
            "available": memory.available,
            "percent": memory.percent
        },
        "disk": {
            "total": disk.total,
            "used": disk.used,
            "free": disk.free,
            "percent": disk.percent
        },
        "engines": get_available_engines(),
        "timestamp": time.time()
    }


@app.post("/chat/{project}")
async def chat(project: str, request: ChatRequest):
    """
    Chat endpoint - Main AI interaction
    """
    start_time = time.time()
    
    try:
        # Import trinity engine
        from trinity_orchestrator_unified import trinity_engine
        
        # Record request
        record_request(request.prompt[:100])
        
        # Execute AI request
        result = trinity_engine(
            request.prompt,
            max_tokens=request.max_tokens,
            log_file=f"trinity_{project}.log"
        )
        
        # Record success
        latency = time.time() - start_time
        engine = result.get("engine", "unknown")
        record_success(engine, result.get("latency", latency))
        
        return ChatResponse(
            text=result.get("text", "No response"),
            engine=engine,
            latency=result.get("latency", latency),
            confidence=result.get("confidence", 1.0)
        )
        
    except Exception as e:
        record_failure("trinity", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload/{project}")
async def upload_file(project: str, file: UploadFile = File(...)):
    """Upload a file to a project"""
    try:
        # Validate file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file_ext} not allowed"
            )
        
        # Create project directory
        project_dir = os.path.join(settings.UPLOAD_DIR, project)
        os.makedirs(project_dir, exist_ok=True)
        
        # Save file
        file_path = os.path.join(project_dir, file.filename)
        with open(file_path, "wb") as f:
            content = await file.read()
            
            # Check file size
            if len(content) > settings.MAX_UPLOAD_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE} bytes"
                )
            
            f.write(content)
        
        record_success("upload", 0.0)
        
        return {
            "status": "success",
            "filename": file.filename,
            "size": len(content),
            "project": project,
            "path": file_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        record_failure("upload", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/projects")
async def list_projects():
    """List all projects"""
    try:
        if not os.path.exists(settings.UPLOAD_DIR):
            return {"projects": []}
        
        projects = [
            d for d in os.listdir(settings.UPLOAD_DIR)
            if os.path.isdir(os.path.join(settings.UPLOAD_DIR, d))
        ]
        
        return {"projects": projects, "count": len(projects)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/create_project")
async def create_project(name: str = Form(...)):
    """Create a new project"""
    try:
        project_dir = os.path.join(settings.UPLOAD_DIR, name)
        os.makedirs(project_dir, exist_ok=True)
        
        return {
            "status": "success",
            "project": name,
            "path": project_dir
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    # This is a placeholder - integrate with prometheus_client if needed
    return {
        "status": "ok",
        "message": "Metrics endpoint - integrate prometheus_client for full metrics"
    }


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "operational",
        "docs": "/api/docs",
        "health": "/health/ai",
        "engines": get_available_engines()
    }


# Serve frontend if dist directory exists
if os.path.exists("dist"):
    app.mount("/", StaticFiles(directory="dist", html=True), name="frontend")


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Not found"}
    )


@app.exception_handler(500)
async def server_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
