import logging
from typing import Optional, Dict, Any
from core.config import settings

logger = logging.getLogger("ghar-search.supabase")

_supabase_client = None

def get_supabase():
    """Returns a Supabase client if configured, otherwise None."""
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        try:
            from supabase import create_client, Client
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            logger.info("Connected to Supabase client at %s", settings.SUPABASE_URL)
            return _supabase_client
        except Exception as e:
            logger.warning("Failed to initialize Supabase client: %s. Using memory store.", e)
            return None
    return None

class InMemoryStore:
    """Thread-safe development store for properties, reports, and checks."""
    def __init__(self):
        self.properties: Dict[str, Dict[str, Any]] = {}
        self.reports: Dict[str, Dict[str, Any]] = {}
        self.report_checks: Dict[str, list] = {}
        self.watchlist: Dict[str, Dict[str, Any]] = {}
        self.hitl_tasks: Dict[str, Dict[str, Any]] = {}

memory_store = InMemoryStore()
