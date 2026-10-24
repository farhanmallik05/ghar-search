"""Comprehensive test suite for RERA state parser and validation engine."""

import pytest
from fastapi.testclient import TestClient
from main import app
from core.rera_validator import validate_rera_number, normalize_rera_id

client = TestClient(app)

def test_maharera_canonical_validation():
    res = validate_rera_number("P52100012345")
    assert res.is_valid is True
    assert res.detected_state == "Maharashtra"
    assert res.normalized_id == "P52100012345"
    assert res.confidence >= 0.95
    assert "maharera" in res.authority_portal

def test_uprera_canonical_validation():
    res = validate_rera_number("UPRERAPRJ123456")
    assert res.is_valid is True
    assert res.detected_state == "Uttar Pradesh"
    assert res.normalized_id == "UPRERAPRJ123456"
    assert res.confidence >= 0.95
    assert "up-rera" in res.authority_portal

def test_karnataka_rera_validation():
    res = validate_rera_number("PRM/KA/RERA/1251/310/PR/171015/000456")
    assert res.is_valid is True
    assert res.detected_state == "Karnataka"
    assert res.confidence >= 0.90
    assert "karnataka" in res.authority_portal

def test_delhi_rera_validation():
    res = validate_rera_number("DLRERA2019P0001")
    assert res.is_valid is True
    assert res.detected_state == "Delhi"
    assert res.confidence >= 0.90

def test_haryana_rera_validation():
    res = validate_rera_number("HRERA-PKL-GGM-123-2021")
    assert res.is_valid is True
    assert res.detected_state == "Haryana"
    assert res.confidence >= 0.90

def test_telangana_rera_validation():
    res = validate_rera_number("P02400000123")
    assert res.is_valid is True
    assert res.detected_state == "Telangana"
    assert res.confidence >= 0.90

def test_tamilnadu_rera_validation():
    res = validate_rera_number("TN/01/Building/0123/2022")
    assert res.is_valid is True
    assert res.detected_state == "Tamil Nadu"

def test_gujarat_rera_validation():
    res = validate_rera_number("PR/GJ/AHMEDABAD/123")
    assert res.is_valid is True
    assert res.detected_state == "Gujarat"

def test_empty_and_whitespace_rera():
    res = validate_rera_number("   ")
    assert res.is_valid is False
    assert res.normalized_id == ""

def test_normalization_slashes_and_casing():
    norm = normalize_rera_id("  p52100012345  ")
    assert norm == "P52100012345"

    norm_slashes = normalize_rera_id("PRM//KA///RERA/1251")
    assert norm_slashes == "PRM/KA/RERA/1251"

def test_state_hint_fallback():
    res = validate_rera_number("REG12345678", state_hint="Maharashtra")
    assert res.is_valid is True
    assert res.detected_state == "Maharashtra"
    assert res.confidence == 0.75

def test_unrecognized_garbage_string():
    res = validate_rera_number("???$$$")
    assert res.is_valid is False
    assert res.detected_state is None
    assert res.confidence == 0.0

def test_api_rera_validate_endpoint():
    resp = client.get("/api/v1/rera/validate", params={"id": "P52100012345"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_valid"] is True
    assert data["detected_state"] == "Maharashtra"
    assert data["normalized_id"] == "P52100012345"

def test_api_rera_validate_endpoint_uprera():
    resp = client.get("/api/v1/rera/validate", params={"id": "upreraprj98765"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["is_valid"] is True
    assert data["detected_state"] == "Uttar Pradesh"
    assert data["normalized_id"] == "UPRERAPRJ98765"

def test_verify_intake_auto_populates_state():
    resp = client.post("/api/v1/verify", json={
        "manual_details": {
            "project_name": "Skyline Heights",
            "rera_number": "upreraprj54321"
        }
    })
    assert resp.status_code == 202
    data = resp.json()
    assert data["status"] == "queued"
    assert "report_id" in data
