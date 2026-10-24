"""PDF Dossier Generator for Ghar Search Reports.
Uses PyMuPDF (fitz) for lightweight, deterministic, high-quality document rendering.
Generates regulatory-grade due-diligence dossiers with scorecards, evidence citations,
and legal disclaimers.
"""

import io
from datetime import datetime, timezone
from typing import Dict, Any
try:
    import pymupdf as fitz
except ImportError:
    import fitz

def generate_pdf_dossier(report_data: Dict[str, Any]) -> bytes:
    """Generates a complete, multi-section due-diligence PDF dossier."""
    doc = fitz.open()

    # Dimensions for A4
    page_width, page_height = fitz.paper_size("a4")
    margin_x = 45
    page = doc.new_page(width=page_width, height=page_height)

    # Palette
    c_brand = (0.12, 0.28, 0.65)      # Royal Blue
    c_dark = (0.08, 0.11, 0.18)       # Slate 900
    c_muted = (0.40, 0.45, 0.55)      # Slate 500
    c_bg_light = (0.96, 0.97, 0.99)   # Slate 50
    c_border = (0.85, 0.88, 0.92)     # Slate 200

    prop = report_data.get("property_details") or {}
    project_name = prop.get("project_name") or "Property Due-Diligence Report"
    promoter_name = prop.get("promoter_name") or "Developer"
    rera_id = prop.get("rera_id") or "RERA Pending"
    city = prop.get("city") or "Mumbai"
    state = prop.get("state") or "Maharashtra"
    report_id = report_data.get("report_id") or "RPT-001"
    raw_score = report_data.get("trust_score")
    score = int(raw_score) if raw_score is not None else 0
    label = report_data.get("trust_label") or "Pending"
    created_at = report_data.get("created_at") or datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    # Trust Tier Color
    if score >= 80:
        c_score = (0.06, 0.62, 0.35)  # Emerald
        tier_text = "LOW RISK · HIGH TRUST"
    elif score >= 60:
        c_score = (0.85, 0.55, 0.05)  # Amber
        tier_text = "MODERATE RISK · CAUTION"
    elif score >= 40:
        c_score = (0.90, 0.40, 0.10)  # Orange
        tier_text = "HIGH RISK · INVESTIGATE"
    else:
        c_score = (0.88, 0.15, 0.20)  # Rose/Red
        tier_text = "CRITICAL ALERT · CRITICAL RISK"

    y = 40

    # 1. Header Banner
    page.draw_rect(fitz.Rect(margin_x, y, page_width - margin_x, y + 42), color=c_brand, fill=c_brand)
    page.insert_text((margin_x + 14, y + 26), "GHAR SEARCH", fontsize=15, fontname="helv", color=(1, 1, 1))
    page.insert_text((margin_x + 130, y + 26), "— Ghar Search Agentic Property Due-Diligence Dossier", fontsize=8.5, fontname="helv", color=(0.9, 0.92, 1))
    page.insert_text((page_width - margin_x - 225, y + 26), "CONFIDENTIAL AUDIT | DUE DILIGENCE AUDIT REPORT", fontsize=7, fontname="helv", color=(1, 1, 1))
    y += 54

    # 2. Metadata Box
    page.draw_rect(fitz.Rect(margin_x, y, page_width - margin_x, y + 68), color=c_border, fill=c_bg_light)
    page.insert_text((margin_x + 14, y + 18), project_name, fontsize=14, fontname="helv", color=c_dark)
    page.insert_text((margin_x + 14, y + 34), f"Promoter: {promoter_name}   |   Location: {city}, {state}", fontsize=9, fontname="helv", color=c_muted)
    page.insert_text((margin_x + 14, y + 50), f"RERA ID: {rera_id}   |   Dossier: {report_id}   |   Generated: {created_at[:10]}", fontsize=8.5, fontname="helv", color=c_brand)

    # Score Stamp on the right side of metadata box
    score_rect = fitz.Rect(page_width - margin_x - 120, y + 10, page_width - margin_x - 12, y + 58)
    page.draw_rect(score_rect, color=c_score, fill=(1, 1, 1), width=1.5)
    page.insert_text((page_width - margin_x - 105, y + 32), f"{score} / 100", fontsize=15, fontname="helv", color=c_score)
    page.insert_text((page_width - margin_x - 118, y + 48), tier_text[:30], fontsize=5.8, fontname="helv", color=c_score)
    y += 80

    # 3. Executive Summary / Plain-Language Verdict
    summary_obj = report_data.get("summary") or {}
    verdict = summary_obj.get("verdict") or "No summary available."

    page.insert_text((margin_x, y), "EXECUTIVE DUE-DILIGENCE VERDICT", fontsize=10, fontname="helv", color=c_brand)
    y += 6
    page.draw_line(fitz.Point(margin_x, y), fitz.Point(page_width - margin_x, y), color=c_brand, width=1)
    y += 14

    # Draw verdict in light box
    verdict_rect = fitz.Rect(margin_x, y, page_width - margin_x, y + 46)
    page.draw_rect(verdict_rect, color=c_border, fill=c_bg_light)
    page.insert_textbox(
        fitz.Rect(margin_x + 8, y + 6, page_width - margin_x - 8, y + 42),
        verdict,
        fontsize=8.5,
        fontname="helv",
        color=c_dark
    )
    y += 56

    # 4. Dimension Scorecard Table
    page.insert_text((margin_x, y), "6-DIMENSION STATUTORY COMPLIANCE BREAKDOWN", fontsize=10, fontname="helv", color=c_brand)
    y += 6
    page.draw_line(fitz.Point(margin_x, y), fitz.Point(page_width - margin_x, y), color=c_brand, width=1)
    y += 12

    # Table Header
    th_rect = fitz.Rect(margin_x, y, page_width - margin_x, y + 18)
    page.draw_rect(th_rect, color=c_border, fill=c_brand)
    page.insert_text((margin_x + 10, y + 12), "Verification Dimension", fontsize=8, fontname="helv", color=(1, 1, 1))
    page.insert_text((margin_x + 220, y + 12), "Status", fontsize=8, fontname="helv", color=(1, 1, 1))
    page.insert_text((margin_x + 320, y + 12), "Awarded / Max Points", fontsize=8, fontname="helv", color=(1, 1, 1))
    page.insert_text((page_width - margin_x - 90, y + 12), "Regulatory Source", fontsize=8, fontname="helv", color=(1, 1, 1))
    y += 18

    checks = report_data.get("checks") or []
    dim_names = {
        "rera_status": ("1. RERA Registration & Validity", "State RERA Portal", 30),
        "claim_match": ("2. Marketing Claim Discrepancies", "Brochure vs RERA Form B", 20),
        "court_signals": ("3. Judicial Litigation & CIRP", "eCourts & NCLT Insolvency", 20),
        "promoter_record": ("4. Promoter Track Record & MCA", "MCA21 & Disqualification Ledger", 10),
        "approvals": ("5. Municipal Sanctions & NOCs", "Town Planning / Fire Dept", 10),
        "reputation": ("6. Public Sentiment & Grievances", "Consumer Forum & Media", 10),
    }

    breakdown = report_data.get("breakdown") or {}
    dim_scores = breakdown.get("dimension_scores") or {}

    for idx, (dim_key, (dim_title, source_lbl, max_p)) in enumerate(dim_names.items()):
        row_rect = fitz.Rect(margin_x, y, page_width - margin_x, y + 16)
        row_bg = c_bg_light if idx % 2 == 0 else (1, 1, 1)
        page.draw_rect(row_rect, color=c_border, fill=row_bg)

        # Find matching check result
        c_res = next((c for c in checks if (c.get("check_type") if isinstance(c, dict) else getattr(c, "check_type", None)) == dim_key), {})
        if not isinstance(c_res, dict):
            c_res = c_res.__dict__ if hasattr(c_res, "__dict__") else {}
        raw_st = c_res.get("status")
        if hasattr(raw_st, "value"):
            raw_st = raw_st.value
        st = str(raw_st or "passed").upper()
        if st.startswith("CHECKSTATUS."):
            st = st.replace("CHECKSTATUS.", "")
        awarded_val = dim_scores.get(dim_key)
        if awarded_val is None:
            awarded_val = c_res.get("score_contribution")
        if awarded_val is None:
            awarded_val = max_p

        page.insert_text((margin_x + 10, y + 11), dim_title, fontsize=7.5, fontname="helv", color=c_dark)
        page.insert_text((margin_x + 220, y + 11), st, fontsize=7.5, fontname="helv", color=c_score if st == "PASSED" else (0.85, 0.4, 0.1))
        page.insert_text((margin_x + 340, y + 11), f"{awarded_val} / {max_p} pts", fontsize=7.5, fontname="helv", color=c_dark)
        page.insert_text((page_width - margin_x - 90, y + 11), source_lbl, fontsize=7, fontname="helv", color=c_muted)
        y += 16

    y += 12

    # 5. Auditable Deductions
    deductions = (breakdown.get("deductions") if isinstance(breakdown, dict) else getattr(breakdown, "deductions", [])) or []
    if deductions:
        if y + 50 > page_height - 50:
            page = doc.new_page(width=page_width, height=page_height)
            y = 40

        page.insert_text((margin_x, y), f"AUDITABLE SCORE DEDUCTIONS ({len(deductions)})", fontsize=10, fontname="helv", color=(0.85, 0.15, 0.15))
        y += 6
        page.draw_line(fitz.Point(margin_x, y), fitz.Point(page_width - margin_x, y), color=(0.85, 0.15, 0.15), width=1)
        y += 10

        for d in deductions[:3]:
            if y + 25 > page_height - 50:
                page = doc.new_page(width=page_width, height=page_height)
                y = 40
            d_rect = fitz.Rect(margin_x, y, page_width - margin_x, y + 20)
            page.draw_rect(d_rect, color=(0.95, 0.8, 0.8), fill=(0.99, 0.95, 0.95))
            if isinstance(d, dict):
                rule_name = d.get('rule') or d.get('rule_code') or 'DEDUCTION'
                reason_text = d.get('reason', '')
                pts_deducted = d.get('points_deducted', 0)
            else:
                rule_name = getattr(d, 'rule', None) or getattr(d, 'rule_code', 'DEDUCTION')
                reason_text = getattr(d, 'reason', '')
                pts_deducted = getattr(d, 'points_deducted', 0)
            page.insert_text((margin_x + 8, y + 13), f"[{rule_name}] {reason_text}", fontsize=7.5, fontname="helv", color=(0.7, 0.1, 0.1))
            page.insert_text((page_width - margin_x - 55, y + 13), f"-{pts_deducted} pts", fontsize=8, fontname="helv", color=(0.8, 0.1, 0.1))
            y += 22
        y += 6

    # 6. Primary Evidence Proofs (Top findings)
    if y + 60 > page_height - 50:
        page = doc.new_page(width=page_width, height=page_height)
        y = 40

    page.insert_text((margin_x, y), "CAPTURED REGULATORY EVIDENCE CITATIONS", fontsize=10, fontname="helv", color=c_brand)
    y += 6
    page.draw_line(fitz.Point(margin_x, y), fitz.Point(page_width - margin_x, y), color=c_brand, width=1)
    y += 10

    evidence_count = 0
    for c in checks:
        if evidence_count >= 3:
            break
        ev_list = (c.get("evidence") if isinstance(c, dict) else getattr(c, "evidence", [])) or []
        if ev_list:
            if y + 40 > page_height - 50:
                page = doc.new_page(width=page_width, height=page_height)
                y = 40
            ev = ev_list[0]
            if not isinstance(ev, dict):
                ev = ev.__dict__ if hasattr(ev, "__dict__") else {}
            ev_title = ev.get('title') or 'Official Record'
            ev_url = (ev.get('url') or '')[:75]
            ev_ts = (ev.get('timestamp') or '')[:10]
            ev_box = fitz.Rect(margin_x, y, page_width - margin_x, y + 30)
            page.draw_rect(ev_box, color=c_border, fill=c_bg_light)
            page.insert_text((margin_x + 8, y + 11), f"Source: {ev_title}", fontsize=8, fontname="helv", color=c_dark)
            page.insert_text((margin_x + 8, y + 22), f"URL: {ev_url}...", fontsize=7, fontname="helv", color=c_brand)
            page.insert_text((page_width - margin_x - 110, y + 11), f"Timestamp: {ev_ts}", fontsize=7, fontname="helv", color=c_muted)
            y += 34
            evidence_count += 1

    # Footer / Disclaimer
    page.draw_line(fitz.Point(margin_x, page_height - 40), fitz.Point(page_width - margin_x, page_height - 40), color=c_border, width=0.5)
    disclaimer = "DISCLAIMER: Ghar Search is an automated due-diligence intelligence system for HackIIITD 2026. Data is cross-referenced from public state portals as-of the timestamp. Not formal legal title certification."
    page.insert_text((margin_x, page_height - 28), disclaimer[:130], fontsize=6.5, fontname="helv", color=c_muted)
    page.insert_text((margin_x, page_height - 20), disclaimer[130:], fontsize=6.5, fontname="helv", color=c_muted)

    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes
