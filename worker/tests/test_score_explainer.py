"""Test suite for deterministic Trust Score penalty attribution and risk classification."""

import pytest
from fixtures.demo_properties import DEMO_PROPERTIES
from intelligence.rule_engine import calculate_trust_score, MAX_DIMENSION_SCORES
from intelligence.score_explainer import explain_score_breakdown, classify_risk, compute_peer_percentile

def test_clean_property_score_explanation():
    data = DEMO_PROPERTIES["clean"]
    checks = [c.model_copy() for c in data["checks"]]
    breakdown = calculate_trust_score(checks, data.get("claims"))

    explanation = explain_score_breakdown(breakdown)
    assert explanation["risk_classification"]["category_code"] == "CLEAN_STATUTORY"
    assert explanation["risk_classification"]["action_priority"] == "ROUTINE_LEGAL_CHECK"
    assert explanation["statutory_compliance_rate"] >= 80.0
    assert "Top" in explanation["peer_percentile_benchmark"]
    assert breakdown.risk_category == "CLEAN_STATUTORY"
    assert breakdown.penalty_summary is not None
    assert len(breakdown.penalty_summary) == 6

def test_delayed_property_score_explanation():
    data = DEMO_PROPERTIES["delayed"]
    checks = [c.model_copy() for c in data["checks"]]
    breakdown = calculate_trust_score(checks, data.get("claims"))

    explanation = explain_score_breakdown(breakdown)
    # Delayed property should exhibit schedule drift or moderate compliance gap
    assert explanation["risk_classification"]["category_code"] in ["SCHEDULE_DRIFT", "MODERATE_COMPLIANCE_GAP"]
    assert explanation["total_points_lost"] == 100 - breakdown.total_score
    assert any(p["severity"] in ["MODERATE", "CRITICAL"] for p in explanation["penalties"])

def test_flagged_property_score_explanation():
    data = DEMO_PROPERTIES["flagged"]
    checks = [c.model_copy() for c in data["checks"]]
    breakdown = calculate_trust_score(checks, data.get("claims"))

    explanation = explain_score_breakdown(breakdown)
    assert explanation["risk_classification"]["category_code"] in ["LEGAL_INSOLVENCY_RISK", "SEVERE_MULTI_VECTOR_RISK"]
    assert explanation["risk_classification"]["action_priority"] == "IMMEDIATE_STOP"
    assert explanation["total_points_lost"] >= 60

def test_points_invariant_awarded_plus_lost_equals_100():
    for key, data in DEMO_PROPERTIES.items():
        checks = [c.model_copy() for c in data["checks"]]
        breakdown = calculate_trust_score(checks, data.get("claims"))
        explanation = explain_score_breakdown(breakdown)

        awarded_sum = sum(p["points_awarded"] for p in explanation["penalties"])
        lost_sum = sum(p["points_lost"] for p in explanation["penalties"])

        assert awarded_sum == breakdown.total_score
        assert awarded_sum + lost_sum == 100
        assert explanation["total_points_lost"] == lost_sum

def test_peer_percentile_tiers():
    assert "Top 5%" in compute_peer_percentile(95)
    assert "Top 15%" in compute_peer_percentile(82)
    assert "Top 40%" in compute_peer_percentile(70)
    assert "Bottom 35%" in compute_peer_percentile(55)
    assert "Bottom 20%" in compute_peer_percentile(40)
    assert "Bottom 5%" in compute_peer_percentile(20)

def test_zero_score_boundary_explanation():
    from intelligence.schemas import CheckResult, CheckType, CheckStatus
    empty_checks = [
        CheckResult(check_type=ct, status=CheckStatus.FAILED, score_contribution=0, max_score=MAX_DIMENSION_SCORES[ct.value])
        for ct in CheckType
    ]
    breakdown = calculate_trust_score(empty_checks)
    assert breakdown.total_score == 0
    explanation = explain_score_breakdown(breakdown)
    assert explanation["total_points_lost"] == 100
    assert explanation["statutory_compliance_rate"] == 0.0
    assert all(p["points_lost"] == p["max_points"] for p in explanation["penalties"])
