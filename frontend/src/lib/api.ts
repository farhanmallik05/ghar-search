import { VerificationReport, FixtureProperty, WatchlistItem } from './types';

export const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || 'http://localhost:8000';

export async function getFixtures(): Promise<FixtureProperty[]> {
  try {
    const res = await fetch(`${WORKER_URL}/api/v1/fixtures`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.fixtures || [];
    }
  } catch (e) {
    console.warn('Could not fetch fixtures from worker, using local fallback:', e);
  }

  // Fallback fixtures
  return [
    {
      key: 'clean',
      title: 'Sunshine Residency Phase 1',
      badge: 'High Trust (Score: 92/100)',
      rera_id: 'P52100012345',
      project_name: 'Sunshine Residency Phase 1',
      promoter_name: 'Godrej Properties Limited',
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Survey No. 42/1, Baner-Pashan Link Road, Pune 411045',
      listing_url: 'https://housing.com/in/buy/projects/page/102938-sunshine-residency-baner'
    },
    {
      key: 'delayed',
      title: 'Green Valley Towers Phase 2',
      badge: 'Moderate Risk (Score: 68/100)',
      rera_id: 'P52100088765',
      project_name: 'Green Valley Towers Phase 2',
      promoter_name: 'Apex Skyline Developers Pvt Ltd',
      city: 'Pune',
      state: 'Maharashtra',
      address: 'Sector 14, Hinjewadi Phase 3, Pune 411057',
      listing_url: 'https://99acres.com/green-valley-towers-hinjewadi-pune'
    },
    {
      key: 'flagged',
      title: 'Royal Empire Luxury Towers',
      badge: 'Critical Alert (Score: 18/100)',
      rera_id: 'P51700099881',
      project_name: 'Royal Empire Luxury Towers',
      promoter_name: 'Royal Imperial Realcon Ltd',
      city: 'Thane',
      state: 'Maharashtra',
      address: 'Ghodbunder Road, Near Ovala Junction, Thane West 400615',
      listing_url: 'https://magicbricks.com/royal-empire-ghodbunder-road-thane'
    }
  ];
}

export async function triggerVerification(params: {
  property_url?: string;
  project_name?: string;
  promoter_name?: string;
  rera_number?: string;
  state?: string;
  city?: string;
  address?: string;
}): Promise<{ report_id: string; status: string }> {
  const body: any = {};
  if (params.property_url) {
    body.property_url = params.property_url;
  }
  if (params.project_name || params.rera_number) {
    body.manual_details = {
      project_name: params.project_name,
      promoter_name: params.promoter_name,
      rera_number: params.rera_number,
      state: params.state || 'Maharashtra',
      city: params.city,
      address: params.address,
    };
  }

  const res = await fetch(`${WORKER_URL}/api/v1/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Verification failed with HTTP ${res.status}`);
  }

  return res.json();
}

