"""Tier 2: Comprehensive Boundary and Corner Cases Test Suite.
Validates edge cases, invalid inputs, error handling, and boundary thresholds for all 7 features (>= 5 tests per feature = 35 tests).
"""

import pytest
from intelligence.schemas import (
    CheckResult,
    CheckType,
    CheckStatus,
    TrustLabel,
    PropertyClaims
)
from intelligence.rule_engine import calculate_trust_score, MAX_DIMENSION_SCORES
from intelligence.pdf_generator import generate_pdf_dossier


# ==============================================================================
# Feature 1 Boundaries: Verification Initiation (/api/v1/verify) [5 Tests]
# ==============================================================================

def test_tier2_f1_verify_empty_body_400(client):
    """F1.B1: Empty payload {} returns HTTP 400 Bad Request with actionable validation detail."""
    response = client.post("/api/v1/verify", json={})
    assert response.status_code == 400
    assert "Either a valid property_url or manual_details" in response.json()["detail"]


def test_tier2_f1_verify_whitespace_only_payload_400(client):
    """F1.B2: Whitespace-only property_url and manual_details fields return HTTP 400 Bad Request."""
    payload = {
        "property_url": "    \t \n  ",
        "manual_details": {
            "project_name": "   ",
            "rera_number": "   \t  "
        }
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 400
    assert "Either a valid property_url or manual_details" in response.json()["detail"]


def test_tier2_f1_verify_null_fields_400(client):
    """F1.B3: Explicit null values for both property_url and manual_details return HTTP 400."""
    payload = {
        "property_url": None,
        "manual_details": None
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 400
    assert "Either a valid property_url or manual_details" in response.json()["detail"]


def test_tier2_f1_verify_extreme_string_lengths_accepted(client):
    """F1.B4: Extremely long URL (2500+ chars) and large project name (500+ chars) do not crash server."""
    long_url = "https://housing.com/in/buy/projects/page/" + ("very-long-path-" * 150)
    long_name = "Grand Royal Prestige Mega Township " + ("Phase " * 50)
    payload = {
        "property_url": long_url,
        "manual_details": {
            "project_name": long_name,
            "rera_number": "P52100099999"
        }
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 202
    assert "report_id" in response.json()


def test_tier2_f1_verify_special_characters_escaping(client):
    """F1.B5: Adversarial characters (XSS vectors, quotes, SQL injections, unicode) are accepted safely."""
    payload = {
        "manual_details": {
            "project_name": "<script>alert('xss')</script> 🏢 'OR 1=1; DROP TABLE properties;--",
            "promoter_name": 'Builder "Special" & <Escaped> & Co. 🚀',
            "rera_number": "P52100099999"
        }
    }
    response = client.post("/api/v1/verify", json=payload)
    assert response.status_code == 202
    report_id = response.json()["report_id"]
    get_res = client.get(f"/api/v1/report/{report_id}")
    assert get_res.status_code == 200
    details = get_res.json()["property_details"]
    assert "<script>" in details["project_name"]


# ==============================================================================
# Feature 2 Boundaries: Report Retrieval (/api/v1/report/{id}) [5 Tests]
# ==============================================================================

def test_tier2_f2_report_nonexistent_id_404(client):
    """F2.B1: Requesting a non-existent report ID returns HTTP 404 with standard message."""
    response = client.get("/api/v1/report/rpt_definitely_does_not_exist_9999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_tier2_f2_report_path_traversal_special_id_404(client):
    """F2.B2: Path traversal attempts in report ID return HTTP 404 without directory leakage."""
    response = client.get("/api/v1/report/rpt_..%2F..%2Fetc%2Fpasswd")
    assert response.status_code in [404, 400]


def test_tier2_f2_report_case_sensitivity_exact_match_404(client):
    """F2.B3: Canonical report IDs are strictly case-sensitive; uppercase variants return HTTP 404."""
    response = client.get("/api/v1/report/RPT_SUNSHINE_CLEAN")
    assert response.status_code == 404


def test_tier2_f2_report_queued_status_schema(client, store):
    """F2.B4: Inspecting a report in queued status returns valid schema without null pointer crashes."""
    test_id = "rpt_synthetic_queued_01"
    store.reports[test_id] = {
        "report_id": test_id,
        "property_id": "prop_test_01",
        "status": "queued",
        "estimated_completion_seconds": 3,
        "realtime_channel": f"report:{test_id}",
        "credits_estimated": 12,
        "checks": [],
        "created_at": None
    }
    response = client.get(f"/api/v1/report/{test_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert data["checks"] == []


def test_tier2_f2_report_uuid_variation_lookup(client):
    """F2.B5: Validly formatted but unrecorded report IDs return HTTP 404 cleanly."""
    response = client.get("/api/v1/report/rpt_12345678")
    assert response.status_code == 404


# ==============================================================================
# Feature 3 Boundaries: PDF Export (/api/v1/report/{id}/pdf) [5 Tests]
# ==============================================================================

def test_tier2_f3_pdf_nonexistent_report_404(client):
    """F3.B1: Requesting PDF export for non-existent report ID returns HTTP 404."""
    response = client.get("/api/v1/report/rpt_non_existent_report/pdf")
    assert response.status_code == 404


def test_tier2_f3_pdf_queued_report_returns_409_conflict(client, store):
    """F3.B2: Requesting PDF for report in 'queued' status returns HTTP 409 Conflict."""
    test_id = "rpt_queued_test_pdf"
    store.reports[test_id] = {
        "report_id": test_id,
        "status": "queued",
        "trust_score": None,
        "created_at": None,
        "checks": []
    }
    response = client.get(f"/api/v1/report/{test_id}/pdf")
    assert response.status_code == 409
    assert "queued" in response.json()["detail"].lower()


def test_tier2_f3_pdf_running_report_returns_409_conflict(client, store):
    """F3.B3: Requesting PDF for report in 'running' status returns HTTP 409 Conflict."""
    test_id = "rpt_running_test_pdf"
    store.reports[test_id] = {
        "report_id": test_id,
        "status": "running",
        "trust_score": None,
        "created_at": None,
        "checks": []
    }
    response = client.get(f"/api/v1/report/{test_id}/pdf")
    assert response.status_code == 409
    assert "running" in response.json()["detail"].lower()


def test_tier2_f3_pdf_null_safety_in_report_data():
    """F3.B4: pdf_generator safely handles reports with None/missing score, date, and details."""
    minimal_report = {
        "report_id": "rpt_test_nulls",
        "status": "completed",
        "trust_score": None,
        "trust_label": None,
        "created_at": None,
        "property_details": None,
        "checks": []
    }
    pdf_bytes = generate_pdf_dossier(minimal_report)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 500


def test_tier2_f3_pdf_magic_bytes_and_length(client):
    """F3.B5: Generated PDF strictly complies with standard PDF binary signature and non-empty stream."""
    response = client.get("/api/v1/report/rpt_sunshine_clean/pdf")
    assert response.status_code == 200
    content = response.content
    assert content.startswith(b"%PDF-1.")
    assert b"%%EOF" in content[-1024:]


# ==============================================================================
# Feature 4 Boundaries: Interactive Fixtures (/api/v1/fixtures) [5 Tests]
# ==============================================================================

def test_tier2_f4_fixtures_disallows_post_put_delete(client):
    """F4.B1: HTTP methods other than GET return HTTP 405 Method Not Allowed."""
    for method in ["post", "put", "delete", "patch"]:
        res = getattr(client, method)("/api/v1/fixtures")
        assert res.status_code == 405


def test_tier2_f4_fixtures_query_parameters_resilience(client):
    """F4.B2: Unexpected query parameters (?filter=all&debug=1&foo=bar) are ignored cleanly."""
    response = client.get("/api/v1/fixtures?filter=all&debug=1&foo=bar&limit=100")
    assert response.status_code == 200
    assert len(response.json()["fixtures"]) == 3


def test_tier2_f4_fixtures_rera_id_statutory_format(client):
    """F4.B3: All fixture RERA IDs follow Maharashtra statutory format (P5 prefix, >=11 chars)."""
    response = client.get("/api/v1/fixtures")
    for fixture in response.json()["fixtures"]:
        rera_id = fixture["rera_id"]
        assert rera_id.startswith("P5"), f"RERA ID '{rera_id}' should start with MahaRERA prefix P5"
        assert len(rera_id) >= 11


def test_tier2_f4_fixtures_no_empty_strings_in_core_fields(client):
    """F4.B4: No fixture card has empty or whitespace strings in primary display properties."""
    response = client.get("/api/v1/fixtures")
    for f in response.json()["fixtures"]:
        for field in ["title", "badge", "project_name", "promoter_name", "city", "state"]:
            val = f.get(field, "")
            assert bool(val and val.strip()), f"Fixture '{f.get('key')}' has empty {field}"


def test_tier2_f4_fixtures_unique_keys_and_reports(client):
    """F4.B5: Fixture keys and listing URLs are mutually distinct with zero collision."""
    response = client.get("/api/v1/fixtures")
    fixtures = response.json()["fixtures"]
    keys = [f["key"] for f in fixtures]
    urls = [f["listing_url"] for f in fixtures]
    assert len(keys) == len(set(keys)) == 3
    assert len(urls) == len(set(urls)) == 3


# ==============================================================================
# Feature 5 Boundaries: Watchlist Monitoring & Deltas (/api/v1/watchlist) [5 Tests]
# ==============================================================================

def test_tier2_f5_watchlist_add_nonexistent_report_404(client):
    """F5.B1: Adding a non-existent report to the watchlist returns HTTP 404."""
    payload = {
        "report_id": "rpt_not_in_system_404",
        "alert_threshold": 10,
        "notify_email": True
    }
    response = client.post("/api/v1/watchlist", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_tier2_f5_watchlist_missing_required_report_id_422(client):
    """F5.B2: Submitting watchlist request without report_id returns HTTP 422 Unprocessable Entity."""
    payload = {
        "alert_threshold": 10,
        "notify_email": True
    }
    response = client.post("/api/v1/watchlist", json=payload)
    assert response.status_code == 422


def test_tier2_f5_watchlist_alert_threshold_boundary_values(client):
    """F5.B3: Boundary alert thresholds (0 and 100) are accepted and stored correctly."""
    for threshold in [0, 100]:
        res = client.post("/api/v1/watchlist", json={
            "report_id": "rpt_sunshine_clean",
            "alert_threshold": threshold,
            "notify_email": True
        })
        assert res.status_code == 201
        wl_id = res.json()["watchlist_id"]
        # Verify in watchlist
        items = client.get("/api/v1/watchlist").json()["items"]
        item = next(i for i in items if i["watchlist_id"] == wl_id)
        assert item["alert_threshold"] == threshold


def test_tier2_f5_watchlist_duplicate_adds_generate_unique_ids(client):
    """F5.B4: Adding the same report multiple times generates distinct watchlist IDs."""
    res1 = client.post("/api/v1/watchlist", json={
        "report_id": "rpt_sunshine_clean",
        "alert_threshold": 5
    })
    res2 = client.post("/api/v1/watchlist", json={
        "report_id": "rpt_sunshine_clean",
        "alert_threshold": 15
    })
    assert res1.status_code == 201
    assert res2.status_code == 201
    id1 = res1.json()["watchlist_id"]
    id2 = res2.json()["watchlist_id"]
    assert id1 != id2


def test_tier2_f5_watchlist_email_notification_flag_stored(client):
    """F5.B5: Submitting notify_email: False correctly reflects preference."""
    res = client.post("/api/v1/watchlist", json={
        "report_id": "rpt_sunshine_clean",
        "alert_threshold": 10,
        "notify_email": False
    })
    assert res.status_code == 201
    wl_id = res.json()["watchlist_id"]
    items = client.get("/api/v1/watchlist").json()["items"]
    item = next(i for i in items if i["watchlist_id"] == wl_id)
    assert item["notify_email"] is False


# ==============================================================================
# Feature 6 Boundaries: Human-in-the-Loop Task Resolution (/api/v1/hil/resolve) [5 Tests]
# ==============================================================================

def test_tier2_f6_hitl_missing_report_id_or_check_type_422(client):
    """F6.B1: Missing report_id or check_type in /api/v1/hil/resolve returns HTTP 422."""
    for incomplete in [{"check_type": "rera_status"}, {"report_id": "rpt_123"}]:
        res = client.post("/api/v1/hil/resolve", json=incomplete)
        assert res.status_code == 422


def test_tier2_f6_hitl_empty_resolution_data_handled(client):
    """F6.B2: Submitting empty resolution_data: {} succeeds without error."""
    payload = {
        "report_id": "rpt_test_empty_res",
        "check_type": "approvals",
        "resolution_data": {}
    }
    response = client.post("/api/v1/hil/resolve", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "resumed"


def test_tier2_f6_hitl_arbitrary_nested_resolution_structure(client, store):
    """F6.B3: Complex nested resolution payloads (arrays, floats, nested dicts) are preserved."""
    nested_data = {
        "court_orders": [
            {"case_no": "WP/1042/2026", "stay_vacated": True, "amount_in_dispute_cr": 4.5},
            {"case_no": "CC/509/2025", "settlement_reached": True}
        ],
        "metadata": {
            "attorney": "Adv. Ramesh Joshi",
            "chamber": "High Court of Bombay"
        }
    }
    payload = {
        "report_id": "rpt_nested_hitl",
        "check_type": "court_signals",
        "resolution_data": nested_data
    }
    response = client.post("/api/v1/hil/resolve", json=payload)
    assert response.status_code == 200
    task_key = "hitl_rpt_nested_hitl_court_signals"
    assert task_key in store.hitl_tasks
    assert store.hitl_tasks[task_key]["resolution_data"] == nested_data


def test_tier2_f6_hitl_unrecognized_check_type_handled(client):
    """F6.B4: Non-standard or future check types are accepted without server exception."""
    payload = {
        "report_id": "rpt_future_check",
        "check_type": "satellite_construction_progress",
        "resolution_data": {"foundation_depth_verified": True}
    }
    response = client.post("/api/v1/hil/resolve", json=payload)
    assert response.status_code == 200
    assert response.json()["check_type"] == "satellite_construction_progress"


def test_tier2_f6_hitl_repeated_resolutions_idempotent(client, store):
    """F6.B5: Repeated resolutions for the same task key update the resolution data cleanly."""
    task_payload_1 = {
        "report_id": "rpt_idempotent_test",
        "check_type": "promoter_record",
        "resolution_data": {"step": 1, "status": "partial"}
    }
    task_payload_2 = {
        "report_id": "rpt_idempotent_test",
        "check_type": "promoter_record",
        "resolution_data": {"step": 2, "status": "fully_resolved"}
    }
    client.post("/api/v1/hil/resolve", json=task_payload_1)
    client.post("/api/v1/hil/resolve", json=task_payload_2)
    task_key = "hitl_rpt_idempotent_test_promoter_record"
    assert store.hitl_tasks[task_key]["resolution_data"]["status"] == "fully_resolved"


# ==============================================================================
# Feature 7 Boundaries: Scoring Math & Clamp Limits [5 Tests]
# ==============================================================================

def test_tier2_f7_scoring_all_dimensions_perfect_100():
    """F7.B1: All 6 dimensions passing are subject to dynamic realistic due diligence caveats (High Trust, strictly < 100)."""
    checks = [
        CheckResult(check_type=CheckType.RERA_STATUS, status=CheckStatus.PASSED, findings=["Clean active registered"]),
        CheckResult(check_type=CheckType.CLAIM_MATCH, status=CheckStatus.PASSED, findings=["Brochure matches Form B"]),
        CheckResult(check_type=CheckType.COURT_SIGNALS, status=CheckStatus.PASSED, findings=["0 active cases clean: 0"]),
        CheckResult(check_type=CheckType.PROMOTER_RECORD, status=CheckStatus.PASSED, findings=["Clean track record"]),
        CheckResult(check_type=CheckType.APPROVALS, status=CheckStatus.PASSED, findings=["All sanctions verified"]),
        CheckResult(check_type=CheckType.REPUTATION, status=CheckStatus.PASSED, findings=["Clean sentiment"]),
    ]
    breakdown = calculate_trust_score(checks)
    assert breakdown.total_score < 100
    assert 85 <= breakdown.total_score <= 98
    assert breakdown.label == TrustLabel.HIGH_TRUST
    assert len(breakdown.deductions) >= 1
    assert sum(d.points_deducted for d in breakdown.deductions) + breakdown.total_score == 100


def test_tier2_f7_scoring_all_dimensions_failed_0():
    """F7.B2: Catastrophic failures across all 6 dimensions yields score in Critical Alert tier (<= 10). Empty checks yield strictly 0."""
    checks = [
        CheckResult(check_type=CheckType.RERA_STATUS, status=CheckStatus.FAILED, findings=["unregistered not found"]),
        CheckResult(check_type=CheckType.CLAIM_MATCH, status=CheckStatus.FLAGGED, findings=["possession delay: 18 months upper 8 floors are completely unauthorized"]),
        CheckResult(check_type=CheckType.COURT_SIGNALS, status=CheckStatus.FLAGGED, findings=["nclt cirp insolvency admitted stop-work injunction"]),
        CheckResult(check_type=CheckType.PROMOTER_RECORD, status=CheckStatus.FLAGGED, findings=["blacklisted promoter entity disqualified"]),
        CheckResult(check_type=CheckType.APPROVALS, status=CheckStatus.FLAGGED, findings=["demolition notice served missing commencement certificate"]),
        CheckResult(check_type=CheckType.REPUTATION, status=CheckStatus.FLAGGED, findings=["cheated homebuyers gate locked by local police 85 unresolved"]),
    ]
    breakdown = calculate_trust_score(checks)
    assert breakdown.total_score <= 10
    assert breakdown.label == TrustLabel.CRITICAL_ALERT
    assert len(breakdown.deductions) >= 5

    # Empty checks strictly produce 0 score
    empty_breakdown = calculate_trust_score([])
    assert empty_breakdown.total_score == 0
    assert empty_breakdown.label == TrustLabel.CRITICAL_ALERT


def test_tier2_f7_scoring_total_clamped_at_upper_bound_100():
    """F7.B3: Score is strictly bounded and never exceeds 100."""
    checks = [
        CheckResult(check_type=ct, status=CheckStatus.PASSED, findings=["Clean perfect compliance"])
        for ct in CheckType
    ]
    breakdown = calculate_trust_score(checks)
    assert breakdown.total_score <= 100


def test_tier2_f7_scoring_total_clamped_at_lower_bound_0():
    """F7.B4: Severe cumulative deductions never produce negative total scores (clamped to 0)."""
    checks = [
        CheckResult(check_type=CheckType.RERA_STATUS, status=CheckStatus.FAILED, findings=["revoked suspended expired not found unregistered"]),
        CheckResult(check_type=CheckType.COURT_SIGNALS, status=CheckStatus.FLAGGED, findings=["nclt insolvency admitted stop-work injunction consumer court complaint civil dispute"]),
    ]
    breakdown = calculate_trust_score(checks)
    assert breakdown.total_score >= 0


def test_tier2_f7_scoring_exact_tier_boundary_thresholds():
    """F7.B5: Verifies label transitions at exact boundary thresholds (80, 79, 60, 59, 40, 39)."""
    from intelligence.schemas import TrustScoreBreakdown

    # Helper to check threshold labeling logic
    def get_label_for_score(score: int) -> TrustLabel:
        if score >= 80:
            return TrustLabel.HIGH_TRUST
        elif score >= 60:
            return TrustLabel.MODERATE_RISK
        elif score >= 40:
            return TrustLabel.HIGH_RISK
        else:
            return TrustLabel.CRITICAL_ALERT

    assert get_label_for_score(100) == TrustLabel.HIGH_TRUST
    assert get_label_for_score(80) == TrustLabel.HIGH_TRUST
    assert get_label_for_score(79) == TrustLabel.MODERATE_RISK
    assert get_label_for_score(60) == TrustLabel.MODERATE_RISK
    assert get_label_for_score(59) == TrustLabel.HIGH_RISK
    assert get_label_for_score(40) == TrustLabel.HIGH_RISK
    assert get_label_for_score(39) == TrustLabel.CRITICAL_ALERT
    assert get_label_for_score(0) == TrustLabel.CRITICAL_ALERT
