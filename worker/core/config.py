import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")

    PROJECT_NAME: str = "Ghar Search Due-Diligence Worker"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    WORKER_HOST: str = "0.0.0.0"
    WORKER_PORT: int = 8000

    # Supabase (ap-south-1 Mumbai)
    SUPABASE_URL: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None

    # TinyFish Web Agent API
    TINYFISH_API_KEY: Optional[str] = None
    TINYFISH_BASE_URL: str = "https://api.tinyfish.io/v1"

    # LLM Providers
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # Shared Secrets
    INTERNAL_SECRET: str = "ghar_search_internal_secure_secret_token_2026"
    CRON_SECRET: str = "ghar_search_pg_cron_nightly_secret_token_2026"

    # Tolerances & Timeouts
    CHECK_TIMEOUT_SECONDS: int = 45
    DEMO_MODE: bool = True

settings = Settings()
