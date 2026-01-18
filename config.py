"""
Trinity AI Configuration
Centralized configuration management for all system settings
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application Settings
    APP_NAME: str = "Trinity AI Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8090
    HOST: str = "0.0.0.0"
    
    # API Keys - All optional, engines without keys are skipped
    GEMINI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    GOOGLE_GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    XAI_API_KEY: Optional[str] = None
    
    # Database Settings
    DATABASE_URL: Optional[str] = None
    
    # Redis Settings  
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = False
    
    # Security Settings
    JWT_SECRET_KEY: Optional[str] = None
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DISABLE_AUTH: bool = True  # Set to False in production
    
    # CORS Settings
    CORS_ORIGINS: list = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: list = ["*"]
    CORS_ALLOW_HEADERS: list = ["*"]
    
    # File Upload Settings
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS: list = [
        ".pdf", ".docx", ".txt", ".jpg", ".jpeg", ".png",
        ".xlsx", ".csv", ".json"
    ]
    UPLOAD_DIR: str = "uploads"
    
    # AI Engine Settings
    DEFAULT_ENGINE: str = "gemini"
    MAX_TOKENS: int = 4096
    TEMPERATURE: float = 0.7
    ENGINE_TIMEOUT: int = 30  # seconds
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Monitoring
    METRICS_ENABLED: bool = True
    TELEMETRY_ENABLED: bool = True
    LOG_LEVEL: str = "INFO"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get settings instance"""
    return settings


# Helper function to check if running in production
def is_production() -> bool:
    """Check if running in production environment"""
    return settings.ENVIRONMENT.lower() == "production"


# Helper function to get available AI engines
def get_available_engines() -> list:
    """Get list of available AI engines based on API keys"""
    engines = []
    if settings.GEMINI_API_KEY or settings.GOOGLE_API_KEY or settings.GOOGLE_GEMINI_API_KEY:
        engines.append("gemini")
    if settings.OPENAI_API_KEY:
        engines.append("openai")
    if settings.ANTHROPIC_API_KEY:
        engines.append("anthropic")
    if settings.XAI_API_KEY:
        engines.append("grok")
    return engines
