import os
from pydantic_settings import BaseSettings
from pydantic import ConfigDict, model_validator
from typing import Optional, Any

class Settings(BaseSettings):
    model_config = ConfigDict(env_file=[".env", "../.env"], extra="allow")

    @model_validator(mode="before")
    @classmethod
    def resolve_supabase_fallbacks(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if not values.get("SUPABASE_URL"):
                values["SUPABASE_URL"] = values.get("NEXT_PUBLIC_SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL")
            if not values.get("SUPABASE_ANON_KEY"):
                values["SUPABASE_ANON_KEY"] = values.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
        return values

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
    TINYFISH_BASE_URL: str = "https://agent.tinyfish.ai/v1"

    # LLM Providers
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.1-flash-lite"
    OPENAI_API_KEY: Optional[str] = None

    # Shared Secrets
    INTERNAL_SECRET: str = "ghar_search_internal_secure_secret_token_2026"
    CRON_SECRET: str = "ghar_search_pg_cron_nightly_secret_token_2026"

    # Tolerances & Timeouts
    CHECK_TIMEOUT_SECONDS: int = 45
    DEMO_MODE: bool = True

settings = Settings()
