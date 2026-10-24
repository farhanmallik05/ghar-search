"""Test suite for Human-In-The-Loop (HIL) telemetry, challenge querying, and timeout fallback."""

import pytest
from fastapi.testclient import TestClient
from main import app, seed_demo_store
from core.supabase import memory_store

client = TestClient(app)

def setup_module(module):
    seed_demo_store()

def test_hil_resolve_telemetry_and_unblock():
    rep_id = "rpt_hil_test_01"
    memory_store.reports[rep_id] = {
        "report_id": rep_id,
        "status": "hitl_required",
        "property_details": {"project_name": "Skyline Heights"}
    }

    res = client.post("/api/v1/hil/resolve", json={
        "report_id": rep_id,
        "check_type": "rera_status",
        "resolution_data": {
            "captcha_token": "cf_token_valid_12345",
            "resolved_by": "qa_auditor_42",
            "notes": "Solved Turnstile challenge manually"
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "resumed"
    assert data["report_id"] == rep_id
    assert "resolved_at" in data

    # Verify memory_store audit trail
    task = memory_store.hitl_tasks.get(data["task_id"])
    assert task is not None
    assert task["status"] == "resolved"
    assert task["resolved_by"] == "qa_auditor_42"
    assert "Turnstile" in task["resolution_notes"]

    # Verify report status transitioned from hitl_required to running
    assert memory_store.reports[rep_id]["status"] == "running"

def test_hil_tasks_query_endpoints():
    rep_id = "rpt_hil_query_02"
    # Seed task
    task_id = f"hitl_{rep_id}_court_signals"
    memory_store.hitl_tasks[task_id] = {
        "task_id": task_id,
        "report_id": rep_id,
        "check_type": "court_signals",
        "status": "pending",
        "resolution_data": {}
    }

    # Query for specific report
    res_single = client.get(f"/api/v1/hil/tasks/{rep_id}")
    assert res_single.status_code == 200
    data_single = res_single.json()
    assert data_single["report_id"] == rep_id
    assert data_single["total"] >= 1
    assert any(t["task_id"] == task_id for t in data_single["tasks"])

    # Query all
    res_all = client.get("/api/v1/hil/tasks")
    assert res_all.status_code == 200
    data_all = res_all.json()
    assert data_all["total"] >= 1

def test_hil_timeout_fallback_handler():
    rep_id = "rpt_hil_timeout_03"
    memory_store.reports[rep_id] = {
        "report_id": rep_id,
        "status": "hitl_required",
        "property_details": {"project_name": "Orchid Oasis"}
    }

    res = client.post("/api/v1/hil/timeout", json={
        "report_id": rep_id,
        "check_type": "approvals",
        "fallback_policy": "conservative_bounds"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "fallback_applied"
    assert data["fallback_policy"] == "conservative_bounds"

    task = memory_store.hitl_tasks.get(data["task_id"])
    assert task["status"] == "timed_out"
    assert task["fallback_policy"] == "conservative_bounds"

    # Report unblocked
    assert memory_store.reports[rep_id]["status"] == "running"
