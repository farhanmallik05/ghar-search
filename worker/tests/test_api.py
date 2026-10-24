"""API endpoint integration tests using FastAPI TestClient."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check_endpoint():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "Ghar Search" in data["service"]

def test_fixtures_endpoint():
    res = client.get("/api/v1/fixtures")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert len(data["fixtures"]) == 3
    keys = [f["key"] for f in data["fixtures"]]
    assert "clean" in keys
    assert "delayed" in keys
    assert "flagged" in keys

def test_verify_and_retrieve_report_flow():
    # 1. Trigger verification
    post_res = client.post("/api/v1/verify", json={
        "manual_details": {
            "project_name": "Sunshine Residency Baner",
            "rera_number": "P52100012345",
            "state": "Maharashtra",
            "city": "Pune"
        }
    })
    assert post_res.status_code == 202
    res_data = post_res.json()
    assert "report_id" in res_data
    report_id = res_data["report_id"]

    # 2. Retrieve report
    get_res = client.get(f"/api/v1/report/{report_id}")
    assert get_res.status_code == 200
    report_data = get_res.json()
    assert report_data["report_id"] == report_id
    assert report_data["status"] in ["queued", "running", "completed"]

def test_watchlist_endpoints():
    # 1. Trigger report to get an id
    post_res = client.post("/api/v1/verify", json={
        "manual_details": {
            "project_name": "Sunshine Residency Baner",
            "rera_number": "P52100012345"
        }
    })
    report_id = post_res.json()["report_id"]

    # 2. Add to watchlist
    wl_post = client.post("/api/v1/watchlist", json={
        "report_id": report_id,
        "alert_threshold": 10,
        "notify_email": True
    })
    assert wl_post.status_code == 201
    assert "watchlist_id" in wl_post.json()

    # 3. List watchlist
    wl_get = client.get("/api/v1/watchlist")
    assert wl_get.status_code == 200
    assert wl_get.json()["total"] >= 1

def test_hitl_resolve_endpoint():
    post_res = client.post("/api/v1/hil/resolve", json={
        "report_id": "rpt_demo_test",
        "check_type": "rera_status",
        "resolution_data": {"captcha_token": "token_12345"}
    })
    assert post_res.status_code == 200
    assert post_res.json()["status"] == "resumed"

def test_pdf_report_export():
    # Verify PDF download for pre-seeded fixture report
    res = client.get("/api/v1/report/rpt_sunshine_clean/pdf")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in res.headers["content-disposition"]
    # PDF files start with %PDF header
    assert res.content.startswith(b"%PDF")
    assert len(res.content) > 1000

def test_verify_empty_payload_validation():
    # Neither listing_url nor manual_details provided
    res = client.post("/api/v1/verify", json={})
    assert res.status_code == 400
    assert "Either a valid property_url or manual_details" in res.json()["detail"]

def test_nonexistent_report_404():
    res = client.get("/api/v1/report/rpt_does_not_exist_999")
    assert res.status_code == 404

