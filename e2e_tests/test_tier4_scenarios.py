"""Tier 4: Real-World Scenarios Test Suite.
Authentic Indian real estate homebuyer due-diligence personas and end-to-end user stories.
"""

import fitz  # PyMuPDF
import pytest
from intelligence.schemas import TrustLabel


def test_tier4_scenario_clean_homebuyer_due_diligence(client):
    """Scenario 1: High-Trust Homebuyer Journey (Sunshine Residency Baner, Pune)
    A tech homebuyer is buying a 3BHK flat in Baner. They enter the project listing URL to verify
    developer claims, title clarity, and statutory sanctions.
    Expected: 92/100 High Trust, green badge, clean RERA and zero litigation, valid PDF export.
    """
    # 1. Inspect canonical clean report
    res = client.get("/api/v1/report/rpt_sunshine_clean")
    assert res.status_code == 200
    report = res.json()

    # 2. Assert score and tier
    assert report["trust_score"] == 92
    assert report["trust_label"] == "High Trust"
    assert report["status"] == "completed"

    # 3. Assert evidence assertions
    details = report["property_details"]
    assert details["project_name"] == "Sunshine Residency Phase 1"
    assert details["promoter_name"] == "Godrej Properties Limited"
    assert details["city"] == "Pune"
    assert details["rera_id"] == "P52100012345"

    # 4. Check findings for key dimensions
    checks = {c["check_type"]: c for c in report["checks"]}
    assert checks["rera_status"]["status"] == "passed"
    assert "Active Registered" in checks["rera_status"]["evidence"][0]["snippet"]
    assert checks["court_signals"]["status"] == "passed"
    assert "0 active" in checks["court_signals"]["findings"][0].lower()

    # 5. Check recommendations
    recommendations = report["breakdown"]["recommendations"]
    assert any("strong statutory compliance" in r.lower() for r in recommendations)

    # 6. Verify PDF export contains clean audit badge
    pdf_res = client.get("/api/v1/report/rpt_sunshine_clean/pdf")
    assert pdf_res.status_code == 200
    doc = fitz.open(stream=pdf_res.content, filetype="pdf")
    page_text = doc[0].get_text()
    assert "92 / 100" in page_text
    assert "LOW RISK" in page_text
    assert "Sunshine Residency Phase 1" in page_text
    doc.close()


def test_tier4_scenario_delayed_project_with_possession_gap(client):
    """Scenario 2: Moderate-Risk Delayed Project (Green Valley Towers, Pune)
    A family is considering a pre-launch/under-construction flat where the sales agent claims
    handover by Dec 2026, but rumors cite delays.
    Expected: 68/100 Moderate Risk, possession delay deduction (-10 pts), active consumer forum litigation (-8 pts).
    """
    res = client.get("/api/v1/report/rpt_green_valley_delayed")
    assert res.status_code == 200
    report = res.json()

    # 1. Assert score and tier
    assert report["trust_score"] == 68
    assert report["trust_label"] == "Moderate Risk"

    # 2. Verify specific deductions
    deductions = {d["rule"]: d for d in report["breakdown"]["deductions"]}
    assert "CLAIM_POSSESSION_DELAY" in deductions
    assert deductions["CLAIM_POSSESSION_DELAY"]["points_deducted"] == 10
    assert "ACTIVE_LITIGATION" in deductions
    assert deductions["ACTIVE_LITIGATION"]["points_deducted"] == 8

    # 3. Verify buyer recommendations flag Section 18 delay interest
    recommendations = report["breakdown"]["recommendations"]
    assert any("section 18" in r.lower() for r in recommendations)
    assert any("delayed milestones" in r.lower() for r in recommendations)

    # 4. Verify PDF highlights moderate risk
    pdf_res = client.get("/api/v1/report/rpt_green_valley_delayed/pdf")
    assert pdf_res.status_code == 200
    doc = fitz.open(stream=pdf_res.content, filetype="pdf")
    page_text = doc[0].get_text()
    assert "68 / 100" in page_text
    assert "MODERATE RISK" in page_text
    doc.close()


