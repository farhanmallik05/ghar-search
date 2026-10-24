"""Test suite for portfolio risk analytics and bulk CSV export endpoints."""

import pytest
import csv
import io
from fastapi.testclient import TestClient
from main import app, seed_demo_store
from core.supabase import memory_store

client = TestClient(app)

def setup_module(module):
    seed_demo_store()

def test_bulk_analytics_endpoint():
    # 1. Enqueue bulk batch with demo properties
    res = client.post("/api/v1/reports/bulk", json={
        "batch_name": "Axis Bank Home Loan Q4 Batch",
        "properties": [
            {
                "manual_details": {
                    "project_name": "Sunshine Clean Phase 1",
                    "rera_number": "P52100012345",
                    "state": "Maharashtra"
                }
            },
            {
                "manual_details": {
                    "project_name": "Delayed Greens Phase 2",
                    "rera_number": "P52100088888",
                    "state": "Maharashtra"
                }
            }
        ]
    })
    assert res.status_code == 202
    data = res.json()
    batch_id = data["batch_id"]

    # 2. Complete report items in memory_store with synthetic scores for testing analytics
    for r in data["reports"]:
        rep_id = r["report_id"]
        memory_store.reports[rep_id] = {
            "report_id": rep_id,
            "status": "completed",
            "trust_score": 85,
            "trust_label": "High Trust",
            "property_details": {
                "project_name": r["project_name"],
                "promoter_name": "Reputed Builder Ltd",
                "rera_id": "P52100012345",
                "state": "Maharashtra"
            },
            "breakdown": {
                "dimension_scores": {
                    "rera_status": 30,
                    "claim_match": 15,
                    "court_signals": 20,
                    "promoter_record": 10,
                    "approvals": 5,
                    "reputation": 5
                },
                "deductions": [
                    {"rule": "CLAIM_SLIPPAGE", "reason": "Slight milestone deviation"}
                ],
                "risk_category": "CLEAN_STATUTORY"
            }
        }

    # 3. Retrieve analytics
    analytics_res = client.get(f"/api/v1/reports/bulk/{batch_id}/analytics")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()

    assert analytics["batch_id"] == batch_id
    assert analytics["batch_name"] == "Axis Bank Home Loan Q4 Batch"
    assert analytics["total_assets"] == 2
    assert analytics["completed_count"] == 2
    assert analytics["portfolio_mean_score"] == 85.0
    assert analytics["risk_distribution"]["high_trust_count"] == 2
    assert analytics["average_dimension_scores"]["rera_status"] == 30.0
    assert analytics["underwriting_verdict"] == "APPROVED_PORTFOLIO"
    assert len(analytics["common_deductions"]) > 0

def test_bulk_csv_export_endpoint():
    # 1. Enqueue bulk batch
    res = client.post("/api/v1/reports/bulk", json={
        "batch_name": "HDFC Underwriting Portfolio",
        "properties": [
            {
                "manual_details": {
                    "project_name": "Royal Palms Tower",
                    "rera_number": "P52100099999",
                    "state": "Maharashtra"
                }
            }
        ]
    })
    assert res.status_code == 202
    batch_id = res.json()["batch_id"]

    # 2. Export CSV
    csv_res = client.get(f"/api/v1/reports/bulk/{batch_id}/export/csv")
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "attachment" in csv_res.headers["content-disposition"]

    # 3. Verify CSV contents
    content = csv_res.text
    reader = csv.reader(io.StringIO(content))
    rows = list(reader)
    assert len(rows) >= 2  # Header + at least 1 asset
    headers = rows[0]
    assert "Batch ID" in headers
    assert "Trust Score (0-100)" in headers
    assert "Statutory Risk Category" in headers

def test_bulk_analytics_nonexistent_batch_404():
    res = client.get("/api/v1/reports/bulk/batch_nonexistent_999/analytics")
    assert res.status_code == 404

def test_bulk_csv_nonexistent_batch_404():
    res = client.get("/api/v1/reports/bulk/batch_nonexistent_999/export/csv")
    assert res.status_code == 404
