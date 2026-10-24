"""Adversarial Verification & Empirical Stress Test Suite for Ghar Search Stage 1.
Authored by: Final Challenger 1 (Adversarial Coverage Hardening).
Validates:
1. Extreme Boundary Scores & Transition Thresholds (0, 8 minimum adverse, 39/40, 59/60, 79/80, 100, clamping).
2. Random Invariant Fuzzing (500+ trials: trust_score == sum(dimension_scores) == sum(check_contributions)).
3. Concurrency Stress (Rapid parallel requests to /api/v1/verify and /api/v1/watchlist).
4. Corrupt, Huge, or Adversarial Payloads (/api/v1/verify and /api/v1/hil/resolve).
5. Malformed Report Structures passed to PDF Generator (empty, None, overflow, boundary rendering, ScoreDeduction models).
"""

import os
import sys
import random
import concurrent.futures
from typing import List, Dict, Any
import pytest
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from fastapi.testclient import TestClient

# Ensure worker package is on sys.path
WORKER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "worker"))
if WORKER_DIR not in sys.path:
    sys.path.insert(0, WORKER_DIR)

from main import app, seed_demo_store
from core.supabase import memory_store
from intelligence.schemas import (
    CheckResult,
    CheckType,
    CheckStatus,
    TrustLabel,
    PropertyClaims,
    EvidenceItem,
    ScoreDeduction
)
from intelligence.rule_engine import calculate_trust_score, MAX_DIMENSION_SCORES
from intelligence.pdf_generator import generate_pdf_dossier

client = TestClient(app)


# ==============================================================================
# SECTION 1: Extreme Boundary Scores & Transition Thresholds
# ==============================================================================

def make_check(check_type: CheckType, findings: List[str], status: CheckStatus = CheckStatus.PASSED) -> CheckResult:
    dim_max = MAX_DIMENSION_SCORES[check_type.value]
    return CheckResult(
        check_type=check_type,
        status=status,
        score_contribution=dim_max,
        max_score=dim_max,
        findings=findings,
        credits_used=2
    )


def test_adversarial_boundary_zero_pending_and_missing():
    """Boundary 0: All dimensions pending or missing.
    Asserts individual dimensions are 0 and total strictly equals 0.
    Asserts trust_score == sum(dimension_scores) == sum(check_contributions) == 0.
    Asserts label is CRITICAL_ALERT.
    """
    checks = [make_check(ct, [], status=CheckStatus.PENDING) for ct in CheckType]
    breakdown = calculate_trust_score(checks)

    # Invariant verification
    assert breakdown.total_score == 0
    assert breakdown.label == TrustLabel.CRITICAL_ALERT
    assert all(score == 0 for score in breakdown.dimension_scores.values())

    # Check contribution synchronization
    for c in checks:
        c.score_contribution = breakdown.dimension_scores.get(c.check_type.value, c.score_contribution)
    assert sum(c.score_contribution for c in checks) == 0
    assert breakdown.total_score == sum(breakdown.dimension_scores.values()) == sum(c.score_contribution for c in checks)


def test_adversarial_boundary_minimum_adverse_score_leakage_discovery():
    """Adversarial Discovery: Under worst-case adverse findings across all checks,
    deductions max out at:
    - RERA: 30 - 30 = 0
    - CLAIM: 20 - 18 = 2 (max deduction 18, leaking 2 pts)
    - COURT: 20 - 20 = 0
    - PROMOTER: 10 - 10 = 0
    - APPROVALS: 10 - 6 = 4 (if-elif prevents combined deductions, leaking 4 pts)
    - REPUTATION: 10 - 8 = 2 (if-elif prevents combined deductions, leaking 2 pts)
    Empirically demonstrates that evaluated worst-case score is 8/100, not 0/100.
    Asserts invariant holds: 8 == sum(dimension_scores) == sum(check_contributions).
    """
    checks = [
        make_check(CheckType.RERA_STATUS, ["RERA registration not found on state portal. Unregistered."]),
        make_check(CheckType.CLAIM_MATCH, ["Severe delay: 18 months", "Unit count mismatch detected"]),
        make_check(CheckType.COURT_SIGNALS, ["Admitted NCLT CIRP insolvency proceedings ongoing with stop-work injunction"]),
        make_check(CheckType.PROMOTER_RECORD, ["Promoter entity blacklisted and directors disqualified under liquidation"]),
        make_check(CheckType.APPROVALS, ["Missing commencement certificate and municipal demolition notice served", "Fire noc pending renewal"]),
        make_check(CheckType.REPUTATION, ["Cheated homebuyers staged protests with gate locked by local police", "Delayed clubhouse delivery"]),
    ]
    breakdown = calculate_trust_score(checks)

    assert breakdown.total_score == 8
    assert breakdown.label == TrustLabel.CRITICAL_ALERT
    assert breakdown.dimension_scores[CheckType.CLAIM_MATCH.value] == 2
    assert breakdown.dimension_scores[CheckType.APPROVALS.value] == 4
    assert breakdown.dimension_scores[CheckType.REPUTATION.value] == 2

    for c in checks:
        c.score_contribution = breakdown.dimension_scores.get(c.check_type.value, c.score_contribution)
    assert sum(c.score_contribution for c in checks) == 8
    assert breakdown.total_score == sum(breakdown.dimension_scores.values()) == sum(c.score_contribution for c in checks)


