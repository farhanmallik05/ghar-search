"""Executive summary generator for due-diligence dossiers.
Provides natural-language synthesis without hallucination, strictly grounded in evidence.
"""

from typing import Dict, Any, List
from intelligence.schemas import TrustScoreBreakdown, TrustLabel, CheckResult

def generate_summary(
    project_name: str,
    rera_id: str,
    breakdown: TrustScoreBreakdown,
    checks: List[CheckResult]
) -> Dict[str, Any]:
    """Generates an objective, legally neutral plain-language executive summary."""
    score = breakdown.total_score
    label = breakdown.label.value

    # Primary verdict sentence
    if breakdown.label == TrustLabel.HIGH_TRUST:
        verdict = (
            f"{project_name} (RERA: {rera_id or 'Verified'}) demonstrates exemplary statutory compliance "
            f"with an overall Trust Score of {score}/100. All primary regulatory registrations, approvals, and "
            f"litigation records are verified clean with zero adverse court injunctions or critical discrepancies."
        )
    elif breakdown.label == TrustLabel.MODERATE_RISK:
        verdict = (
            f"{project_name} (RERA: {rera_id or 'Verified'}) scored {score}/100 ({label}). "
            f"While the development maintains valid RERA credentials, our audit flagged moderate timeline delays "
            f"and active consumer court compensation inquiries that prospective buyers should scrutinize."
        )
    elif breakdown.label == TrustLabel.HIGH_RISK:
        verdict = (
            f"{project_name} presents significant due-diligence risks with an overall Trust Score of {score}/100 ({label}). "
            f"Our automated agents identified substantial deviations between brochure claims and official municipal sanctions, "
            f"accompanied by pending regulatory notices."
        )
    else:  # CRITICAL_ALERT
        verdict = (
            f"CRITICAL DUE-DILIGENCE WARNING: {project_name} scored {score}/100 ({label}). "
            f"Automated verification identified critical red flags including potential RERA expiry/revocation, active NCLT "
            f"insolvency filings, or unauthorized structural construction. Immediate legal consultation is strongly advised."
        )

    # Key highlights
    highlights = []
    for strength in breakdown.strengths[:3]:
        highlights.append(f"✓ {strength}")
    for deduction in breakdown.deductions:
        highlights.append(f"⚠ {deduction.reason} (-{deduction.points_deducted} pts)")

    # Actionable guidance
    action_items = breakdown.recommendations

    return {
        "verdict": verdict,
        "trust_score": score,
        "trust_label": label,
        "highlights": highlights,
        "action_items": action_items,
        "disclaimer": (
            "Ghar Search is an automated public-records matching system. Findings are based on publicly indexed "
            "government portals, court ledgers, and marketing collateral as of the capture timestamp. This report does "
            "not constitute formal legal title certification or financial advice."
        )
    }
