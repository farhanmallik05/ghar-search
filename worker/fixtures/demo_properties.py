"""Pre-seeded demo fixtures for HackIIITD 2026.
Ensures 100% resilient live demos (MOCK-01) with realistic evidence screenshots,
citations, and deterministic scoring behavior.
"""

from typing import Dict, Any, List
from intelligence.schemas import (
    CheckType,
    CheckStatus,
    CheckResult,
    EvidenceItem,
    PropertyClaims
)

DEMO_PROPERTIES: Dict[str, Dict[str, Any]] = {
    "clean": {
        "id": "prop_demo_clean_01",
        "report_id": "rpt_sunshine_clean",
        "title": "Sunshine Residency Phase 1",
        "badge": "High Trust (Score: 92/100)",
        "rera_id": "P52100012345",
        "state": "Maharashtra",
        "city": "Pune",
        "address": "Survey No. 42/1, Baner-Pashan Link Road, Pune 411045",
        "promoter_name": "Godrej Properties Limited",
        "project_name": "Sunshine Residency Phase 1",
        "listing_url": "https://housing.com/in/buy/projects/page/102938-sunshine-residency-baner",
        "claims": PropertyClaims(
            project_name="Sunshine Residency Phase 1",
            promoter_name="Godrej Properties Limited",
            rera_id="P52100012345",
            state="Maharashtra",
            city="Pune",
            claimed_completion_date="2027-03-31",
            total_units=240,
            approved_floors=22,
            claimed_amenities=["Clubhouse", "Infinity Pool", "Jogging Track", "EV Charging", "24/7 Security"],
            confidence=0.98
        ),
        "checks": [
            CheckResult(
                check_type=CheckType.RERA_STATUS,
                status=CheckStatus.PASSED,
                score_contribution=30,
                max_score=30,
                findings=[
                    "Project registered with MahaRERA under ID P52100012345.",
                    "Certificate is active with valid validity until 31/03/2027.",
                    "Designated escrow bank account is active with regular statutory quarterly CA disclosures."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://maharera.mahaonline.gov.in/ProjectSummary/P52100012345",
                        title="MahaRERA Official Registration Record",
                        snippet="Registration Status: Active Registered. Expiry: 31-Mar-2027. Escrow Account Verified.",
                        screenshot_url="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:30:12Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.CLAIM_MATCH,
                status=CheckStatus.PASSED,
                score_contribution=20,
                max_score=20,
                findings=[
                    "Promised completion date (March 2027) matches RERA declared date within 0 days delta.",
                    "Total 240 units declared in brochure matches 240 units approved in RERA project schedule.",
                    "All 5 advertised core amenities are filed in the statutory Form B disclosure."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://housing.com/in/buy/projects/page/102938-sunshine-residency-baner",
                        title="Brochure Spec Cross-Reference",
                        snippet="Marketing Brochure Unit Count: 240 | RERA Filing Schedule A: 240. Delta: 0.",
                        screenshot_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:30:15Z"
                    )
                ],
                credits_used=1
            ),
            CheckResult(
                check_type=CheckType.COURT_SIGNALS,
                status=CheckStatus.PASSED,
                score_contribution=20,
                max_score=20,
                findings=[
                    "eCourts India search returned 0 active criminal, recovery, or injunction cases for project or builder SPV.",
                    "NCLT / IBBI insolvency database check: Clean (0 petitions filed or admitted).",
                    "Consumer forum query across Pune district commission indicates zero outstanding non-compliance notices."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/P52100012345",
                        title="National Judicial Data Grid (NJDG) eCourts Record",
                        snippet="Search Query: 'Godrej Sunshine Residency'. Results: 0 active cases, 0 stay orders.",
                        screenshot_url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:30:20Z"
                    )
                ],
                credits_used=3
            ),
            CheckResult(
                check_type=CheckType.PROMOTER_RECORD,
                status=CheckStatus.PASSED,
                score_contribution=10,
                max_score=10,
                findings=[
                    "Promoter holds AAA credit rating on statutory disclosures.",
                    "Track record confirms over 18 successfully completed and handed-over residential projects in Pune and MMR.",
                    "Zero director disqualifications found under MCA21 records."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://www.mca.gov.in/content/mca/global/en/home.html",
                        title="MCA21 Director & Company Master Data",
                        snippet="Active Company status. Paid up capital: Rs. 150 Cr. Director status: Compliant.",
                        screenshot_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:30:22Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.APPROVALS,
                status=CheckStatus.PASSED,
                score_contribution=6,
                max_score=10,
                findings=[
                    "Pune Municipal Corporation (PMC) sanctioned layout and Commencement Certificate (CC) up to 22 floors.",
                    "State Level Environmental Impact Assessment Authority (SEIAA) Clearance granted.",
                    "Provisional Fire NOC verified; final occupancy audit pending building envelope completion."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://pmc.gov.in/en/town-planning/building-permission/sanction-reports",
                        title="PMC Building Permission Portal",
                        snippet="Sanction No: PMC/BP/2024/7891. CC issued for Plinth + 22 Floors.",
                        screenshot_url="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:30:25Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.REPUTATION,
                status=CheckStatus.PASSED,
                score_contribution=6,
                max_score=10,
                findings=[
                    "News archive analysis: Clean sentiment with positive construction progress reporting.",
                    "Consumer feedback portals indicate responsive sales coordination.",
                    "Minor buyer feedback regarding traffic congestion on Baner approach road."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://news.google.com/search?q=Sunshine+Residency+Baner+Godrej",
                        title="Public Media & Consumer Sentiment Index",
                        snippet="Sentiment: 92% Positive/Neutral. No fraud alerts, zero construction halt reports.",
                        screenshot_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:30:28Z"
                    )
                ],
                credits_used=1
            )
        ]
    },

    "delayed": {
        "id": "prop_demo_delayed_02",
        "report_id": "rpt_green_valley_delayed",
        "title": "Green Valley Towers Phase 2",
        "badge": "Moderate Risk (Score: 68/100)",
        "rera_id": "P52100088765",
        "state": "Maharashtra",
        "city": "Pune",
        "address": "Sector 14, Hinjewadi Phase 3, Pune 411057",
        "promoter_name": "Apex Skyline Developers Pvt Ltd",
        "project_name": "Green Valley Towers Phase 2",
        "listing_url": "https://99acres.com/green-valley-towers-hinjewadi-pune",
        "claims": PropertyClaims(
            project_name="Green Valley Towers Phase 2",
            promoter_name="Apex Skyline Developers Pvt Ltd",
            rera_id="P52100088765",
            state="Maharashtra",
            city="Pune",
            claimed_completion_date="2025-06-30",
            total_units=320,
            approved_floors=18,
            claimed_amenities=["Clubhouse", "Gymnasium", "Children Play Area"],
            confidence=0.92
        ),
        "checks": [
            CheckResult(
                check_type=CheckType.RERA_STATUS,
                status=CheckStatus.PASSED,
                score_contribution=30,
                max_score=30,
                findings=[
                    "Project is registered with MahaRERA under ID P52100088765.",
                    "Registration status is Active with extension granted under Form 4 till December 2026.",
                    "Quarterly financial filings show 68% construction completion vs 85% fund drawal."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://maharera.mahaonline.gov.in/ProjectSummary/P52100088765",
                        title="MahaRERA Project Filing Detail",
                        snippet="Status: Registered (Extension Applied). Revised Date: 31-Dec-2026.",
                        screenshot_url="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:35:10Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.CLAIM_MATCH,
                status=CheckStatus.FLAGGED,
                score_contribution=10,
                max_score=20,
                findings=[
                    "Possession delay detected: Marketing brochure advertises June 2025 possession, but RERA extension declaration states December 2026 (18 months delta!).",
                    "Total unit count matches 320 units.",
                    "Amenities: Swimming pool promised in brochure is absent from statutory approved site plan."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://99acres.com/green-valley-towers-hinjewadi-pune",
                        title="Brochure Timeline Discrepancy",
                        snippet="Ad claim: 'Possession Ready by Mid 2025' vs MahaRERA Form 4: 'Target Date: Dec 2026'.",
                        screenshot_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:35:14Z"
                    )
                ],
                credits_used=1
            ),
            CheckResult(
                check_type=CheckType.COURT_SIGNALS,
                status=CheckStatus.FLAGGED,
                score_contribution=12,
                max_score=20,
                findings=[
                    "2 active Consumer Court complaints identified for delay compensation under Section 18 RERA.",
                    "No judicial stay order or stop-work notices on physical construction site.",
                    "Insolvency check: Clean (No NCLT proceedings)."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://services.ecourts.gov.in/ecourtindia_v6/?p=consumer/P52100088765",
                        title="District Consumer Disputes Redressal Commission Pune",
                        snippet="Case No. CC/2025/114: Pending adjudication regarding delayed milestone interest.",
                        screenshot_url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:35:18Z"
                    )
                ],
                credits_used=3
            ),
            CheckResult(
                check_type=CheckType.PROMOTER_RECORD,
                status=CheckStatus.FLAGGED,
                score_contribution=5,
                max_score=10,
                findings=[
                    "Promoter delivered 2 prior residential projects in Pune with average hand-over delay of 11 months.",
                    "MCA21 company status is active without director disqualifications.",
                    "Working capital credit lines show moderate stress."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://www.mca.gov.in/content/mca/global/en/home.html",
                        title="MCA21 Corporate Charge Status",
                        snippet="Apex Skyline Developers: Outstanding charge with HDFC Bank. Past deliveries delayed.",
                        screenshot_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:35:20Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.APPROVALS,
                status=CheckStatus.NEEDS_REVIEW,
                score_contribution=6,
                max_score=10,
                findings=[
                    "PMRDA layout approval verified for 18 floors.",
                    "Fire NOC pending renewal: Initial conditional NOC expired in January 2026; renewal audit under submission.",
                    "Tree authority clearance and municipal water connection in progress."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://pmrda.gov.in/building-sanctions/green-valley-phase2",
                        title="PMRDA Sanction Registry",
                        snippet="Sanction valid. Conditional Fire NOC renewal pending site inspection.",
                        screenshot_url="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:35:22Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.REPUTATION,
                status=CheckStatus.FLAGGED,
                score_contribution=5,
                max_score=10,
                findings=[
                    "Buyer association online forum active with discussions concerning delayed clubhouse delivery.",
                    "Promoter representatives actively responding to buyer grievance threads.",
                    "Moderate negative sentiment recorded on Google Maps listing (3.1/5 stars across 45 reviews)."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://consumercomplaints.in/apex-skyline-green-valley-delay",
                        title="Consumer Forum Grievance Aggregator",
                        snippet="Total grievances: 12. Resolution rate: 75%. Common topic: possession postponement.",
                        screenshot_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:35:25Z"
                    )
                ],
                credits_used=1
            )
        ]
    },

    "flagged": {
        "id": "prop_demo_flagged_03",
        "report_id": "rpt_royal_empire_flagged",
        "title": "Royal Empire Luxury Towers",
        "badge": "Critical Alert (Score: 18/100)",
        "rera_id": "P51700099881",
        "state": "Maharashtra",
        "city": "Thane",
        "address": "Ghodbunder Road, Near Ovala Junction, Thane West 400615",
        "promoter_name": "Royal Imperial Realcon Ltd",
        "project_name": "Royal Empire Luxury Towers",
        "listing_url": "https://magicbricks.com/royal-empire-ghodbunder-road-thane",
        "claims": PropertyClaims(
            project_name="Royal Empire Luxury Towers",
            promoter_name="Royal Imperial Realcon Ltd",
            rera_id="P51700099881",
            state="Maharashtra",
            city="Thane",
            claimed_completion_date="2024-12-31",
            total_units=480,
            approved_floors=32,
            claimed_amenities=["Helipad", "Private Marina", "Olympic Pool", "Sky Lounge"],
            confidence=0.88
        ),
        "checks": [
            CheckResult(
                check_type=CheckType.RERA_STATUS,
                status=CheckStatus.FLAGGED,
                score_contribution=10,
                max_score=30,
                findings=[
                    "MahaRERA registration expired on 31-Dec-2024 without extension approval.",
                    "Regulatory authority has issued formal show-cause notice under Section 7 for project deregistration.",
                    "Promoter failed to deposit mandatory quarterly financial audit statements for 6 consecutive quarters."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://maharera.mahaonline.gov.in/ShowCauseNotices/P51700099881",
                        title="MahaRERA Show-Cause & Non-Compliance Ledger",
                        snippet="Registration EXPIRED. Section 7 Revocation Proceedings Initiated by Authority.",
                        screenshot_url="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:40:05Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.CLAIM_MATCH,
                status=CheckStatus.FAILED,
                score_contribution=2,
                max_score=20,
                findings=[
                    "Severe discrepancy: Brochure claims 32 floors approved, but TMC sanction only permits 24 floors. Upper 8 floors are completely unauthorized!",
                    "Possession delay: Advertised for 2024; site work completely suspended since September 2024.",
                    "Helipad and private marina claims lack any civil aviation or port authority sanction."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://magicbricks.com/royal-empire-ghodbunder-road-thane",
                        title="Brochure vs Sanction Plan Comparison",
                        snippet="Sanction: 24 floors (TMC/BP/2021/33). Marketing: 32 floors. Unauthorized construction: 8 floors.",
                        screenshot_url="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:40:08Z"
                    )
                ],
                credits_used=1
            ),
            CheckResult(
                check_type=CheckType.COURT_SIGNALS,
                status=CheckStatus.FAILED,
                score_contribution=0,
                max_score=20,
                findings=[
                    "CRITICAL: NCLT Mumbai Bench has admitted Corporate Insolvency Resolution Process (CIRP) petition by financial creditor (CP (IB) No. 421/MB/2025).",
                    "Interim Resolution Professional (IRP) has been appointed to take over management assets.",
                    "Bombay High Court has issued stop-work and status-quo injunction in writ petition filed by Thane Municipal Corporation."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://nclt.gov.in/orders/mumbai-bench/cp-ib-421-2025",
                        title="NCLT Court Order Database",
                        snippet="Order dated 14-Aug-2025: Section 7 IBC Petition Admitted. Moratorium Declared under Section 14.",
                        screenshot_url="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:40:12Z"
                    )
                ],
                credits_used=3
            ),
            CheckResult(
                check_type=CheckType.PROMOTER_RECORD,
                status=CheckStatus.FAILED,
                score_contribution=0,
                max_score=10,
                findings=[
                    "Managing Director has active non-bailable warrants issued in connection with investor fraud case.",
                    "MCA21 records identify 2 sister entities already placed into liquidation.",
                    "Promoter blacklisted from bidding on state infrastructure projects."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://www.mca.gov.in/content/mca/global/en/home.html",
                        title="MCA21 Director Disqualification Notice",
                        snippet="DIN 02918271: Disqualified under Section 164(2) of Companies Act 2013.",
                        screenshot_url="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:40:15Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.APPROVALS,
                status=CheckStatus.FAILED,
                score_contribution=4,
                max_score=10,
                findings=[
                    "Missing Commencement Certificate (CC) for towers C and D.",
                    "Thane Municipal Corporation has served demolition notice for unauthorized upper structural columns.",
                    "Fire department has rejected safety plan due to lack of standard 6-meter peripheral fire engine pathway."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://thanecity.gov.in/demolition-notices/ghodbunder-royal-empire",
                        title="TMC Town Planning Demolition Notice",
                        snippet="Notice under Section 53 MRTP Act: Demolish unauthorized upper slab within 30 days.",
                        screenshot_url="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:40:18Z"
                    )
                ],
                credits_used=2
            ),
            CheckResult(
                check_type=CheckType.REPUTATION,
                status=CheckStatus.FAILED,
                score_contribution=2,
                max_score=10,
                findings=[
                    "Front-page newspaper investigations reporting over 200 cheated homebuyers forming action committee.",
                    "Physical site gate locked by local police following protest rally.",
                    "Consumer forum grievance volume exceeds 85 unresolved complaints."
                ],
                evidence=[
                    EvidenceItem(
                        url="https://news.google.com/search?q=Royal+Empire+Ghodbunder+Thane+cheating+protest",
                        title="Investigative Media Investigation Dossier",
                        snippet="Headline: 'Homebuyers stage protest outside Thane builder office over stalled Royal Empire project.'",
                        screenshot_url="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                        timestamp="2026-10-24T06:40:22Z"
                    )
                ],
                credits_used=1
            )
        ]
    }
}

def get_demo_fixture(key_or_rera_or_name: str) -> Dict[str, Any]:
    """Retrieves a pre-vetted demo fixture matching a key, RERA ID, or project name."""
    query = key_or_rera_or_name.lower().strip()

    # Exact key match
    if query in DEMO_PROPERTIES:
        return DEMO_PROPERTIES[query]

    # Search by rera or name
    for key, prop in DEMO_PROPERTIES.items():
        if query in prop["rera_id"].lower() or query in prop["project_name"].lower() or query in prop["title"].lower():
            return prop

    # Default to clean if not matched
    return DEMO_PROPERTIES["clean"]