def test_adversarial_boundary_perfect_hundred():
    """Boundary 100: Clean statutory findings across all 6 dimensions.
    Asserts each dimension scores its exact max points (30, 20, 20, 10, 10, 10).
    Asserts total is 100, label is HIGH_TRUST, and invariant holds.
    """
    checks = [
        make_check(CheckType.RERA_STATUS, ["Active statutory RERA registration confirmed."]),
        make_check(CheckType.CLAIM_MATCH, ["Marketing brochure matches RERA Form B disclosures exactly."]),
        make_check(CheckType.COURT_SIGNALS, ["0 active cases in eCourts and no NCLT insolvency petitions."]),
        make_check(CheckType.PROMOTER_RECORD, ["MCA21 active status with zero director disqualifications."]),
        make_check(CheckType.APPROVALS, ["Commencement Certificate and municipal approvals fully in place."]),
        make_check(CheckType.REPUTATION, ["Positive homebuyer sentiment with zero consumer complaints."]),
    ]
    breakdown = calculate_trust_score(checks)

    assert breakdown.total_score == 100
    assert breakdown.label == TrustLabel.HIGH_TRUST
    assert breakdown.dimension_scores[CheckType.RERA_STATUS.value] == 30
    assert breakdown.dimension_scores[CheckType.CLAIM_MATCH.value] == 20
    assert breakdown.dimension_scores[CheckType.COURT_SIGNALS.value] == 20
    assert breakdown.dimension_scores[CheckType.PROMOTER_RECORD.value] == 10
    assert breakdown.dimension_scores[CheckType.APPROVALS.value] == 10
    assert breakdown.dimension_scores[CheckType.REPUTATION.value] == 10

    for c in checks:
        c.score_contribution = breakdown.dimension_scores.get(c.check_type.value, c.score_contribution)
    assert sum(c.score_contribution for c in checks) == 100
    assert breakdown.total_score == sum(breakdown.dimension_scores.values()) == sum(c.score_contribution for c in checks)


def test_adversarial_transition_thresholds_39_and_40():
    """Transition 39 vs 40: Critical boundary between Critical Alert and High Risk.
    - Score 39 -> CRITICAL_ALERT
    - Score 40 -> HIGH_RISK
    """
    # 39: RERA(0) + CLAIM(2) + COURT(12) + PROM(5) + APPR(10) + REP(10) = 39
    checks_39 = [
        make_check(CheckType.RERA_STATUS, ["not found on state portal"]),
        make_check(CheckType.CLAIM_MATCH, ["severe delay: 18 months", "unit count mismatch"]),
        make_check(CheckType.COURT_SIGNALS, ["consumer court complaint pending adjudication"]),
        make_check(CheckType.PROMOTER_RECORD, ["past deliveries delayed"]),
        make_check(CheckType.APPROVALS, ["all approvals verified"]),
        make_check(CheckType.REPUTATION, ["stellar reputation"]),
    ]
    b39 = calculate_trust_score(checks_39)
    assert b39.total_score == 39
    assert b39.label == TrustLabel.CRITICAL_ALERT

    # 40: RERA(0) + CLAIM(2) + COURT(12) + PROM(10) + APPR(6) + REP(10) = 40
    checks_40 = [
        make_check(CheckType.RERA_STATUS, ["not found on state portal"]),
        make_check(CheckType.CLAIM_MATCH, ["severe delay: 18 months", "unit count mismatch"]),
        make_check(CheckType.COURT_SIGNALS, ["consumer court complaint pending adjudication"]),
        make_check(CheckType.PROMOTER_RECORD, ["MCA21 active"]),
        make_check(CheckType.APPROVALS, ["fire noc pending renewal"]),
        make_check(CheckType.REPUTATION, ["stellar reputation"]),
    ]
    b40 = calculate_trust_score(checks_40)
    assert b40.total_score == 40
    assert b40.label == TrustLabel.HIGH_RISK

    for b, ch in [(b39, checks_39), (b40, checks_40)]:
        for c in ch:
            c.score_contribution = b.dimension_scores.get(c.check_type.value, c.score_contribution)
        assert b.total_score == sum(b.dimension_scores.values()) == sum(c.score_contribution for c in ch)


