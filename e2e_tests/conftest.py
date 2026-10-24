"""Pytest configuration and shared fixtures for Ghar Search E2E tests."""

import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure worker package is on sys.path
WORKER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "worker"))
if WORKER_DIR not in sys.path:
    sys.path.insert(0, WORKER_DIR)

from main import app, seed_demo_store
from core.supabase import memory_store

@pytest.fixture(scope="session")
def app_instance():
    """Returns the FastAPI application instance."""
    return app

@pytest.fixture
def client():
    """Provides a fresh FastAPI TestClient instance with demo data pre-seeded."""
    seed_demo_store()
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture
def store():
    """Provides direct reference to memory_store with fresh baseline seeding."""
    seed_demo_store()
    return memory_store