def test_tier4_scenario_flagged_insolvent_builder_alert(client):
    """Scenario 3: Critical Alert Insolvent/Unauthorized Project (Royal Empire, Thane)
    A buyer finds a flat advertised at an unusually steep 40% market discount.
    Due-diligence reveals NCLT insolvency admitted, statutory RERA revocation proceedings,
    8 unauthorized floors, and municipal demolition notices.
    Expected: 18/100 Critical Alert, 'Do not disburse funds' warning, FATAL_LITIGATION and RERA_REVOCATION.
    """
    res = client.get("/api/v1/report/rpt_royal_empire_flagged")
    assert res.status_code == 200
    report = res.json()

    # 1. Assert score and tier
    assert report["trust_score"] == 18
    assert report["trust_label"] == "Critical Alert"

    # 2. Check for fatal deductions
    deduction_rules = [d["rule"] for d in report["breakdown"]["deductions"]]
    assert "FATAL_LITIGATION" in deduction_rules
    assert "RERA_REVOCATION_PROCEEDINGS" in deduction_rules
    assert "CLAIM_SANCTION_MISMATCH" in deduction_rules

    # 3. Urgent recommendation
    recommendations = report["breakdown"]["recommendations"]
    assert any("do not disburse funds" in r.lower() for r in recommendations)
    assert any("insolvency proceedings detected" in r.lower() for r in recommendations)

    # 4. Verify PDF highlights critical alert
    pdf_res = client.get("/api/v1/report/rpt_royal_empire_flagged/pdf")
    assert pdf_res.status_code == 200
    doc = fitz.open(stream=pdf_res.content, filetype="pdf")
    page_text = doc[0].get_text()
    assert "18 / 100" in page_text
    assert "CRITICAL ALERT" in page_text
    doc.close()


def test_tier4_scenario_live_portal_url_extraction(client):
    """Scenario 4: Live Real Estate Portal URL Scraping & Intelligence Run
    A homebuyer copies a real property URL from Housing.com. The engine parses project name and city,
    runs the asynchronous verification graph, and returns a verified dossier.
    """
    portal_url = "https://housing.com/in/buy/projects/page/102938-godrej-woods-noida"
    verify_res = client.post("/api/v1/verify", json={"property_url": portal_url})
    assert verify_res.status_code == 202
    report_id = verify_res.json()["report_id"]

    # Retrieve completed report
    rep_res = client.get(f"/api/v1/report/{report_id}")
    assert rep_res.status_code == 200
    report = rep_res.json()
    assert report["status"] == "completed"
    assert report["property_details"]["project_name"] == "Godrej Woods"
    assert report["property_details"]["city"] == "Noida"
    assert len(report["checks"]) == 6
    assert report["trust_score"] == sum(c["score_contribution"] for c in report["checks"])


def test_tier4_scenario_manual_details_offline_ruling(client):
    """Scenario 5: Offline Builder Paperwork Due-Diligence (Brochure Only)
    A homebuyer receives an unlisted brochure from a local sales office with no web listing URL.
    They submit project name, promoter name, and RERA registration ID manually.
    The system performs full registry checks and outputs a verified dossier.
    """
    manual_payload = {
        "manual_details": {
            "project_name": "Marvel Brisa",
            "promoter_name": "Marvel Realtors & Developers",
            "rera_number": "P52100000456",
            "city": "Pune",
            "state": "Maharashtra"
        }
    }
    verify_res = client.post("/api/v1/verify", json=manual_payload)
    assert verify_res.status_code == 202
    report_id = verify_res.json()["report_id"]

    rep_res = client.get(f"/api/v1/report/{report_id}")
    assert rep_res.status_code == 200
    report = rep_res.json()
    assert report["status"] == "completed"
    assert report["property_details"]["project_name"] == "Marvel Brisa"
    assert report["property_details"]["promoter_name"] == "Marvel Realtors & Developers"
    assert report["property_details"]["rera_id"] == "P52100000456"
    assert report["trust_score"] == sum(report["breakdown"]["dimension_scores"].values())
    assert len(report["checks"]) == 6
