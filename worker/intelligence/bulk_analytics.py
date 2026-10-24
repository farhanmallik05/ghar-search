"""Portfolio Risk Analytics and Institutional Underwriting Batch Engine.

Computes portfolio-level risk metrics, statistical score distributions,
common failure mode attributions, and banking CSV export manifests for B2B batches.
"""

import io
import csv
import statistics
from typing import Dict, Any, List, Optional

def compute_bulk_analytics(batch: Dict[str, Any], memory_store: Any) -> Dict[str, Any]:
    """Calculates mathematical risk metrics across an underwriting batch."""
    reports_info = batch.get("reports", [])
    total_assets = len(reports_info)

    completed_scores: List[int] = []
    failed_count = 0
    pending_count = 0

    risk_counts = {
        "high_trust_count": 0,    # >= 80
        "moderate_risk_count": 0, # 60 - 79
        "high_risk_count": 0,     # 40 - 59
        "critical_alert_count": 0 # < 40
    }

    dimension_accum: Dict[str, List[int]] = {
        "rera_status": [],
        "claim_match": [],
        "court_signals": [],
        "promoter_record": [],
        "approvals": [],
        "reputation": []
    }

    deduction_counts: Dict[str, int] = {}
    deduction_reasons: Dict[str, str] = {}

    for r in reports_info:
        rep_id = r.get("report_id")
        stored = memory_store.reports.get(rep_id) if hasattr(memory_store, "reports") else None

        if not stored:
            pending_count += 1
            continue

        st = stored.get("status", "queued")
        if st == "failed":
            failed_count += 1
            continue
        elif st != "completed":
            pending_count += 1
            continue

        score = stored.get("trust_score")
        if score is not None:
            completed_scores.append(score)
            if score >= 80:
                risk_counts["high_trust_count"] += 1
            elif score >= 60:
                risk_counts["moderate_risk_count"] += 1
            elif score >= 40:
                risk_counts["high_risk_count"] += 1
            else:
                risk_counts["critical_alert_count"] += 1

        # Check dimension scores
        breakdown = stored.get("breakdown")
        if breakdown:
            dim_scores = breakdown.dimension_scores if hasattr(breakdown, "dimension_scores") else breakdown.get("dimension_scores", {})
            for dim, val in dim_scores.items():
                if dim in dimension_accum:
                    dimension_accum[dim].append(val)

            # Deductions
            deductions = breakdown.deductions if hasattr(breakdown, "deductions") else breakdown.get("deductions", [])
            for d in deductions:
                rule = d.rule if hasattr(d, "rule") else d.get("rule", "UNKNOWN")
                reason = d.reason if hasattr(d, "reason") else d.get("reason", "")
                deduction_counts[rule] = deduction_counts.get(rule, 0) + 1
                deduction_reasons[rule] = reason

    completed_count = len(completed_scores)
    mean_score = round(statistics.mean(completed_scores), 2) if completed_scores else None
    median_score = round(statistics.median(completed_scores), 2) if completed_scores else None

    # Compute average dimension scores
    avg_dimensions = {
        dim: round(statistics.mean(vals), 2) if vals else 0.0
        for dim, vals in dimension_accum.items()
    }

    # Top common deductions
    common_deductions = [
        {"rule": rule, "count": count, "reason": deduction_reasons.get(rule, "")}
        for rule, count in sorted(deduction_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    # Underwriting Portfolio Verdict
    if completed_count == 0:
        verdict = "IN_PROGRESS"
    elif mean_score is not None and mean_score >= 80 and risk_counts["critical_alert_count"] == 0:
        verdict = "APPROVED_PORTFOLIO"
    elif mean_score is not None and mean_score >= 60:
        verdict = "CONDITIONAL_APPROVAL"
    else:
        verdict = "HIGH_RISK_PORTFOLIO"

    return {
        "batch_id": batch.get("batch_id", ""),
        "batch_name": batch.get("batch_name", "Loan Underwriting Batch"),
        "total_assets": total_assets,
        "completed_count": completed_count,
        "pending_count": pending_count,
        "failed_count": failed_count,
        "portfolio_mean_score": mean_score,
        "portfolio_median_score": median_score,
        "risk_distribution": risk_counts,
        "average_dimension_scores": avg_dimensions,
        "common_deductions": common_deductions,
        "underwriting_verdict": verdict,
    }


def generate_bulk_csv(batch: Dict[str, Any], memory_store: Any) -> str:
    """Renders a structured, institutional CSV report for banking loan underwriting."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Banking Regulatory Headers
    writer.writerow([
        "Batch ID",
        "Report ID",
        "Project Name",
        "Promoter / Entity",
        "RERA Registration ID",
        "Jurisdiction State",
        "Verification Status",
        "Trust Score (0-100)",
        "Trust Classification",
        "Statutory Risk Category",
        "RERA Status Score (30)",
        "Claim Match Score (20)",
        "Court Signals Score (20)",
        "Promoter Record Score (10)",
        "Statutory Approvals Score (10)",
        "Reputation Score (10)",
        "Completed At"
    ])

    batch_id = batch.get("batch_id", "")
    for r in batch.get("reports", []):
        rep_id = r.get("report_id")
        stored = memory_store.reports.get(rep_id) if hasattr(memory_store, "reports") else {}
        stored = stored or {}

        prop_details = stored.get("property_details", {})
        breakdown = stored.get("breakdown")
        dim_scores = {}
        risk_cat = "PENDING"
        if breakdown:
            dim_scores = breakdown.dimension_scores if hasattr(breakdown, "dimension_scores") else breakdown.get("dimension_scores", {})
            risk_cat = breakdown.risk_category if hasattr(breakdown, "risk_category") else breakdown.get("risk_category", "UNSPECIFIED")

        writer.writerow([
            batch_id,
            rep_id,
            prop_details.get("project_name", r.get("project_name", "")),
            prop_details.get("promoter_name", "N/A"),
            prop_details.get("rera_id", "N/A"),
            prop_details.get("state", "Maharashtra"),
            stored.get("status", r.get("status", "queued")),
            stored.get("trust_score", "N/A"),
            stored.get("trust_label", "Pending"),
            risk_cat or "UNSPECIFIED",
            dim_scores.get("rera_status", "N/A"),
            dim_scores.get("claim_match", "N/A"),
            dim_scores.get("court_signals", "N/A"),
            dim_scores.get("promoter_record", "N/A"),
            dim_scores.get("approvals", "N/A"),
            dim_scores.get("reputation", "N/A"),
            stored.get("completed_at", "N/A")
        ])

    return output.getvalue()