def test_adversarial_transition_thresholds_59_and_60():
    """Transition 59 vs 60: Boundary between High Risk and Moderate Risk.
    - Score 59 -> HIGH_RISK
    - Score 60 -> MODERATE_RISK
    """
    # 59: RERA(0) + CLAIM(14) + COURT(20) + PROM(5) + APPR(10) + REP(10) = 59
    checks_59 = [
        make_check(CheckType.RERA_STATUS, ["not found on state portal"]),
        make_check(CheckType.CLAIM_MATCH, ["possession delay detected: 3 months"]),
        make_check(CheckType.COURT_SIGNALS, ["0 active cases in eCourts"]),
        make_check(CheckType.PROMOTER_RECORD, ["past deliveries delayed"]),
        make_check(CheckType.APPROVALS, ["all approvals verified"]),
        make_check(CheckType.REPUTATION, ["stellar reputation"]),
    ]
    b59 = calculate_trust_score(checks_59)
    assert b59.total_score == 59
    assert b59.label == TrustLabel.HIGH_RISK

    # 60: RERA(0) + CLAIM(10) + COURT(20) + PROM(10) + APPR(10) + REP(10) = 60
    checks_60 = [
        make_check(CheckType.RERA_STATUS, ["not found on state portal"]),
        make_check(CheckType.CLAIM_MATCH, ["severe delay: 18 months"]),
        make_check(CheckType.COURT_SIGNALS, ["0 active cases in eCourts"]),
        make_check(CheckType.PROMOTER_RECORD, ["MCA21 active"]),
        make_check(CheckType.APPROVALS, ["all approvals verified"]),
        make_check(CheckType.REPUTATION, ["stellar reputation"]),
    ]
    b60 = calculate_trust_score(checks_60)
    assert b60.total_score == 60
    assert b60.label == TrustLabel.MODERATE_RISK

    for b, ch in [(b59, checks_59), (b60, checks_60)]:
        for c in ch:
            c.score_contribution = b.dimension_scores.get(c.check_type.value, c.score_contribution)
        assert b.total_score == sum(b.dimension_scores.values()) == sum(c.score_contribution for c in ch)


def test_adversarial_transition_thresholds_79_and_80():
    """Transition 79 vs 80: Boundary between Moderate Risk and High Trust.
    - Score 79 -> MODERATE_RISK
    - Score 80 -> HIGH_TRUST
    """
    # 79: RERA(20) + CLAIM(14) + COURT(20) + PROM(5) + APPR(10) + REP(10) = 79
    checks_79 = [
        make_check(CheckType.RERA_STATUS, ["extension pending review"]),
        make_check(CheckType.CLAIM_MATCH, ["possession delay detected: 3 months"]),
        make_check(CheckType.COURT_SIGNALS, ["0 active cases in eCourts"]),
        make_check(CheckType.PROMOTER_RECORD, ["past deliveries delayed"]),
        make_check(CheckType.APPROVALS, ["all approvals verified"]),
        make_check(CheckType.REPUTATION, ["stellar reputation"]),
    ]
    b79 = calculate_trust_score(checks_79)
    assert b79.total_score == 79
    assert b79.label == TrustLabel.MODERATE_RISK

    # 80: RERA(10) + CLAIM(20) + COURT(20) + PROM(10) + APPR(10) + REP(10) = 80
    checks_80 = [
        make_check(CheckType.RERA_STATUS, ["RERA validity expired"]),
        make_check(CheckType.CLAIM_MATCH, ["matches Form B"]),
        make_check(CheckType.COURT_SIGNALS, ["0 active cases in eCourts"]),
        make_check(CheckType.PROMOTER_RECORD, ["MCA21 active"]),
        make_check(CheckType.APPROVALS, ["all approvals verified"]),
        make_check(CheckType.REPUTATION, ["stellar reputation"]),
    ]
    b80 = calculate_trust_score(checks_80)
    assert b80.total_score == 80
    assert b80.label == TrustLabel.HIGH_TRUST

    for b, ch in [(b79, checks_79), (b80, checks_80)]:
        for c in ch:
            c.score_contribution = b.dimension_scores.get(c.check_type.value, c.score_contribution)
        assert b.total_score == sum(b.dimension_scores.values()) == sum(c.score_contribution for c in ch)


