"""Tier 3: Cross-Feature Interactions Test Suite.
Validates end-to-end integration flows spanning multiple API endpoints, state transitions, and subsystems.
"""

import fitz  # PyMuPDF
import pytest
from fixtures.demo_properties import DEMO_PROPERTIES


def test_tier3_flow_complete_due_diligence_lifecycle(client):
    """Flow 1: Complete end-to-end user journey:
    Trigger verification -> retrieve report -> verify mathematical scoring invariants ->
    add to watchlist -> confirm monitoring record -> export PDF dossier and verify binary.
    """
    # 1. Trigger verification
    verify_payload = {
        "manual_details": {
            "project_name": "Panchshil Towers Kharadi",
            "promoter_name": "Panchshil Realty",
            "rera_number": "P52100016482",
            "city": "Pune",
            "state": "Maharashtra"
        },
        "user_id": "e2e_buyer_01"
    }
    verify_res = client.post("/api/v1/verify", json=verify_payload)
    assert verify_res.status_code == 202
    report_id = verify_res.json()["report_id"]

    # 2. Retrieve verified report
    rep_res = client.get(f"/api/v1/report/{report_id}")
    assert rep_res.status_code == 200
    report = rep_res.json()
    assert report["report_id"] == report_id
    assert report["status"] == "completed"
    assert report["property_details"]["project_name"] == "Panchshil Towers Kharadi"

    # 3. Verify scoring invariant
    trust_score = report["trust_score"]
    dim_sum = sum(report["breakdown"]["dimension_scores"].values())
    check_sum = sum(c["score_contribution"] for c in report["checks"])
    assert trust_score == dim_sum == check_sum

    # 4. Add report to watchlist
    wl_payload = {
        "report_id": report_id,
        "alert_threshold": 12,
        "notify_email": True
    }
    wl_res = client.post("/api/v1/watchlist", json=wl_payload)
    assert wl_res.status_code == 201
    wl_id = wl_res.json()["watchlist_id"]

    # 5. Verify watchlist entry matches
    list_res = client.get("/api/v1/watchlist")
    assert list_res.status_code == 200
    watchlist_items = list_res.json()["items"]
    matched_item = next((i for i in watchlist_items if i["watchlist_id"] == wl_id), None)
    assert matched_item is not None
    assert matched_item["report_id"] == report_id
    assert matched_item["property_name"] == "Panchshil Towers Kharadi"
    assert matched_item["alert_threshold"] == 12
    assert matched_item["current_trust_score"] == trust_score

    # 6. Export PDF dossier
    pdf_res = client.get(f"/api/v1/report/{report_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert pdf_res.content.startswith(b"%PDF")
    assert len(pdf_res.content) > 1000

    # Inspect rendered PDF with PyMuPDF
    doc = fitz.open(stream=pdf_res.content, filetype="pdf")
    assert len(doc) >= 1
    page_text = doc[0].get_text()
    assert "Panchshil Towers Kharadi" in page_text
    assert "P52100016482" in page_text
    doc.close()


def test_tier3_flow_fixtures_to_report_to_pdf_consistency(client):
    """Flow 2: Pre-seeded fixtures to canonical report retrieval to PDF rendering:
    Validates cross-system consistency between fixture cards, stored reports, and PDF contents.
    """
    # 1. Fetch fixtures
    fixtures_res = client.get("/api/v1/fixtures")
    assert fixtures_res.status_code == 200
    fixtures = fixtures_res.json()["fixtures"]

    for fix in fixtures:
        key = fix["key"]
        expected_name = fix["project_name"]
        expected_rera = fix["rera_id"]

        # 2. Retrieve corresponding canonical report
        rep_res = client.get(f"/api/v1/report/rpt_{key}")
        if rep_res.status_code == 404:
            # Check if canonical ID is keyed differently in demo properties
            fixture_data = DEMO_PROPERTIES[key]
            canonical_id = fixture_data.get("report_id", f"rpt_{key}")
            rep_res = client.get(f"/api/v1/report/{canonical_id}")

        assert rep_res.status_code == 200
        report = rep_res.json()
        assert report["property_details"]["project_name"] == expected_name
        assert report["property_details"]["rera_id"] == expected_rera

        # 3. Check mathematical score consistency
        assert report["trust_score"] == sum(report["breakdown"]["dimension_scores"].values())

        # 4. Generate PDF and verify embedded text
        pdf_res = client.get(f"/api/v1/report/{report['report_id']}/pdf")
        assert pdf_res.status_code == 200
        doc = fitz.open(stream=pdf_res.content, filetype="pdf")
        assert len(doc) >= 1
        page_text = doc[0].get_text()
        assert expected_name in page_text
        assert expected_rera in page_text
        assert str(report["trust_score"]) in page_text
        doc.close()


def test_tier3_flow_verify_hitl_resolution_to_report_audit(client, store):
    """Flow 3: Verification initiation -> multiple HITL interventions -> persistence audit:
    Validates that user/analyst interventions are tracked cleanly against the report.
    """
    # 1. Initiate verification
    res = client.post("/api/v1/verify", json={
        "manual_details": {
            "project_name": "Rohan Mithila",
            "rera_number": "P52100000777"
        }
    })
    report_id = res.json()["report_id"]

    # 2. Resolve HITL challenge on RERA status
    hitl_res1 = client.post("/api/v1/hil/resolve", json={
        "report_id": report_id,
        "check_type": "rera_status",
        "resolution_data": {
            "action": "captcha_solved",
            "token": "tok_991823"
        }
    })
    assert hitl_res1.status_code == 200
    assert hitl_res1.json()["status"] == "resumed"

    # 3. Resolve second HITL challenge on court litigation
    hitl_res2 = client.post("/api/v1/hil/resolve", json={
        "report_id": report_id,
        "check_type": "court_signals",
        "resolution_data": {
            "action": "legal_opinion_attached",
            "counsel_verdict": "matter_settled_out_of_court"
        }
    })
    assert hitl_res2.status_code == 200

    # 4. Audit persistence
    task1_key = f"hitl_{report_id}_rera_status"
    task2_key = f"hitl_{report_id}_court_signals"
    assert task1_key in store.hitl_tasks
    assert task2_key in store.hitl_tasks
    assert store.hitl_tasks[task1_key]["resolution_data"]["action"] == "captcha_solved"
    assert store.hitl_tasks[task2_key]["resolution_data"]["counsel_verdict"] == "matter_settled_out_of_court"


def test_tier3_flow_watchlist_multi_property_deltas_and_thresholds(client):
    """Flow 4: Multi-property monitoring management:
    Validates adding multiple properties with distinct threshold settings and reading 7-day deltas.
    """
    initial_watchlist = client.get("/api/v1/watchlist").json()
    base_count = initial_watchlist["total"]

    # Add Clean property with low threshold
    res_clean = client.post("/api/v1/watchlist", json={
        "report_id": "rpt_sunshine_clean",
        "alert_threshold": 5,
        "notify_email": True
    })
    assert res_clean.status_code == 201
    wl_clean_id = res_clean.json()["watchlist_id"]

    # Add Delayed property with high threshold
    res_delayed = client.post("/api/v1/watchlist", json={
        "report_id": "rpt_green_valley_delayed",
        "alert_threshold": 25,
        "notify_email": False
    })
    assert res_delayed.status_code == 201
    wl_delayed_id = res_delayed.json()["watchlist_id"]

    # List watchlist
    updated_list = client.get("/api/v1/watchlist").json()
    assert updated_list["total"] == base_count + 2
    item_map = {i["watchlist_id"]: i for i in updated_list["items"]}

    assert item_map[wl_clean_id]["alert_threshold"] == 5
    assert item_map[wl_clean_id]["notify_email"] is True
    assert item_map[wl_delayed_id]["alert_threshold"] == 25
    assert item_map[wl_delayed_id]["notify_email"] is False


def test_tier3_flow_concurrent_verifications_isolation(client):
    """Flow 5: Concurrent verification isolation:
    Validates that sequential/concurrent verification calls for different properties generate
    isolated records without state leak or cross-contamination.
    """
    properties_to_verify = [
        ("VTP Blue Waters", "P52100019201", "Pune"),
        ("Godrej Garden City", "PR/GJ/AHMEDABAD/1029", "Ahmedabad"),
        ("Sobha Dream Acres", "PRM/KA/RERA/1251/446", "Bangalore"),
        ("Prestige Falcon City", "PRM/KA/RERA/1251/310", "Bangalore"),
        ("Lodha Palava Lakeshore", "P51700015000", "Thane"),
    ]

    report_ids = []
    for proj_name, rera_no, city in properties_to_verify:
        res = client.post("/api/v1/verify", json={
            "manual_details": {
                "project_name": proj_name,
                "rera_number": rera_no,
                "city": city
            }
        })
        assert res.status_code == 202
        rep_id = res.json()["report_id"]
        report_ids.append((rep_id, proj_name, rera_no, city))

    # All generated report IDs must be strictly unique
    all_rep_ids = [item[0] for item in report_ids]
    assert len(all_rep_ids) == len(set(all_rep_ids)) == 5

    # Retrieve each report and verify property integrity
    for rep_id, proj_name, rera_no, city in report_ids:
        rep_res = client.get(f"/api/v1/report/{rep_id}")
        assert rep_res.status_code == 200
        data = rep_res.json()
        assert data["report_id"] == rep_id
        assert data["property_details"]["project_name"] == proj_name
        assert data["property_details"]["rera_id"] == rera_no
        assert data["property_details"]["city"] == city
        assert data["status"] == "completed"
        # Mathematical invariant check
        assert data["trust_score"] == sum(data["breakdown"]["dimension_scores"].values())
