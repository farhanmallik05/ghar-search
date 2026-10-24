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
    """Clean property should score precisely 92/100 in High Trust tier."""
    clean_fixture = DEMO_PROPERTIES["clean"]
    breakdown = calculate_trust_score(clean_fixture["checks"], clean_fixture["claims"])

    assert breakdown.total_score == 92
    assert breakdown.label == TrustLabel.HIGH_TRUST
    assert sum(c.score_contribution for c in clean_fixture["checks"]) == 92
    assert sum(breakdown.dimension_scores.values()) == 92
    assert breakdown.dimension_scores[CheckType.RERA_STATUS.value] == 30
    assert breakdown.dimension_scores[CheckType.CLAIM_MATCH.value] == 20
    assert breakdown.dimension_scores[CheckType.COURT_SIGNALS.value] == 20
    assert breakdown.dimension_scores[CheckType.PROMOTER_RECORD.value] == 10
    assert breakdown.dimension_scores[CheckType.APPROVALS.value] == 6
    assert breakdown.dimension_scores[CheckType.REPUTATION.value] == 6

def test_delayed_property_fixture_scoring():
    """Delayed property should score precisely 68/100 in Moderate Risk tier."""
    delayed_fixture = DEMO_PROPERTIES["delayed"]
    breakdown = calculate_trust_score(delayed_fixture["checks"], delayed_fixture["claims"])

    assert breakdown.total_score == 68
    assert breakdown.label == TrustLabel.MODERATE_RISK
    assert sum(c.score_contribution for c in delayed_fixture["checks"]) == 68
    assert sum(breakdown.dimension_scores.values()) == 68
    # Must flag possession delay
    delay_deductions = [d for d in breakdown.deductions if d.rule == "CLAIM_POSSESSION_DELAY"]
    assert len(delay_deductions) > 0
    assert delay_deductions[0].points_deducted == 10

def test_flagged_property_fixture_scoring():
    """Flagged property with NCLT / unauthorized floors must score precisely 18/100 in Critical Alert tier."""
    flagged_fixture = DEMO_PROPERTIES["flagged"]
    breakdown = calculate_trust_score(flagged_fixture["checks"], flagged_fixture["claims"])

    assert breakdown.total_score == 18
    assert breakdown.label == TrustLabel.CRITICAL_ALERT
    assert sum(c.score_contribution for c in flagged_fixture["checks"]) == 18
    assert sum(breakdown.dimension_scores.values()) == 18
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
    assert report.trust_score == 92
    assert sum(c.score_contribution for c in report.checks) == 92
    assert all(report.breakdown.dimension_scores[c.check_type.value] == c.score_contribution for c in report.checks)
    assert len(report.checks) == 6
    assert len(progress_updates) >= 6
    assert report.summary.get("verdict") is not None
    assert len(report.summary.get("action_items", [])) > 0

@pytest.mark.asyncio
async def test_verification_graph_live_url_extraction():
    """Verifies that non-fixture listing URLs are parsed cleanly into structured verification."""
    graph = VerificationGraph()
    input_payload = PropertyInput(
        property_url="https://housing.com/in/buy/projects/page/102938-godrej-woods-noida"
    )

    report = await graph.run("rpt_test_live_url", input_payload)
    assert report.status == "completed"
    assert report.property_details["project_name"] == "Godrej Woods"
    assert report.property_details["city"] == "Noida"
    assert report.trust_score == sum(c.score_contribution for c in report.checks)
    assert len(report.checks) == 6
