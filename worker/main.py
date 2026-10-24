"""FastAPI Gateway & Due-Diligence Worker.
HackIIITD 2026 | Ghar Search API Server
"""

import uuid
import asyncio
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks, status, Response
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
from intelligence.rule_engine import calculate_trust_score
from intelligence.summarizer import generate_summary
from intelligence.pdf_generator import generate_pdf_dossier

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ghar-search.api")

def seed_demo_store():
    """Pre-seeds memory_store with the 3 canonical demo dossiers and watchlist entries."""
    if "rpt_sunshine_clean" in memory_store.reports:
        return

    now_iso = "2026-10-24T07:00:00Z"
    for key, data in DEMO_PROPERTIES.items():
        rep_id = data.get("report_id", f"rpt_{key}")
        claims = data["claims"]
        checks = [c.model_copy() for c in data["checks"]]
        breakdown = calculate_trust_score(checks, claims)
        for c in checks:
            c.score_contribution = breakdown.dimension_scores.get(c.check_type.value, c.score_contribution)

        summary_payload = generate_summary(data["project_name"], data["rera_id"], breakdown, checks)
        rep = VerificationReport(
            report_id=rep_id,
            property_id=data["id"],
            status="completed",
            property_details={
                "project_name": data["project_name"],
                "promoter_name": data["promoter_name"],
                "rera_id": data["rera_id"],
                "state": data["state"],
                "city": data["city"],
                "address": data["address"],
                "listing_url": data["listing_url"]
            },
            claims=claims,
            trust_score=breakdown.total_score,
            trust_label=breakdown.label,
            breakdown=breakdown,
            summary=summary_payload,
            checks=checks,
            pdf_url=f"/api/v1/report/{rep_id}/pdf",
            credits_consumed=sum(c.credits_used for c in checks),
            created_at=now_iso,
            completed_at=now_iso
        )
        memory_store.reports[rep_id] = rep.model_dump()
        memory_store.report_checks[rep_id] = [c.model_dump() for c in checks]

    # Pre-seed watchlist items with valid report_ids
    memory_store.watchlist["wl_sunshine_baner"] = {
        "watchlist_id": "wl_sunshine_baner",
        "report_id": "rpt_sunshine_clean",
        "property_name": "Sunshine Residency Phase 1",
        "promoter_name": "Godrej Properties Limited",
        "rera_id": "P52100012345",
        "city": "Pune",
        "current_trust_score": 92,
        "score_delta_7d": 0,
        "status": "active",
        "last_checked_at": "2026-10-24T06:00:00Z",
        "alert_threshold": 10
    }
    memory_store.watchlist["wl_green_valley"] = {
        "watchlist_id": "wl_green_valley",
        "report_id": "rpt_green_valley_delayed",
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

# Execute seed on import
seed_demo_store()

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
    has_url = bool(payload.property_url and payload.property_url.strip())
    has_manual = bool(payload.manual_details and (
        (payload.manual_details.project_name and payload.manual_details.project_name.strip()) or
        (payload.manual_details.rera_number and payload.manual_details.rera_number.strip())
    ))
    if not has_url and not has_manual:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either a valid property_url or manual_details (with project_name or rera_number) must be provided."
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
        for key, fixture in DEMO_PROPERTIES.items():
            if report_id == fixture.get("report_id") or report_id == f"rpt_{key}":
                seed_demo_store()
                report = memory_store.reports.get(fixture.get("report_id"))
                break
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id '{report_id}' was not found."
        )
    return report

@app.get("/api/v1/report/{report_id}/pdf", tags=["Verification"])
async def export_report_pdf(report_id: str):
    """Generates and downloads an official regulatory due-diligence PDF dossier."""
    report = memory_store.reports.get(report_id)
    if not report:
        for key, fixture in DEMO_PROPERTIES.items():
            if report_id == fixture.get("report_id") or report_id == f"rpt_{key}":
                seed_demo_store()
                report = memory_store.reports.get(fixture.get("report_id"))
                break
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report with id '{report_id}' was not found."
        )

    # Guard: PDF generation is only valid for completed reports
    rep_status = report.get("status")
    if rep_status in ["queued", "running"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Report '{report_id}' is currently in status '{rep_status}'. Dossier PDF generation is only available once verification has completed."
        )

    try:
        pdf_bytes = generate_pdf_dossier(report)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="GharSearch_{report_id}.pdf"'
            }
        )
    except Exception as e:
        logger.exception("Failed generating PDF dossier for %s: %s", report_id, e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"PDF rendering failed: {str(e)}"
        )

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
    if not memory_store.watchlist:
        seed_demo_store()
    items = list(memory_store.watchlist.values())
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
