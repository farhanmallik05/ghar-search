try:
    import pymupdf as fitz
except ImportError:
    import fitz
from fastapi.testclient import TestClient
from main import app, seed_demo_store
from core.supabase import memory_store
from intelligence.pdf_generator import generate_pdf_dossier

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

def test_verify_custom_query_dlf_not_sunshine():
    """Verify that querying for 'dlf' immediately yields DLF property details and never defaults to Sunshine Residency."""
    post_res = client.post("/api/v1/verify", json={"property_url": "dlf"})
    assert post_res.status_code == 202
    res_data = post_res.json()
    assert "report_id" in res_data
    assert "property_details" in res_data
    assert res_data["property_details"]["project_name"] == "Dlf"
    assert "Sunshine" not in res_data["property_details"]["project_name"]
    assert "Godrej" not in res_data["property_details"]["promoter_name"]

    # Immediate retrieval of queued/running report must also return DLF details
    report_id = res_data["report_id"]
    get_res = client.get(f"/api/v1/report/{report_id}")
    assert get_res.status_code == 200
    report_data = get_res.json()
    assert "property_details" in report_data
    assert report_data["property_details"]["project_name"] == "Dlf"
    assert "Sunshine" not in report_data["property_details"]["project_name"]

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

def test_pdf_report_export_all_fixtures_pymupdf_structure():
    """Verifies that all 3 canonical fixtures export valid, well-structured binary PDFs verifiable via PyMuPDF."""
    seed_demo_store()
    fixtures = [
        ("rpt_sunshine_clean", "Sunshine Residency", "92 / 100"),
        ("rpt_green_valley_delayed", "Green Valley Towers", "68 / 100"),
        ("rpt_royal_empire_flagged", "Royal Empire Luxury Towers", "18 / 100"),
    ]
    for report_id, expected_title, expected_score_str in fixtures:
        res = client.get(f"/api/v1/report/{report_id}/pdf")
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert res.content.startswith(b"%PDF-")
        assert len(res.content) >= 5000

        # Open and parse binary stream using PyMuPDF (fitz)
        doc = fitz.open(stream=res.content, filetype="pdf")
        assert doc.page_count >= 1

        page = doc[0]
        text = page.get_text()
        assert "GHAR SEARCH" in text
        assert "CONFIDENTIAL AUDIT" in text
        assert expected_title in text
        assert expected_score_str in text
        assert "6-DIMENSION STATUTORY COMPLIANCE BREAKDOWN" in text
        doc.close()

def test_pdf_export_queued_and_running_guard_409():
    """Verifies that requesting PDF export on queued or running reports returns HTTP 409 Conflict."""
    # Test queued status
    memory_store.reports["rpt_test_queued_guard"] = {
        "report_id": "rpt_test_queued_guard",
        "status": "queued",
        "trust_score": None,
        "created_at": None
    }
    res_queued = client.get("/api/v1/report/rpt_test_queued_guard/pdf")
    assert res_queued.status_code == 409
    assert "queued" in res_queued.json()["detail"].lower()

    # Test running status
    memory_store.reports["rpt_test_running_guard"] = {
        "report_id": "rpt_test_running_guard",
        "status": "running",
        "trust_score": None,
        "created_at": None
    }
    res_running = client.get("/api/v1/report/rpt_test_running_guard/pdf")
    assert res_running.status_code == 409
    assert "running" in res_running.json()["detail"].lower()

def test_pdf_generator_none_value_resilience():
    """Directly tests that generate_pdf_dossier survives missing/None fields without TypeError."""
    sparse_data = {
        "report_id": "rpt_sparse_test",
        "trust_score": None,
        "trust_label": None,
        "created_at": None,
        "property_details": None,
        "summary": None,
        "checks": None,
        "breakdown": None
    }
    pdf_bytes = generate_pdf_dossier(sparse_data)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    assert doc.page_count >= 1
    page_text = doc[0].get_text()
    assert "GHAR SEARCH" in page_text
    assert "0 / 100" in page_text
    doc.close()

def test_verify_empty_payload_validation():
    # Neither listing_url nor manual_details provided
    res = client.post("/api/v1/verify", json={})
    assert res.status_code == 400
    assert "Either a valid property_url or manual_details" in res.json()["detail"]

def test_nonexistent_report_404():
    res = client.get("/api/v1/report/rpt_does_not_exist_999")
    assert res.status_code == 404

