"""Configuration and sys.path setup for root integration and adversarial tests."""

import os
import sys

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
WORKER_DIR = os.path.join(BASE_DIR, "worker")
for p in [BASE_DIR, WORKER_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)