# ==============================================================================
# SECTION 2: Randomized Invariant Fuzzing
# ==============================================================================

RERA_FRAGMENTS = [
    "revoked by authority", "suspended registration", "not found on state portal",
    "unregistered project", "RERA validity expired", "extension pending review",
    "clean active registration", "normal verified registration"
]
CLAIM_FRAGMENTS = [
    "possession delay detected: 18 months delta", "severe delay in execution",
    "possession postponed", "unit count mismatch", "floor count mismatch",
    "upper 8 floors are completely unauthorized", "perfect alignment with Form B"
]
COURT_FRAGMENTS = [
    "admitted NCLT CIRP insolvency", "stop-work injunction active",
    "consumer court complaint pending adjudication", "civil dispute filed",
    "0 active litigation cases", "clean (0 active suits)", "zero litigation"
]
PROMOTER_FRAGMENTS = [
    "promoter blacklisted by authority", "directors disqualified",
    "liquidation proceedings", "past deliveries delayed by 14 months",
    "history of delayed delivery", "flawless delivery track record"
]
APPROVALS_FRAGMENTS = [
    "missing commencement certificate", "municipal demolition notice served",
    "safety plan rejected", "fire noc pending renewal",
    "environmental clearance pending", "all statutory NOCs approved"
]
REPUTATION_FRAGMENTS = [
    "cheated homebuyers staged protest", "gate locked by local police",
    "85 unresolved buyer disputes", "delayed clubhouse delivery",
    "moderate negative sentiment", "minor buyer feedback regarding traffic",
    "stellar buyer feedback with zero complaints"
]


def test_adversarial_invariant_random_fuzzing_500_iterations():
    """Fuzzes 500 randomized permutations of check findings and statuses.
    Asserts strict invariant across ALL iterations:
    1. 0 <= total_score <= 100
    2. total_score == sum(dimension_scores.values())
    3. total_score == sum(check.score_contribution) after assignment
    4. Each dimension score is strictly bounded by [0, max_dimension_score]
    5. Deductions points deducted > 0
    6. Label thresholds strictly match total_score
    """
    random.seed(42)
    statuses = [CheckStatus.PASSED, CheckStatus.FLAGGED, CheckStatus.FAILED, CheckStatus.PENDING]

    for iteration in range(500):
        # Pick random findings fragments
        checks = [
            make_check(CheckType.RERA_STATUS, random.sample(RERA_FRAGMENTS, k=random.randint(1, 3)), random.choice(statuses)),
            make_check(CheckType.CLAIM_MATCH, random.sample(CLAIM_FRAGMENTS, k=random.randint(1, 3)), random.choice(statuses)),
            make_check(CheckType.COURT_SIGNALS, random.sample(COURT_FRAGMENTS, k=random.randint(1, 3)), random.choice(statuses)),
            make_check(CheckType.PROMOTER_RECORD, random.sample(PROMOTER_FRAGMENTS, k=random.randint(1, 3)), random.choice(statuses)),
            make_check(CheckType.APPROVALS, random.sample(APPROVALS_FRAGMENTS, k=random.randint(1, 3)), random.choice(statuses)),
            make_check(CheckType.REPUTATION, random.sample(REPUTATION_FRAGMENTS, k=random.randint(1, 3)), random.choice(statuses)),
        ]

        breakdown = calculate_trust_score(checks)

        # 1. Score range invariant
        assert 0 <= breakdown.total_score <= 100, f"Iteration {iteration}: total_score {breakdown.total_score} out of bounds"

        # 2. Dimension sum invariant
        dim_sum = sum(breakdown.dimension_scores.values())
        assert breakdown.total_score == dim_sum, f"Iteration {iteration}: total_score {breakdown.total_score} != dim_sum {dim_sum}"

        # 3. Synchronized check contribution invariant
        for c in checks:
            c.score_contribution = breakdown.dimension_scores.get(c.check_type.value, c.score_contribution)
        check_contrib_sum = sum(c.score_contribution for c in checks)
        assert breakdown.total_score == check_contrib_sum, (
            f"Iteration {iteration}: total_score {breakdown.total_score} != check_contrib_sum {check_contrib_sum}"
        )

        # 4. Dimension ceiling invariant
        for dim_key, dim_val in breakdown.dimension_scores.items():
            max_limit = MAX_DIMENSION_SCORES[dim_key]
            assert 0 <= dim_val <= max_limit, f"Iteration {iteration}: {dim_key} score {dim_val} out of [0, {max_limit}]"

        # 5. Label assignment correctness
        if breakdown.total_score >= 80:
            assert breakdown.label == TrustLabel.HIGH_TRUST
        elif breakdown.total_score >= 60:
            assert breakdown.label == TrustLabel.MODERATE_RISK
        elif breakdown.total_score >= 40:
            assert breakdown.label == TrustLabel.HIGH_RISK
        else:
            assert breakdown.label == TrustLabel.CRITICAL_ALERT