def test_compare_reports_post():
    seed_demo_store()
    res = client.post("/api/v1/compare", json={
        "report_ids": ["rpt_sunshine_clean", "rpt_green_valley_delayed"]
    })
    assert res.status_code == 200
    data = res.json()
    assert "comparison_id" in data
    assert len(data["properties"]) == 2
    assert "dimension_comparison" in data
    assert "rera_status" in data["dimension_comparison"]
    assert data["winner_report_id"] == "rpt_sunshine_clean"
    assert "Comparative Due-Diligence Summary" in data["comparative_verdict"]

def test_compare_reports_get():
    seed_demo_store()
    res = client.get("/api/v1/compare?report_ids=rpt_sunshine_clean,rpt_royal_empire_flagged")
    assert res.status_code == 200
    data = res.json()
    assert len(data["properties"]) == 2
    assert data["winner_report_id"] == "rpt_sunshine_clean"

def test_compare_insufficient_reports_400():
    res = client.get("/api/v1/compare?report_ids=rpt_sunshine_clean")
    assert res.status_code == 400

def test_compare_missing_report_404():
    res = client.post("/api/v1/compare", json={
        "report_ids": ["rpt_sunshine_clean", "rpt_nonexistent_xyz_999"]
    })
    assert res.status_code == 404

def test_watchlist_recheck_item():
    seed_demo_store()
    res = client.post("/api/v1/watchlist/wl_green_valley/recheck")
    assert res.status_code == 200
    data = res.json()
    assert data["watchlist_id"] == "wl_green_valley"
    assert "last_checked_at" in data
    assert "score_delta" in data

def test_watchlist_recheck_all_batch():
    seed_demo_store()
    res = client.post("/api/v1/watchlist/recheck-all")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completed"
    assert data["total_checked"] >= 2
    assert "items" in data
    assert "alerts" in data

def test_bulk_verify_and_status():
    payload = {
        "batch_name": "Q4 Mortgage Audit",
        "properties": [
            {
                "manual_details": {
                    "project_name": "Asset One Pune",
                    "rera_number": "P52100012345"
                }
            },
            {
                "manual_details": {
                    "project_name": "Asset Two Thane",
                    "rera_number": "P51700099881"
                }
            }
        ]
    }
    res = client.post("/api/v1/reports/bulk", json=payload)
    assert res.status_code == 202
    data = res.json()
    assert "batch_id" in data
    assert data["total_enqueued"] == 2
    batch_id = data["batch_id"]

    # Poll status
    status_res = client.get(f"/api/v1/reports/bulk/{batch_id}")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["batch_id"] == batch_id
    assert status_data["total"] == 2

def test_flat_manual_details_normalization():
    # Sending root-level project_name and rera_number without manual_details wrapper
    res = client.post("/api/v1/verify", json={
        "project_name": "Godrej Elements",
        "rera_number": "P52100019999",
        "state": "Maharashtra"
    })
    assert res.status_code == 202
    data = res.json()
    assert "report_id" in data
    assert data["status"] == "queued"

def test_compare_duplicate_and_excessive_ids_400():
    # Duplicate IDs
    dup_res = client.post("/api/v1/compare", json={
        "report_ids": ["rpt_sunshine_clean", "rpt_sunshine_clean"]
    })
    assert dup_res.status_code == 400
    assert "distinct" in dup_res.json()["detail"].lower()

    # More than 4 IDs
    excess_res = client.get("/api/v1/compare?report_ids=rpt_1,rpt_2,rpt_3,rpt_4,rpt_5")
    assert excess_res.status_code == 400

def test_bulk_verify_empty_properties_422():
    res = client.post("/api/v1/reports/bulk", json={
        "properties": []
    })
    assert res.status_code in [400, 422]

def test_watchlist_recheck_null_score_resilience():
    from core.supabase import memory_store
    memory_store.watchlist["wl_test_null"] = {
        "watchlist_id": "wl_test_null",
        "report_id": "rpt_test_null",
        "property_name": "Null Score Tower",
        "current_trust_score": None,
        "score_delta_7d": None,
        "alert_threshold": 10,
        "status": "active"
    }
    res = client.post("/api/v1/watchlist/wl_test_null/recheck")
    assert res.status_code == 200
    data = res.json()
    assert data["current_trust_score"] == 70
    assert data["score_delta"] == 0



