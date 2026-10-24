"""Tier 1: Comprehensive Feature Coverage Test Suite.
Validates the primary happy path behavior for all 7 Stage 1 features (>= 5 tests per feature = 35 tests).
"""

import pytest
from intelligence.schemas import CheckType, TrustLabel
from intelligence.rule_engine import calculate_trust_score, MAX_DIMENSION_SCORES
from fixtures.demo_properties import DEMO_PROPERTIES


# ==============================================================================
# Feature 1: Verification Initiation (/api/v1/verify) [5 Tests]
# ==============================================================================

def test_tier1_f1_verify_with_property_url(client):
    """F1.1: Verification initiation with a valid property listing URL returns 202 Accepted and report ID."""
    payload = {
        "property_url": "https://housing.com/in/buy/projects/page/102938-sunshine-residency-baner"
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert "report_id" in data
    assert data["report_id"].startswith("rpt_")
    assert data["status"] == "queued"
    assert data["estimated_completion_seconds"] == 3
    assert data["realtime_channel"] == f"report:{data['report_id']}"
    assert data["credits_estimated"] == 12


def test_tier1_f1_verify_with_manual_details_project_name(client):
    """F1.2: Verification initiation with manual project name returns 202 Accepted and report ID."""
    payload = {
        "manual_details": {
            "project_name": "Godrej Horizon",
            "city": "Pune",
            "state": "Maharashtra"
        }
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert data["report_id"].startswith("rpt_")
    assert data["status"] == "queued"


def test_tier1_f1_verify_with_manual_details_rera_number(client):
    """F1.3: Verification initiation with manual RERA number returns 202 Accepted and report ID."""
    payload = {
        "manual_details": {
            "rera_number": "P52100099887",
            "state": "Maharashtra"
        }
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert data["report_id"].startswith("rpt_")
    assert data["status"] == "queued"


def test_tier1_f1_verify_with_both_url_and_manual_details(client):
    """F1.4: Verification initiation with both property URL and manual details returns 202 Accepted."""
    payload = {
        "property_url": "https://99acres.com/godrej-serene-baner-pune-npid-12345",
        "manual_details": {
            "project_name": "Godrej Serene",
            "promoter_name": "Godrej Properties Limited",
            "rera_number": "P52100028711",
            "city": "Pune",
            "state": "Maharashtra"
        }
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert data["report_id"].startswith("rpt_")
    assert data["status"] == "queued"


def test_tier1_f1_verify_with_custom_user_id_and_priority(client):
    """F1.5: Verification initiation accepts custom user_id and priority attributes."""
    payload = {
        "manual_details": {
            "project_name": "Lodha Splendora",
            "rera_number": "P51700000123"
        },
        "user_id": "investor_user_992",
        "priority": "high"
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 202
    data = response.json()
    assert data["report_id"].startswith("rpt_")
    assert data["status"] == "queued"


# ==============================================================================
# Feature 2: Due-Diligence Report Retrieval (/api/v1/report/{id}) [5 Tests]
# ==============================================================================

def test_tier1_f2_report_retrieve_canonical_clean(client):
    """F2.1: Retrieval of canonical Sunshine Clean report returns 92/100 High Trust."""
    response = client.get("/api/v1/report/rpt_sunshine_clean")
    assert response.status_code == 200
    report = response.json()
    assert report["report_id"] == "rpt_sunshine_clean"
    assert report["status"] == "completed"
    assert report["trust_score"] == 92
    assert report["trust_label"] == "High Trust"
    assert len(report["checks"]) == 6


def test_tier1_f2_report_retrieve_canonical_delayed(client):
    """F2.2: Retrieval of canonical Green Valley Delayed report returns 68/100 Moderate Risk."""
    response = client.get("/api/v1/report/rpt_green_valley_delayed")
    assert response.status_code == 200
    report = response.json()
    assert report["report_id"] == "rpt_green_valley_delayed"
    assert report["status"] == "completed"
    assert report["trust_score"] == 68
    assert report["trust_label"] == "Moderate Risk"
    assert len(report["checks"]) == 6


def test_tier1_f2_report_retrieve_canonical_flagged(client):
    """F2.3: Retrieval of canonical Royal Empire Flagged report returns 18/100 Critical Alert."""
    response = client.get("/api/v1/report/rpt_royal_empire_flagged")
    assert response.status_code == 200
    report = response.json()
    assert report["report_id"] == "rpt_royal_empire_flagged"
    assert report["status"] == "completed"
    assert report["trust_score"] == 18
    assert report["trust_label"] == "Critical Alert"
    assert len(report["checks"]) == 6


def test_tier1_f2_report_retrieve_dynamic_verification_report(client):
    """F2.4: Retrieval of dynamically triggered verification report succeeds once execution completes."""
    post_res = client.post("/api/v1/verify", json={
        "manual_details": {
            "project_name": "Kolte Patil Life Republic",
            "rera_number": "P52100017112",
            "city": "Pune"
        }
    })
    report_id = post_res.json()["report_id"]
    get_res = client.get(f"/api/v1/report/{report_id}")
    assert get_res.status_code == 200
    report = get_res.json()
    assert report["report_id"] == report_id
    assert report["status"] == "completed"
    assert report["property_details"]["project_name"] == "Kolte Patil Life Republic"


def test_tier1_f2_report_schema_completeness(client):
    """F2.5: Full schema verification ensuring all mandatory report attributes are present."""
    response = client.get("/api/v1/report/rpt_sunshine_clean")
    report = response.json()
    required_fields = [
        "report_id", "property_id", "status", "property_details",
        "claims", "trust_score", "trust_label", "breakdown",
        "summary", "checks", "pdf_url", "credits_consumed", "created_at"
    ]
    for field in required_fields:
        assert field in report, f"Missing required field '{field}' in report schema"
    assert "verdict" in report["summary"]
    assert "dimension_scores" in report["breakdown"]


# ==============================================================================
# Feature 3: PDF Export (/api/v1/report/{id}/pdf) [5 Tests]
# ==============================================================================

def test_tier1_f3_pdf_export_canonical_clean(client):
    """F3.1: Exporting PDF dossier for Sunshine Clean returns valid application/pdf binary stream."""
    response = client.get("/api/v1/report/rpt_sunshine_clean/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
    assert len(response.content) > 1000


def test_tier1_f3_pdf_export_canonical_delayed(client):
    """F3.2: Exporting PDF dossier for Green Valley Delayed returns valid application/pdf binary stream."""
    response = client.get("/api/v1/report/rpt_green_valley_delayed/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
    assert len(response.content) > 1000


def test_tier1_f3_pdf_export_canonical_flagged(client):
    """F3.3: Exporting PDF dossier for Royal Empire Flagged returns valid application/pdf binary stream."""
    response = client.get("/api/v1/report/rpt_royal_empire_flagged/pdf")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.content.startswith(b"%PDF")
    assert len(response.content) > 1000


def test_tier1_f3_pdf_export_content_disposition_header(client):
    """F3.4: Content-Disposition attachment header specifies expected dossier filename."""
    response = client.get("/api/v1/report/rpt_sunshine_clean/pdf")
    assert response.status_code == 200
    assert "Content-Disposition" in response.headers
    assert response.headers["Content-Disposition"] == 'attachment; filename="GharSearch_rpt_sunshine_clean.pdf"'


def test_tier1_f3_pdf_export_dynamic_completed_report(client):
    """F3.5: Exporting PDF dossier for dynamic completed report produces valid PDF stream."""
    post_res = client.post("/api/v1/verify", json={
        "manual_details": {
            "project_name": "Brigade Gateway",
            "rera_number": "P52100000999"
        }
    })
    report_id = post_res.json()["report_id"]
    pdf_res = client.get(f"/api/v1/report/{report_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF")
    assert len(pdf_res.content) > 1000


# ==============================================================================
# Feature 4: Interactive Fixtures (/api/v1/fixtures) [5 Tests]
# ==============================================================================

def test_tier1_f4_fixtures_status_and_count(client):
    """F4.1: Fixtures endpoint returns HTTP 200, status 'success', and exactly 3 fixtures."""
    response = client.get("/api/v1/fixtures")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["fixtures"]) == 3


def test_tier1_f4_fixtures_keys_membership(client):
    """F4.2: Fixtures endpoint delivers the 3 pre-vetted keys: clean, delayed, flagged."""
    response = client.get("/api/v1/fixtures")
    keys = [f["key"] for f in response.json()["fixtures"]]
    assert set(keys) == {"clean", "delayed", "flagged"}


def test_tier1_f4_fixtures_schema_fields(client):
    """F4.3: Every fixture card contains all statutory metadata fields."""
    response = client.get("/api/v1/fixtures")
    expected_fields = [
        "key", "title", "badge", "rera_id", "project_name",
        "promoter_name", "city", "state", "address", "listing_url"
    ]
    for fixture in response.json()["fixtures"]:
        for field in expected_fields:
            assert field in fixture, f"Missing field '{field}' in fixture {fixture.get('key')}"


def test_tier1_f4_fixtures_badge_content(client):
    """F4.4: Fixture badges match their expected trust ratings and scores."""
    response = client.get("/api/v1/fixtures")
    fixture_map = {f["key"]: f for f in response.json()["fixtures"]}
    assert "92/100" in fixture_map["clean"]["badge"]
    assert "68/100" in fixture_map["delayed"]["badge"]
    assert "18/100" in fixture_map["flagged"]["badge"]


def test_tier1_f4_fixtures_idempotent(client):
    """F4.5: Multiple sequential requests return identical fixture content."""
    res1 = client.get("/api/v1/fixtures").json()
    res2 = client.get("/api/v1/fixtures").json()
    assert res1 == res2


# ==============================================================================
# Feature 5: Watchlist Monitoring & Deltas (/api/v1/watchlist) [5 Tests]
# ==============================================================================

def test_tier1_f5_watchlist_get_default_seeded_list(client):
    """F5.1: Default watchlist query returns HTTP 200 with at least 2 seeded entries."""
    response = client.get("/api/v1/watchlist")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert data["total"] >= 2


def test_tier1_f5_watchlist_item_schema_verification(client):
    """F5.2: Watchlist items conform to monitoring schema with score deltas."""
    response = client.get("/api/v1/watchlist")
    items = response.json()["items"]
    expected_keys = [
        "watchlist_id", "report_id", "property_name", "promoter_name",
        "rera_id", "city", "current_trust_score", "alert_threshold",
        "status", "score_delta_7d", "last_checked_at"
    ]
    for item in items:
        for key in expected_keys:
            assert key in item, f"Missing key '{key}' in watchlist item {item.get('watchlist_id')}"


def test_tier1_f5_watchlist_post_create_new_entry(client):
    """F5.3: POST /api/v1/watchlist successfully adds an existing report to monitoring."""
    payload = {
        "report_id": "rpt_sunshine_clean",
        "alert_threshold": 15,
        "notify_email": True
    }
    response = client.post("/api/v1/watchlist", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "watchlist_id" in data
    assert data["watchlist_id"].startswith("wl_")
    assert data["status"] == "active"
    assert "next_check_at" in data


def test_tier1_f5_watchlist_post_increments_total_count(client):
    """F5.4: Adding a watchlist item increments the total count in subsequent GET queries."""
    initial_total = client.get("/api/v1/watchlist").json()["total"]
    client.post("/api/v1/watchlist", json={
        "report_id": "rpt_green_valley_delayed",
        "alert_threshold": 10,
        "notify_email": False
    })
    updated_total = client.get("/api/v1/watchlist").json()["total"]
    assert updated_total == initial_total + 1


def test_tier1_f5_watchlist_score_delta_present(client):
    """F5.5: Monitored items have 7-day score delta values (e.g., 0 for stable, -4 for delayed)."""
    response = client.get("/api/v1/watchlist")
    items = {item["watchlist_id"]: item for item in response.json()["items"]}
    assert items["wl_sunshine_baner"]["score_delta_7d"] == 0
    assert items["wl_green_valley"]["score_delta_7d"] == -4


# ==============================================================================
# Feature 6: Human-in-the-Loop Task Resolution (/api/v1/hil/resolve) [5 Tests]
# ==============================================================================

def test_tier1_f6_hitl_resolve_rera_status_captcha(client):
    """F6.1: Resolving a RERA captcha challenge returns HTTP 200 with resumed status."""
    payload = {
        "report_id": "rpt_demo_test",
        "check_type": "rera_status",
        "resolution_data": {"captcha_token": "valid_token_xyz"}
    }
    response = client.post("/api/v1/hil/resolve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "resumed"
    assert data["report_id"] == "rpt_demo_test"
    assert data["check_type"] == "rera_status"


def test_tier1_f6_hitl_resolve_court_signals_manual_review(client):
    """F6.2: Resolving a court litigation dispute with human review input returns status resumed."""
    payload = {
        "report_id": "rpt_green_valley_delayed",
        "check_type": "court_signals",
        "resolution_data": {
            "verified_dispute_status": "dismissed_on_appeal",
            "reviewer_notes": "Order dated 15-Oct confirms matter disposed."
        }
    }
    response = client.post("/api/v1/hil/resolve", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "resumed"


def test_tier1_f6_hitl_resolve_response_payload_echo(client):
    """F6.3: Response payload confirms exact report_id and check_type submitted."""
    payload = {
        "report_id": "rpt_test_echo_42",
        "check_type": "claim_match",
        "resolution_data": {"confirmed_floor_count": 22}
    }
    response = client.post("/api/v1/hil/resolve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["report_id"] == "rpt_test_echo_42"
    assert data["check_type"] == "claim_match"


def test_tier1_f6_hitl_resolve_state_persisted(client, store):
    """F6.4: Resolving a HITL task persists the record into the memory store."""
    payload = {
        "report_id": "rpt_persist_test",
        "check_type": "approvals",
        "resolution_data": {"fire_noc_verified": True}
    }
    client.post("/api/v1/hil/resolve", json=payload)
    task_key = "hitl_rpt_persist_test_approvals"
    assert task_key in store.hitl_tasks
    task = store.hitl_tasks[task_key]
    assert task["status"] == "resolved"
    assert task["resolution_data"]["fire_noc_verified"] is True


def test_tier1_f6_hitl_resolve_multiple_distinct_checks(client):
    """F6.5: Successive HITL resolutions for different check types on the same report operate independently."""
    for check in ["rera_status", "promoter_record", "reputation"]:
        res = client.post("/api/v1/hil/resolve", json={
            "report_id": "rpt_multi_check",
            "check_type": check,
            "resolution_data": {"confirmed": True}
        })
        assert res.status_code == 200
        assert res.json()["check_type"] == check


# ==============================================================================
# Feature 7: Deterministic 0-100 Scoring Math Across 6 Dimensions [5 Tests]
# ==============================================================================

def test_tier1_f7_scoring_dimension_max_weights():
    """F7.1: The 6 statutory dimensions have exact designated max scores summing to 100."""
    assert sum(MAX_DIMENSION_SCORES.values()) == 100
    assert MAX_DIMENSION_SCORES[CheckType.RERA_STATUS.value] == 30
    assert MAX_DIMENSION_SCORES[CheckType.CLAIM_MATCH.value] == 20
    assert MAX_DIMENSION_SCORES[CheckType.COURT_SIGNALS.value] == 20
    assert MAX_DIMENSION_SCORES[CheckType.PROMOTER_RECORD.value] == 10
    assert MAX_DIMENSION_SCORES[CheckType.APPROVALS.value] == 10
    assert MAX_DIMENSION_SCORES[CheckType.REPUTATION.value] == 10


def test_tier1_f7_scoring_total_equals_dimension_sum(client):
    """F7.2: Across all canonical reports, trust_score strictly equals sum(dimension_scores)."""
    for rep_id in ["rpt_sunshine_clean", "rpt_green_valley_delayed", "rpt_royal_empire_flagged"]:
        report = client.get(f"/api/v1/report/{rep_id}").json()
        dim_sum = sum(report["breakdown"]["dimension_scores"].values())
        assert report["trust_score"] == dim_sum


def test_tier1_f7_scoring_total_equals_check_contributions(client):
    """F7.3: Across all canonical reports, trust_score strictly equals sum(check.score_contribution)."""
    for rep_id in ["rpt_sunshine_clean", "rpt_green_valley_delayed", "rpt_royal_empire_flagged"]:
        report = client.get(f"/api/v1/report/{rep_id}").json()
        check_sum = sum(c["score_contribution"] for c in report["checks"])
        assert report["trust_score"] == check_sum


def test_tier1_f7_scoring_clean_property_exact_values():
    """F7.4: Sunshine Clean fixture calculates to exactly 92/100 High Trust."""
    fixture = DEMO_PROPERTIES["clean"]
    breakdown = calculate_trust_score(fixture["checks"], fixture["claims"])
    assert breakdown.total_score == 92
    assert breakdown.label == TrustLabel.HIGH_TRUST
    assert breakdown.dimension_scores[CheckType.RERA_STATUS.value] == 30
    assert breakdown.dimension_scores[CheckType.CLAIM_MATCH.value] == 20
    assert breakdown.dimension_scores[CheckType.COURT_SIGNALS.value] == 20
    assert breakdown.dimension_scores[CheckType.PROMOTER_RECORD.value] == 10
    assert breakdown.dimension_scores[CheckType.APPROVALS.value] == 6
    assert breakdown.dimension_scores[CheckType.REPUTATION.value] == 6


def test_tier1_f7_scoring_flagged_property_exact_values():
    """F7.5: Royal Empire Flagged fixture calculates to exactly 18/100 Critical Alert."""
    fixture = DEMO_PROPERTIES["flagged"]
    breakdown = calculate_trust_score(fixture["checks"], fixture["claims"])
    assert breakdown.total_score == 18
    assert breakdown.label == TrustLabel.CRITICAL_ALERT
    assert breakdown.dimension_scores[CheckType.RERA_STATUS.value] == 10
    assert breakdown.dimension_scores[CheckType.CLAIM_MATCH.value] == 2
    assert breakdown.dimension_scores[CheckType.COURT_SIGNALS.value] == 0
    assert breakdown.dimension_scores[CheckType.PROMOTER_RECORD.value] == 0
    assert breakdown.dimension_scores[CheckType.APPROVALS.value] == 4
    assert breakdown.dimension_scores[CheckType.REPUTATION.value] == 2