export const LOCAL_DEMO_REPORTS: Record<string, VerificationReport> = {
  "rpt_sunshine_clean": {
    "report_id": "rpt_sunshine_clean",
    "property_id": "prop_demo_clean_01",
    "status": "completed",
    "property_details": {
      "project_name": "Sunshine Residency Phase 1",
      "promoter_name": "Godrej Properties Limited",
      "rera_id": "P52100012345",
      "state": "Maharashtra",
      "city": "Pune",
      "address": "Survey No. 42/1, Baner-Pashan Link Road, Pune 411045",
      "listing_url": "https://housing.com/in/buy/projects/page/102938-sunshine-residency-baner"
    },
    "claims": {
      "project_name": "Sunshine Residency Phase 1",
      "promoter_name": "Godrej Properties Limited",
      "rera_id": "P52100012345",
      "state": "Maharashtra",
      "city": "Pune",
      "claimed_completion_date": "2027-03-31",
      "total_units": 240,
      "approved_floors": 22,
      "claimed_amenities": [
        "Clubhouse",
        "Infinity Pool",
        "Jogging Track",
        "EV Charging",
        "24/7 Security"
      ],
      "confidence": 0.98
    },
    "trust_score": 92,
    "trust_label": "High Trust",
    "breakdown": {
      "total_score": 92,
      "label": "High Trust",
      "dimension_scores": {
        "rera_status": 30,
        "claim_match": 20,
        "court_signals": 20,
        "promoter_record": 10,
        "approvals": 6,
        "reputation": 6
      },
      "max_dimension_scores": {
        "rera_status": 30,
        "claim_match": 20,
        "court_signals": 20,
        "promoter_record": 10,
        "approvals": 10,
        "reputation": 10
      },
      "deductions": [
        {
          "rule": "APPROVAL_CLEARANCE_PENDING",
          "dimension": "approvals",
          "points_deducted": 4,
          "reason": "Fire NOC renewal or final occupancy clearance audit is pending completion."
        },
        {
          "rule": "REPUTATION_MINOR_FEEDBACK",
          "dimension": "reputation",
          "points_deducted": 4,
          "reason": "Minor buyer feedback recorded regarding local approach roads or traffic."
        }
      ],
      "strengths": [
        "Project holds active, valid RERA registration with clean regulatory disclosures.",
        "Marketing brochure details match statutory RERA declarations accurately.",
        "No adverse litigation, NCLT insolvency claims, or judicial stay orders identified.",
        "Promoter possesses established track record of delivered residential projects."
      ],
      "recommendations": [
        "Property demonstrates strong statutory compliance. Standard legal deed verification recommended."
      ]
    },
    "summary": {
      "verdict": "Sunshine Residency Phase 1 (RERA: P52100012345) demonstrates exemplary statutory compliance with an overall Trust Score of 92/100. All primary regulatory registrations, approvals, and litigation records are verified clean with zero adverse court injunctions or critical discrepancies.",
      "trust_score": 92,
      "trust_label": "High Trust",
      "highlights": [
        "\u2713 Project holds active, valid RERA registration with clean regulatory disclosures.",
        "\u2713 Marketing brochure details match statutory RERA declarations accurately.",
        "\u2713 No adverse litigation, NCLT insolvency claims, or judicial stay orders identified.",
        "\u26a0 Fire NOC renewal or final occupancy clearance audit is pending completion. (-4 pts)",
        "\u26a0 Minor buyer feedback recorded regarding local approach roads or traffic. (-4 pts)"
      ],
      "action_items": [
        "Property demonstrates strong statutory compliance. Standard legal deed verification recommended."
      ],
      "disclaimer": "Ghar Search is an automated public-records matching system. Findings are based on publicly indexed government portals, court ledgers, and marketing collateral as of the capture timestamp. This report does not constitute formal legal title certification or financial advice."
    },
    "checks": [
      {
        "check_type": "rera_status",
        "status": "passed",
        "score_contribution": 30,
        "max_score": 30,
        "findings": [
          "Project registered with MahaRERA under ID P52100012345.",
          "Certificate is active with valid validity until 31/03/2027.",
          "Designated escrow bank account is active with regular statutory quarterly CA disclosures."
        ],
        "evidence": [
          {
            "url": "https://maharera.mahaonline.gov.in/ProjectSummary/P52100012345",
            "title": "MahaRERA Official Registration Record",
            "snippet": "Registration Status: Active Registered. Expiry: 31-Mar-2027. Escrow Account Verified.",
            "screenshot_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:30:12Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "claim_match",
        "status": "passed",
        "score_contribution": 20,
        "max_score": 20,
        "findings": [
          "Promised completion date (March 2027) matches RERA declared date within 0 days delta.",
          "Total 240 units declared in brochure matches 240 units approved in RERA project schedule.",
          "All 5 advertised core amenities are filed in the statutory Form B disclosure."
        ],
        "evidence": [
          {
            "url": "https://housing.com/in/buy/projects/page/102938-sunshine-residency-baner",
            "title": "Brochure Spec Cross-Reference",
            "snippet": "Marketing Brochure Unit Count: 240 | RERA Filing Schedule A: 240. Delta: 0.",
            "screenshot_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:30:15Z",
            "verified": true
          }
        ],
        "credits_used": 1
      },
      {
        "check_type": "court_signals",
        "status": "passed",
        "score_contribution": 20,
        "max_score": 20,
        "findings": [
          "eCourts India search returned 0 active criminal, recovery, or injunction cases for project or builder SPV.",
          "NCLT / IBBI insolvency database check: Clean (0 petitions filed or admitted).",
          "Consumer forum query across Pune district commission indicates zero outstanding non-compliance notices."
        ],
        "evidence": [
          {
            "url": "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/P52100012345",
            "title": "National Judicial Data Grid (NJDG) eCourts Record",
            "snippet": "Search Query: 'Godrej Sunshine Residency'. Results: 0 active cases, 0 stay orders.",
            "screenshot_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:30:20Z",
            "verified": true
          }
        ],
        "credits_used": 3
      },
      {
        "check_type": "promoter_record",
        "status": "passed",
        "score_contribution": 10,
        "max_score": 10,
        "findings": [
          "Promoter holds AAA credit rating on statutory disclosures.",
          "Track record confirms over 18 successfully completed and handed-over residential projects in Pune and MMR.",
          "Zero director disqualifications found under MCA21 records."
        ],
        "evidence": [
          {
            "url": "https://www.mca.gov.in/content/mca/global/en/home.html",
            "title": "MCA21 Director & Company Master Data",
            "snippet": "Active Company status. Paid up capital: Rs. 150 Cr. Director status: Compliant.",
            "screenshot_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:30:22Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "approvals",
        "status": "passed",
        "score_contribution": 6,
        "max_score": 10,
        "findings": [
          "Pune Municipal Corporation (PMC) sanctioned layout and Commencement Certificate (CC) up to 22 floors.",
          "State Level Environmental Impact Assessment Authority (SEIAA) Clearance granted.",
          "Provisional Fire NOC verified; final occupancy audit pending building envelope completion."
        ],
        "evidence": [
          {
            "url": "https://pmc.gov.in/en/town-planning/building-permission/sanction-reports",
            "title": "PMC Building Permission Portal",
            "snippet": "Sanction No: PMC/BP/2024/7891. CC issued for Plinth + 22 Floors.",
            "screenshot_url": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:30:25Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "reputation",
        "status": "passed",
        "score_contribution": 6,
        "max_score": 10,
        "findings": [
          "News archive analysis: Clean sentiment with positive construction progress reporting.",
          "Consumer feedback portals indicate responsive sales coordination.",
          "Minor buyer feedback regarding traffic congestion on Baner approach road."
        ],
        "evidence": [
          {
            "url": "https://news.google.com/search?q=Sunshine+Residency+Baner+Godrej",
            "title": "Public Media & Consumer Sentiment Index",
            "snippet": "Sentiment: 92% Positive/Neutral. No fraud alerts, zero construction halt reports.",
            "screenshot_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:30:28Z",
            "verified": true
          }
        ],
        "credits_used": 1
      }
    ],
    "pdf_url": "/api/v1/report/rpt_sunshine_clean/pdf",
    "credits_consumed": 11,
    "created_at": "2026-10-24T07:00:00Z",
    "completed_at": "2026-10-24T07:00:00Z"
  },
  "rpt_green_valley_delayed": {
    "report_id": "rpt_green_valley_delayed",
    "property_id": "prop_demo_delayed_02",
    "status": "completed",
    "property_details": {
      "project_name": "Green Valley Towers Phase 2",
      "promoter_name": "Apex Skyline Developers Pvt Ltd",
      "rera_id": "P52100088765",
      "state": "Maharashtra",
      "city": "Pune",
      "address": "Sector 14, Hinjewadi Phase 3, Pune 411057",
      "listing_url": "https://99acres.com/green-valley-towers-hinjewadi-pune"
    },
    "claims": {
      "project_name": "Green Valley Towers Phase 2",
      "promoter_name": "Apex Skyline Developers Pvt Ltd",
      "rera_id": "P52100088765",
      "state": "Maharashtra",
      "city": "Pune",
      "claimed_completion_date": "2025-06-30",
      "total_units": 320,
      "approved_floors": 18,
      "claimed_amenities": [
        "Clubhouse",
        "Gymnasium",
        "Children Play Area"
      ],
      "confidence": 0.92
    },
    "trust_score": 68,
    "trust_label": "Moderate Risk",
    "breakdown": {
      "total_score": 68,
      "label": "Moderate Risk",
      "dimension_scores": {
        "rera_status": 30,
        "claim_match": 10,
        "court_signals": 12,
        "promoter_record": 5,
        "approvals": 6,
        "reputation": 5
      },
      "max_dimension_scores": {
        "rera_status": 30,
        "claim_match": 20,
        "court_signals": 20,
        "promoter_record": 10,
        "approvals": 10,
        "reputation": 10
      },
      "deductions": [
        {
          "rule": "CLAIM_POSSESSION_DELAY",
          "dimension": "claim_match",
          "points_deducted": 10,
          "reason": "Advertised possession date differs significantly from official RERA declaration."
        },
        {
          "rule": "ACTIVE_LITIGATION",
          "dimension": "court_signals",
          "points_deducted": 8,
          "reason": "Active consumer court compensation cases or civil dispute filings found."
        },
        {
          "rule": "PROMOTER_TRACK_RECORD",
          "dimension": "promoter_record",
          "points_deducted": 5,
          "reason": "Promoter has history of delayed delivery in previous registered developments."
        },
        {
          "rule": "APPROVAL_CLEARANCE_PENDING",
          "dimension": "approvals",
          "points_deducted": 4,
          "reason": "Fire NOC renewal or final occupancy clearance audit is pending completion."
        },
        {
          "rule": "REPUTATION_BUYER_COMPLAINTS",
          "dimension": "reputation",
          "points_deducted": 5,
          "reason": "Elevated consumer complaint sentiment identified regarding amenities or delivery schedules."
        }
      ],
      "strengths": [
        "Project holds active, valid RERA registration with clean regulatory disclosures."
      ],
      "recommendations": [
        "Request written developer timeline confirmation for delayed milestones before paying advance tokens.",
        "Verify delay compensation clauses under Section 18 of the RERA Act in the sale agreement."
      ]
    },
    "summary": {
      "verdict": "Green Valley Towers Phase 2 (RERA: P52100088765) scored 68/100 (Moderate Risk). While the development maintains valid RERA credentials, our audit flagged moderate timeline delays and active consumer court compensation inquiries that prospective buyers should scrutinize.",
      "trust_score": 68,
      "trust_label": "Moderate Risk",
      "highlights": [
        "\u2713 Project holds active, valid RERA registration with clean regulatory disclosures.",
        "\u26a0 Advertised possession date differs significantly from official RERA declaration. (-10 pts)",
        "\u26a0 Active consumer court compensation cases or civil dispute filings found. (-8 pts)",
        "\u26a0 Promoter has history of delayed delivery in previous registered developments. (-5 pts)",
        "\u26a0 Fire NOC renewal or final occupancy clearance audit is pending completion. (-4 pts)",
        "\u26a0 Elevated consumer complaint sentiment identified regarding amenities or delivery schedules. (-5 pts)"
      ],
      "action_items": [
        "Request written developer timeline confirmation for delayed milestones before paying advance tokens.",
        "Verify delay compensation clauses under Section 18 of the RERA Act in the sale agreement."
      ],
      "disclaimer": "Ghar Search is an automated public-records matching system. Findings are based on publicly indexed government portals, court ledgers, and marketing collateral as of the capture timestamp. This report does not constitute formal legal title certification or financial advice."
    },
    "checks": [
      {
        "check_type": "rera_status",
        "status": "passed",
        "score_contribution": 30,
        "max_score": 30,
        "findings": [
          "Project is registered with MahaRERA under ID P52100088765.",
          "Registration status is Active with extension granted under Form 4 till December 2026.",
          "Quarterly financial filings show 68% construction completion vs 85% fund drawal."
        ],
        "evidence": [
          {
            "url": "https://maharera.mahaonline.gov.in/ProjectSummary/P52100088765",
            "title": "MahaRERA Project Filing Detail",
            "snippet": "Status: Registered (Extension Applied). Revised Date: 31-Dec-2026.",
            "screenshot_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:35:10Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "claim_match",
        "status": "flagged",
        "score_contribution": 10,
        "max_score": 20,
        "findings": [
          "Possession delay detected: Marketing brochure advertises June 2025 possession, but RERA extension declaration states December 2026 (18 months delta!).",
          "Total unit count matches 320 units.",
          "Amenities: Swimming pool promised in brochure is absent from statutory approved site plan."
        ],
        "evidence": [
          {
            "url": "https://99acres.com/green-valley-towers-hinjewadi-pune",
            "title": "Brochure Timeline Discrepancy",
            "snippet": "Ad claim: 'Possession Ready by Mid 2025' vs MahaRERA Form 4: 'Target Date: Dec 2026'.",
            "screenshot_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:35:14Z",
            "verified": true
          }
        ],
        "credits_used": 1
      },
      {
        "check_type": "court_signals",
        "status": "flagged",
        "score_contribution": 12,
        "max_score": 20,
        "findings": [
          "2 active Consumer Court complaints identified for delay compensation under Section 18 RERA.",
          "No judicial stay order or stop-work notices on physical construction site.",
          "Insolvency check: Clean (No NCLT proceedings)."
        ],
        "evidence": [
          {
            "url": "https://services.ecourts.gov.in/ecourtindia_v6/?p=consumer/P52100088765",
            "title": "District Consumer Disputes Redressal Commission Pune",
            "snippet": "Case No. CC/2025/114: Pending adjudication regarding delayed milestone interest.",
            "screenshot_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:35:18Z",
            "verified": true
          }
        ],
        "credits_used": 3
      },
      {
        "check_type": "promoter_record",
        "status": "flagged",
        "score_contribution": 5,
        "max_score": 10,
        "findings": [
          "Promoter delivered 2 prior residential projects in Pune with average hand-over delay of 11 months.",
          "MCA21 company status is active without director disqualifications.",
          "Working capital credit lines show moderate stress."
        ],
        "evidence": [
          {
            "url": "https://www.mca.gov.in/content/mca/global/en/home.html",
            "title": "MCA21 Corporate Charge Status",
            "snippet": "Apex Skyline Developers: Outstanding charge with HDFC Bank. Past deliveries delayed.",
            "screenshot_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:35:20Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "approvals",
        "status": "needs_review",
        "score_contribution": 6,
        "max_score": 10,
        "findings": [
          "PMRDA layout approval verified for 18 floors.",
          "Fire NOC pending renewal: Initial conditional NOC expired in January 2026; renewal audit under submission.",
          "Tree authority clearance and municipal water connection in progress."
        ],
        "evidence": [
          {
            "url": "https://pmrda.gov.in/building-sanctions/green-valley-phase2",
            "title": "PMRDA Sanction Registry",
            "snippet": "Sanction valid. Conditional Fire NOC renewal pending site inspection.",
            "screenshot_url": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:35:22Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "reputation",
        "status": "flagged",
        "score_contribution": 5,
        "max_score": 10,
        "findings": [
          "Buyer association online forum active with discussions concerning delayed clubhouse delivery.",
          "Promoter representatives actively responding to buyer grievance threads.",
          "Moderate negative sentiment recorded on Google Maps listing (3.1/5 stars across 45 reviews)."
        ],
        "evidence": [
          {
            "url": "https://consumercomplaints.in/apex-skyline-green-valley-delay",
            "title": "Consumer Forum Grievance Aggregator",
            "snippet": "Total grievances: 12. Resolution rate: 75%. Common topic: possession postponement.",
            "screenshot_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:35:25Z",
            "verified": true
          }
        ],
        "credits_used": 1
      }
    ],
    "pdf_url": "/api/v1/report/rpt_green_valley_delayed/pdf",
    "credits_consumed": 11,
    "created_at": "2026-10-24T07:00:00Z",
    "completed_at": "2026-10-24T07:00:00Z"
  },
  "rpt_royal_empire_flagged": {
    "report_id": "rpt_royal_empire_flagged",
    "property_id": "prop_demo_flagged_03",
    "status": "completed",
    "property_details": {
      "project_name": "Royal Empire Luxury Towers",
      "promoter_name": "Royal Imperial Realcon Ltd",
      "rera_id": "P51700099881",
      "state": "Maharashtra",
      "city": "Thane",
      "address": "Ghodbunder Road, Near Ovala Junction, Thane West 400615",
      "listing_url": "https://magicbricks.com/royal-empire-ghodbunder-road-thane"
    },
    "claims": {
      "project_name": "Royal Empire Luxury Towers",
      "promoter_name": "Royal Imperial Realcon Ltd",
      "rera_id": "P51700099881",
      "state": "Maharashtra",
      "city": "Thane",
      "claimed_completion_date": "2024-12-31",
      "total_units": 480,
      "approved_floors": 32,
      "claimed_amenities": [
        "Helipad",
        "Private Marina",
        "Olympic Pool",
        "Sky Lounge"
      ],
      "confidence": 0.88
    },
    "trust_score": 18,
    "trust_label": "Critical Alert",
    "breakdown": {
      "total_score": 18,
      "label": "Critical Alert",
      "dimension_scores": {
        "rera_status": 10,
        "claim_match": 2,
        "court_signals": 0,
        "promoter_record": 0,
        "approvals": 4,
        "reputation": 2
      },
      "max_dimension_scores": {
        "rera_status": 30,
        "claim_match": 20,
        "court_signals": 20,
        "promoter_record": 10,
        "approvals": 10,
        "reputation": 10
      },
      "deductions": [
        {
          "rule": "RERA_REVOCATION_PROCEEDINGS",
          "dimension": "rera_status",
          "points_deducted": 20,
          "reason": "RERA validity expired and Section 7 revocation proceedings initiated by statutory authority."
        },
        {
          "rule": "CLAIM_POSSESSION_DELAY",
          "dimension": "claim_match",
          "points_deducted": 10,
          "reason": "Advertised possession date differs significantly from official RERA declaration."
        },
        {
          "rule": "CLAIM_SANCTION_MISMATCH",
          "dimension": "claim_match",
          "points_deducted": 8,
          "reason": "Marketing brochure claims more units or floors than officially sanctioned."
        },
        {
          "rule": "FATAL_LITIGATION",
          "dimension": "court_signals",
          "points_deducted": 20,
          "reason": "Active NCLT insolvency proceedings or judicial stop-work injunction detected."
        },
        {
          "rule": "PROMOTER_DEFAULT",
          "dimension": "promoter_record",
          "points_deducted": 10,
          "reason": "Promoter entity or directors have recorded past regulatory defaults, blacklists, or disqualifications."
        },
        {
          "rule": "APPROVAL_SANCTION_DEFECT",
          "dimension": "approvals",
          "points_deducted": 6,
          "reason": "Municipal demolition notice served or safety sanctions rejected."
        },
        {
          "rule": "REPUTATION_HIGH_GRIEVANCE",
          "dimension": "reputation",
          "points_deducted": 8,
          "reason": "Widespread buyer protests, police intervention, or severe grievance reporting surfaced."
        }
      ],
      "strengths": [],
      "recommendations": [
        "CRITICAL: Fatal non-compliance or active insolvency proceedings detected. Do not disburse funds.",
        "Consult legal counsel immediately regarding judicial status and builder registry credentials."
      ]
    },
    "summary": {
      "verdict": "CRITICAL DUE-DILIGENCE WARNING: Royal Empire Luxury Towers scored 18/100 (Critical Alert). Automated verification identified critical red flags including potential RERA expiry/revocation, active NCLT insolvency filings, or unauthorized structural construction. Immediate legal consultation is strongly advised.",
      "trust_score": 18,
      "trust_label": "Critical Alert",
      "highlights": [
        "\u26a0 RERA validity expired and Section 7 revocation proceedings initiated by statutory authority. (-20 pts)",
        "\u26a0 Advertised possession date differs significantly from official RERA declaration. (-10 pts)",
        "\u26a0 Marketing brochure claims more units or floors than officially sanctioned. (-8 pts)",
        "\u26a0 Active NCLT insolvency proceedings or judicial stop-work injunction detected. (-20 pts)",
        "\u26a0 Promoter entity or directors have recorded past regulatory defaults, blacklists, or disqualifications. (-10 pts)",
        "\u26a0 Municipal demolition notice served or safety sanctions rejected. (-6 pts)",
        "\u26a0 Widespread buyer protests, police intervention, or severe grievance reporting surfaced. (-8 pts)"
      ],
      "action_items": [
        "CRITICAL: Fatal non-compliance or active insolvency proceedings detected. Do not disburse funds.",
        "Consult legal counsel immediately regarding judicial status and builder registry credentials."
      ],
      "disclaimer": "Ghar Search is an automated public-records matching system. Findings are based on publicly indexed government portals, court ledgers, and marketing collateral as of the capture timestamp. This report does not constitute formal legal title certification or financial advice."
    },
    "checks": [
      {
        "check_type": "rera_status",
        "status": "flagged",
        "score_contribution": 10,
        "max_score": 30,
        "findings": [
          "MahaRERA registration expired on 31-Dec-2024 without extension approval.",
          "Regulatory authority has issued formal show-cause notice under Section 7 for project deregistration.",
          "Promoter failed to deposit mandatory quarterly financial audit statements for 6 consecutive quarters."
        ],
        "evidence": [
          {
            "url": "https://maharera.mahaonline.gov.in/ShowCauseNotices/P51700099881",
            "title": "MahaRERA Show-Cause & Non-Compliance Ledger",
            "snippet": "Registration EXPIRED. Section 7 Revocation Proceedings Initiated by Authority.",
            "screenshot_url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:40:05Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "claim_match",
        "status": "failed",
        "score_contribution": 2,
        "max_score": 20,
        "findings": [
          "Severe discrepancy: Brochure claims 32 floors approved, but TMC sanction only permits 24 floors. Upper 8 floors are completely unauthorized!",
          "Possession delay: Advertised for 2024; site work completely suspended since September 2024.",
          "Helipad and private marina claims lack any civil aviation or port authority sanction."
        ],
        "evidence": [
          {
            "url": "https://magicbricks.com/royal-empire-ghodbunder-road-thane",
            "title": "Brochure vs Sanction Plan Comparison",
            "snippet": "Sanction: 24 floors (TMC/BP/2021/33). Marketing: 32 floors. Unauthorized construction: 8 floors.",
            "screenshot_url": "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:40:08Z",
            "verified": true
          }
        ],
        "credits_used": 1
      },
      {
        "check_type": "court_signals",
        "status": "failed",
        "score_contribution": 0,
        "max_score": 20,
        "findings": [
          "CRITICAL: NCLT Mumbai Bench has admitted Corporate Insolvency Resolution Process (CIRP) petition by financial creditor (CP (IB) No. 421/MB/2025).",
          "Interim Resolution Professional (IRP) has been appointed to take over management assets.",
          "Bombay High Court has issued stop-work and status-quo injunction in writ petition filed by Thane Municipal Corporation."
        ],
        "evidence": [
          {
            "url": "https://nclt.gov.in/orders/mumbai-bench/cp-ib-421-2025",
            "title": "NCLT Court Order Database",
            "snippet": "Order dated 14-Aug-2025: Section 7 IBC Petition Admitted. Moratorium Declared under Section 14.",
            "screenshot_url": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:40:12Z",
            "verified": true
          }
        ],
        "credits_used": 3
      },
      {
        "check_type": "promoter_record",
        "status": "failed",
        "score_contribution": 0,
        "max_score": 10,
        "findings": [
          "Managing Director has active non-bailable warrants issued in connection with investor fraud case.",
          "MCA21 records identify 2 sister entities already placed into liquidation.",
          "Promoter blacklisted from bidding on state infrastructure projects."
        ],
        "evidence": [
          {
            "url": "https://www.mca.gov.in/content/mca/global/en/home.html",
            "title": "MCA21 Director Disqualification Notice",
            "snippet": "DIN 02918271: Disqualified under Section 164(2) of Companies Act 2013.",
            "screenshot_url": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:40:15Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "approvals",
        "status": "failed",
        "score_contribution": 4,
        "max_score": 10,
        "findings": [
          "Missing Commencement Certificate (CC) for towers C and D.",
          "Thane Municipal Corporation has served demolition notice for unauthorized upper structural columns.",
          "Fire department has rejected safety plan due to lack of standard 6-meter peripheral fire engine pathway."
        ],
        "evidence": [
          {
            "url": "https://thanecity.gov.in/demolition-notices/ghodbunder-royal-empire",
            "title": "TMC Town Planning Demolition Notice",
            "snippet": "Notice under Section 53 MRTP Act: Demolish unauthorized upper slab within 30 days.",
            "screenshot_url": "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:40:18Z",
            "verified": true
          }
        ],
        "credits_used": 2
      },
      {
        "check_type": "reputation",
        "status": "failed",
        "score_contribution": 2,
        "max_score": 10,
        "findings": [
          "Front-page newspaper investigations reporting over 200 cheated homebuyers forming action committee.",
          "Physical site gate locked by local police following protest rally.",
          "Consumer forum grievance volume exceeds 85 unresolved complaints."
        ],
        "evidence": [
          {
            "url": "https://news.google.com/search?q=Royal+Empire+Ghodbunder+Thane+cheating+protest",
            "title": "Investigative Media Investigation Dossier",
            "snippet": "Headline: 'Homebuyers stage protest outside Thane builder office over stalled Royal Empire project.'",
            "screenshot_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
            "timestamp": "2026-10-24T06:40:22Z",
            "verified": true
          }
        ],
        "credits_used": 1
      }
    ],
    "pdf_url": "/api/v1/report/rpt_royal_empire_flagged/pdf",
    "credits_consumed": 11,
    "created_at": "2026-10-24T07:00:00Z",
    "completed_at": "2026-10-24T07:00:00Z"
  }
};

LOCAL_DEMO_REPORTS['clean'] = LOCAL_DEMO_REPORTS['rpt_sunshine_clean'];
LOCAL_DEMO_REPORTS['delayed'] = LOCAL_DEMO_REPORTS['rpt_green_valley_delayed'];
LOCAL_DEMO_REPORTS['flagged'] = LOCAL_DEMO_REPORTS['rpt_royal_empire_flagged'];

export async function getReport(reportId: string): Promise<VerificationReport> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${WORKER_URL}/api/v1/report/${reportId}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn(`Could not fetch report ${reportId} from worker, using local fallback:`, e);
  }

  const fallback = LOCAL_DEMO_REPORTS[reportId];
  if (fallback) {
    return fallback;
  }

  throw new Error(`Report ${reportId} not found or in error status`);
}

export async function addToWatchlist(reportId: string): Promise<any> {
  const res = await fetch(`${WORKER_URL}/api/v1/watchlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report_id: reportId }),
  });
  return res.json();
}

export async function getWatchlist(): Promise<{ items: WatchlistItem[]; total: number }> {
  try {
    const res = await fetch(`${WORKER_URL}/api/v1/watchlist`, { cache: 'no-store' });
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    console.warn('Could not fetch watchlist from worker:', e);
  }

  return {
    items: [
      {
        watchlist_id: 'wl_sunshine_baner',
        report_id: 'rpt_sunshine_clean',
        property_name: 'Sunshine Residency Phase 1',
        promoter_name: 'Godrej Properties Limited',
        rera_id: 'P52100012345',
        city: 'Pune',
        current_trust_score: 92,
        score_delta_7d: 0,
        status: 'active',
        last_checked_at: '2026-10-24T06:00:00Z',
        alert_threshold: 10,
      },
      {
        watchlist_id: 'wl_green_valley',
        report_id: 'rpt_green_valley_delayed',
        property_name: 'Green Valley Towers Phase 2',
        promoter_name: 'Apex Skyline Developers Pvt Ltd',
        rera_id: 'P52100088765',
        city: 'Pune',
        current_trust_score: 68,
        score_delta_7d: -4,
        status: 'active',
        last_checked_at: '2026-10-24T06:00:00Z',
        alert_threshold: 10,
      },
    ],
    total: 2,
  };
}

export async function resolveHITL(reportId: string, checkType: string, resolutionData: any): Promise<any> {
  const res = await fetch(`${WORKER_URL}/api/v1/hil/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      report_id: reportId,
      check_type: checkType,
      resolution_data: resolutionData,
    }),
  });
  return res.json();
}
