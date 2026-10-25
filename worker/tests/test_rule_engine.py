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
    assert breakdown.total_score < 100
    assert 85 <= breakdown.total_score <= 98
    assert breakdown.label == TrustLabel.HIGH_TRUST
    assert breakdown.total_score == sum(breakdown.dimension_scores.values())

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

def test_strict_scoring_equality_invariant_all_fixtures():
    """Validates the core invariant across ALL canonical fixtures:
    trust_score == sum(dimension_scores) == sum(check_contributions)
    """
    for key, data in DEMO_PROPERTIES.items():
        checks = [c.model_copy() for c in data["checks"]]
        claims = data.get("claims")
        breakdown = calculate_trust_score(checks, claims)

        for c in checks:
            c.score_contribution = breakdown.dimension_scores.get(c.check_type.value, c.score_contribution)

        # Invariant 1: total_score strictly equals sum of all 6 dimension scores
        dimension_sum = sum(breakdown.dimension_scores.values())
        assert breakdown.total_score == dimension_sum, f"Fixture '{key}' total_score {breakdown.total_score} != dim sum {dimension_sum}"

        # Invariant 2: total_score strictly equals sum of check score contributions
        check_contrib_sum = sum(c.score_contribution for c in checks)
        assert breakdown.total_score == check_contrib_sum, f"Fixture '{key}' total_score {breakdown.total_score} != check sum {check_contrib_sum}"

        # Invariant 3: pairwise check contribution strictly equals corresponding dimension score
        for c in checks:
            assert c.score_contribution == breakdown.dimension_scores[c.check_type.value]

        # Invariant 4: total_score is bounded within statutory 0-100 range
        assert 0 <= breakdown.total_score <= 100

@pytest.mark.asyncio
async def test_strict_scoring_equality_invariant_dynamic_inputs():
    """Validates the strict scoring equality invariant on dynamically executed VerificationGraph reports."""
    graph = VerificationGraph()

    test_inputs = [
        PropertyInput(
            manual_details=ManualDetails(
                project_name="Green Valley Baner",
                rera_number="P52100088765",
                city="Pune",
                state="Maharashtra"
            )
        ),
        PropertyInput(
            manual_details=ManualDetails(
                project_name="Royal Empire Residency",
                rera_number="P52100099999",
                city="Mumbai",
                state="Maharashtra"
            )
        ),
        PropertyInput(
            property_url="https://www.99acres.com/godrej-serene-baner-pune-npxid-r12345"
        )
    ]

    for idx, inp in enumerate(test_inputs):
        report = await graph.run(f"rpt_dyn_invariant_{idx}", inp)
        assert report.status == "completed"

        dim_sum = sum(report.breakdown.dimension_scores.values())
        check_sum = sum(c.score_contribution for c in report.checks)

        assert report.trust_score == dim_sum, f"Dynamic input {idx}: trust_score {report.trust_score} != dim_sum {dim_sum}"
        assert report.trust_score == check_sum, f"Dynamic input {idx}: trust_score {report.trust_score} != check_sum {check_sum}"
        assert 0 <= report.trust_score <= 100

def test_scoring_math_synthetic_permutations():
    """Tests extreme edge cases: perfect scores, severe failure across all checks, and partial deductions."""
    # Scenario A: All checks failed with severe keywords
    failing_checks = [
        CheckResult(check_type=CheckType.RERA_STATUS, status=CheckStatus.FAILED, findings=["Deregistration Section 7 revocation"]),
        CheckResult(check_type=CheckType.CLAIM_MATCH, status=CheckStatus.FAILED, findings=["Possession delay 24 months exceeding statutory schedule"]),
        CheckResult(check_type=CheckType.COURT_SIGNALS, status=CheckStatus.FAILED, findings=["NCLT CIRP admitted against corporate debtor"]),
        CheckResult(check_type=CheckType.PROMOTER_RECORD, status=CheckStatus.FAILED, findings=["Director disqualified under MCA21 Section 164"]),
        CheckResult(check_type=CheckType.APPROVALS, status=CheckStatus.FAILED, findings=["Demolition notice issued by Municipal Corporation"]),
        CheckResult(check_type=CheckType.REPUTATION, status=CheckStatus.FAILED, findings=["FIR filed against promoter with public protests"])
    ]
    breakdown_fail = calculate_trust_score(failing_checks)
    for c in failing_checks:
        c.score_contribution = breakdown_fail.dimension_scores.get(c.check_type.value, c.score_contribution)
    assert breakdown_fail.total_score == sum(breakdown_fail.dimension_scores.values()) == sum(c.score_contribution for c in failing_checks)
    assert 0 <= breakdown_fail.total_score <= 100

    # Scenario B: All checks cleanly passed
    passing_checks = [
        CheckResult(check_type=CheckType.RERA_STATUS, status=CheckStatus.PASSED, findings=["Active valid registration"]),
        CheckResult(check_type=CheckType.CLAIM_MATCH, status=CheckStatus.PASSED, findings=["Claims match perfectly"]),
        CheckResult(check_type=CheckType.COURT_SIGNALS, status=CheckStatus.PASSED, findings=["Zero litigation found"]),
        CheckResult(check_type=CheckType.PROMOTER_RECORD, status=CheckStatus.PASSED, findings=["Clean promoter track record"]),
        CheckResult(check_type=CheckType.APPROVALS, status=CheckStatus.PASSED, findings=["All NOCs in place"]),
        CheckResult(check_type=CheckType.REPUTATION, status=CheckStatus.PASSED, findings=["Clean sentiment with zero protests"])
    ]
    breakdown_pass = calculate_trust_score(passing_checks)
    for c in passing_checks:
        c.score_contribution = breakdown_pass.dimension_scores.get(c.check_type.value, c.score_contribution)
    assert breakdown_pass.total_score == sum(breakdown_pass.dimension_scores.values()) == sum(c.score_contribution for c in passing_checks)
    assert breakdown_pass.total_score < 100
    assert 85 <= breakdown_pass.total_score <= 98

def test_failed_and_timeout_checks_zero_score_invariant():
    """Failed or timed out checks without findings must receive 0 points and never appear in strengths."""
    timeout_checks = [
        CheckResult(check_type=CheckType.RERA_STATUS, status=CheckStatus.TIMEOUT, findings=["Connection timed out to state portal"]),
        CheckResult(check_type=CheckType.CLAIM_MATCH, status=CheckStatus.FAILED, findings=[]),
        CheckResult(check_type=CheckType.COURT_SIGNALS, status=CheckStatus.TIMEOUT, findings=[]),
        CheckResult(check_type=CheckType.PROMOTER_RECORD, status=CheckStatus.FAILED, findings=["Connection error"]),
        CheckResult(check_type=CheckType.APPROVALS, status=CheckStatus.TIMEOUT, findings=[]),
        CheckResult(check_type=CheckType.REPUTATION, status=CheckStatus.FAILED, findings=[])
    ]
    breakdown = calculate_trust_score(timeout_checks)
    assert breakdown.total_score == 0
    assert all(score == 0 for score in breakdown.dimension_scores.values())
    assert len(breakdown.deductions) == 6
    assert len(breakdown.strengths) == 0


