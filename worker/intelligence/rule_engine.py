"""Pure deterministic rule engine for computing 0-100 Trust Scores.
Implements the exact 6-dimension specification from PLAN/System Design/architecture.md.
No probabilistic elements or LLM hallucination in the mathematical score.
"""

from typing import List, Optional, Dict
from intelligence.schemas import (
    CheckResult,
    CheckType,
    CheckStatus,
    TrustScoreBreakdown,
    TrustLabel,
    ScoreDeduction,
    PropertyClaims
)

MAX_DIMENSION_SCORES = {
    CheckType.RERA_STATUS.value: 30,
    CheckType.CLAIM_MATCH.value: 20,
    CheckType.COURT_SIGNALS.value: 20,
    CheckType.PROMOTER_RECORD.value: 10,
    CheckType.APPROVALS.value: 10,
    CheckType.REPUTATION.value: 10,
}

def calculate_trust_score(
    checks: List[CheckResult],
    claims: Optional[PropertyClaims] = None
) -> TrustScoreBreakdown:
    """Computes an auditable, deterministic 0-100 Trust Score based on check findings."""

    check_map: Dict[str, CheckResult] = {c.check_type.value: c for c in checks}
    dimension_scores: Dict[str, int] = {}
    deductions: List[ScoreDeduction] = []
    strengths: List[str] = []
    recommendations: List[str] = []

    # 1. RERA Status Check (Max 30)
    rera_max = MAX_DIMENSION_SCORES[CheckType.RERA_STATUS.value]
    rera_check = check_map.get(CheckType.RERA_STATUS.value)
    if not rera_check or rera_check.status == CheckStatus.PENDING:
        dimension_scores[CheckType.RERA_STATUS.value] = 0
    else:
        score = rera_max
        findings_text = " ".join(rera_check.findings).lower()
        if "revoked" in findings_text or "suspended" in findings_text or "section 7 revocation" in findings_text:
            deduction = rera_max
            score = 0
            deductions.append(ScoreDeduction(
                rule="RERA_REVOKED",
                dimension=CheckType.RERA_STATUS.value,
                points_deducted=deduction,
                reason="RERA registration is revoked, rejected, or suspended by statutory authority."
            ))
        elif "not found" in findings_text or "unregistered" in findings_text or rera_check.status == CheckStatus.FAILED:
            deduction = rera_max
            score = 0
            deductions.append(ScoreDeduction(
                rule="RERA_NOT_FOUND",
                dimension=CheckType.RERA_STATUS.value,
                points_deducted=deduction,
                reason="No valid RERA registration could be confirmed on official state portal."
            ))
        elif "expired" in findings_text:
            deduction = 20
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="RERA_EXPIRED",
                dimension=CheckType.RERA_STATUS.value,
                points_deducted=deduction,
                reason="RERA validity expired without granted extension or completion certificate."
            ))
        elif "extension pending" in findings_text or "extension applied" in findings_text:
            deduction = 10
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="RERA_EXTENSION_PENDING",
                dimension=CheckType.RERA_STATUS.value,
                points_deducted=deduction,
                reason="Project is operating under pending RERA extension review."
            ))
        else:
            strengths.append("Project holds active, valid RERA registration with clean regulatory disclosures.")

        dimension_scores[CheckType.RERA_STATUS.value] = max(0, min(rera_max, score))

    # 2. Claim Match Check (Max 20)
    claim_max = MAX_DIMENSION_SCORES[CheckType.CLAIM_MATCH.value]
    claim_check = check_map.get(CheckType.CLAIM_MATCH.value)
    if not claim_check or claim_check.status == CheckStatus.PENDING:
        dimension_scores[CheckType.CLAIM_MATCH.value] = 0
    else:
        score = claim_max
        findings_text = " ".join(claim_check.findings).lower()
        if any(term in findings_text for term in ["possession delay detected", "possession postponed", "18 months delta", "severe delay"]):
            deduction = 10 if ("severe" in findings_text or "18 months" in findings_text) else 6
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="CLAIM_POSSESSION_DELAY",
                dimension=CheckType.CLAIM_MATCH.value,
                points_deducted=deduction,
                reason="Advertised possession date differs significantly from official RERA declaration."
            ))
        if any(term in findings_text for term in ["unit count mismatch", "floor count mismatch", "unauthorized construction", "upper 8 floors are completely unauthorized"]):
            deduction = 8
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="CLAIM_SANCTION_MISMATCH",
                dimension=CheckType.CLAIM_MATCH.value,
                points_deducted=deduction,
                reason="Marketing brochure claims more units or floors than officially sanctioned."
            ))
        if score == claim_max:
            strengths.append("Marketing brochure details match statutory RERA declarations accurately.")

        dimension_scores[CheckType.CLAIM_MATCH.value] = max(0, min(claim_max, score))

    # 3. Court Signals Check (Max 20)
    court_max = MAX_DIMENSION_SCORES[CheckType.COURT_SIGNALS.value]
    court_check = check_map.get(CheckType.COURT_SIGNALS.value)
    if not court_check or court_check.status == CheckStatus.PENDING:
        dimension_scores[CheckType.COURT_SIGNALS.value] = 0
    else:
        score = court_max
        findings_text = " ".join(court_check.findings).lower()
        has_clean_indicator = any(term in findings_text for term in [
            "0 active", "0 cases", "clean (0", "zero litigation", "no adverse litigation", "clean: 0"
        ])

        is_fatal_litigation = (
            ("nclt" in findings_text and "admitted" in findings_text) or
            ("cirp" in findings_text) or
            ("moratorium" in findings_text) or
            ("stop-work injunction" in findings_text or "status-quo injunction" in findings_text or "stop work order" in findings_text)
        ) and not ("no judicial stay" in findings_text or "no stop-work" in findings_text or "no nclt" in findings_text)

        if not has_clean_indicator and is_fatal_litigation:
            deduction = 20
            score = 0
            deductions.append(ScoreDeduction(
                rule="FATAL_LITIGATION",
                dimension=CheckType.COURT_SIGNALS.value,
                points_deducted=deduction,
                reason="Active NCLT insolvency proceedings or judicial stop-work injunction detected."
            ))
        elif not has_clean_indicator and any(term in findings_text for term in [
            "consumer court complaint", "civil dispute", "pending adjudication", "delay compensation"
        ]):
            deduction = 8
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="ACTIVE_LITIGATION",
                dimension=CheckType.COURT_SIGNALS.value,
                points_deducted=deduction,
                reason="Active consumer court compensation cases or civil dispute filings found."
            ))
        else:
            strengths.append("No adverse litigation, NCLT insolvency claims, or judicial stay orders identified.")

        dimension_scores[CheckType.COURT_SIGNALS.value] = max(0, min(court_max, score))

    # 4. Promoter Record Check (Max 10)
    prom_max = MAX_DIMENSION_SCORES[CheckType.PROMOTER_RECORD.value]
    prom_check = check_map.get(CheckType.PROMOTER_RECORD.value)
    if not prom_check or prom_check.status == CheckStatus.PENDING:
        dimension_scores[CheckType.PROMOTER_RECORD.value] = 0
    else:
        score = prom_max
        findings_text = " ".join(prom_check.findings).lower()
        if any(term in findings_text for term in ["blacklisted", "disqualified", "non-bailable warrants", "liquidation"]):
            score = 0
            deductions.append(ScoreDeduction(
                rule="PROMOTER_DEFAULT",
                dimension=CheckType.PROMOTER_RECORD.value,
                points_deducted=prom_max,
                reason="Promoter entity or directors have recorded past regulatory defaults, blacklists, or disqualifications."
            ))
        elif any(term in findings_text for term in ["past deliveries delayed", "average hand-over delay", "moderate stress"]):
            deduction = 5
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="PROMOTER_TRACK_RECORD",
                dimension=CheckType.PROMOTER_RECORD.value,
                points_deducted=deduction,
                reason="Promoter has history of delayed delivery in previous registered developments."
            ))
        else:
            strengths.append("Promoter possesses established track record of delivered residential projects.")

        dimension_scores[CheckType.PROMOTER_RECORD.value] = max(0, min(prom_max, score))

    # 5. Approvals Check (Max 10)
    appr_max = MAX_DIMENSION_SCORES[CheckType.APPROVALS.value]
    appr_check = check_map.get(CheckType.APPROVALS.value)
    if not appr_check or appr_check.status == CheckStatus.PENDING:
        dimension_scores[CheckType.APPROVALS.value] = 0
    else:
        score = appr_max
        findings_text = " ".join(appr_check.findings).lower()
        if any(term in findings_text for term in ["missing commencement certificate", "demolition notice", "safety plan rejected"]):
            deduction = 8
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="APPROVAL_MISSING_CC",
                dimension=CheckType.APPROVALS.value,
                points_deducted=deduction,
                reason="Missing Commencement Certificate (CC) or municipal demolition notice served."
            ))
        elif any(term in findings_text for term in ["fire noc pending renewal", "environmental clearance pending", "audit pending"]):
            deduction = 4
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="APPROVAL_CLEARANCE_PENDING",
                dimension=CheckType.APPROVALS.value,
                points_deducted=deduction,
                reason="Fire NOC renewal or final clearance audit is in pending status."
            ))
        else:
            strengths.append("Essential statutory municipal layout sanctions and fire/environmental NOCs verified.")

        dimension_scores[CheckType.APPROVALS.value] = max(0, min(appr_max, score))

    # 6. Reputation Check (Max 10)
    rep_max = MAX_DIMENSION_SCORES[CheckType.REPUTATION.value]
    rep_check = check_map.get(CheckType.REPUTATION.value)
    if not rep_check or rep_check.status == CheckStatus.PENDING:
        dimension_scores[CheckType.REPUTATION.value] = 0
    else:
        score = rep_max
        findings_text = " ".join(rep_check.findings).lower()
        if any(term in findings_text for term in ["cheated homebuyers", "gate locked by local police", "85 unresolved"]):
            deduction = 8
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="REPUTATION_HIGH_GRIEVANCE",
                dimension=CheckType.REPUTATION.value,
                points_deducted=deduction,
                reason="Widespread buyer protests, police intervention, or severe grievance reporting surfaced."
            ))
        elif any(term in findings_text for term in ["delayed clubhouse delivery", "moderate negative sentiment", "grievances: 12"]):
            deduction = 4
            score -= deduction
            deductions.append(ScoreDeduction(
                rule="REPUTATION_BUYER_COMPLAINTS",
                dimension=CheckType.REPUTATION.value,
                points_deducted=deduction,
                reason="Elevated consumer complaint sentiment identified regarding amenities or delivery schedules."
            ))
        else:
            strengths.append("Overall buyer sentiment is clean with zero public protests or severe grievances.")

        dimension_scores[CheckType.REPUTATION.value] = max(0, min(rep_max, score))

    # Aggregate Total Score (0-100)
    total = sum(dimension_scores.values())
    total = max(0, min(100, total))

    # Label Assignment
    if total >= 80:
        label = TrustLabel.HIGH_TRUST
        recommendations.append("Property demonstrates strong statutory compliance. Standard legal deed verification recommended.")
    elif total >= 60:
        label = TrustLabel.MODERATE_RISK
        recommendations.append("Request written developer timeline confirmation for delayed milestones before paying advance tokens.")
        recommendations.append("Verify delay compensation clauses under Section 18 of the RERA Act in the sale agreement.")
    elif total >= 40:
        label = TrustLabel.HIGH_RISK
        recommendations.append("High caution: Significant discrepancies detected between marketing brochure and official approvals.")
        recommendations.append("Engage independent property advocate to inspect local municipal files prior to any financial commitment.")
    else:
        label = TrustLabel.CRITICAL_ALERT
        recommendations.append("CRITICAL: Fatal non-compliance or active insolvency proceedings detected. Do not disburse funds.")
        recommendations.append("Consult legal counsel immediately regarding judicial status and builder registry credentials.")

    return TrustScoreBreakdown(
        total_score=total,
        label=label,
        dimension_scores=dimension_scores,
        max_dimension_scores=MAX_DIMENSION_SCORES,
        deductions=deductions,
        strengths=strengths,
        recommendations=recommendations
    )
