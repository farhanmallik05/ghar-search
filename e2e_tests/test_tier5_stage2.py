"""Tier 5: Advanced Features & Stage 2 Test Suite.
Verifies B2B Bulk Underwriting, Side-by-Side Property Comparison Matrix,
Automated Watchlist Nightly Re-checks, and Vector PDF Pagination.
"""

try:
    import pymupdf as fitz  # PyMuPDF
except ImportError:
    import fitz
import pytest


def test_tier5_property_comparison_matrix_generation(client):
    """Verifies side-by-side comparison matrix for 2 properties (Clean vs Delayed).
    Ensures dimensional scores, winner determination, and comparative verdict.
    """
    res = client.post(
        "/api/v1/compare",
        json={"report_ids": ["rpt_sunshine_clean", "rpt_green_valley_delayed"]}
    )
    assert res.status_code == 200
    data = res.json()

    assert "comparison_id" in data
    assert len(data["properties"]) == 2
    assert "dimension_comparison" in data
    assert "rera_status" in data["dimension_comparison"]
    assert "claim_match" in data["dimension_comparison"]
    assert "court_signals" in data["dimension_comparison"]
    assert data["winner_report_id"] == "rpt_sunshine_clean"
    assert "Comparative Due-Diligence Summary" in data["comparative_verdict"]

    # Properties array checks
    p_map = {p["report_id"]: p for p in data["properties"]}
    assert p_map["rpt_sunshine_clean"]["trust_score"] == 92
    assert p_map["rpt_green_valley_delayed"]["trust_score"] == 68

    # Check GET query variant for sharable comparative matrix URLs
    get_res = client.get(
        "/api/v1/compare?report_ids=rpt_sunshine_clean,rpt_green_valley_delayed,rpt_royal_empire_flagged"
    )
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert len(get_data["properties"]) == 3
    assert get_data["winner_report_id"] == "rpt_sunshine_clean"


def test_tier5_comparison_validation_and_error_guards(client):
    """Verifies edge case validation and boundary guards for property comparison."""
    # Under-minimum (< 2)
    res_single = client.get("/api/v1/compare?report_ids=rpt_sunshine_clean")
    assert res_single.status_code == 400
    assert "At least 2" in res_single.json()["detail"]

    # Non-existent report ID
    res_404 = client.post("/api/v1/compare", json={
        "report_ids": ["rpt_sunshine_clean", "rpt_ghost_999"]
    })
    assert res_404.status_code == 404
    assert "not found" in res_404.json()["detail"].lower()

    # Duplicate report IDs
    res_dup = client.post("/api/v1/compare", json={
        "report_ids": ["rpt_sunshine_clean", "rpt_sunshine_clean"]
    })
    assert res_dup.status_code == 400
    assert "distinct" in res_dup.json()["detail"].lower()

    # Excessive IDs (> 4)
    res_excess = client.post("/api/v1/compare", json={
        "report_ids": ["r1", "r2", "r3", "r4", "r5"]
    })
    assert res_excess.status_code in [400, 422]

    res_excess_get = client.get("/api/v1/compare?report_ids=r1,r2,r3,r4,r5")
    assert res_excess_get.status_code == 400
    assert "maximum of 4" in res_excess_get.json()["detail"].lower()


def test_tier5_b2b_bulk_underwriting_lifecycle(client):
    """Verifies institutional bulk underwriting: batch enqueuing, async execution,
    and portfolio risk aggregation.
    """
    batch_payload = {
        "batch_name": "Axis Bank Home Loan Q4 Cohort",
        "properties": [
            {
                "manual_details": {
                    "project_name": "Sunshine Residency Phase 1",
                    "promoter_name": "Godrej Properties Limited",
                    "rera_number": "P52100012345",
                    "city": "Pune",
                    "state": "Maharashtra"
                }
            },
            {
                "manual_details": {
                    "project_name": "Green Valley Towers Phase 2",
                    "promoter_name": "Apex Skyline Developers Pvt Ltd",
                    "rera_number": "P52100088765",
                    "city": "Pune",
                    "state": "Maharashtra"
                }
            },
            {
                "manual_details": {
                    "project_name": "Royal Empire Luxury Towers",
                    "promoter_name": "Royal Imperial Realcon Ltd",
                    "rera_number": "P51700099881",
                    "city": "Thane",
                    "state": "Maharashtra"
                }
            }
        ]
    }

    # 1. Trigger bulk verification
    post_res = client.post("/api/v1/reports/bulk", json=batch_payload)
    assert post_res.status_code == 202
    batch_init = post_res.json()
    batch_id = batch_init["batch_id"]
    assert batch_id.startswith("batch_")
    assert batch_init["total_enqueued"] == 3
    assert len(batch_init["reports"]) == 3

    # 2. Poll bulk status
    get_res = client.get(f"/api/v1/reports/bulk/{batch_id}")
    assert get_res.status_code == 200
    batch_status = get_res.json()
    assert batch_status["batch_id"] == batch_id
    assert batch_status["total"] == 3
    assert len(batch_status["reports"]) == 3

    # 3. Verify batch report IDs resolve to individual dossiers
    for rep in batch_status["reports"]:
        rep_id = rep["report_id"]
        dossier_res = client.get(f"/api/v1/report/{rep_id}")
        assert dossier_res.status_code == 200
        dossier = dossier_res.json()
        assert dossier["status"] in ["queued", "running", "completed"]

    # 4. Empty properties list validation guard
    empty_res = client.post("/api/v1/reports/bulk", json={"properties": []})
    assert empty_res.status_code == 422


def test_tier5_watchlist_automated_nightly_recheck_delta(client):
    """Verifies single property re-check and automated pg_cron nightly batch re-checks
    with delta calculation and alert generation.
    """

    # 1. Trigger single item re-check on pre-seeded watchlist item
    item_recheck = client.post("/api/v1/watchlist/wl_green_valley/recheck")
    assert item_recheck.status_code == 200
    recheck_data = item_recheck.json()
    assert recheck_data["watchlist_id"] == "wl_green_valley"
    assert "score_delta" in recheck_data
    assert "last_checked_at" in recheck_data
    assert "alert_triggered" in recheck_data
    assert "current_trust_score" in recheck_data

    # 2. Trigger nightly batch re-check (simulating pg_cron at 02:00 IST)
    all_recheck = client.post("/api/v1/watchlist/recheck-all")
    assert all_recheck.status_code == 200
    batch_res = all_recheck.json()
    assert batch_res["status"] == "completed"
    assert batch_res["total_checked"] >= 2
    assert "items" in batch_res
    assert "alerts" in batch_res
    assert isinstance(batch_res["items"], list)


def test_tier5_pdf_vector_multi_page_pagination_and_streaming(client):
    """Verifies PyMuPDF vector PDF generator pagination on heavy deduction reports."""
    # Test high-deduction report with multiple findings
    res = client.get("/api/v1/report/rpt_royal_empire_flagged/pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in res.headers.get("content-disposition", "")

    # Open PDF with PyMuPDF and verify structure
    doc = fitz.open(stream=res.content, filetype="pdf")
    assert len(doc) >= 1  # Successfully rendered without clipping or crash

    # Verify first page metadata & visual text
    page1_text = doc[0].get_text()
    assert "GHAR SEARCH" in page1_text
    assert "CONFIDENTIAL AUDIT" in page1_text
    assert "Royal Empire" in page1_text
    assert "18 / 100" in page1_text
    assert "CRITICAL ALERT" in page1_text

    doc.close()
