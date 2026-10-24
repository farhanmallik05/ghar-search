"""FastAPI Gateway & Due-Diligence Worker.
HackIIITD 2026 | Ghar Search API Server
"""

import uuid
import asyncio
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from core.config import settings
from core.supabase import memory_store, get_supabase
from intelligence.schemas import (
    PropertyInput,
    VerificationReport,
    WatchlistCreateRequest,
    HITLResolveRequest,
    CheckResult
)
from fixtures.demo_properties import DEMO_PROPERTIES
from graphs.verification_graph import VerificationGraph

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ghar-search.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Agentic Property Due-Diligence API for Indian Homebuyers"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def _on_check_progress(report_id: str, check: CheckResult):
    """Callback triggered whenever a checker status updates."""
    if report_id not in memory_store.report_checks:
        memory_store.report_checks[report_id] = []

    # Update or append
    checks_list = memory_store.report_checks[report_id]
    existing_idx = next((i for i, c in enumerate(checks_list) if c["check_type"] == check.check_type.value), None)
    if existing_idx is not None:
        checks_list[existing_idx] = check.model_dump()
    else:
        checks_list.append(check.model_dump())

    # Update report status to running
    if report_id in memory_store.reports:
        memory_store.reports[report_id]["status"] = "running"
        memory_store.reports[report_id]["checks"] = checks_list

async def _execute_verification(report_id: str, prop_input: PropertyInput):
    """Background task to run the verification graph."""
    try:
        graph = VerificationGraph(progress_callback=_on_check_progress)
        report = await graph.run(report_id, prop_input)
        memory_store.reports[report_id] = report.model_dump()
        logger.info("Report %s successfully completed and persisted.", report_id)
    except Exception as e:
        logger.exception("Failed executing verification for report %s: %s", report_id, e)
        if report_id in memory_store.reports:
            memory_store.reports[report_id]["status"] = "failed"
            memory_store.reports[report_id]["error"] = str(e)

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/api/v1/fixtures", tags=["Fixtures"])
async def get_fixtures():
    """Returns the 3 pre-vetted demo properties for quick 1-click testing."""
    return {
        "status": "success",
        "fixtures": [
            {
                "key": key,
                "title": data["title"],
                "badge": data["badge"],
                "rera_id": data["rera_id"],
                "project_name": data["project_name"],
                "promoter_name": data["promoter_name"],
                "city": data["city"],
                "state": data["state"],
                "address": data["address"],
                "listing_url": data["listing_url"]
            }
            for key, data in DEMO_PROPERTIES.items()
        ]
    }

@app.post("/api/v1/verify", status_code=status.HTTP_202_ACCEPTED, tags=["Verification"])
async def trigger_verification(payload: PropertyInput, background_tasks: BackgroundTasks):
    """Initiates an asynchronous 6-check verification run for a property listing or RERA number."""
    if not payload.property_url and not payload.manual_details:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either property_url or manual_details must be provided."
        )

    report_id = f"rpt_{uuid.uuid4().hex[:8]}"

    # Initialize record in memory store
    memory_store.reports[report_id] = {
        "report_id": report_id,
        "property_id": f"prop_{uuid.uuid4().hex[:8]}",
        "status": "queued",
        "estimated_completion_seconds": 3,
        "realtime_channel": f"report:{report_id}",
        "credits_estimated": 12,
        "checks": [],
        "created_at": None
    }
    memory_store.report_checks[report_id] = []

    # Queue execution
    background_tasks.add_task(_execute_verification, report_id, payload)

    return {
        "report_id": report_id,
        "status": "queued",
        "estimated_completion_seconds": 3,
        "realtime_channel": f"report:{report_id}",
        "credits_estimated": 12
    }

@app.get("/api/v1/report/{report_id}", tags=["Verification"])
async def get_report(report_id: str):
    """Retrieves the full structured verification report and evidence audit trail."""
    report = memory_store.reports.get(report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id '{report_id}' was not found."
        )
    return report

@app.post("/api/v1/watchlist", status_code=status.HTTP_201_CREATED, tags=["Watchlist"])
async def add_to_watchlist(payload: WatchlistCreateRequest):
    """Adds a property report to the user watchlist for nightly re-checks."""
    report = memory_store.reports.get(payload.report_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id '{payload.report_id}' not found."
        )

    watchlist_id = f"wl_{uuid.uuid4().hex[:8]}"
    prop_details = report.get("property_details", {})

    watchlist_item = {
        "watchlist_id": watchlist_id,
        "report_id": payload.report_id,
        "property_name": prop_details.get("project_name", "Monitored Property"),
        "promoter_name": prop_details.get("promoter_name", "Developer"),
        "rera_id": prop_details.get("rera_id", "RERA Pending"),
        "city": prop_details.get("city", "Mumbai"),
        "current_trust_score": report.get("trust_score", 85),
        "alert_threshold": payload.alert_threshold,
        "notify_email": payload.notify_email,
        "status": "active",
        "last_checked_at": "2026-10-24T07:00:00Z",
        "score_delta_7d": 0
    }
    memory_store.watchlist[watchlist_id] = watchlist_item

    return {
        "watchlist_id": watchlist_id,
        "next_check_at": "2026-10-25T02:00:00Z",
        "status": "active"
    }

@app.get("/api/v1/watchlist", tags=["Watchlist"])
async def get_watchlist():
    """Returns all monitored properties in the watchlist."""
    items = list(memory_store.watchlist.values())
    # Pre-populate with sample watchlist items if empty
    if not items:
        items = [
            {
                "watchlist_id": "wl_sunshine_baner",
                "property_name": "Sunshine Residency Phase 1",
                "promoter_name": "Godrej Properties Limited",
                "rera_id": "P52100012345",
                "city": "Pune",
                "current_trust_score": 92,
                "score_delta_7d": 0,
                "status": "active",
                "last_checked_at": "2026-10-24T06:00:00Z",
                "alert_threshold": 10
            },
            {
                "watchlist_id": "wl_green_valley",
                "property_name": "Green Valley Towers Phase 2",
                "promoter_name": "Apex Skyline Developers Pvt Ltd",
                "rera_id": "P52100088765",
                "city": "Pune",
                "current_trust_score": 68,
                "score_delta_7d": -4,
                "status": "active",
                "last_checked_at": "2026-10-24T06:00:00Z",
                "alert_threshold": 10
            }
        ]
    return {
        "items": items,
        "total": len(items)
    }

@app.post("/api/v1/hil/resolve", tags=["Human-in-the-Loop"])
async def resolve_hitl_task(payload: HITLResolveRequest):
    """Resolves a human-in-the-loop challenge (CAPTCHA token or manual confirmation)."""
    task_id = f"hitl_{payload.report_id}_{payload.check_type}"
    memory_store.hitl_tasks[task_id] = {
        "report_id": payload.report_id,
        "check_type": payload.check_type,
        "status": "resolved",
        "resolution_data": payload.resolution_data
    }
    return {
        "status": "resumed",
        "report_id": payload.report_id,
        "check_type": payload.check_type
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.WORKER_HOST, port=settings.WORKER_PORT, reload=True)