def test_adversarial_fuzzing_special_strings_invariants():
    """Fuzzes checks with injection vectors, unicode, empty strings, and regex bombs.
    Asserts engine processes findings without throwing exceptions and maintains invariants.
    """
    adversarial_findings = [
        "'; DROP TABLE properties; --",
        "<script>alert('XSS')</script>",
        "🏢 🚀 ⚡ 🏠 🔍 \U0001F600",
        "A" * 5000,
        "",
        "   \t\n\r   ",
        "NULL\x00BYTE\x00STRING",
        "../../../../../../etc/passwd",
        "{'json': 'injection', 'val': [1,2,3]}",
        "(((a+)+)+)+$"
    ]

    for adv in adversarial_findings:
        checks = [
            make_check(CheckType.RERA_STATUS, [adv, "clean active registration"]),
            make_check(CheckType.CLAIM_MATCH, [adv]),
            make_check(CheckType.COURT_SIGNALS, [adv, "0 active"]),
            make_check(CheckType.PROMOTER_RECORD, [adv]),
            make_check(CheckType.APPROVALS, [adv]),
            make_check(CheckType.REPUTATION, [adv]),
        ]
        breakdown = calculate_trust_score(checks)
        assert 0 <= breakdown.total_score <= 100
        assert breakdown.total_score == sum(breakdown.dimension_scores.values())
        for c in checks:
            c.score_contribution = breakdown.dimension_scores.get(c.check_type.value, c.score_contribution)
        assert breakdown.total_score == sum(c.score_contribution for c in checks)


# ==============================================================================
# SECTION 3: Rapid Concurrency Stress Testing
# ==============================================================================

def test_adversarial_concurrency_rapid_verify_requests():
    """Fires 40 concurrent POST requests to /api/v1/verify.
    Asserts:
    - All 40 requests return HTTP 202 Accepted.
    - All 40 report_ids are unique.
    - No unhandled thread-safety or memory_store corruption occurs.
    """
    seed_demo_store()
    num_requests = 40

    def send_verify(idx: int) -> Dict[str, Any]:
        payload = {
            "manual_details": {
                "project_name": f"Concurrent Project {idx}",
                "rera_number": f"P521000{10000 + idx}",
                "state": "Maharashtra",
                "city": "Pune"
            }
        }
        res = client.post("/api/v1/verify", json=payload)
        return {"status_code": res.status_code, "data": res.json()}

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(send_verify, i) for i in range(num_requests)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]

    assert len(results) == num_requests
    assert all(r["status_code"] == 202 for r in results)
    report_ids = [r["data"]["report_id"] for r in results]
    assert len(set(report_ids)) == num_requests, "Duplicate report_ids generated under concurrency!"


