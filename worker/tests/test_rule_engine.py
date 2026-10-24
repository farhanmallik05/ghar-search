"""Unit and integration tests for Deterministic Rule Engine and Verification Graph.
Verifies the 6-dimension mathematical trust scoring rules and invariant properties.
"""

import pytest
import asyncio
from intelligence.schemas import (
    CheckResult,
    CheckType,
    CheckStatus,
    TrustLabel,
    PropertyInput,
    ManualDetails
)
from intelligence.rule_engine import calculate_trust_score, MAX_DIMENSION_SCORES
from fixtures.demo_properties import DEMO_PROPERTIES
from graphs.verification_graph import VerificationGraph

def test_max_dimension_scores_sum_to_100():
    """Verifies that the 6 statutory dimensions sum precisely to 100 points."""
    assert sum(MAX_DIMENSION_SCORES.values()) == 100
    assert MAX_DIMENSION_SCORES[CheckType.RERA_STATUS.value] == 30
    assert MAX_DIMENSION_SCORES[CheckType.CLAIM_MATCH.value] == 20
    assert MAX_DIMENSION_SCORES[CheckType.COURT_SIGNALS.value] == 20
    assert MAX_DIMENSION_SCORES[CheckType.PROMOTER_RECORD.value] == 10
    assert MAX_DIMENSION_SCORES[CheckType.APPROVALS.value] == 10
    assert MAX_DIMENSION_SCORES[CheckType.REPUTATION.value] == 10

def test_clean_property_fixture_scoring():
    """Clean property should score in High Trust tier (>= 80)."""
    clean_fixture = DEMO_PROPERTIES["clean"]
    breakdown = calculate_trust_score(clean_fixture["checks"], clean_fixture["claims"])

    assert breakdown.total_score >= 80
    assert breakdown.label == TrustLabel.HIGH_TRUST
    assert len(breakdown.strengths) > 0
    assert len(breakdown.deductions) == 0 or sum(d.points_deducted for d in breakdown.deductions) <= 15
    assert breakdown.dimension_scores[CheckType.RERA_STATUS.value] == 30
    assert breakdown.dimension_scores[CheckType.CLAIM_MATCH.value] == 20
    assert breakdown.dimension_scores[CheckType.COURT_SIGNALS.value] == 20

def test_delayed_property_fixture_scoring():
    """Delayed property should score in Moderate Risk tier (60-79)."""
    delayed_fixture = DEMO_PROPERTIES["delayed"]
    breakdown = calculate_trust_score(delayed_fixture["checks"], delayed_fixture["claims"])

    assert 60 <= breakdown.total_score < 80
    assert breakdown.label == TrustLabel.MODERATE_RISK
    # Must flag possession delay
    delay_deductions = [d for d in breakdown.deductions if d.rule == "CLAIM_POSSESSION_DELAY"]
    assert len(delay_deductions) > 0
    assert delay_deductions[0].points_deducted > 0

def test_flagged_property_fixture_scoring():
    """Flagged property with NCLT / unauthorized floors must score in Critical Alert tier (< 40)."""
    flagged_fixture = DEMO_PROPERTIES["flagged"]
    breakdown = calculate_trust_score(flagged_fixture["checks"], flagged_fixture["claims"])

    assert breakdown.total_score < 40
    assert breakdown.label == TrustLabel.CRITICAL_ALERT
    # Must have fatal litigation deduction
    fatal_deductions = [d for d in breakdown.deductions if d.rule == "FATAL_LITIGATION"]
    assert len(fatal_deductions) > 0
    assert fatal_deductions[0].points_deducted == 20

def test_empty_checks_yields_zero_score():
    """Empty or pending checks must yield 0 score without exceptions."""
    breakdown = calculate_trust_score([])
    assert breakdown.total_score == 0
    assert breakdown.label == TrustLabel.CRITICAL_ALERT

def test_score_boundaries_never_exceed_limits():
    """Checks that scoring logic never produces scores below 0 or above 100."""
    checks = [
        CheckResult(
            check_type=CheckType.RERA_STATUS,
            status=CheckStatus.PASSED,
            score_contribution=30,
            max_score=30,
            findings=["Active valid RERA registration."]
        ),
        CheckResult(
            check_type=CheckType.CLAIM_MATCH,
            status=CheckStatus.PASSED,
            score_contribution=20,
            max_score=20,
            findings=["Full claims match."]
        ),
        CheckResult(
            check_type=CheckType.COURT_SIGNALS,
            status=CheckStatus.PASSED,
            score_contribution=20,
            max_score=20,
            findings=["Zero litigation."]
        ),
        CheckResult(
            check_type=CheckType.PROMOTER_RECORD,
            status=CheckStatus.PASSED,
            score_contribution=10,
            max_score=10,
            findings=["Clean promoter track record."]
        ),
        CheckResult(
            check_type=CheckType.APPROVALS,
            status=CheckStatus.PASSED,
            score_contribution=10,
            max_score=10,
            findings=["All sanctions granted."]
        ),
        CheckResult(
            check_type=CheckType.REPUTATION,
            status=CheckStatus.PASSED,
            score_contribution=10,
            max_score=10,
            findings=["Positive sentiment."]
        ),
    ]
    breakdown = calculate_trust_score(checks)
    assert breakdown.total_score == 100
    assert breakdown.label == TrustLabel.HIGH_TRUST

@pytest.mark.asyncio
async def test_verification_graph_end_to_end():
    """Runs the VerificationGraph orchestrator on a demo property input and validates output contract."""
    progress_updates = []
    def track_progress(report_id, check):
        progress_updates.append((check.check_type.value, check.status.value))

    graph = VerificationGraph(progress_callback=track_progress)
    input_payload = PropertyInput(
        manual_details=ManualDetails(
            project_name="Sunshine Residency",
            rera_number="P52100012345"
        )
    )

    report = await graph.run("rpt_test_001", input_payload)

    assert report.report_id == "rpt_test_001"
    assert report.status == "completed"
    assert report.trust_score is not None
    assert report.trust_score >= 80
    assert len(report.checks) == 6
    assert len(progress_updates) >= 6
    assert report.summary.get("verdict") is not None
    assert len(report.summary.get("action_items", [])) > 0
