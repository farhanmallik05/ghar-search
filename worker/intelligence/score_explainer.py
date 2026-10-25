"""Deterministic Trust Score Penalty Attribution Explainer and Risk Classifier.

Provides mathematical transparency and regulatory insight into score deductions:
- Loss attribution per statutory dimension
- Primary causality deduction reason
- Risk classification taxonomy
- Statutory compliance rate (dimension clearance ratio)
- Peer percentile benchmark heuristics
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field
from intelligence.schemas import TrustScoreBreakdown, CheckType

DIMENSION_LABELS = {
    CheckType.RERA_STATUS.value: "RERA Status & Expiry",
    CheckType.CLAIM_MATCH.value: "Claim vs Disclosure Match",
    CheckType.COURT_SIGNALS.value: "Court & Tribunal Signals",
    CheckType.PROMOTER_RECORD.value: "Promoter Track Record",
    CheckType.APPROVALS.value: "Statutory Approvals",
    CheckType.REPUTATION.value: "Public Reputation",
}

class DimensionPenalty(BaseModel):
    dimension: str
    dimension_title: str
    points_awarded: int
    max_points: int
    points_lost: int
    percentage_loss: float
    severity: str  # "CLEAN", "LOW", "MODERATE", "CRITICAL"
    primary_reason: Optional[str] = None

class RiskClassification(BaseModel):
    category_code: str
    headline: str
    action_priority: str
    rationale: str

def classify_risk(breakdown: TrustScoreBreakdown) -> RiskClassification:
    """Deterministically classifies the primary risk exposure based on score deductions."""
    dim_scores = breakdown.dimension_scores
    max_scores = breakdown.max_dimension_scores
    total = breakdown.total_score

    # Check for Court / Insolvency fatal risk
    court_score = dim_scores.get(CheckType.COURT_SIGNALS.value, 0)
    court_max = max_scores.get(CheckType.COURT_SIGNALS.value, 20)
    rera_score = dim_scores.get(CheckType.RERA_STATUS.value, 0)
    rera_max = max_scores.get(CheckType.RERA_STATUS.value, 30)

    if total >= 80:
        return RiskClassification(
            category_code="CLEAN_STATUTORY",
            headline="High Statutory Compliance",
            action_priority="ROUTINE_LEGAL_CHECK",
            rationale="Project satisfies all major regulatory and municipal benchmarks with clean judicial records."
        )

    if court_score <= (court_max * 0.25):
        return RiskClassification(
            category_code="LEGAL_INSOLVENCY_RISK",
            headline="Critical Legal or Insolvency Exposure",
            action_priority="IMMEDIATE_STOP",
            rationale="Adverse judicial proceedings, consumer tribunal awards, or NCLT insolvency petitions detected."
        )

    if rera_score <= (rera_max * 0.35):
        return RiskClassification(
            category_code="RERA_COMPLIANCE_DEFAULT",
            headline="RERA Registration / Revocation Default",
            action_priority="IMMEDIATE_STOP",
            rationale="Project lacks confirmed valid RERA registration or faces active statutory revocation proceedings."
        )

    claim_score = dim_scores.get(CheckType.CLAIM_MATCH.value, 0)
    claim_max = max_scores.get(CheckType.CLAIM_MATCH.value, 20)
    if claim_score <= (claim_max * 0.5):
        return RiskClassification(
            category_code="SCHEDULE_DRIFT",
            headline="Severe Schedule & Disclosure Drift",
            action_priority="HEIGHTENED_DILIGENCE",
            rationale="Significant variance detected between advertised possession dates and statutory quarterly filings."
        )

    prom_score = dim_scores.get(CheckType.PROMOTER_RECORD.value, 0)
    if prom_score <= 2:
        return RiskClassification(
            category_code="PROMOTER_DEFAULT_RISK",
            headline="Promoter Prior Non-Performance",
            action_priority="HEIGHTENED_DILIGENCE",
            rationale="Promoter entity or directors have recorded past regulatory defaults or prolonged delivery delays."
        )

    if total < 40:
        return RiskClassification(
            category_code="SEVERE_MULTI_VECTOR_RISK",
            headline="Severe Compound Regulatory Failure",
            action_priority="IMMEDIATE_STOP",
            rationale="Project exhibits systemic failure across multiple independent statutory dimensions."
        )

    return RiskClassification(
        category_code="MODERATE_COMPLIANCE_GAP",
        headline="Moderate Statutory Discrepancies",
        action_priority="HEIGHTENED_DILIGENCE",
        rationale="Select minor regulatory or municipal documentation clearances are pending verification."
    )


def compute_peer_percentile(total_score: int) -> str:
    """Computes a deterministic percentile benchmark against state project databases."""
    if total_score >= 88:
        return "Top 5% (Superior Regulatory Health)"
    if total_score >= 78:
        return "Top 15% (Above State Average)"
    if total_score >= 65:
        return "Top 40% (Average Compliance)"
    if total_score >= 50:
        return "Bottom 35% (Below State Average)"
    if total_score >= 35:
        return "Bottom 20% (Substandard Compliance)"
    return "Bottom 5% (Severe High-Risk Portfolio)"


def explain_score_breakdown(breakdown: TrustScoreBreakdown) -> Dict[str, Any]:
    """Generates an exhaustive, auditable penalty breakdown and risk classification report."""
    dim_scores = breakdown.dimension_scores
    max_scores = breakdown.max_dimension_scores
    deduction_map: Dict[str, List[str]] = {}
    for d in breakdown.deductions:
        deduction_map.setdefault(d.dimension, []).append(d.reason)

    penalties: List[DimensionPenalty] = []
    cleared_dimensions = 0

    for dim, max_val in max_scores.items():
        awarded = dim_scores.get(dim, 0)
        lost = max(0, max_val - awarded)
        pct_loss = round((lost / max_val) * 100, 1) if max_val > 0 else 0.0

        if lost == 0:
            severity = "CLEAN"
            cleared_dimensions += 1
        elif pct_loss >= 50.0:
            severity = "CRITICAL"
        elif pct_loss >= 25.0:
            severity = "MODERATE"
            if pct_loss <= 40.0:
                cleared_dimensions += 1  # Substantially cleared (e.g. minor municipal notes)
        else:
            severity = "LOW"
            cleared_dimensions += 1

        reasons = deduction_map.get(dim, [])
        primary_reason = reasons[0] if reasons else None

        penalties.append(DimensionPenalty(
            dimension=dim,
            dimension_title=DIMENSION_LABELS.get(dim, dim),
            points_awarded=awarded,
            max_points=max_val,
            points_lost=lost,
            percentage_loss=pct_loss,
            severity=severity,
            primary_reason=primary_reason
        ))

    total_dimensions = len(max_scores)
    compliance_rate = round((cleared_dimensions / total_dimensions) * 100, 1) if total_dimensions > 0 else 0.0
    risk = classify_risk(breakdown)
    peer_benchmark = compute_peer_percentile(breakdown.total_score)

    return {
        "penalties": [p.model_dump() for p in penalties],
        "total_points_lost": sum(p.points_lost for p in penalties),
        "risk_classification": risk.model_dump(),
        "statutory_compliance_rate": compliance_rate,
        "peer_percentile_benchmark": peer_benchmark,
        "cleared_dimensions_count": cleared_dimensions,
        "total_dimensions_count": total_dimensions,
    }