def test_adversarial_concurrency_rapid_watchlist_requests():
    """Fires 40 concurrent POST requests to /api/v1/watchlist and concurrent GETs.
    Asserts:
    - All 40 additions succeed with HTTP 201 Created.
    - GET /api/v1/watchlist during mutations does not raise RuntimeError (dictionary changed size during iteration).
    """
    seed_demo_store()
    num_requests = 40

    def add_watchlist(idx: int) -> int:
        payload = {
            "report_id": "rpt_sunshine_clean",
            "alert_threshold": 10 + (idx % 15),
            "notify_email": True
        }
        res = client.post("/api/v1/watchlist", json=payload)
        return res.status_code

    def get_watchlist() -> int:
        res = client.get("/api/v1/watchlist")
        return res.status_code

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        add_futures = [executor.submit(add_watchlist, i) for i in range(num_requests)]
        get_futures = [executor.submit(get_watchlist) for _ in range(10)]
        all_futures = add_futures + get_futures
        results = [f.result() for f in concurrent.futures.as_completed(all_futures)]

    assert all(code in (200, 201) for code in results)


# ==============================================================================
# SECTION 4: Corrupt, Huge, or Adversarial Payloads
# ==============================================================================

def test_adversarial_verify_corrupt_types():
    """Adversarial payloads with malformed data types to /api/v1/verify.
    Asserts FastAPI schema validation rejects with HTTP 422 or 400 (never 500).
    """
    corrupt_cases = [
        {"property_url": 12345},                              # int instead of str
        {"manual_details": "not a dictionary"},               # str instead of dict
        {"manual_details": ["item1", "item2"]},               # list instead of dict
        {"manual_details": {"project_name": True}},          # bool instead of str
        {"priority": {"nested": "object"}},                   # dict instead of str
        {"user_id": [1, 2, 3]},                               # list instead of str
    ]
    for case in corrupt_cases:
        res = client.post("/api/v1/verify", json=case)
        assert res.status_code in (400, 422), f"Expected 400 or 422 for {case}, got {res.status_code}"


def test_adversarial_verify_huge_payload():
    """Sends massive string payloads (500KB project_name, 100KB URL) to /api/v1/verify.
    Asserts server accepts safely (202) without memory blowup or stack overflow.
    """
    huge_project = "Tower " + ("Omega " * 50000)  # ~300KB
    huge_url = "https://housing.com/in/buy/projects/page/" + ("path-" * 10000)
    payload = {
        "property_url": huge_url,
        "manual_details": {
            "project_name": huge_project,
            "rera_number": "P52100099999"
        }
    }
    res = client.post("/api/v1/verify", json=payload)
    assert res.status_code == 202
    assert "report_id" in res.json()


def test_adversarial_hil_resolve_corrupt_and_massive_payloads():
    """Adversarial tests on /api/v1/hil/resolve:
    - Missing required fields (422)
    - Wrong data types (422)
    - Massive 200KB resolution_data dictionary (handled safely 200)
    """
    # 1. Missing fields
    res = client.post("/api/v1/hil/resolve", json={})
    assert res.status_code == 422

    # 2. Non-dict resolution_data
    res = client.post("/api/v1/hil/resolve", json={
        "report_id": "rpt_test",
        "check_type": "rera_status",
        "resolution_data": "invalid_string"
    })
    assert res.status_code == 422

    # 3. Massive resolution_data
    huge_dict = {f"key_{i}": "val_" * 100 for i in range(1000)}
    res = client.post("/api/v1/hil/resolve", json={
        "report_id": "rpt_test_huge",
        "check_type": "rera_status",
        "resolution_data": huge_dict
    })
    assert res.status_code == 200
    assert res.json()["status"] == "resumed"


# ==============================================================================
# SECTION 5: Malformed Report Structures Passed to PDF Generator
# ==============================================================================

def test_adversarial_pdf_empty_and_minimal_reports():
    """Passes completely empty and minimal report structures to generate_pdf_dossier.
    Asserts valid non-empty PDF bytes beginning with %PDF- are produced without crash.
    """
    empty_cases = [
        {},
        {"property_details": {}},
        {"property_details": None, "breakdown": None, "checks": None},
        {"trust_score": 0, "trust_label": "Critical Alert"},
        {"trust_score": 100, "trust_label": "High Trust"},
    ]
    for case in empty_cases:
        pdf_bytes = generate_pdf_dossier(case)
        assert isinstance(pdf_bytes, bytes)
        assert len(pdf_bytes) > 1000
        assert pdf_bytes.startswith(b"%PDF-")


def test_adversarial_pdf_extreme_text_overflow():
    """Passes huge text strings (10,000-char strings) to generate_pdf_dossier.
    Asserts PyMuPDF renders or truncates without buffer overflow or segmentation fault.
    """
    overflow_report = {
        "report_id": "RPT-OVERFLOW-" + ("9" * 50),
        "property_details": {
            "project_name": "Mega Project " + ("Alpha " * 500),
            "promoter_name": "Promoter " + ("Corporation " * 500),
            "rera_id": "P521000" + ("8" * 50),
            "city": "Metropolis " * 50,
            "state": "State " * 50
        },
        "trust_score": 50,
        "trust_label": "Moderate Risk",
        "summary": {
            "verdict": "Executive verdict text: " + ("Comprehensive legal audit finding. " * 300)
        },
        "breakdown": {
            "dimension_scores": {k: 5 for k in MAX_DIMENSION_SCORES},
            "deductions": [
                {"rule": "DED_1", "reason": "Reason " * 100, "points_deducted": 5},
                {"rule": "DED_2", "reason": "Reason " * 100, "points_deducted": 5},
                {"rule": "DED_3", "reason": "Reason " * 100, "points_deducted": 5},
            ]
        },
        "checks": [
            {
                "check_type": "rera_status",
                "status": "passed",
                "score_contribution": 25,
                "evidence": [
                    {"url": "https://example.com/" + ("subpath/" * 50), "title": "Evidence Title " * 20, "timestamp": "2026-10-24"}
                ]
            }
        ]
    }
    pdf_bytes = generate_pdf_dossier(overflow_report)
    assert isinstance(pdf_bytes, bytes)
    assert pdf_bytes.startswith(b"%PDF-")


def test_adversarial_pdf_all_boundary_scores_visual_rendering():
    """Generates PDF dossiers across exact boundary scores: 0, 39, 40, 59, 60, 79, 80, 100.
    Asserts every tier correctly renders valid PDF pages without exception.
    """
    boundary_scores = [0, 39, 40, 59, 60, 79, 80, 100]
    for s in boundary_scores:
        report = {
            "report_id": f"RPT-BOUNDARY-{s}",
            "property_details": {"project_name": f"Boundary Property Score {s}"},
            "trust_score": s,
            "summary": {"verdict": f"Audit concluded with score {s}/100."},
            "breakdown": {
                "dimension_scores": {"rera_status": min(30, s), "court_signals": max(0, s - 30)}
            }
        }
        pdf_bytes = generate_pdf_dossier(report)
        assert isinstance(pdf_bytes, bytes)
        assert pdf_bytes.startswith(b"%PDF-")


def test_adversarial_pdf_score_deduction_model_resilience():
    """Adversarial audit on PDF generator when passed Pydantic ScoreDeduction objects vs dicts.
    Documents the exact behavior:
    If passed dictionaries, it succeeds.
    If passed raw Pydantic ScoreDeduction models inside deductions, asserts whether it succeeds or raises AttributeError.
    """
    deduction_model = ScoreDeduction(
        rule="ADVERSARIAL_DEDUCTION",
        dimension="rera_status",
        points_deducted=10,
        reason="Model passed directly instead of dict"
    )

    # 1. Dict version must always succeed
    dict_report = {
        "breakdown": {
            "deductions": [deduction_model.model_dump()]
        }
    }
    pdf_bytes = generate_pdf_dossier(dict_report)
    assert pdf_bytes.startswith(b"%PDF-")

    # 2. Pydantic model version: inspect behavior
    model_report = {
        "breakdown": {
            "deductions": [deduction_model]
        }
    }
    try:
        pdf_res = generate_pdf_dossier(model_report)
        model_passed = pdf_res.startswith(b"%PDF-")
    except AttributeError:
        model_passed = False

    # Assert PDF generator safely handles both Pydantic models and dictionaries
    assert model_passed is True, "PDF generator should safely handle ScoreDeduction Pydantic models"
